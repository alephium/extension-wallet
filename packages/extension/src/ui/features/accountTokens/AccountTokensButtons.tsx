import { AlertDialog, Button, icons } from "@argent/ui"
import { Flex, SimpleGrid } from "@chakra-ui/react"
import { FC, useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { Account } from "../accounts/Account"
import { useNetworkFeeToken, useKnownFungibleTokensWithBalance } from "./tokens.state"

const { AddIcon, SendIcon } = icons

interface AccountTokensButtonsProps {
  account: Account
}

export const AccountTokensButtons: FC<AccountTokensButtonsProps> = ({
  account,
}) => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()

  const sendToken = useNetworkFeeToken(switcherNetworkId)
  const { tokenDetails, tokenDetailsIsInitialising } =
    useKnownFungibleTokensWithBalance(account)

  const hasNonZeroBalance = useMemo(() => {
    return tokenDetails.some(({ balance }) => balance?.gt(0))
  }, [tokenDetails])

  const [alertDialogIsOpen, setAlertDialogIsOpen] = useState(false)

  const onCancel = useCallback(() => {
    setAlertDialogIsOpen(false)
  }, [])

  const onSend = useCallback(() => {
    /** tokenDetailsIsInitialising - balance is unknown, let the Send screen deal with it */
    if (
      (tokenDetailsIsInitialising || hasNonZeroBalance)
    ) {
      navigate(routes.sendScreen())
    } else {
      setAlertDialogIsOpen(true)
    }
  }, [
    hasNonZeroBalance,
    navigate,
    tokenDetailsIsInitialising,
  ])

  const onAddFunds = useCallback(() => {
    navigate(routes.fundingQrCode('undefined'))
  }, [navigate])

  const title = "Add funds"
  const message = `You need to ${"add funds to this account"
  } before you can send`

  return (
    <Flex gap={2} mx={"auto"}>
      <AlertDialog
        isOpen={alertDialogIsOpen}
        title={title}
        message={message}
        cancelTitle={undefined}
        onCancel={onCancel}
        confirmTitle="Add funds"
        onConfirm={onAddFunds}
      />
      <SimpleGrid columns={sendToken ? 2 : 1} spacing={2}>
        <Button
          onClick={onAddFunds}
          colorScheme={"tertiary"}
          size="sm"
          leftIcon={<AddIcon />}
        >
          Add funds
        </Button>
        {sendToken && (
          <Button
            onClick={onSend}
            colorScheme={"tertiary"}
            size="sm"
            leftIcon={<SendIcon />}
          >
            Send
          </Button>
        )}
      </SimpleGrid>
    </Flex>
  )
}
