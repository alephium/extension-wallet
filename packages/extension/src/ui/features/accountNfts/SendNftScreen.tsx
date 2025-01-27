import { BarBackButton, NavigationContainer } from "@argent/ui"
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"
import { Schema, object } from "yup"

import { AddressBookContact } from "../../../shared/addressBook"
import { AddContactBottomSheet } from "../../components/AddContactBottomSheet"
import { Button } from "../../components/Button"
import Column, { ColumnCenter } from "../../components/Column"
import { AtTheRateIcon } from "../../components/Icons/AtTheRateIcon"
import { CloseIconAlt } from "../../components/Icons/CloseIconAlt"
import { AddIcon } from "../../components/Icons/MuiIcons"
import { StyledControlledTextArea } from "../../components/InputText"
import Row, { RowBetween, RowCentered } from "../../components/Row"
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
import {
  AddressBookRecipient,
  AtTheRateWrapper,
  FormError,
  InputGroupAfter,
  SaveAddressButton,
  StyledAccountAddress,
} from "../accountTokens/SendTokenScreen"
import { TokenMenuDeprecated } from "../accountTokens/TokenMenuDeprecated"
import { useCurrentNetwork } from "../networks/useNetworks"
import { useYupValidationResolver } from "../settings/useYupValidationResolver"
import { Destination, DUST_AMOUNT } from "@alephium/web3"
import { sendTransferTransaction } from "../../services/transactions"
import { useNFT } from "./useNfts"
import { useTranslation } from "react-i18next"
import { isMp4Url } from "./alephium-nft.service"

export const NftImageContainer = styled.div`
  width: 96px;
  margin-bottom: 12px;

  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
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

const ButtonSpacer = styled.div`
  display: flex;
  flex: 1;
`

export interface SendNftInput {
  recipient: string
}

export const SendNftSchema: Schema<SendNftInput> = object().required().shape({
  recipient: addressSchema,
})

export const SendNftScreen: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { nftCollectionId, nftId } = useParams()
  const account = useSelectedAccount()
  const network = useCurrentNetwork()

  console.log("tokenId", nftId)
  const { nft, mutate } = useNFT(network, nftCollectionId, nftId, account)
  useEffect(() => { mutate() }, [mutate])

  const resolver = useYupValidationResolver(SendNftSchema)

  const { id: currentNetworkId } = useCurrentNetwork()
  const [addressBookRecipient, setAddressBookRecipient] = useState<
    Account | AddressBookContact
  >()

  const { accountNames } = useAccountMetadata()
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)

  const accountName = useMemo(
    () =>
      addressBookRecipient
        ? "name" in addressBookRecipient
          ? addressBookRecipient.name
          : getAccountName(addressBookRecipient, accountNames)
        : undefined,
    [accountNames, addressBookRecipient],
  )

  const {
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, submitCount },
    getFieldState,
    control,
    setValue,
    watch,
  } = useForm<SendNftInput>({
    defaultValues: {
      recipient: "",
    },
    resolver,
  })

  const formValues = watch()
  const inputRecipient = formValues.recipient

  const validateAddress = useCallback(
    (addr: string) => isValidAddress(addr),
    [],
  )

  const validRecipientAddress =
    inputRecipient && !getFieldState("recipient").error

  const [addressBookOpen, setAddressBookOpen] = useState(false)

  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setAddressBookOpen(false))

  const addressBook = useAddressBook(account?.networkId || currentNetworkId)

  const recipientInAddressBook = useMemo(
    () =>
      // Check if inputRecipient is in Contacts or userAccounts
      [...addressBook.contacts, ...addressBook.userAccounts].some((acc) =>
        isEqualAddress(acc.address, inputRecipient),
      ),
    [addressBook.contacts, addressBook.userAccounts, inputRecipient],
  )

  const showSaveAddressButton = validRecipientAddress && !recipientInAddressBook

  if (!account || !nft || !nftCollectionId || !nftId) {
    return <Navigate to={routes.accounts()} />
  }

  const disableSubmit = isSubmitting || (submitCount > 0 && !isDirty)

  const onSubmit = async ({ recipient }: SendNftInput) => {
    const destination: Destination = {
      address: recipient,
      attoAlphAmount: DUST_AMOUNT,
      tokens: [{ id: nftId as string, amount: BigInt(1) }]
    }

    sendTransferTransaction({
      signerAddress: account.address,
      signerKeyType: account.signer.keyType,
      networkId: account.networkId,
      destinations: [destination],
    })

    navigate(routes.accountCollections())
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
        rightButton={
          <TokenMenuDeprecated tokenId={nft.id} canHideToken={false} />
        }
        scrollContent={nft.metadata.name}
      >
        <>
          <ColumnCenter>
            <H3>{nft.metadata.name}</H3>
          </ColumnCenter>
          <StyledForm onSubmit={handleSubmit(onSubmit)}>
            <Column gap="12px">
              {
                nft.metadata.image ? (
                  <RowCentered>
                    <NftImageContainer>
                      {isMp4Url(nft.metadata.image) ? (
                        <video
                          src={nft.metadata.image}
                          style={{
                            borderRadius: '8px',
                            objectFit: 'cover'
                          }}
                          loop
                          muted
                          playsInline
                          autoPlay = {false}
                        />
                      ) : (
                        <img src={nft.metadata.image} alt={nft.metadata.name} />
                      )}
                    </NftImageContainer>
                  </RowCentered>
                ) : null
              }
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
                          width="40px"
                          height="40px"
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
                      placeholder={t("Recipient's address")}
                      name="recipient"
                      maxRows={3}
                      style={{
                        paddingRight: "50px",
                        borderRadius: addressBookOpen ? "8px 8px 0 0" : "8px",
                      }}
                      onChange={(e: any) => {
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
                        {t("Save address")}
                      </SaveAddressButton>
                    )}
                    {errors.recipient && (
                      <FormError>{errors.recipient.message}</FormError>
                    )}
                  </div>
                )}
              </div>
            </Column>
            <ButtonSpacer />
            <Button type="submit" disabled={disableSubmit}>
              {t("Next")}
            </Button>
          </StyledForm>
        </>
      </NavigationContainer>
    </>
  )
}
