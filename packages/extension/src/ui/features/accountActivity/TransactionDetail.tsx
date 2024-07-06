import { icons } from "@argent/ui"
import { isString } from "lodash-es"
import { FC, useMemo, useState } from "react"
import CopyToClipboard from "react-copy-to-clipboard"
import styled, { useTheme } from "styled-components"

import { IExplorerTransaction } from "../../../shared/explorer/type"
import { Network } from "../../../shared/network"
import { Token } from "../../../shared/token/type"
import {
  Transaction,
  entryPointToHumanReadable,
} from "../../../shared/transactions"
import { CopyIconButton } from "../../components/CopyIconButton"
import { CopyTooltip } from "../../components/CopyTooltip"
import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
  LeftPaddedField,
  SectionHeader,
} from "../../components/Fields"
import { ContentCopyIcon } from "../../components/Icons/MuiIcons"
import { formatTruncatedAddress } from "../../services/addresses"
import {
  openBlockExplorerAddress,
  openExplorerTransaction,
} from "../../services/blockExplorer.service"
import { PrettyAccountAddress } from "../accounts/PrettyAccountAddress"
import { AccountAddressField } from "../actions/transaction/fields/AccountAddressField"
import { DappContractField } from "../actions/transaction/fields/DappContractField"
import { FeeField } from "../actions/transaction/fields/FeeField"
import { ParameterField } from "../actions/transaction/fields/ParameterField"
import { TransactionDetailWrapper } from "./TransactionDetailWrapper"
import {
  isDeclareContractTransaction,
  isDeployContractTransaction,
  isNFTTransaction,
  isNFTTransferTransaction,
  isTokenApproveTransaction,
  isTokenMintTransaction,
  isTokenTransferTransaction,
} from "./transform/is"
import { TransformedTransaction } from "./transform/type"
import { ExpandableFieldGroup } from "./ui/ExpandableFieldGroup"
import { NFTTitle } from "./ui/NFTTitle"
import { TransactionCallDataBottomSheet } from "./ui/TransactionCallDataBottomSheet"
import { TransactionIcon } from "./ui/TransactionIcon"
import { TransferTitle } from "./ui/TransferTitle"
import { useTranslation } from "react-i18next"

const { ActivityIcon } = icons

function getErrorMessageFromErrorDump(errorDump?: string) {
  try {
    if (!isString(errorDump)) {
      return undefined
    }
    const errorCode = errorDump.match(/^Error message: (.+)$/im)
    return errorCode?.[1] ?? undefined
  } catch {
    return undefined
  }
}

const StyledTransactionDetailWrapper = styled(TransactionDetailWrapper)`
  position: relative;
`

const MainTransactionIconContainer = styled.div`
  margin-bottom: 8px;
`

const Date = styled.div`
  font-weight: 400;
  font-size: 13px;
  color: ${({ theme }) => theme.text2};
`

const TitleAddressContainer = styled.div`
  font-size: 16px;
  font-weight: 400;
  display: flex;
  align-items: center;
`

const TitleAddressPrefix = styled.div`
  margin-right: 8px;
`

const TitleAddress = styled.div`
  font-weight: 600;
`

const StyledCopyIconButton = styled(CopyIconButton)`
  position: relative;
  left: 12px;
`

const TransactionIconContainer = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.text2};
  line-height: 1;
  width: 1em;
  height: 1em;
`

const HyperlinkText = styled.div`
  text-decoration: underline;
`

const TransactionFailedField = styled(Field)`
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`

const TransactionLogMessage = styled(FieldValue)`
  line-break: anywhere;
  font-weight: 400;
  font-size: 14px;
  line-height: 15px;
`

const TransactionLogKey = styled(FieldKey)`
  display: flex;
  align-items: center;
  gap: 7px;
