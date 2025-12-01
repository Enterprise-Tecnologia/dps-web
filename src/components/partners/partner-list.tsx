'use client'

import { useEffect, useMemo, useState } from 'react'

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
	const [selectedInsurer, setSelectedInsurer] = useState('all')
	const [showCancelled, setShowCancelled] = useState(false)
	const [currentPage, setCurrentPage] = useState(1)

	useEffect(() => {
		if (typeof window === 'undefined') return
		try {
			const stored = localStorage.getItem('partnersMock')
			if (stored) {
				const parsed = JSON.parse(stored) as PartnerMockRecord[]
				const sorted = [...parsed].sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt))
				setRecords(sorted)
			}
		} catch (err) {
			console.error('Erro ao carregar parceiros salvos localmente', err)
		}
	}, [])

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

	function updateStatus(
		type: 'insurer' | 'channel' | 'product',
		ids: string[],
		newStatus: 'active' | 'suspended' | 'cancelled'
	) {
		if (typeof window === 'undefined') return
		setRecords(current => {
			const now = new Date().toISOString()

			const updated = current.map(rec => {
				if (!ids.includes(rec.id)) return rec
				const data = { ...rec.data }

				if (type === 'insurer') {
					data.insurer = applyStatusChange(data.insurer, newStatus, now)
					if (newStatus === 'cancelled') {
						data.channel = applyStatusChange(data.channel, newStatus, now)
						data.product = applyStatusChange(data.product, newStatus, now)
					}
				}

				if (type === 'channel') {
					data.channel = applyStatusChange(data.channel, newStatus, now)
					if (newStatus === 'cancelled') {
						data.product = applyStatusChange(data.product, newStatus, now)
					}
				}

				if (type === 'product') {
					data.product = applyStatusChange(data.product, newStatus, now)
				}

				return { ...rec, data }
			})

			localStorage.setItem('partnersMock', JSON.stringify(updated))
			return updated
		})
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

	const filteredTree = useMemo(
		() =>
			selectedInsurer !== 'all'
				? treeFilteredByCancelled.filter(insurer => insurer.name === selectedInsurer)
				: treeFilteredByCancelled,
		[treeFilteredByCancelled, selectedInsurer]
	)

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

	function handleSelectInsurer(value: string) {
		setSelectedInsurer(value)
		setCurrentPage(1)
	}

	function goToPage(page: number) {
		if (!pageAmount) return
		const next = Math.min(Math.max(page, 1), pageAmount)
		setCurrentPage(next)
	}

	if (!records.length) {
		return (
			<div className="text-sm text-muted-foreground space-y-2">
				<p>Nenhum parceiro salvo localmente ainda.</p>
				<p>Use o fluxo de cadastro e confirme o resumo para popular esta lista.</p>
			</div>
		)
	}

	return (
		<div className="space-y-4 text-sm">
			<PartnerFilterBar
				selectedInsurer={selectedInsurer}
				showCancelled={showCancelled}
				options={insurerOptions}
				onChangeInsurer={handleSelectInsurer}
				onToggleCancelled={setShowCancelled}
			/>

			<div className="overflow-x-auto pb-4">
				<div className="min-w-[960px] space-y-4">
					{paginatedTree.length === 0 ? (
						<div className="text-sm text-muted-foreground space-y-2">
							<p>Nenhum resultado para o filtro selecionado.</p>
							<button
								type="button"
								onClick={() => handleSelectInsurer('all')}
								className="text-primary text-sm font-medium hover:underline"
							>
								Limpar filtro
							</button>
						</div>
					) : (
						paginatedTree.map(insurer => (
							<PartnerInsurerCard key={insurer.id} insurer={insurer} onUpdateStatus={updateStatus} />
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
