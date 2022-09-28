import { motion } from 'framer-motion'
import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { NetworkStatus, getNetwork } from '../../../shared/networks'
import HoverSelect, { HoverSelectItem } from '../../components/HoverSelect'
import { NetworkStatusIndicator, StatusIndicatorColor } from '../../components/StatusIndicator'
import { routes } from '../../routes'
import { getNetworkStatuses } from '../../services/backgroundNetworks'
import { recover } from '../recovery/recovery.service'
import { useNetworkState } from './networks.state'
import { useNetworks } from './useNetworks'

interface NetworkSwitcherProps {
  className?: string
}

const NetworkSwitcher: FC<NetworkSwitcherProps> = ({ className }) => {
  const navigate = useNavigate()

  const { switcherNetworkId, setSwitcherNetworkId } = useNetworkState()

  const { allNetworks } = useNetworks({ suspense: true })
  const currentNetwork = getNetwork(switcherNetworkId, allNetworks)

  const [networkStatuses, setNetworkStatuses] = useState<NetworkStatus[]>([])

  useEffect(() => {
    getNetworkStatuses().then((data) => {
      setNetworkStatuses(data)
    })
  }, [])

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

  const handleNetworkSelect = (id: string) => {
    setSwitcherNetworkId(id)
  }

  const addressItems: HoverSelectItem[] = allNetworks.map((n) => ({
    Component: (
      <NetworkItem
        key={n.id}
        onClick={async () => {
          setSwitcherNetworkId(n.id)
          navigate(await recover(routes.addressTokens.path))
        }}
      >
        <NetworkName>{n.name}</NetworkName>
        {showHealthIndicator(n.id, networkStatuses)}
      </NetworkItem>
    ),
    value: n.id
  }))

  return (
    <HoverSelect
      items={addressItems}
      title="Network"
      selectedItemValue={currentNetwork.id}
      onItemClick={handleNetworkSelect}
      className={className}
    />
  )
}

const NetworkItem = styled(motion.div)`
  display: flex;
  align-items: center;
`

const NetworkName = styled.span`
  margin-right: 5px;
`

export default NetworkSwitcher
