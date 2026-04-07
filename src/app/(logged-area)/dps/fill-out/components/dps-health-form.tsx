import React, { useCallback, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import ShareLine from '@/components/ui/share-line'
import { cn } from '@/lib/utils'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { isFhePoupexProduct, isHomeEquityProduct, isMagHabitacionalProduct } from '@/constants'

import {
	Control,
	Controller,
	FormState,
	useForm,
	UseFormSetValue,
	UseFormTrigger,
} from 'react-hook-form'
import {
	InferInput,
	literal,
	object,
	variant,
	pipe,
	nonEmpty,
	string,
	optional,
} from 'valibot'
import { postHealthDataByUid, postMagHabitacionalAutoApproval } from '../../actions'
import { useSession } from 'next-auth/react'
import { Loader2Icon } from 'lucide-react'
import {
	diseaseNamesHomeEquity,
	diseaseNamesHabitacional,
	diseaseNamesMagHabitacional,
	diseaseNamesMagHabitacionalSimplified,
} from './dps-form'

const diseaseSchema = variant(
	'has',
	[
		object({
			has: literal('yes'),
			description: pipe(string(), nonEmpty('Campo obrigatório.')),
		}),
		object({
			has: literal('no'),
			description: optional(string(), 'Não é necessário preencher.'),
		}),
	],
	'Campo obrigatório'
)

const productSchemaTop = {
	'1': diseaseSchema,
	'2': diseaseSchema,
	'3': diseaseSchema,
	'4': diseaseSchema,
	'5': diseaseSchema,
	'6': diseaseSchema,
	'7': diseaseSchema,
	'8': diseaseSchema,
	'9': diseaseSchema,
	'10': diseaseSchema,
	'11': diseaseSchema,
	'12': diseaseSchema,
	'13': diseaseSchema,
	'14': diseaseSchema,
	'15': diseaseSchema,
	'16': diseaseSchema,
	'17': diseaseSchema,
	'18': diseaseSchema,
	'19': diseaseSchema,
	'20': diseaseSchema,
	'21': diseaseSchema,
}

const productYelum = {
	'1': diseaseSchema,
	'2': diseaseSchema,
	'3': diseaseSchema,
	'4': diseaseSchema,
	'5': diseaseSchema,
	'6': diseaseSchema,
	telefoneContato: diseaseSchema,
}

const productYelumNovo = {
	'1': diseaseSchema,
	'2': diseaseSchema,
	'3': diseaseSchema,
	'4': diseaseSchema,
	'5': diseaseSchema,
	'6': diseaseSchema,
	'7': diseaseSchema,
	'8': diseaseSchema,
	'9': diseaseSchema,
	'10': diseaseSchema,
	'11': diseaseSchema,
	'12': diseaseSchema,
	'13': diseaseSchema,
	'14': diseaseSchema,
	'15': diseaseSchema,
	'16': diseaseSchema,
	'17': diseaseSchema,
	'18': diseaseSchema,
	'19': diseaseSchema,
	'20': diseaseSchema,
	'21': diseaseSchema,
	'22': diseaseSchema,
	'23': diseaseSchema,
	'24': diseaseSchema,
	'25': diseaseSchema
};

const productHdiHomeEquity = {
	'1': diseaseSchema,
	'2': diseaseSchema,
	'3': diseaseSchema,
	'4': diseaseSchema,
	'5': diseaseSchema,
	'6': diseaseSchema,
	'7': diseaseSchema,
	'8': diseaseSchema,
	'9': diseaseSchema,
	'10': diseaseSchema,
	'11': diseaseSchema,
	'12': diseaseSchema,
	'13': diseaseSchema,
	'14': diseaseSchema,
	'15': diseaseSchema,
	'16': diseaseSchema,
	'17': diseaseSchema,
	'18': diseaseSchema,
	'19': diseaseSchema,
	'20': diseaseSchema,
	'21': diseaseSchema,
	'22': diseaseSchema,
	'23': diseaseSchema,
	'24': diseaseSchema,
	'25': diseaseSchema,
	'26': diseaseSchema
};

const productMagHabitacional = {
	'1': diseaseSchema,
	'2': diseaseSchema,
	'3': diseaseSchema,
	'4': diseaseSchema,
	'5': diseaseSchema,
	'6': diseaseSchema,
	'7': diseaseSchema,
	'8': diseaseSchema,
	'9': diseaseSchema,
	'10': diseaseSchema,
	'11': diseaseSchema,
	'12': diseaseSchema,
	'13': diseaseSchema,
	'14': diseaseSchema,
	'15': diseaseSchema,
	'16': diseaseSchema,
	'17': diseaseSchema,
	'18': diseaseSchema,
	'19': diseaseSchema,
	'20': diseaseSchema,
	'21': diseaseSchema,
	'22': diseaseSchema,
	'23': diseaseSchema,
	'24': diseaseSchema,
	'25': diseaseSchema,
	'26': diseaseSchema,
	'27': diseaseSchema,
	'28': diseaseSchema,
	'29': diseaseSchema,
	'30': diseaseSchema,
	'31': diseaseSchema
};

const productMagHabitacionalSimplified = {
	'1': diseaseSchema,
	'2': diseaseSchema,
	'3': diseaseSchema,
	'4': diseaseSchema,
	'5': diseaseSchema,
	'6': diseaseSchema,
	'7': diseaseSchema,
	'8': diseaseSchema,
	'9': diseaseSchema,
	'10': diseaseSchema,
	'11': diseaseSchema,
	'12': diseaseSchema
};

const healthForm = object(productYelumNovo)
const healthFormHomeEquity = object(productHdiHomeEquity)
const healthFormMagHabitacional = object(productMagHabitacional)
const healthFormMagHabitacionalSimplified = object(productMagHabitacionalSimplified)

export type HealthForm = InferInput<typeof healthForm>
export type HealthFormHdiHomeEquity = InferInput<typeof healthFormHomeEquity>
export type HealthFormMagHabitacional = InferInput<typeof healthFormMagHabitacional>
export type HealthFormMagHabitacionalSimplified = InferInput<
	typeof healthFormMagHabitacionalSimplified
>

export type DpsHealthFormValue =
	| HealthForm
	| HealthFormHdiHomeEquity
	| HealthFormMagHabitacional
	| HealthFormMagHabitacionalSimplified

const DpsHealthForm = ({
	onSubmit: onSubmitProp,
	proposalUid,
	productName,
	initialHealthData,
	autocomplete = false,
	magHabitacionalDpsMode = 'full',
}: {
	onSubmit: (v: DpsHealthFormValue) => void
	proposalUid: string
	productName: string
	autocomplete?: boolean
	initialHealthData?: DpsHealthFormValue | null
	magHabitacionalDpsMode?: 'simplified' | 'full'
}) => {
	const session = useSession()
	const token = (session.data as any)?.accessToken

	const [submittingForm, setSubmittingForm] = React.useState(false)

	const isMagHabitacional = isMagHabitacionalProduct(productName);
	
	const getSchema = () => {
		if (isMagHabitacional) {
			return magHabitacionalDpsMode === 'simplified'
				? healthFormMagHabitacionalSimplified
				: healthFormMagHabitacional
		}
		if (isHomeEquityProduct(productName) || isFhePoupexProduct(productName)) {
			return healthFormHomeEquity;
		}
		return healthForm;
	};

	const {
		handleSubmit,
		getValues,
		trigger,
		setValue,
		control,
		reset,
		watch,
		formState: { isSubmitting, isSubmitted, errors, ...formState },
	} = useForm<DpsHealthFormValue>({
		resolver: valibotResolver(getSchema()),
		defaultValues: autocomplete ? initialHealthData ?? undefined : undefined,
		disabled: submittingForm,
	})

	async function onSubmit(v: DpsHealthFormValue) {
		console.log('Form submission started (internal)', v)
		setSubmittingForm(true)

		const getQuestionText = (key: string): string => {
			if (isMagHabitacional) {
				if (magHabitacionalDpsMode === 'simplified') {
					return (
						diseaseNamesMagHabitacionalSimplified[
							key as keyof typeof diseaseNamesMagHabitacionalSimplified
						] || ''
					)
				}
				return diseaseNamesMagHabitacional[key as keyof typeof diseaseNamesMagHabitacional] || ''
			}
			if (isHomeEquityProduct(productName) || isFhePoupexProduct(productName)) {
				return diseaseNamesHomeEquity[key as keyof typeof diseaseNamesHomeEquity] || '';
			}
			return diseaseNamesHabitacional[key as keyof typeof diseaseNamesHabitacional] || '';
		};

		const postData = Object.entries(v).map(([key, value]) => {
			return {
				code: key,
				question: getQuestionText(key),
				exists: (value as any).has === 'yes',
				created: new Date().toISOString(),
				description: (value as any).description || '',
			};
		})

		console.log('postData', postData)

		try {
			const response = await postHealthDataByUid(token, proposalUid, postData)

			if (response) {
				if (response.success) {
					if (isMagHabitacional) {
						const hasPositiveAnswers = postData.some(item => item.exists === true);
						
						if (!hasPositiveAnswers) {
							try {
								const autoApprovalResponse = await postMagHabitacionalAutoApproval(token, proposalUid);
								if (autoApprovalResponse?.success) {
									console.log('DPS aprovada automaticamente para MAG Habitacional');
								} else {
									console.warn('Não foi possível aprovar automaticamente:', autoApprovalResponse?.message);
								}
							} catch (autoApprovalError) {
								console.error('Erro ao tentar aprovação automática:', autoApprovalError);
							}
						}
					}
					
					reset()
					setSubmittingForm(false)
					onSubmitProp(v)
				} else {
					//TODO add error alert
					console.error('Failed to post health data (internal):', response.message)
					setSubmittingForm(false)
				}
			} else {
				console.error('Nenhuma resposta recebida do servidor')
				setSubmittingForm(false)
			}
		} catch (error) {
			console.error('Erro ao enviar dados de saúde:', error)
			setSubmittingForm(false)
		}
	}

	const productTypeDiseaseNames = isHomeEquityProduct(productName) || isFhePoupexProduct(productName);

	const getQuestions = () => {
		if (isMagHabitacional) {
			if (magHabitacionalDpsMode === 'simplified') {
				return Object.keys(diseaseNamesMagHabitacionalSimplified)
			}
			return Object.keys(diseaseNamesMagHabitacional)
		}
		if (productTypeDiseaseNames) {
			return Object.keys(healthFormHomeEquity.entries);
		}
		return Object.keys(healthForm.entries);
	};

	const getQuestionLabel = (key: string): string => {
		if (isMagHabitacional) {
			if (magHabitacionalDpsMode === 'simplified') {
				return (
					diseaseNamesMagHabitacionalSimplified[
						key as keyof typeof diseaseNamesMagHabitacionalSimplified
					] || ''
				)
			}
			return diseaseNamesMagHabitacional[key as keyof typeof diseaseNamesMagHabitacional] || ''
		}
		if (productTypeDiseaseNames) {
			return diseaseNamesHomeEquity[key as keyof typeof diseaseNamesHomeEquity] || '';
		}
		return diseaseNamesHabitacional[key as keyof typeof diseaseNamesHabitacional] || '';
	};

	const questions = getQuestions();

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col gap-6 w-full"
		>
			<h3 className="text-primary text-lg">Formulário Saúde {productName}</h3>
			<div>
				Preencha o formulário abaixo para declarar sua saúde.
			</div>
			<div className="divide-y">
				{questions.map(key => {
					return (
						<DiseaseField
							key={key}
							name={key as any}
							label={getQuestionLabel(key)}
							control={control}
							watch={watch}
							errors={errors}
							isSubmitting={isSubmitting || submittingForm}
							trigger={trigger}
							setValue={setValue}
						/>
					);
				})}
			</div>

			<div className="flex justify-start items-center gap-5">
				<Button
					type="submit"
					className="w-40"
					disabled={submittingForm || isSubmitting}
					onClick={() => console.log('Button clicked (internal)!', { submittingForm, isSubmitting })}
				>
					Salvar
					{(isSubmitting || submittingForm) && (
						<Loader2Icon className="w-4 h-4 ml-2 animate-spin" />
					)}
				</Button>
				{errors ? (
					<div className="text-red-500">
						{Object.keys(errors).length > 0
							? 'Preencha todos os campos'
							: ''}
					</div>
				) : null}
			</div>
		</form>
	)
}

