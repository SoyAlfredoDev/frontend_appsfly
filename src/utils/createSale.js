import { createSale } from '../api/sale.js';
import { createSaleDetailUtils } from './createSaleDetail.js'
import { createPayment } from '../api/payment.js'

export const createSaleGeneral = async (dataSaleGeneral, dataSaleDetail, dataPayment) => {
    try {
        // Call the API to create a new sale
        const saleCreated = await createSale(dataSaleGeneral);
        const saleCustomerId = dataSaleGeneral.saleCustomerId;
        const saleId = dataSaleGeneral.saleId;
        for (const saleDetail of dataSaleDetail) {
            try {
                await createSaleDetailUtils(saleDetail, saleId, saleCustomerId)
                //console.log('Sale detail created successfully:', saleDetailCreated);
            } catch (error) {
                console.error('Error creating sale detail:', error);
                throw error; // Re-throw the error to handle it in the outer try-catch
            }
        }

        for (const payment of dataPayment) {
            try {
                console.log('PAYMENT: ', payment)
                if (payment.amount > 0) {
                    const data = {
                        paymentId: payment.paymentId,
                        saleId,
                        paymentAmount: Number(payment.amount),
                        paymentMethod: payment.methodId
                    }
                    console.log('pago a registar', data)
                    await createPayment(data)
                }
            } catch (error) {
                console.error('Error creating sale detail:', error);
                throw error; // Re-throw the error to handle it in the outer try-catch
            }
        }
        // Return the response from the API
        const data = {
            dataSale: saleCreated.data.sale,
        }
        return data;
    } catch (error) {
        console.error('Error creating sale:', error);
        throw error;
    }
}