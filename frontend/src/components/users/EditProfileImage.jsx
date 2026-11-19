import React from "react";
import { useState } from "react";
import api from "../../api/axios";
import { SlPicture } from "react-icons/sl";
import { IoClose } from "react-icons/io5";
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';

function EditProfileImage({ onClose, currentUser, setCurrentUser, getUserInfo }) {

    const [profileImage, setProfileImage] = useState(currentUser?.profileImage || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Funktion för att hantera bildval (stöder både webb och Capacitor native kamera/galleri)
    const handleImageSelection = async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                const image = await Camera.getPhoto({
                    quality: 90,
                    allowEditing: false,
                    resultType: 'uri', // Använd sträng i stället för CameraResultType.Uri
                    source: 'PROMPT'     // Använd sträng i stället för CameraSource.Prompt
                });

                if (image.webPath) {
                    const response = await fetch(image.webPath);
                    const blob = await response.blob();
                    const file = new File([blob], "profile-camera.jpg", { type: blob.type });
                    setProfileImage(file);
                    setError("");
                }
            } catch (err) {
                console.log("User cancelled or error occurred:", err);
            }
        }
    };

    // function to edit profile image
    const editProfileImage = async (e) => {
        e.preventDefault();

        if (!profileImage) {
            setError("Please select an image first.");
            return;
        }
        setIsSubmitting(true);

        try {
            const response = await api.post(`/users/profile-image`, { profileImage }, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.status === 200) {
                const updatedProfileImage = response.data.cloudinaryImagePath;
                const updatedUser = { ...currentUser, profileImage: updatedProfileImage, updatedAt: new Date().toISOString() };

                setCurrentUser(updatedUser);
                localStorage.setItem("currentUser", JSON.stringify(updatedUser));
                onClose();

                if (getUserInfo) getUserInfo();
            }
        } catch (err) {
            const errorResponse = err.response?.data;
            setError(errorResponse?.message || "Your post could not be updated. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 font-sans overflow-y-auto">
                <div className="w-full min-h-screen sm:min-h-0 sm:max-w-md bg-white rounded-none sm:rounded-lg p-5 pt-6 sm:p-5 shadow-none sm:shadow-xl border-0 sm:border border-gray-100 animate-in fade-in zoom-in-95 duration-150">

                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-900 text-left">Edit Profile Image</h3>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="text-gray-400 hover:text-black p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                            title="Close"
                        >
                            <IoClose size={20} />
                        </button>
                    </div>

                    <form onSubmit={editProfileImage} className="space-y-6">

                        <div className="flex justify-center py-4">
                            <div className="relative w-28 h-28">
                                {profileImage ? (
                                    <img
                                        src={
                                            profileImage instanceof File
                                                ? URL.createObjectURL(profileImage)
                                                : profileImage
                                        }
                                        alt="Preview"
                                        className="w-full h-full rounded-full object-cover border border-gray-200 shadow-sm"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gray-100 border border-gray-200 flex flex-col items-center justify-center text-gray-400 text-xs font-medium">
                                        No image
                                    </div>
                                )}

                                <label
                                    htmlFor={Capacitor.isNativePlatform() ? undefined : "media"}
                                    onClick={(e) => {
                                        if (Capacitor.isNativePlatform()) {
                                            e.preventDefault();
                                            handleImageSelection();
                                        }
                                    }}
                                    className="absolute bottom-0 right-0 p-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-full shadow-md transition-colors flex items-center justify-center cursor-pointer text-gray-600 hover:text-black"
                                    title={profileImage ? "Change Photo" : "Choose Photo"}
                                >
                                    <SlPicture size={16} />
                                </label>

                                <input
                                    className="hidden"
                                    type="file"
                                    name="media"
                                    id="media"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files[0]) {
                                            setProfileImage(e.target.files[0]);
                                            setError("");
                                        }
                                    }}
                                />
                            </div>

                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-[11px] p-2 rounded-lg font-medium border border-red-100 text-left">
                                {error}
                            </div>
                        )}

                        <div className="pt-3 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-2.5 px-4 bg-black hover:bg-zinc-800 text-white font-semibold rounded-xl transition-all text-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? "Uploading..." : "Update Profile Image"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default EditProfileImage;