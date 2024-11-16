export type CamelToSnake<T> = {
	[K in keyof T as K extends string ? CamelToSnakeString<K> : K]: T[K]
}

// Helper type for string conversion
type CamelToSnakeString<S extends string> = S extends `${infer F}${infer R}`
	? F extends Uppercase<F>
		? `_${Lowercase<F>}${CamelToSnakeString<R>}`
		: `${F}${CamelToSnakeString<R>}`
	: S
