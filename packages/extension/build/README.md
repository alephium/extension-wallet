# Injected Web3 isolation

Web3 2.0.6 assigns `BigInt.prototype.toJSON` at its entry point. The inpage
provider runs in the dApp's JavaScript realm, so that assignment would affect
unrelated applications on every page where the extension is injected.

The `inpage` webpack layer resolves Web3 to its CommonJS source entry and removes
only this assignment at build time. Other extension layers retain their existing
SDK behavior. No runtime delete/restore is used: a page's own hook, including a
non-writable hook, must remain untouched. The loader deliberately fails if the
SDK entry changes, so an SDK upgrade requires reviewing or removing this rule.

Outgoing inpage messages convert BigInt amounts to decimal strings locally in
`messageActions.ts`, including when a page supplies its own JSON hook.

Run `yarn test:inpage` inside `packages/extension`.
The check builds the real injected entry and evaluates it in fresh browser-like
realms with native BigInt behavior and a non-writable site hook. An optional
output path passed to the script preserves the generated bundle for browser
inspection. The messageActions unit tests cover nested and large amounts.
