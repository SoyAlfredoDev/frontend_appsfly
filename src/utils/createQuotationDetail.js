import { createQuotationDetail } from '../api/quotationDetail.js';

export const createQuotationDetailUtils = async (quotationDetail, quotationId, quotationCustomerId) => {
    try {
        const {
            saleDetailId,
            saleDetailType,
            saleDetailProductServiceId,
            saleDetailPrice,
            saleDetailAmount
        } = quotationDetail;
        
        let quotationDetailProductId = null;
        let quotationDetailServiceId = null;
        if (saleDetailType === 'PRODUCT') {
            quotationDetailProductId = saleDetailProductServiceId;
        } else if (saleDetailType === 'SERVICE') {
            quotationDetailServiceId = saleDetailProductServiceId;
        } else {
            return 'it is necessary to select a product or service';
        }

        const data = {
            quotationDetailType: saleDetailType,
            quotationDetailId: saleDetailId,
            quotationDetailQuantity: saleDetailAmount,
            quotationDetailPrice: saleDetailPrice,
            quotationDetailTotal: saleDetailAmount * saleDetailPrice,
            quotationDetailProductId,
            quotationDetailServiceId,
            quotationId,
            quotationCustomerId
        };
        const response = await createQuotationDetail(data);
        return response.data;
    } catch (error) {
        console.error('Error creating quotation detail:', error);
        throw error;
    }
}
