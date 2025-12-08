'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationFirst,
	PaginationItem,
	PaginationLast,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination'

import PartnerFilterBar from './partner-filter-bar'
import PartnerInsurerCard from './partner-insurer-card'
import { buildTree, getTimestamp, normalizeStatus, type StatusDates, type TreeInsurer } from './partner-list-helpers'
import type { PartnerMockRecord } from './types'

export default function PartnerList() {
	const [records, setRecords] = useState<PartnerMockRecord[]>([])
	const [selectedInsurers, setSelectedInsurers] = useState<string[]>([])
	const [showCancelled, setShowCancelled] = useState(false)
	const [currentPage, setCurrentPage] = useState(1)
	const [loadError, setLoadError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

	const loadRecords = useCallback(async () => {
		setIsLoading(true)
		setLoadError(null)
		try {
			const res = await fetch('/api/partners/list', { cache: 'no-store' })
			if (!res.ok) {
				throw new Error(`Falha ao buscar parceiros (${res.status}).`)
			}
			const json = (await res.json()) as { records?: PartnerMockRecord[] }
			const list = json.records ?? []
			const sorted = [...list].sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt))
			setRecords(sorted)
		} catch (err) {
			console.error('Erro ao carregar parceiros do Supabase', err)
			setLoadError('Erro ao carregar dados do Supabase. Tente novamente.')
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		loadRecords()
	}, [loadRecords])

	function applyStatusChange<T extends StatusDates>(
		entity: T,
		newStatus: 'active' | 'suspended' | 'cancelled',
		now: string
	): T {
		return {
			...entity,
			status: newStatus,
			createdAt: entity.createdAt || now,
			suspendedAt: newStatus === 'suspended' ? now : entity.suspendedAt,
			cancelledAt: newStatus === 'cancelled' ? now : entity.cancelledAt,
			inactivatedAt: newStatus === 'cancelled' ? now : entity.inactivatedAt,
			reactivatedAt: newStatus === 'active' ? now : entity.reactivatedAt,
		}
	}

	async function updateStatus(
		type: 'insurer' | 'channel' | 'product',
		ids: string[],
		newStatus: 'active' | 'suspended' | 'cancelled'
	) {
		try {
			setIsUpdatingStatus(true)
			setLoadError(null)
			const res = await fetch('/api/partners/status', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type, ids, status: newStatus }),
			})
			if (!res.ok) {
				const text = await res.text().catch(() => '')
				throw new Error(text || `Falha ao atualizar status (${res.status}).`)
			}
			await loadRecords()
		} catch (err) {
			console.error('Erro ao atualizar status', err)
			setLoadError('Erro ao atualizar status. Tente novamente.')
		} finally {
			setIsUpdatingStatus(false)
		}
	}

	const tree = useMemo<TreeInsurer[]>(() => buildTree(records), [records])

	const treeFilteredByCancelled = useMemo(() => {
		if (showCancelled) return tree

		return tree
			.map(insurer => {
				if (normalizeStatus(insurer.details.status) === 'cancelled') return null
				const channels = insurer.channels
					.map(channel => {
						if (normalizeStatus(channel.details.status) === 'cancelled') return null
						const products = channel.products.filter(
							product => normalizeStatus(product.details.status) !== 'cancelled'
						)
						return { ...channel, products }
					})
					.filter(Boolean) as TreeInsurer['channels']

				return { ...insurer, channels }
			})
			.filter(Boolean) as TreeInsurer[]
	}, [showCancelled, tree])
	const insurerOptions = useMemo(() => {
		const actives = tree.filter(insurer => normalizeStatus(insurer.details.status) === 'active')
		return Array.from(new Set(actives.map(insurer => insurer.name))).map(name => ({
			label: name,
			value: name,
		}))
	}, [tree])

	const filteredTree = useMemo(() => {
		if (!selectedInsurers.length) return treeFilteredByCancelled
		const selectedSet = new Set(selectedInsurers)
		return treeFilteredByCancelled.filter(insurer => selectedSet.has(insurer.name))
	}, [treeFilteredByCancelled, selectedInsurers])

	const pageSize = 10
	const pageAmount = Math.ceil(filteredTree.length / pageSize)
	const safeCurrentPage = Math.min(currentPage, pageAmount || 1)
	const paginatedTree = useMemo(
		() => filteredTree.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize),
		[filteredTree, safeCurrentPage]
	)

	useEffect(() => {
		if (safeCurrentPage !== currentPage) {
			setCurrentPage(safeCurrentPage)
		}
	}, [currentPage, safeCurrentPage])

	function handleSelectInsurers(values: string[]) {
		setSelectedInsurers(values)
		setCurrentPage(1)
	}

	function goToPage(page: number) {
		if (!pageAmount) return
		const next = Math.min(Math.max(page, 1), pageAmount)
		setCurrentPage(next)
	}

	const hasResults = paginatedTree.length > 0

	if (!records.length || !hasResults) {
		return (
			<div className="text-sm text-muted-foreground space-y-3 rounded-2xl border border-dashed border-primary/20 bg-white p-6 shadow-sm">
				<p className="text-base font-semibold text-primary">
					{records.length ? 'Nenhum parceiro para exibir.' : 'Nenhum parceiro para exibir.'}
				</p>
				<p>
					{records.length
						? 'Cadastre um parceiro na página Cadastrar parceiro.'
						: 'Cadastre um parceiro na página Cadastrar parceiro.'}
				</p>
				{isLoading ? (
					<div className="flex items-center gap-2 text-xs text-primary">
						<span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						Carregando dados do Supabase...
					</div>
				) : null}
				{loadError ? <p className="text-xs text-destructive">{loadError}</p> : null}
			</div>
		)
	}

	return (
		<div className="space-y-4 text-sm">
			{isUpdatingStatus ? (
				<div className="flex items-center gap-2 text-xs text-primary bg-primary/10 border border-primary/20 rounded-md px-3 py-2">
					<span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<span>Atualizando status...</span>
				</div>
			) : null}

			{loadError ? (
				<div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
					{loadError}
				</div>
			) : null}

			<PartnerFilterBar
				selectedInsurers={selectedInsurers}
				showCancelled={showCancelled}
				options={insurerOptions}
				onChangeInsurers={handleSelectInsurers}
				onToggleCancelled={setShowCancelled}
			/>

			<div className="overflow-x-auto pb-4">
				<div className="min-w-[960px] space-y-4">
					{paginatedTree.length === 0 ? (
						<div className="text-sm text-muted-foreground space-y-2">
							<p>Nenhum resultado para o filtro selecionado.</p>
							<button
								type="button"
								onClick={() => handleSelectInsurers([])}
								className="text-primary text-sm font-medium hover:underline"
							>
								Limpar filtro
							</button>
						</div>
					) : (
							paginatedTree.map(insurer => (
							<PartnerInsurerCard
								key={insurer.id}
								insurer={insurer}
								onUpdateStatus={updateStatus}
								isUpdating={isUpdatingStatus}
							/>
						))
					)}
				</div>
			</div>

			{pageAmount > 1 ? (
				<Pagination className="w-full flex justify-end">
					<PaginationContent>
						<PaginationItem>
							<PaginationFirst
								href="#"
								disabled={safeCurrentPage === 1}
								onClick={event => {
									event.preventDefault()
									goToPage(1)
								}}
							/>
						</PaginationItem>
						<PaginationItem>
							<PaginationPrevious
								href="#"
								disabled={safeCurrentPage === 1}
								onClick={event => {
									event.preventDefault()
									goToPage(safeCurrentPage - 1)
								}}
							/>
						</PaginationItem>

						{renderPageButtons({
							currentPage: safeCurrentPage,
							pageAmount,
							goToPage,
						})}

						<PaginationItem>
							<PaginationNext
								href="#"
								disabled={safeCurrentPage === pageAmount}
								onClick={event => {
									event.preventDefault()
									goToPage(safeCurrentPage + 1)
								}}
							/>
						</PaginationItem>
						<PaginationItem>
							<PaginationLast
								href="#"
								disabled={safeCurrentPage === pageAmount}
								onClick={event => {
									event.preventDefault()
									goToPage(pageAmount)
								}}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			) : null}
		</div>
	)
}

