'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import {
	boolean,
	literal,
	union,
	object,
	string,
	InferInput,
	optional,
} from 'valibot'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import type { PartnerMockRecord } from './types'
import InsurerSection from './sections/insurer-section'
import ChannelSection from './sections/channel-section'
import ProductSection from './sections/product-section'

const partnerFormSchema = object({
	insurer: object({
		mode: union([literal('new'), literal('select'), literal('skip')]),
		cnpj: optional(string()),
		name: optional(string()),
		insurerId: optional(string()),
		selectedLabel: optional(string()),
		status: optional(string()),
		createdAt: optional(string()),
		suspendedAt: optional(string()),
		inactivatedAt: optional(string()),
		reactivatedAt: optional(string()),
	}),
	channel: object({
		enabled: boolean(),
		useCurrentInsurer: union([literal('yes'), literal('no')]),
		cnpj: optional(string()),
		name: optional(string()),
		insurerId: optional(string()),
		linkedInsurerName: optional(string()),
		linkedInsurerId: optional(string()),
		status: optional(string()),
		createdAt: optional(string()),
		suspendedAt: optional(string()),
		inactivatedAt: optional(string()),
		reactivatedAt: optional(string()),
	}),
	product: object({
		enabled: boolean(),
		useCurrentChannel: union([literal('yes'), literal('no')]),
		name: optional(string()),
		channelId: optional(string()),
		linkedChannelName: optional(string()),
		linkedChannelId: optional(string()),
		status: optional(string()),
		createdAt: optional(string()),
		suspendedAt: optional(string()),
		inactivatedAt: optional(string()),
		reactivatedAt: optional(string()),
		dfiFile: optional(string()),
		acceptanceModel: union([literal('simplified'), literal('complete')]),
		ageMin: optional(string()),
		ageMax: optional(string()),
		maxTerm: optional(string()),
		dfiEnabled: union([literal('yes'), literal('no')]),
		dfiValue: optional(string()),
		mipValue: optional(string()),
		examsStandard: optional(string()),
		examsAdditionalMale: boolean(),
		examsAdditionalFemale: boolean(),
		examsAdditionalMaleAge: optional(string()),
		examsAdditionalFemaleAge: optional(string()),
		propertyResidential: boolean(),
		propertyCommercial: boolean(),
		propertyMixed: boolean(),
	}),
})

export type PartnerFormValues = InferInput<typeof partnerFormSchema>

const mockInsurers = [
	{ value: 'seg-1', label: 'Seguradora Aurora' },
	{ value: 'seg-2', label: 'Seguradora Horizonte' },
]

const mockChannels = [
	{ value: 'can-1', label: 'Canal Prime' },
	{ value: 'can-2', label: 'Canal Digital' },
]

function mergeUniqueOptions(
	saved: { value: string; label: string }[],
	mocked: { value: string; label: string }[]
) {
	const map = new Map<string, string>()
	;[...saved, ...mocked].forEach(opt => {
		if (!map.has(opt.value)) map.set(opt.value, opt.label)
	})
	return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
}

