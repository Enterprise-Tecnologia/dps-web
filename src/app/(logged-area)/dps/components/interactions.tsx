'use client'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EllipsisVerticalIcon, UploadIcon } from 'lucide-react'
import { useState } from 'react'
import NewInteractionDialog from './new-interaction-dialog'
import { getProposalByUid } from '../actions'
import { set } from 'date-fns'
import UploadComplement from './upload-complement'

export type Interaction = {
	description: string
	status: { id: number; description: string }
	created: Date | string
}

export default function Interactions({
	data: dataProp,
	token,
	uid,
	proposalSituationId,
	onNewInteraction,
}: {
	data: Interaction[]
	proposalSituationId?: number
	token: string
	uid: string
	onNewInteraction: () => void
}) {
	const [data, setData] = useState<Interaction[]>(dataProp)

	async function reloadInteractions() {
		const proposalResponse = await getProposalByUid(token, uid)

		if (!proposalResponse) return

		const newInteractions = proposalResponse?.data?.history

		setData(newInteractions)
		onNewInteraction?.()
	}

	console.log(data)
	if (!data) return null

	return data.length > 0 ? (
		<div className="p-5 w-full max-w-7xl mx-auto bg-white rounded-3xl">
			<div className="flex justify-between gap-5">
				<h4 className="basis-1 grow text-lg text-primary mb-2">Interações</h4>
				{/* <div className="flex justify-center basis-1 grow">
					{proposalSituationId === 5 ? (
						<Button size="sm">
							<UploadIcon size={14} className="mr-2" />
							Upload complemento
						</Button>
					) : null}
				</div> */}
				<div className="flex justify-end basis-1 grow">
					{proposalSituationId === 4 ? (
						<NewInteractionDialog
							token={token}
							uid={uid}
							status={5}
							onSubmit={reloadInteractions}
						/>
					) : null}
					{proposalSituationId === 5 ? (
						<UploadComplement
							token={token}
							proposalUid={uid}
							interactionDescription={data[0]?.description}
							onSubmit={reloadInteractions}
						/>
					) : null}
				</div>
			</div>
			<ul>
				{data.map((interaction, index) => {
					if (!interaction.description) return null

					return (
						<li
							key={index}
							className="w-full flex mt-2 justify-between items-center p-2 border rounded-xl"
						>
							<div className="grow-0 basis-10">
								<Badge variant="outline">{index + 1}</Badge>
							</div>
							<div className="pl-5 grow basis-1 text-left">
								{interaction?.description}
							</div>

							<div className="grow-0 px-3">
								<Badge variant="warn" shape="pill">
									{interaction?.status?.description}
								</Badge>
							</div>
							<div className="grow-0 px-3">
								{formatDate(interaction?.created)}
							</div>
						</li>
					)
				})}
			</ul>
		</div>
	) : (
		<div className="p-5 w-full max-w-7xl mx-auto bg-white rounded-3xl">
			<div className="flex justify-between gap-5">
				<h4 className="text-lg text-primary mb-2">Interações</h4>
			</div>
			<div className="text-muted-foreground">Nenhuma interação registrada</div>
		</div>
	)

	// return (
	// 	<div>
	// 		<Accordion type="single" collapsible>
	// 			<AccordionItem value="item-1" className="p-2 border rounded-xl">
	// 				<AccordionTrigger hideArrow className="hover:no-underline p-1">
	// 					<div className="grow-0 basis-10">
	// 						<Badge variant="outline">1</Badge>
	// 					</div>
	// 					<div className="pl-5 grow basis-1 text-left">
	// 						Responsáveis notificados para assinatura
	// 					</div>
	// 					<div className="grow basis-1">
	// 						<Badge variant="warn" shape="pill">
	// 							Pend. Assinatura
	// 						</Badge>
	// 					</div>
	// 					<div className="grow basis-1">{formatDate(date)}</div>
	// 					<div>
	// 						<Button variant="ghost" size="icon" className="rounded-full">
	// 							<EllipsisVerticalIcon />
	// 						</Button>
	// 					</div>
	// 				</AccordionTrigger>
	// 				<AccordionContent className="rounded-b-lg bg-gray-100">
	// 					Proponente assinou
	// 				</AccordionContent>
	// 			</AccordionItem>
	// 		</Accordion>
	// 	</div>
	// )
}

export function formatDate(date: Date | string) {
	if (!date) return null
	if (typeof date === 'string') {
		date = new Date(date)
	}
	return `${date.getHours().toString().padStart(2, '0')}:${date
		.getMinutes()
		.toString()
		.padStart(2, '0')} - ${date.toLocaleDateString('pt-BR')}`
}
