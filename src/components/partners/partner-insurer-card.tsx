import { useMemo, useState } from 'react'
import { Building2, Info, Package2, Share2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'

import {
	StatusLabel,
	formatDateTime,
	getCurrentStatus,
	normalizeStatus,
	statusInfo,
	yesNo,
	type StatusValue,
	type TreeInsurer,
} from './partner-list-helpers'

type PartnerInsurerCardProps = {
	insurer: TreeInsurer
	onUpdateStatus: (
		type: 'insurer' | 'channel' | 'product',
		ids: string[],
		newStatus: 'active' | 'suspended' | 'cancelled'
	) => void
}

export default function PartnerInsurerCard({ insurer, onUpdateStatus }: PartnerInsurerCardProps) {
	const insurerStatus = getCurrentStatus(insurer.details)
	const [confirmAction, setConfirmAction] = useState<{
		target: 'insurer' | 'channel' | 'product'
		recordIds: string[]
	}>()
	const [blockMessage, setBlockMessage] = useState<string | null>(null)

	const hasBlockingChannels = useMemo(
		() =>
			insurer.channels.some(
				channel => !['cancelled', 'suspended'].includes(normalizeStatus(channel.details.status))
			),
		[insurer.channels]
	)

	function handleInsurerStatusChange(next: 'active' | 'suspended' | 'cancelled') {
		if (next === 'suspended') {
			if (hasBlockingChannels) {
				setBlockMessage('Não é possível suspender esta seguradora porque existem canais vinculados. Suspenda ou cancele os canais primeiro.')
				return
			}
		}

		if (next === 'cancelled') {
			setConfirmAction({ target: 'insurer', recordIds: insurer.recordIds })
			return
		}

		onUpdateStatus('insurer', insurer.recordIds, next)
	}

	return (
		<div className="rounded-2xl border bg-white p-4 shadow-sm">
			<div className="flex items-center gap-2">
				<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<Building2 className="h-5 w-5" />
				</div>
				<div className="flex flex-col">
					<p className="font-semibold text-base">{insurer.name}</p>
					<p className="text-xs text-muted-foreground">Seguradora</p>
					<p className="text-[11px] text-muted-foreground">Status: {statusInfo(insurerStatus).label}</p>
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
							<StatusLabel status={insurerStatus} />
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
							{insurer.details.cancelledAt || insurer.details.inactivatedAt ? (
								<p>
									<span className="text-foreground font-semibold">Cancelado em:</span>{' '}
									{formatDateTime(insurer.details.cancelledAt || insurer.details.inactivatedAt)}
								</p>
							) : null}
							{insurer.details.reactivatedAt ? (
								<p>
									<span className="text-foreground font-semibold">Reativado em:</span>{' '}
									{formatDateTime(insurer.details.reactivatedAt)}
								</p>
							) : null}
						</div>
						<StatusActions
							status={insurerStatus}
							onChange={handleInsurerStatusChange}
						/>
					</DialogContent>
				</Dialog>
			</div>

			<div className="mt-4 space-y-4 border-l pl-4">
				{insurer.channels.length === 0 ? (
					<p className="text-xs text-muted-foreground">Nenhum canal vinculado.</p>
				) : (
					insurer.channels.map(channel => {
						const channelStatus = getCurrentStatus(channel.details)
						const hasBlockingProducts = channel.products.some(
							product => !['cancelled', 'suspended'].includes(normalizeStatus(product.details.status))
						)
						const handleChannelStatusChange = (next: 'active' | 'suspended' | 'cancelled') => {
							if (next === 'suspended') {
								if (hasBlockingProducts) {
									setBlockMessage('Não é possível suspender este canal porque existem produtos vinculados. Suspenda ou cancele os produtos primeiro.')
									return
								}
							}

							if (next === 'cancelled') {
								setConfirmAction({ target: 'channel', recordIds: channel.recordIds })
								return
							}

							onUpdateStatus('channel', channel.recordIds, next)
						}

						return (
							<div key={channel.id} className="space-y-2">
								<div className="rounded-xl border bg-gray-50 px-3 py-2 inline-flex items-center gap-2">
									<Share2 className="h-4 w-4 text-primary" />
									<div className="flex flex-col">
										<span className="font-medium">{channel.name}</span>
										<span className="text-[11px] text-muted-foreground">
											Status: {statusInfo(channelStatus).label}
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
												<StatusLabel status={channelStatus} />
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
											{channel.details.cancelledAt || channel.details.inactivatedAt ? (
												<p>
													<span className="text-foreground font-semibold">Cancelado em:</span>{' '}
													{formatDateTime(channel.details.cancelledAt || channel.details.inactivatedAt)}
												</p>
											) : null}
												{channel.details.reactivatedAt ? (
													<p>
														<span className="text-foreground font-semibold">Reativado em:</span>{' '}
														{formatDateTime(channel.details.reactivatedAt)}
													</p>
												) : null}
											</div>
											<StatusActions
												status={channelStatus}
												onChange={handleChannelStatusChange}
											/>
										</DialogContent>
									</Dialog>
								</div>

								<div className="pl-2">
									{channel.products.length ? (
										<div className="flex flex-wrap gap-3">
											{channel.products.map(product => {
												const productStatus = getCurrentStatus(product.details)
												const handleProductStatusChange = (next: 'active' | 'suspended' | 'cancelled') => {
													if (next === 'cancelled') {
														setConfirmAction({ target: 'product', recordIds: product.recordIds })
														return
													}
													onUpdateStatus('product', product.recordIds, next)
												}

												return (
													<div
														key={product.id}
														className="rounded-xl border px-3 py-2 bg-white shadow-sm flex items-center gap-2"
													>
														<Package2 className="h-4 w-4 text-primary/70" />
														<div className="flex flex-col leading-tight">
															<span className="font-medium">{product.name}</span>
															<span className="text-[11px] text-muted-foreground">
																Status: {statusInfo(productStatus).label}
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
																	<StatusLabel status={productStatus} />
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
															{product.details.cancelledAt || product.details.inactivatedAt ? (
																<p>
																	<span className="text-foreground font-semibold">Cancelado em:</span>{' '}
																	{formatDateTime(product.details.cancelledAt || product.details.inactivatedAt)}
																</p>
															) : null}
																	{product.details.reactivatedAt ? (
																		<p>
																			<span className="text-foreground font-semibold">Reativado em:</span>{' '}
																			{formatDateTime(product.details.reactivatedAt)}
																		</p>
																	) : null}
																</div>
																<StatusActions
																	status={productStatus}
																	onChange={handleProductStatusChange}
																/>
															</DialogContent>
														</Dialog>
													</div>
												)
											})}
										</div>
									) : (
										<p className="text-xs text-muted-foreground">Nenhum produto vinculado.</p>
									)}
								</div>
							</div>
						)
					})
				)}
			</div>

			<Dialog open={Boolean(confirmAction)} onOpenChange={open => !open && setConfirmAction(undefined)}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Confirmar cancelamento</DialogTitle>
					</DialogHeader>
					<div className="text-sm text-muted-foreground space-y-2">
						<p>
							Tem certeza que deseja cancelar o ativo em questão? Todos os ativos vinculados também serão cancelados
							sem direito a reativação.
						</p>
					</div>
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setConfirmAction(undefined)}>
							Não
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								if (!confirmAction) return
								onUpdateStatus(confirmAction.target, confirmAction.recordIds, 'cancelled')
								setConfirmAction(undefined)
							}}
						>
							Sim, cancelar
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={Boolean(blockMessage)} onOpenChange={open => !open && setBlockMessage(null)}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Não é possível concluir</DialogTitle>
					</DialogHeader>
					<div className="text-sm text-muted-foreground space-y-2">
						<p>{blockMessage}</p>
					</div>
					<div className="flex justify-end">
						<Button onClick={() => setBlockMessage(null)}>Entendi</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}

function StatusActions({
	status,
	onChange,
}: {
	status: StatusValue
	onChange: (next: 'active' | 'suspended' | 'cancelled') => void
}) {
	const isActive = status === 'active' || status === 'reactivated'
	if (status === 'cancelled') return null

	return (
		<div className="pt-3 flex flex-wrap gap-2">
			{isActive ? (
				<>
					<Button
						type="button"
						size="sm"
						variant="secondary"
						aria-pressed={false}
						onClick={() => onChange('suspended')}
					>
						Suspender
					</Button>
					<Button
						type="button"
						size="sm"
						variant="destructive"
						aria-pressed={false}
						onClick={() => onChange('cancelled')}
					>
						Cancelar
					</Button>
				</>
			) : (
				<>
					<Button
						type="button"
						size="sm"
						variant="default"
						aria-pressed={false}
						onClick={() => onChange('active')}
					>
						Reativar
					</Button>
					<Button
						type="button"
						size="sm"
						variant="destructive"
						aria-pressed={false}
						onClick={() => onChange('cancelled')}
					>
						Cancelar
					</Button>
				</>
			)}
		</div>
	)
}
