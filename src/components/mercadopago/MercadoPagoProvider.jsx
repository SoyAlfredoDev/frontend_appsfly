import { useEffect, useRef } from "react";
import { initMercadoPago } from "@mercadopago/sdk-react";
import {
    MP_LOCALE,
    getMercadoPagoPublicKey,
    isMercadoPagoConfigured,
} from "../../config/mercadopago/mpConfig.js";

let sdkInitialized = false;

/**
 * Inicializa el SDK de Mercado Pago Chile una sola vez.
 * Solo montar en flujos de plan de pago — nunca en promo $0.
 */
export default function MercadoPagoProvider({ children }) {
    const initAttempted = useRef(false);

    useEffect(() => {
        if (!isMercadoPagoConfigured() || sdkInitialized || initAttempted.current) return;
        initAttempted.current = true;

        const publicKey = getMercadoPagoPublicKey();
        initMercadoPago(publicKey, { locale: MP_LOCALE });
        sdkInitialized = true;
    }, []);

    return children;
}
