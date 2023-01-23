import { getAccounts, removeAccount } from "../shared/account/store"
import { AccountMessage } from "../shared/messages/AccountMessage"
import { sendMessageToUi } from "./activeTabs"
import { analytics } from "./analytics"
import { HandleMessage, UnhandledMessage } from "./background"
import { encryptForUi } from "./crypto"

export const handleAccountMessage: HandleMessage<AccountMessage> = async ({
  msg,
  background: { wallet, actionQueue },
  messagingKeys: { privateKey },
  respond,
}) => {
  switch (msg.type) {
    case "GET_ACCOUNTS": {
      return sendMessageToUi({
        type: "GET_ACCOUNTS_RES",
        data: await getAccounts(msg.data?.showHidden ? () => true : undefined),
      })
    }

    case "CONNECT_ACCOUNT": {
      // Select an Account of BaseWalletAccount type
      const selectedAccount = await wallet.getSelectedAccount()

      return respond({
        type: "CONNECT_ACCOUNT_RES",
        data: selectedAccount,
      })
    }

    case "NEW_ACCOUNT": {
      if (!(await wallet.isSessionOpen())) {
        throw Error("you need an open session")
      }

      const { networkId } = msg.data
      try {
        const account = await wallet.newAccount(networkId)

        analytics.track("createAccount", {
          status: "success",
          networkId: networkId,
        })

        const accounts = await getAccounts()

        return sendMessageToUi({
          type: "NEW_ACCOUNT_RES",
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
          type: "NEW_ACCOUNT_REJ",
          data: { error },
        })
      }
    }

    case "GET_SELECTED_ACCOUNT": {
      const selectedAccount = await wallet.getSelectedAccount()
      return sendMessageToUi({
        type: "GET_SELECTED_ACCOUNT_RES",
        data: selectedAccount,
      })
    }

    case "UPGRADE_ACCOUNT": {
      try {
        return sendMessageToUi({ type: "UPGRADE_ACCOUNT_RES" })
      } catch {
        return sendMessageToUi({ type: "UPGRADE_ACCOUNT_REJ" })
      }
    }

    case "DELETE_ACCOUNT": {
      try {
        await removeAccount(msg.data)
        return sendMessageToUi({ type: "DELETE_ACCOUNT_RES" })
      } catch {
        return sendMessageToUi({ type: "DELETE_ACCOUNT_REJ" })
      }
    }

    case "GET_ENCRYPTED_PRIVATE_KEY": {
      if (!(await wallet.isSessionOpen())) {
        throw Error("you need an open session")
      }

      const encryptedPrivateKey = await encryptForUi(
        await wallet.exportPrivateKey(),
        msg.data.encryptedSecret,
        privateKey,
      )

      return sendMessageToUi({
        type: "GET_ENCRYPTED_PRIVATE_KEY_RES",
        data: { encryptedPrivateKey },
      })
    }

    case "GET_ENCRYPTED_SEED_PHRASE": {
      if (!(await wallet.isSessionOpen())) {
        throw Error("you need an open session")
      }

      const encryptedSeedPhrase = await encryptForUi(
        await wallet.getSeedPhrase(),
        msg.data.encryptedSecret,
        privateKey,
      )

      return sendMessageToUi({
        type: "GET_ENCRYPTED_SEED_PHRASE_RES",
        data: { encryptedSeedPhrase },
      })
    }
  }

  throw new UnhandledMessage()
}
