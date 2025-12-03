import { Controller, type Control } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import SelectComp from '@/components/ui/select-comp'
import { RadioGroup } from '@/components/ui/radio-group'
import RadioOption from './radio-option'
import type { PartnerFormValues } from '../partner-form-schema'

type ChannelSectionProps = {
	control: Control<PartnerFormValues>
	channelEnabled: boolean
	useCurrentInsurer: boolean
	canUseCurrentInsurer: boolean
	lockUseCurrentInsurer: boolean
	invalidFields: Set<string>
	duplicateCnpjMessage?: string
	insurerOptions: { value: string; label: string }[]
	onToggleEnabled: (enabled: boolean) => void
	onChangeUseCurrentInsurer: (value: 'yes' | 'no') => void
}

export default function ChannelSection({
	control,
	channelEnabled,
	useCurrentInsurer,
	canUseCurrentInsurer,
	lockUseCurrentInsurer,
	invalidFields,
	duplicateCnpjMessage,
	insurerOptions,
	onToggleEnabled,
	onChangeUseCurrentInsurer,
}: ChannelSectionProps) {
	const isInvalid = (path: string) => invalidFields.has(path)

	return (
		<div className="rounded-2xl border bg-white p-5 shadow-sm space-y-5">
			<div className="flex flex-col gap-2">
				<p className="text-sm font-medium text-primary">Cadastrar canal agora?</p>
				<RadioGroup
					value={channelEnabled ? 'yes' : 'no'}
					onValueChange={value => onToggleEnabled(value === 'yes')}
					className="grid grid-cols-2 gap-3 sm:max-w-xs"
				>
					<RadioOption value="yes" label="Sim" />
					<RadioOption value="no" label="Não, vincular no produto." />
				</RadioGroup>
				<p className="text-sm text-muted-foreground">Um canal precisa estar ligado a uma seguradora única.</p>
			</div>

			{channelEnabled ? (
				<>
					<div className="space-y-3">
						<p className="text-sm font-medium text-primary">Vincular seguradora</p>
						<RadioGroup
							value={lockUseCurrentInsurer ? 'yes' : useCurrentInsurer ? 'yes' : 'no'}
							onValueChange={value => {
								if (lockUseCurrentInsurer) {
									onChangeUseCurrentInsurer('yes')
									return
								}
								if (value === 'yes' && !canUseCurrentInsurer) {
									onChangeUseCurrentInsurer('no')
									return
								}
								onChangeUseCurrentInsurer(value as 'yes' | 'no')
							}}
							className="grid grid-cols-2 gap-3 sm:max-w-md"
						>
							<RadioOption value="yes" label="Vincular seguradora atual" disabled={!canUseCurrentInsurer} />
							<RadioOption value="no" label="Selecionar na lista" disabled={lockUseCurrentInsurer} />
						</RadioGroup>

						{!useCurrentInsurer && !lockUseCurrentInsurer && (
							<div className="space-y-2">
								<Label htmlFor="channelInsurer">Selecione a seguradora</Label>
								<Controller
									name="channel.insurerId"
									control={control}
									render={({ field }) => (
										<SelectComp
											placeholder="Escolha uma seguradora"
											options={insurerOptions}
											value={field.value ?? ''}
											onValueChange={field.onChange}
										/>
									)}
								/>
							</div>
						)}
					</div>

					<div className="border-b border-muted" />

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="channelCnpj">CNPJ do canal</Label>
							<Controller
								name="channel.cnpj"
								control={control}
								render={({ field }) => (
									<>
										<Input
											id="channelCnpj"
											placeholder="00.000.000/0000-00"
											mask="99.999.999/9999-99"
											className={isInvalid('channel.cnpj') ? 'border-destructive focus:ring-destructive' : ''}
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
							<Label htmlFor="channelName">Nome do canal</Label>
							<Controller
								name="channel.name"
								control={control}
								render={({ field }) => (
									<Input
										id="channelName"
										placeholder="Digite o nome do canal"
										className={isInvalid('channel.name') ? 'border-destructive focus:ring-destructive' : ''}
										{...field}
									/>
								)}
							/>
						</div>
					</div>
				</>
			) : (
				<div className="text-sm text-muted-foreground">
					Você pode pular esta etapa agora e cadastrar o canal depois, mas lembre-se: ele sempre precisa estar
					ligado a uma seguradora.
				</div>
			)}
		</div>
	)
}
