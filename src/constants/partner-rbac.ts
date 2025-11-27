import {
	ApiRoles,
	ApiRoleEnum as Role,
} from '@/hooks/getServerSessionAuthorization'

// Por enquanto todos os papéis têm acesso; ajuste este array quando definir o RBAC de parceiros.
export const partnerAllowedRoles: ApiRoles[] = Object.values(Role) as ApiRoles[]
