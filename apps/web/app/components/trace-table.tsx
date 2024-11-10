"use client"

import { Link } from "@tanstack/react-router"
import { Badge } from "~/components/ui/badge"
import { Card } from "~/components/ui/card"
import { Table } from "~/components/ui/table"
import type { Span } from "~/utils/types"
import { DateValue } from "./ui/date-value"

export const TraceTable = ({ spans }: { spans: Span[] }) => {
	return (
		<Card>
			<Table aria-label="Traces">
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
							<Table.Cell>
								<Link
									to="/trace/$id"
									params={{
										id: item.trace_id,
									}}
								>
									{item.name}
								</Link>
							</Table.Cell>
							<Table.Cell>
								<Badge>{Math.round((item.end_time - item.start_time) / 1000000)}ms</Badge>
							</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		</Card>
	)
}
