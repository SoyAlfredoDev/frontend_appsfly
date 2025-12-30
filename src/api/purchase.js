import axios from './axios'; // Ensure this points to your configured axios instance

export const createPurchaseRequest = async (purchaseData) => {
    try {
        const res = await axios.post('/purchases', purchaseData);
        return res.data;
    } catch (error) {
        console.error("Error creating purchase:", error);
        throw error;
    }
};
