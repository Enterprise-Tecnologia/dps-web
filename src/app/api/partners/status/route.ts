import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

import { normalizeStatus } from '@/components/partners/partner-list-helpers'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

type EntityType = 'insurer' | 'channel' | 'product'
type NewStatus = 'active' | 'suspended' | 'cancelled'

export async function POST(req: NextRequest) {
	if (!supabase) {
		return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 500 })
	}

	let body: { type?: EntityType; ids?: string[]; status?: NewStatus }
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 })
	}

	const { type, ids, status } = body
	if (!type || !ids?.length || !status) {
		return NextResponse.json({ error: 'Campos obrigatórios ausentes (type, ids, status).' }, { status: 400 })
	}

	const now = new Date().toISOString()

	// Regras de bloqueio: não suspender/cancelar se tiver filho ativo
	if (type === 'insurer' && status === 'suspended') {
		const { count, error } = await supabase
			.from('canais')
			.select('id', { count: 'exact', head: true })
			.in('seguradora_id', ids)
			.filter('status', 'in', '("active","reactivated")')

		if (error) {
			console.error('Erro ao verificar canais ativos', error)
			return NextResponse.json({ error: 'Erro ao verificar vínculos.' }, { status: 500 })
		}
		if ((count ?? 0) > 0) {
			return NextResponse.json(
				{ error: 'Não é possível suspender seguradora com canais ativos.' },
				{ status: 400 }
			)
		}
	}

	if (type === 'channel' && status === 'suspended') {
		const { count, error } = await supabase
			.from('produtos')
			.select('id', { count: 'exact', head: true })
			.in('canal_id', ids)
			.filter('status', 'in', '("active","reactivated")')

		if (error) {
			console.error('Erro ao verificar produtos ativos', error)
			return NextResponse.json({ error: 'Erro ao verificar vínculos.' }, { status: 500 })
		}
		if ((count ?? 0) > 0) {
			return NextResponse.json(
				{ error: 'Não é possível suspender canal com produtos ativos.' },
				{ status: 400 }
			)
		}
	}

	const table =
		type === 'insurer' ? 'seguradoras' : type === 'channel' ? 'canais' : 'produtos'

	const updates =
		status === 'suspended'
			? { status: 'suspended', suspended_at: now, cancelled_at: null, reactivated_at: null }
			: status === 'cancelled'
				? { status: 'cancelled', cancelled_at: now, suspended_at: null }
				: { status: 'active', reactivated_at: now, suspended_at: null, cancelled_at: null }

	const { error } = await supabase.from(table).update(updates).in('id', ids)
	if (error) {
		console.error('Erro ao atualizar status', error)
		return NextResponse.json({ error: 'Erro ao atualizar status.' }, { status: 500 })
	}

	// Cancelamento em cascata
	if (status === 'cancelled') {
		if (type === 'insurer') {
			const { data: channelRows, error: channelErr } = await supabase
				.from('canais')
				.select('id')
				.in('seguradora_id', ids)

			if (channelErr) {
				console.error('Erro ao buscar canais para cancelamento em cascata', channelErr)
				return NextResponse.json({ error: 'Erro ao cancelar canais vinculados.' }, { status: 500 })
			}

			const channelIds = (channelRows ?? []).map(ch => ch.id).filter(Boolean)
			if (channelIds.length) {
				const channelCancel = await supabase.from('canais').update(updates).in('id', channelIds)
				if (channelCancel.error) {
					console.error('Erro ao cancelar canais vinculados', channelCancel.error)
					return NextResponse.json({ error: 'Erro ao cancelar canais vinculados.' }, { status: 500 })
				}

				const { data: productRows, error: productErr } = await supabase
					.from('produtos')
					.select('id')
					.in('canal_id', channelIds)

				if (productErr) {
					console.error('Erro ao buscar produtos para cancelamento em cascata', productErr)
					return NextResponse.json({ error: 'Erro ao cancelar produtos vinculados.' }, { status: 500 })
				}

				const productIds = (productRows ?? []).map(pr => pr.id).filter(Boolean)
				if (productIds.length) {
					const productCancel = await supabase.from('produtos').update(updates).in('id', productIds)
					if (productCancel.error) {
						console.error('Erro ao cancelar produtos vinculados', productCancel.error)
						return NextResponse.json({ error: 'Erro ao cancelar produtos vinculados.' }, { status: 500 })
					}
				}
			}
		}

		if (type === 'channel') {
			const { data: productRows, error: productErr } = await supabase
				.from('produtos')
				.select('id')
				.in('canal_id', ids)

			if (productErr) {
				console.error('Erro ao buscar produtos para cancelamento em cascata', productErr)
				return NextResponse.json({ error: 'Erro ao cancelar produtos vinculados.' }, { status: 500 })
			}

			const productIds = (productRows ?? []).map(pr => pr.id).filter(Boolean)
			if (productIds.length) {
				const productCancel = await supabase.from('produtos').update(updates).in('id', productIds)
				if (productCancel.error) {
					console.error('Erro ao cancelar produtos vinculados', productCancel.error)
					return NextResponse.json({ error: 'Erro ao cancelar produtos vinculados.' }, { status: 500 })
				}
			}
		}
	}

	return NextResponse.json({ ok: true, status: normalizeStatus(status) })
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
