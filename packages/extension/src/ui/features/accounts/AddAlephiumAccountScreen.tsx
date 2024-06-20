import ToggleSection from '../../components/ToggleSection'
import { BarBackButton, NavigationContainer } from "@argent/ui"
import { ConfirmScreen } from '../actions/ConfirmScreen'
import { ControlledInputText } from '../../components/InputText'
import { FormError, P } from '../../theme/Typography'
import { PageWrapper, Title } from "../../components/Page"
import { object, number } from 'yup'
import { routes } from '../../routes'
import { useAddAccount } from './useAddAccount'
import { useAppState } from '../../app.state'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useYupValidationResolver } from '../settings/useYupValidationResolver'
import { useTranslation } from "react-i18next"

export const AddAlephiumAccountScreen = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const yupSchemaValidator = useYupValidationResolver(
    object().required().shape({ group: number() })
  )

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm<{ group?: number }>({
    criteriaMode: 'firstError',
    resolver: yupSchemaValidator
  })

  const { addAccount } = useAddAccount()

  const handleAddAddress = async () => {
    try {
      const group = getValues('group')
      await addAccount('default', group)
    } catch (error: any) {
      useAppState.setState({ error: `${error}` })
      navigate(routes.error())
    }
  }

  return (
    <>
      <NavigationContainer
        leftButton={<BarBackButton />}
      >
        <ConfirmScreen
          title="New address"
          singleButton
          confirmButtonText="Create"
          onSubmit={handleSubmit(handleAddAddress)}
        >
          <PageWrapper>
            <Title>{t("Alephium account")}</Title>
            <P>{t("Create a new address to help you manage your assets.")}</P>
            <br />
            <ToggleSection title={t("Define group?")} marginTop>
              <ControlledInputText
                name="group"
                control={control}
                type="number"
                placeholder="Group"
                defaultValue={undefined}
                min={0}
                max={3}
              />
            </ToggleSection>
            {Object.keys(errors).length > 0 && (
              <FormError>
                {Object.values(errors)
                  .map((x) => x?.message)
                  .join('. ')}
              </FormError>
            )}
          </PageWrapper>
        </ConfirmScreen>
      </NavigationContainer>
    </>
  )
}

export default AddAlephiumAccountScreen
