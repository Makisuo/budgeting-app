import { createClient } from "@clickhouse/client"

export const clickhouseClient = createClient({
	/* configuration */
	url: "http://clickhouse.opentel-collector.orb.local",
	username: "default",
	password: "",
})
