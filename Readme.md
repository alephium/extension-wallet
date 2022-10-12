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

To load the locally built extension into your browser, follow the guide [here](https://developer.chrome.com/docs/extensions/mv3/getstarted/#manifest)
for chrome and [here](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/) for firefox.

The extension folder is located at `packages/extension/dist`

## Development

To setup the repo on your machine just run:

```bash
yarn      # setup dependencies
yarn dev  # run build process for all packages in watch mode
```

## Credits

We have built this project on top of [Argent X](https://github.com/argentlabs/argent-x)'s codebase. We would like to take this oppurtunity to thank all the [contributors](https://github.com/argentlabs/argent-x/graphs/contributors) of the Argent X project ❤️
