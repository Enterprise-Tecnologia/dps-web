import { ChevronsUpDown, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type Option = { label: string; value: string }

type PartnerFilterBarProps = {
	selectedInsurers: string[]
	showCancelled: boolean
	options: Option[]
	onChangeInsurers: (values: string[]) => void
	onToggleCancelled: (checked: boolean) => void
}

export default function PartnerFilterBar({
	selectedInsurers,
	showCancelled,
	options,
	onChangeInsurers,
	onToggleCancelled,
}: PartnerFilterBarProps) {
	function handleToggleInsurer(value: string, checked: boolean) {
		const exists = selectedInsurers.includes(value)
		if (checked && !exists) {
			onChangeInsurers([...selectedInsurers, value])
			return
		}

		if (!checked && exists) {
			onChangeInsurers(selectedInsurers.filter(item => item !== value))
		}
	}

	const hasSelection = selectedInsurers.length > 0
	const selectionLabel = hasSelection
		? `${selectedInsurers.length} selecionada${selectedInsurers.length > 1 ? 's' : ''}`
		: 'Todas as seguradoras'

	return (
		<div className="flex flex-wrap items-start gap-4">
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-3">
					<Label htmlFor="insurer-filter" className="text-sm font-semibold text-primary">
						Filtrar por seguradora
					</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								id="insurer-filter"
								type="button"
								variant="outline"
								className="w-56 justify-between"
							>
								<span className="line-clamp-1 text-left">{selectionLabel}</span>
								<ChevronsUpDown className="h-4 w-4 opacity-50" aria-hidden="true" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-72 p-3">
							<div className="mb-2 flex items-center justify-between gap-2">
								<p className="text-sm font-semibold text-primary">Seguradoras</p>
								{hasSelection ? (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="h-8 px-2 text-xs"
										onClick={() => onChangeInsurers([])}
									>
										Limpar
									</Button>
								) : null}
							</div>
							<div className="max-h-64 space-y-2 overflow-y-auto pr-1">
								{options.length ? (
									options.map(option => (
										<label
											key={option.value}
											className="flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-1.5 text-sm transition-colors hover:border-primary/60"
										>
											<Checkbox
												checked={selectedInsurers.includes(option.value)}
												onCheckedChange={checked =>
													handleToggleInsurer(option.value, Boolean(checked))
												}
												aria-label={`Selecionar ${option.label}`}
											/>
											<span className="text-foreground">{option.label}</span>
										</label>
									))
								) : (
									<p className="text-xs text-muted-foreground">Nenhuma seguradora ativa.</p>
								)}
							</div>
						</PopoverContent>
					</Popover>
				</div>
				{hasSelection ? (
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-xs text-muted-foreground">Exibindo:</span>
						{selectedInsurers.map(insurer => (
							<Badge key={insurer} variant="secondary" className="flex items-center gap-1">
								<span className="text-xs">{insurer}</span>
								<button
									type="button"
									aria-label={`Remover ${insurer} do filtro`}
									className="text-muted-foreground transition-colors hover:text-foreground"
									onClick={() => handleToggleInsurer(insurer, false)}
								>
									<X className="h-3 w-3" />
								</button>
							</Badge>
						))}
					</div>
				) : (
					<span className="text-xs text-muted-foreground">Exibindo todas as seguradoras.</span>
				)}
			</div>

			<div className="ml-auto flex items-center gap-2">
				<label className="flex items-center gap-2 text-sm text-foreground">
					<Checkbox
						checked={showCancelled}
						onCheckedChange={checked => onToggleCancelled(Boolean(checked))}
						aria-label="Exibir ativos cancelados"
					/>
					<span>Exibir ativos cancelados?</span>
				</label>
			</div>
		</div>
	)
}
