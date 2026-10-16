import { cloudinaryService } from '../config/cloudinaryConfig.js';

// Hjälpfunktion för att radera en fil (bild eller video) från Cloudinary via dess publika URL
export const deleteFromCloudinary = async (fileUrl) => {
    try {
        if (!fileUrl) return;

        const parts = fileUrl.split('/');
        
        // Leta efter antingen 'liftly-uploads' eller gamla 'uploads'
        let uploadIndex = parts.indexOf('liftly-uploads');
        if (uploadIndex === -1) {
            uploadIndex = parts.indexOf('uploads');
        }
        
        if (uploadIndex === -1) return;

        const publicIdWithExt = parts.slice(uploadIndex).join('/');
        const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));

        // Kolla om URL:en avser en video eller bild
        const resourceType = fileUrl.includes('/video/') ? 'video' : 'image';

        // Skicka med rätt resource_type vid radering
        await cloudinaryService.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
        console.error("Could not delete file from Cloudinary:", error);
    }
};