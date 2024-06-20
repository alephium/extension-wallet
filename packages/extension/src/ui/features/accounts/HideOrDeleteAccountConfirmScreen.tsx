import { FC } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import { hideAccount } from "../../../shared/account/store"
import { useAppState } from "../../app.state"
import { AccountAddress, AccountName } from "../../components/Address"
import { routes } from "../../routes"
import { formatFullAddress } from "../../services/addresses"
import { deleteAccount } from "../../services/backgroundAccounts"
import { P } from "../../theme/Typography"
import { DeprecatedConfirmScreen } from "../actions/DeprecatedConfirmScreen"
import { getAccountName, useAccountMetadata } from "./accountMetadata.state"
import { useAccount } from "./accounts.state"
import { autoSelectAccountOnNetwork } from "./switchAccount"
import { useTranslation } from "react-i18next"

const StyledP = styled(P)`
  margin-bottom: 16px;
  line-height: 150%;
`

const AddressWrapper = styled.span`
  margin: 16px 0 32px;
  padding: 16px 16px 24px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  overflow: hidden;
  text-align: center;

  > ${AccountName} {
    margin-top: 0;
  }

  > ${AccountAddress} {
    color: ${({ theme }) => theme.text1};
  }
`

export const HideOrDeleteAccountConfirmScreen: FC<{
  mode: "hide" | "delete"
}> = ({ mode }) => {
  const { t } = useTranslation()
  const { accountAddress = "" } = useParams<{ accountAddress: string }>()
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const { accountNames } = useAccountMetadata()
  const account = useAccount({
    address: accountAddress,
    networkId: switcherNetworkId,
  })

  if (!accountAddress || !account) {
    return <></>
  }

  const handleSubmit = async () => {
    if (mode === "hide") {
      await hideAccount({
        address: accountAddress,
        networkId: switcherNetworkId,
      })
    }
    if (mode === "delete") {
      await deleteAccount(accountAddress, switcherNetworkId)
    }

    const account = await autoSelectAccountOnNetwork(switcherNetworkId)
    if (account) {
      navigate(routes.accounts())
    } else {
      /** no accounts, return to empty account screen */
      navigate(routes.accountTokens())
    }
  }

  return (
    <DeprecatedConfirmScreen
      title={mode === "hide" ? t("Hide Account") : t("Delete Account")}
      confirmButtonText={mode === "hide" ? t("Hide") : t("Delete")}
      confirmButtonBackgroundColor="#C12026"
      rejectButtonText={t("Cancel")}
      onSubmit={handleSubmit}
      onReject={() => navigate(-1)}
    >
      <StyledP>
        {mode === "hide"
          ? t("You are about to hide the following account:")
          : t("You are about to delete the following account:")}
      </StyledP>
      <AddressWrapper>
        <AccountName>{getAccountName(account, accountNames)}</AccountName>
        <AccountAddress>{formatFullAddress(account.address)}</AccountAddress>
      </AddressWrapper>
      <StyledP>
        {mode === "hide"
          ? t("You will be able to unhide the account from the account list screen.")
          : t("You will need to recover this account manually in the future.")}
      </StyledP>
    </DeprecatedConfirmScreen>
  )
}
