import { ArrowDown, ArrowUp, Settings2 } from 'lucide-react'
import { FC, useState } from 'react'
import styled from 'styled-components'
import { EffectCreative, Keyboard, Mousewheel, Pagination } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { Address } from '../../../shared/Address'
import { IconButton } from '../../components/buttons/IconButton'
import IconWithLabelButton from '../../components/buttons/IconWithLabelButton'
import { P } from '../../theme/Typography'
import { useAddresses } from './addresses.state'
import { AddressListSlideItem } from './AddressListSlideItem'

interface AddressListScreenProps {
  address: Address
}

export const AddressListScreen: FC<AddressListScreenProps> = ({ address }) => {
  const { addresses, selectedAddress, addAddress } = useAddresses()
  const [focusedAddress, setFocusedAddress] = useState('')

  const addressesList = Object.values(addresses)

  return (
    <Container>
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
      </AddressList>
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
