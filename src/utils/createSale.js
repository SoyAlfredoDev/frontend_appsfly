import { createSale, sendSaleEmail } from '../api/sale.js';
import { createSaleDetailUtils } from './createSaleDetail.js'
import { createPayment } from '../api/payment.js'

export const createSaleGeneral = async (
    dataSaleGeneral,
    dataSaleDetail,
    dataPayment,
    { sendByEmail = false } = {},
) => {
    try {
        const saleCreated = await createSale(dataSaleGeneral);
        const saleCustomerId = dataSaleGeneral.saleCustomerId;
        const saleId = dataSaleGeneral.saleId;
        for (const saleDetail of dataSaleDetail) {
            try {
                await createSaleDetailUtils(saleDetail, saleId, saleCustomerId)
            } catch (error) {
                console.error('Error creating sale detail:', error);
                if (error.response?.data?.code === 'INSUFFICIENT_STOCK') {
                    const err = new Error(error.response.data.message);
                    err.code = 'INSUFFICIENT_STOCK';
                    err.response = error.response;
                    throw err;
                }
                throw error;
            }
        }

        for (const payment of dataPayment) {
            try {
                if (payment.amount > 0) {
                    const data = {
                        paymentId: payment.paymentId,
                        saleId,
                        paymentAmount: Number(payment.amount),
                        paymentMethod: payment.methodId
                    }
                    await createPayment(data)
                }
            } catch (error) {
                console.error('Error creating payment:', error);
                throw error;
            }
        }

        let emailResult = null;
        let emailError = null;
        if (sendByEmail) {
            try {
                const emailRes = await sendSaleEmail(saleId);
                emailResult = emailRes.data;
            } catch (error) {
                console.error('Error sending sale email:', error);
                emailError = error.response?.data || { message: error.message };
            }
        }

        return {
            dataSale: saleCreated.data.sale,
            emailResult,
            emailError,
        };
    } catch (error) {
        console.error('Error creating sale:', error);
        throw error;
    }
}
