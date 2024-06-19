import { BarCloseButton, NavigationContainer } from "@argent/ui"
import { ComponentProps, FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"
import styled from "styled-components"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px 0px;
  margin-bottom: 24px;
`

const Title = styled.div`
  font-weight: 700;
  font-size: 28px;
  line-height: 34px;
  margin-bottom: 17.5px;
  text-align: left;
  padding-left: 8px;
`

interface ITransactionDetailWrapper
  extends ComponentProps<typeof NavigationContainer> {
  title?: ReactNode
  children: ReactNode
}

export const TransactionDetailWrapper: FC<ITransactionDetailWrapper> = ({
  title,
  children,
  ...rest
}) => {
  const { t } = useTranslation()
  return (
    <NavigationContainer rightButton={<BarCloseButton />} {...rest}>
      <Container>
        <Title>{title || t("Transaction")}</Title>
        {children}
      </Container>
    </NavigationContainer>
  )
}