function renderPageButtons({
	currentPage,
	pageAmount,
	goToPage,
}: {
	currentPage: number
	pageAmount: number
	goToPage: (page: number) => void
}) {
	if (pageAmount <= 1) return null

	const buttons: JSX.Element[] = []

	const createButton = (page: number, isActive?: boolean, key?: string) => (
		<PaginationItem key={key ?? page}>
			<PaginationLink
				href="#"
				isActive={isActive}
				onClick={event => {
					event.preventDefault()
					goToPage(page)
				}}
			>
				{page}
			</PaginationLink>
		</PaginationItem>
	)

	if (pageAmount <= 5) {
		buttons.push(...Array.from({ length: pageAmount }, (_, index) => createButton(index + 1, currentPage === index + 1)))
	} else if (currentPage <= 3) {
		buttons.push(...Array.from({ length: 3 }, (_, index) => createButton(index + 1, currentPage === index + 1)))
		buttons.push(
			<PaginationItem key="ellipsis-end">
				<PaginationEllipsis />
			</PaginationItem>
		)
		buttons.push(createButton(pageAmount, false, 'last'))
	} else if (currentPage > pageAmount - 3) {
		buttons.push(createButton(1, false, 'first'))
		buttons.push(
			<PaginationItem key="ellipsis-start">
				<PaginationEllipsis />
			</PaginationItem>
		)
		buttons.push(
			...Array.from({ length: 3 }, (_, index) => {
				const page = pageAmount - 2 + index
				return createButton(page, currentPage === page, `tail-${page}`)
			})
		)
	} else {
		buttons.push(createButton(1, false, 'first'))
		buttons.push(
			<PaginationItem key="ellipsis-start">
				<PaginationEllipsis />
			</PaginationItem>
		)
		buttons.push(
			...Array.from({ length: 3 }, (_, index) => {
				const page = currentPage - 1 + index
				return createButton(page, currentPage === page, `middle-${page}`)
			})
		)
		buttons.push(
			<PaginationItem key="ellipsis-end">
				<PaginationEllipsis />
			</PaginationItem>
		)
		buttons.push(createButton(pageAmount, false, 'last'))
	}

	return buttons
}
