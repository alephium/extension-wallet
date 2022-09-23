import { Variants, motion } from 'framer-motion'
import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { NetworkStatus, getNetwork } from '../../../shared/networks'
import { NetworkStatusIndicator, StatusIndicatorColor } from '../../components/StatusIndicator'
import { routes } from '../../routes'
import { getNetworkStatuses } from '../../services/backgroundNetworks'
import { recover } from '../recovery/recovery.service'
import { useNetworkState } from './networks.state'
import { useNetworks } from './useNetworks'

interface NetworkSwitcherProps {
  className?: string
}

const initialNetworkHeight = 30
const expandedNetworkHeight = 45

const networkVariants: Variants = {
  hover: {
    height: expandedNetworkHeight,
    width: 120
  }
}

export const NetworkSwitcher: FC<NetworkSwitcherProps> = ({ className }) => {
  const navigate = useNavigate()

  const { switcherNetworkId, setSwitcherNetworkId } = useNetworkState()

  const { allNetworks } = useNetworks({ suspense: true })
  const currentNetwork = getNetwork(switcherNetworkId, allNetworks)

  const [networkStatuses, setNetworkStatuses] = useState<NetworkStatus[]>([])

  const orderedNetworks = [
    ...allNetworks.filter(({ name }) => name === currentNetwork.name),
    ...allNetworks.filter(({ name }) => name !== currentNetwork.name)
  ]

  const showHealthIndicator = (networkId: string, statuses: NetworkStatus[]) => {
    const result = statuses.find((status) => status.id === networkId)?.healthy
    let color: StatusIndicatorColor = 'green'
    if (result === true) {
      color = 'green'
    } else if (result === false) {
      color = 'red'
    }

    return <NetworkStatusIndicator color={color} />
  }

  useEffect(() => {
    getNetworkStatuses().then((data) => {
      setNetworkStatuses(data)
    })
  }, [])

  return (
    <NetworkSwitcherWrapper role="button" aria-label="Selected network" className={className} whileHover="hover">
      <NetworkList
        variants={{
          hover: {
            height: orderedNetworks.length * expandedNetworkHeight,
            boxShadow: '0 5px 10px rgba(0, 0, 0, 0.8)',
            transition: {
              duration: 0.2,
              ease: 'circOut'
            }
          }
        }}
      >
        {orderedNetworks.map(({ id, name }) => (
          <Network
            key={id}
            onClick={async () => {
              setSwitcherNetworkId(id)
              navigate(await recover(routes.addressTokens.path))
            }}
            layout
            variants={networkVariants}
          >
            <NetworkName>{name}</NetworkName>
            {showHealthIndicator(id, networkStatuses)}
          </Network>
        ))}
      </NetworkList>
    </NetworkSwitcherWrapper>
  )
}

const NetworkName = styled.span`
  text-align: right;
`

const Network = styled(motion.div)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: right;

  font-weight: 600;
  font-size: 12px;
  line-height: 14.4px;

  padding: 10px;

  height: ${initialNetworkHeight}px;

  color: rgba(255, 255, 255, 0.7);
  z-index: 1;

  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.text1};

    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      border-radius: 15px;
      background-color: rgba(255, 255, 255, 0.05);
      z-index: 0;
    }
  }

  // Selected network
  &:first-child {
    color: ${({ theme }) => theme.text1};
    font-weight: 600;
    cursor: default;
  }

  > span {
    padding-right: 5px;
  }
`

const NetworkList = styled(motion.div)`
  transform: translateY(-${initialNetworkHeight / 2}px);
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  height: ${initialNetworkHeight}px;
  border-radius: 15px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  background-color: ${({ theme }) => theme.bg3};
  overflow: hidden;
`

const NetworkSwitcherWrapper = styled(motion.div)`
  position: relative;
`

export const NetworkStatusWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: right;
  gap: 4px;
`
