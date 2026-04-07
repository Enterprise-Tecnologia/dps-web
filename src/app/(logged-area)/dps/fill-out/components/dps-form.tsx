'use client'

import React, { useEffect, useState } from 'react'
import DpsHealthForm, {
	HealthForm,
	HealthFormHdiHomeEquity,
	HealthFormMagHabitacional,
	HealthFormMagHabitacionalSimplified,
	DpsHealthFormValue,
} from './dps-health-form'
import { UserIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import DpsAttachmentsForm, { AttachmentsForm } from './dps-attachments-form'
import Link from 'next/link'
import MedReports from '../../components/med-reports'
import { useSession } from 'next-auth/react'
import { DpsInitialForm } from './dps-initial-form'
import { ProposalByUid, signProposal } from '../../actions'
import { isFhePoupexProduct, isHomeEquityProduct, isMagHabitacionalProduct } from '@/constants'
import { calculateAgeYears, getMagHabitacionalDpsMode } from '@/utils/mag-habitacional-dps'


export const diseaseNamesHomeEquity = {
	'1': 'Acidente Vascular Cerebral',
	'2': 'AIDS',
	'3': 'Alzheimer',
	'4': 'Arteriais Crônicas',
	'5': 'Chagas',
	'6': 'Cirrose Hepática e Varizes de Estômago',
	'7': 'Diabetes com complicações',
	'8': 'Enfisema Pulmonar e Asma',
	'9': 'Esclerose Múltipla',
	'10': 'Espondilose Anquilosante',
	'11': 'Hipertensão, Infarto do Miocárdio ou outras doenças cardiocirculatórias',
	'12': 'Insuficiência Coronariana',
	'13': 'L.E.R.',
	'14': 'Lúpus',
	'15': 'Neurológicas ou Psiquiátricas - (vertigem, desmaio, convulsão, dificuldade de fala, doenças ou alterações mentais ou de nervos)',
	'16': 'Parkinson',
	'17': 'Renal Crônica (com ou sem hemodiálise)',
	'18': 'Sequelas de Acidente Vascular Celebral',
	'19': 'Shistosomose',
	'20': 'Tireóide ou outras Doenças Endócrinas com complicações',
	'21': 'Tumores malignos e Câncer',
	'22': 'Tem deficiência de órgãos, membros ou sentidos? Se SIM, especificar abaixo qual é o grau de deficiência e redução.',
	'23': 'Nos últimos cinco anos, submeteu-se a tratamento cirúrgico, cateterismo ou hospitalizou-se por período superior a dez dias; realizou ourealiza exames de controle de qualquer natureza por uma ou mais vezes ao ano pela mesma doença? Se sim, especificar.',
	'24': 'Encontra-se aposentado por invalidez? Se SIM, especifique no campo abaixo a natureza ou causa da invalidez e o ano em que passou areceber o benefício da Previdência Social.',
	'25': 'Pratica de forma amadora ou profissional, esporte(s) radical(is) ou perigoso(s)? Se SIM, informar qual(is) e sua periodicidade?',
	'26': 'Está de acordo para entrarmos em contato telefônico referente ao seu estado de saúde, se necessário? Se sim, preencher com o número de telefone (DDD+número)',
};

export const diseaseNamesHabitacional = {
	'1': 'Acidente Vascular Cerebral',
	'2': 'AIDS',
	'3': 'Alzheimer',
	'4': 'Arteriais Crônicas',
	'5': 'Chagas',
	'6': 'Cirrose Hepática e Varizes de Estômago',
	'7': 'Diabetes com complicações',
	'8': 'Enfisema Pulmonar e Asma',
	'9': 'Esclerose Múltipla',
	'10': 'Espondilose Anquilosante',
	'11': 'Hipertensão, Infarto do Miocárdio ou outras doenças cardiocirculatórias',
	'12': 'Insuficiência Coronariana',
	'13': 'L.E.R.',
	'14': 'Lúpus',
	'15': 'Neurológicas ou Psiquiátricas - (vertigem, desmaio, convulsão, dificuldade de fala, doenças ou alterações mentais ou de nervos)',
	'16': 'Parkinson',
	'17': 'Renal Crônica (com ou sem hemodiálise)',
	'18': 'Sequelas de Acidente Vascular Celebral',
	'19': 'Shistosomose',
	'20': 'Tireóide ou outras Doenças Endócrinas com complicações',
	'21': 'Tem deficiência de órgãos, membros ou sentidos? Se SIM, especificar abaixo qual é o grau de deficiência e redução.',
	'22': 'Nos últimos cinco anos, submeteu-se a tratamento cirúrgico, cateterismo ou hospitalizou-se por período superior a dez dias; realizou ourealiza exames de controle de qualquer natureza por uma ou mais vezes ao ano pela mesma doença? Se sim, especificar.',
	'23': 'Encontra-se aposentado por invalidez? Se SIM, especifique no campo abaixo a natureza ou causa da invalidez e o ano em que passou areceber o benefício da Previdência Social.',
	'24': 'Pratica de forma amadora ou profissional, esporte(s) radical(is) ou perigoso(s)? Se SIM, informar qual(is) e sua periodicidade?',
	'25': 'Está de acordo para entrarmos em contato telefônico referente ao seu estado de saúde, se necessário? Se sim, preencher com o número de telefone (DDD+número)',
};

/* export const diseaseNames = {
	'1': 'Sofre ou sofreu nos últimos cinco anos de doença que o tenha levado ao médico entre duas ou mais vezes no decorrer deste período eutilizado medicação para o controle dessa doença? Se sim, especificar e detalhar.',
	'2': 'Tem deficiência de órgãos, membros ou sentidos? Se SIM, especificar abaixo qual é o grau de deficiência e redução.',
	'3': 'Nos últimos cinco anos, submeteu-se a tratamento cirúrgico, cateterismo ou hospitalizou-se por período superior a dez dias; realizou ourealiza exames de controle de qualquer natureza por uma ou mais vezes ao ano pela mesma doença? Se sim, especificar.',
	'4': 'Encontra-se aposentado por invalidez? Se SIM, especifique no campo abaixo a natureza ou causa da invalidez e o ano em que passou areceber o benefício da Previdência Social.',
	'5': 'Pratica de forma amadora ou profissional, esporte(s) radical(is) ou perigoso(s)? Se SIM, informar qual(is) e sua periodicidade?',
	'6': 'Está de acordo para entrarmos em contato telefônico referente ao seu estado de saúde, se necessário? Se sim, preencher com o número de telefone (DDD+número)',
	telefoneContato: 'Telefone de Contato',
}; */

export type DiseaseKeys = keyof typeof diseaseNamesHabitacional;

// DPS MAG Habitacional - 31 questões (todas Sim/Não + descrição)
export const diseaseNamesMagHabitacional = {
	'1': 'Alguma seguradora já recusou segurar, renovar ou reintegrar, agravou, modificou ou cancelou seguro de vida em seu nome? Informe data e motivo Alegado.',
	'2': 'Possui apólice de seguro em vigor? Se sim, especifique: seguradora, coberturas e valores de capitais.',
	'3': 'Costuma viajar em aeronaves pequenas (táxis aéreos, aeronaves particulares, helicópteros etc)?',
	'4': 'Você pretende realizar uma viagem internacional, seja a lazer ou a negócios, com estadia superior a 3 (três) meses nos próximos 2 (dois) anos? Especifique o país de destino.',
	'5': 'Você é tripulante profissional ou amador de qualquer tipo de aeronave, pratica ou pretende praticar, de forma amadora ou profissional, alguma atividade considerada perigosa, tais como: mergulho (mar/rios/lagos acima de 40m de profundidade, naufrágios e mergulho em caverna), paraquedismo, motociclismo de velocidade, motocross, rodeio, alpinismo, voo livre, automobilismo, bungee jumping, luta livre ou MMA?',
	'6': 'Algum parente faleceu antes dos 60 anos de idade? Especifique as causas.',
	'7': 'Algum parente próximo (pais e irmãos) sofre ou já sofreu de câncer, diabetes, distúrbio do coração, rim policístico ou distúrbio mental ou nervoso, ou alguma outra doença que o tenha obrigado a consultar médico(s) para tratamento/acompanhamento, hospitalizar-se, internar-se em sanatório ou afastar-se de suas atividades normais de trabalho?',
	'8': 'Faz uso habitual de algum medicamento?',
	'9': 'Nos últimos 5 anos, foi internado ou realizou cirurgia?',
	'10': 'Diabetes, hiperglicemia, hipoglicemia, intolerância a glicose?',
	'11': 'Infarto do miocárdio, arritmia (alteração do ritmo cardíaco), sopros, endocardite, implante de stent ou safena ou qualquer doença ou anormalidade do coração?',
	'12': 'Hipertensão arterial?',
	'13': 'Anemia, trombose, varizes ou qualquer doença ou anormalidade no sangue ou artérias?',
	'14': 'Tuberculose, asma, enfisema pulmonar ou qualquer outra doença ou anormalidade dos pulmões, brônquios, garganta ou do sistema respiratório?',
	'15': 'Acidente vascular cerebral (hemorrágico ou isquêmico), epilepsia, vertigens, neurite, paralisia ou qualquer outra doença ou anormalidade do sistema nervoso?',
	'16': 'Transtornos ansiosos, do humor ou depressivos?',
	'17': 'Cálculo nas vias urinárias, nefrite, malformação renal ou qualquer outra doença ou anormalidade do aparelho urinário?',
	'18': 'Miomas, cistos nos ovários, alterações nas trompas uterinas, doenças na próstata, nos testículos ou outras doenças do aparelho genital?',
	'19': 'Doenças na tireoide ou qualquer doença endócrina (glandular)?',
	'20': 'Doenças no estômago, intestinos, vesícula biliar ou fígado (hepatite B ou C, cirrose...)?',
	'21': 'Artrite, gota, hérnia de disco ou outras alterações na coluna vertebral, ou qualquer outra doença ou anormalidade das articulações, dos músculos ou ossos?',
	'22': 'Alguma doença ou anormalidade dos olhos, ouvidos, pele, garganta ou nariz?',
	'23': 'Algum tipo de tumor benigno ou maligno (câncer, linfoma, melanoma...)?',
	'24': 'Deficiência de membros ou paralisias?',
	'25': 'Doenças imunológicas, HIV ou complicações relacionadas a este?',
	'26': 'Nos últimos 5 anos, você foi aconselhado a realizar algum exame ou tratamento que ainda não foi realizado?',
	'27': 'Nos últimos 10 anos, fez uso de anfetaminas, sedativos, maconha, cocaína ou barbitúricos?',
	'28': 'Nos últimos 10 anos, fez tratamento ou frequentou instituição para tratamento de alcoolismo ou de drogas?',
	'29': 'Nos últimos 5 anos, você apresentou dificuldade de respirar, dor ou pressão no peito?',
	'30': 'Alguma outra doença, distúrbio ou informação não mencionada acima?',
	'31': 'Apenas para mulheres: Está grávida? Informar o período de gestação e se existiu ou existe alguma complicação.'
};

const MAG_SIMPLIFIED_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const

/** DPS MAG simplificada (12 questões — texto próprio, distinto do formulário completo de 31 itens) */
export const diseaseNamesMagHabitacionalSimplified = {
	'1': 'Encontra-se com algum problema de saúde ou faz uso de algum medicamento?',
	'2': 'Sofre ou já sofreu de doença crônica ou incurável, doenças do coração, hipertensão, circulatórias, do sangue, diabetes, pulmão, fígado, rins, infarto, acidente vascular cerebral, doenças do aparelho digestivo, algum tipo de hérnia, articulações, qualquer tipo de câncer, ou HIV?',
	'3': 'Sofre ou sofreu de deficiências de órgãos, membros ou sentidos, incluindo doenças ortopédicas ou relacionadas a esforço repetitivo (LER e DORT)?',
	'4': 'Fez alguma cirurgia, biópsia ou esteve internado nos últimos cinco anos? Ou está ciente de alguma condição médica que possa resultar em uma hospitalização ou cirurgia?',
	'5': 'Está afastado(a) do trabalho ou aposentado por doença ou invalidez?',
	'6': 'Pratica paraquedismo, motociclismo, boxe, asa delta, rodeio, alpinismo, voo livre, automobilismo, mergulho ou exerce atividade, em caráter profissional ou amador, a bordo de aeronaves, que não sejam de linhas regulares?',
	'7': 'É fumante? A quanto tempo?',
	'8': 'Apresenta, no momento, sintomas de gripe, febre, cansaço, tosse, coriza, dores pelo corpo, dor de cabeça, dor de garganta, falta de ar, perda de olfato, perda de paladar ou está aguardando resultado do teste da COVID19?',
	'9': 'Foi diagnosticado(a) com infecção pelo novo CORONAVÍRUS ou COVID-19?',
	'10': 'Apresenta, no momento, sequelas do COVID19 diferente de perda de olfato e/ou paladar?',
	'11': 'Qual sua altura (em metros)? Exemplo: 1,80',
	'12': 'Qual o seu peso (em kg)? Exemplo: 80',
} as const satisfies Record<(typeof MAG_SIMPLIFIED_KEYS)[number], string>

export function isMagHabitacionalSimplifiedQuestionCode(code: string): boolean {
	return MAG_SIMPLIFIED_KEYS.includes(code as (typeof MAG_SIMPLIFIED_KEYS)[number])
}

const DpsForm = ({
	initialProposalData,
	initialHealthData: initialHealthDataProp,
}: {
	initialProposalData: ProposalByUid
	initialHealthData?: {
		code: string
		question: string
		exists: boolean
		created: string
		updated?: string
		description?: string
	}[]
}) => {
	const session = useSession()
	const token = (session.data as any)?.accessToken

	const params = useParams<{ uid: string }>()
	const uid = params.uid

	const productTypeDiseaseNames = isHomeEquityProduct(initialProposalData.product.name) || isFhePoupexProduct(initialProposalData.product.name);

	const isMag = isMagHabitacionalProduct(initialProposalData.product.name)
	const magDpsMode = isMag
		? getMagHabitacionalDpsMode(
				calculateAgeYears(new Date(initialProposalData.customer.birthdate)),
				initialProposalData.capitalMIP
			)
		: null

	// Processamento dos dados de saúde inicial baseado no tipo de produto
	const initialHealthData = initialHealthDataProp
		? (() => {
			if (isMag && magDpsMode === 'simplified') {
				return initialHealthDataProp.reduce((acc, item) => {
					if (!isMagHabitacionalSimplifiedQuestionCode(item.code)) return acc
					return {
						...acc,
						[item.code]: {
							has: item.exists ? 'yes' : 'no',
							description: item.description ?? '',
						},
					}
				}, {} as HealthFormMagHabitacionalSimplified)
			}

			if (isMag) {
				return initialHealthDataProp.reduce((acc, item) => {
					return {
						...acc,
						[item.code]: {
							has: item.exists ? 'yes' : 'no',
							description: item.description ?? '',
						},
					};
				}, {} as HealthFormMagHabitacional);
			} else {
				return Object.keys(productTypeDiseaseNames ? diseaseNamesHomeEquity : diseaseNamesHabitacional).reduce((acc, curr, i) => {
					if (initialHealthDataProp[i])
						return {
							...acc,
							[initialHealthDataProp[i].code]: {
								has: initialHealthDataProp[i].exists ? 'yes' : 'no',
								description: initialHealthDataProp[i].description ?? '',
							},
						}
					return acc
				}, {} as HealthForm);
			}
		})()
		: undefined

	type DpsStep = 'health' | 'attachments' | 'finished' | 'sendingSignature'

	const [step, setStep] = useState<DpsStep>(() => {
		if (initialProposalData.status.id === 5) return 'attachments'
		if (initialProposalData.status.id === 10) {
			if (isMag && magDpsMode === 'none') return 'sendingSignature'
			return 'health'
		}
		return 'finished'
	})

	const [signSendError, setSignSendError] = useState<string | null>(null)

	useEffect(() => {
		if (step !== 'sendingSignature' || !token) return
		let cancelled = false
		;(async () => {
			const r = await signProposal(token, uid)
			if (cancelled) return
			if (!r?.success) {
				setSignSendError(r?.message ?? 'Não foi possível enviar a proposta para assinatura.')
			}
			setStep('finished')
		})()
		return () => {
			cancelled = true
		}
	}, [step, token, uid])

	const [dpsData, setDpsData] = useState<{
		uid?: string
		initial: DpsInitialForm
		health: DpsHealthFormValue | null | undefined
		attachments: AttachmentsForm | null | undefined
	}>({
		uid: initialProposalData.uid,
		initial: {
			profile: {
				cpf: initialProposalData.customer.document,
				name: initialProposalData.customer.name,
				socialName: initialProposalData.customer.socialName ?? '',
				birthdate: new Date(initialProposalData.customer.birthdate),
				profession: '',
				email: initialProposalData.customer.email,
				phone: '',
				gender: '',
				participationPercentage: '100,00%',
			},
			product: {
				product: initialProposalData.product.uid,
				deadline: initialProposalData.deadLineId?.toString() ?? '',
				mip: '',
				dfi: '',
				propertyType: ''
			},
			operation: {
				operationNumber: '',
				participantsNumber: ''
			},
			address: {
				zipcode: '',
				state: '',
				city: '',
				district: '',
				street: '',
				number: '',
				complement: ''
			}
		},
		health: initialHealthData,
		attachments: undefined,
	})

	const diseaseList: Partial<Record<DiseaseKeys, { has: boolean; description: string }>> = dpsData.health
		? Object.entries(dpsData.health)
				.filter(([key, value]) => {
					if (value && typeof value === 'object' && 'has' in value) {
						return value.has === 'yes';
					}
					return false;
				})
				.reduce(
					(acc, [currKey, currValue]) => {
						if (currValue && typeof currValue === 'object' && 'has' in currValue) {
							return {
								...acc,
								[currKey]: {
									has: currValue.has === 'yes',
									description: currValue.description ?? '',
								},
							};
						}
						return acc;
					},
					{} as Partial<Record<DiseaseKeys, { has: boolean; description: string }>>
				)
		: {}


		// Omit<HealthForm, '26'>
		async function handleHealthSubmit(v: DpsHealthFormValue) {
			try {
				setDpsData(prev => ({ ...prev, health: v }))
				const responseSign = await signProposal(token, uid)

				if (responseSign?.success) {
					setStep('finished')
				} else {
					console.error('Erro ao assinar proposta:', responseSign?.message)
				}
			} catch (error) {
				console.error('Erro ao submeter formulário:', error)
			}
		}
	function handleAttachmentsSubmit(v: AttachmentsForm) {
		setDpsData(prev => ({ ...prev, attachments: v }))
		setStep('finished')
	}

	let formToDisplay;

	if (step === 'sendingSignature') {
		formToDisplay = (
			<>
				<div className="p-9 mt-8 w-full max-w-7xl mx-auto bg-white rounded-3xl">
					<DpsProfileData data={dpsData.initial.profile} />
				</div>
				<div className="p-9 mt-8 w-full max-w-7xl mx-auto bg-white rounded-3xl">
					<p className="text-muted-foreground">Enviando proposta para assinatura do proponente…</p>
				</div>
			</>
		)
	} else if (step === 'health') {
		formToDisplay = (
			<>
				<div className="p-9 mt-8 w-full max-w-7xl mx-auto bg-white rounded-3xl">
					<DpsProfileData data={dpsData.initial.profile} />
				</div>
				<div className="p-9 mt-8 w-full max-w-7xl mx-auto bg-white rounded-3xl">
					<DpsHealthForm
						initialHealthData={dpsData.health}
						proposalUid={initialProposalData.uid}
						productName={initialProposalData.product.name}
						autocomplete={initialHealthDataProp?.[0].updated !== undefined}
						magHabitacionalDpsMode={
							isMag && magDpsMode === 'simplified' ? 'simplified' : 'full'
						}
						onSubmit={handleHealthSubmit}
					/>
				</div>
			</>
		)
	} else if (step === 'attachments') {
		formToDisplay = (
			<>
				<div className="p-9 mt-8 w-full max-w-7xl mx-auto bg-white rounded-3xl">
					<DpsProfileData data={dpsData.initial.profile} />
				</div>
				<div className="p-9 my-8 w-full max-w-7xl mx-auto bg-white rounded-3xl">
					<DpsAttachmentsForm
						onSubmit={handleAttachmentsSubmit}
						proposalUid={initialProposalData.uid}
						dpsProfileData={dpsData.initial.profile}
						setStep={setStep}
						diseaseList={diseaseList}
					/>
				</div>

				<MedReports token={token} uid={uid} />
			</>
		)
	} else if (step === 'finished') {
		formToDisplay = (
			<>
				<div className="p-9 mt-8 w-full max-w-7xl mx-auto bg-white rounded-3xl">
					<DpsProfileData data={dpsData.initial.profile} />
				</div>
				<div className="p-9 mt-8 w-full max-w-7xl mx-auto bg-white rounded-3xl">
					{signSendError ? (
						<p className="text-destructive mb-2">{signSendError}</p>
					) : isMag && magDpsMode === 'none' ? (
						<p className="mb-2">
							Esta proposta não exige DPS. Encaminhamento para assinatura do proponente
							concluído.{' '}
						</p>
					) : (
						<p className="mb-2">
							Preenchimento de DPS realizado com sucesso, encaminhado para assinatura do
							proponente.{' '}
						</p>
					)}
					<Link href={`/dps/details/${dpsData.uid}`}>Ver detalhes</Link>
				</div>
			</>
		)
	}

	return (
		<div className="p-5">
			{/* {dpsData.profile === undefined
				? 'undefined'
				: dpsData.profile === null
				? 'null'
				: 'value'} */}
			{formToDisplay}
		</div>
	)
}

function DpsProfileData({
	data,
}: {
	data: { cpf: string; name: string; birthdate: Date }
}) {
	return (
		<div className="px-3">
			<h3 className="text-primary text-lg">Dados do Proponente</h3>

			<div className="flex gap-4 my-4">
				<UserIcon size={48} className="grow-0 mr-2 text-primary" />
				<div className="grow">
					<div className="flex gap-5 text-muted-foreground text-sm">
						<span>CPF: {data.cpf}</span>
						<span>
							Nascimento: {data.birthdate.toLocaleDateString('pt-BR')}
						</span>
					</div>
					<span className="text-lg font-semibold">{data.name}</span>
				</div>
				<span className="grow-0 text-xs text-muted-foreground hidden">
					*dados recuperados automaticamente
				</span>
			</div>
		</div>
	)
}

export default DpsForm
