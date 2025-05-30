'use client'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { InfoIcon, PlusIcon } from 'lucide-react'
import { postProposalDocumentsByUid } from '../actions'
import { getBase64 } from '@/lib/utils'
import FileInput from '@/components/ui/file-input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

const UploadReport = ({
	token,
	proposalUid,
	onSubmit: onSubmitProp,
	type: typeProp,
	disabled = false,
}: {
	token: string
	proposalUid: string
	reportDescription: string
	type: 'MIP' | 'DFI'
	disabled?: boolean
	onSubmit?: () => void
}) => {
	const [isLoading, setIsLoading] = useState(false)
	const [isOpen, setIsOpen] = useState(false)
	const [message, setMessage] = useState<string>('')
	const [file, setFile] = useState<File | undefined>(undefined)
	const [error, setError] = useState<string | undefined>(undefined)

	function handleSelectFile(file: File) {
		if (file) {
			setFile(file)
		}
	}

	async function handleSubmit() {
		if (message === '' || (typeProp === 'DFI' && !file)) return

		setIsLoading(true)

		const fileBase64 = file ? ((await getBase64(file)) as string) : ''

		const postFileData = {
			documentName: file?.name ?? '',
			description: (typeProp === 'DFI' ? 'DFI: ' : 'MIP: ') + message,
			stringBase64: fileBase64.split(',')[1] ?? '',
			type: typeProp,
		}

		const resAttachment = await postProposalDocumentsByUid(
			token,
			proposalUid,
			postFileData
		)

		if (resAttachment) {
			if (resAttachment.success) {
				setIsLoading(false)
				setIsOpen(false)
				setFile(undefined)
				setMessage('')
				setError(undefined)
				onSubmitProp?.()
			} else {
				setIsLoading(false)
				setError(resAttachment.message)
				console.error(resAttachment.message)
			}
		} else {
			setIsLoading(false)
			let errorMessage = ''
			if (!resAttachment) errorMessage += 'Upload falhou\n'
			setError(errorMessage)
		}
	}

	function toggleDialog() {
		setIsOpen(prev => !prev)
	}

	return (
		<Dialog open={isOpen} onOpenChange={toggleDialog}>
			<Button
				size="sm"
				variant="outline"
				onClick={toggleDialog}
				disabled={disabled}
			>
				<PlusIcon size={14} className="mr-2" />
				Adicionar laudo
			</Button>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>
						{typeProp === 'DFI'
							? 'Adicione o laudo'
							: 'Adicione o laudo/complemento'}
					</DialogTitle>
				</DialogHeader>
				<div>
					<Label htmlFor="description">
						{typeProp === 'DFI'
							? 'Descreva o laudo'
							: 'Descreva o laudo/complemento:'}
					</Label>
					<Textarea
						id="description"
						placeholder="Descrição da interação"
						className="col-span-3 max-h-96"
						onChange={e => setMessage(e.target.value)}
						value={message}
					/>
				</div>
				<div>
					<Label>
						{typeProp === 'DFI'
							? 'Anexe o laudo:'
							: 'Anexe o laudo/complemento:'}{' '}
						{/* <span className="text-xs text-muted-foreground">(opcional)</span> */}
					</Label>
					<FileInput
						id="complement"
						accept="application/pdf"
						wrapperClassName="w-full max-w-[550px]"
						disabled={isLoading}
						onChange={handleSelectFile as any}
						value={file}
						sizeLimit={100000000}
						// afterChange={handleAttachmentAfterChange}
					/>
					{error && <p className="text-sm text-red-500">{error}</p>}
					<Alert variant="info" disposable className={`mt-4`}>
						<InfoIcon size={20} className="text-primary-dark/60" />
						<AlertDescription>
							Inserir apenas arquivos com a extensão PDF e tamanho limite 10Mb.
						</AlertDescription>
					</Alert>
				</div>
				<DialogFooter>
					<Button
						variant={`outline`}
						type="button"
						onClick={() => [setFile(undefined), setMessage('')]}
					>
						Limpar
					</Button>
					<Button
						type="submit"
						disabled={
							isLoading ||
							// message === '' ||
							(typeProp === 'DFI' && file == undefined)
						}
						onClick={handleSubmit}
					>
						Adicionar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default UploadReport
