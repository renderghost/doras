/** Registers an element once, so importing a component twice is harmless. */
export function define(tag: string, element: CustomElementConstructor): void {
  if (!customElements.get(tag)) customElements.define(tag, element);
}
