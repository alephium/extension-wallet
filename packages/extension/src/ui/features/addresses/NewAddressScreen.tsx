import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { useAppState } from '../../app.state'
import { IconBar } from '../../components/IconBar'
import { ControlledInputText } from '../../components/InputText'
import { routes } from '../../routes'
import { connectAddress } from '../../services/backgroundAddresses'
import { P } from '../../theme/Typography'
import { ConfirmScreen } from '../actions/ConfirmScreen'
import { recover } from '../recovery/recovery.service'
import { deployAddress } from './addresses.service'
import { useAddresses } from './addresses.state'

interface FormValues {
  name: string
  color: string
  group: number
}

const NewAddressScreen = () => {
  const navigate = useNavigate()

  const { control, handleSubmit, formState, watch } = useForm<FormValues>({
    criteriaMode: 'firstError'
  })

  const { addresses, selectedAddress, addAddress } = useAddresses()
  const [group, setGroup] = useState<any>(undefined)

  const isValidGroup = (group: any) => {
    if (!group) {
      return true
    }

    const groupInt = parseInt(group)
    return !isNaN(groupInt) && (group >= 0 || group <= 3)
  }

  const handleAddAddress = async () => {
    useAppState.setState({ isLoading: true })
    try {
      if (isValidGroup(group)) {
        const newAddress = await deployAddress(group)
        addAddress(newAddress)
        connectAddress({
          address: newAddress.hash,
          publicKey: newAddress.publicKey,
          addressIndex: newAddress.group
        })
        navigate(await recover())
      }
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
        confirmButtonDisabled={true}
        onSubmit={() => null}
      >
        <P>Create a new address to help you manage your assets.</P>
        <br />
        <ControlledInputText
          autofocus
          name="name"
          control={control}
          type="text"
          placeholder="Label"
          autoComplete="off"
        />
        <ControlledInputText
          name="group"
          control={control}
          type="number"
          placeholder="Group"
          defaultValue={group}
          min={0}
          max={3}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroup(e.target.value)}
        />
      </ConfirmScreen>
    </>
  )
}

export default NewAddressScreen
