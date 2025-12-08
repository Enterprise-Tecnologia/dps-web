'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
	defaultPartnerFormValues,
	partnerFormSchema,
	type PartnerFormValues,
} from './partner-form-schema'
import {
	isActiveStatus,
	mergeUniqueOptions,
	mockChannels,
	mockInsurers,
	normalizeCnpj,
	type Option,
} from './partner-form-helpers'
import InsurerSection from './sections/insurer-section'
import ChannelSection from './sections/channel-section'
import ProductSection from './sections/product-section'

export default function PartnerForm() {
	const router = useRouter()
	const [errorFields, setErrorFields] = useState<Set<string>>(new Set())
	const [submitMessage, setSubmitMessage] = useState<string | null>(null)
	const [savedInsurers, setSavedInsurers] = useState<Option[]>([])
	const [savedChannels, setSavedChannels] = useState<Option[]>([])
	const [showOverlay, setShowOverlay] = useState(false)

	const {
		control,
		handleSubmit,
		watch,
		setValue,
		reset,
		clearErrors,
		formState: { isSubmitting },
	} = useForm<PartnerFormValues>({
		resolver: valibotResolver(partnerFormSchema),
		defaultValues: defaultPartnerFormValues,
	})

	useEffect(() => {
		if (typeof window === 'undefined') return
		try {
			const fromSummary = sessionStorage.getItem('partnerSummaryFromSummary') === '1'
			const stored = sessionStorage.getItem('partnerSummary')
			if (fromSummary && stored) {
				const parsed = JSON.parse(stored) as PartnerFormValues
				reset(parsed)
				setSubmitMessage(null)
				setErrorFields(new Set())
			}
			sessionStorage.removeItem('partnerSummaryFromSummary')
			sessionStorage.removeItem('partnerSummary')
		} catch (err) {
			console.error('Erro ao restaurar dados do resumo', err)
		}
	}, [reset])

	useEffect(() => {
		let active = true
		const loadOptions = async () => {
			try {
				const res = await fetch('/api/partners/options', { cache: 'no-store' })
				if (!res.ok) throw new Error(`Falha ao carregar referências (${res.status}).`)
				const json = (await res.json()) as { insurers?: Option[]; channels?: Option[] }
				if (active) {
					if (json.insurers) setSavedInsurers(json.insurers)
					if (json.channels) setSavedChannels(json.channels)
				}
			} catch (err) {
				console.error('Erro ao carregar referências do Supabase', err)
			}
		}
		loadOptions()
		return () => {
			active = false
		}
	}, [])

	const channelEnabled = watch('channel.enabled')
	const productEnabled = watch('product.enabled')
	const insurerMode = watch('insurer.mode')
	const channelUseCurrentValue = watch('channel.useCurrentInsurer')
	const productUseCurrentValue = watch('product.useCurrentChannel')
	const productDfiEnabled = watch('product.dfiEnabled') === 'yes'
	const productDfiFile = watch('product.dfiFile')
	const insurerCnpjValue = watch('insurer.cnpj')
	const channelCnpjValue = watch('channel.cnpj')
	const useCurrentInsurer = channelUseCurrentValue === 'yes'
	const useCurrentChannel = productUseCurrentValue === 'yes'
	const lockInsurerToCurrent = insurerMode === 'new' || insurerMode === 'select'
	const canUseCurrentInsurer = insurerMode !== 'skip'
	const lockChannelToCurrent = channelEnabled
	const canUseCurrentChannel = channelEnabled

	const insurerCnpjDuplicate = useMemo(() => {
		if (insurerMode !== 'new') return false
		const normalized = normalizeCnpj(insurerCnpjValue)
		if (normalized.length !== 14) return false
		return savedInsurers.some(
			opt => normalizeCnpj(opt.cnpj) === normalized || normalizeCnpj(opt.value) === normalized
		)
	}, [insurerCnpjValue, insurerMode, savedInsurers])

	const channelCnpjDuplicate = useMemo(() => {
		if (!channelEnabled) return false
		const normalized = normalizeCnpj(channelCnpjValue)
		if (normalized.length !== 14) return false
		return savedChannels.some(
			opt => normalizeCnpj(opt.cnpj) === normalized || normalizeCnpj(opt.value) === normalized
		)
	}, [channelCnpjValue, channelEnabled, savedChannels])

	const invalidFields = useMemo(() => {
		const merged = new Set(errorFields)
		if (insurerCnpjDuplicate) merged.add('insurer.cnpj')
		if (channelCnpjDuplicate) merged.add('channel.cnpj')
		return merged
	}, [channelCnpjDuplicate, errorFields, insurerCnpjDuplicate])

	const insurerOptions = useMemo(() => mergeUniqueOptions(savedInsurers, mockInsurers), [savedInsurers])
	const selectedInsurerId = watch('insurer.insurerId')
	const channelOptions = useMemo(() => {
		const merged = mergeUniqueOptions(savedChannels, mockChannels)
		const insurerFilter = normalizeCnpj(selectedInsurerId) || selectedInsurerId || ''
		if (!insurerFilter) return merged
		return merged.filter(opt => {
			const optInsurer = normalizeCnpj(opt.insurerId) || opt.insurerId || ''
			return optInsurer === insurerFilter
		})
	}, [savedChannels, selectedInsurerId])

	useEffect(() => {
		if (lockInsurerToCurrent && !useCurrentInsurer) {
			setValue('channel.useCurrentInsurer', 'yes')
		}
		if (!canUseCurrentInsurer && useCurrentInsurer) {
			setValue('channel.useCurrentInsurer', 'no')
		}
	}, [canUseCurrentInsurer, useCurrentInsurer, lockInsurerToCurrent, setValue])

	useEffect(() => {
		if (lockChannelToCurrent && !useCurrentChannel) {
			setValue('product.useCurrentChannel', 'yes')
		}
		if (!canUseCurrentChannel && useCurrentChannel) {
			setValue('product.useCurrentChannel', 'no')
		}
	}, [canUseCurrentChannel, lockChannelToCurrent, useCurrentChannel, setValue])

	useEffect(() => {
		if (!productDfiEnabled) {
			setValue('product.dfiValue', '')
		}
	}, [productDfiEnabled, setValue])

	function handleInsurerModeChange(value: 'new' | 'select' | 'skip') {
		setValue('insurer.mode', value)

		if (value !== 'new') {
			setValue('insurer.cnpj', '')
			setValue('insurer.name', '')
		}

		if (value !== 'select') {
			setValue('insurer.insurerId', '')
		}

		if (value === 'skip') {
			setValue('channel.useCurrentInsurer', 'no')
		} else {
			setValue('channel.useCurrentInsurer', 'yes')
			setValue('channel.insurerId', '')
		}

		setValue('insurer.selectedLabel', '')
	}

	function handleReset() {
		clearErrors()
		setErrorFields(new Set())
		setSubmitMessage(null)
		reset(defaultPartnerFormValues)
	}

	async function onSubmit(data: PartnerFormValues) {
		setShowOverlay(true)
		try {
			const errors: string[] = []
			const errorPaths: string[] = []
			const somethingEnabled = data.insurer.mode !== 'skip' || data.channel.enabled || data.product.enabled

			if (!somethingEnabled) {
				errors.push('Cadastre ao menos seguradora, canal ou produto.')
				errorPaths.push('global.noneEnabled')
			}

			if (!data.insurer.mode) {
				errors.push('Escolha uma opcao de seguradora.')
				errorPaths.push('insurer.mode')
			}
			if (data.insurer.mode === 'new') {
				if (!data.insurer.cnpj) {
					errors.push('CNPJ da seguradora e obrigatorio.')
					errorPaths.push('insurer.cnpj')
				}
				if (!data.insurer.name) {
					errors.push('Nome/Razao social da seguradora e obrigatorio.')
					errorPaths.push('insurer.name')
				}
			}
			if (data.insurer.mode === 'select' && !data.insurer.insurerId) {
				errors.push('Selecione uma seguradora na lista.')
				errorPaths.push('insurer.insurerId')
			}
			if (data.insurer.mode === 'new' && data.insurer.cnpj) {
				const normalized = normalizeCnpj(data.insurer.cnpj)
				const exists = savedInsurers.some(
					opt => normalizeCnpj(opt.cnpj) === normalized || normalizeCnpj(opt.value) === normalized
				)
				if (exists) {
					errors.push('CNPJ digitado já está cadastrado.')
					errorPaths.push('insurer.cnpj')
				}
			}

			if (data.channel.enabled && !data.channel.cnpj) {
				errors.push('CNPJ do canal e obrigatorio.')
				errorPaths.push('channel.cnpj')
			}
			if (data.channel.enabled && !data.channel.name) {
				errors.push('Nome do canal e obrigatorio.')
				errorPaths.push('channel.name')
			}
			if (data.channel.enabled && data.channel.useCurrentInsurer === 'no' && !data.channel.insurerId) {
				errors.push('Selecione uma seguradora para o canal.')
				errorPaths.push('channel.insurerId')
			}
			if (data.channel.enabled && data.channel.cnpj) {
				const normalized = normalizeCnpj(data.channel.cnpj)
				const exists = savedChannels.some(
					opt => normalizeCnpj(opt.cnpj) === normalized || normalizeCnpj(opt.value) === normalized
				)
				if (exists) {
					errors.push('CNPJ digitado já está cadastrado.')
					errorPaths.push('channel.cnpj')
				}
			}

			if (data.product.enabled) {
				if (!data.product.name) {
					errors.push('Nome do produto e obrigatorio.')
					errorPaths.push('product.name')
				}
				if (data.product.useCurrentChannel === 'no' && !data.product.channelId) {
					errors.push('Selecione um canal para o produto.')
					errorPaths.push('product.channelId')
				}
				if (!data.product.ageMin) {
					errors.push('Idade minima e obrigatoria.')
					errorPaths.push('product.ageMin')
				}
				if (!data.product.ageMax) {
					errors.push('Idade maxima e obrigatoria.')
					errorPaths.push('product.ageMax')
				}
				if (!data.product.maxTerm) {
					errors.push('Prazo maximo e obrigatorio.')
					errorPaths.push('product.maxTerm')
				}
				if (!data.product.dfiEnabled) {
					errors.push('Informe se o produto possui DFI.')
					errorPaths.push('product.dfiEnabled')
				} else if (data.product.dfiEnabled === 'yes') {
					if (!data.product.dfiValue) {
						errors.push('Valor DFI e obrigatorio.')
						errorPaths.push('product.dfiValue')
					}
					if (!data.product.mipValue) {
						errors.push('Valor MIP e obrigatorio.')
						errorPaths.push('product.mipValue')
					}
					if (!data.product.dfiFile) {
						errors.push('Anexo do DFI e obrigatorio.')
						errorPaths.push('product.dfiFile')
					}
				} else if (!data.product.mipValue) {
					errors.push('Valor MIP e obrigatorio.')
					errorPaths.push('product.mipValue')
				}
				if (data.product.examsAdditionalMale && !data.product.examsAdditionalMaleAge) {
					errors.push('Idade limite para exames adicionais de homens e obrigatoria.')
					errorPaths.push('product.examsAdditionalMaleAge')
				}
				if (data.product.examsAdditionalFemale && !data.product.examsAdditionalFemaleAge) {
					errors.push('Idade limite para exames adicionais de mulheres e obrigatoria.')
					errorPaths.push('product.examsAdditionalFemaleAge')
				}
				if (!data.product.propertyResidential && !data.product.propertyCommercial && !data.product.propertyMixed) {
					errors.push('Selecione ao menos um tipo de imovel.')
					errorPaths.push('product.property')
				}
			}

			if (errors.length) {
				setErrorFields(new Set(errorPaths))
				const duplicateError = errors.find(err => err.startsWith('CNPJ digitado'))
				setSubmitMessage(
					errors.includes('Cadastre ao menos seguradora, canal ou produto.')
						? 'Selecione pelo menos uma das secoes (Seguradora, Canal ou Produto) para cadastrar.'
						: duplicateError || 'Os campos marcados sao de preenchimento obrigatorio.'
				)
				return
			}

			const insurerSelected = data.insurer.insurerId
				? insurerOptions.find(option => option.value === data.insurer.insurerId)
				: undefined
			const insurerSelectedLabel = insurerSelected?.label ?? data.insurer.insurerId ?? ''
			const insurerSelectedCnpj = insurerSelected?.cnpj ?? ''

			const channelSelectedInsurer = data.channel.insurerId
				? insurerOptions.find(option => option.value === data.channel.insurerId)
				: undefined
			const channelSelectedInsurerLabel = channelSelectedInsurer?.label ?? data.channel.insurerId ?? ''
			const channelSelectedInsurerCnpj = channelSelectedInsurer?.cnpj ?? ''

			const productSelectedChannel = data.product.channelId
				? channelOptions.find(option => option.value === data.product.channelId)
				: undefined
			const productSelectedChannelLabel = productSelectedChannel?.label ?? data.product.channelId ?? ''
			const productSelectedChannelCnpj =
				normalizeCnpj(productSelectedChannel?.cnpj) ||
				normalizeCnpj(productSelectedChannel?.value ?? '') ||
				normalizeCnpj(data.product.channelId) ||
				productSelectedChannel?.cnpj ||
				''

			const currentInsurerName = data.insurer.mode === 'new' ? data.insurer.name ?? '' : insurerSelectedLabel
			const currentInsurerCnpj =
				data.insurer.mode === 'new'
					? normalizeCnpj(data.insurer.cnpj) || data.insurer.cnpj || ''
					: normalizeCnpj(insurerSelectedCnpj) || insurerSelectedCnpj
			const currentChannelName = data.channel.name ?? ''
			const currentChannelCnpj = normalizeCnpj(data.channel.cnpj) || data.channel.cnpj || ''
			const now = new Date().toISOString()

			const payload: PartnerFormValues = {
				...data,
				insurer: {
					...data.insurer,
					selectedLabel: insurerSelectedLabel,
					insurerCnpj: currentInsurerCnpj,
					insurerId:
						data.insurer.mode === 'new'
							? ''
							: normalizeCnpj(insurerSelectedCnpj) || insurerSelectedCnpj || insurerSelectedLabel,
					status: data.insurer.mode === 'new' ? data.insurer.status || 'active' : '',
					createdAt: data.insurer.mode === 'new' ? data.insurer.createdAt || now : '',
					cnpj: data.insurer.mode === 'new' ? data.insurer.cnpj : '',
					name: data.insurer.mode === 'new' ? data.insurer.name : '',
					suspendedAt: data.insurer.mode === 'new' ? data.insurer.suspendedAt : '',
					cancelledAt: data.insurer.mode === 'new' ? data.insurer.cancelledAt : '',
					reactivatedAt: data.insurer.mode === 'new' ? data.insurer.reactivatedAt : '',
				},
				channel: data.channel.enabled
					? {
							...data.channel,
							linkedInsurerName: data.channel.useCurrentInsurer === 'yes' ? currentInsurerName : channelSelectedInsurerLabel,
							linkedInsurerId:
								data.channel.useCurrentInsurer === 'yes'
									? normalizeCnpj(currentInsurerCnpj) || currentInsurerCnpj || currentInsurerName
									: normalizeCnpj(channelSelectedInsurerCnpj) || channelSelectedInsurerCnpj || data.channel.insurerId || '',
							insurerId:
								data.channel.useCurrentInsurer === 'yes'
									? normalizeCnpj(currentInsurerCnpj) || currentInsurerCnpj || currentInsurerName
									: normalizeCnpj(channelSelectedInsurerCnpj) || channelSelectedInsurerCnpj || data.channel.insurerId || '',
							insurerCnpj:
								data.channel.useCurrentInsurer === 'yes'
									? normalizeCnpj(currentInsurerCnpj) || currentInsurerCnpj
									: normalizeCnpj(channelSelectedInsurerCnpj) || channelSelectedInsurerCnpj,
							status: data.channel.status || 'active',
							createdAt: data.channel.createdAt || now,
					  }
					: {
							...data.channel,
							linkedInsurerName: '',
							linkedInsurerId: '',
							insurerId: '',
							insurerCnpj: '',
							cnpj: '',
							name: '',
							status: '',
							createdAt: '',
							suspendedAt: '',
							cancelledAt: '',
							reactivatedAt: '',
					  },
				product: data.product.enabled
					? {
							...data.product,
							linkedChannelName: data.product.useCurrentChannel === 'yes' ? currentChannelName : productSelectedChannelLabel,
							linkedChannelId:
								data.product.useCurrentChannel === 'yes'
									? normalizeCnpj(currentChannelCnpj) || currentChannelCnpj || currentChannelName
									: productSelectedChannelCnpj || data.product.channelId || '',
							channelId:
								data.product.useCurrentChannel === 'yes'
									? normalizeCnpj(currentChannelCnpj) || currentChannelCnpj || currentChannelName
									: productSelectedChannelCnpj || data.product.channelId || '',
							channelCnpj:
								data.product.useCurrentChannel === 'yes'
									? normalizeCnpj(currentChannelCnpj) || currentChannelCnpj
									: productSelectedChannelCnpj,
							status: data.product.status || 'active',
							createdAt: data.product.createdAt || now,
					  }
					: {
							...data.product,
							linkedChannelName: '',
							linkedChannelId: '',
							channelCnpj: '',
							channelId: '',
							name: '',
							status: '',
							createdAt: '',
							suspendedAt: '',
							cancelledAt: '',
							reactivatedAt: '',
							ageMin: '',
							ageMax: '',
							maxTerm: '',
							dfiEnabled: 'no',
							dfiValue: '',
							dfiFile: '',
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
			}

			setErrorFields(new Set())
			setSubmitMessage(null)

			try {
				sessionStorage.setItem('partnerSummary', JSON.stringify(payload))
				router.push('/partners/summary')
			} catch (err) {
				console.error('Erro ao salvar rascunho local', err)
				setSubmitMessage('Ocorreu um erro ao preparar o resumo. Tente novamente.')
			}
		} catch (err) {
			console.error('Erro ao processar envio do parceiro', err)
			setSubmitMessage('Ocorreu um erro ao processar o cadastro. Tente novamente.')
		} finally {
			setShowOverlay(false)
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
			<Accordion type="multiple" defaultValue={['insurer', 'channel', 'product']}>
				<AccordionItem value="insurer" className="border-none mb-3">
					<AccordionTrigger className="rounded-2xl bg-white px-4 py-3 border text-base font-semibold text-primary shadow-sm hover:no-underline">
						<span>Dados da Seguradora</span>
					</AccordionTrigger>
					<AccordionContent className="mt-2">
						<InsurerSection
							control={control}
							insurerMode={insurerMode}
							insurerOptions={insurerOptions}
							onModeChange={handleInsurerModeChange}
							invalidFields={invalidFields}
							duplicateCnpjMessage={insurerCnpjDuplicate ? 'CNPJ digitado já está cadastrado.' : undefined}
						/>
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="channel" className="border-none mb-3">
					<AccordionTrigger className="rounded-2xl bg-white px-4 py-3 border text-base font-semibold text-primary shadow-sm hover:no-underline">
						<span>Dados do Canal</span>
					</AccordionTrigger>
					<AccordionContent className="mt-2">
						<ChannelSection
							control={control}
							channelEnabled={channelEnabled}
							useCurrentInsurer={useCurrentInsurer}
							canUseCurrentInsurer={canUseCurrentInsurer}
							lockUseCurrentInsurer={lockInsurerToCurrent}
							insurerOptions={insurerOptions}
							onToggleEnabled={enabled => setValue('channel.enabled', enabled)}
							onChangeUseCurrentInsurer={value => setValue('channel.useCurrentInsurer', value)}
							invalidFields={invalidFields}
							duplicateCnpjMessage={channelCnpjDuplicate ? 'CNPJ digitado já está cadastrado.' : undefined}
						/>
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="product" className="border-none">
					<AccordionTrigger className="rounded-2xl bg-white px-4 py-3 border text-base font-semibold text-primary shadow-sm hover:no-underline">
						<span>Dados do Produto</span>
					</AccordionTrigger>
					<AccordionContent className="mt-2">
						<ProductSection
							control={control}
							productEnabled={productEnabled}
							useCurrentChannel={useCurrentChannel}
							canUseCurrentChannel={canUseCurrentChannel}
							lockUseCurrentChannel={lockChannelToCurrent}
							channelOptions={channelOptions}
							dfiEnabled={productDfiEnabled}
							dfiFile={productDfiFile}
							onToggleEnabled={enabled => setValue('product.enabled', enabled)}
							onChangeUseCurrentChannel={value => setValue('product.useCurrentChannel', value)}
							onChangeDfiEnabled={value => setValue('product.dfiEnabled', value)}
							invalidFields={invalidFields}
						/>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			{submitMessage ? (
				<div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
					{submitMessage}
				</div>
			) : null}

			<div className="flex flex-wrap gap-3 justify-end">
				<Button type="button" variant="outline" onClick={handleReset}>
					Limpar dados
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Salvando...' : 'Salvar cadastro'}
				</Button>
			</div>

			{showOverlay ? (
				<div className="absolute inset-0 z-10 rounded-2xl bg-white/70 backdrop-blur-sm flex items-center justify-center">
					<div className="flex items-center gap-2 text-sm font-medium text-primary">
						<span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						Processando...
					</div>
				</div>
			) : null}
		</form>
	)
}
