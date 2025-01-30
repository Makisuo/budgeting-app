import { format, formatDistanceToNow, isSameDay } from "date-fns"
import { Tooltip } from "./ui/tooltip"

import { formatInTimeZone } from "date-fns-tz"
import { Button } from "react-aria-components"

export const DateValue = ({ date, children }: { date: Date; children?: React.ReactNode }) => {
	const timeZones = [
		{ city: "Los Angeles", zone: "America/Los_Angeles", key: "PDT" },
		{ city: "London", zone: "Europe/London", key: "GMT" },
		{ city: "Berlin", zone: "Europe/Berlin", key: "CET" },
		{ city: "Dubai", zone: "Asia/Dubai", key: "GST" },
		{ city: "Mumbai", zone: "Asia/Kolkata", key: "IST" },
	]

	return (
		<Tooltip>
			<Button className="m-0 p-0 text-muted-fg underline decoration-dashed">
				{children} {format(date, "PPpp")}
			</Button>
			<Tooltip.Content className="overflow-hidden p-0" placement="right" showArrow={false}>
				<div className="border-b border-b-border bg-bg p-3">
					<p>{formatDistanceToNow(date, { addSuffix: true })}</p>
				</div>
				<div className="p-3">
					<div className="flex flex-col gap-2">
						{timeZones.map(({ city, zone, key }, index) => {
							const currentDate = new Date(formatInTimeZone(date, zone, "yyyy-MM-dd'T'HH:mm:ssXXX"))
							const prevDate =
								index > 0
									? new Date(
											formatInTimeZone(
												date,
												timeZones[index - 1]!.zone,
												"yyyy-MM-dd'T'HH:mm:ssXXX",
											),
										)
									: currentDate

							const isNewDate = index === 0 || !isSameDay(currentDate, prevDate)

							return (
								<div key={city} className="mb-2 flex justify-between text-sm">
									<span className="mr-4">{city}:</span>
									<div className="flex items-center gap-2">
										<span>
											{formatInTimeZone(date, zone, isNewDate ? "MMM d, yyyy h:mm a" : "h:mm a")}
										</span>
										<span className="ml-2 text-muted-fg">{key}</span>
									</div>
								</div>
							)
						})}
					</div>
				</div>
			</Tooltip.Content>
		</Tooltip>
	)
}
