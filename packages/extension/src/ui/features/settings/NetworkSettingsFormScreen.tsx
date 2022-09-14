import { FC, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { Network, NetworkSchema } from '../../../shared/networks'
import { useAppState } from '../../app.state'
import { IconBar } from '../../components/IconBar'
import { ControlledInputText } from '../../components/InputText'
import { addNetworks } from '../../services/backgroundNetworks'
import { FormError, P } from '../../theme/Typography'
import { ConfirmScreen } from '../actions/ConfirmScreen'
import { slugify } from './slugify'
import { useYupValidationResolver } from './useYupValidationResolver'

type NetworkSettingsFormScreenProps =
  | {
      mode: 'add'
    }
  | {
      mode: 'edit'
      network: Network
    }

export const NetworkSettingsFormScreen: FC<NetworkSettingsFormScreenProps> = (props) => {
  const navigate = useNavigate()
  const defaultNetwork = useMemo<Network>(() => {
    if (props.mode === 'add') {
      return {
        id: '',
        name: '',
        chainId: '',
        nodeUrl: '',
        explorerApiUrl: '',
        explorerUrl: ''
      }
    }
    return props.network
    // due to an or type we need to check different values depending on the mode
  }, [props.mode === 'add' || props.network]) // eslint-disable-line react-hooks/exhaustive-deps

  const yupSchemaValidator = useYupValidationResolver(NetworkSchema)
  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue
  } = useForm<Network>({
    defaultValues: defaultNetwork,
    resolver: yupSchemaValidator
  })

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === 'change' && name === 'name') {
        setValue('id', slugify(value.name || ''))
      }
    })
    return subscription.unsubscribe
    // on mount
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <IconBar back />
      <ConfirmScreen
        title={props.mode === 'add' ? 'Add network' : 'Edit network'}
        singleButton
        confirmButtonText={props.mode === 'add' ? 'Create' : 'Save'}
        smallTopPadding
        confirmButtonDisabled={defaultNetwork.readonly}
        onSubmit={handleSubmit(async (network) => {
          try {
            useAppState.setState({ isLoading: true })
            await addNetworks([network])
            navigate(-1)
          } finally {
            useAppState.setState({ isLoading: false })
          }
        })}
      >
        <P>Here you can add your own custom network to Alephium.</P>
        <br />
        <ControlledInputText
          autoFocus
          autoComplete="off"
          control={control}
          placeholder="Network name"
          name="name"
          type="text"
          disabled={defaultNetwork.readonly}
        />
        <ControlledInputText
          autoComplete="off"
          control={control}
          placeholder="Node URL"
          name="nodeUrl"
          type="text"
          disabled={defaultNetwork.readonly}
        />
        <ControlledInputText
          autoComplete="off"
          control={control}
          placeholder="Explorer API URL"
          name="explorerApiUrl"
          type="text"
          disabled={defaultNetwork.readonly}
        />
        <ControlledInputText
          autoComplete="off"
          control={control}
          placeholder="Explorer URL"
          name="explorerUrl"
          type="url"
          disabled={defaultNetwork.readonly}
        />
        {Object.keys(errors).length > 0 && (
          <FormError>
            {Object.values(errors)
              .map((x) => x.message)
              .join('. ')}
          </FormError>
        )}
      </ConfirmScreen>
    </>
  )
}
