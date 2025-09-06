import { createSaleDetail } from '../api/saleDetail.js';

export const createSaleDetailUtils = async (saleDetail, saleId, saleCustomerId) => {
    try {
        const {
            saleDetailId,
            saleDetailType,
            saleDetailProductServiceId,
            saleDetailPrice,
            saleDetailAmount
        } = saleDetail
        let saleDetailProductId
        let saleDetailServiceId
        if (saleDetailType === 'PRODUCT') {
            saleDetailProductId = saleDetailProductServiceId
            saleDetailServiceId = null
        } else if (saleDetailType === 'SERVICE') {
            saleDetailServiceId = saleDetailProductServiceId
            saleDetailProductId = null
        } else {
            return 'it is necessary to select a product or service'
        };

        const data = {
            saleDetailType,
            saleDetailId,
            saleDetailQuantity: saleDetailAmount,
            saleDetailPrice,
            saleDetailTotal: saleDetailAmount * saleDetailPrice,
            saleDetailProductId,
            saleDetailServiceId,
            saleId,
            saleCustomerId

        };
        const response = await createSaleDetail(data);
        return response.data;
    } catch (error) {
        console.error('Error creating sale detail:', error);
        throw error;
    }
}