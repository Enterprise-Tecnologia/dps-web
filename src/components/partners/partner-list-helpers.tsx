import type { PartnerMockRecord } from './types'

export type StatusValue = 'active' | 'suspended' | 'cancelled' | 'reactivated'

export type StatusDates = {
	status?: string
	createdAt?: string
	suspendedAt?: string
	inactivatedAt?: string
	cancelledAt?: string
	reactivatedAt?: string
}

export type TreeInsurer = {
	id: string
	name: string
	details: {
		name?: string
		cnpj?: string
		insurerId?: string
		mode?: string
		status?: StatusValue | string
		createdAt?: string
		suspendedAt?: string
		inactivatedAt?: string
		cancelledAt?: string
		reactivatedAt?: string
	}
	recordIds: string[]
	channels: {
		id: string
		name: string
		details: {
			name?: string
			cnpj?: string
			insurerId?: string
			useCurrentInsurer?: string
			status?: StatusValue | string
			createdAt?: string
			suspendedAt?: string
			inactivatedAt?: string
			cancelledAt?: string
			reactivatedAt?: string
		}
		recordIds: string[]
		products: {
			id: string
			name: string
			details: {
				name?: string
				acceptanceModel?: string
				ageMin?: string
				ageMax?: string
				maxTerm?: string
				mipValue?: string
				dfiValue?: string
				dfiFile?: string
				dfiEnabled?: string
				useCurrentChannel?: string
				channelId?: string
				linkedChannelName?: string
				examsStandard?: string
				examsAdditionalMale?: boolean
				examsAdditionalFemale?: boolean
				examsAdditionalMaleAge?: string
				examsAdditionalFemaleAge?: string
				propertyResidential?: boolean
				propertyCommercial?: boolean
				propertyMixed?: boolean
				status?: StatusValue | string
				createdAt?: string
				suspendedAt?: string
				inactivatedAt?: string
				cancelledAt?: string
				reactivatedAt?: string
			}
			recordIds: string[]
		}[]
	}[]
}

export function getTimestamp(value?: string) {
	if (!value) return 0
	const parsed = Date.parse(value)
	return Number.isNaN(parsed) ? 0 : parsed
}

export function normalizeStatus(status?: string): StatusValue {
	const normalized = (status || 'active').toLowerCase()
	if (normalized === 'inactive') return 'cancelled'
	if (normalized === 'cancelled') return 'cancelled'
	if (normalized === 'suspended') return 'suspended'
	if (normalized === 'reactivated') return 'reactivated'
	return 'active'
}

export function getLatestStatusTimestamp(dates: StatusDates) {
	return Math.max(
		getTimestamp(dates.reactivatedAt),
		getTimestamp(dates.cancelledAt || dates.inactivatedAt),
		getTimestamp(dates.suspendedAt),
		getTimestamp(dates.createdAt)
	)
}

export function getCurrentStatus(dates: StatusDates): StatusValue {
	const events: { value: StatusValue; ts: number }[] = [
		{ value: 'reactivated', ts: getTimestamp(dates.reactivatedAt) },
		{ value: 'cancelled', ts: getTimestamp(dates.cancelledAt || dates.inactivatedAt) },
		{ value: 'suspended', ts: getTimestamp(dates.suspendedAt) },
		{ value: 'active', ts: getTimestamp(dates.createdAt) },
	].filter(event => event.ts > 0)

	if (events.length) {
		events.sort((a, b) => b.ts - a.ts)
		return events[0]!.value
	}

	return normalizeStatus(dates.status)
}

export function formatDateTime(input?: string) {
	if (!input) return ''
	const date = new Date(input)
	if (Number.isNaN(date.getTime())) return ''
	return new Intl.DateTimeFormat('pt-BR', {
		dateStyle: 'short',
		timeStyle: 'short',
	}).format(date)
}

export const yesNo = (value?: boolean | string) => {
	if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
	if (value === 'yes') return 'Sim'
	if (value === 'no') return 'Não'
	return 'Não informado'
}

export const statusInfo = (status?: StatusValue | string) => {
	const normalized = normalizeStatus(typeof status === 'string' ? status : status ?? 'active')
	if (normalized === 'cancelled') return { label: 'Cancelado', color: 'bg-slate-500', text: 'text-slate-700' }
	if (normalized === 'suspended') return { label: 'Suspenso', color: 'bg-amber-500', text: 'text-amber-700' }
	if (normalized === 'reactivated') return { label: 'Reativado', color: 'bg-emerald-500', text: 'text-emerald-700' }
	return { label: 'Ativo', color: 'bg-emerald-500', text: 'text-emerald-700' }
}

export function StatusLabel({ status }: { status?: StatusValue | string }) {
	const info = statusInfo(status)
	return <span className={`inline-flex items-center gap-2 text-xs font-medium ${info.text}`}>{info.label}</span>
}

