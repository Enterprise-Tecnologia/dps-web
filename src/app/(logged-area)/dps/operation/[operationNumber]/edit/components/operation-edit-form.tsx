'use client'

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

import { Button } from '@/components/ui/button'
import { GoBackButton } from '@/components/ui/go-back-button'
import { Input } from '@/components/ui/input'
import SelectComp from '@/components/ui/select-comp'
import ShareLine from '@/components/ui/share-line'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { putProposalOperationUpdate } from '../../../../actions'
import { formatCpf } from '@/lib/utils'

type Option = { value: string; label: string }

type OperationEditValues = {
	productId: string
	deadlineMonths: string
	propertyTypeId: string
	operationValue: string
	totalParticipantsExpected: string
	salesChannelUid: string
}

export default function OperationEditForm({
	operationNumber,
	principalUid,
	initialOperation,
	productOptions,
	propertyTypeOptions,
	participantsCount,
	hasAnySigned,
	participants,
}: {
	operationNumber: string
	principalUid: string
	initialOperation: {
		productId: string
		deadlineMonths?: number
		propertyTypeId?: number
		operationValue?: number
		totalParticipantsExpected?: number
		salesChannelUid?: string
	}
	productOptions: Option[]
	propertyTypeOptions: Option[]
	participantsCount: number
	hasAnySigned: boolean
	participants: Array<{
		uid?: string
		participantType?: 'P' | 'C' | string
		name?: string
		document?: string
		percentageParticipation?: number
		capitalMIP?: number
		capitalDFI?: number
		statusId?: number
		statusDescription?: string
		dfiStatusId?: number
		dfiStatusDescription?: string
	}>
}) {
	const router = useRouter()
	const session = useSession()

	const [submitError, setSubmitError] = React.useState<string | null>(null)
	const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null)

	const formatMoneyBRL = React.useCallback((value?: number | null) => {
		if (value == null || Number.isNaN(Number(value))) return '-'
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		}).format(Number(value))
	}, [])

	const formatPercent = React.useCallback((value?: number | null) => {
		if (value == null || Number.isNaN(Number(value))) return '-'
		return `${Number(value).toLocaleString('pt-BR', {
			maximumFractionDigits: 2,
		})}%`
	}, [])

	const totals = React.useMemo(() => {
		const mip = participants.reduce(
			(acc, p) => acc + (Number(p.capitalMIP) || 0),
			0
		)
		const dfi = participants.reduce(
			(acc, p) => acc + (Number(p.capitalDFI) || 0),
			0
		)
		return { mip, dfi }
	}, [participants])

	const channelOptions = React.useMemo(() => {
		const s: any = session.data
		const last = s?.lastChannel ? [{ uid: s.lastChannel.uid, name: s.lastChannel.name }] : []
		const rest = Array.isArray(s?.channels) ? s.channels : []

		const merged = [...last, ...rest].filter(Boolean)
		const unique = new Map<string, string>()
		for (const c of merged) {
			if (c?.uid && !unique.has(c.uid)) unique.set(c.uid, c.name ?? c.uid)
		}
		return Array.from(unique.entries()).map(([value, label]) => ({ value, label }))
	}, [session.data])

	const defaultSalesChannelUid =
		initialOperation.salesChannelUid ||
		((session.data as any)?.lastChannel?.uid as string | undefined) ||
		''

	const form = useForm<OperationEditValues>({
		defaultValues: {
			productId: initialOperation.productId ?? '',
			deadlineMonths:
				initialOperation.deadlineMonths != null ? String(initialOperation.deadlineMonths) : '',
			propertyTypeId:
				initialOperation.propertyTypeId != null ? String(initialOperation.propertyTypeId) : '',
			operationValue:
				initialOperation.operationValue != null ? String(initialOperation.operationValue) : '',
			totalParticipantsExpected:
				initialOperation.totalParticipantsExpected != null
					? String(initialOperation.totalParticipantsExpected)
					: '',
			salesChannelUid: defaultSalesChannelUid,
		},
	})

	async function onSubmit(values: OperationEditValues) {
		setSubmitError(null)
		setSubmitSuccess(null)

		if (hasAnySigned) {
			setSubmitError('Não é possível editar a operação: existe participante com DPS assinada.')
			return
		}

		const token = (session.data as any)?.accessToken as string | undefined
		if (!token) {
			router.push('/logout')
			return
		}

		const deadlineMonths = Number(values.deadlineMonths)
		const propertyTypeId = Number(values.propertyTypeId)
		const operationValue = Number(values.operationValue)
		const totalParticipantsExpected = Number(values.totalParticipantsExpected)

		if (!Number.isFinite(deadlineMonths) || deadlineMonths <= 0) {
			setSubmitError('Prazo inválido.')
			return
		}
		if (!Number.isFinite(propertyTypeId) || propertyTypeId <= 0) {
			setSubmitError('Tipo de imóvel inválido.')
			return
		}
		if (!Number.isFinite(operationValue) || operationValue <= 0) {
			setSubmitError('Valor da operação inválido.')
			return
		}
		if (
			!Number.isFinite(totalParticipantsExpected) ||
			totalParticipantsExpected < 1 ||
			totalParticipantsExpected > 200
		) {
			setSubmitError('Número de participantes inválido (1 a 200).')
			return
		}
		if (!values.productId) {
			setSubmitError('Produto é obrigatório.')
			return
		}

		const payload = {
			...(values.salesChannelUid ? { salesChannelUid: values.salesChannelUid } : {}),
			totalParticipantsExpected,
			productId: values.productId,
			typeId: 2,
			deadlineId: null as number | null,
			deadlineMonths,
			propertyTypeId,
			operationValue,
		}

		const response = await putProposalOperationUpdate(token, operationNumber, payload)
		if (!response) {
			setSubmitError('Não foi possível salvar. Tente novamente.')
			return
		}

		if (response.success === false) {
			setSubmitError(response.message || 'Erro ao salvar a operação.')
			return
		}

		setSubmitSuccess('Operação atualizada com sucesso.')
		router.push(`/dps/details/${principalUid}`)
		router.refresh()
	}

	return (
		<div className="flex flex-col gap-5 p-5">
			<div className="px-5 py-7 w-full max-w-7xl mx-auto bg-white rounded-3xl shadow-sm">
				<div className="w-full flex justify-between items-center">
					<GoBackButton>Voltar</GoBackButton>
					<div className="text-sm text-muted-foreground font-mono">
						{operationNumber}
					</div>
				</div>

				<div className="mx-5 mt-6">
					<h2 className="text-primary text-xl font-semibold">Editar operação</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Atualiza atributos comuns para {participantsCount} participantes.
					</p>
					<div className="mt-3 text-sm text-muted-foreground">
						<span className="mr-4">
							Total MIP (soma): <span className="font-medium text-foreground">{formatMoneyBRL(totals.mip)}</span>
						</span>
						<span>
							Total DFI (soma): <span className="font-medium text-foreground">{formatMoneyBRL(totals.dfi)}</span>
						</span>
					</div>

					{hasAnySigned && (
						<Alert className="mt-4" variant="destructive">
							<AlertDescription>
								Existe participante com DPS assinada (status 21). Edição bloqueada.
							</AlertDescription>
						</Alert>
					)}
					{submitError && (
						<Alert className="mt-4" variant="destructive">
							<AlertDescription>{submitError}</AlertDescription>
						</Alert>
					)}
					{submitSuccess && (
						<Alert className="mt-4">
							<AlertDescription>{submitSuccess}</AlertDescription>
						</Alert>
					)}
				</div>
			</div>

			<div className="px-5 py-7 w-full max-w-7xl mx-auto bg-white rounded-3xl shadow-sm">
				<div className="mx-5 mt-2">
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className={hasAnySigned ? 'opacity-60 pointer-events-none' : ''}
					>
						<div className="flex flex-col gap-6">
							<ShareLine>
								<Controller
									control={form.control}
									name="productId"
									render={({ field: { onChange, value } }) => (
										<label className="w-full">
											<div className="text-gray-500">Produto</div>
											<SelectComp
												placeholder="Selecione"
												options={productOptions}
												onValueChange={onChange}
												value={value}
											/>
										</label>
									)}
								/>

								<Controller
									control={form.control}
									name="salesChannelUid"
									render={({ field: { onChange, value } }) => (
										<label className="w-full">
											<div className="text-gray-500">Canal de venda</div>
											<SelectComp
												placeholder="Selecione"
												options={channelOptions}
												onValueChange={onChange}
												value={value}
												allowClear
											/>
										</label>
									)}
								/>
							</ShareLine>

							<ShareLine>
								<label className="w-full">
									<div className="text-gray-500">Prazo (meses)</div>
									<Input
										placeholder="Ex: 60"
										{...form.register('deadlineMonths')}
									/>
								</label>

								<Controller
									control={form.control}
									name="propertyTypeId"
									render={({ field: { onChange, value } }) => (
										<label className="w-full">
											<div className="text-gray-500">Tipo de imóvel</div>
											<SelectComp
												placeholder="Selecione"
												options={propertyTypeOptions}
												onValueChange={onChange}
												value={value}
											/>
										</label>
									)}
								/>
							</ShareLine>

							<ShareLine>
								<label className="w-full">
									<div className="text-gray-500">Valor da operação</div>
									<Input
										placeholder="Ex: 350000"
										{...form.register('operationValue')}
									/>
								</label>

								<label className="w-full">
									<div className="text-gray-500">Total de participantes</div>
									<Input
										placeholder="Ex: 2"
										{...form.register('totalParticipantsExpected')}
									/>
								</label>
							</ShareLine>

							<div className="flex gap-2 justify-end">
								<Button
									type="button"
									variant="outline"
									onClick={() => router.back()}
								>
									Cancelar
								</Button>
								<Button type="submit" disabled={form.formState.isSubmitting}>
									Salvar
								</Button>
							</div>
						</div>
					</form>
				</div>
			</div>

			<div className="px-5 py-7 w-full max-w-7xl mx-auto bg-white rounded-3xl shadow-sm">
				<div className="mx-5 mt-2">
					<h3 className="text-primary text-lg font-semibold">Participantes</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Dados exibidos para conferência (a atualização continua sendo por operação).
					</p>

					<div className="mt-4 flex flex-col gap-3">
						{participants.map(p => (
							<div
								key={p.uid ?? `${p.document ?? ''}-${p.participantType ?? ''}-${p.name ?? ''}`}
								className="rounded-2xl border border-gray-200 p-4"
							>
								<div className="flex flex-col gap-1">
									<div className="flex flex-wrap items-center justify-between gap-2">
										<div className="font-medium">
											{p.name ?? '-'}{' '}
											<span className="text-xs text-muted-foreground">
												({p.participantType === 'P' ? 'Principal' : 'Coparticipante'})
											</span>
										</div>
										<div className="text-xs text-muted-foreground">
											Status: {p.statusDescription ?? '-'}
										</div>
									</div>
									<div className="text-sm text-muted-foreground">
										CPF: {formatCpf(p.document) || '-'}
									</div>
								</div>

								<div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
									<div className="rounded-lg bg-gray-50 p-3">
										<div className="text-xs text-muted-foreground">Participação</div>
										<div className="font-medium">{formatPercent(p.percentageParticipation)}</div>
									</div>
									<div className="rounded-lg bg-gray-50 p-3">
										<div className="text-xs text-muted-foreground">Capital MIP</div>
										<div className="font-medium">{formatMoneyBRL(p.capitalMIP)}</div>
									</div>
									<div className="rounded-lg bg-gray-50 p-3">
										<div className="text-xs text-muted-foreground">Capital DFI</div>
										<div className="font-medium">{formatMoneyBRL(p.capitalDFI)}</div>
										{p.participantType === 'P' ? (
											<div className="text-xs text-muted-foreground mt-1">
												Situação DFI: {p.dfiStatusDescription ?? '-'}
											</div>
										) : (
											<div className="text-xs text-muted-foreground mt-1">Situação DFI: -</div>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

