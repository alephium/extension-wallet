import { BigNumber, utils } from "ethers"

export function getTooltipText(maxFee?: string, feeTokenBalance?: BigNumber) {
  if (!maxFee || !feeTokenBalance) {
    return "Network fee is still loading."
  }
  if (feeTokenBalance.gte(maxFee)) {
    return "Network fees are paid to the network to include transactions in blocks"
  }
  return `Insufficient balance to pay network fees. You need at least ${utils.formatEther(
    BigNumber.from(maxFee).sub(feeTokenBalance),
  )} ETH more.`
}
