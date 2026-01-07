const fs = require('fs');
const path = require('path');

/**
 * Delete image file from uploads directory
 * @param {string} imageUrl - Full URL or path to the image
 * @returns {Promise<boolean>} - True if deleted, false if not found or error
 */
async function deleteImageFile(imageUrl) {
    try {
        if (!imageUrl || !imageUrl.includes('/uploads/')) {
            return false;
        }

        // Extract the path from URL
        // e.g., "http://localhost:8000/uploads/cuisines/filename.png" -> "/uploads/cuisines/filename.png"
        let filePath = imageUrl;
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            const url = new URL(imageUrl);
            filePath = url.pathname;
        }

        // Convert to absolute path
        const absolutePath = path.join(__dirname, '../..', filePath);

        // Check if file exists
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error deleting image file:', error);
        return false;
    }
}

module.exports = {
    deleteImageFile
};

