/**
 * Regras de exigência de DPS para MAG Habitacional (front).
 * Capital: MIP (valor da operação no cadastro).
 */

export const MAG_HABITACIONAL_DPS_THRESHOLDS = {
	NO_DPS_UNDER_71_MAX_MIP: 500_000,
	NO_DPS_OVER_70_MAX_MIP: 50_000,
	FULL_DPS_MIN_MIP_EXCLUSIVE: 3_000_000,
} as const

export type MagHabitacionalDpsMode = 'none' | 'simplified' | 'full'

export function calculateAgeYears(birthDate: Date): number {
	const today = new Date()
	let age = today.getFullYear() - birthDate.getFullYear()
	const monthDiff = today.getMonth() - birthDate.getMonth()
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age--
	}
	return age
}

export function getMagHabitacionalDpsMode(
	ageYears: number,
	capitalMip: number
): MagHabitacionalDpsMode {
	if (capitalMip > MAG_HABITACIONAL_DPS_THRESHOLDS.FULL_DPS_MIN_MIP_EXCLUSIVE) {
		return 'full'
	}
	if (
		ageYears < 71 &&
		capitalMip <= MAG_HABITACIONAL_DPS_THRESHOLDS.NO_DPS_UNDER_71_MAX_MIP
	) {
		return 'none'
	}
	if (
		ageYears >= 71 &&
		capitalMip <= MAG_HABITACIONAL_DPS_THRESHOLDS.NO_DPS_OVER_70_MAX_MIP
	) {
		return 'none'
	}
	return 'simplified'
}
