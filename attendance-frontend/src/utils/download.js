import axios from 'axios';

/**
 * Utility to download files from the backend API
 * @param {string} url - The relative API endpoint
 * @param {string} filename - The name to save the file as
 */
export const downloadFile = async (url, filename) => {
    try {
        const response = await axios({
            url: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${url}`,
            method: 'GET',
            responseType: 'blob', // Important for handling binary data
            headers: {
                // Attach token if needed
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        // Create a blob URL and trigger download
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('Download failed:', error);
        throw error;
    }
};
