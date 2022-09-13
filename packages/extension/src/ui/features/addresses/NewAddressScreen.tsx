import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppState } from '../../app.state'
import { IconBar } from '../../components/IconBar'
import { InputText } from '../../components/InputText'
import { routes } from '../../routes'
import { connectAddress } from '../../services/backgroundAddresses'
import { H2 } from '../../theme/Typography'
import { recover } from '../recovery/recovery.service'
import { deployAddress } from './addresses.service'
import { useAddresses } from './addresses.state'

const NewAddressScreen = () => {
  const navigate = useNavigate()
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
      <div>
        <H2>Address</H2>

        <InputText
          type="number"
          placeholder="group"
          style={{ width: '3em', marginBottom: '0.5em' }}
          defaultValue={group}
          min={0}
          max={3}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroup(e.target.value)}
        />
      </div>
    </>
  )
}

export default NewAddressScreen
