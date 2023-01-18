import browser from 'webextension-polyfill'

import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { openConnectLedger } from '../../../background/openUi'

import { Address, AddressMetadataWithGroup, AddressMetadataWithGroupSchema } from '../../../shared/addresses'
import { waitForMessage } from '../../../shared/messages'
import { useAppState } from '../../app.state'
import ColorPicker from '../../components/ColorPicker'
import { IconBar } from '../../components/IconBar'
import { ControlledInputText } from '../../components/InputText'
import ToggleSection from '../../components/ToggleSection'
import { routes } from '../../routes'
import { connectAddress } from '../../services/backgroundAddresses'
import { FormError, P } from '../../theme/Typography'
import { ConfirmScreen } from '../actions/ConfirmScreen'
import { recover } from '../recovery/recovery.service'
import { useYupValidationResolver } from '../settings/useYupValidationResolver'
import { useAddresses } from './addresses.state'
import { useAddressMetadata } from './addressMetadata.state'

function initLedgerWindowListener(): Promise<Address> {
  return new Promise((resolve)=>{
    async function onMessage(message: any, sender: any, sendResponse: any) {
      if (typeof message == 'object' && 'ledgerAddress' in message) {
        browser.runtime.onMessage.removeListener(onMessage)
        resolve(message['ledgerAddress'] as Address)
        sendResponse && sendResponse()
      }
    }
    browser.runtime.onMessage.addListener(onMessage)
  })
}

const ImportLedgerScreen = () => {
  const navigate = useNavigate()

  const yupSchemaValidator = useYupValidationResolver(AddressMetadataWithGroupSchema)

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm<AddressMetadataWithGroup>({
    criteriaMode: 'firstError',
    resolver: yupSchemaValidator
  })

  const { addAddress } = useAddresses()
  const { setAddressMetadata } = useAddressMetadata()

  const handleImport = async () => {
    useAppState.setState({ isLoading: true })
    try {
      const group = getValues('group')
      openConnectLedger(parseInt(group ?? '0'))
      const newAddress = await initLedgerWindowListener()
      console.log(`===== ${JSON.stringify(newAddress)}`)
      addAddress(newAddress)
      connectAddress({
        address: newAddress.hash,
        publicKey: newAddress.publicKey,
        addressIndex: newAddress.index
      })
      setAddressMetadata(newAddress.hash, { name: getValues('name'), color: getValues('color') })
      navigate(await recover(routes.walletAddresses.path))
    } catch (error: any) {
      useAppState.setState({ error: `${error}` })
      navigate(routes.error())
    } finally {
      useAppState.setState({ isLoading: false })
    }
  }

  return (
    <>
      <IconBar back />
      <ConfirmScreen
        title="Ledger Address"
        singleButton
        confirmButtonText="Import"
        smallTopPadding
        onSubmit={handleSubmit(handleImport)}
      >
        <P>Connect your ledger to the computer before importing.</P>
        <br />
        <ControlledInputText
          autoFocus
          name="name"
          control={control}
          type="text"
          placeholder="Name"
          autoComplete="off"
        />
        <ColorPicker
          onChange={(color) => {
            setValue('color', color, { shouldValidate: true })
          }}
          value={watch('color')}
        />
        <ToggleSection title="Define group?" marginTop>
          <ControlledInputText
            name="group"
            control={control}
            type="number"
            placeholder="Group"
            defaultValue={undefined}
            min={0}
            max={3}
          />
        </ToggleSection>
        {Object.keys(errors).length > 0 && (
          <FormError>
            {Object.values(errors)
              .map((x) => x?.message)
              .join('. ')}
          </FormError>
        )}
      </ConfirmScreen>
    </>
  )
}

export default ImportLedgerScreen
