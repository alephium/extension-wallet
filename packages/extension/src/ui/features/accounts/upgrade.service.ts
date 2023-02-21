import { partition } from "lodash-es"
import { number } from "starknet"
import useSWR from "swr"

import { getAccountIdentifier } from "./../../../shared/wallet.service"
import { getAccounts } from "../../../shared/account/store"
import { Network, getProvider } from "../../../shared/network"
import { useCurrentNetwork, useNetwork } from "./../networks/useNetworks"
import { Account } from "./Account"

