import { FC, useEffect } from 'react'
import { useSwiper, useSwiperSlide } from 'swiper/react'

import { Address } from '../../../shared/addresses'
import { makeClickable } from '../../services/a11y'
import { useWalletState } from '../wallet/wallet.state'
import { useAddresses } from './addresses.state'
import { AddressListItem } from './AddressListItem'
import { getAddressName, useAddressMetadata } from './addressMetadata.state'

interface AddressListSlideItemProps {
  address: Address
  isFocused: boolean
}

export const AddressListSlideItem: FC<AddressListSlideItemProps> = ({ address, isFocused }) => {
  const swiper = useSwiper()
  const swiperSlide = useSwiperSlide()
  const { defaultAddress } = useAddresses()

  const { metadata } = useAddressMetadata()
  const addressName = getAddressName(address.hash, metadata)

  const isDefault = address.hash === defaultAddress?.hash

  useEffect(() => {
    isFocused && useWalletState.setState({ headerTitle: addressName })
  }, [addressName, isFocused])

  const onSetAsDefaultAddress = () => {
    useAddresses.setState({ defaultAddress: address })
  }

  console.log(defaultAddress)
  console.log(isDefault)

  return (
    <AddressListItem
      {...makeClickable(() => {
        !swiperSlide.isActive && swiper.slideTo(swiperSlide.isPrev ? swiper.activeIndex - 1 : swiper.activeIndex + 1)
      })}
      addressName={addressName}
      address={address.hash}
      group={address.group}
      focus={isFocused}
      isDefault={isDefault}
      onSetAsDefaultAddress={onSetAsDefaultAddress}
    />
  )
}
