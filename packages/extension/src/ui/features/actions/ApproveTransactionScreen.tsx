import { TransactionBuilder } from "@alephium/web3"
import { FC, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { ReviewTransactionResult, TransactionParams } from "../../../shared/actionQueue/types"

import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { Account } from "../accounts/Account"
import { useNetwork } from "../networks/useNetworks"
import { ConfirmScreen } from "./ConfirmScreen"
import { ConfirmPageProps } from "./DeprecatedConfirmScreen"
import { FeeEstimation } from "./feeEstimation/FeeEstimation"
import { AccountNetworkInfo } from "./transaction/AccountNetworkInfo"
import { DappHeader } from "./transaction/DappHeader"
import { TransactionsList } from "./transaction/TransactionsList"

export interface ApproveTransactionScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  transaction: TransactionParams
  onSubmit: (result: ReviewTransactionResult | { error: string } | undefined) => void
}

async function buildTransaction(nodeUrl: string, account: Account, transaction: TransactionParams): Promise<ReviewTransactionResult> {
  const builder = TransactionBuilder.from(nodeUrl)
  switch (transaction.type) {
    case 'TRANSFER':
      return { type: transaction.type, params: transaction.params, result: await builder.buildTransferTx(transaction.params, account.publicKey) }
    case 'DEPLOY_CONTRACT':
      return { type: transaction.type, params: transaction.params, result: await builder.buildDeployContractTx(transaction.params, account.publicKey) }
    case 'EXECUTE_SCRIPT':
      return { type: transaction.type, params: transaction.params, result: await builder.buildExecuteScriptTx(transaction.params, account.publicKey) }
    case 'UNSIGNED_TX':
      return { type: transaction.type, params: transaction.params, result: await builder.buildUnsignedTx(transaction.params) }
  }
}

export const ApproveTransactionScreen: FC<ApproveTransactionScreenProps> = ({
  transaction,
  selectedAccount,
  actionHash,
  onSubmit,
  ...props
}) => {

  usePageTracking("signTransaction", {
    networkId: selectedAccount?.networkId || "unknown",
  })
  const [disableConfirm, setDisableConfirm] = useState(true)
  const [buildResult, setBuildResult] = useState<ReviewTransactionResult | { error: string } | undefined>()
  const { id: networkId, nodeUrl } = useNetwork(selectedAccount?.networkId ?? "unknown")

  // TODO: handle error
  useEffect(() => {
    const build = async () => {
      if (selectedAccount === undefined) {
        return
      }

      try {
        const buildResult = await buildTransaction(nodeUrl, selectedAccount, transaction)
        setBuildResult(buildResult)
      } catch (e: any) {
        console.error("Error building transaction", e)
        setBuildResult({ error: e.toString() })
      }
    }

    build()
  }, [nodeUrl, selectedAccount, transaction])

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  return (
    <ConfirmScreen
      confirmButtonText="Confirm"
      rejectButtonText="Cancel"
      confirmButtonDisabled={disableConfirm}
      selectedAccount={selectedAccount}
      onSubmit={() => {
        onSubmit(buildResult)
      }}
      showHeader={true}
      footer={
        (
          buildResult && !("error" in buildResult) && (
            <FeeEstimation
              onErrorChange={setDisableConfirm}
              accountAddress={selectedAccount.address}
              networkId={selectedAccount.networkId}
              transaction={buildResult}
              actionHash={actionHash}
            />
          )
        )
      }
      {...props}
    >
      <DappHeader
        transaction={transaction}
      />

      {
        buildResult && !("error" in buildResult) && (
          <TransactionsList
            networkId={networkId}
            transactionReview={buildResult}
          />
        )
      }
      <AccountNetworkInfo account={selectedAccount} />
    </ConfirmScreen >
  )
}
