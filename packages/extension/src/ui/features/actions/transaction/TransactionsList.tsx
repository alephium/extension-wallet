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
      {(payload.type === 'ALPH_SIGN_AND_SUBMIT_TRANSFER_TX') && (
        <div>Please, review your transaction data before approving your transaction.</div>
      )}
      {(payload.type === 'ALPH_SIGN_AND_SUBMIT_DEPLOY_CONTRACT_TX') && (
        <div>
          <div>Creating contract with bytecode:</div>
          <Bytecode>{payload.params.bytecode}</Bytecode>
        </div>
      )}
      {(payload.type === 'ALPH_SIGN_AND_SUBMIT_EXECUTE_SCRIPT_TX') && (
        <div>
          <div>Running script with bytecode:</div>
          <Bytecode>{payload.params.bytecode}</Bytecode>
        </div>
      )}
      {payload.type === 'ALPH_SIGN_UNSIGNED_TX' && (
        <div>
          <div>Sign the unsigned transaction:</div>
          <Bytecode>{payload.params.unsignedTx}</Bytecode>
        </div>
      )}
      {payload.type === 'ALPH_SIGN_AND_SUBMIT_UNSIGNED_TX' && (
        <div>
          <div>Submit the transaction:</div>
          <Bytecode>{payload.params.unsignedTx}</Bytecode>
        </div>
      )}
      {payload.type === 'ALPH_SIGN_MESSAGE' && (
        <div>
          <div>Sign message:</div>
          <Bytecode>{payload.params.message}</Bytecode>
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
