export type ApiTransactionReviewAssessment =
  | "warn"
  | "neutral"
  | "partial"
  | "verified"

export type ApiTransactionReviewAssessmentReason =
  | "account_upgrade_to_unknown_implementation"
  | "address_is_black_listed"
  | "amount_mismatch_too_low"
  | "amount_mismatch_too_high"
  | "dst_token_black_listed"
  | "internal_service_issue"
  | "multi_calls_on_account"
  | "recipient_is_not_current_account"
  | "recipient_is_token_address"
  | "recipient_is_black_listed"
  | "spender_is_black_listed"
  | "operator_is_black_listed"
  | "src_token_black_listed"
  | "unknown_token"

export interface ApiTransactionReviewResponse {
  assessment: ApiTransactionReviewAssessment
  reason?: ApiTransactionReviewAssessmentReason
  reviews: ApiTransactionReview[]
}

export interface ApiTransactionReview {
  assessment: ApiTransactionReviewAssessment
  assessmentReason?: ApiTransactionReviewAssessmentReason
  assessmentDetails: {
    contract_address: string
  }
  activity?: {
    value?: {
      token: {
        address: string
        name?: string
        symbol?: string
        decimals: number
        unknown: boolean
        type: string
      }
      tokenId?: string
      amount?: string
      /** usd converted fiat equivalent of token amount */
      usd?: number
      slippage: string
    }
    recipient?: string
    spender?: string
    type: string
  }
}

export type ApiTransactionReviewNetwork =
  | "mainnet"
  | "morden"
  | "ropsten"
  | "rinkeby"
  | "goerli"
  | "kovan"
