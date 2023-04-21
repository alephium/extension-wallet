import {
  BarBackButton,
  BarCloseButton,
  CellStack,
  NavigationContainer,
} from "@argent/ui"
import { FC, Suspense, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import styled from "styled-components"

import { SearchIcon } from "../../components/Icons/SearchIcon"
import {
  ControlledInputType,
  StyledControlledInput,
} from "../../components/InputText"
import { Spinner } from "../../components/Spinner"
import { showTokenId } from "../accountActivity/transform/transaction/transformTransaction"
import { AccountCollections } from "../accountNfts/AccountCollections"
import { Collection, Collections } from "../accountNfts/aspect.service"
import { useCollections } from "../accountNfts/useCollections"
import { useSelectedAccount } from "../accounts/accounts.state"
import { TokenList } from "../accountTokens/TokenList"
import { Token } from "../../../shared/token/type"
import { useTokens } from "../accountTokens/tokens.state"

const SearchBox = styled.form`
  margin-top: 8px;
`

const StyledInput: ControlledInputType = styled(StyledControlledInput)`
  padding: 16px;
  padding-left: 41px;
`

const InputBefore = styled.div`
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 24px;
`

const TabGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 20px;
`

const Tab = styled.div<{ active: boolean }>`
  background: ${({ theme, active }) => (active ? theme.bg2 : "transparent")};
  border: 1px solid
    ${({ theme, active }) => (active ? "transparent" : theme.bg2)};
  color: ${({ theme, active }) => (active ? theme.text1 : theme.text2)};
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  padding: 6px 12px 8px;
  cursor: pointer;
`

const TabView = styled.div`
  margin: 24px -24px 0;
`

const StyledAccountCollections = styled(AccountCollections)`
  padding-top: 0;
`

type SendAssetTab = "tokens" | "nfts"

export const SendScreen: FC = () => {
  const { control, watch } = useForm({
    defaultValues: { query: "" },
  })

  const account = useSelectedAccount()

  const [selectedTab, setSelectedTab] = useState<SendAssetTab>("tokens")

  const currentQueryValue = watch().query

  const tokensInNetwork = useTokens(account)

  const tokenList = useCustomTokenList(tokensInNetwork, account?.networkId, currentQueryValue)

  const collectibles = useCollections(account)


  if (!account) {
    return <></>
  }

  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      rightButton={<BarCloseButton />}
      title={"Send"}
    >
      <Container>
        <SearchBox>
          <StyledInput
            autoComplete="off"
            name="query"
            placeholder="Search"
            type="text"
            control={control}
            autoFocus
          >
            <InputBefore>
              <SearchIcon />
            </InputBefore>
          </StyledInput>
        </SearchBox>

        <TabView>
          <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
            <CellStack pt={0}>
              <TokenList
                tokenList={tokenList}
                variant="no-currency"
                navigateToSend
                showNewTokenButton
              />
            </CellStack>
          </Suspense>
        </TabView>
      </Container>
    </NavigationContainer>
  )
}

const useCustomTokenList = (
  tokens: Token[],
  networkId?: string,
  query?: string,
) => {
  return useMemo(() => {
    if (!query) {
      return tokens
    }

    const queryLowercase = query.toLowerCase()

    const result = tokens.filter(
      (token) =>
        token.name.toLowerCase().includes(queryLowercase) ||
        showTokenId(networkId ?? 'mainnet', token.id).toLowerCase().includes(queryLowercase) ||
        token.symbol.toLowerCase().includes(queryLowercase),
    )
    return result
  }, [query, tokens])
}

const useCustomCollectiblesList = (
  collectibles: Collections,
  query?: string,
) => {
  return useMemo(() => {
    if (!query) {
      return collectibles
    }

    return collectibles.filter(
      (collectible: Collection) =>
        collectible.name?.includes(query) ||
        collectible.contractAddress.includes(query),
    )
  }, [collectibles, query])
}
