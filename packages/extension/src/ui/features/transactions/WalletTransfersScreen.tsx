import { FC, Suspense, useEffect } from 'react'
import styled from 'styled-components'

import { Address } from '../../../shared/addresses'
import { Spinner } from '../../components/Spinner'
import { H1 } from '../../theme/Typography'
import { useWalletState } from '../wallet/wallet.state'
import { TransferButtons } from './TransferButtons'

interface WalletTransfersScreenProps {
  className?: string
}

const WalletTransfersScreen: FC<WalletTransfersScreenProps> = ({ className }) => {
  useEffect(() => {
    useWalletState.setState({ headerTitle: 'Transfers' })
  }, [])

  return (
    <div className={className}>
      <Header>Transfers</Header>
      <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
        <TransferButtons />
      </Suspense>
    </div>
  )
}

export default styled(WalletTransfersScreen)`
  display: flex;
  flex-direction: column;
  margin-bottom: 68px;
`

const Header = styled(H1)`
  margin-bottom: 40px;
`
