<!-- logo -->

![Alephium Logo](https://raw.githubusercontent.com/alephium/alephium-brand-guide/master/logos/light/Logo-Horizontal-Light.png#gh-dark-mode-only) ![Alephium Logo](https://raw.githubusercontent.com/alephium/alephium-brand-guide/master/logos/dark/Logo-Horizontal-Dark.png#gh-light-mode-only)

---

<h2> Table of contents</h2>

- [Install from sources](#-install-from-sources)
- [Development](#-development)

## Install from sources

First clone this repository on your machine then run:

```bash
yarn        # setup dependencies
yarn build  # run build process for all packages
```

To load the locally built extension into your browser, follow one of this guide:
 * [Chrome](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked)
 * [Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing)

Load the `./packages/extension/dist` folder

## Development

To setup the repo on your machine just run:

```bash
yarn      # setup dependencies
yarn dev  # run build process for all packages in watch mode
```

## Name Service Integration

The wallet devs look forward to integrate any community name service projects, but there are some essential requirements:
* **Open Source and Testing**: Your contracts must be open source, and they should have proper tests that cover the important functions.
* **Offchain resolving**: Your services should provide convenient name&address resolving via full node endpoints.
* **Onchain resolving**: Your project should support onchain resolving for any group on the chain. It doesn't need to be enabled by default, but it should be available in the contract logic.
    * For instance, the [name service PoC](https://github.com/Lbqds/alephium-ans/blob/master/contracts/registrars/primary_registrar.ral#L21-L51) supports this with credential token. By default, users don't need to mint such token so
    it won't affect UX.
* **Standard Interface**: Your project should have a standard interface for onchain resolution. This makes it easier for other dapps to integrate with your service seamlessly.

## Credits

We have built this project on top of [Argent X](https://github.com/argentlabs/argent-x)'s codebase. We would like to take this opportunity to thank all the [contributors](https://github.com/argentlabs/argent-x/graphs/contributors) of the Argent X project ❤️
