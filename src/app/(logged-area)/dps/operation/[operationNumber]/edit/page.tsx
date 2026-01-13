import { redirect } from 'next/navigation'
import getServerSessionAuthorization from '@/hooks/getServerSessionAuthorization'
import {
	getParticipantsByOperation,
	getProductList,
	getProposalByUid,
	getTipoImovelOptions,
} from '../../../actions'
import OperationEditForm from './components/operation-edit-form'

export const revalidate = 0
export const dynamic = 'force-dynamic'

function toNumber(value: unknown): number | undefined {
	const n = Number(value)
	return Number.isFinite(n) ? n : undefined
}

export default async function OperationEditPage({
	params,
}: {
	params: { operationNumber: string }
}) {
	const { session, granted } = await getServerSessionAuthorization([
		'vendedor',
		'vendedor-sup',
	])
	if (!granted) redirect('/dashboard')

	const token = session?.accessToken ?? ''
	const operationNumber = decodeURIComponent(params.operationNumber)

	const participantsResponse = await getParticipantsByOperation(
		token,
		operationNumber
	)
	const participantsRaw = participantsResponse?.data ?? []

	if (!Array.isArray(participantsRaw) || participantsRaw.length === 0) {
		redirect(`/dps/operation/${encodeURIComponent(operationNumber)}`)
	}

	const principal = participantsRaw.find(
		(p: any) => p?.participantType === 'P'
	) ?? participantsRaw[0]
	const principalUid = principal?.uid as string | undefined
	if (!principalUid) {
		redirect(`/dps/operation/${encodeURIComponent(operationNumber)}`)
	}

	// Enriquecer participantes com status (para bloquear edição se algum estiver assinado)
	const participantsEnriched = await Promise.all(
		participantsRaw.map(async (p: any) => {
			const detail = p?.uid ? await getProposalByUid(token, p.uid) : null
			return {
				...p,
				status: detail?.data?.status,
			}
		})
	)

	const hasAnySigned =
		participantsEnriched.some((p: any) => p?.status?.id === 21) ?? false

	const [principalProposalRaw, productListRaw, tipoImovelRaw] =
		await Promise.all([
			getProposalByUid(token, principalUid),
			getProductList(token),
			getTipoImovelOptions(token),
		])

	const principalProposal = principalProposalRaw?.data
	if (!principalProposal) redirect(`/dps/details/${principalUid}`)

	const productOptions =
		productListRaw?.data?.map(item => ({
			value: item.uid,
			label: item.name,
		})) ?? []

	const propertyTypeOptions =
		tipoImovelRaw?.data?.map(item => ({
			value: item.id.toString(),
			label: item.description,
		})) ?? []

	const initialOperation = {
		productId: principalProposal.product?.uid ?? '',
		deadlineMonths:
			toNumber(principalProposal.deadlineMonths) ??
			toNumber(principal?.deadlineMonths) ??
			undefined,
		propertyTypeId:
			toNumber(principalProposal.propertyTypeId) ??
			toNumber(principal?.propertyTypeId) ??
			undefined,
		operationValue:
			toNumber(principal?.operationValue) ??
			toNumber(principalProposal.capitalMIP) ??
			undefined,
		totalParticipantsExpected:
			toNumber(principal?.totalParticipants) ??
			toNumber(participantsRaw.length) ??
			undefined,
		// Não existe leitura clara do canal na Proposal; inicializamos pelo canal atual da sessão no client.
		salesChannelUid: '',
	}

	return (
		<OperationEditForm
			operationNumber={operationNumber}
			principalUid={principalUid}
			initialOperation={initialOperation}
			productOptions={productOptions}
			propertyTypeOptions={propertyTypeOptions}
			participantsCount={participantsEnriched.length}
			hasAnySigned={hasAnySigned}
			participants={participantsEnriched.map((p: any) => ({
				uid: p?.uid,
				participantType: p?.participantType,
				name: p?.customer?.name,
				document: p?.customer?.document,
				percentageParticipation: p?.percentageParticipation,
				capitalMIP: p?.capitalMIP,
				capitalDFI: p?.capitalDFI,
				statusId: p?.status?.id,
				statusDescription: p?.status?.description,
				dfiStatusId: p?.dfiStatus?.id,
				dfiStatusDescription: p?.dfiStatus?.description,
			}))}
		/>
	)
}

