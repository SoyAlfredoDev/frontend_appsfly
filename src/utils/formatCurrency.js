export default function formatCurrency(value, locale = 'es-CL', currency = 'CLP') {
    if (value === null || value === undefined || isNaN(value)) return '0';

    return Number(value).toLocaleString(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}
