import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

import { normalizeCnpj } from '@/components/partners/partner-form-helpers'
import type { PartnerMockRecord } from '@/components/partners/types'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

const toStringOrEmpty = (value?: number | string | null) =>
	value === null || typeof value === 'undefined' ? '' : String(value)

const toYesNo = (value?: boolean | null) => (value ? 'yes' : 'no')

export async function GET() {
	if (!supabase) {
		return NextResponse.json({ error: 'Supabase nÇœo configurado.' }, { status: 500 })
	}

	const records: PartnerMockRecord[] = []

// Busca entidades separadas
const { data: insurers, error: insurerError } = await supabase
	.from('seguradoras')
	.select('id, cnpj, nome, status, created_at, suspended_at, cancelled_at, reactivated_at')

if (insurerError) {
	console.error('Erro ao buscar seguradoras', insurerError)
	return NextResponse.json({ error: 'Erro ao buscar dados.' }, { status: 500 })
}

const { data: channels, error: channelError } = await supabase
	.from('canais')
	.select(
		`
    id, seguradora_id, cnpj, nome, status, created_at, suspended_at, cancelled_at, reactivated_at,
    seguradoras:seguradora_id (
      id, cnpj, nome, status, created_at, suspended_at, cancelled_at, reactivated_at
    )
  `
	)

if (channelError) {
	console.error('Erro ao buscar canais', channelError)
	return NextResponse.json({ error: 'Erro ao buscar dados.' }, { status: 500 })
}

const { data: products, error: productError } = await supabase
	.from('produtos')
	.select(
		`
    id, canal_id, nome, acceptance_model, age_min, age_max, max_term, dfi_enabled, dfi_value, mip_value, dfi_file, exams_standard, exams_additional_male, exams_additional_female, exams_additional_male_age, exams_additional_female_age, property_residential, property_commercial, property_mixed, status, created_at, suspended_at, cancelled_at, reactivated_at,
    canais:canal_id (
      id, seguradora_id, cnpj, nome, status, created_at, suspended_at, cancelled_at, reactivated_at,
      seguradoras:seguradora_id (
        id, cnpj, nome, status, created_at, suspended_at, cancelled_at, reactivated_at
      )
    )
  `
	)

if (productError) {
	console.error('Erro ao buscar produtos', productError)
	return NextResponse.json({ error: 'Erro ao buscar dados.' }, { status: 500 })
}

const insurerMap = new Map<string, (typeof insurers)[number]>()
for (const ins of insurers ?? []) {
	if (ins?.id) insurerMap.set(ins.id, ins)
}
const channelMap = new Map<string, (typeof channels)[number]>()
for (const ch of channels ?? []) {
	if (ch?.id) channelMap.set(ch.id, ch)
}

	const pushRecord = (record: PartnerMockRecord) => {
		records.push(record)
	}

	// Registros de seguradora sem canal/produto
	for (const insurer of insurers ?? []) {
		pushRecord({
			id: insurer.id || crypto.randomUUID?.() || `${Date.now()}`,
			createdAt: insurer.created_at || new Date().toISOString(),
			data: {
				insurer: {
					mode: 'select',
					cnpj: normalizeCnpj(insurer.cnpj),
					name: insurer.nome || '',
					insurerId: normalizeCnpj(insurer.cnpj) || insurer.id || '',
					selectedLabel: insurer.nome || '',
					insurerCnpj: normalizeCnpj(insurer.cnpj),
					status: insurer.status || 'active',
					createdAt: insurer.created_at || '',
					suspendedAt: insurer.suspended_at || '',
					cancelledAt: insurer.cancelled_at || '',
					reactivatedAt: insurer.reactivated_at || '',
				},
				channel: {
					enabled: false,
					useCurrentInsurer: 'yes',
					cnpj: '',
					name: '',
					insurerId: '',
					insurerCnpj: '',
					linkedInsurerName: '',
					linkedInsurerId: '',
					status: '',
					createdAt: '',
					suspendedAt: '',
					cancelledAt: '',
					reactivatedAt: '',
				},
				product: {
					enabled: false,
					useCurrentChannel: 'yes',
					name: '',
					channelId: '',
					channelCnpj: '',
					linkedChannelName: '',
					linkedChannelId: '',
					status: '',
					createdAt: '',
					suspendedAt: '',
					cancelledAt: '',
					reactivatedAt: '',
					dfiFile: '',
					acceptanceModel: 'completo',
					ageMin: '',
					ageMax: '',
					maxTerm: '',
					dfiEnabled: 'no',
					dfiValue: '',
					mipValue: '',
					examsStandard: '',
					examsAdditionalMale: false,
					examsAdditionalFemale: false,
					examsAdditionalMaleAge: '',
					examsAdditionalFemaleAge: '',
					propertyResidential: false,
					propertyCommercial: false,
					propertyMixed: false,
				},
			},
		})
	}

	// Registros de canais sem produto
	for (const channel of channels ?? []) {
		const joinedInsurer = (channel as any).seguradoras
		const insurer =
			joinedInsurer ||
			(channel?.seguradora_id ? insurerMap.get(channel.seguradora_id) : undefined)
		const insurerName = joinedInsurer?.nome || insurer?.nome || channel.seguradora_id || 'Seguradora vinculada'
		const insurerCnpj = normalizeCnpj(insurer?.cnpj || '')
		const insurerIdValue = insurerCnpj || insurer?.id || channel.seguradora_id || ''
		const channelName = channel.nome || normalizeCnpj(channel.cnpj) || channel.id || 'Canal'

		pushRecord({
			id: channel.id || crypto.randomUUID?.() || `${Date.now()}`,
			createdAt: channel.created_at || new Date().toISOString(),
			data: {
				insurer: {
					mode: 'select',
					cnpj: insurerCnpj,
					name: insurerName,
					insurerId: insurerIdValue,
					selectedLabel: insurerName,
					insurerCnpj: insurerCnpj,
					status: insurer?.status || 'active',
					createdAt: insurer?.created_at || '',
					suspendedAt: insurer?.suspended_at || '',
					cancelledAt: insurer?.cancelled_at || '',
					reactivatedAt: insurer?.reactivated_at || '',
				},
				channel: {
					enabled: true,
					useCurrentInsurer: 'yes',
					cnpj: normalizeCnpj(channel.cnpj),
					name: channelName,
					insurerId: insurerIdValue,
					insurerCnpj: insurerCnpj,
					linkedInsurerName: insurerName,
					linkedInsurerId: insurerIdValue,
					status: channel.status || 'active',
					createdAt: channel.created_at || '',
					suspendedAt: channel.suspended_at || '',
					cancelledAt: channel.cancelled_at || '',
					reactivatedAt: channel.reactivated_at || '',
				},
				product: {
					enabled: false,
					useCurrentChannel: 'yes',
					name: '',
					channelId: normalizeCnpj(channel.cnpj) || channel.id || '',
					channelCnpj: normalizeCnpj(channel.cnpj),
					linkedChannelName: channelName,
					linkedChannelId: normalizeCnpj(channel.cnpj) || channel.id || '',
					status: '',
					createdAt: '',
					suspendedAt: '',
					cancelledAt: '',
					reactivatedAt: '',
					dfiFile: '',
					acceptanceModel: 'completo',
					ageMin: '',
					ageMax: '',
					maxTerm: '',
					dfiEnabled: 'no',
					dfiValue: '',
					mipValue: '',
					examsStandard: '',
					examsAdditionalMale: false,
					examsAdditionalFemale: false,
					examsAdditionalMaleAge: '',
					examsAdditionalFemaleAge: '',
					propertyResidential: false,
					propertyCommercial: false,
					propertyMixed: false,
				},
			},
		})
	}

	// Registros de produtos (com canal/seguradora)
	for (const row of products ?? []) {
		// Preferir join retornado; fallback para maps por id
		const joinedChannel = (row as any).canais
		const joinedInsurer = joinedChannel?.seguradoras

		const channel =
			joinedChannel ||
			(row.canal_id ? channelMap.get(row.canal_id) : undefined)
		const insurer =
			joinedInsurer ||
			(channel?.seguradora_id ? insurerMap.get(channel.seguradora_id) : undefined)

		const insurerCnpj = normalizeCnpj(insurer?.cnpj || '')
		const channelCnpj = normalizeCnpj(channel?.cnpj || '')
		const channelName = channel?.nome || row.canal_id || 'Canal selecionado'

		pushRecord({
			id: row.id || crypto.randomUUID?.() || `${Date.now()}`,
			createdAt: row.created_at || new Date().toISOString(),
			data: {
				insurer: {
					mode: 'select',
					cnpj: insurerCnpj,
					name: insurer?.nome || '',
					insurerId: insurerCnpj || insurer?.id || '',
					selectedLabel: insurer?.nome || '',
					insurerCnpj,
					status: insurer?.status || 'active',
					createdAt: insurer?.created_at || '',
					suspendedAt: insurer?.suspended_at || '',
					cancelledAt: insurer?.cancelled_at || '',
					reactivatedAt: insurer?.reactivated_at || '',
				},
				channel: {
					enabled: true,
					useCurrentInsurer: 'yes',
					cnpj: channelCnpj,
					name: channelName,
					insurerId: insurerCnpj || insurer?.id || '',
					insurerCnpj,
					linkedInsurerName: insurer?.nome || '',
					linkedInsurerId: insurerCnpj || insurer?.id || '',
					status: channel?.status || 'active',
					createdAt: channel?.created_at || '',
					suspendedAt: channel?.suspended_at || '',
					cancelledAt: channel?.cancelled_at || '',
					reactivatedAt: channel?.reactivated_at || '',
				},
				product: {
					enabled: true,
					useCurrentChannel: 'yes',
					name: row.nome || 'Produto',
					channelId: channelCnpj || channel?.id || row.canal_id || '',
					channelCnpj,
					linkedChannelName: channelName,
					linkedChannelId: channelCnpj || channel?.id || row.canal_id || '',
					status: row.status || 'active',
					createdAt: row.created_at || '',
					suspendedAt: row.suspended_at || '',
					cancelledAt: row.cancelled_at || '',
					reactivatedAt: row.reactivated_at || '',
					dfiFile: row.dfi_file || '',
					acceptanceModel: row.acceptance_model || 'completo',
					ageMin: toStringOrEmpty(row.age_min),
					ageMax: toStringOrEmpty(row.age_max),
					maxTerm: toStringOrEmpty(row.max_term),
					dfiEnabled: toYesNo(row.dfi_enabled),
					dfiValue: toStringOrEmpty(row.dfi_value),
					mipValue: toStringOrEmpty(row.mip_value),
					examsStandard: row.exams_standard || '',
					examsAdditionalMale: row.exams_additional_male ?? false,
					examsAdditionalFemale: row.exams_additional_female ?? false,
					examsAdditionalMaleAge: toStringOrEmpty(row.exams_additional_male_age),
					examsAdditionalFemaleAge: toStringOrEmpty(row.exams_additional_female_age),
					propertyResidential: row.property_residential ?? false,
					propertyCommercial: row.property_commercial ?? false,
					propertyMixed: row.property_mixed ?? false,
				},
			},
		})
	}

	return NextResponse.json({ records })
}
export const dynamic = 'force-dynamic'
export const revalidate = 0
