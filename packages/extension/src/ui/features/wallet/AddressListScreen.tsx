import { ArrowDown, ArrowUp, Settings2 } from 'lucide-react'
import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { EffectCreative, Keyboard, Mousewheel, Pagination } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { Address } from '../../../shared/Address'
import { useAppState } from '../../app.state'
import { IconButton } from '../../components/buttons/IconButton'
import IconWithLabelButton from '../../components/buttons/IconWithLabelButton'
import { AddIcon } from '../../components/Icons/MuiIcons'
import { InputText } from '../../components/InputText'
import { routes } from '../../routes'
import { makeClickable } from '../../services/a11y'
import { connectAddress } from '../../services/backgroundAddresses'
import { H1, P } from '../../theme/Typography'
import { recover } from '../recovery/recovery.service'
import { deployAddress } from './addresses.service'
import { useAddresses } from './addresses.state'
import { AddressListSlideItem } from './AddressListSlideItem'

interface AddressListScreenProps {
  address: Address
}

export const AddressListScreen: FC<AddressListScreenProps> = ({ address }) => {
  const navigate = useNavigate()
  const { addresses, selectedAddress, addAddress } = useAddresses()
  const [focusedAddress, setFocusedAddress] = useState('')
  const [group, setGroup] = useState<any>(undefined)

  const addressesList = Object.values(addresses)

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
    <Container>
      <H1>Addresses</H1>
      <AddressList>
        {addressesList.length === 0 && <Paragraph>No address, click below to add one.</Paragraph>}
        <CarouselContainer>
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            modules={[Pagination, Mousewheel, EffectCreative, Keyboard]}
            mousewheel={true}
            pagination={{ clickable: true }}
            keyboard={{
              enabled: true
            }}
            grabCursor={true}
            effect={'creative'}
            creativeEffect={{
              prev: {
                translate: ['-100%', 0, 0],
                scale: 0.9,
                shadow: true
              },
              next: {
                translate: ['100%', 0, 0],
                scale: 0.9,
                shadow: true
              }
            }}
          >
            {addressesList.map((address) => (
              <SwiperSlide key={address.hash}>
                {({ isActive }) => {
                  setFocusedAddress(address.hash)
                  return (
                    <AddressListSlideItem isFocused={isActive} address={address} selectedAddress={selectedAddress} />
                  )
                }}
              </SwiperSlide>
            ))}
          </Swiper>
        </CarouselContainer>
        <ActionsContainer>
          <IconWithLabelButton Icon={<ArrowUp size={20} />} label={'Send'} to={''} />
          <IconWithLabelButton Icon={<ArrowDown size={20} />} label={'Receive'} to={''} />
          <IconWithLabelButton Icon={<Settings2 size={20} />} label={'Settings'} to={''} />
        </ActionsContainer>
        <AddContainer>
          <InputText
            type="number"
            placeholder="group"
            style={{ width: '3em', marginBottom: '0.5em' }}
            defaultValue={group}
            min={0}
            max={3}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroup(e.target.value)}
          />
          {isValidGroup(group) ? (
            <IconButtonCenter
              size={48}
              {...makeClickable(handleAddAddress, {
                label: 'Create new wallet'
              })}
            >
              <AddIcon fontSize="large" />
            </IconButtonCenter>
          ) : null}
        </AddContainer>
      </AddressList>
    </Container>
  )
}

const AddressList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 48px 32px;
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 16px;
`

const CarouselContainer = styled.div`
  width: 100%;

  .swiper {
    overflow: visible;
  }

  .swiper-pagination {
    bottom: -25px;
  }

  .swiper-pagination-bullet {
    background-color: ${({ theme }) => theme.text2};
  }

  .swiper-pagination-bullet-active {
    background-color: ${({ theme }) => theme.text1};
  }
`

const AddContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 40%;
  margin: auto;
`

const ActionsContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 80%;
  margin: 20px auto 0 auto;
`

const IconButtonCenter = styled(IconButton)`
  margin: auto;
`

const Paragraph = styled(P)`
  text-align: center;
`
