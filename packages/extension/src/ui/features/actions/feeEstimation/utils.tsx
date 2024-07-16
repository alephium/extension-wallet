import { BigNumber, utils } from "ethers"
import i18n from "../../../../i18n"

export function getTooltipText(maxFee?: string, feeTokenBalance?: BigNumber) {
  if (!maxFee || !feeTokenBalance) {
    return i18n.t("Network fee is still loading.")
  }
  if (feeTokenBalance.gte(maxFee)) {
    return i18n.t("Network fees are paid to the network to include transactions in blocks")
  }
  return `Insufficient balance to pay network fees. You need at least ${utils.formatEther(
    BigNumber.from(maxFee).sub(feeTokenBalance),
  )} ALPH more.`
}
