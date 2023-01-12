import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { AddressMetadataWithGroup, AddressMetadataWithGroupSchema } from '../../../shared/addresses'
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
import { deployAddress } from './addresses.service'
import { useAddresses } from './addresses.state'
import { useAddressMetadata } from './addressMetadata.state'

const NewAddressScreen = () => {
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

  const handleAddAddress = async () => {
    useAppState.setState({ isLoading: true })
    try {
      const group = getValues('group')
      const newAddress = await deployAddress(group ? parseInt(group) : undefined)
      addAddress(newAddress)
      connectAddress({
        address: newAddress.hash,
        publicKey: newAddress.publicKey,
        addressIndex: newAddress.index,
        derivationPath: newAddress.deviationPath
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
        title="New address"
        singleButton
        confirmButtonText="Create"
        smallTopPadding
        onSubmit={handleSubmit(handleAddAddress)}
      >
        <P>Create a new address to help you manage your assets.</P>
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

export default NewAddressScreen
