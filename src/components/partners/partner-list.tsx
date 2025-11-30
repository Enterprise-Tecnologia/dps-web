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
import { buildTree, getTimestamp, type TreeInsurer } from './partner-list-helpers'
import type { PartnerMockRecord } from './types'

export default function PartnerList() {
	const [records, setRecords] = useState<PartnerMockRecord[]>([])
	const [selectedInsurer, setSelectedInsurer] = useState('all')
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

	function updateStatus(
		type: 'insurer' | 'channel' | 'product',
		ids: string[],
		newStatus: 'active' | 'suspended' | 'inactive'
	) {
		if (typeof window === 'undefined') return
		const now = new Date().toISOString()

		const updated = records.map(rec => {
			if (!ids.includes(rec.id)) return rec
			const data = { ...rec.data }

			if (type === 'insurer') {
				data.insurer = {
					...data.insurer,
					status: newStatus,
					suspendedAt: newStatus === 'suspended' ? now : data.insurer.suspendedAt,
					inactivatedAt: newStatus === 'inactive' ? now : data.insurer.inactivatedAt,
					reactivatedAt: newStatus === 'active' ? now : data.insurer.reactivatedAt,
				}
			}

			if (type === 'channel') {
				data.channel = {
					...data.channel,
					status: newStatus,
					suspendedAt: newStatus === 'suspended' ? now : data.channel.suspendedAt,
					inactivatedAt: newStatus === 'inactive' ? now : data.channel.inactivatedAt,
					reactivatedAt: newStatus === 'active' ? now : data.channel.reactivatedAt,
				}
			}

			if (type === 'product') {
				data.product = {
					...data.product,
					status: newStatus,
					suspendedAt: newStatus === 'suspended' ? now : data.product.suspendedAt,
					inactivatedAt: newStatus === 'inactive' ? now : data.product.inactivatedAt,
					reactivatedAt: newStatus === 'active' ? now : data.product.reactivatedAt,
				}
			}

			return { ...rec, data }
		})

		setRecords(updated)
		localStorage.setItem('partnersMock', JSON.stringify(updated))
	}

	const tree = useMemo<TreeInsurer[]>(() => buildTree(records), [records])
	const insurerOptions = useMemo(
		() =>
			Array.from(new Set(tree.map(insurer => insurer.name))).map(name => ({
				label: name,
				value: name,
			})),
		[tree]
	)

	const filteredTree = useMemo(
		() => (selectedInsurer !== 'all' ? tree.filter(insurer => insurer.name === selectedInsurer) : tree),
		[tree, selectedInsurer]
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
			<PartnerFilterBar selectedInsurer={selectedInsurer} options={insurerOptions} onChange={handleSelectInsurer} />

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
