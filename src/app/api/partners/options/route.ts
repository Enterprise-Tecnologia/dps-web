import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

import { isActiveStatus, normalizeCnpj, type Option } from '@/components/partners/partner-form-helpers'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export async function GET() {
	if (!supabase) {
		return NextResponse.json({ error: 'Supabase nÇœo configurado.' }, { status: 500 })
	}

	const { data: insurers, error: insurerError } = await supabase
		.from('seguradoras')
		.select('id, cnpj, nome, status')
		.eq('status', 'active')

	if (insurerError) {
		console.error('Erro ao buscar seguradoras', insurerError)
		return NextResponse.json({ error: 'Erro ao buscar seguradoras.' }, { status: 500 })
	}

	const insurerOptions: Option[] =
		insurers
			?.filter(ins => isActiveStatus(ins?.status))
			.map(ins => {
				const cnpj = normalizeCnpj(ins.cnpj || '')
				return {
					value: cnpj || ins.id || '',
					label: ins.nome || cnpj || 'Seguradora',
					cnpj,
				}
			})
			.filter(opt => opt.value) ?? []

	const { data: channels, error: channelError } = await supabase
		.from('canais')
		.select('id, seguradora_id, cnpj, nome, status')
		.eq('status', 'active')

	if (channelError) {
		console.error('Erro ao buscar canais', channelError)
		return NextResponse.json({ error: 'Erro ao buscar canais.' }, { status: 500 })
	}

	const insurerMap = new Map<string, { cnpj?: string; nome?: string; status?: string }>()
	for (const ins of insurers ?? []) {
		if (ins?.id) insurerMap.set(ins.id, { cnpj: ins.cnpj, nome: ins.nome, status: ins.status })
	}

	const channelOptions: Option[] =
		channels
			?.filter(ch => isActiveStatus(ch?.status))
			.map(ch => {
				const insurer = ch?.seguradora_id ? insurerMap.get(ch.seguradora_id) : undefined
				const cnpj = normalizeCnpj(ch.cnpj || '')
				const insurerCnpj = normalizeCnpj(insurer?.cnpj || '')
				return {
					value: cnpj || ch.id || '',
					label: ch.nome || cnpj || 'Canal',
					insurerId: insurerCnpj || ch.seguradora_id || '',
					cnpj,
				}
			})
			.filter(opt => opt.value) ?? []

	return NextResponse.json({ insurers: insurerOptions, channels: channelOptions })
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
