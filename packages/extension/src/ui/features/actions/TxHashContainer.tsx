import { FC } from "react"
import styled from "styled-components"
import { CopyTooltip } from "../../components/CopyTooltip"
import { useTranslation } from "react-i18next"

const TxHash = styled.div`
  margin-top: 1px;
  background: ${({ theme }) => theme.neutrals800};
  border: 1px solid ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text4};
  padding: 9px 13px 8px;
  overflow-wrap: break-word;
  font-size: 14px;
  line-height: 120%;
  border-radius: 5px;
`

export const TxHashContainer: FC<{ txId: string }> = ({ txId }) => {
  const { t } = useTranslation()
  return (
    <CopyTooltip copyValue={txId} message={t("Copied")}>
      <TxHash>{`TxHash: ${splitTxHash(txId)}`}</TxHash>
    </CopyTooltip>
  )
}

function splitTxHash(txHash: string) {
  const chunks = []
  for (let i = 0; i < txHash.length; i += 16) {
    chunks.push(txHash.slice(i, i + 16))
  }
  return chunks.join(" ")
}
