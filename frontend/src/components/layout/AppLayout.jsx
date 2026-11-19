import Navbar from "./Navbar";
import CreatePostModal from "../posts/CreatePostModal";
import NotificationModal from "../notifications/NotificationModal";
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { createAppSocket } from "../../api/socket";

function AppLayout({ currentUser, setCurrentUser }) {
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    const handleOpenCreatePost = () => {
        if (!currentUser) {
            navigate("/login");
        } else {
            setShowCreatePost(true);
        }
    };

    const handleOpenNotifications = () => {
        if (!currentUser) {
            navigate("/login");
        } else {
            setShowNotifications(true);
        }
    };

    useEffect(() => {
        if (!currentUser) return;

        api.get("/notifications")
            .then((res) => {
                setNotifications(res.data);
                const unread = res.data.filter((n) => !n.read).length;
                setUnreadCount(unread);
            })
            .catch((err) => {
                console.log("Kunde inte hämta notiser", err.message, err.config?.baseURL);
            });

        const userId = currentUser.id || currentUser._id;
        const socket = createAppSocket(userId);

        socket.on("newNotification", (newNotif) => {
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

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