export default function formatName(name) {
    const nameFormatted = name?.charAt(0).toUpperCase() + name?.slice(1).toLowerCase();
    return nameFormatted;
}   