'use client'

import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import NewInteractionDialog from './new-interaction-dialog'
import { getProposalByUid } from '../actions'
import { statusDescriptionDict } from './details-present'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export type Interaction = {
	description: string
	statusId: number
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
	const [isFirstRender, setIsFirstRender] = useState(true)

	useEffect(() => {
		if (!isFirstRender) return
		setIsFirstRender(false)
	}, [isFirstRender])

	async function reloadInteractions() {
		if (isFirstRender) return

		const proposalResponse = await getProposalByUid(token, uid)

		if (!proposalResponse) return

		const newInteractions = proposalResponse?.data?.history

		setData(newInteractions)
		onNewInteraction?.()
	}

	if (!data) return null

	return data.length > 0 ? (
		<div className="p-5 w-full max-w-7xl mx-auto bg-white rounded-3xl">
			<Accordion type="single" collapsible>
			<AccordionItem value="item-1" className="last:border-none">
				<AccordionTrigger className="flex items-center">
					<h4 className="basis-1 grow text-lg text-primary mb-2 text-left">Interações</h4>
				</AccordionTrigger>
				<AccordionContent>
					<div className="flex justify-between gap-5">
						{/* <h4 className="basis-1 grow text-lg text-primary mb-2">Interações</h4> */}
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
						</div>
					</div>
					<ul>
						{data.map((interaction, index) => {
							if (!interaction.description) return null

							return (
								<InteractionItem
									key={index}
									index={index}
									interaction={interaction}
								/>
							)
						})}
					</ul>	
				</AccordionContent>
			</AccordionItem>
			</Accordion>
		</div>
	) : (
		<div className="p-5 w-full max-w-7xl mx-auto bg-white rounded-3xl">
			<div className="flex justify-between gap-5">
				<h4 className="text-lg text-primary mb-2">Interações</h4>
			</div>
			<div className="text-muted-foreground">Nenhuma interação registrada</div>
		</div>
	)
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

function InteractionItem({
	index,
	interaction,
}: {
	index: number
	interaction: Interaction
}) {
	return (
		<li className="w-full flex mt-2 p-4 justify-between items-center border rounded-xl bg-[#F4F7F7]">
			<div className="grow-0 basis-10">
				<Badge variant="outline" className="text-muted-foreground bg-white">
					{index + 1}
				</Badge>
			</div>
			<div className="pl-5 grow basis-1 text-left">
				{interaction?.description}
			</div>

			<div className="grow-0 px-3">
				<Badge variant="warn" shape="pill">
					{statusDescriptionDict[interaction?.statusId]}
				</Badge>
			</div>
			<div className="grow-0 px-3">{formatDate(interaction?.created)}</div>
		</li>
	)
}
