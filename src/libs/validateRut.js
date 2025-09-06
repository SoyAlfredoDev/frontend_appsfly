export default function validateRut(rut) {
    if (!rut || typeof rut !== 'string') return false;

    const rutFormatted = rut.toLowerCase().replace(/[^0-9k]/g, '');
    let rutSpelling = [];

    for (let i = 0; i < rutFormatted.length; i++) {
        const char = rutFormatted[i];
        if (i === rutFormatted.length - 1 && char === 'k') {
            rutSpelling.push('k');
        } else if (!isNaN(char)) {
            rutSpelling.push(parseInt(char));
        }
    }

    const givenDV = rutSpelling.pop();
    const reversedRut = [...rutSpelling].reverse();

    let sum = 0;
    let multiplier = 2;

    for (const digit of reversedRut) {
        sum += digit * multiplier;
        multiplier = (multiplier === 7) ? 2 : multiplier + 1;
    }

    let expectedDV = 11 - (sum % 11);
    if (expectedDV === 11) expectedDV = '0';
    else if (expectedDV === 10) expectedDV = 'k';
    else expectedDV = expectedDV.toString();

    if (expectedDV === givenDV.toString()) {
        const rutBaseString = rutSpelling.join('');
        return `${rutBaseString}-${expectedDV}`;
    } else {
        return false;
    }
}