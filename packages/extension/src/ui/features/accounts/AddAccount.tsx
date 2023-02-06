import { FC, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAppState } from "../../app.state"
import { IconBar } from "../../components/IconBar"
import { AlephiumIcon } from "../../components/Icons/AlephiumIcon"
import { Option, OptionsWrapper } from "../../components/Options"
import { PageWrapper, Title } from "../../components/Page"
import { routes } from "../../routes"
import { FormError } from "../../theme/Typography"

export const AddAccount: FC = () => {
  const navigate = useNavigate()
  const [hasError, setHasError] = useState(false)
  return (
    <>
      <IconBar close />
      <PageWrapper>
        <Title>Add a new account</Title>
        <OptionsWrapper>
          <Option
            title="Create new Alephium account"
            icon={<AlephiumIcon />}
            description="Generate a new wallet address"
            hideArrow
            onClick={async () => {
              try {
                useAppState.setState({ isLoading: true })
                navigate(routes.addAlephiumAccount())
              } catch (e) {
                console.error(e)
                setHasError(true)
              } finally {
                useAppState.setState({ isLoading: false })
              }
            }}
          />
        </OptionsWrapper>
        {hasError && (
          <FormError>
            There was an error creating your account. Please try again.
          </FormError>
        )}
      </PageWrapper>
    </>
  )
}