import { BarBackButton, NavigationContainer } from "@argent/ui"
import { FC, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Network, addNetwork, networkSchema } from "../../../shared/network"
import { useAppState } from "../../app.state"
import { ControlledInputText } from "../../components/InputText"
import { FormError, P } from "../../theme/Typography"
import { DeprecatedConfirmScreen } from "../actions/DeprecatedConfirmScreen"
import { slugify } from "./slugify"
import { useYupValidationResolver } from "./useYupValidationResolver"
import { useTranslation } from "react-i18next"


const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

type NetworkSettingsFormScreenProps =
  | {
      mode: "add"
    }
  | {
      mode: "edit"
      network: Network
    }

export const NetworkSettingsFormScreen: FC<NetworkSettingsFormScreenProps> = (
  props,
) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const defaultNetwork = useMemo<Network>(() => {
    if (props.mode === "add") {
      return { name: "", id: "", nodeUrl: "", explorerApiUrl: "", explorerUrl: "" }
    }
    return props.network
    // due to an or type we need to check different values depending on the mode
  }, [props.mode === "add" || props.network]) // eslint-disable-line react-hooks/exhaustive-deps

  const yupSchemaValidator = useYupValidationResolver(networkSchema)
  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm<Network>({
    defaultValues: defaultNetwork,
    resolver: yupSchemaValidator,
  })

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (props.mode === "add" && type === "change" && name === "name") {
        setValue("id", slugify(value.name || ""))
      }
    })
    return subscription.unsubscribe
    // on mount
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <NavigationContainer leftButton={<BarBackButton />} title={t("Network_other")}>
      <DeprecatedConfirmScreen
        title={props.mode === "add" ? t("Add network") : t("Edit network")}
        singleButton
        confirmButtonText={props.mode === "add" ? t("Create") : t("Save")}
        smallTopPadding
        confirmButtonDisabled={defaultNetwork.readonly}
        onSubmit={handleSubmit(async (network) => {
          try {
            useAppState.setState({ isLoading: true })
            await addNetwork(network)
            navigate(-1)
          } finally {
            useAppState.setState({ isLoading: false })
          }
        })}
      >
        <Wrapper>
          <ControlledInputText
            autoFocus
            autoComplete="off"
            control={control}
            placeholder={t("Network name")}
            name="name"
            type="text"
            disabled
          />
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder={t("Node URL")}
            name="nodeUrl"
            type="url"
          />
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder={t("Node API Key (Optional)")}
            name="nodeApiKey"
            type="text"
          />
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder={t("Explorer API URL")}
            name="explorerApiUrl"
            type="url"
          />
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder={t("Explorer URL")}
            name="explorerUrl"
            type="url"
          />

          {Object.keys(errors).length > 0 && (
            <FormError>
              {Object.values(errors)
                .map((x) => x.message)
                .join(". ")}
            </FormError>
          )}
        </Wrapper>
      </DeprecatedConfirmScreen>
    </NavigationContainer>
  )
}
