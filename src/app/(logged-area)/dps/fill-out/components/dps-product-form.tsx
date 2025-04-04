'use client'

import { Input } from '@/components/ui/input'
import SelectComp from '@/components/ui/select-comp'
import ShareLine from '@/components/ui/share-line'
import { cn, maskToBrlCurrency, maskToDigitsAndSuffix } from '@/lib/utils'
import React from 'react'
import { Control, Controller, FormState } from 'react-hook-form'
import { custom, InferInput, nonEmpty, object, pipe, string } from 'valibot'
import { DpsInitialForm } from './dps-initial-form'

export const dpsProductForm = object({
	product: pipe(string(), nonEmpty('Campo obrigatório.')),
	deadline: pipe(string(), nonEmpty('Campo obrigatório.')),
	mip: pipe(
		string(),
		nonEmpty('Campo obrigatório.'),
		custom(
			v => checkCapitalValue(v as string),
			'Capital máximo R$ 10.000.000,00'
		)
	),
	dfi: pipe(
		string(),
		nonEmpty('Campo obrigatório.'),
		custom(
			v => checkCapitalValue(v as string),
			'Capital máximo R$ 10.000.000,00'
		)
	),
	propertyType: pipe(string(), nonEmpty('Campo obrigatório.'))
})

export type DpsProductFormType = InferInput<typeof dpsProductForm>

const DpsProductForm = ({
	data,
	prazosOptions,
	productOptions,
	tipoImovelOptions,
	control,
	formState,
	disabled = false
}: {
	data?: Partial<DpsProductFormType>
	prazosOptions: { value: string; label: string }[]
	productOptions: { value: string; label: string }[]
	tipoImovelOptions: { value: string; label: string }[]
	control: Control<DpsInitialForm>
	formState: FormState<DpsInitialForm>
	disabled?: boolean
}) => {
	console.log('formState', formState)
	// Ignoramos erros quando em modo somente leitura
	const errors = disabled ? {} : formState.errors?.product;

	return (
		<div className="flex flex-col gap-6 w-full">
			<h3 className="text-primary text-lg">Dados do Produto</h3>
			{disabled && (
				<div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
					<p>Os dados do produto estão bloqueados pois já existe um proponente principal para esta operação.</p>
				</div>
			)}
			<ShareLine>
				<Controller
					control={control}
					defaultValue=""
					name="product.product"
					render={({ field: { onChange, onBlur, value, ref } }) => {
						return (
							<label>
								<div className="text-gray-500">Produto</div>
								<SelectComp
									placeholder="Produto"
									options={productOptions}
									triggerClassName="p-4 h-12 rounded-lg"
									disabled={disabled}
									onValueChange={(val) => {
										onChange(val);
										// Chamar onBlur após a mudança para disparar a revalidação
										setTimeout(() => onBlur(), 0);
									}}
									value={value || ''}
									defaultValue={value || ''}
								/>
								{!disabled && (
									<div className="text-xs text-red-500">
										{errors?.product?.message}
									</div>
								)}
							</label>
						)
					}}
				/>

				<Controller
					control={control}
					defaultValue=""
					name="product.deadline"
					render={({ field: { onChange, onBlur, value, ref } }) => {
						return (
							<label>
								<div className="text-gray-500">Prazo</div>
								<SelectComp
									placeholder="Prazo"
									options={prazosOptions}
									triggerClassName="p-4 h-12 rounded-lg"
									disabled={disabled}
									onValueChange={(val) => {
										onChange(val);
										// Chamar onBlur após a mudança para disparar a revalidação
										setTimeout(() => onBlur(), 0);
									}}
									value={value || ''}
									defaultValue={value || ''}
								/>
								{!disabled && (
									<div className="text-xs text-red-500">
										{errors?.deadline?.message}
									</div>
								)}
							</label>
						)
					}}
				/>
			</ShareLine>
			<ShareLine>
				<Controller
					control={control}
					defaultValue=""
					name="product.mip"
					render={({ field: { onChange, onBlur, value, ref } }) => (
						<label>
							<div className="text-gray-500">Capital MIP</div>
							<Input
								id="mip"
								type="text"
								placeholder="R$ 99.999,99"
								mask="R$ 99999999999999999"
								beforeMaskedStateChange={maskToBrlCurrency}
								className={cn(
									'w-full px-4 py-6 rounded-lg',
									!disabled && errors?.mip && 'border-red-500 focus-visible:border-red-500'
								)}
								autoComplete="mip"
								onChange={onChange}
								onBlur={onBlur}
								value={value}
								ref={ref}
								disabled={disabled}
							/>
							{!disabled && (
								<div className="text-xs text-red-500">
									{errors?.mip?.message}
								</div>
							)}
						</label>
					)}
				/>

				<Controller
					control={control}
					defaultValue=""
					name="product.dfi"
					render={({ field: { onChange, onBlur, value, ref } }) => (
						<label>
							<div className="text-gray-500">Capital DFI</div>
							<Input
								id="dfi"
								type="text"
								placeholder="R$ 99.999,99"
								mask="R$ 99999999999999999"
								beforeMaskedStateChange={maskToBrlCurrency}
								className={cn(
									'w-full px-4 py-6 rounded-lg',
									!disabled && errors?.dfi && 'border-red-500 focus-visible:border-red-500'
								)}
								autoComplete="dfi"
								onChange={onChange}
								onBlur={onBlur}
								value={value}
								ref={ref}
								disabled={disabled}
							/>
							{!disabled && (
								<div className="text-xs text-red-500">
									{errors?.dfi?.message}
								</div>
							)}
						</label>
					)}
				/>
			</ShareLine>

			<ShareLine>
				<Controller
					control={control}
					defaultValue=""
					name="product.propertyType"
					render={({ field: { onChange, onBlur, value, ref } }) => {
						return (
							<label>
								<div className="text-gray-500">Tipo de Imóvel</div>
								<SelectComp
									placeholder="Tipo de Imóvel"
									options={tipoImovelOptions}
									triggerClassName="p-4 h-12 rounded-lg"
									disabled={disabled}
									onValueChange={(val) => {
										onChange(val);
										// Chamar onBlur após a mudança para disparar a revalidação
										setTimeout(() => onBlur(), 0);
									}}
									value={value || ''}
									defaultValue={value || ''}
								/>
								{!disabled && (
									<div className="text-xs text-red-500">
										{errors?.propertyType?.message}
									</div>
								)}
							</label>
						)
					}}
				/>
				<div></div>
			</ShareLine>
		</div>
	)
}

export default DpsProductForm

export function convertCapitalValue(value: string) {
	if (value.length > 0) {
		const toDigit = value.replace(/[^0-9]/g, '')
		const number = +toDigit / 100
		return number
	}
	return null
}

function checkCapitalValue(value: string) {
	const converted = convertCapitalValue(value)
	if (converted != null) {
		return converted <= 10_000_000
	}
	return false
}
