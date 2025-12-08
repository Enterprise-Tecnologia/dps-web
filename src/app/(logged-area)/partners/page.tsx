import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import PartnerList from '@/components/partners/partner-list'
import getServerSessionAuthorization from '@/hooks/getServerSessionAuthorization'
import { partnerAllowedRoles } from '@/constants/partner-rbac'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function PartnersPage() {
	const { granted } = await getServerSessionAuthorization(partnerAllowedRoles)

	if (!granted) {
		redirect('/dashboard')
	}

	return (
		<div className="p-6">
			<div className="max-w-screen-xl mx-auto space-y-6">
				<header className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h3 className="text-primary font-semibold">Listar parceiros</h3>
						<p className="text-sm text-muted-foreground mt-2">
							Seus cadastros serão listados aqui.
						</p>
					</div>
					<Button
						asChild
						className="text-primary-foreground hover:text-primary-foreground hover:bg-primary/90"
					>
						<Link href="/partners/create">Cadastrar parceiro</Link>
					</Button>
				</header>

				<div className="bg-white rounded-2xl shadow-sm border p-6">
					<PartnerList />
				</div>
			</div>
		</div>
	)
}
