import { FC, useEffect } from 'react'
import { useSwiper, useSwiperSlide } from 'swiper/react'

import { Address } from '../../../shared/Address'
import { makeClickable } from '../../services/a11y'
import { useWalletState } from '../wallet/wallet.state'
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

  useEffect(() => {
    isFocused && useWalletState.setState({ headerTitle: addressName })
  }, [addressName, isFocused])

  return (
    <AddressListItem
      {...makeClickable(() => {
        !swiperSlide.isActive && swiper.slideTo(swiperSlide.isPrev ? swiper.activeIndex - 1 : swiper.activeIndex + 1)
      })}
      addressName={addressName}
      address={address.hash}
      group={address.group}
      focus={isFocused}
    />
  )
}
