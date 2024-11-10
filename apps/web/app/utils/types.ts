export interface Span {
	trace_id: string
	span_id: string
	parent_span_id: string
	name: string
	kind: number
	start_time: number
	end_time: number
	status_code: number
	status_message: string
	attributes: string
	events: string
	links: string
	trace_state: string
}
