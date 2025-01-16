import { IconCirclePlaceholderDashed } from "justd-icons"
import { cn } from "~/utils/classes"

export function Logo({ className, ...props }: React.ComponentProps<"svg">) {
	return <IconCirclePlaceholderDashed {...props} className={cn("size-5", className)} />
}
