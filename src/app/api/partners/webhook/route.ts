import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { safeParse } from 'valibot'

import { partnerFormSchema } from '@/components/partners/partner-form-schema'
import { normalizeCnpj } from '@/components/partners/partner-form-helpers'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

const normalizeStatus = (status?: string) => {
	const value = (status || 'active').toLowerCase()
	return value === 'suspended' || value === 'cancelled' ? value : 'active'
}

const toInt = (value?: string | null) => {
	if (!value) return null
	const parsed = Number.parseInt(value, 10)
	return Number.isNaN(parsed) ? null : parsed
}

const toMoney = (value?: string | null) => {
	if (!value) return null
	const onlyNumbers = String(value).replace(/[^\d,.-]/g, '')
	const normalized = onlyNumbers.replace(/\./g, '').replace(',', '.')
	const parsed = Number.parseFloat(normalized)
	return Number.isNaN(parsed) ? null : parsed
}

export async function POST(req: NextRequest) {
	if (!supabase) {
		return NextResponse.json({ error: 'Supabase nÇœo configurado.' }, { status: 500 })
	}

	let json: unknown
	try {
		json = await req.json()
	} catch {
		return NextResponse.json({ error: 'Payload invÇ­lido ou ausente.' }, { status: 400 })
	}

	const parsed = safeParse(partnerFormSchema, json)
	if (!parsed.success) {
		return NextResponse.json(
			{ error: 'Payload fora do formato esperado.', issues: parsed.issues },
			{ status: 400 }
		)
	}

	const data = parsed.output
	const now = new Date().toISOString()

	const insurerCnpj = normalizeCnpj(data.insurer.insurerCnpj || data.insurer.cnpj || '')
	const channelCnpj = normalizeCnpj(data.channel.cnpj || data.product.channelCnpj || '')
	const channelInsurerCnpj = normalizeCnpj(
		data.channel.insurerCnpj || data.channel.insurerId || insurerCnpj
	)
	const productChannelRaw = data.product.channelCnpj || data.product.channelId || channelCnpj
	const productChannelCnpj = normalizeCnpj(productChannelRaw)

	let insurerId: string | null = null

	// Seguradora (cria ou reaproveita)
	if (insurerCnpj) {
		const insurerName =
			data.insurer.name || data.insurer.selectedLabel || data.insurer.insurerId || 'Seguradora'
		const { data: insurerRow, error } = await supabase
			.from('seguradoras')
			.upsert(
				{
					cnpj: insurerCnpj,
					nome: insurerName,
					status: normalizeStatus(data.insurer.status),
					created_at: data.insurer.createdAt || now,
					suspended_at: data.insurer.suspendedAt || null,
					cancelled_at: data.insurer.cancelledAt || null,
					reactivated_at: data.insurer.reactivatedAt || null,
				},
				{ onConflict: 'cnpj' }
			)
			.select('id')
			.single()

		if (error) {
			console.error('Erro ao salvar seguradora', error)
			return NextResponse.json({ error: 'Erro ao salvar seguradora.' }, { status: 400 })
		}
		insurerId = insurerRow?.id ?? null
	}

	// Canal (cria ou reaproveita)
	let channelId: string | null = null
	if (data.channel.enabled && channelCnpj) {
		let channelSegId = insurerId

		if (!channelSegId && channelInsurerCnpj) {
			const { data: existingSeg } = await supabase
				.from('seguradoras')
				.select('id')
				.eq('cnpj', channelInsurerCnpj)
				.maybeSingle()

			if (existingSeg?.id) {
				channelSegId = existingSeg.id
			} else {
				const { data: createdSeg, error } = await supabase
					.from('seguradoras')
					.upsert(
						{
							cnpj: channelInsurerCnpj,
							nome: data.channel.linkedInsurerName || data.channel.insurerId || 'Seguradora',
							status: 'active',
							created_at: now,
						},
						{ onConflict: 'cnpj' }
					)
					.select('id')
					.single()

				if (error) {
					console.error('Erro ao criar seguradora do canal', error)
					return NextResponse.json({ error: 'Erro ao criar seguradora do canal.' }, { status: 400 })
				}

				channelSegId = createdSeg?.id ?? null
			}
		}

		if (!channelSegId) {
			return NextResponse.json(
				{ error: 'Canal requer vinculaÇõÇœo com seguradora (seguradora nÇœo informada).' },
				{ status: 400 }
			)
		}

		const { data: channelRow, error } = await supabase
			.from('canais')
			.upsert(
				{
					cnpj: channelCnpj,
					nome: data.channel.name || data.product.linkedChannelName || 'Canal',
					seguradora_id: channelSegId,
					status: normalizeStatus(data.channel.status),
					created_at: data.channel.createdAt || now,
					suspended_at: data.channel.suspendedAt || null,
					cancelled_at: data.channel.cancelledAt || null,
					reactivated_at: data.channel.reactivatedAt || null,
				},
				{ onConflict: 'cnpj' }
			)
			.select('id')
			.single()

		if (error) {
			console.error('Erro ao salvar canal', error)
			return NextResponse.json({ error: 'Erro ao salvar canal.' }, { status: 400 })
		}
		channelId = channelRow?.id ?? null
	}

	// Resolve canal existente para produto quando canal nÇœo estÇ¡ sendo cadastrado agora
	if (!channelId && data.product.enabled && (productChannelCnpj || productChannelRaw)) {
		const channelQuery = supabase.from('canais').select('id, seguradora_id').limit(1)
		if (productChannelCnpj && productChannelCnpj.length === 14) {
			channelQuery.eq('cnpj', productChannelCnpj)
		} else if (productChannelRaw) {
			channelQuery.eq('id', productChannelRaw)
		}
		const { data: existingChannel, error } = await channelQuery.maybeSingle()
		if (error) {
			console.error('Erro ao buscar canal vinculado', error)
			return NextResponse.json({ error: 'Erro ao buscar canal vinculado.' }, { status: 500 })
		}
		if (existingChannel?.id) {
			channelId = existingChannel.id
			if (!insurerId && existingChannel.seguradora_id) {
				insurerId = existingChannel.seguradora_id
			}
		} else {
			return NextResponse.json(
				{ error: 'Produto requer canal vÇ­lido vinculado (canal selecionado nÇœo encontrado).' },
				{ status: 400 }
			)
		}
	}

	// Produto
	if (data.product.enabled) {
		if (!channelId) {
			return NextResponse.json(
				{ error: 'Produto requer canal vÇ­lido vinculado.' },
				{ status: 400 }
			)
		}

		if (!productChannelCnpj && !productChannelRaw) {
			return NextResponse.json(
				{ error: 'Produto requer CNPJ do canal para vinculaÇõÇœo.' },
				{ status: 400 }
			)
		}

		const { error } = await supabase.from('produtos').insert({
			canal_id: channelId,
			nome: data.product.name || 'Produto',
			acceptance_model: data.product.acceptanceModel || 'completo',
			age_min: toInt(data.product.ageMin),
			age_max: toInt(data.product.ageMax),
			max_term: toInt(data.product.maxTerm),
			dfi_enabled: data.product.dfiEnabled === 'yes',
			dfi_value: toMoney(data.product.dfiValue),
			mip_value: toMoney(data.product.mipValue),
			dfi_file: data.product.dfiFile || null,
			exams_standard: data.product.examsStandard || null,
			exams_additional_male: data.product.examsAdditionalMale || false,
			exams_additional_female: data.product.examsAdditionalFemale || false,
			exams_additional_male_age: toInt(data.product.examsAdditionalMaleAge),
			exams_additional_female_age: toInt(data.product.examsAdditionalFemaleAge),
			property_residential: data.product.propertyResidential || false,
			property_commercial: data.product.propertyCommercial || false,
			property_mixed: data.product.propertyMixed || false,
			status: normalizeStatus(data.product.status),
			created_at: data.product.createdAt || now,
			suspended_at: data.product.suspendedAt || null,
			cancelled_at: data.product.cancelledAt || null,
			reactivated_at: data.product.reactivatedAt || null,
		})

		if (error) {
			console.error('Erro ao salvar produto', error)
			return NextResponse.json({ error: 'Erro ao salvar produto.' }, { status: 400 })
		}
	}

	return NextResponse.json({ ok: true, insurerId, channelId })
}
