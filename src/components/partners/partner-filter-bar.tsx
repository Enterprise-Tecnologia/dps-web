import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

type Option = { label: string; value: string }

type PartnerFilterBarProps = {
	selectedInsurer: string
	showCancelled: boolean
	options: Option[]
	onChangeInsurer: (value: string) => void
	onToggleCancelled: (checked: boolean) => void
}

export default function PartnerFilterBar({
	selectedInsurer,
	showCancelled,
	options,
	onChangeInsurer,
	onToggleCancelled,
}: PartnerFilterBarProps) {
	return (
		<div className="flex flex-wrap items-start gap-4">
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-3">
					<Label htmlFor="insurer-filter" className="text-sm font-semibold text-primary">
						Filtrar por seguradora
					</Label>
					<Select value={selectedInsurer} onValueChange={onChangeInsurer}>
						<SelectTrigger id="insurer-filter" className="w-56">
							<SelectValue placeholder="Todas as seguradoras" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todas as seguradoras</SelectItem>
							{options.map(option => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				{selectedInsurer !== 'all' ? (
					<span className="text-xs text-muted-foreground">
						Exibindo somente: <span className="text-foreground font-medium">{selectedInsurer}</span>
					</span>
				) : null}
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
