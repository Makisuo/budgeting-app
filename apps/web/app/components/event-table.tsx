"use client"

import { useLocation, useSearch } from "@tanstack/react-router"
import { Badge } from "~/components/ui/badge"
import { Card } from "~/components/ui/card"
import { Table } from "~/components/ui/table"
import type { Span } from "~/utils/types"
import { DateValue } from "./ui/date-value"
import { Pagination } from "./ui/pagination"

export const EventTable = ({ spans }: { spans: Span[] }) => {
	const location = useLocation()
	const search = useSearch({ strict: false })

	const pageSize = 10

	return (
		<div className="space-y-4">
			<Card>
				<Table aria-label="Events">
					<Table.Header>
						<Table.Column className="w-0">Timestamp</Table.Column>
						<Table.Column isRowHeader>Name</Table.Column>
						<Table.Column>Duration</Table.Column>
					</Table.Header>
					<Table.Body items={spans}>
						{(item) => (
							<Table.Row id={item.span_id}>
								<Table.Cell>
									<DateValue date={new Date(item.start_time / 1000000)} />
								</Table.Cell>
								<Table.Cell>{item.name}</Table.Cell>
								<Table.Cell>
									<Badge>{Math.round((item.end_time - item.start_time) / 1000000)}ms</Badge>
								</Table.Cell>
							</Table.Row>
						)}
					</Table.Body>
				</Table>
			</Card>
			<Pagination>
				<Pagination.List>
					<Pagination.Item
						variant="first"
						href={location.pathname as any}
						routerOptions={{
							search: {
								page: 0,
							},
						}}
					/>
					<Pagination.Item
						variant="previous"
						href={location.pathname as any}
						routerOptions={{
							search: {
								page: search.page! > 0 ? search.page! - 1 : 0,
							},
						}}
					/>
					{search.page !== 0 && (
						<Pagination.Item
							href={location.pathname as any}
							routerOptions={{
								search: {
									page: search.page! - 1,
								},
							}}
						>
							{search.page! - 1}
						</Pagination.Item>
					)}
					<Pagination.Item
						href={location.pathname as any}
						routerOptions={{
							search: {
								tab: "resources",
								page: search.page,
							},
						}}
						isCurrent
					>
						{search.page}
					</Pagination.Item>
					{search.page === 0 && (
						<Pagination.Item
							href={location.pathname as any}
							routerOptions={{
								search: {
									tab: "resources",
									page: search.page! + 1,
								},
							}}
						>
							{search.page! + 1}
						</Pagination.Item>
					)}
					<Pagination.Item variant="ellipsis" />
					<Pagination.Item
						variant="next"
						href={location.pathname as any}
						routerOptions={{
							search: {
								tab: "resources",
								page:
									search.page! < Math.ceil(spans.length / pageSize) ? search.page! + 1 : search.page,
							},
						}}
					/>
					<Pagination.Item
						variant="last"
						href={location.pathname as any}
						routerOptions={{
							search: {
								tab: "resources",
								page: spans.length / pageSize - 1,
							},
						}}
					/>
				</Pagination.List>
			</Pagination>
		</div>
	)
}
