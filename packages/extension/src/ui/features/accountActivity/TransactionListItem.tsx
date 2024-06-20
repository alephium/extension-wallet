import { H6, P4 } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, ReactNode, useMemo } from "react"
import { ReviewTransactionResult } from "../../../shared/actionQueue/types"

import { CustomButtonCell } from "../../components/CustomButtonCell"
import { formatLongString } from "../../services/addresses"
import { PrettyAccountAddress } from "../accounts/PrettyAccountAddress"
import {
  isAlphTransferTransaction,
  isDeclareContractTransaction,
  isDeployContractTransaction,
  isNFTTransaction,
  isNFTTransferTransaction,
  isSwapTransaction,
  isTokenApproveTransaction,
  isTokenMintTransaction,
  isTokenTransferTransaction,
} from "./transform/is"
import { TransformedAlephiumTransaction, TransformedTransaction } from "./transform/type"
import { NFTImage } from "./ui/NFTImage"
import { SwapAccessory } from "./ui/SwapAccessory"
import { SwapTransactionIcon } from "./ui/SwapTransactionIcon"
import { ReviewedTransactionIcon, TransactionIcon } from "./ui/TransactionIcon"
import { ReviewedScriptTxAccessory, ReviewedTransferAccessory, TokenAmount, TransferAccessory } from "./ui/TransferAccessory"
import { useTranslation } from "react-i18next"

export interface TransactionListItemProps {
  transactionTransformed: TransformedTransaction
  networkId: string
  highlighted?: boolean
  onClick?: () => void
  children?: ReactNode | ReactNode[]
}

export const TransactionListItem: FC<TransactionListItemProps> = ({
  transactionTransformed,
  networkId,
  highlighted,
  children,
  ...props
}) => {
  const { t } = useTranslation()
  const { action, displayName, dapp } = transactionTransformed
  const isNFT = isNFTTransaction(transactionTransformed)
  const isNFTTransfer = isNFTTransferTransaction(transactionTransformed)
  const isTransfer = isTokenTransferTransaction(transactionTransformed)
  const isAlphTransfer = isAlphTransferTransaction(transactionTransformed)
  const isSwap = isSwapTransaction(transactionTransformed)
  const isTokenMint = isTokenMintTransaction(transactionTransformed)
  const isTokenApprove = isTokenApproveTransaction(transactionTransformed)
  const isDeclareContract = isDeclareContractTransaction(transactionTransformed)
  const isDeployContract = isDeployContractTransaction(transactionTransformed)

  const subtitle = useMemo(() => {
    if (isTransfer || isNFTTransfer || isAlphTransfer) {
      const titleShowsTo =
        (isTransfer || isNFTTransfer) &&
        (action === "SEND" || action === "TRANSFER" || action === "MOVE" || action === "RECEIVE")
      const { toAddress, fromAddress } = transactionTransformed
      return (
        <>
          {titleShowsTo ? t("To") : t("From")}:{" "}
          <PrettyAccountAddress
            accountAddress={titleShowsTo ? toAddress : fromAddress}
            networkId={networkId}
            icon={false}
          />
        </>
      )
    }
    if (dapp) {
      return <>{dapp.title}</>
    }
    if (isDeclareContract) {
      return <>{transactionTransformed.classHash}</>
    }
    if (isDeployContract) {
      return <>{transactionTransformed.contractAddress}</>
    }
    return null
  }, [
    isTransfer,
    dapp,
    isNFTTransfer,
    isDeclareContract,
    isDeployContract,
    action,
    transactionTransformed,
    networkId,
    t
  ])

  const icon = useMemo(() => {
    if (isNFT) {
      const { contractAddress, tokenId } = transactionTransformed
      return (
        <NFTImage
          contractAddress={contractAddress}
          tokenId={tokenId}
          networkId={networkId}
          display={"flex"}
          flexShrink={0}
          rounded={"lg"}
          width={9}
          height={9}
        />
      )
    }
    if (isSwap) {
      return (
        <SwapTransactionIcon transaction={transactionTransformed} size={9} />
      )
    }
    return <TransactionIcon transaction={transactionTransformed} size={9} />
  }, [isNFT, isSwap, transactionTransformed, networkId])

  const accessory = useMemo(() => {
    if (isTransfer || isTokenMint || isTokenApprove) {
      return <TransferAccessory transaction={transactionTransformed} />
    }
    if (isSwap) {
      return <SwapAccessory transaction={transactionTransformed} />
    }
    return null
  }, [isTransfer, isTokenMint, isTokenApprove, isSwap, transactionTransformed])

  return (
    <CustomButtonCell highlighted={highlighted} {...props}>
      {icon}
      <Flex
        flexGrow={1}
        alignItems="center"
        justifyContent={"space-between"}
        gap={2}
        overflow={"hidden"}
      >
        <Flex direction={"column"} overflow="hidden">
          <H6 overflow="hidden" textOverflow={"ellipsis"}>
            {displayName}
          </H6>
          <P4
            color="neutrals.300"
            fontWeight={"semibold"}
            overflow="hidden"
            textOverflow={"ellipsis"}
          >
            {subtitle}
          </P4>
        </Flex>
      </Flex>
      {accessory}
      {children}
    </CustomButtonCell>
  )
}

