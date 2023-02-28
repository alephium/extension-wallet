import { ALPH_TOKEN_ID, Destination, DUST_AMOUNT, NodeProvider, prettifyAttoAlphAmount } from "@alephium/web3"
import { BuildSweepAddressTransactionsResult } from "@alephium/web3/dist/src/api/api-alephium"
import { BarBackButton, NavigationContainer } from "@argent/ui"
import { utils } from "ethers"
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"
import { Schema, object } from "yup"

import { AddressBookContact } from "../../../shared/addressBook"
import { inputAmountSchema, parseAmount } from "../../../shared/token/amount"
import { prettifyCurrencyValue } from "../../../shared/token/price"
import { AddContactBottomSheet } from "../../components/AddContactBottomSheet"
import { Button, ButtonTransparent } from "../../components/Button"
import Column, { ColumnCenter } from "../../components/Column"
import { IconBar } from "../../components/IconBar"
import { AtTheRateIcon } from "../../components/Icons/AtTheRateIcon"
import { CloseIconAlt } from "../../components/Icons/CloseIconAlt"
import { AddIcon } from "../../components/Icons/MuiIcons"
import {
  StyledControlledInput,
  StyledControlledTextArea,
} from "../../components/InputText"
import Row, { RowBetween } from "../../components/Row"
import { routes } from "../../routes"
import { makeClickable } from "../../services/a11y"
import { useAddressBook } from "../../services/addressBook"
import {
  addressSchema,
  formatTruncatedAddress,
  isEqualAddress,
  isValidAddress,
  normalizeAddress,
} from "../../services/addresses"
import {
  sendTransferTransaction, sendUnsignedTxTransaction,
} from "../../services/transactions"
import { useOnClickOutside } from "../../services/useOnClickOutside"
import { H3, H5 } from "../../theme/Typography"
import { Account } from "../accounts/Account"
import {
  getAccountName,
  useAccountMetadata,
} from "../accounts/accountMetadata.state"
import { getAccountImageUrl } from "../accounts/accounts.service"
import { useSelectedAccount } from "../accounts/accounts.state"
import { AddressBookMenu } from "../accounts/AddressBookMenu"
import { ProfilePicture } from "../accounts/ProfilePicture"
import { useCurrentNetwork } from "../networks/useNetworks"
import { useYupValidationResolver } from "../settings/useYupValidationResolver"
import { TokenIcon } from "./TokenIcon"
import { TokenMenuDeprecated } from "./TokenMenuDeprecated"
import { useTokenUnitAmountToCurrencyValue } from "./tokenPriceHooks"
import { formatTokenBalance, toTokenView } from "./tokens.service"
import {
  TokenDetailsWithBalance,
  useNetworkFeeToken,
  useTokensWithBalance,
} from "./tokens.state"

export const BalanceText = styled.div`
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  text-align: center;
  color: ${({ theme }) => theme.text2};
`

export const StyledIconBar = styled(IconBar)`
  align-items: flex-start;
`

export const StyledForm = styled.form`
  padding: 24px;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
`

export const InputGroupAfter = styled.div`
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
`

export const InputGroupBefore = styled(InputGroupAfter)`
  right: unset;
  left: 16px;
`

export const StyledMaxButton = styled(Button)`
  border-radius: 100px;
  background-color: ${({ theme }) => theme.text3};
  display: flex;
  align-items: center;
  justify-content: center;

  font-weight: 600;
  font-size: 13px;
  line-height: 18px;
  margin-top: 0 !important;
  padding: 4px 8px;
`

const ButtonSpacer = styled.div`
  display: flex;
  flex: 1;
`

export const AtTheRateWrapper = styled(StyledMaxButton) <{ active?: boolean }>`
  padding: 6px;

  background-color: ${({ theme, active }) => active && theme.white};
  svg {
    path {
      fill: ${({ theme, active }) => (active ? theme.black : theme.white)};
    }
  }

  &:hover,
  &:focus {
    background-color: ${({ theme, active }) => active && theme.white};
    svg {
      path {
        fill: ${({ theme, active }) => (active ? theme.black : theme.white)};
      }
    }
  }
`

export const InputTokenSymbol = styled.span`
  text-transform: uppercase;
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  color: ${({ theme }) => theme.text2};
`

export const FormError = styled.p`
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.red1};
  margin-top: 8px;
  margin-left: 8px;
  text-align: left;
`

export const CurrencyValueText = styled(InputTokenSymbol)`
  font-weight: 400;
`

