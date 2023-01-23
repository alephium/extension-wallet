import { BigNumber } from "ethers"
import {
  Call,
  DeclareContractPayload,
  UniversalDeployerContractPayload,
} from "starknet"
import { ReviewTransactionResult } from "../../../../shared/actionQueue/types"

export interface TransactionsFeeEstimationProps {
  transaction: ReviewTransactionResult | undefined
  defaultMaxFee?: BigNumber
  onChange?: (fee: BigNumber) => void
  onErrorChange?: (error: boolean) => void
  accountAddress: string
  networkId: string
  actionHash: string
}

export type DeployAccountFeeEstimationProps = Omit<
  TransactionsFeeEstimationProps,
  "transactions"
>

export type DeclareContractFeeEstimationProps = Omit<
  TransactionsFeeEstimationProps,
  "transactions"
> & {
  payload: DeclareContractPayload
}

export type DeployContractFeeEstimationProps = Omit<
  TransactionsFeeEstimationProps,
  "transactions"
> & {
  payload: UniversalDeployerContractPayload
}
