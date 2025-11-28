import { RadioGroupItem } from '@/components/ui/radio-group'

type RadioOptionProps = {
	value: string
	label: string
	disabled?: boolean
}

export default function RadioOption({ value, label, disabled = false }: RadioOptionProps) {
	return (
		<label
			className={`flex w-full max-w-full items-center gap-3 rounded-xl border px-4 py-3 bg-white shadow-sm min-h-[44px] ${
				disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'
			}`}
		>
			<RadioGroupItem value={value} disabled={disabled} />
			<span className="text-sm whitespace-normal leading-snug break-words">{label}</span>
		</label>
	)
}
