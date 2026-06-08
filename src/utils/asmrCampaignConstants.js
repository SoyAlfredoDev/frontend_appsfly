export const ASMR_CAMPAIGN_TYPES = [
    {
        value: "ONE_YEAR_NO_PURCHASE",
        label: "Clientes 1 año sin comprar",
    },
];

export const DEFAULT_CAMPAIGN_NAME = "Clientes 1 año sin comprar";
export const DEFAULT_DISCOUNT_PERCENT = 20;

export const WHATSAPP_SUCCESS_TOAST =
    "El WhatsApp ha sido creado correctamente, los mensajes han sido enviados correctamente.";

export const BREAKDOWN_LABELS = {
    universeTotal: (period) => `Universo Total Compradores [${period}]`,
    excludedRepurchase: "Excluidos (Compraron dentro del año)",
    eligibleFinal: "Clientes Aptos Finales (Fidelización)",
    phonesDeduplicated: "Teléfonos Duplicados Removidos",
};
