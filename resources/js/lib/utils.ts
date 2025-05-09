import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatarDataBrasileira(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

export function formatCPF(value: string) {
    const onlyNums = value.replace(/\D/g, '').slice(0, 11); // Limita a 11 números
    return onlyNums
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatTelefone(value: string): string {
    const onlyNums = value.replace(/\D/g, '').slice(0, 11);

    if (onlyNums.length === 0) return '';

    if (onlyNums.length <= 2) return `(${onlyNums}`;
    if (onlyNums.length <= 7)
        return `(${onlyNums.slice(0, 2)}) ${onlyNums.slice(2)}`;
    if (onlyNums.length <= 11)
        return `(${onlyNums.slice(0, 2)}) ${onlyNums.slice(2, 7)}-${onlyNums.slice(7)}`;

    return value;
}


export function getTimeOptions() {
    const options = [];
    for (let h = 8; h <= 22; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hour = h.toString().padStart(2, '0');
            const minute = m.toString().padStart(2, '0');
            options.push(`${hour}:${minute}`);
        }
    }
    return options;
}
