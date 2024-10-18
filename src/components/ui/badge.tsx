import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
	'inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
	{
		variants: {
			variant: {
				default:
					'border-none bg-primary text-primary-foreground shadow hover:bg-primary/80',
				secondary:
					'border-none bg-secondary text-secondary-foreground hover:bg-secondary/80',
				destructive:
					'border-none bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
				warn: 'border-none bg-yellow-500 text-white hover:bg-yellow-500/80',
				success: 'border-none bg-green-300 text-white hover:bg-green-300/80',
				outline: 'text-foreground',
			},
			shape: {
				default: 'rounded-md',
				pill: 'rounded-full',
			},
		},
		defaultVariants: {
			variant: 'default',
			shape: 'default',
		},
	}
)

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, shape, ...props }: BadgeProps) {
	return (
		<div
			className={cn(badgeVariants({ variant, shape }), className)}
			{...props}
		/>
	)
}

export { Badge, badgeVariants }
