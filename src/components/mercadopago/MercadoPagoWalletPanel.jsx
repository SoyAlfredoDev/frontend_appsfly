import { Wallet } from "@mercadopago/sdk-react";
import { isMercadoPagoConfigured } from "../../config/mercadopago/mpConfig.js";

/**
 * Wallet Brick — Checkout Pro embebido con preferenceId del backend.
 */
export default function MercadoPagoWalletPanel({ preferenceId, onReady, onError }) {
    if (!isMercadoPagoConfigured() || !preferenceId) {
        return null;
    }

    return (
        <div className="mt-3 rounded-lg border border-slate-200 bg-white p-2">
            <Wallet
                initialization={{ preferenceId }}
                onReady={onReady}
                onError={(err) => {
                    console.error("[MercadoPagoWalletPanel]", err);
                    onError?.(err);
                }}
            />
        </div>
    );
}
