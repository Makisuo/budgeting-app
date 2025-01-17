import { createContext, useContext, useEffect, useState } from "react"

type BaseTheme = "light" | "dark" | "system"

type ThemeProviderProps<T extends string = BaseTheme> = {
	children: React.ReactNode
	defaultTheme?: T
	storageKey?: string
	themes?: readonly T[]
}

type ThemeProviderState<T extends string = BaseTheme> = {
	theme: T
	setTheme: (theme: T) => void
}

const DEFAULT_THEMES = ["light", "dark", "system"] as const

function createThemeContext<T extends string = BaseTheme>() {
	const initialState: ThemeProviderState<T> = {
		theme: "system" as T,
		setTheme: () => null,
	}
	return createContext<ThemeProviderState<T>>(initialState)
}

const ThemeProviderContext = createThemeContext()

export function ThemeProvider<T extends string = BaseTheme>({
	children,
	defaultTheme = "system" as T,
	storageKey = "vite-ui-theme",
	themes = DEFAULT_THEMES as unknown as readonly T[],
	...props
}: ThemeProviderProps<T>) {
	const [theme, setTheme] = useState<T>(() => {
		const stored = localStorage.getItem(storageKey)
		if (stored && themes.includes(stored as T)) {
			return stored as T
		}
		return defaultTheme
	})

	useEffect(() => {
		const root = window.document.documentElement
		root.classList.remove(...themes)

		if (theme === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

			if (themes.includes(systemTheme as T)) {
				root.classList.add(systemTheme)
			}
			return
		}

		root.classList.add(theme)
	}, [theme, themes])

	const value = {
		theme,
		setTheme: (theme: T) => {
			localStorage.setItem(storageKey, theme)
			setTheme(theme)
		},
	}

	return (
		// @ts-expect-error
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	)
}

export function useTheme<T extends string = BaseTheme>() {
	const context = useContext(ThemeProviderContext)

	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider")
	}

	return context
}
