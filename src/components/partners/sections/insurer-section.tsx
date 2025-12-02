import { Controller, type Control } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import SelectComp from '@/components/ui/select-comp'
import { RadioGroup } from '@/components/ui/radio-group'
import RadioOption from './radio-option'
import type { PartnerFormValues } from '../partner-form'

type InsurerSectionProps = {
	control: Control<PartnerFormValues>
	insurerMode: PartnerFormValues['insurer']['mode']
	insurerOptions: { value: string; label: string }[]
	onModeChange: (value: 'new' | 'select') => void
	invalidFields: Set<string>
	duplicateCnpjMessage?: string
}

export default function InsurerSection({
	control,
	insurerMode,
	insurerOptions,
	onModeChange,
	invalidFields,
	duplicateCnpjMessage,
}: InsurerSectionProps) {
	const isInvalid = (path: string) => invalidFields.has(path)

	return (
		<div className="rounded-2xl border bg-white p-5 shadow-sm space-y-5">
			<div className="flex flex-col gap-2">
				<p className="text-sm font-medium text-primary">Cadastrar Seguradora</p>
				<RadioGroup
					value={insurerMode}
					onValueChange={value => onModeChange(value as 'new' | 'select')}
					className="grid grid-cols-1 sm:grid-cols-2 gap-3"
				>
					<RadioOption value="new" label="Nova seguradora" />
					<RadioOption value="select" label="Selecionar na lista" />
				</RadioGroup>
				<p className="text-sm text-muted-foreground">
					Cadastre a seguradora base ou avance direto para canal e produto, vinculando uma seguradora existente
					quando necessário.
				</p>
			</div>

			{insurerMode === 'new' && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="insurerCnpj">CNPJ da seguradora</Label>
						<Controller
							name="insurer.cnpj"
							control={control}
							render={({ field }) => (
								<>
									<Input
										id="insurerCnpj"
										placeholder="00.000.000/0000-00"
										mask="99.999.999/9999-99"
										className={isInvalid('insurer.cnpj') ? 'border-destructive focus:ring-destructive' : ''}
										{...field}
									/>
									{duplicateCnpjMessage ? (
										<p className="text-xs text-destructive">{duplicateCnpjMessage}</p>
									) : null}
								</>
							)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="insurerName">Razão Social</Label>
						<Controller
							name="insurer.name"
							control={control}
							render={({ field }) => (
								<Input
									id="insurerName"
									placeholder="Digite a razão social"
									className={isInvalid('insurer.name') ? 'border-destructive focus:ring-destructive' : ''}
									{...field}
								/>
							)}
						/>
					</div>
				</div>
			)}

			{insurerMode === 'select' && (
				<div className="space-y-2">
					<Label htmlFor="insurerSelect">Selecione a seguradora</Label>
					<Controller
						name="insurer.insurerId"
						control={control}
						render={({ field }) => (
							<SelectComp
								placeholder="Escolha uma seguradora"
								options={insurerOptions}
								triggerClassName={
									isInvalid('insurer.insurerId') ? 'border-destructive focus:ring-destructive' : ''
								}
								value={field.value ?? ''}
								onValueChange={field.onChange}
							/>
						)}
					/>
				</div>
			)}
		</div>
	)
}
