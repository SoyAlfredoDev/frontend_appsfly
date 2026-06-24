import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext.jsx";
import { getBusinessByIdRequest } from "../api/business.js";

/**
 * Datos del negocio actualizados para comprobantes PDF (logo, nombre, contacto).
 */
export default function useReceiptBusiness() {
    const { business, businessSelected } = useAuth();
    const [receiptBusiness, setReceiptBusiness] = useState(business);

    const businessId =
        businessSelected?.userBusinessBusinessId
        ?? businessSelected?.businessId
        ?? business?.businessId
        ?? null;

    useEffect(() => {
        if (!businessId) {
            setReceiptBusiness(business);
            return;
        }

        let cancelled = false;

        getBusinessByIdRequest(businessId)
            .then((res) => {
                if (!cancelled && res.data) {
                    setReceiptBusiness(res.data);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setReceiptBusiness(business);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [businessId, business]);

    return receiptBusiness ?? business;
}
