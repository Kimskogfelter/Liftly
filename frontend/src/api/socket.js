import { io } from "socket.io-client";
import { Capacitor } from "@capacitor/core";

export function getApiBaseUrl() {
    const isNative = Capacitor.isNativePlatform();
    const isDev = import.meta.env.DEV;
    const envUrl = import.meta.env.VITE_API_URL;
    const chosen = isNative
        ? (envUrl || "http://10.0.2.2:5000/api")
        : (isDev ? "http://localhost:5000/api" : (envUrl || "https://api.liftlyfit.com/api"));

    return chosen;
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

export function createAppSocket(userId) {
    const socketUrl = getServerBaseUrl();
    console.log("[Socket] Connecting to:", socketUrl);

    const socket = io(socketUrl, {
        withCredentials: true,
        transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
        console.log("[Socket] Connected:", socket.id);
        if (userId) {
            socket.emit("join", userId);
        }
    });

    socket.on("connect_error", (err) => {
        console.log("[Socket] Connection error:", err.message);
    });

    return socket;
}