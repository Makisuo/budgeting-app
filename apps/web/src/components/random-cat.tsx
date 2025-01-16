import { useCallback, useEffect, useRef, useState } from "react"
import { Cat, type CatDirection, type CatState } from "./cat"

interface RandomCatProps {
	containerWidth?: number
	idleTime?: number
}

const randomDirection = (): CatDirection => {
	return Math.random() < 0.5 ? "right" : "left"
}

const getRandomAction = (): CatState => {
	const random = Math.random()
	if (random < 0.2) return "walk"
	if (random < 0.22) return "jump"
	return "idle"
}

export const RandomCat = ({ containerWidth, idleTime = 1500 }: RandomCatProps) => {
	const [catState, setCatState] = useState<CatState>("idle")
	const [catDirection, setCatDirection] = useState<CatDirection>("right")
	const [isUserControlled, setIsUserControlled] = useState(false)
	const [catPosition, setCatPosition] = useState(0)

	const timeoutRef = useRef<NodeJS.Timeout>()

	// Handle keyboard controls
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!isUserControlled) {
				setIsUserControlled(true)
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current)
				}
			}

			switch (event.key) {
				case "ArrowRight":
					setCatState("walk")
					setCatDirection("right")
					break
				case "ArrowLeft":
					setCatState("walk")
					setCatDirection("left")
					break
				case "ArrowUp":
				case " ":
					if (catState !== "jump") {
						setCatState("jump")
						timeoutRef.current = setTimeout(() => {
							setCatState("idle")
						}, 500)
					}
					break
			}
		}

		const handleKeyUp = (event: KeyboardEvent) => {
			if (
				(event.key === "ArrowRight" && catDirection === "right") ||
				(event.key === "ArrowLeft" && catDirection === "left")
			) {
				setCatState("idle")
				// Resume random movement after a delay
				timeoutRef.current = setTimeout(() => {
					setIsUserControlled(false)
				}, 1000)
			}
		}

		window.addEventListener("keydown", handleKeyDown)
		window.addEventListener("keyup", handleKeyUp)

		return () => {
			window.removeEventListener("keydown", handleKeyDown)
			window.removeEventListener("keyup", handleKeyUp)
		}
	}, [catState, catDirection])

	useEffect(() => {
		const timer = setInterval(() => {
			if (isUserControlled) return

			const random = Math.random()
			if (random < 0.5) {
				setCatDirection(randomDirection())
			}
			setCatState(getRandomAction())
		}, idleTime)
		return () => clearInterval(timer)
	}, [idleTime, isUserControlled])

	return (
		<Cat
			containerWidth={containerWidth}
			state={catState}
			direction={catDirection}
			onDirectionChange={setCatDirection}
			onPositionChange={setCatPosition}
			onJumpComplete={() => {
				setCatState("idle")
			}}
		/>
	)
}
