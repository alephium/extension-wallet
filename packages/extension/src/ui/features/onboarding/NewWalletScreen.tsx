import { FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { useAppState } from '../../app.state'
import { Button } from '../../components/buttons/Button'
import { IconBar } from '../../components/IconBar'
import { InputText } from '../../components/InputText'
import { routes } from '../../routes'
import { connectAddress, getAddresses } from '../../services/backgroundAddresses'
import { FormError, H2, P } from '../../theme/Typography'
import { StickyGroup } from '../actions/ConfirmScreen'
import { deployAddress } from '../addresses/addresses.service'
import { useAddresses } from '../addresses/addresses.state'
import { recover } from '../recovery/recovery.service'
import { validatePassword } from '../recovery/seedRecovery.state'

const Container = styled.div`
  padding: 48px 40px 24px;
  display: flex;
  flex-direction: column;

  ${InputText} {
    margin-top: 15px;
  }
`

interface FieldValues {
  password: string
  repeatPassword: string
}

interface NewWalletScreenProps {
  overrideSubmit?: (values: { password: string }) => Promise<void>
  overrideTitle?: string
  overrideSubmitText?: string
}

export const NewWalletScreen: FC<NewWalletScreenProps> = ({ overrideSubmit, overrideTitle, overrideSubmitText }) => {
  const navigate = useNavigate()
  const { addAddress } = useAddresses()
  const { control, handleSubmit, formState, watch } = useForm<FieldValues>({
    criteriaMode: 'firstError'
  })
  const { errors, isDirty } = formState

  const password = watch('password')

  const handleDeploy = async (password?: string) => {
    if (!password) {
      return
    }
    useAppState.setState({ isLoading: true })

    if (overrideSubmit) {
      await overrideSubmit({ password })
    }

    try {
      const addresses = await getAddresses()
      if (addresses.length === 0) {
        const newAddress = await deployAddress(undefined, password)
        addAddress(newAddress)
        connectAddress({
          address: newAddress.hash,
          publicKey: newAddress.publicKey,
          addressIndex: newAddress.group
        })
      }
      navigate(await recover(routes.addressTokens.path))
    } catch (error: any) {
      useAppState.setState({ error })
      navigate(routes.error())
    }

    useAppState.setState({ isLoading: false })
  }

  return (
    <>
      <IconBar back={routes.welcome()} />
      <Container>
        <H2>{overrideTitle || 'New wallet'}</H2>
        <P>Enter a password to protect your wallet</P>
        <form onSubmit={handleSubmit(({ password }) => handleDeploy(password))}>
          <Controller
            name="password"
            control={control}
            defaultValue=""
            rules={{ required: true, validate: validatePassword }}
            render={({ field: { ref, ...field } }) => (
              <InputText autoFocus type="password" placeholder="Password" {...field} />
            )}
          />
          {errors.password?.type === 'required' && <FormError>A new password is required</FormError>}
          {errors.password?.type === 'validate' && <FormError>Password is too short</FormError>}
          <Controller
            name="repeatPassword"
            control={control}
            rules={{ validate: (x) => x === password }}
            defaultValue=""
            render={({ field: { ref, ...field } }) => (
              <InputText type="password" placeholder="Repeat password" {...field} />
            )}
          />
          {errors.repeatPassword?.type === 'validate' && <FormError>Passwords do not match</FormError>}

          <StickyGroup>
            <Button type="submit" disabled={!isDirty}>
              {overrideSubmitText || 'Create wallet'}
            </Button>
          </StickyGroup>
        </form>
      </Container>
    </>
  )
}
