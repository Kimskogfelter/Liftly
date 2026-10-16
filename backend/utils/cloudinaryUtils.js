import { cloudinaryService } from '../config/cloudinaryConfig.js';

// Hjälpfunktion för att radera en fil från Cloudinary via dess publika URL
export const deleteFromCloudinary = async (fileUrl) => {
    try {
        const parts = fileUrl.split('/');
        
        // Leta efter antingen 'liftly-uploads' eller gamla 'uploads'
        let uploadIndex = parts.indexOf('liftly-uploads');
        if (uploadIndex === -1) {
            uploadIndex = parts.indexOf('uploads');
        }
        
        if (uploadIndex === -1) return;

        const publicIdWithExt = parts.slice(uploadIndex).join('/');
        const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));

        await cloudinaryService.uploader.destroy(publicId);
    } catch (error) {
        console.error("Could not delete file from Cloudinary:", error);
    }
};