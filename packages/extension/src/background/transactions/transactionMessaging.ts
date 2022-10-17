import { TransactionMessage } from '../../shared/messages/TransactionMessage'
import { HandleMessage, UnhandledMessage } from '../background'
import { openUi } from '../openUi'

export const handleTransactionMessage: HandleMessage<TransactionMessage> = async ({
  msg,
  background: { wallet, actionQueue },
  sendToTabAndUi
}) => {
  switch (msg.type) {
    case 'GET_TRANSACTIONS': {
      const transactions = await wallet.getTransactions(msg.data.address)

      return sendToTabAndUi({
        type: 'GET_TRANSACTIONS_RES',
        data: transactions
      })
    }

    case 'GET_ADDRESS_TOKEN_TRANSACTIONS': {
      const transactions = await wallet.getAddressTokenTransactions(msg.data.address, msg.data.tokenId)

      return sendToTabAndUi({
        type: 'GET_ADDRESS_TOKEN_TRANSACTIONS_RES',
        data: transactions
      })
    }

    case 'EXECUTE_TRANSACTION': {
      const { meta } = await actionQueue.push({
        type: 'TRANSACTION',
        payload: msg.data
      })
      sendToTabAndUi({
        type: 'EXECUTE_TRANSACTION_RES',
        data: { actionHash: meta.hash }
      })

      return openUi()
    }

    case 'TRANSACTION_FAILED': {
      return await actionQueue.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
