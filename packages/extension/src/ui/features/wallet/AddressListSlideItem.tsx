import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSwiper, useSwiperSlide } from 'swiper/react'

import { Address } from '../../../shared/Address'
import { routes } from '../../routes'
import { makeClickable } from '../../services/a11y'
import { connectAddress } from '../../services/backgroundAddresses'
import { useAddresses } from './addresses.state'
import { AddressListItem } from './AddressListItem'
import { getAddressName, useAddressMetadata } from './addressMetadata.state'

interface AddressListSlideItemProps {
  address: Address
  isFocused: boolean
  selectedAddress?: Address
}

export const AddressListSlideItem: FC<AddressListSlideItemProps> = ({ address, isFocused, selectedAddress }) => {
  const swiper = useSwiper()
  const swiperSlide = useSwiperSlide()

  const { addressNames } = useAddressMetadata()
  const addressName = getAddressName(address.hash, addressNames)

  return (
    <AddressListItem
      {...makeClickable(() => {
        swiper.slideTo(swiperSlide.isPrev ? swiper.activeIndex - 1 : swiper.activeIndex + 1)
      })}
      addressName={addressName}
      address={address.hash}
      group={address.group}
      focus={isFocused}
    />
  )
}
