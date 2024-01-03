import { FC, useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAppState } from "../../app.state"
import A from "tracking-link"

import {
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Spacer,
} from "@chakra-ui/react"

import { IconBar } from "../../components/IconBar"
import { Option, OptionsWrapper } from "../../components/Options"
import { PageWrapper, Title } from "../../components/Page"
import { FormError } from "../../theme/Typography"
import { ChevronDownIcon } from "@chakra-ui/icons"
import { TOTAL_NUMBER_OF_GROUPS } from "@alephium/web3"
import { useAddAccount } from "./useAddAccount"
import { AlephiumLogo } from "../../components/Icons/ArgentXLogo"
import { LedgerIcon } from "../../components/Icons/LedgerIcon"
import styled from "styled-components"

const StyledAlephiumLogo = styled(AlephiumLogo)`
  font-size: 20px;
  color: ${({ theme }) => theme.primary};
  width: 1.5em;
  height: 1.5em;
`

interface MenuSelectorProps {
  title: string
  options: readonly string[]
  setValue: (value: string) => void
}

export const MemuSelector: FC<MenuSelectorProps> = ({ title, options, setValue }) => {
  const [currentOption, setCurrentOption] = useState<string>()

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />} w={'140px'} size={"xs"} margin="1">
        {title}: {currentOption ?? options[0]}
      </MenuButton>
      <Portal>
        <MenuList p={0} minW="0" w={'140px'}>
          {options.map(option => {
            const isCurrent = option === currentOption
            return (<MenuItem w="inherit" key={option} onClick={() => { setCurrentOption(option); setValue(option) }} sx={isCurrent ? { backgroundColor: "neutrals.600", } : {}}>
              {title}: {option}
              {/* <Flex
                  ml={"auto"}
                  justifyContent={"flex-end"}
                  alignItems={"center"}
                  pointerEvents={"none"}
                >
                  <Flex direction={"column"} alignItems={"flex-end"} textAlign={textAlign}>{option}</Flex>
                </Flex> */}
            </MenuItem>)
          })}
        </MenuList>
      </Portal>
    </Menu>
  )
}

const groupOptions = ["any", ...Array.from(Array(TOTAL_NUMBER_OF_GROUPS).keys()).map(g => `${g}`)]
const signOptions = ["default", "schnorr", "passkey"] as const

export const AddAccount: FC = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | undefined>()
  const [group, setGroup] = useState<string>(groupOptions[0])
  const [signMethod, setSignMethod] = useState<string>(signOptions[0])
  const { switcherNetworkId } = useAppState()

  const { addAccount } = useAddAccount()
    
  const parsedGroup = group === "any" ? undefined : parseInt(group)
  const parsedKeyType = signMethod === "default" ? "default" : signMethod === 'passkey' ? 'passkey' : "bip340-schnorr"

  return (
    <>
      <IconBar close />
      <PageWrapper>
        <Title>Add a new account</Title>
        <Flex marginBottom={5}>
          <MemuSelector title="Group" options={groupOptions} setValue={setGroup}></MemuSelector>
          <Spacer />
          <MemuSelector title="Sign" options={signOptions} setValue={setSignMethod}></MemuSelector>
        </Flex>
        <OptionsWrapper>
          <Option
            title="Create new Alephium account"
            icon={<StyledAlephiumLogo />}
            description="Generate a new wallet address"
            hideArrow
            onClick={() => addAccount(parsedKeyType, parsedGroup).catch((error) => setError(`${error}`))}
          />
          {
            parsedKeyType === "default" &&
            <A
              href={`/index.html?goto=ledger&networkId=${switcherNetworkId}&group=${parsedGroup}&keyType=${parsedKeyType}`}
              targetBlank
              onClick={async () => {
                // somehow this just works if this function is provided
              }}
            >
              <Option
                title="Connect Ledger"
                description="Use a Ledger hardware wallet"
                icon={<LedgerIcon />}
                hideArrow
              />
            </A>
          }
        </OptionsWrapper>
        {error && (
          <FormError>
            {`There was an error creating your account: ${error}. Please try again.`}
          </FormError>
        )}
      </PageWrapper>
    </>
  )
}
