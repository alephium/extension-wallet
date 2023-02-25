import { BigNumber } from "ethers"
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
