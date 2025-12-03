import { Controller, type Control } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import SelectComp from '@/components/ui/select-comp'
import { RadioGroup } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { maskToBrlCurrency } from '@/lib/utils'
import RadioOption from './radio-option'
import type { PartnerFormValues } from '../partner-form-schema'

type ProductSectionProps = {
	control: Control<PartnerFormValues>
	productEnabled: boolean
	useCurrentChannel: boolean
	canUseCurrentChannel: boolean
	lockUseCurrentChannel: boolean
	dfiEnabled: boolean
	dfiFile: string
	channelOptions: { value: string; label: string }[]
	onToggleEnabled: (enabled: boolean) => void
	onChangeUseCurrentChannel: (value: 'yes' | 'no') => void
	onChangeDfiEnabled: (value: 'yes' | 'no') => void
	invalidFields: Set<string>
}

export default function ProductSection({
	control,
	productEnabled,
	useCurrentChannel,
	canUseCurrentChannel,
	lockUseCurrentChannel,
	dfiEnabled,
	dfiFile,
	channelOptions,
	onToggleEnabled,
	onChangeUseCurrentChannel,
	onChangeDfiEnabled,
	invalidFields,
}: ProductSectionProps) {
	const isInvalid = (path: string) => invalidFields.has(path)

	return (
		<div className="rounded-2xl border bg-white p-5 shadow-sm space-y-6">
			<div className="flex flex-col gap-2">
				<p className="text-sm font-medium text-primary">Cadastrar produto agora?</p>
				<RadioGroup
					value={productEnabled ? 'yes' : 'no'}
					onValueChange={value => onToggleEnabled(value === 'yes')}
					className="grid grid-cols-2 gap-3 sm:max-w-xs"
				>
					<RadioOption value="yes" label="Sim" />
					<RadioOption value="no" label="Não" />
				</RadioGroup>
				<p className="text-sm text-muted-foreground">
					Produto precisa estar ligado a um canal (que por sua vez está vinculado a uma seguradora).
				</p>
			</div>

			{productEnabled ? (
				<div className="space-y-8">
					<section className="space-y-3">
						<p className="text-sm font-medium text-primary">Vincular canal</p>
						<RadioGroup
							value={lockUseCurrentChannel ? 'yes' : useCurrentChannel ? 'yes' : 'no'}
							onValueChange={value => {
								if (lockUseCurrentChannel) {
									onChangeUseCurrentChannel('yes')
									return
								}
								if (value === 'yes' && !canUseCurrentChannel) {
									onChangeUseCurrentChannel('no')
									return
								}
								onChangeUseCurrentChannel(value as 'yes' | 'no')
							}}
							className="grid grid-cols-2 gap-3 sm:max-w-md"
						>
							<RadioOption
								value="yes"
								label="Vincular canal atual"
								disabled={!canUseCurrentChannel}
							/>
							<RadioOption value="no" label="Selecionar na lista" disabled={lockUseCurrentChannel} />
						</RadioGroup>

						{!useCurrentChannel && !lockUseCurrentChannel && (
							<div className="space-y-2">
								<Label htmlFor="productChannel">Selecione o canal</Label>
								<Controller
									name="product.channelId"
									control={control}
									render={({ field }) => (
										<SelectComp
											placeholder="Escolha um canal"
											options={channelOptions}
											className={isInvalid('product.channelId') ? 'border-destructive focus:ring-destructive' : ''}
											value={field.value ?? ''}
											onValueChange={field.onChange}
										/>
									)}
								/>
							</div>
						)}
					</section>

					<div className="border-b border-muted/60" />

					<section className="space-y-3">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="productName">Nome do produto</Label>
								<Controller
									name="product.name"
									control={control}
									render={({ field }) => (
										<Input
											id="productName"
											placeholder="Digite o nome do produto"
											className={isInvalid('product.name') ? 'border-destructive focus:ring-destructive' : ''}
											{...field}
										/>
									)}
								/>
							</div>
						</div>
					</section>

					<div className="border-b border-muted/60" />

					<section className="space-y-3">
						<p className="text-sm font-medium text-primary">Modelos de aceitação</p>
						<Controller
							name="product.acceptanceModel"
							control={control}
							render={({ field }) => (
								<RadioGroup
									value={field.value}
									onValueChange={field.onChange}
									className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:max-w-md"
								>
									<RadioOption value="simplified" label="Modelo simplificado" />
									<RadioOption value="complete" label="Modelo completo" />
								</RadioGroup>
							)}
						/>
					</section>

					<div className="border-b border-muted/60" />

					<section className="space-y-3">
						<p className="text-sm font-medium text-primary">Limites de idade e prazos</p>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="ageMin">Idade mínima</Label>
								<Controller
									name="product.ageMin"
									control={control}
									render={({ field }) => (
										<Input
											id="ageMin"
											type="number"
											placeholder="Ex.: 18"
											className={isInvalid('product.ageMin') ? 'border-destructive focus:ring-destructive' : ''}
											{...field}
										/>
									)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="ageMax">Idade máxima</Label>
								<Controller
									name="product.ageMax"
									control={control}
									render={({ field }) => (
										<Input
											id="ageMax"
											type="number"
											placeholder="Ex.: 70"
											className={isInvalid('product.ageMax') ? 'border-destructive focus:ring-destructive' : ''}
											{...field}
										/>
									)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="maxTerm">Prazo máximo (meses)</Label>
								<Controller
									name="product.maxTerm"
									control={control}
									render={({ field }) => (
										<Input
											id="maxTerm"
											type="number"
											placeholder="Ex.: 360"
											className={isInvalid('product.maxTerm') ? 'border-destructive focus:ring-destructive' : ''}
											{...field}
										/>
									)}
								/>
								<p className="text-xs text-muted-foreground">Informe o prazo máximo em meses.</p>
							</div>
						</div>
					</section>


					<section className="space-y-3">
						<p className="text-sm font-medium text-primary">Produto possui DFI?</p>
						<RadioGroup
							value={dfiEnabled ? 'yes' : 'no'}
							onValueChange={value => onChangeDfiEnabled(value as 'yes' | 'no')}
							className="grid grid-cols-2 gap-3 sm:max-w-xs"
						>
							<RadioOption value="yes" label="Sim" />
							<RadioOption value="no" label="Não" />
						</RadioGroup>
					</section>


					<section className="space-y-3">
						<p className="text-sm font-medium text-primary">Capital segurado</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{dfiEnabled && (
								<div className="space-y-2">
									<Label htmlFor="dfiValueFixed">Valor DFI</Label>
									<Controller
										name="product.dfiValue"
										control={control}
										render={({ field }) => (
											<Input
												id="dfiValueFixed"
												type="text"
												placeholder="R$ 0,00"
												mask="R$ 9999999999999"
												beforeMaskedStateChange={maskToBrlCurrency}
												className={isInvalid('product.dfiValue') ? 'border-destructive focus:ring-destructive' : ''}
												{...field}
											/>
										)}
									/>
								<div className="space-y-1">
										<Label htmlFor="dfiFile">Anexar arquivo</Label>
										<Controller
											name="product.dfiFile"
											control={control}
											render={({ field }) => (
												<label
													className={`flex flex-col items-center justify-center rounded-xl border border-dashed bg-white px-4 py-6 text-center text-sm text-muted-foreground cursor-pointer transition-colors ${
														isInvalid('product.dfiFile')
															? 'border-destructive text-destructive'
															: 'border-muted-foreground/40 hover:border-primary/50'
													}`}
												>
													<div className="text-primary font-medium">Arraste ou selecione um arquivo</div>
													<div className="text-xs text-muted-foreground">Formatos: zip, imagem, pdf ou word</div>
													<input
														id="dfiFile"
														type="file"
														className="hidden"
														accept=".zip,.pdf,.doc,.docx,image/*"
														onChange={event => {
															const file = event.target.files?.[0]
															field.onChange(file ? file.name : '')
														}}
													/>
													{dfiFile ? (
														<div className="mt-2 text-xs text-primary font-medium break-all">{dfiFile}</div>
													) : null}
												</label>
											)}
										/>
									</div>
								</div>
							)}
							<div className="space-y-2">
								<Label htmlFor="productMip">MIP</Label>
								<Controller
									name="product.mipValue"
									control={control}
									render={({ field }) => (
										<Input
											id="productMip"
											type="text"
											placeholder="R$ 0,00"
											mask="R$ 9999999999999"
											beforeMaskedStateChange={maskToBrlCurrency}
											className={isInvalid('product.mipValue') ? 'border-destructive focus:ring-destructive' : ''}
											{...field}
										/>
									)}
								/>
								<p className="text-xs text-muted-foreground">Esse valor representa o limite máximo permitido.</p>
							</div>
						</div>
					</section>

					<div className="border-b border-muted/60" />

					<section className="space-y-3">
						<p className="text-sm font-medium text-primary">Exames médicos</p>
						<div className="space-y-2">
							<Label htmlFor="examsStandard">Exames padrão</Label>
							<Controller
								name="product.examsStandard"
								control={control}
								render={({ field }) => (
									<Textarea
										id="examsStandard"
										placeholder="Descreva os exames padrão"
										className="min-h-[80px]"
										{...field}
									/>
								)}
							/>
						</div>
						<div className="space-y-3">
							<p className="text-sm text-primary font-medium">Exames adicionais</p>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<Controller
									name="product.examsAdditionalMale"
									control={control}
									render={({ field }) => (
										<div className="space-y-2 rounded-xl border bg-white p-3 shadow-sm">
											<label className="flex items-center gap-2 text-sm">
												<input
													type="checkbox"
													checked={field.value}
													onChange={e => field.onChange(e.target.checked)}
												/>
												<span>Homens</span>
											</label>
											{field.value && (
												<Controller
													name="product.examsAdditionalMaleAge"
													control={control}
									render={({ field: ageField }) => (
										<div className="space-y-1">
											<Label htmlFor="examsAdditionalMaleAge">Idade limite</Label>
											<Input
												id="examsAdditionalMaleAge"
												type="number"
												placeholder="Ex.: 60"
												className={
													isInvalid('product.examsAdditionalMaleAge')
														? 'border-destructive focus:ring-destructive'
														: ''
												}
												{...ageField}
											/>
										</div>
									)}
								/>
											)}
										</div>
									)}
								/>

								<Controller
									name="product.examsAdditionalFemale"
									control={control}
									render={({ field }) => (
										<div className="space-y-2 rounded-xl border bg-white p-3 shadow-sm">
											<label className="flex items-center gap-2 text-sm">
												<input
													type="checkbox"
													checked={field.value}
													onChange={e => field.onChange(e.target.checked)}
												/>
												<span>Mulheres</span>
											</label>
											{field.value && (
												<Controller
													name="product.examsAdditionalFemaleAge"
													control={control}
													render={({ field: ageField }) => (
														<div className="space-y-1">
															<Label htmlFor="examsAdditionalFemaleAge">Idade limite</Label>
															<Input
																id="examsAdditionalFemaleAge"
																type="number"
																placeholder="Ex.: 60"
																className={
																	isInvalid('product.examsAdditionalFemaleAge')
																		? 'border-destructive focus:ring-destructive'
																		: ''
																}
																{...ageField}
															/>
														</div>
													)}
												/>
											)}
										</div>
									)}
								/>
							</div>
						</div>
					</section>

					<div className="border-b border-muted/60" />

					<section className="space-y-3">
						<p className="text-sm font-medium text-primary">Tipo de imóvel</p>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
							<Controller
								name="product.propertyResidential"
								control={control}
								render={({ field }) => (
									<label
										className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2 shadow-sm text-sm ${
											isInvalid('product.property') ? 'border-destructive' : ''
										}`}
									>
										<input
											type="checkbox"
											checked={field.value}
											onChange={e => field.onChange(e.target.checked)}
										/>
										<span>Residencial</span>
									</label>
								)}
							/>
							<Controller
								name="product.propertyCommercial"
								control={control}
								render={({ field }) => (
									<label
										className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2 shadow-sm text-sm ${
											isInvalid('product.property') ? 'border-destructive' : ''
										}`}
									>
										<input
											type="checkbox"
											checked={field.value}
											onChange={e => field.onChange(e.target.checked)}
										/>
										<span>Comercial</span>
									</label>
								)}
							/>
							<Controller
								name="product.propertyMixed"
								control={control}
								render={({ field }) => (
									<label
										className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2 shadow-sm text-sm ${
											isInvalid('product.property') ? 'border-destructive' : ''
										}`}
									>
										<input
											type="checkbox"
											checked={field.value}
											onChange={e => field.onChange(e.target.checked)}
										/>
										<span>Misto</span>
									</label>
								)}
							/>
						</div>
					</section>
				</div>
			) : (
				<div className="text-sm text-muted-foreground">
					Você pode pular esta etapa e cadastrar produtos depois, vinculando-os a um canal existente.
				</div>
			)}
		</div>
	)
}
