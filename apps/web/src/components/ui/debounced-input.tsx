import { useEffect, useRef, useState } from "react"
import { TextField } from "./text-field"

interface DebouncedTextFieldProps {
	onDebouncedChange?: (value: string) => void
	delay?: number
	placeholder?: string
	className?: string
	"aria-label"?: string
}

export const DebouncedTextField: React.FC<DebouncedTextFieldProps> = ({
	onDebouncedChange,
	delay = 100,
	className = "w-full",
	...props
}) => {
	const [value, setValue, debouncedValue] = useDebouncedValue({
		initialValue: "",
		delay,
	})

	useEffect(() => {
		onDebouncedChange?.(debouncedValue)
	}, [debouncedValue, onDebouncedChange])

	return <TextField {...props} className={className} value={value} onChange={setValue} />
}

interface UseDebouncedValueProps<T> {
	initialValue: T
	delay?: number
}

function useDebouncedValue<T>({ initialValue, delay = 500 }: UseDebouncedValueProps<T>): [T, (value: T) => void, T] {
	const [value, setValue] = useState<T>(initialValue)
	const [debouncedValue, setDebouncedValue] = useState<T>(initialValue)
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}

		timeoutRef.current = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [value, delay])

	return [value, setValue, debouncedValue]
}
