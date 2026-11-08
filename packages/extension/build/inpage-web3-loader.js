// Web3 2.x installs a JSON hook as an entry-point side effect. The injected
// provider shares the dApp's realm, so omit that side effect at build time.
// Never delete or temporarily replace a hook belonging to the host page.
module.exports = function inpageWeb3Loader(source) {
  const hook =
    /BigInt\.prototype\['toJSON'\] = function \(\) \{\r?\n    return this\.toString\(\);\r?\n\};/
  if (!hook.test(source)) {
    throw new Error(
      "Web3 entry changed: review the injected BigInt isolation rule",
    )
  }
  return source.replace(hook, "")
}
