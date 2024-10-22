import { getAccounts, removeAccount } from "../shared/account/store"
import { AccountMessage } from "../shared/messages/AccountMessage"
import { sendMessageToUi } from "./activeTabs"
import { analytics } from "./analytics"
import { HandleMessage, UnhandledMessage } from "./background"
import { encryptForUi } from "./crypto"

export const handleAccountMessage: HandleMessage<AccountMessage> = async ({
  msg,
  background: { wallet },
  messagingKeys: { privateKey },
  respond,
}) => {
  switch (msg.type) {
    case "ALPH_GET_ACCOUNTS": {
      return sendMessageToUi({
        type: "ALPH_GET_ACCOUNTS_RES",
        data: await getAccounts(msg.data?.showHidden ? () => true : undefined),
      })
    }

    case "ALPH_CONNECT_ACCOUNT": {
      // Select an Account of BaseWalletAccount type
      const selectedAccount = await wallet.getSelectedAccount()

      return respond({
        type: "ALPH_CONNECT_ACCOUNT_RES",
        data: selectedAccount,
      })
    }

    case "ALPH_DISCOVER_ACCOUNTS": {
      const { networkId } = msg.data
      try {
        const discoveredAccounts = await wallet.discoverActiveAccounts(networkId)
        return respond({
          type: "ALPH_DISCOVER_ACCOUNTS_RES",
          data: { accounts: discoveredAccounts }
        })
      } catch (exception) {
        console.error("Failed to discover accounts", exception)
        return respond({
          type: "ALPH_DISCOVER_ACCOUNTS_REJ",
          data: { error: `${exception}` },
        })
      }

    }

    case "ALPH_NEW_ACCOUNT": {
      if (!(await wallet.isSessionOpen())) {
        throw Error("you need an open session")
      }

      const { networkId, keyType, group } = msg.data
      try {
        const account = await wallet.newAlephiumAccount(networkId, keyType, group)

        analytics.track("createAccount", {
          status: "success",
          networkId: networkId,
        })

        const accounts = await getAccounts()

        return sendMessageToUi({
          type: "ALPH_NEW_ACCOUNT_RES",
          data: {
            account,
            accounts,
          },
        })
      } catch (exception) {
        const error = `${exception}`

        analytics.track("createAccount", {
          status: "failure",
          networkId: networkId,
          errorMessage: error,
        })

        return sendMessageToUi({
          type: "ALPH_NEW_ACCOUNT_REJ",
          data: { error },
        })
      }
    }

    case "ALPH_NEW_LEDGER_ACCOUNT": {
      if (!(await wallet.isSessionOpen())) {
        throw Error("you need an open session")
      }

      const { account } = msg.data
      try {
        const baseAccount = await wallet.importLedgerAccount(account)
        return sendMessageToUi({
          type: "ALPH_NEW_LEDGER_ACCOUNT_RES",
          data: {
            account: baseAccount
          }
        })
      } catch (exception) {
        const error = `${exception}`

        analytics.track("createAccount", {
          status: "failure",
          networkId: account.networkId,
          errorMessage: error,
        })

        return sendMessageToUi({
          type: "ALPH_NEW_LEDGER_ACCOUNT_REJ",
          data: { error },
        })
      }
    }

    case "ALPH_GET_SELECTED_ACCOUNT": {
      const selectedAccount = await wallet.getSelectedAccount()
      return sendMessageToUi({
        type: "ALPH_GET_SELECTED_ACCOUNT_RES",
        data: selectedAccount,
      })
    }

    case "ALPH_UPGRADE_ACCOUNT": {
      try {
        return sendMessageToUi({ type: "ALPH_UPGRADE_ACCOUNT_RES" })
      } catch {
        return sendMessageToUi({ type: "ALPH_UPGRADE_ACCOUNT_REJ" })
      }
    }

    case "ALPH_DELETE_ACCOUNT": {
      try {
        await removeAccount(msg.data)
        return sendMessageToUi({ type: "ALPH_DELETE_ACCOUNT_RES" })
      } catch {
        return sendMessageToUi({ type: "ALPH_DELETE_ACCOUNT_REJ" })
      }
    }

    case "ALPH_GET_ENCRYPTED_PRIVATE_KEY": {
      if (!(await wallet.isSessionOpen())) {
        throw Error("you need an open session")
      }

      const encryptedPrivateKey = await encryptForUi(
        await wallet.exportPrivateKey(),
        msg.data.encryptedSecret,
        privateKey,
      )

      return sendMessageToUi({
        type: "ALPH_GET_ENCRYPTED_PRIVATE_KEY_RES",
        data: { encryptedPrivateKey },
      })
    }

    case "ALPH_GET_ENCRYPTED_SEED_PHRASE": {
      if (!(await wallet.isSessionOpen())) {
        throw Error("you need an open session")
      }

      const encryptedSeedPhrase = await encryptForUi(
        await wallet.getSeedPhrase(),
        msg.data.encryptedSecret,
        privateKey,
      )

      return sendMessageToUi({
        type: "ALPH_GET_ENCRYPTED_SEED_PHRASE_RES",
        data: { encryptedSeedPhrase },
      })
    }
  }

  throw new UnhandledMessage()
}
