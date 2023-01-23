import {
  DeclareContractPayload,
  UniversalDeployerContractPayload,
  constants,
  stark,
} from "starknet"

import { ExtQueueItem } from "../shared/actionQueue/types"
import { BackgroundService } from "./background"
import { addTransaction } from "./transactions/store"
import { checkTransactionHash } from "./transactions/transactionExecution"

const { UDC } = constants

type DeclareContractAction = ExtQueueItem<{
  type: "DECLARE_CONTRACT_ACTION"
  payload: DeclareContractPayload
}>

type DeployContractAction = ExtQueueItem<{
  type: "DEPLOY_CONTRACT_ACTION"
  payload: UniversalDeployerContractPayload
}>

export enum UdcTransactionType {
  DEPLOY_CONTRACT = "DEPLOY",
  DECLARE_CONTRACT = "DECLARE",
}
