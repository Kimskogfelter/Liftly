import React from "react";
import { useState } from "react";
import api from "../../api/axios";
import { SlPicture } from "react-icons/sl";
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans">
                <div className="w-full max-w-md bg-white rounded-lg p-5 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">

                    <h3 className="text-sm font-bold text-gray-900 mb-3 text-left">Edit Profile Image</h3>

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

                        <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-1.5 px-3 rounded-md transition-colors cursor-pointer text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#3A3939] hover:bg-zinc-800 text-white font-semibold py-1.5 px-3 rounded-md transition-colors cursor-pointer text-xs shadow-sm disabled:opacity-50 flex items-center gap-2"
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