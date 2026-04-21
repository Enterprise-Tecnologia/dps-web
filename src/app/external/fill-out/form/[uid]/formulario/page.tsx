import { notFound, redirect } from 'next/navigation'
import { getHealthDataByUid, getProposalDpsByUid } from '@/app/external/actions'
import ExternalDpsForm from '@/app/external/fill-out/components/external-dps-form'
import { cookies } from 'next/headers'
import { isMagHabitacionalProduct } from '@/constants'
import { calculateAgeYears, getMagHabitacionalDpsMode } from '@/utils/mag-habitacional-dps'

export default async function ExternalDpsFormPage({
  params: { uid },
}: {
  params: { uid: string }
}) {
  if (!uid) {
    return notFound()
  }

  // Verificar se o usuário passou pela verificação de CPF
  const cookieStore = cookies()
  const verificationCookie = cookieStore.get(`dps-verification-${uid}`)

  // Se não existe o cookie de verificação ou ele não está correto, redirecionar para a página de verificação
  if (!verificationCookie || verificationCookie.value !== 'verified') {
    redirect(`/external/fill-out/form/${uid}`)
  }

  const [proposalDataRaw, healthData] = await Promise.all([
    getProposalDpsByUid(uid),
    getHealthDataByUid(uid),
  ])

  if (!proposalDataRaw || proposalDataRaw.success === false) {
    return notFound()
  }

  const proposalData = proposalDataRaw.data

  const successRedirect = `/external/fill-out/form/${uid}/success`

  if (isMagHabitacionalProduct(proposalData.product.name)) {
    const magMode = getMagHabitacionalDpsMode(
      calculateAgeYears(new Date(proposalData.customer.birthdate)),
      proposalData.capitalMIP
    )
    if (magMode === 'none') {
      redirect(`${successRedirect}?noDps=1`)
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4">
      <div className="py-6">
        <h1 className="text-2xl font-bold text-center mb-8">
          Declaração Pessoal de Saúde
        </h1>
        
        <ExternalDpsForm
          initialProposalData={proposalData}
          initialHealthData={healthData?.data}
          successRedirect={successRedirect}
        />
      </div>
    </div>
  )
} 