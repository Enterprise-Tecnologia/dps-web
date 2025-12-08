export function formatCnpj(value?: string) {
	if (!value) return ''
	const digits = value.replace(/\D/g, '').padStart(14, '0')
	return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function formatCurrencyBRL(value?: string | number | null) {
	if (value === null || typeof value === 'undefined') return ''
	const num = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, '').replace(',', '.'))
	if (Number.isNaN(num)) return ''
	return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
