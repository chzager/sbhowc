// Augment native DOM interfaces so query methods return HTML elements by default:
interface Element {
	closest<K extends keyof HTMLElementTagNameMap>(selector: K): HTMLElementTagNameMap[K];
	closest<E extends HTMLElement = HTMLElement>(selectors: string): E;
	querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K];
	querySelector<E extends HTMLElement = HTMLElement>(selectors: string): E;
	querySelectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
	querySelectorAll<E extends HTMLElement = HTMLElement>(selectors: string): NodeListOf<E>;
}
interface ParentNode {
	querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K];
	querySelector<E extends HTMLElement = HTMLElement>(selectors: string): E;
	querySelectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
	querySelectorAll<E extends HTMLElement = HTMLElement>(selectors: string): NodeListOf<E>;
}

// Augment UIEvent so its target is an HTML element by default:
interface UIEvent<T = HTMLElement> {
	target: T;
	currentTarget: T;
}
