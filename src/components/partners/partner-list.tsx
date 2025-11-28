'use client'

import { useEffect, useState } from 'react'
import { Building2, Share2, Info, Package2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'

import type { PartnerMockRecord } from './types'

function formatDateTime(input?: string) {
	if (!input) return ''
	const date = new Date(input)
	if (Number.isNaN(date.getTime())) return ''
	return new Intl.DateTimeFormat('pt-BR', {
		dateStyle: 'short',
		timeStyle: 'short',
	}).format(date)
}

const yesNo = (value?: boolean | string) => {
	if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
	if (value === 'yes') return 'Sim'
	if (value === 'no') return 'Não'
	return 'Não informado'
}

const statusInfo = (status?: string) => {
	const normalized = (status || 'active').toLowerCase()
	if (normalized === 'inactive') return { label: 'Inativo', color: 'bg-slate-400', text: 'text-slate-700' }
	if (normalized === 'suspended') return { label: 'Suspenso', color: 'bg-amber-500', text: 'text-amber-700' }
	return { label: 'Ativo', color: 'bg-emerald-500', text: 'text-emerald-700' }
}

function StatusLabel({ status }: { status?: string }) {
	const info = statusInfo(status)
	return <span className={`inline-flex items-center gap-2 text-xs font-medium ${info.text}`}>{info.label}</span>
}

export default function PartnerList() {
	const [records, setRecords] = useState<PartnerMockRecord[]>([])

	useEffect(() => {
		if (typeof window === 'undefined') return
		try {
			const stored = localStorage.getItem('partnersMock')
			if (stored) setRecords(JSON.parse(stored) as PartnerMockRecord[])
		} catch (err) {
			console.error('Erro ao carregar parceiros salvos localmente', err)
		}
	}, [])

	function updateStatus(
		type: 'insurer' | 'channel' | 'product',
		ids: string[],
		newStatus: 'active' | 'suspended' | 'inactive'
	) {
		if (typeof window === 'undefined') return
		const now = new Date().toISOString()

		const updated = records.map(rec => {
			if (!ids.includes(rec.id)) return rec
			const data = { ...rec.data }

			if (type === 'insurer') {
				data.insurer = {
					...data.insurer,
					status: newStatus,
					suspendedAt: newStatus === 'suspended' ? now : data.insurer.suspendedAt,
					inactivatedAt: newStatus === 'inactive' ? now : data.insurer.inactivatedAt,
					reactivatedAt: newStatus === 'active' ? now : data.insurer.reactivatedAt,
				}
			}

			if (type === 'channel') {
				data.channel = {
					...data.channel,
					status: newStatus,
					suspendedAt: newStatus === 'suspended' ? now : data.channel.suspendedAt,
					inactivatedAt: newStatus === 'inactive' ? now : data.channel.inactivatedAt,
					reactivatedAt: newStatus === 'active' ? now : data.channel.reactivatedAt,
				}
			}

			if (type === 'product') {
				data.product = {
					...data.product,
					status: newStatus,
					suspendedAt: newStatus === 'suspended' ? now : data.product.suspendedAt,
					inactivatedAt: newStatus === 'inactive' ? now : data.product.inactivatedAt,
					reactivatedAt: newStatus === 'active' ? now : data.product.reactivatedAt,
				}
			}

			return { ...rec, data }
		})

		setRecords(updated)
		localStorage.setItem('partnersMock', JSON.stringify(updated))
	}

	if (!records.length) {
		return (
			<div className="text-sm text-muted-foreground space-y-2">
				<p>Nenhum parceiro salvo localmente ainda.</p>
				<p>Use o fluxo de cadastro e confirme o resumo para popular esta lista.</p>
			</div>
		)
	}

	const tree = buildTree(records)

	return (
		<div className="space-y-4 text-sm">
			<p className="text-muted-foreground">Total armazenado localmente: {records.length}</p>
			<div className="overflow-x-auto pb-4">
				<div className="min-w-[960px] space-y-4">
					{tree.map(insurer => (
						<div key={insurer.id} className="rounded-2xl border bg-white p-4 shadow-sm">
							<div className="flex items-center gap-2">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
									<Building2 className="h-5 w-5" />
								</div>
								<div className="flex flex-col">
									<p className="font-semibold text-base">{insurer.name}</p>
									<p className="text-xs text-muted-foreground">Seguradora</p>
									<p className="text-[11px] text-muted-foreground">Status: {statusInfo(insurer.details.status).label}</p>
								</div>
								<Dialog>
									<DialogTrigger asChild>
										<button
											type="button"
											aria-label="Detalhes da seguradora"
											className="ml-auto rounded-full p-1 text-muted-foreground transition-colors hover:text-primary"
										>
											<Info className="h-4 w-4" />
										</button>
									</DialogTrigger>
									<DialogContent className="max-w-lg">
										<DialogHeader className="space-y-1">
											<DialogTitle className="flex items-center gap-2 text-base">
												<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
													<Building2 className="h-5 w-5" />
												</span>
												<div className="flex flex-col">
													<span className="font-semibold">{insurer.details.name || insurer.name}</span>
													<span className="text-xs text-muted-foreground">Seguradora</span>
												</div>
											</DialogTitle>
										</DialogHeader>
										<div className="space-y-2 text-sm text-muted-foreground">
											<StatusLabel status={insurer.details.status} />
											<p>
												<span className="text-foreground font-semibold">Nome:</span>{' '}
												{insurer.details.name || 'Não informado'}
											</p>
											{insurer.details.cnpj ? (
												<p>
													<span className="text-foreground font-semibold">CNPJ:</span> {insurer.details.cnpj}
												</p>
											) : null}
											{insurer.details.insurerId ? (
												<p>
													<span className="text-foreground font-semibold">Selecionada:</span> {insurer.details.insurerId}
												</p>
											) : null}
											<p>
												<span className="text-foreground font-semibold">Modo:</span>{' '}
												{insurer.details.mode || 'Não informado'}
											</p>
											{insurer.details.createdAt ? (
												<p>
													<span className="text-foreground font-semibold">Criado em:</span>{' '}
													{formatDateTime(insurer.details.createdAt)}
												</p>
											) : null}
											{insurer.details.suspendedAt ? (
												<p>
													<span className="text-foreground font-semibold">Suspenso em:</span>{' '}
													{formatDateTime(insurer.details.suspendedAt)}
												</p>
											) : null}
											{insurer.details.inactivatedAt ? (
												<p>
													<span className="text-foreground font-semibold">Inativado em:</span>{' '}
													{formatDateTime(insurer.details.inactivatedAt)}
												</p>
											) : null}
											{insurer.details.reactivatedAt ? (
												<p>
													<span className="text-foreground font-semibold">Reativado em:</span>{' '}
													{formatDateTime(insurer.details.reactivatedAt)}
												</p>
											) : null}
										</div>
										<div className="pt-3 flex flex-wrap gap-2">
											{(() => {
												const status = (insurer.details.status || 'active').toLowerCase()
												if (status === 'active') {
													return (
														<>
															<Button variant="secondary" size="sm" onClick={() => updateStatus('insurer', insurer.recordIds, 'suspended')}>
																Suspender
															</Button>
															<Button variant="destructive" size="sm" onClick={() => updateStatus('insurer', insurer.recordIds, 'inactive')}>
																Inativar
															</Button>
														</>
													)
												}
												if (status === 'suspended') {
													return (
														<>
															<Button size="sm" onClick={() => updateStatus('insurer', insurer.recordIds, 'active')}>
																Ativar
															</Button>
															<Button variant="destructive" size="sm" onClick={() => updateStatus('insurer', insurer.recordIds, 'inactive')}>
																Inativar
															</Button>
														</>
													)
												}
												return (
													<>
														<Button size="sm" onClick={() => updateStatus('insurer', insurer.recordIds, 'active')}>
															Ativar
														</Button>
														<Button variant="secondary" size="sm" onClick={() => updateStatus('insurer', insurer.recordIds, 'suspended')}>
															Suspender
														</Button>
													</>
												)
											})()}
										</div>
									</DialogContent>
								</Dialog>
							</div>

							<div className="mt-4 space-y-4 border-l pl-4">
								{insurer.channels.length === 0 ? (
									<p className="text-xs text-muted-foreground">Nenhum canal vinculado.</p>
								) : (
									insurer.channels.map(channel => (
										<div key={channel.id} className="space-y-2">
											<div className="rounded-xl border bg-gray-50 px-3 py-2 inline-flex items-center gap-2">
												<Share2 className="h-4 w-4 text-primary" />
												<div className="flex flex-col">
													<span className="font-medium">{channel.name}</span>
													<span className="text-[11px] text-muted-foreground">
														Status: {statusInfo(channel.details.status).label}
													</span>
												</div>
												<Dialog>
													<DialogTrigger asChild>
														<button
															type="button"
															aria-label="Detalhes do canal"
															className="rounded-full p-1 text-muted-foreground transition-colors hover:text-primary"
														>
															<Info className="h-3.5 w-3.5" />
														</button>
													</DialogTrigger>
													<DialogContent className="max-w-lg">
														<DialogHeader className="space-y-1">
															<DialogTitle className="flex items-center gap-2 text-base">
																<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
																	<Share2 className="h-4 w-4" />
																</span>
																<div className="flex flex-col">
																	<span className="font-semibold">{channel.details.name || channel.name}</span>
																	<span className="text-xs text-muted-foreground">Canal</span>
																</div>
															</DialogTitle>
														</DialogHeader>
														<div className="space-y-2 text-sm text-muted-foreground">
															<StatusLabel status={channel.details.status} />
															<p>
																<span className="text-foreground font-semibold">Nome:</span>{' '}
																{channel.details.name || 'Não informado'}
															</p>
															{channel.details.cnpj ? (
																<p>
																	<span className="text-foreground font-semibold">CNPJ:</span> {channel.details.cnpj}
																</p>
															) : null}
															<p>
																<span className="text-foreground font-semibold">Vincular seguradora atual?</span>{' '}
																{yesNo(channel.details.useCurrentInsurer)}
															</p>
															{channel.details.insurerId ? (
																<p>
																	<span className="text-foreground font-semibold">Seguradora selecionada:</span>{' '}
																	{channel.details.insurerId}
																</p>
															) : null}
															{channel.details.createdAt ? (
																<p>
																	<span className="text-foreground font-semibold">Criado em:</span>{' '}
																	{formatDateTime(channel.details.createdAt)}
																</p>
															) : null}
															{channel.details.suspendedAt ? (
																<p>
																	<span className="text-foreground font-semibold">Suspenso em:</span>{' '}
																	{formatDateTime(channel.details.suspendedAt)}
																</p>
															) : null}
															{channel.details.inactivatedAt ? (
																<p>
																	<span className="text-foreground font-semibold">Inativado em:</span>{' '}
																	{formatDateTime(channel.details.inactivatedAt)}
																</p>
															) : null}
															{channel.details.reactivatedAt ? (
																<p>
																	<span className="text-foreground font-semibold">Reativado em:</span>{' '}
																	{formatDateTime(channel.details.reactivatedAt)}
																</p>
															) : null}
														</div>
														<div className="pt-3 flex flex-wrap gap-2">
															{(() => {
																const status = (channel.details.status || 'active').toLowerCase()
																if (status === 'active') {
																	return (
																		<>
																			<Button variant="secondary" size="sm" onClick={() => updateStatus('channel', channel.recordIds, 'suspended')}>
																				Suspender
																			</Button>
																			<Button variant="destructive" size="sm" onClick={() => updateStatus('channel', channel.recordIds, 'inactive')}>
																				Inativar
																			</Button>
																		</>
																	)
																}
																if (status === 'suspended') {
																	return (
																		<>
																			<Button size="sm" onClick={() => updateStatus('channel', channel.recordIds, 'active')}>
																				Ativar
																			</Button>
																			<Button variant="destructive" size="sm" onClick={() => updateStatus('channel', channel.recordIds, 'inactive')}>
																				Inativar
																			</Button>
																		</>
																	)
																}
																return (
																	<>
																		<Button size="sm" onClick={() => updateStatus('channel', channel.recordIds, 'active')}>
																			Ativar
																		</Button>
																		<Button variant="secondary" size="sm" onClick={() => updateStatus('channel', channel.recordIds, 'suspended')}>
																			Suspender
																		</Button>
																	</>
																)
															})()}
														</div>
													</DialogContent>
												</Dialog>
											</div>

											<div className="pl-2">
												{channel.products.length ? (
													<div className="flex flex-wrap gap-3">
														{channel.products.map(product => (
															<div
																key={product.id}
																className="rounded-xl border px-3 py-2 bg-white shadow-sm flex items-center gap-2"
															>
																<Package2 className="h-4 w-4 text-primary/70" />
																<div className="flex flex-col leading-tight">
																	<span className="font-medium">{product.name}</span>
																	<span className="text-[11px] text-muted-foreground">
																		Status: {statusInfo(product.details.status).label}
																	</span>
																</div>
																<Dialog>
																	<DialogTrigger asChild>
																		<button
																			type="button"
																			aria-label="Detalhes do produto"
																			className="rounded-full p-1 text-muted-foreground transition-colors hover:text-primary"
																		>
																			<Info className="h-3.5 w-3.5" />
																		</button>
																	</DialogTrigger>
																	<DialogContent className="max-w-lg">
																		<DialogHeader className="space-y-1">
																			<DialogTitle className="flex items-center gap-2 text-base">
																				<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
																					<Package2 className="h-4 w-4" />
																				</span>
																				<div className="flex flex-col">
																					<span className="font-semibold">{product.details.name || product.name}</span>
																					<span className="text-xs text-muted-foreground">Produto</span>
																				</div>
																			</DialogTitle>
																		</DialogHeader>
																		<div className="space-y-2 text-sm text-muted-foreground">
																			<StatusLabel status={product.details.status} />
																			<p>
																				<span className="text-foreground font-semibold">Nome:</span>{' '}
																				{product.details.name || 'Não informado'}
																			</p>
																			<p>
																				<span className="text-foreground font-semibold">Modelo:</span>{' '}
																				{product.details.acceptanceModel || 'Não informado'}
																			</p>
																			<p>
																				<span className="text-foreground font-semibold">Idade mínima:</span>{' '}
																				{product.details.ageMin || 'Não informado'}
																			</p>
																			<p>
																				<span className="text-foreground font-semibold">Idade máxima:</span>{' '}
																				{product.details.ageMax || 'Não informado'}
																			</p>
																			<p>
																				<span className="text-foreground font-semibold">Prazo máximo:</span>{' '}
																				{product.details.maxTerm || 'Não informado'}
																			</p>
																			<p>
																				<span className="text-foreground font-semibold">Produto possui DFI?</span>{' '}
																				{yesNo(product.details.dfiEnabled)}
																			</p>
																			<p>
																				<span className="text-foreground font-semibold">Valor DFI:</span>{' '}
																				{product.details.dfiValue || 'Não informado'}
																			</p>
																			<p>
																				<span className="text-foreground font-semibold">Anexo DFI:</span>{' '}
																				{product.details.dfiFile || 'Não informado'}
																			</p>
																			<p>
																				<span className="text-foreground font-semibold">MIP:</span>{' '}
																				{product.details.mipValue || 'Não informado'}
																			</p>
																			<p>
																				<span className="text-foreground font-semibold">Vincular canal atual?</span>{' '}
																				{yesNo(product.details.useCurrentChannel)}
																			</p>
																			{product.details.linkedChannelName || product.details.channelId ? (
																				<p>
																					<span className="text-foreground font-semibold">Canal vinculado:</span>{' '}
																					{product.details.linkedChannelName || product.details.channelId}
																				</p>
																			) : null}
																			<p>
																				<span className="text-foreground font-semibold">Exames padrão:</span>{' '}
																				{product.details.examsStandard || 'Não informado'}
																			</p>
																			<p>
																				<span className="text-foreground font-semibold">Exames adicionais (homens):</span>{' '}
																				{product.details.examsAdditionalMale
																					? product.details.examsAdditionalMaleAge || 'Não informado'
																					: 'Não'}
																			</p>
																			<p>
																				<span className="text-foreground font-semibold">Exames adicionais (mulheres):</span>{' '}
																				{product.details.examsAdditionalFemale
																					? product.details.examsAdditionalFemaleAge || 'Não informado'
																					: 'Não'}
																			</p>
																			<p>
																				<span className="text-foreground font-semibold">Tipo de imóvel:</span>{' '}
																				{[
																					product.details.propertyResidential ? 'Residencial' : null,
																					product.details.propertyCommercial ? 'Comercial' : null,
																					product.details.propertyMixed ? 'Misto' : null,
																				]
																					.filter(Boolean)
																					.join(', ') || 'Não informado'}
																			</p>
																			{product.details.createdAt ? (
																				<p>
																					<span className="text-foreground font-semibold">Criado em:</span>{' '}
																					{formatDateTime(product.details.createdAt)}
																				</p>
																			) : null}
																			{product.details.suspendedAt ? (
																				<p>
																					<span className="text-foreground font-semibold">Suspenso em:</span>{' '}
																					{formatDateTime(product.details.suspendedAt)}
																				</p>
																			) : null}
																			{product.details.inactivatedAt ? (
																				<p>
																					<span className="text-foreground font-semibold">Inativado em:</span>{' '}
																					{formatDateTime(product.details.inactivatedAt)}
																				</p>
																			) : null}
																			{product.details.reactivatedAt ? (
																				<p>
																					<span className="text-foreground font-semibold">Reativado em:</span>{' '}
																					{formatDateTime(product.details.reactivatedAt)}
																				</p>
																			) : null}
																		</div>
																		<div className="pt-3 flex flex-wrap gap-2">
																			{(() => {
																				const status = (product.details.status || 'active').toLowerCase()
																				if (status === 'active') {
																					return (
																						<>
																							<Button variant="secondary" size="sm" onClick={() => updateStatus('product', product.recordIds, 'suspended')}>
																								Suspender
																							</Button>
																							<Button variant="destructive" size="sm" onClick={() => updateStatus('product', product.recordIds, 'inactive')}>
																								Inativar
																							</Button>
																						</>
																					)
																				}
																				if (status === 'suspended') {
																					return (
																						<>
																							<Button size="sm" onClick={() => updateStatus('product', product.recordIds, 'active')}>
																								Ativar
																							</Button>
																							<Button variant="destructive" size="sm" onClick={() => updateStatus('product', product.recordIds, 'inactive')}>
																								Inativar
																							</Button>
																						</>
																					)
																				}
																				return (
																					<>
																						<Button size="sm" onClick={() => updateStatus('product', product.recordIds, 'active')}>
																							Ativar
																						</Button>
																						<Button variant="secondary" size="sm" onClick={() => updateStatus('product', product.recordIds, 'suspended')}>
																							Suspender
																						</Button>
																					</>
																				)
																			})()}
																		</div>
																	</DialogContent>
																</Dialog>
															</div>
														))}
													</div>
												) : (
													<p className="text-xs text-muted-foreground">Nenhum produto vinculado.</p>
												)}
											</div>
										</div>
									))
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

type TreeInsurer = {
	id: string
	name: string
	details: {
		name?: string
		cnpj?: string
		insurerId?: string
		mode?: string
		status?: string
		createdAt?: string
		suspendedAt?: string
		inactivatedAt?: string
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
			status?: string
			createdAt?: string
			suspendedAt?: string
			inactivatedAt?: string
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
				status?: string
				createdAt?: string
				suspendedAt?: string
				inactivatedAt?: string
				reactivatedAt?: string
			}
			recordIds: string[]
		}[]
	}[]
}

function buildTree(records: PartnerMockRecord[]): TreeInsurer[] {
	const insurersMap = new Map<string, TreeInsurer>()

	for (const record of records) {
		const insurerName =
			record.data.channel.linkedInsurerName ||
			record.data.insurer.name ||
			record.data.insurer.selectedLabel ||
			record.data.insurer.insurerId ||
			'Seguradora sem nome'
		const insurerId = insurerName

		if (!insurersMap.has(insurerId)) {
			insurersMap.set(insurerId, {
				id: insurerId,
				name: insurerName,
				details: {
					name: record.data.insurer.name,
					cnpj: record.data.insurer.cnpj,
					insurerId: record.data.insurer.insurerId,
					mode: record.data.insurer.mode,
					status: record.data.insurer.status,
					createdAt: record.data.insurer.createdAt,
					suspendedAt: record.data.insurer.suspendedAt,
					inactivatedAt: record.data.insurer.inactivatedAt,
					reactivatedAt: record.data.insurer.reactivatedAt,
				},
				recordIds: [],
				channels: [],
			})
		}

		const insurer = insurersMap.get(insurerId)!
		if (!insurer.recordIds.includes(record.id)) insurer.recordIds.push(record.id)

		const channelName =
			record.data.product.linkedChannelName ||
			record.data.channel.name ||
			record.data.product.channelId ||
			''
		const channelId = `${insurerId}-${channelName}`

		let channel = channelName ? insurer.channels.find(c => c.id === channelId) : undefined
		if (!channel) {
			if (!channelName) continue
			channel = {
				id: channelId,
				name: channelName,
				details: {
					name: record.data.channel.name,
					cnpj: record.data.channel.cnpj,
					insurerId: record.data.channel.insurerId,
					useCurrentInsurer: record.data.channel.useCurrentInsurer,
					status: record.data.channel.status,
					createdAt: record.data.channel.createdAt,
					suspendedAt: record.data.channel.suspendedAt,
					inactivatedAt: record.data.channel.inactivatedAt,
					reactivatedAt: record.data.channel.reactivatedAt,
				},
				recordIds: [],
				products: [],
			}
			insurer.channels.push(channel)
		}
		if (!channel.recordIds.includes(record.id)) channel.recordIds.push(record.id)

		if (record.data.product?.enabled !== false) {
			const productName = record.data.product.name || 'Produto sem nome'
			const productId = `${channelId}-${productName}`
			if (!channel.products.find(p => p.id === productId)) {
				channel.products.push({
					id: productId,
					name: productName,
					details: {
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
						reactivatedAt: record.data.product.reactivatedAt,
					},
					recordIds: [],
				})
			}
			const product = channel.products.find(p => p.id === productId)!
			if (!product.recordIds.includes(record.id)) product.recordIds.push(record.id)
		}
	}

	return Array.from(insurersMap.values())
}