export function buildTree(records: PartnerMockRecord[]): TreeInsurer[] {
	const insurersMap = new Map<string, TreeInsurer>()
	const shouldReplaceStatus = (current: StatusDates, incoming: StatusDates) =>
		getLatestStatusTimestamp(incoming) >= getLatestStatusTimestamp(current)

	for (const record of records) {
		const insurerName =
			record.data.channel.linkedInsurerName ||
			record.data.insurer.name ||
			record.data.insurer.selectedLabel ||
			record.data.insurer.insurerId ||
			'Seguradora sem nome'
		const insurerId = insurerName

		const insurerDetailsFromRecord = {
			name: record.data.insurer.name,
			cnpj: record.data.insurer.cnpj,
			insurerId: record.data.insurer.insurerId,
			mode: record.data.insurer.mode,
			status: record.data.insurer.status,
			createdAt: record.data.insurer.createdAt,
			suspendedAt: record.data.insurer.suspendedAt,
			inactivatedAt: record.data.insurer.inactivatedAt,
			cancelledAt: (record.data as any).insurer?.cancelledAt,
			reactivatedAt: record.data.insurer.reactivatedAt,
		}
		const insurerStatus = getCurrentStatus(insurerDetailsFromRecord)

		if (!insurersMap.has(insurerId)) {
			insurersMap.set(insurerId, {
				id: insurerId,
				name: insurerName,
				details: { ...insurerDetailsFromRecord, status: insurerStatus },
				recordIds: [],
				channels: [],
			})
		}

		const insurer = insurersMap.get(insurerId)!
		if (shouldReplaceStatus(insurer.details, insurerDetailsFromRecord)) {
			insurer.details = { ...insurerDetailsFromRecord, status: insurerStatus }
		}
		if (!insurer.recordIds.includes(record.id)) insurer.recordIds.push(record.id)

		const channelName =
			record.data.product.linkedChannelName ||
			record.data.channel.name ||
			record.data.product.channelId ||
			''
		if (!channelName) continue
		const channelId = `${insurerId}-${channelName}`

		const channelDetailsFromRecord = {
			name: record.data.channel.name,
			cnpj: record.data.channel.cnpj,
			insurerId: record.data.channel.insurerId,
			useCurrentInsurer: record.data.channel.useCurrentInsurer,
			status: record.data.channel.status,
			createdAt: record.data.channel.createdAt,
			suspendedAt: record.data.channel.suspendedAt,
			inactivatedAt: record.data.channel.inactivatedAt,
			cancelledAt: (record.data as any).channel?.cancelledAt,
			reactivatedAt: record.data.channel.reactivatedAt,
		}
		const channelStatus = getCurrentStatus(channelDetailsFromRecord)

		let channel = insurer.channels.find(c => c.id === channelId)
		if (!channel) {
			channel = {
				id: channelId,
				name: channelName,
				details: {
					...channelDetailsFromRecord,
					status: channelStatus,
				},
				recordIds: [],
				products: [],
			}
			insurer.channels.push(channel)
		} else if (shouldReplaceStatus(channel.details, channelDetailsFromRecord)) {
			channel.details = { ...channelDetailsFromRecord, status: channelStatus }
		}
		if (!channel.recordIds.includes(record.id)) channel.recordIds.push(record.id)

		if (record.data.product?.enabled !== false) {
			const productName = record.data.product.name || 'Produto sem nome'
			const productId = `${channelId}-${productName}`
			const productDetailsFromRecord = {
				name: productName,
				acceptanceModel: record.data.product.acceptanceModel,
				ageMin: record.data.product.ageMin,
				ageMax: record.data.product.ageMax,
				maxTerm: record.data.product.maxTerm,
				mipValue: record.data.product.mipValue,
				dfiValue: record.data.product.dfiValue,
				dfiFile: record.data.product.dfiFile,
				dfiEnabled: record.data.product.dfiEnabled,
				useCurrentChannel: record.data.product.useCurrentChannel,
				channelId: record.data.product.channelId,
				linkedChannelName: record.data.product.linkedChannelName,
				examsStandard: record.data.product.examsStandard,
				examsAdditionalMale: record.data.product.examsAdditionalMale,
				examsAdditionalFemale: record.data.product.examsAdditionalFemale,
				examsAdditionalMaleAge: record.data.product.examsAdditionalMaleAge,
				examsAdditionalFemaleAge: record.data.product.examsAdditionalFemaleAge,
				propertyResidential: record.data.product.propertyResidential,
				propertyCommercial: record.data.product.propertyCommercial,
				propertyMixed: record.data.product.propertyMixed,
				status: record.data.product.status,
				createdAt: record.data.product.createdAt,
				suspendedAt: record.data.product.suspendedAt,
				inactivatedAt: record.data.product.inactivatedAt,
				cancelledAt: (record.data as any).product?.cancelledAt,
				reactivatedAt: record.data.product.reactivatedAt,
			}
			const productStatus = getCurrentStatus(productDetailsFromRecord)

			let product = channel.products.find(p => p.id === productId)
			if (!product) {
				channel.products.push({
					id: productId,
					name: productName,
					details: {
						...productDetailsFromRecord,
						status: productStatus,
					},
					recordIds: [],
				})
				product = channel.products.find(p => p.id === productId)!
			} else if (shouldReplaceStatus(product.details, productDetailsFromRecord)) {
				product.details = { ...productDetailsFromRecord, status: productStatus }
				product.name = productName
			}

			if (!product.recordIds.includes(record.id)) product.recordIds.push(record.id)
		}
	}

	return Array.from(insurersMap.values())
}
