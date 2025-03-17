export default function uuid() {
    let uuid = '';
    const values = '0123456789abcdef';

    for (let i = 0; i < 36; i++) {
        if (i === 14) {
            uuid += '4'; // Version 4 UUID
        } else if (i === 19) {
            uuid += values.charAt(Math.floor(Math.random() * 16)); // Random hex character for the 15th position
        } else if (i === 8 || i === 13 || i === 18 || i === 23) {
            uuid += '-'; // Hyphens at specified positions
        } else {
            uuid += values.charAt(Math.floor(Math.random() * 16));
        }
    }

    return uuid;
}