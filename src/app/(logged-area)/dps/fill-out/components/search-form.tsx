'use client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import SelectComp from '@/components/ui/select-comp'
import {
	custom,
	InferInput,
	literal,
	minLength,
	nonEmpty,
	object,
	pipe,
	string,
	transform,
	union,
} from 'valibot'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { PlusCircleIcon, SearchIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import validateCpf from 'validar-cpf'

const searchSchema =
	// union(
	// [
	object({
		cpf: pipe(
			string(),
			transform(input => input.replace(/\D/g, '')),
			custom(v => validateCpf(v as string), 'Por favor forneça um CPF válido')
			// nonEmpty('Campo obrigatório.')
		),
		// produto:
		// pipe(
		// string(),
		// nonEmpty('Campo obrigatório.'),
		// ),
		// lmi:
		// pipe(
		// string(),
		// nonEmpty('Campo obrigatório.'),
		// ),
	})
// ,
// object({
// cpf: literal(''),
// produto: literal(''),
// lmi: literal(''),
// }),
// ],
// 'Invalid search schema'
// )

type SearchSchema = InferInput<typeof searchSchema>

export default function SearchForm() {
	const params = useSearchParams()

	const {
		handleSubmit,
		getValues,
		trigger,
		setValue,
		control,
		reset,
		formState: { isSubmitting, isSubmitted, errors, ...formState },
	} = useForm<SearchSchema>({
		resolver: valibotResolver(searchSchema),
		defaultValues: {
			cpf: params.get('cpf') ?? '',
			// produto: params.get('produto') ?? '',
			// lmi: params.get('lmi') ?? '',
		},
	})

	const router = useRouter()

	function onSubmit(v: SearchSchema) {

		trigger()

		// if (!v.cpf) {
		// 	return
		// }

		const searchParams = new URLSearchParams({
			cpf: v.cpf,
			// produto: v.produto,
			// lmi: v.lmi,
		})

		router.push(`/dps/fill-out?${searchParams.toString()}`)
	}

	return (
		<>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="mt-7 flex flex-row justify-between items-center gap-5">
					<div>
						<h3 className="text-primary font-semibold">Pesquisar CPF</h3>
						<span className="text-sm text-muted-foreground">
							Buscar dados do proponente
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Controller
							control={control}
							defaultValue=""
							name="cpf"
							render={({ field: { onChange, onBlur, value, ref } }) => (
								<Input
									placeholder="000.000.000-00"
									mask="999.999.999-99"
									className={cn(
										'max-w-72 p-4 border-none rounded-xl',
										errors?.cpf &&
											'outline outline-1 outline-red-500 focus-visible:outline-red-500'
									)}
									disabled={isSubmitting}
									onChange={onChange}
									onBlur={onBlur}
									value={value}
									ref={ref}
								/>
								
							)}
						/>

						{/* <Controller
						control={control}
						defaultValue=""
						name="produto"
						render={({ field: { onChange, value } }) => (
							<SelectComp
								placeholder="Produto"
								options={productOptions}
								allowClear
								triggerClassName={cn(
									'w-40 border-none rounded-xl',
									errors?.produto &&
										'outline outline-1 outline-red-500 focus-visible:outline-red-500'
								)}
								disabled={isSubmitting}
								onValueChange={onChange}
								defaultValue={value}
							/>
						)}
					/>

					<Controller
						control={control}
						defaultValue=""
						name="lmi"
						render={({ field: { onChange, value } }) => (
							<SelectComp
								placeholder="LMI"
								options={lmiOptions}
								allowClear
								triggerClassName={cn(
									'w-40 border-none rounded-xl',
									errors?.lmi &&
										'outline outline-1 outline-red-500 focus-visible:outline-red-500'
								)}
								disabled={isSubmitting}
								onValueChange={onChange}
								defaultValue={value}
							/>
						)}
					/> */}

						<Button type="submit" className="w-full max-w-32 p-4 rounded-xl">
							<SearchIcon size={18} className="mr-2" />
							Buscar
						</Button>

						{/* {getValues('cpf') && (
							<Button type='button' className="w-full max-w-32 p-4 rounded-xl" onClick={
							event => router.push(`/dps/fill-out/form?cpf=${getValues('cpf')}`)
							}>
								<PlusCircleIcon size={18} className="mr-2" />
								Cadastrar DPS
							</Button>
						)} */}
					</div>
				</div>
				<div className='w-full text-right pr-5'>
					<span className='text-red-500'>
						{errors.cpf?.message}
					</span>
				</div>
			</form>
		</>
	)
}
