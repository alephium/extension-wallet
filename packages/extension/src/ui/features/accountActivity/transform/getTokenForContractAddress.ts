import { Token } from "../../../../shared/token/type"
import { parsedDefaultTokens } from "../../../../shared/token/utils"
import { isEqualId } from "../../../services/addresses"

export const getTokenForContractAddress = (
  contractAddress: string,
  tokensByNetwork: Token[] = parsedDefaultTokens,
) => {
  return tokensByNetwork.find(({ id }) =>
    isEqualId(id, contractAddress),
  )
}
