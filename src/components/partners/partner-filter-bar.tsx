import { Label } from '@/components/ui/label'
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
	options: Option[]
	onChange: (value: string) => void
}

export default function PartnerFilterBar({ selectedInsurer, options, onChange }: PartnerFilterBarProps) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			<Label htmlFor="insurer-filter" className="text-sm font-semibold text-primary">
				Filtrar por seguradora
			</Label>
			<Select value={selectedInsurer} onValueChange={onChange}>
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
			{selectedInsurer !== 'all' ? (
				<span className="text-xs text-muted-foreground">
					Exibindo somente: <span className="text-foreground font-medium">{selectedInsurer}</span>
				</span>
			) : null}
		</div>
	)
}
