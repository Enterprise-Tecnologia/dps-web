import React from 'react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from './alert-dialog'

const DialogAlertComp = ({
	open = false,
	defaultOpen = false,
	onOpenChange,
	title,
	description,
	children,
	onConfirm,
	confirmText = 'Continuar',
}: {
	open?: boolean
	defaultOpen?: boolean
	onOpenChange?: (open: boolean) => void
	title: string
	description?: React.ReactNode
	children: React.ReactNode
	onConfirm?: () => void
	confirmText?: string
}) => {
	const isPlainText =
		typeof children === 'string' || typeof children === 'number'
	const descriptionContent = description ?? (isPlainText ? children : null)
	const bodyContent = !isPlainText ? children : null

	return (
		<AlertDialog
			open={open}
			defaultOpen={defaultOpen}
			onOpenChange={onOpenChange}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					{descriptionContent ? (
						<AlertDialogDescription>{descriptionContent}</AlertDialogDescription>
					) : null}
				</AlertDialogHeader>
				{bodyContent ? (
					<div className="text-sm text-muted-foreground">{bodyContent}</div>
				) : null}
				<AlertDialogFooter>
					<AlertDialogCancel>Fechar</AlertDialogCancel>
					{onConfirm ? (
						<AlertDialogAction onClick={onConfirm}>
							{confirmText}
						</AlertDialogAction>
					) : null}
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}

export default DialogAlertComp