export const AddressBookRecipient = styled.div`
  background-color: ${({ theme }) => theme.black};
  border: 1px solid ${({ theme }) => theme.bg2};
  border-radius: 8px;
  padding: 16px;
`

export const StyledAccountAddress = styled.p`
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.text2};
`

export const SaveAddressButton = styled(ButtonTransparent)`
  ${({ theme }) => theme.flexRowNoWrap}
  justify-content: flex-end;
  gap: 3px;
  align-items: center;

  color: ${({ theme }) => theme.blue1};

  font-weight: 400;
  font-size: 13px;
  line-height: 18px;

  &:hover {
    text-decoration: underline;
  }
`

const WarningContainer = styled.div`
  margin-top: 15px;
  border: 1px solid ${({ theme }) => theme.red1};
  padding: 9px 13px 8px;
  overflow-wrap: break-word;
  font-size: 16px;
  line-height: 120%;
  border-radius: 4px;
`

export interface SendInput {
  recipient: string
  amount: string
}

const SendSchema: Schema<SendInput> = object().required().shape({
  recipient: addressSchema,
  amount: inputAmountSchema,
})

export const SendTokenScreen: FC = () => {
  const navigate = useNavigate()
  const { tokenAddress } = useParams<{ tokenAddress: string }>()
  const account = useSelectedAccount()
  const { tokenDetails } = useTokensWithBalance(account)
  const resolver = useYupValidationResolver(SendSchema)
  const feeToken = useNetworkFeeToken(account?.networkId)
  const [maxClicked, setMaxClicked] = useState(false)
  const [txsNumber, setTxsNumber] = useState(1)
  const [addressBookRecipient, setAddressBookRecipient] = useState<
    Account | AddressBookContact
  >()
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)
  const { accountNames } = useAccountMetadata()

  const accountName = useMemo(
    () =>
      addressBookRecipient
        ? "name" in addressBookRecipient
          ? addressBookRecipient.name
          : getAccountName(addressBookRecipient, accountNames)
        : undefined,
    [accountNames, addressBookRecipient],
  )

  const { id: currentNetworkId, nodeUrl } = useCurrentNetwork()

  const {
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, submitCount },
    getFieldState,
    control,
    setValue,
    watch,
  } = useForm<SendInput>({
    defaultValues: {
      recipient: "",
      amount: "",
    },
    resolver,
  })

  const formValues = watch()

  const inputAmount = formValues.amount
  const inputRecipient = formValues.recipient

  const token = tokenDetails.find(({ address }) => address === tokenAddress)
  const currencyValue = useTokenUnitAmountToCurrencyValue(token, inputAmount)
  const maxFee = "10000000000000000"  // FIXME: hardcoded to 0.01 ALPH for now
  const standardFee = "2000000000000000"  // FIXME: Should estimate, hardcoded to 0.002 ALPH for now

  const setMaxInputAmount = useCallback(
    (token: TokenDetailsWithBalance, maxFee?: string) => {
      const tokenDecimals = token.decimals ?? 18
      const tokenBalance = formatTokenBalance(token.balance, tokenDecimals)

      if (token.balance && maxFee) {
        const balanceBn = token.balance

        const maxAmount =
          account?.networkId ===
          "devnet" /** FIXME: workaround for localhost fee estimate with devnet 0.3.4 */
            ? balanceBn.sub(maxFee).sub(100000000000000)
            : balanceBn.sub(maxFee)

        const formattedMaxAmount = utils.formatUnits(maxAmount, tokenDecimals)
        setValue(
          "amount",
          maxAmount.lte(0) ? tokenBalance : formattedMaxAmount,
          {
            shouldDirty: true,
          },
        )
      }
    },
    [account?.networkId, setValue],
  )

  const [addressBookOpen, setAddressBookOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setAddressBookOpen(false))

  const addressBook = useAddressBook(account?.networkId || currentNetworkId)

  const validateAddress = useCallback(
    (addr: string) => isValidAddress(addr),
    [],
  )

  const validRecipientAddress =
    inputRecipient && !getFieldState("recipient").error

  const isAlphToken = (tokenAddress: string | undefined): boolean => {
    return tokenAddress?.slice(2) === ALPH_TOKEN_ID || tokenAddress === undefined
  }

  const isSweepingAllAsset = (tokenAddress: string | undefined): boolean => {
    return maxClicked && isAlphToken(tokenAddress)
  }

  const recipientInAddressBook = useMemo(
    () =>
      // Check if inputRecipient is in Contacts or userAccounts
      [...addressBook.contacts, ...addressBook.userAccounts].some((acc) =>
        isEqualAddress(acc.address, inputRecipient),
      ),
    [addressBook.contacts, addressBook.userAccounts, inputRecipient],
  )

  const sweepTransaction: Promise<BuildSweepAddressTransactionsResult | undefined> = useMemo(
    async () => {
      let result = undefined
      if (account && maxClicked && isAlphToken(tokenAddress) && validateAddress(inputRecipient)) {
        const nodeProvider = new NodeProvider(nodeUrl)
        result = await nodeProvider.transactions.postTransactionsSweepAddressBuild({
          fromPublicKey: account.publicKey,
          toAddress: inputRecipient
        })
        setTxsNumber(result.unsignedTxs.length)
      }

      return result
    },
    [nodeUrl, account, maxClicked, tokenAddress, inputRecipient, validateAddress],
  )

  const showSaveAddressButton = validRecipientAddress && !recipientInAddressBook

  useEffect(() => {
    if (maxClicked && maxFee && token) {
      setMaxInputAmount(token, maxFee)
    }
    // dont add token as dependency as the reference can change
  }, [maxClicked, maxFee, setMaxInputAmount, token?.address, token?.networkId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!token) {
    return <Navigate to={routes.accounts()} />
  }

  const { address, name, symbol, balance, decimals, image } = toTokenView(token)

  const parsedInputAmount = inputAmount
    ? parseAmount(inputAmount, decimals)
    : parseAmount("0", decimals)

  const parsedTokenBalance = token.balance || parseAmount("0", decimals)

  const isInputAmountGtBalance =
    parsedInputAmount.gt(token.balance?.toString() ?? 0) ||
    (feeToken?.address === token.address &&
      (inputAmount === balance ||
        parsedInputAmount.add(maxFee?.toString() ?? 0).gt(parsedTokenBalance)))

  const handleMaxClick = () => {
    setMaxClicked(true)
    setMaxInputAmount(token, maxFee)
  }

  const handleAddressSelect = (account?: Account | AddressBookContact) => {
    if (!account) {
      return
    }

    setAddressBookRecipient(account)
    setValue("recipient", normalizeAddress(account.address))
    setAddressBookOpen(false)
  }

  const resetAddressBookRecipient = () => {
    setAddressBookRecipient(undefined)
    setValue("recipient", "")
  }

  const handleSaveAddress = (savedContact: AddressBookContact) => {
    handleAddressSelect(savedContact)

    setBottomSheetOpen(false)
  }

  const disableSubmit =
    !isDirty ||
    isSubmitting ||
    (submitCount > 0 && !isDirty) ||
    isInputAmountGtBalance // Balance: 1234, maxInput: 1231, , maxFee: 3, updatedInput: 1233

  return (
    <>
      <AddContactBottomSheet
        open={bottomSheetOpen}
        onSave={handleSaveAddress}
        onCancel={() => setBottomSheetOpen(false)}
        recipientAddress={inputRecipient}
      />
      <NavigationContainer
        leftButton={<BarBackButton />}
        rightButton={<TokenMenuDeprecated tokenId={address} />}
        scrollContent={`Send ${symbol}`}
      >
        <>
          <ColumnCenter>
            <H3>Send {symbol}</H3>
            <BalanceText>{`${balance} ${symbol}`}</BalanceText>
          </ColumnCenter>
          <StyledForm
            onSubmit={handleSubmit(async ({ amount, recipient }) => {
              if (account) {
                if (isSweepingAllAsset(tokenAddress)) {
                  const sweepResult = await sweepTransaction
                  if (sweepResult) {
                    sweepResult.unsignedTxs.map((sweepUnsignedTx) => {
                      sendUnsignedTxTransaction({
                        signerAddress: account.address,
                        networkId: account.networkId,
                        unsignedTx: sweepUnsignedTx.unsignedTx
                      })
                    })
                  }
                } else {
                  let destination: Destination
                  if (isAlphToken(tokenAddress)) {
                    destination = {
                      address: recipient,
                      attoAlphAmount: prettifyAttoAlphAmount(amount) ?? '?',
                      tokens: []
                    }
                  } else {
                    destination = {
                      address: recipient,
                      attoAlphAmount: DUST_AMOUNT,
                      tokens: [{ id: tokenAddress as string, amount: BigInt(amount) }]
                    }
                  }

                  sendTransferTransaction({
                    signerAddress: account.address,
                    signerKeyType: account.signer.keyType,
                    networkId: account.networkId,
                    destinations: [destination],
                  })
                }

                navigate(routes.accountTokens(), { replace: true })
              }
            })}
          >
            <Column gap="12px">
              <div>
                <StyledControlledInput
                  autoComplete="off"
                  autoFocus
                  control={control}
                  placeholder="Amount"
                  name="amount"
                  type="text"
                  onKeyDown={() => {
                    setMaxClicked(false)
                  }}
                  onlyNumeric
                  style={{ padding: "17px 16px 17px 57px" }}
                >
                  <InputGroupBefore>
                    <TokenIcon name={name} url={image} size={8} />
                  </InputGroupBefore>
                  <InputGroupAfter>
                    {inputAmount ? (
                      <CurrencyValueText>
                        {prettifyCurrencyValue(currencyValue)}
                      </CurrencyValueText>
                    ) : (
                      <>
                        <InputTokenSymbol>{token.symbol}</InputTokenSymbol>
                        <StyledMaxButton type="button" onClick={handleMaxClick}>
                          {"MAX"}
                        </StyledMaxButton>
                      </>
                    )}
                  </InputGroupAfter>
                </StyledControlledInput>
                {inputAmount && isInputAmountGtBalance && (
                  <FormError>Insufficient balance</FormError>
                )}
                {errors.amount ? (
                  errors.amount.message ? (
                    <FormError>{errors.amount.message}</FormError>
                  ) : (
                    <FormError>Incorrect Amount</FormError>
                  )
                ) : undefined}
              </div>

              <div>
                {addressBookRecipient && accountName ? (
                  <AddressBookRecipient
                    onDoubleClick={() => setAddressBookRecipient(undefined)}
                  >
                    <RowBetween>
                      <Row gap="16px">
                        <ProfilePicture
                          src={getAccountImageUrl(
                            accountName,
                            addressBookRecipient,
                          )}
                          size="lg"
                        />

                        <Column>
                          <H5>{accountName}</H5>
                          <StyledAccountAddress>
                            {formatTruncatedAddress(
                              addressBookRecipient.address,
                            )}
                          </StyledAccountAddress>
                        </Column>
                      </Row>
                      <CloseIconAlt
                        {...makeClickable(resetAddressBookRecipient)}
                        style={{ cursor: "pointer" }}
                      />
                    </RowBetween>
                  </AddressBookRecipient>
                ) : (
                  <div ref={ref}>
                    <StyledControlledTextArea
                      autoComplete="off"
                      control={control}
                      spellCheck={false}
                      placeholder="Recipient's address"
                      name="recipient"
                      maxRows={3}
                      style={{
                        paddingRight: "50px",
                        borderRadius: addressBookOpen ? "8px 8px 0 0" : "8px",
                      }}
                      onChange={(e) => {
                        if (validateAddress(e.target.value)) {
                          const account = addressBook.contacts.find((c) =>
                            isEqualAddress(c.address, e.target.value),
                          )
                          handleAddressSelect(account)
                        }
                      }}
                    >
                      <>
                        <InputGroupAfter>
                          {validRecipientAddress ? (
                            <CloseIconAlt
                              {...makeClickable(resetAddressBookRecipient)}
                              style={{ cursor: "pointer" }}
                            />
                          ) : (
                            <AtTheRateWrapper
                              type="button"
                              active={addressBookOpen}
                              {...makeClickable(() =>
                                setAddressBookOpen(!addressBookOpen),
                              )}
                            >
                              <AtTheRateIcon />
                            </AtTheRateWrapper>
                          )}
                        </InputGroupAfter>

                        {addressBookOpen && !showSaveAddressButton && (
                          <AddressBookMenu
                            addressBook={addressBook}
                            onAddressSelect={handleAddressSelect}
                          />
                        )}
                      </>
                    </StyledControlledTextArea>
                    {showSaveAddressButton && (
                      <SaveAddressButton
                        type="button"
                        onClick={() => setBottomSheetOpen(true)}
                      >
                        <AddIcon fill="#29C5FF" style={{ fontSize: "15px" }} />
                        Save address
                      </SaveAddressButton>
                    )}
                    {errors.recipient && (
                      <FormError>{errors.recipient.message}</FormError>
                    )}
                  </div>
                )}
              </div>
              {
                isSweepingAllAsset(tokenAddress) ? (
                  <WarningContainer>
                    Warning: This will sweep all assets to the recipient, including all the tokens.
                    {txsNumber > 1 ? `Due to the number of UTXOs, you need to sign ${txsNumber} transactions` : ""}
                  </WarningContainer>
                ) : <></>
              }
            </Column>
            <ButtonSpacer />
            <Button disabled={disableSubmit} type="submit">
              Next
            </Button>
          </StyledForm>
        </>
      </NavigationContainer>
    </>
  )
}
