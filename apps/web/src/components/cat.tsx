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
const MOVEMENT_SPEED = 0.3
const JUMP_FORCE = 0.6
const GRAVITY = 0.002
const MAX_JUMP_HEIGHT = 120

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
	const positionRef = useRef({ x: 0, y: 0 })
	const velocityRef = useRef({ x: 0, y: 0 })
	const isJumpingRef = useRef(false)
	const animationFrameRef = useRef<number | null>(null)
	const lastTimeRef = useRef<number>(0)

	const windowWidth = useWindowWidth()
	const computedContainerWidth = containerWidth ?? windowWidth

	const updatePosition = useCallback(
		(timestamp: number) => {
			if (!lastTimeRef.current) lastTimeRef.current = timestamp
			const deltaTime = timestamp - lastTimeRef.current

			// Update horizontal movement
			if (state === "walk" || isJumpingRef.current) {
				const directionMultiplier = direction === "right" ? 1 : -1
				velocityRef.current.x = MOVEMENT_SPEED * directionMultiplier
			} else {
				velocityRef.current.x = 0
			}

			// Update vertical movement (jumping)
			if (state === "jump" && !isJumpingRef.current) {
				isJumpingRef.current = true
				velocityRef.current.y = JUMP_FORCE
			}

			if (isJumpingRef.current) {
				velocityRef.current.y -= GRAVITY * deltaTime
				positionRef.current.y += velocityRef.current.y * deltaTime

				// Ground collision
				if (positionRef.current.y <= 0) {
					positionRef.current.y = 0
					velocityRef.current.y = 0
					isJumpingRef.current = false
					onJumpComplete?.()
				}

				// Cap maximum jump height
				if (positionRef.current.y > MAX_JUMP_HEIGHT) {
					positionRef.current.y = MAX_JUMP_HEIGHT
					velocityRef.current.y = 0
				}
			}

			// Update horizontal position
			let newX = positionRef.current.x + velocityRef.current.x * deltaTime

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

			lastTimeRef.current = timestamp
			animationFrameRef.current = requestAnimationFrame(updatePosition)
		},
		[computedContainerWidth, direction, state, onPositionChange, onDirectionChange, onJumpComplete],
	)

	useEffect(() => {
		animationFrameRef.current = requestAnimationFrame(updatePosition)
		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current)
			}
		}
	}, [updatePosition])

	const styleCat: React.CSSProperties = {
		transform: `translate3d(${positionRef.current.x}px, ${-positionRef.current.y}px, 0) scaleX(${
			direction === "right" ? "1" : "-1"
		})`,
		position: "absolute",
		bottom: 0,
		left: 0,
		transition: "transform 0.05s linear",
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
