import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const DEFAULT_CROP = { x: 50, y: 20, zoom: 1 };

const PostMedia = ({
    hasMedia,
    isVideo,
    currentMediaUrl,
    currentMediaIndex,
    post,
    isDetailView,
    handlePrevMedia,
    handleNextMedia,
    setFullsizeImage
}) => {
    if (!hasMedia) return null;

    const rawCrop = post?.mediaCrops?.[currentMediaIndex];
    const crop = {
        x: Number.isFinite(Number(rawCrop?.x)) ? Number(rawCrop.x) : DEFAULT_CROP.x,
        y: Number.isFinite(Number(rawCrop?.y)) ? Number(rawCrop.y) : DEFAULT_CROP.y,
        zoom: Number.isFinite(Number(rawCrop?.zoom)) ? Number(rawCrop.zoom) : DEFAULT_CROP.zoom,
    };

    const mediaStyle = {
        objectPosition: `${crop.x}% ${crop.y}%`,
        transformOrigin: `${crop.x}% ${crop.y}%`,
        transform: crop.zoom > 1 ? `scale(${crop.zoom})` : undefined,
    };

    return (
        <div
            data-feed-media="true"
            className="relative w-[calc(100%+2rem)] -mx-4 -mt-1 mb-3 bg-gray-100 flex items-center justify-center overflow-hidden"
        >
            {isVideo ? (
                <video
                    src={currentMediaUrl}
                    controls={true}
                    loop={true}
                    playsInline={true}
                    muted={true}
                    style={mediaStyle}
                    className="w-full h-96 object-cover"
                />
            ) : (
                <img
                    src={currentMediaUrl}
                    alt="Post media"
                    style={mediaStyle}
                    className={`w-full h-96 object-cover ${isDetailView ? "cursor-zoom-in" : ""}`}
                    onClick={(e) => {
                        if (isDetailView) {
                            e.preventDefault();
                            setFullsizeImage(currentMediaUrl);
                        }
                    }}
                    onError={(e) => {
                        e.currentTarget.style.display = "none";
                    }}
                />
            )}

            {currentMediaIndex > 0 && (
                <button
                    onClick={handlePrevMedia}
                    className="absolute left-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10 cursor-pointer"
                >
                    <FiChevronLeft size={18} />
                </button>
            )}

            {currentMediaIndex < post.media.length - 1 && (
                <button
                    onClick={handleNextMedia}
                    className="absolute right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10 cursor-pointer"
                >
                    <FiChevronRight size={18} />
                </button>
            )}

            {post.media.length > 1 && (
                <div className="absolute bottom-2 flex gap-1 z-10">
                    {post.media.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentMediaIndex ? "bg-white scale-125" : "bg-white/50"}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostMedia;