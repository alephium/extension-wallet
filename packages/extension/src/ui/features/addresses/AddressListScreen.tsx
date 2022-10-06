import { ArrowDown, ArrowUp, Settings2 } from 'lucide-react'
import { useState } from 'react'
import styled from 'styled-components'
import { EffectCreative, Keyboard, Mousewheel, Pagination } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { Address } from '../../../shared/addresses'
import IconWithLabelButton from '../../components/buttons/IconWithLabelButton'
import { routes } from '../../routes'
import { P, SectionTitle } from '../../theme/Typography'
import AddressTransactionList from '../transactions/AddressTransactionList'
import { useAddresses } from './addresses.state'
import { AddressListSlideItem } from './AddressListSlideItem'

export const AddressListScreen = () => {
  const { addresses, defaultAddress } = useAddresses()
  const [focusedAddress, setFocusedAddress] = useState<Address | undefined>(defaultAddress)

  const addressesList = Object.values(addresses)

  const multipleAddresses = addressesList.length > 0

  if (!defaultAddress || !focusedAddress) {
    return null
  }

  return (
    <Container>
      <AddressList>
        {!multipleAddresses && 0 && <Paragraph>No address, click below to add one.</Paragraph>}
        <CarouselContainer>
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            modules={[Pagination, Mousewheel, EffectCreative, Keyboard]}
            mousewheel={true}
            pagination={{ clickable: true }}
            allowTouchMove={false}
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
            initialSlide={addresses.findIndex((a) => a.hash === defaultAddress?.hash)}
          >
            {addressesList.map((address) => (
              <SwiperSlide key={address.hash}>
                {({ isActive }) => {
                  isActive && setFocusedAddress(address)
                  return <AddressListSlideItem isFocused={isActive} address={address} />
                }}
              </SwiperSlide>
            ))}
          </Swiper>
        </CarouselContainer>
        <ActionsContainer multipleAddresses={multipleAddresses}>
          <IconWithLabelButton Icon={<ArrowUp size={20} />} label={'Send'} to={routes.sendToken(focusedAddress.hash)} />
          <IconWithLabelButton
            Icon={<ArrowDown size={20} />}
            label={'Receive'}
            to={routes.fundingQrCode(focusedAddress.hash)}
          />
          <IconWithLabelButton
            Icon={<Settings2 size={20} />}
            label={'Settings'}
            to={routes.addressSettings(focusedAddress.hash)}
          />
        </ActionsContainer>
      </AddressList>
      <div>
        <SectionTitle>Last transactions</SectionTitle>
        {focusedAddress && <AddressTransactionList address={focusedAddress} />}
      </div>
    </Container>
  )
}

const AddressList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 10px 32px;
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 600px;
`

const CarouselContainer = styled.div`
  width: 100%;

  .swiper {
    overflow: visible;
  }

  .swiper-pagination {
    bottom: -30px;
  }

  .swiper-pagination-bullet {
    background-color: ${({ theme }) => theme.text2};
    width: 10px;
    height: 10px;
  }

  .swiper-pagination-bullet-active {
    background-color: ${({ theme }) => theme.text1};
  }
`

const ActionsContainer = styled.div<{ multipleAddresses: boolean }>`
  display: flex;
  justify-content: center;
  width: 80%;
  margin: 0 auto;
  margin-top: ${({ multipleAddresses }) => (multipleAddresses ? '20px' : 0)};
`

const Paragraph = styled(P)`
  text-align: center;
`
