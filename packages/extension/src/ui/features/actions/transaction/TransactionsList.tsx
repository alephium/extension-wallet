import { FC } from 'react'
import styled from 'styled-components'

import { TransactionPayload } from '../../../../shared/transactions'
import { WarningIcon } from '../../../components/Icons/WarningIcon'
import { TransactionBanner } from './TransactionBanner'

export interface ITransactionsList {
  payload: TransactionPayload
}

export const TransactionsList: FC<ITransactionsList> = ({ payload }) => {
  return (
    <TransactionBanner icon={WarningIcon}>
      {(payload.type === 'ALPH_SIGN_TRANSFER_TX' || payload.type === 'ALPH_SIGN_AND_SUBMIT_TRANSFER_TX') && (
        <div>Please, review your transaction data before approving your transaction.</div>
      )}
      {(payload.type === 'ALPH_SIGN_CONTRACT_CREATION_TX' || payload.type === 'ALPH_SIGN_AND_SUBMIT_CONTRACT_CREATION_TX') && (
        <div>
          <div>Creating contract with bytecode:</div>
          <Bytecode>{payload.params.bytecode}</Bytecode>
        </div>
      )}
      {(payload.type === 'ALPH_SIGN_SCRIPT_TX' || payload.type === 'ALPH_SIGN_AND_SUBMIT_SCRIPT_TX') && (
        <div>
          <div>Running script with bytecode:</div>
          <Bytecode>{payload.params.bytecode}</Bytecode>
        </div>
      )}
    </TransactionBanner>
  )
}

const Bytecode = styled.code`
  word-break: break-all;
  margin-top: 5px;
  display: block;
`
