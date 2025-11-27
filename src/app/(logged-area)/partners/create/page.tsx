import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import getServerSessionAuthorization from '@/hooks/getServerSessionAuthorization'
import { partnerAllowedRoles } from '@/constants/partner-rbac'
import PartnerForm from '@/components/partners/partner-form'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function PartnerCreatePage() {
	const { granted } = await getServerSessionAuthorization(partnerAllowedRoles)

	if (!granted) {
		redirect('/dashboard')
	}

	return (
		<div className="p-6">
			<div className="max-w-screen-xl mx-auto space-y-6">
				<header className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h3 className="text-primary font-semibold">Cadastrar parceria</h3>
						<p className="text-sm text-muted-foreground mt-2">
							Fluxo guiado para cadastrar novo produto. Verifique a necessidade ou não de se cadastrar Seguradora e 
							canal. Se atente ao vínculo hierárquico.
						</p>
					</div>
				</header>
				<PartnerForm />
			</div>
		</div>
	)
}
