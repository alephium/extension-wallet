import { useCallback } from "react"
import { Call } from "starknet"
import { TransactionParams } from "../../../../shared/actionQueue/types"

import { ARGENT_TRANSACTION_REVIEW_API_ENABLED } from "../../../../shared/api/constants"
import { argentApiNetworkForNetwork } from "../../../../shared/api/fetcher"
import {
  isPrivacySettingsEnabled,
  settingsStore,
} from "../../../../shared/settings"
import { useKeyValueStorage } from "../../../../shared/storage/hooks"
import {
  ApiTransactionReviewResponse,
  fetchTransactionReview,
} from "../../../../shared/transactionReview.service"
import { argentApiFetcher } from "../../../services/argentApiFetcher"
import { useConditionallyEnabledSWR } from "../../../services/swr"
import { Account } from "../../accounts/Account"
import { useNetwork } from "../../networks/useNetworks"

export interface IUseTransactionReview {
  account?: Account
  transaction: TransactionParams
  actionHash: string
}

export const useTransactionReviewEnabled = () => {
  const privacyUseArgentServicesEnabled = useKeyValueStorage(
    settingsStore,
    "privacyUseArgentServices",
  )
  /** ignore `privacyUseArgentServices` entirely when the Privacy Settings UI is disabled */
  if (!isPrivacySettingsEnabled) {
    return ARGENT_TRANSACTION_REVIEW_API_ENABLED
  }
  return (
    ARGENT_TRANSACTION_REVIEW_API_ENABLED && privacyUseArgentServicesEnabled
  )
}

