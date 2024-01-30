import { AlertDialog, Button, icons } from "@argent/ui"
import { Flex, SimpleGrid } from "@chakra-ui/react"
import { FC, useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { TokenWithBalance } from "../../../shared/token/type"

import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { useNetworkFeeToken } from "./tokens.state"

const { AddIcon, SendIcon } = icons

interface AccountTokensButtonsProps {
  tokens: TokenWithBalance[]
}

export const AccountTokensButtons: FC<AccountTokensButtonsProps> = ({
  tokens
}) => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()

  const sendToken = useNetworkFeeToken(switcherNetworkId)

  const hasNonZeroBalance = useMemo(() => {
    return tokens.some(({ balance }) => balance?.gt(0))
  }, [tokens])

  const [alertDialogIsOpen, setAlertDialogIsOpen] = useState(false)

  const onCancel = useCallback(() => {
    setAlertDialogIsOpen(false)
  }, [])

  const onSend = useCallback(() => {
    if (hasNonZeroBalance) {
      navigate(routes.sendScreen())
    } else {
      setAlertDialogIsOpen(true)
    }
  }, [
    hasNonZeroBalance,
    navigate,
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
