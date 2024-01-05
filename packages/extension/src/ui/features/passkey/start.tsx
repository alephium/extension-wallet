import { FC, useCallback, useState } from "react"
import { useParams } from "react-router-dom"
import styled from "styled-components"
import { ButtonGroup, Input } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"

import { Button } from "../../components/Button"
import { FormError } from "../../theme/Typography"
import { PageWrapper, Panel } from "../../components/FullScreenPage"
import LogoSvg from "../lock/logo.svg"
import { createPasskeyAccount, importPasskey } from "../accounts/passkey.service"
import { selectAccount } from "../../services/backgroundAccounts"
import { recover } from "../recovery/recovery.service"

export const StyledButton = styled(Button)`
  width: fit-content;
  padding-left: 32px;
  padding-right: 32px;
  margin: 8px auto 0;
`

export const PasskeyStartScreen: FC = () => {
  const { networkId } = useParams()
  const [error, setError] = useState<string | undefined>()
  const [walletName, setWalletName] = useState<string>('')
  const navigate = useNavigate()

  const createAccount = useCallback(async () => {
    if (walletName === '') {
      setError('Wallet name is empty')
      return
    }
    if (networkId === undefined) {
      setError('Network id is not specified')
      return
    }
    try {
      setError(undefined)
      const account = await createPasskeyAccount(networkId, walletName)
      await selectAccount(account)
      navigate(await recover())
    } catch (error) {
      setError(`${error}`)
    }
  }, [walletName, networkId, navigate])

  const importAccount = useCallback(async () => {
    if (networkId === undefined) {
      setError('Network id is not specified')
      return
    }
    try {
      setError(undefined)
      const account = await importPasskey(networkId)
      await selectAccount(account)
      navigate(await recover())
    } catch (error) {
      setError(`${error}`)
    }
  }, [networkId, navigate])

  if (networkId === undefined) {
    return <></>
  }

  return (
    <PageWrapper>
      <Panel>
        <Input
          htmlSize={26}
          width='auto'
          autoFocus
          placeholder="Wallet Name"
          type="text"
          value={walletName}
          onChange={(e: any) => {
            setWalletName(e.target.value)
          }}
        />
        <ButtonGroup gap='4'>
          <StyledButton
            style={{ marginTop: 32 }}
            variant="primary"
            onClick={createAccount}
          >
            Create
          </StyledButton>
          <StyledButton
            style={{ marginTop: 32 }}
            variant="primary"
            onClick={importAccount}
          >
            Import
          </StyledButton>
        </ButtonGroup>
        {error && <FormError>{error}</FormError>}
      </Panel>
      <Panel><LogoSvg /></Panel>
    </PageWrapper>
  )
}