DpsHealthForm.displayName = 'DpsHealthForm'

function DiseaseField({
	name,
	label,
	control,
	watch,
	errors,
	isSubmitting,
	trigger,
	setValue,
}: {
	name: keyof DpsHealthFormValue
	label: string
	control: Control<DpsHealthFormValue>
	watch: any
	errors: FormState<DpsHealthFormValue>['errors']
	isSubmitting: boolean
	trigger: UseFormTrigger<DpsHealthFormValue>
	setValue: UseFormSetValue<DpsHealthFormValue>
}) {
	const has = watch(`${name}.has`)

	const handleDescriptionChange = useCallback(() => {
		trigger(`${name}.description` as any)
	}, [trigger, name])

	const hasInputRef = useRef<HTMLElement | null>(null)
	function handleValidShake(check: boolean) {
		if (check && hasInputRef.current) {
			console.log('TEM ERRO', hasInputRef.current)
			hasInputRef.current.style.animation = 'horizontal-shaking 0.25s backwards'
			setTimeout(() => {
				if (hasInputRef.current) hasInputRef.current.style.animation = ''
			}, 250)
		}
		return check
	}

	useEffect(() => {
		handleValidShake(!!(errors as any)[name]?.has)
	}, [errors, name])

	return (
		<ShareLine className="py-4 px-4 hover:bg-gray-50">
			<div>
				<div className="text-gray-500">{label}</div>
				<Controller<any>
					control={control}
					defaultValue={''}
					name={`${name}.description`}
					render={({ field: { onChange, onBlur, value, ref } }) => (
						<>
							<Input
								id={name}
								placeholder="Descreva"
								className={cn(
									'w-full p-4 h-12 mt-3 rounded-lg',
									(errors as any)?.[name]?.description &&
										'border-red-500 focus-visible:border-red-500'
								)}
								disabled={isSubmitting || has !== 'yes'}
								onChange={e => {
									handleDescriptionChange()
									onChange(e)
								}}
								onBlur={onBlur}
								value={value}
								ref={ref}
							/>
							<div className="text-xs text-red-500">
								{(errors as any)?.[name]?.description?.message}
							</div>
						</>
					)}
				/>
			</div>

			<Controller<any>
				control={control}
				defaultValue={undefined}
				name={`${name}.has`}
				render={({ field: { onChange, onBlur, value, ref, ...field } }) => {
					function handleChange(v: 'yes' | 'no') {
						onChange(v)
						requestAnimationFrame(() => {
							trigger(`${name}.description` as any)
						})
					}

					return (
						<RadioGroup
							onValueChange={handleChange}
							defaultValue={value}
							className="flex flex-row justify-end items-start gap-5"
							ref={r => {
								hasInputRef.current = r
								ref(r)
							}}
						>
							<div className={(errors as any)?.[name]?.has && 'text-red-500'}>
								<RadioGroupItem
									value="yes"
									id={`${name}-yes`}
									className={(errors as any)?.[name]?.has && 'border-red-500'}
								/>
								<label htmlFor={`${name}-yes`} className="pl-2 cursor-pointer">
									Sim
								</label>
							</div>
							<div className={(errors as any)?.[name]?.has && 'text-red-500'}>
								<RadioGroupItem
									value="no"
									id={`${name}-no`}
									className={(errors as any)?.[name]?.has && 'border-red-500'}
								/>
								<label htmlFor={`${name}-no`} className="pl-2 cursor-pointer">
									Não
								</label>
							</div>
						</RadioGroup>
					)
				}}
			/>
		</ShareLine>
	)
}

export default DpsHealthForm