`

export interface ITransactionDetailBase {
  transactionTransformed: TransformedTransaction
  network: Network
  tokensByNetwork: Token[]
}

export interface ITransactionDetail extends ITransactionDetailBase {
  transaction: Transaction
  explorerTransaction?: never
}

export interface IExplorerTransactionDetail extends ITransactionDetailBase {
  transaction?: never
  explorerTransaction: IExplorerTransaction
}

export type TransactionDetailProps =
  | ITransactionDetail
  | IExplorerTransactionDetail

export const TransactionDetail: FC<TransactionDetailProps> = ({
  transaction,
  explorerTransaction,
  transactionTransformed,
  network
}) => {
  const { t } = useTranslation()
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)
  const { action, date, displayName, actualFee, dapp } = transactionTransformed
  const isRejected =
    explorerTransaction?.status === "REJECTED" ||
    transaction?.status === "REJECTED"
  const isTransfer = isTokenTransferTransaction(transactionTransformed)
  const isNFT = isNFTTransaction(transactionTransformed)
  const isNFTTransfer = isNFTTransferTransaction(transactionTransformed)
  const isTokenMint = isTokenMintTransaction(transactionTransformed)
  const isTokenApprove = isTokenApproveTransaction(transactionTransformed)
  const isDeclareContract = isDeclareContractTransaction(transactionTransformed)
  const isDeployContract = isDeployContractTransaction(transactionTransformed)
  const theme = useTheme()
  const title = useMemo(() => {
    if (isTransfer || isTokenMint || isTokenApprove) {
      const { amount, tokenAddress } = transactionTransformed
      return (
        <TransferTitle
          action={action}
          amount={amount}
          tokenAddress={tokenAddress}
          fallback={displayName}
        />
      )
    } else if (isNFT || isNFTTransfer) {
      const { contractAddress, tokenId } = transactionTransformed
      /** ERC721 */
      return (
        <NFTTitle
          contractAddress={contractAddress}
          tokenId={tokenId}
          networkId={network.id}
          fallback={displayName}
        />
      )
    }
    return displayName
  }, [
    isTransfer,
    isTokenMint,
    isTokenApprove,
    isNFT,
    isNFTTransfer,
    displayName,
    transactionTransformed,
    action,
    network.id,
  ])
  const additionalFields = useMemo(() => {
    if (isTransfer || isNFTTransfer) {
      const { fromAddress, toAddress } = transactionTransformed
      return (
        <>
          <AccountAddressField
            title={t("From")}
            accountAddress={fromAddress}
            networkId={network.id}
          />
          <AccountAddressField
            title={t("To")}
            accountAddress={toAddress}
            networkId={network.id}
          />
        </>
      )
    }
    return null
  }, [
    isTransfer,
    isNFTTransfer,
    transactionTransformed,
    network.id,
    t
  ])
  const titleShowsTo =
    (isTransfer || isNFTTransfer) &&
    (action === "SEND" || action === "TRANSFER")
  const titleShowsFrom = (isTransfer || isNFTTransfer) && action === "RECEIVE"
  const displayContractAddress =
    !!explorerTransaction &&
    formatTruncatedAddress(explorerTransaction.contractAddress)
  const hash = explorerTransaction?.transactionHash || transaction?.hash
  const displayTransactionHash = !!hash && formatTruncatedAddress(hash)
  const calls = explorerTransaction?.calls || transaction?.meta?.transactions
  const errorMessage =
    isRejected &&
    transaction &&
    getErrorMessageFromErrorDump(transaction.failureReason?.error_message)
  return (
    <StyledTransactionDetailWrapper
      scrollContent={transactionTransformed.displayName || t("Transaction")}
      title={
        <>
          {!isNFT && (
            <MainTransactionIconContainer>
              <TransactionIcon
                transaction={transactionTransformed}
                size={18}
                outline
              />
            </MainTransactionIconContainer>
          )}
          {title}
          {(titleShowsTo || titleShowsFrom) && (
            <TitleAddressContainer>
              <TitleAddressPrefix>
                {titleShowsTo ? t("To") : t("From")}:
              </TitleAddressPrefix>
              <TitleAddress>
                <PrettyAccountAddress
                  accountAddress={
                    titleShowsTo
                      ? transactionTransformed.toAddress
                      : transactionTransformed.fromAddress
                  }
                  networkId={network.id}
                  size={5}
                />
              </TitleAddress>
            </TitleAddressContainer>
          )}
          <Date>{date ? date : t("Unknown date")}</Date>
        </>
      }
    >
      {calls && (
        <TransactionCallDataBottomSheet
          open={bottomSheetOpen}
          onClose={() => setBottomSheetOpen(false)}
          calls={calls}
        />
      )}
      <ExpandableFieldGroup
        icon={<TransactionIcon transaction={transactionTransformed} size={9} />}
        title={t("Action")}
        subtitle={displayName}
      >
        {displayContractAddress && (
          <Field>
            <FieldKey>{t("Contract")}</FieldKey>
            <FieldValue>
              <StyledCopyIconButton
                size="s"
                copyValue={explorerTransaction.contractAddress}
                variant="transparent"
              >
                {displayContractAddress}
              </StyledCopyIconButton>
            </FieldValue>
          </Field>
        )}
        {calls && (
          <Field clickable onClick={() => setBottomSheetOpen(true)}>
            <FieldKey>{t("Call data")}</FieldKey>
            <FieldValue>
              <HyperlinkText>{t("View")}</HyperlinkText>
            </FieldValue>
          </Field>
        )}
        {!!explorerTransaction?.events?.length && (
          <SectionHeader>{t("Event")}</SectionHeader>
        )}
        {explorerTransaction?.events.map((event, index) => {
          const { name, address, parameters } = event
          const displayName = entryPointToHumanReadable(name)
          const displayAddress = formatTruncatedAddress(address)
          return (
            <ExpandableFieldGroup
              icon={
                <TransactionIconContainer>
                  <ActivityIcon />
                </TransactionIconContainer>
              }
              title={displayName}
              key={index}
            >
              <Field>
                <FieldKey>{t("Contract")}</FieldKey>
                <FieldValue>
                  <StyledCopyIconButton
                    size="s"
                    copyValue={address}
                    variant="transparent"
                  >
                    {displayAddress}
                  </StyledCopyIconButton>
                </FieldValue>
              </Field>
              {parameters.map((parameter, index) => {
                return (
                  <ParameterField
                    key={index}
                    parameter={parameter}
                    networkId={network.id}
                  />
                )
              })}
            </ExpandableFieldGroup>
          )
        })}
      </ExpandableFieldGroup>
      <FieldGroup>
        <Field>
          <FieldKey>{t("Status")}</FieldKey>
          <FieldValue>{isRejected ? "Failed" : "Complete"}</FieldValue>
        </Field>
        {errorMessage && (
          <Field>
            <FieldKey>{t("Reason")}</FieldKey>
            <LeftPaddedField>{errorMessage}</LeftPaddedField>
          </Field>
        )}
        {dapp && <DappContractField knownContract={dapp} />}
        {additionalFields}
        {actualFee && <FeeField fee={actualFee} networkId={network.id} />}
      </FieldGroup>
      {isRejected && transaction && (
        <FieldGroup>
          <TransactionFailedField clickable>
            <TransactionLogKey>
              <div>{t("Transaction log")}</div>
              <CopyTooltip
                message={t("Copied")}
                copyValue={
                  transaction.failureReason?.error_message || hash || ""
                }
              >
                <ContentCopyIcon style={{ fontSize: 12 }} />
              </CopyTooltip>
            </TransactionLogKey>
            <TransactionLogMessage style={{ color: theme.text2 }}>
              {transaction.failureReason?.error_message || t("Unknown error")}
            </TransactionLogMessage>
          </TransactionFailedField>
        </FieldGroup>
      )}
      {hash && (
        <FieldGroup>
          <Field
            clickable
            onClick={() => network.explorerUrl && openExplorerTransaction(network.explorerUrl, hash)}
          >
            <FieldKey>{t("Transaction ID")}</FieldKey>
            <FieldValue>
              <HyperlinkText>{displayTransactionHash}</HyperlinkText>
            </FieldValue>
          </Field>
        </FieldGroup>
      )}
      {isDeployContract && transaction && transaction.meta?.subTitle && (
        <FieldGroup>
          <Field
            clickable={!!transaction.meta?.subTitle}
            onClick={() => {
              if (transaction.meta?.subTitle) {
                openBlockExplorerAddress(network, transaction.meta?.subTitle)
              }
            }}
          >
            <FieldKey>{t("Deployed contract address")}</FieldKey>
            <FieldValue>
              <HyperlinkText>
                {formatTruncatedAddress(transaction.meta?.subTitle)}
              </HyperlinkText>
            </FieldValue>
          </Field>
        </FieldGroup>
      )}
      {isDeclareContract && transaction && transaction.meta?.subTitle && (
        <FieldGroup>
          <CopyToClipboard text={transaction.meta?.subTitle}>
            <Field clickable={!!transaction.meta?.subTitle}>
              <FieldKey>{t("Declared contract hash")}</FieldKey>
              <FieldValue>
                <HyperlinkText>
                  {formatTruncatedAddress(transaction.meta?.subTitle)}
                </HyperlinkText>
              </FieldValue>
            </Field>
          </CopyToClipboard>
        </FieldGroup>
      )}
    </StyledTransactionDetailWrapper>
  )
}
