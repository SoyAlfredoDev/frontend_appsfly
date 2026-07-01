import { createQuotation, sendQuotationEmail } from '../api/quotation.js';
import { createQuotationDetailUtils } from './createQuotationDetail.js';

export const createQuotationGeneral = async (
    dataQuotationGeneral,
    dataQuotationDetail,
    { sendByEmail = false } = {},
) => {
    try {
        const quotationCreated = await createQuotation(dataQuotationGeneral);
        const quotationCustomerId = dataQuotationGeneral.quotationCustomerId;
        const quotationId = dataQuotationGeneral.quotationId;
        
        for (const detail of dataQuotationDetail) {
            try {
                await createQuotationDetailUtils(detail, quotationId, quotationCustomerId);
            } catch (error) {
                console.error('Error creating quotation detail:', error);
                throw error;
            }
        }

        let emailResult = null;
        let emailError = null;
        if (sendByEmail) {
            try {
                const emailRes = await sendQuotationEmail(quotationId);
                emailResult = emailRes.data;
            } catch (error) {
                console.error('Error sending quotation email:', error);
                emailError = error.response?.data || { message: error.message };
            }
        }
        
        return {
            dataQuotation: quotationCreated.data.quotation,
            emailResult,
            emailError,
        };
    } catch (error) {
        console.error('Error creating quotation:', error);
        throw error;
    }
}
