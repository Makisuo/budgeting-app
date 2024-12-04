import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"

export const CAT_ACTIONS = ["walk", "idle", "jump"] as const

export type CatState = (typeof CAT_ACTIONS)[number]
export type CatDirection = "left" | "right"

interface CatProps {
	containerWidth?: number
	state: CatState
	direction: CatDirection
	onPositionChange?: (x: number) => void
	onDirectionChange?: (direction: CatDirection) => void
	onJumpComplete?: () => void
}

const catAnimations = {
	idle: "/images/cat/black_idle_8fps.gif",
	walk: "/images/cat/black_walk_8fps.gif",
	jump: "/images/cat/black_run_8fps.gif",
} satisfies Record<CatState, string>

const CAT_WIDTH = 64
const MOVEMENT_SPEED = 0.1
const JUMP_DURATION = 500

const useWindowWidth = () => {
	const [windowWidth, setWindowWidth] = useState<number>(0)
	const [isMounted, setIsMounted] = useState(false)

	useEffect(() => {
		setIsMounted(true)
		setWindowWidth(window.innerWidth)

		const handleResize = () => {
			setWindowWidth(window.innerWidth)
		}

		window.addEventListener("resize", handleResize)
		return () => window.removeEventListener("resize", handleResize)
	}, [])

	// Return 0 during SSR, actual width after mount
	return isMounted ? windowWidth : 0
}

export const Cat = ({
	containerWidth,
	state,
	direction,
	onPositionChange,
	onDirectionChange,
	onJumpComplete,
}: CatProps) => {
	const positionRef = useRef({ x: 0 })
	const animationFrameRef = useRef<number>()
	const lastTimeRef = useRef<number>(0)

	const windowWidth = useWindowWidth()

	const computedContainerWidth = containerWidth ?? windowWidth

	const updatePosition = useCallback(
		(timestamp: number) => {
			if (!lastTimeRef.current) lastTimeRef.current = timestamp
			const deltaTime = timestamp - lastTimeRef.current

			if (state === "walk") {
				const directionMultiplier = direction === "right" ? 1 : -1
				let newX = positionRef.current.x + MOVEMENT_SPEED * deltaTime * directionMultiplier

				// Handle boundaries
				if (newX < 0) {
					newX = 0
					onDirectionChange?.("right")
				} else if (newX > computedContainerWidth - CAT_WIDTH) {
					newX = computedContainerWidth - CAT_WIDTH
					onDirectionChange?.("left")
				}

				positionRef.current.x = newX
				onPositionChange?.(newX)
			}

			lastTimeRef.current = timestamp
			animationFrameRef.current = requestAnimationFrame(updatePosition)
		},
		[computedContainerWidth, direction, state, onPositionChange, onDirectionChange],
	)

	useEffect(() => {
		animationFrameRef.current = requestAnimationFrame(updatePosition)
		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current)
			}
		}
	}, [updatePosition])

	// Jump effect
	useEffect(() => {
		if (state === "jump") {
			const timer = setTimeout(() => {
				onJumpComplete?.()
			}, JUMP_DURATION)
			return () => clearTimeout(timer)
		}
	}, [state, onJumpComplete])

	const styleCat: React.CSSProperties = {
		transform: `translate(${positionRef.current.x}px, 0) scale(${direction === "right" ? "1" : "-1"}, 1)`,
		bottom: state === "jump" ? "50px" : "0px", // Simple up/down jump
		position: "absolute",
		transition: "bottom 0.5s ease-out",
		imageRendering: "pixelated",
		zIndex: 50,
	}

	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 w-full">
			<div style={styleCat}>
				<img src={catAnimations[state]} alt="Cat" width={CAT_WIDTH} />
			</div>
		</div>
	)
}
