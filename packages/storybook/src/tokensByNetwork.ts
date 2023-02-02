import { Token } from "@alephium/extension/src/shared/token/type"
import { parsedDefaultTokens } from "@alephium/extension/src/shared/token/utils"

export const tokensByNetwork: Token[] = parsedDefaultTokens.filter(
  ({ networkId }) => networkId === "goerli-alpha",
)
