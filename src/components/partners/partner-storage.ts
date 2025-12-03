import { isActiveStatus, normalizeCnpj } from './partner-form-helpers'
import type { PartnerMockRecord } from './types'

export async function getExistingPartners(): Promise<PartnerMockRecord[]> {
	if (typeof window === 'undefined') return []

	try {
		const stored = localStorage.getItem('partnersMock')
		if (!stored) return []
		return JSON.parse(stored) as PartnerMockRecord[]
	} catch (err) {
		console.error('Erro ao carregar parceiros salvos para verificação de CNPJ', err)
		return []
	}
}

export function hasActiveInsurerWithCnpj(records: PartnerMockRecord[], cnpj: string) {
	const normalized = normalizeCnpj(cnpj)
	if (!normalized) return false

	return records.some(rec => {
		const saved = normalizeCnpj(rec.data.insurer.cnpj)
		if (!saved) return false
		return isActiveStatus(rec.data.insurer.status) && saved === normalized
	})
}

export function hasActiveChannelWithCnpj(records: PartnerMockRecord[], cnpj: string) {
	const normalized = normalizeCnpj(cnpj)
	if (!normalized) return false

	return records.some(rec => {
		if (rec.data.channel.enabled === false) return false
		const saved = normalizeCnpj(rec.data.channel.cnpj)
		if (!saved) return false
		return isActiveStatus(rec.data.channel.status) && saved === normalized
	})
}