export interface ReviewedTransactionListItemProps {
  transactionTransformed: TransformedAlephiumTransaction
  networkId: string
  highlighted?: boolean
  onClick?: () => void
  children?: ReactNode | ReactNode[]
}

export const ReviewedTransactionListItem: FC<ReviewedTransactionListItemProps> = ({
  transactionTransformed,
  networkId,
  highlighted,
  children,
  ...props
}) => {
  const { t } = useTranslation()
  const isTransfer = transactionTransformed.type === 'TRANSFER'
  const isDeployContract = transactionTransformed.type === 'DEPLOY_CONTRACT'
  const isExecuteScript = transactionTransformed.type === 'EXECUTE_SCRIPT'
  const isUnsignedTx = transactionTransformed.type === 'UNSIGNED_TX'

  const subtitles = useMemo(() => {
    if (isTransfer) {
      const result = transactionTransformed.destinations.map(destination => {
        return <>
          {`${destination.type}: `}
          <PrettyAccountAddress
            accountAddress={destination.address}
            networkId={networkId}
            icon={false}
          />
        </>

      })
      if (result.length > 4) {
        return [...result.slice(0, 3), "..."]
      } else {
        return result
      }
    }
    if (isDeployContract) {
      return [<>{`@${formatLongString(transactionTransformed.contractAddress)}`}</>]
    }
    if (isExecuteScript) {
      return [<>{`${transactionTransformed.host ?? t("Unknown host")}`}</>]
    }
    if (isUnsignedTx) {
      return [<>{`${t("Raw tx")}: ${formatLongString(transactionTransformed.unsignedTx)}`}</>]
    }
    return null
  }, [
    isTransfer,
    isDeployContract,
    isExecuteScript,
    isUnsignedTx,
    transactionTransformed,
    networkId,
    t
  ])

  const displayName = useMemo(() => {
    switch (transactionTransformed.type) {
      case "TRANSFER":
        return transactionTransformed.transferType
      case "DEPLOY_CONTRACT":
        return t("Deploy")
      case "EXECUTE_SCRIPT":
        return "dApp"
      default:
        return t("Raw tx")
    }
  }, [transactionTransformed, t])

  const accessory = useMemo(() => {
    if (isTransfer) {
      return <ReviewedTransferAccessory networkId={networkId} amountChanges={transactionTransformed.amountChanges} />
    }
    if (isDeployContract) {
      const mintAmount = transactionTransformed.issueTokenAmount
      if (mintAmount !== undefined) {
        return <TokenAmount amount={t(`Mint`)} symbol={t("Token")}/>
      }
      return null
    }
    if (isExecuteScript) {
      return <ReviewedScriptTxAccessory networkId={networkId} transaction={transactionTransformed} />
    }
    if (isUnsignedTx) {
      return null
    }
    return null
  }, [isTransfer, isDeployContract, isExecuteScript, isUnsignedTx, transactionTransformed, networkId, t])

  const icon = useMemo(() => {
    return <ReviewedTransactionIcon transaction={transactionTransformed} size={9} />
  }, [transactionTransformed])

  return (
    <CustomButtonCell highlighted={highlighted} {...props}>
      {icon}
      <Flex
        flexGrow={1}
        alignItems="center"
        justifyContent={"space-between"}
        gap={2}
        overflow={"hidden"}
      >
        <Flex direction={"column"} overflow="hidden">
          <H6 overflow="hidden" textOverflow={"ellipsis"}>
            {displayName}
          </H6>
          {subtitles !== null &&
            subtitles.map((t,index) => {
              return (<P4
                key={index}
                color="neutrals.300"
                fontWeight={"semibold"}
                overflow="hidden"
                textOverflow={"ellipsis"}
              >
                {t}
              </P4>)
            })
          }
        </Flex>
      </Flex>
      {accessory}
      {children}
    </CustomButtonCell>
  )
}
