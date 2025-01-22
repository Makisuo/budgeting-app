import { Badge } from "~/components/ui"

export const StatusBadge = ({ status }: { status: "pending" | "posted" }) => {
	return (
		<Badge intent={status === "pending" ? "info" : "success"}>
			{status === "pending" ? "Pending" : "Completed"}
		</Badge>
	)
}
