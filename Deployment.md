# Deployment

## How to release?

1. Update version number, tag the release, and wait for Github to build the artifacts
2. Run the extension wallet locally with previous version of the artifact
3. Unzip the new version of generated artifacts, unpack it to the same directory as the previous version to reuse the storage
2. Test the generated artifacts locally with fresh installation by checking
  1. Transfer ALP, Token, and NFT
  2. Display of Token/NFT metadata
  3. Works with the simple dApp within the repository (yarn run dev)
  4. Ledger support

## Argent-X Legacy

We automated some parts of the release process to make things easier. This file lists the necessary steps to release the latest version of the application:

- Check and ensure the previous release branch `release/vX.Y.Z` was merged into `main`
- Check and ensure `main` was back-merged into `develop`
- Check and ensure you are working in the latest `develop` branch
- Run `npx lerna version` - this will:
  - update the `version` in each `package.json`
  - create branch `release/vX.Y.Z`
  - create tag `vX.Y.Z`
  - push the tagged branch automatically
- Pushing a tagged branch triggers a release build action in GitHub
- Wait for pipeline to create release containing the extension zip
- If the automatic npm publish failed, do it manually (ask Gerald)
- Create GitHub pull request to merge the new branch `release/vX.Y.Z` into `main`
- Create GitHub pull request to back-merge `main` into `develop`
- Edit release to contain a bit more than just the auto generated notes and maybe a proper title
- Submit to Chrome Web Store (ask Ismael)
