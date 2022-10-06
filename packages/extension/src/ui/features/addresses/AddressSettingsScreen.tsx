import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { AddressMetadata, AddressMetadataWithGroup, AddressMetadataWithGroupSchema } from '../../../shared/addresses'
import { useAppState } from '../../app.state'
import ColorPicker from '../../components/ColorPicker'
import { IconBar } from '../../components/IconBar'
import { ControlledInputText } from '../../components/InputText'
import { routes } from '../../routes'
import { FormError } from '../../theme/Typography'
import { ConfirmScreen } from '../actions/ConfirmScreen'
import { recover } from '../recovery/recovery.service'
import { useYupValidationResolver } from '../settings/useYupValidationResolver'
import { useAddressMetadata } from './addressMetadata.state'

const AddressSettingsScreen = () => {
  const { address } = useParams()
  const navigate = useNavigate()
  const { metadata } = useAddressMetadata()
  const addressMetadata = address ? metadata[address] : ({} as AddressMetadata)

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
    resolver: yupSchemaValidator,
    defaultValues: {
      name: addressMetadata.name,
      color: addressMetadata.color
    }
  })

  const { setAddressMetadata } = useAddressMetadata()

  if (!address) {
    return null
  }

  const handleAddAddress = async () => {
    useAppState.setState({ isLoading: true })
    try {
      setAddressMetadata(address, { name: getValues('name'), color: getValues('color') })
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
        title="Address settings"
        singleButton
        confirmButtonText="Save"
        smallTopPadding
        onSubmit={handleSubmit(handleAddAddress)}
      >
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

export default AddressSettingsScreen
