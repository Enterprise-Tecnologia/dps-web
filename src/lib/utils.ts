import { DateAfter } from './../../node_modules/react-day-picker/src/types/Matchers'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export type ParseInt<T> = T extends `${infer N extends number}` ? N : never

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function isValidDate(date: Date) {
	return date instanceof Date && !isNaN(date.getTime())
}

export function formatCpf(cpf?: string) {
	if (!cpf) return ''

	cpf = cpf.replace(/[^\d]/g, '')

	return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export const getBase64 = (file: File) =>
	new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onload = () => resolve(reader.result as string)
		reader.onerror = reject
	})
