import browser from 'webextension-polyfill'

import styled from 'styled-components'
import { InputText } from '../../components/InputText'
import { H2, P } from '../../theme/Typography'
import { Button } from '../../components/buttons/Button'
import { useParams } from 'react-router-dom'
import { importLedgerAddress } from './addresses.service'
import { sendMessage } from '../../../inpage/messageActions'
import { Address } from '../../../shared/addresses'

const Container = styled.div`
  padding: 48px 40px 24px;
  display: flex;
  flex-direction: column;

  ${InputText} {
    margin-top: 15px;
  }
`

const ConnectLedgerScreen = () => {
  const { groupRaw } = useParams()
  const group = parseInt(groupRaw ?? '0')

  const importLedger = async () => {
    const newAddress = await importLedgerAddress(`m/44'/1234'/0'/0/0`)
    const address = new Address('ledger', newAddress.hash, newAddress.publicKey, newAddress.index)
    browser.runtime.sendMessage({ledgerAddress: address})
    // sendMessage({type: 'LEDGER_ADDRESS_RES', data: })
    console.log(`===== ${group} - ${newAddress.hash}`)
  }

  return (
    <>
      <Container>
        <H2>Ledger</H2>
        <P>Step1: Please connect your ledger to the computer</P>
        <P>Step2: Open the Alephium app on your ledger device</P>
        <Button onClick={importLedger}>Connect</Button>
      </Container>
    </>
  )
}

export default ConnectLedgerScreen
