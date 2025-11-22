const PALETTE = [
    '#503af5',
    '#64c4fa',
    '#0065ff',
    '#ffc53d',
    '#f54c56',
    '#0db4b1',
];

export function randomColor() {
    const index = Math.floor(Math.random() * PALETTE.length);
    return PALETTE[index];
}

export function createId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
