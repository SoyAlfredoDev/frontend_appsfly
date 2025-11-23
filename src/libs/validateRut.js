export default function validateRut(rut) {
    if (!rut || typeof rut !== 'string') return false;

    // Limpiar RUT (quitar puntos, guiones, espacios)
    const clean = rut.toLowerCase().replace(/[^0-9k]/g, '');

    // Al menos debe tener base + DV
    if (clean.length < 2) return false;

    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);

    // Validar que la base sea numérica
    if (!/^\d+$/.test(body)) return false;

    // Calcular DV esperado
    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = (multiplier === 7) ? 2 : multiplier + 1;
    }

    let expectedDV = 11 - (sum % 11);
    expectedDV = expectedDV === 11 ? '0'
        : expectedDV === 10 ? 'k'
            : expectedDV.toString();

    // Comparar DV
    if (dv !== expectedDV) return false;

    // Retornar RUT formateado estándar: 12345678-k
    return `${body}-${expectedDV}`;
}