export default function PartnerForm() {
	const router = useRouter()
	const [errorFields, setErrorFields] = useState<Set<string>>(new Set())
	const [submitMessage, setSubmitMessage] = useState<string | null>(null)
	const [savedInsurers, setSavedInsurers] = useState<{ value: string; label: string }[]>([])
	const [savedChannels, setSavedChannels] = useState<{ value: string; label: string }[]>([])

	const defaultValues: PartnerFormValues = {
		insurer: {
			mode: 'new',
			cnpj: '',
			name: '',
			insurerId: '',
			selectedLabel: '',
			status: '',
			createdAt: '',
			suspendedAt: '',
			inactivatedAt: '',
			reactivatedAt: '',
		},
		channel: {
			enabled: true,
			useCurrentInsurer: 'yes',
			cnpj: '',
			name: '',
			insurerId: '',
			linkedInsurerName: '',
			linkedInsurerId: '',
			status: '',
			createdAt: '',
			suspendedAt: '',
			inactivatedAt: '',
			reactivatedAt: '',
		},
		product: {
			enabled: true,
			useCurrentChannel: 'yes',
			name: '',
			channelId: '',
			linkedChannelName: '',
			linkedChannelId: '',
			status: '',
			createdAt: '',
			suspendedAt: '',
			inactivatedAt: '',
			reactivatedAt: '',
			dfiFile: '',
			acceptanceModel: 'simplified',
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
	}

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
		defaultValues,
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
		if (typeof window === 'undefined') return
		try {
			const stored = localStorage.getItem('partnersMock')
			if (!stored) return
			const parsed = JSON.parse(stored) as PartnerMockRecord[]

			const insurersSet = new Map<string, string>()
			const channelsSet = new Map<string, string>()

			parsed.forEach(record => {
				const insurerLabel =
					record.data.channel.linkedInsurerName ||
					record.data.insurer.name ||
					record.data.insurer.selectedLabel ||
					record.data.insurer.insurerId ||
					''
				if (insurerLabel) insurersSet.set(insurerLabel, insurerLabel)

				const channelLabel =
					record.data.product.linkedChannelName ||
					record.data.channel.name ||
					record.data.product.channelId ||
					''
				if (channelLabel) channelsSet.set(channelLabel, channelLabel)
			})

			if (insurersSet.size) {
				setSavedInsurers(Array.from(insurersSet.entries()).map(([value, label]) => ({ value, label })))
			}
			if (channelsSet.size) {
				setSavedChannels(Array.from(channelsSet.entries()).map(([value, label]) => ({ value, label })))
			}
		} catch (err) {
			console.error('Erro ao carregar referências salvas', err)
		}
	}, [])

	const channelEnabled = watch('channel.enabled')
	const productEnabled = watch('product.enabled')
	const insurerMode = watch('insurer.mode')
	const channelUseCurrentValue = watch('channel.useCurrentInsurer')
	const productUseCurrentValue = watch('product.useCurrentChannel')
	const productDfiEnabled = watch('product.dfiEnabled') === 'yes'
	const productDfiFile = watch('product.dfiFile')
	const useCurrentInsurer = channelUseCurrentValue === 'yes'
	const useCurrentChannel = productUseCurrentValue === 'yes'
	const lockInsurerToCurrent = insurerMode === 'new' || insurerMode === 'select'
	const canUseCurrentInsurer = insurerMode !== 'skip'
	const lockChannelToCurrent = channelEnabled
	const canUseCurrentChannel = channelEnabled

	const insurerOptions = useMemo(() => mergeUniqueOptions(savedInsurers, mockInsurers), [savedInsurers])
	const channelOptions = useMemo(() => mergeUniqueOptions(savedChannels, mockChannels), [savedChannels])

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
		reset(defaultValues)
	}

	function onSubmit(data: PartnerFormValues) {
		const errors: string[] = []
		const errorPaths: string[] = []
		const somethingEnabled = data.insurer.mode !== 'skip' || data.channel.enabled || data.product.enabled

		if (!somethingEnabled) {
			errors.push('Cadastre ao menos seguradora, canal ou produto.')
			errorPaths.push('global.noneEnabled')
		}

		// Seguradora
		if (!data.insurer.mode) {
			errors.push('Escolha uma opção de seguradora.')
			errorPaths.push('insurer.mode')
		}
		if (data.insurer.mode === 'new') {
			if (!data.insurer.cnpj) {
				errors.push('CNPJ da seguradora é obrigatório.')
				errorPaths.push('insurer.cnpj')
			}
			if (!data.insurer.name) {
				errors.push('Nome/Razão social da seguradora é obrigatório.')
				errorPaths.push('insurer.name')
			}
		}
		if (data.insurer.mode === 'select' && !data.insurer.insurerId) {
			errors.push('Selecione uma seguradora na lista.')
			errorPaths.push('insurer.insurerId')
		}

		// Canal
		if (data.channel.enabled && !data.channel.cnpj) {
			errors.push('CNPJ do canal é obrigatório.')
			errorPaths.push('channel.cnpj')
		}
		if (data.channel.enabled && !data.channel.name) {
			errors.push('Nome do canal é obrigatório.')
			errorPaths.push('channel.name')
		}
		if (data.channel.enabled && data.channel.useCurrentInsurer === 'no' && !data.channel.insurerId) {
			errors.push('Selecione uma seguradora para o canal.')
			errorPaths.push('channel.insurerId')
		}

		// Produto
		if (data.product.enabled) {
			if (!data.product.name) {
				errors.push('Nome do produto é obrigatório.')
				errorPaths.push('product.name')
			}

			if (data.product.useCurrentChannel === 'no' && !data.product.channelId) {
				errors.push('Selecione um canal para o produto.')
				errorPaths.push('product.channelId')
			}

			if (!data.product.ageMin) {
				errors.push('Idade mínima é obrigatória.')
				errorPaths.push('product.ageMin')
			}
			if (!data.product.ageMax) {
				errors.push('Idade máxima é obrigatória.')
				errorPaths.push('product.ageMax')
			}
			if (!data.product.maxTerm) {
				errors.push('Prazo máximo é obrigatório.')
				errorPaths.push('product.maxTerm')
			}

			if (!data.product.dfiEnabled) {
				errors.push('Informe se o produto possui DFI.')
				errorPaths.push('product.dfiEnabled')
			} else if (data.product.dfiEnabled === 'yes') {
				if (!data.product.dfiValue) {
					errors.push('Valor DFI é obrigatório.')
					errorPaths.push('product.dfiValue')
				}
				if (!data.product.mipValue) {
					errors.push('Valor MIP é obrigatório.')
					errorPaths.push('product.mipValue')
				}
				if (!data.product.dfiFile) {
					errors.push('Anexo do DFI é obrigatório.')
					errorPaths.push('product.dfiFile')
				}
			} else {
				if (!data.product.mipValue) {
					errors.push('Valor MIP é obrigatório.')
					errorPaths.push('product.mipValue')
				}
			}

			if (data.product.examsAdditionalMale && !data.product.examsAdditionalMaleAge) {
				errors.push('Idade limite para exames adicionais de homens é obrigatória.')
				errorPaths.push('product.examsAdditionalMaleAge')
			}
			if (data.product.examsAdditionalFemale && !data.product.examsAdditionalFemaleAge) {
				errors.push('Idade limite para exames adicionais de mulheres é obrigatória.')
				errorPaths.push('product.examsAdditionalFemaleAge')
			}

			if (
				!data.product.propertyResidential &&
				!data.product.propertyCommercial &&
				!data.product.propertyMixed
			) {
				errors.push('Selecione ao menos um tipo de imóvel.')
				errorPaths.push('product.property')
			}
		}

		if (errors.length) {
			setErrorFields(new Set(errorPaths))
			setSubmitMessage(
				errors.includes('Cadastre ao menos seguradora, canal ou produto.')
					? 'Selecione pelo menos uma das seções (Seguradora, Canal ou Produto) para cadastrar.'
					: 'Os campos marcados são de preenchimento obrigatório.'
			)
			return
		}

		const insurerSelectedLabel =
			data.insurer.insurerId
				? insurerOptions.find(option => option.value === data.insurer.insurerId)?.label ?? data.insurer.insurerId ?? ''
				: ''

		const channelSelectedInsurerLabel =
			data.channel.insurerId
				? insurerOptions.find(option => option.value === data.channel.insurerId)?.label ?? data.channel.insurerId ?? ''
				: ''

		const productSelectedChannelLabel =
		data.product.channelId
			? channelOptions.find(option => option.value === data.product.channelId)?.label ?? data.product.channelId ?? ''
			: ''

		const currentInsurerName = data.insurer.mode === 'new' ? data.insurer.name ?? '' : insurerSelectedLabel
		const currentChannelName = data.channel.name ?? ''

		const now = new Date().toISOString()

		const payload: PartnerFormValues = {
			...data,
			insurer: {
				...data.insurer,
				selectedLabel: insurerSelectedLabel,
				status: data.insurer.status || 'active',
				createdAt: data.insurer.createdAt || now,
			},
			channel: data.channel.enabled
				? {
						...data.channel,
						linkedInsurerName:
							data.channel.useCurrentInsurer === 'yes' ? currentInsurerName : channelSelectedInsurerLabel,
						linkedInsurerId:
							data.channel.useCurrentInsurer === 'yes'
								? data.insurer.mode === 'select'
									? data.insurer.insurerId ?? ''
									: ''
								: data.channel.insurerId ?? '',
						status: data.channel.status || 'active',
						createdAt: data.channel.createdAt || now,
				  }
				: {
						...data.channel,
						linkedInsurerName: '',
						linkedInsurerId: '',
						insurerId: '',
						cnpj: '',
						name: '',
						status: '',
						createdAt: '',
						suspendedAt: '',
						inactivatedAt: '',
						reactivatedAt: '',
				  },
			product: data.product.enabled
				? {
						...data.product,
						linkedChannelName:
							data.product.useCurrentChannel === 'yes' ? currentChannelName : productSelectedChannelLabel,
						linkedChannelId: data.product.useCurrentChannel === 'yes' ? '' : data.product.channelId ?? '',
						status: data.product.status || 'active',
						createdAt: data.product.createdAt || now,
				  }
				: {
						...data.product,
						linkedChannelName: '',
						linkedChannelId: '',
						channelId: '',
						name: '',
						status: '',
						createdAt: '',
						suspendedAt: '',
						inactivatedAt: '',
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
		} catch (err) {
			console.error('Erro ao salvar rascunho local', err)
		}

		router.push('/partners/summary')

	}
	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
							invalidFields={errorFields}
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
							invalidFields={errorFields}
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
							invalidFields={errorFields}
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
		</form>
	)
}
