import { AccountMessage } from "../shared/messages/AccountMessage"
import { sendMessageToUi } from "./activeTabs"
import { HandleMessage, UnhandledMessage } from "./background"
import { encryptForUi } from "./crypto"

export const handleAccountMessage: HandleMessage<AccountMessage> = async ({
  msg,
  background: { wallet },
  messagingKeys: { privateKey },
  sendToTabAndUi,
}) => {
  switch (msg.type) {
    case "GET_ACCOUNTS": {
      return sendToTabAndUi({
        type: "GET_ACCOUNTS_RES",
        data: await wallet.getAlephiumAddresses(),
      })
    }

    case "CONNECT_ACCOUNT": {
      return await wallet.selectAlephiumAddress(msg.data.address)
    }

    case "NEW_ACCOUNT": {
      if (!wallet.isSessionOpen()) {
        throw Error("you need an open session")
      }

      //const group = msg.data
      try {
        const address = await wallet.addAlephiumAddress()
        if (address) {
          return sendToTabAndUi({
            type: "NEW_ACCOUNT_RES",
            data: address,
          })
        } else {
          throw Error("Fail to generate address")
        }
      } catch (exception: unknown) {
        return sendToTabAndUi({
          type: "NEW_ACCOUNT_REJ",
          data: {
            error: "create new address failed",
          },
        })
      }
    }

    case "GET_SELECTED_ACCOUNT": {
      const selectedAddress = await wallet.getAlephiumSelectedAddresses()
      return sendToTabAndUi({
        type: "GET_SELECTED_ACCOUNT_RES",
        data: selectedAddress,
      })
    }

    case "GET_ACCOUNT_BALANCE": {
      const balance = await wallet.getBalance(msg.data.address)
      return sendToTabAndUi({
        type: "GET_ACCOUNT_BALANCE_RES",
        data: balance,
      })
    }

    case "GET_ENCRYPTED_SEED_PHRASE": {
      if (!wallet.isSessionOpen()) {
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
