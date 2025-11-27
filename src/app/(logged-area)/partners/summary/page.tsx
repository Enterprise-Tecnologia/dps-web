'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { PartnerFormValues } from '@/components/partners/partner-form'

export default function PartnerSummaryPage() {
	const router = useRouter()
	const [data, setData] = useState<PartnerFormValues | null>(null)

	useEffect(() => {
		try {
			const stored = sessionStorage.getItem('partnerSummary')
			if (stored) setData(JSON.parse(stored))
		} catch (err) {
			console.error('Erro ao ler resumo', err)
		}
	}, [])

	function handleConfirm() {
		alert('Resumo confirmado (somente teste; envio real não implementado).')
	}

	function handleCorrect() {
		router.push('/partners/create')
	}

	if (!data) {
		return (
			<div className="p-6">
				<div className="max-w-screen-xl mx-auto space-y-4">
					<h1 className="text-2xl font-semibold text-primary">Resumo do cadastro</h1>
					<p className="text-sm text-muted-foreground">
						Nenhum dado encontrado. Volte ao formulário para preencher antes de revisar.
					</p>
					<Button variant="outline" onClick={handleCorrect}>
						Voltar para o formulário
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="p-6">
			<div className="max-w-screen-xl mx-auto space-y-6">
				<div className="flex items-center justify-between gap-3 flex-wrap">
					<div>
						<h1 className="text-2xl font-semibold text-primary">Resumo do cadastro</h1>
						<p className="text-sm text-muted-foreground">Confira os dados antes de confirmar.</p>
					</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={handleCorrect}>
							Corrigir
						</Button>
						<Button onClick={handleConfirm}>Confirmar</Button>
					</div>
				</div>

				<section className="space-y-2 rounded-2xl border bg-white p-5 shadow-sm">
					<h2 className="text-lg font-semibold text-primary">Seguradora</h2>
					{data.insurer.mode === 'new' ? (
						<dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
							<Item label="Modo">Sim, com dados novos</Item>
							<Item label="CNPJ">{data.insurer.cnpj || '—'}</Item>
							<Item label="Razão social">{data.insurer.name || '—'}</Item>
						</dl>
					) : data.insurer.mode === 'select' ? (
						<dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
							<Item label="Modo">Sim, selecionar seguradora</Item>
							<Item label="Seguradora selecionada">{data.insurer.insurerId || '—'}</Item>
						</dl>
					) : (
						<p className="text-sm text-muted-foreground">Não cadastrar seguradora agora.</p>
					)}
				</section>

				<section className="space-y-2 rounded-2xl border bg-white p-5 shadow-sm">
					<h2 className="text-lg font-semibold text-primary">Canal</h2>
					{data.channel.enabled ? (
						<dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
							<Item label="CNPJ do canal">{data.channel.cnpj || '—'}</Item>
							<Item label="Nome do canal">{data.channel.name || '—'}</Item>
							<Item label="Vincular seguradora">
								{data.channel.useCurrentInsurer === 'yes' ? 'Seguradora atual' : 'Selecionar na lista'}
							</Item>
							{data.channel.useCurrentInsurer === 'no' ? (
								<Item label="Seguradora selecionada">{data.channel.insurerId || '—'}</Item>
							) : null}
						</dl>
					) : (
						<p className="text-sm text-muted-foreground">Canal não será cadastrado agora.</p>
					)}
				</section>

				<section className="space-y-2 rounded-2xl border bg-white p-5 shadow-sm">
					<h2 className="text-lg font-semibold text-primary">Produto</h2>
					{data.product.enabled ? (
						<div className="space-y-3 text-sm">
							<dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
								<Item label="Nome do produto">{data.product.name || '—'}</Item>
								<Item label="Vincular canal">
									{data.product.useCurrentChannel === 'yes' ? 'Canal atual' : 'Selecionar na lista'}
								</Item>
								{data.product.useCurrentChannel === 'no' ? (
									<Item label="Canal selecionado">{data.product.channelId || '—'}</Item>
								) : null}
								<Item label="Modelo de aceitação">
									{data.product.acceptanceModel === 'complete' ? 'Modelo completo' : 'Modelo simplificado'}
								</Item>
							</dl>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								<Item label="Idade mínima">{data.product.ageMin || '—'}</Item>
								<Item label="Idade máxima">{data.product.ageMax || '—'}</Item>
								<Item label="Prazo máximo (meses)">{data.product.maxTerm || '—'}</Item>
							</div>

							<div className="space-y-1">
								<p className="font-medium text-primary text-sm">Produto possui DFI?</p>
								<p>{data.product.dfiEnabled === 'yes' ? 'Sim' : 'Não'}</p>
								{data.product.dfiEnabled === 'yes' ? (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<Item label="Valor DFI">{data.product.dfiValue || '—'}</Item>
										<Item label="MIP">{data.product.mipValue || '—'}</Item>
										<Item label="Anexo DFI">{data.product.dfiFile || '—'}</Item>
									</div>
								) : (
									<Item label="MIP">{data.product.mipValue || '—'}</Item>
								)}
							</div>

							<div className="space-y-1">
								<p className="font-medium text-primary text-sm">Exames médicos</p>
								<Item label="Exames padrão">{data.product.examsStandard || '—'}</Item>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<Item label="Exames adicionais (homens)">
										{data.product.examsAdditionalMale
											? `Idade limite: ${data.product.examsAdditionalMaleAge || '—'}`
											: 'Não informado'}
									</Item>
									<Item label="Exames adicionais (mulheres)">
										{data.product.examsAdditionalFemale
											? `Idade limite: ${data.product.examsAdditionalFemaleAge || '—'}`
											: 'Não informado'}
									</Item>
								</div>
							</div>

							<div className="space-y-1">
								<p className="font-medium text-primary text-sm">Tipo de imóvel</p>
								<ul className="list-disc list-inside">
									{data.product.propertyResidential && <li>Residencial</li>}
									{data.product.propertyCommercial && <li>Comercial</li>}
									{data.product.propertyMixed && <li>Misto</li>}
									{!data.product.propertyResidential &&
										!data.product.propertyCommercial &&
										!data.product.propertyMixed && <li>Não informado</li>}
								</ul>
							</div>
						</div>
					) : (
						<p className="text-sm text-muted-foreground">Produto não será cadastrado agora.</p>
					)}
				</section>
			</div>
		</div>
	)
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="space-y-1">
			<p className="text-xs text-muted-foreground">{label}</p>
			<div className="text-sm">{children}</div>
		</div>
	)
}
