import { io } from "socket.io-client";
import { Capacitor } from "@capacitor/core";

let socketInstance = null;
let currentSocketUserId = null;

export function getApiBaseUrl() {
    const isNative = Capacitor.isNativePlatform();
    const isDev = import.meta.env.DEV;

    if (isNative) {
        return import.meta.env.VITE_NATIVE_API_URL || "http://10.0.2.2:5000/api";
    }

    if (isDev) {
        return "http://localhost:5000/api";
    }

    return import.meta.env.VITE_API_URL || "https://api.liftlyfit.com/api";
}

export function getServerBaseUrl() {
    const cleaned = String(getApiBaseUrl() || "")
        .trim()
        .replace(/\/api\/?$/, "");

    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
        return cleaned;
    }

    return import.meta.env.DEV ? "http://localhost:5000" : "https://api.liftlyfit.com";
}

export function getSocket() {
    if (!socketInstance) {
        const socketUrl = getServerBaseUrl();
        console.log("[Socket] Connecting to:", socketUrl);

        socketInstance = io(socketUrl, {
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        socketInstance.on("connect", () => {
            console.log("[Socket] Connected:", socketInstance.id);
            if (currentSocketUserId) {
                socketInstance.emit("join", currentSocketUserId);
            }
        });

        socketInstance.on("connect_error", (err) => {
            console.log("[Socket] Connection error:", err.message);
        });
    }

    return socketInstance;
}

export function createAppSocket(userId) {
    currentSocketUserId = userId ? String(userId) : null;
    const socket = getSocket();

    if (socket.connected && currentSocketUserId) {
        socket.emit("join", currentSocketUserId);
    }

    return socket;
}

export function disconnectAppSocket() {
    currentSocketUserId = null;
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
}