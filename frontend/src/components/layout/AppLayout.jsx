import Navbar from "./Navbar";
import CreatePostModal from "../posts/CreatePostModal";
import NotificationModal from "../notifications/NotificationModal";
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import api from '../../api/axios';
import { io } from "socket.io-client";
import { Capacitor } from '@capacitor/core'; // 1. Importera Capacitor härifrån!

function AppLayout({ currentUser, setCurrentUser }) {

    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    // Funktion för att öppna skapa-inlägg
    const handleOpenCreatePost = () => {
        if (!currentUser) {
            navigate("/login");
        } else {
            setShowCreatePost(true);
        }
    };

    // Funktion för att öppna notiser
    const handleOpenNotifications = () => {
        if (!currentUser) {
            navigate("/login");
        } else {
            setShowNotifications(true);
        }
    };

    // Hämta initiala notiser och sätt upp Socket.io-lyssnare
    useEffect(() => {
        if (!currentUser) return;

        // 1. Hämta befintliga notiser från databasen
        api.get("/notifications")
            .then(res => {
                setNotifications(res.data);
                const unread = res.data.filter(n => !n.read).length;
                setUnreadCount(unread);
            })
            .catch(err => console.log("Kunde inte hämta notiser", err));

        // 2. Anslut till Socket.io-servern
        // Hämta bas-url från VITE_API_URL och ta bort "/api" på slutet
        const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const cleanBaseUrl = rawApiUrl.replace(/\/api\/?$/, "");

        // Säkerställ att det alltid finns en giltig url med http:// om variabeln är tom eller konstig
        const baseServerUrl = cleanBaseUrl && cleanBaseUrl.startsWith("http")
            ? cleanBaseUrl
            : "http://localhost:5000";

        const socketUrl = (Capacitor.isNativePlatform() && baseServerUrl.includes("localhost"))
            ? "http://10.0.2.2:5000"
            : baseServerUrl;

        const socket = io(socketUrl);

        // Gå med i användarens eget rum baserat på ID
        if (currentUser.id || currentUser._id) {
            const userId = currentUser.id || currentUser._id;
            socket.emit("join", userId);
        }

        // Lyssna på nya realtidsnotiser från servern!
        socket.on("newNotification", (newNotif) => {
            setNotifications(prev => [newNotif, ...prev]); // Lägg till överst i listan direkt
            setUnreadCount(prev => prev + 1);             // Öka den omlästa räknaren
        });

        // Städa upp socket-anslutningen när komponenten unmountas
        return () => {
            socket.disconnect();
        };
    }, [currentUser]);

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                unreadCount={unreadCount}
                onOpenCreatePost={handleOpenCreatePost}
                onOpenNotifications={handleOpenNotifications}
            />

            {showCreatePost && (
                <CreatePostModal
                    currentUser={currentUser}
                    onClose={() => setShowCreatePost(false)}
                />
            )}

            {showNotifications && (
                <NotificationModal
                    currentUser={currentUser}
                    notifications={notifications}
                    setNotifications={setNotifications}
                    unreadCount={unreadCount}
                    setUnreadCount={setUnreadCount}
                    onClose={() => setShowNotifications(false)}
                />
            )}

            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}

export default AppLayout;