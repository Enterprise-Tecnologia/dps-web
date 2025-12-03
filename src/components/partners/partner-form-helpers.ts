export type Option = { value: string; label: string; insurerId?: string }

// Mocks desabilitados para evitar seguradoras/canais fixos na lista
export const mockInsurers: Option[] = []

export const mockChannels: Option[] = []

export function mergeUniqueOptions(saved: Option[], mocked: Option[]) {
	const map = new Map<string, Option>()
	;[...saved, ...mocked].forEach(opt => {
		if (!map.has(opt.value)) map.set(opt.value, opt)
	})
	return Array.from(map.values())
}

export function isActiveStatus(status?: string) {
	const normalized = (status || 'active').toLowerCase()
	return normalized === 'active' || normalized === 'reactivated'
}

export function normalizeCnpj(value?: string) {
	return value ? value.replace(/\D/g, '') : ''
}
