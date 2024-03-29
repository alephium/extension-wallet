import { AlertDialog, BarBackButton, BarCloseButton, NavigationContainer } from "@argent/ui"
import { FC, useCallback, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { AccountAddress, AccountName } from "../../components/Address"
import { IconButton } from "../../components/Button"
import { CopyIconButton } from "../../components/CopyIconButton"
import { CheckCircleIcon, AddRoundedIcon } from "../../components/Icons/MuiIcons"
import { PageWrapper } from "../../components/Page"
import { routes } from "../../routes"
import { formatTruncatedAddress, normalizeAddress } from "../../services/addresses"
import { usePageTracking } from "../../services/analytics"
import {
  getAccountName,
  useAccountMetadata,
} from "../accounts/accountMetadata.state"
import { useSelectedAccount } from "../accounts/accounts.state"
import { QrCode } from "./QrCode"
import { testNodeWallet } from '@alephium/web3-test'
import { web3 } from "@alephium/web3"
import { defaultNetworks } from "../../../shared/network"
import { Flex } from "@chakra-ui/react"

const Container = styled.div`
  padding: 0 20px;
  text-align: center;
`

const StyledCopyIconButton = styled(CopyIconButton)`
  margin-top: 16px;
  width: auto;
`

const StyledIconButton = styled(IconButton)`
  margin-top: 16px;
  width: auto;
`

const alterMessages = [
  {
    title: "Request $ALPH",
    message: "The faucet can be requested once per 5 minutes, please try later"
  },
  {
    title: "Request $ALPH",
    message: "The local Devnet is not available, please start one"
  }
]

export const FundingQrCodeScreen: FC = () => {
  const navigate = useNavigate()
  const addressRef = useRef<HTMLParagraphElement | null>(null)
  const account = useSelectedAccount()
  usePageTracking("addFundsFromOtherAccount", {
    networkId: account?.networkId || "unknown",
  })
  const { accountNames } = useAccountMetadata()
  const copyAccountAddress = account ? normalizeAddress(account.address) : ""
  const [alertDialogIsOpen, setAlertDialogIsOpen] = useState(false)
  const [alterMessageIndex, setAlterMessageIndex] = useState(0)

  /** Intercept 'copy' event and replace fragmented address with plain text address */
  const onCopyAddress = useCallback(
    (e: ClipboardEvent) => {
      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", copyAccountAddress)
        e.preventDefault()
      }
    },
    [copyAccountAddress],
  )

  /** Intercept 'mouseup' and automatically select the entire address */
  const onSelectAddress = useCallback((_e: Event) => {
    const selection = window.getSelection()
    if (selection && addressRef.current) {
      selection.setBaseAndExtent(addressRef.current, 0, addressRef.current, 1)
    }
  }, [])

  /** Add / remove events when ref changes */
  const setAddressRef = useCallback(
    (ref: HTMLParagraphElement) => {
      if (addressRef.current) {
        addressRef.current.removeEventListener("copy", onCopyAddress)
        addressRef.current.removeEventListener("mouseup", onSelectAddress)
      }
      addressRef.current = ref
      if (addressRef.current) {
        addressRef.current.addEventListener("copy", onCopyAddress)
        addressRef.current.addEventListener("mouseup", onSelectAddress)
      }
    },
    [onCopyAddress, onSelectAddress],
  )
 
  const onRequestToken = useCallback(async () => {
    if (account?.networkId === 'testnet') {
      fetch('https://faucet.testnet.alephium.org/send', { method: 'POST', body: account?.address })
      .then(res =>{
        if (!res.ok) {
          setAlterMessageIndex(0)
          setAlertDialogIsOpen(true)
        } else {
          navigate(routes.accountTokens())
        }
      })
    } else if (account?.networkId === 'devnet') {
      try {
        const wallet = await testNodeWallet()
        const signerAddress = (await wallet.getSelectedAccount()).address
        await wallet.signAndSubmitTransferTx({ signerAddress: signerAddress, destinations: [{ address: account.address, attoAlphAmount: BigInt(1e21) }] })
        navigate(routes.accountTokens())
      } catch (error) {
        console.error(`Failed in request token`, error)
        setAlterMessageIndex(1)
        setAlertDialogIsOpen(true)
      }
    }
  }, [account?.address, account?.networkId, navigate])

  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      rightButton={
        <BarCloseButton onClick={() => navigate(routes.accountTokens())} />
      }
    >
    <Flex gap={2} mx={"auto"}>
      <AlertDialog
        isOpen={alertDialogIsOpen}
        title={alterMessages[alterMessageIndex].title}
        message={alterMessages[alterMessageIndex].message}
        onCancel={() => setAlertDialogIsOpen(false)}
        cancelTitle={"OK"}
      />
      <PageWrapper>
        {account && (
          <Container>
            <QrCode size={220} data={account?.address} />
            <AccountName>{getAccountName(account, accountNames)}</AccountName>
            <AccountAddress
              ref={setAddressRef}
              aria-label="Full account address"
            >
              {formatTruncatedAddress(account.address, 6)}
            </AccountAddress>
            <StyledCopyIconButton size="s" copyValue={copyAccountAddress}>
              Copy address
            </StyledCopyIconButton>
            {account.networkId !== 'mainnet' &&
              <div>
                <StyledIconButton
                  size="s"
                  icon={<AddRoundedIcon fontSize="inherit" />}
                  clickedIcon={<CheckCircleIcon fontSize="inherit" />}
                  clickedTimeout={5 * 60 * 1000}
                  onClick={onRequestToken}
                >
                  Request $ALPH
                </StyledIconButton>
              </div>
            }
          </Container>
        )}
      </PageWrapper>
    </Flex>
    </NavigationContainer>
  )
}
