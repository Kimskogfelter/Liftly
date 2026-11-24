import axios from 'axios';
import { getApiBaseUrl } from './socket';

const API_BASE_URL = getApiBaseUrl();

// Gemensam Axios-instans med cookies aktiverade för refreshToken-hantering
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

// Tillstånd för att köa parallella anrop medan en token-refresh pågår
let isRefreshing = false;
let failedQueue = [];

// Sökvägar som får visas utan inloggad session
const PUBLIC_PATHS = [
    '/',
    '/home',
    '/login',
    '/register',
    '/forgot-password',
    '/privacy'
];

// Avgör om nuvarande sökväg är en publik vy (inkl. öppna profiler och enskilda inlägg)
const isPublicPath = (pathname = '') => {
    if (PUBLIC_PATHS.includes(pathname)) return true;
    if (pathname.startsWith('/verify-email/')) return true;
    if (pathname.startsWith('/reset-password/')) return true;
    if (pathname.startsWith('/users/')) return true;
    if (pathname.startsWith('/posts/')) return true;
    return false;
};

// Löser upp eller avvisar alla köade anrop när ett refresh-försök är klart
const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// 1. REQUEST INTERCEPTOR: Bifogar kortlivad Access Token om användaren är inloggad
api.interceptors.request.use(
    (config) => {
        const stored = localStorage.getItem('currentUser');
        const user = stored ? JSON.parse(stored) : null;
        const token = user?.token;

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. RESPONSE INTERCEPTOR: Förnyar token vid 401 och hanterar utloggning om refresh misslyckas
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        // Inloggningsanrop ska returnera sitt fel utan att trigga refresh
        if (originalRequest.url && originalRequest.url.includes('/users/login')) {
            return Promise.reject(error);
        }

        // Försök förnya access token vid 401 om anropet inte redan har gjorts om
        if (error.response?.status === 401 && !originalRequest._retry) {
            const stored = localStorage.getItem('currentUser');
            const user = stored ? JSON.parse(stored) : null;

            // Utloggade gäster saknar token och ska inte försöka refresha
            if (!user?.token) {
                return Promise.reject(error);
            }

            // Lägg anropet i kö om en token-refresh redan pågår
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((newToken) => {
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Skickar refresh-cookie automatiskt tack vare withCredentials: true
                const response = await axios.post(
                    `${API_BASE_URL}/users/refresh`,
                    {},
                    { withCredentials: true }
                );

                const { token: newAccessToken } = response.data;

                // Uppdatera enbart access token i localStorage
                const latestUser = JSON.parse(localStorage.getItem('currentUser')) || {};
                const updatedUser = { ...latestUser, token: newAccessToken };
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));

                window.dispatchEvent(new Event('userTokenRefreshed'));

                // Kör om alla väntande anrop med den nya access tokenen
                processQueue(null, newAccessToken);

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Rensa lokal session när refresh misslyckas och låt appen gå till gästläge
                processQueue(refreshError, null);

                localStorage.removeItem('currentUser');
                window.dispatchEvent(new Event('userLoggedOut'));

                const currentPath = window.location.pathname;
                if (!isPublicPath(currentPath)) {
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            } finally {
                // Säkerställ att kön alltid låses upp även vid oväntade fel
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;