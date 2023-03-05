import { BarBackButton, NavigationContainer } from "@argent/ui"
import { Collapse } from "@mui/material"
import { FC, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Network, addNetwork, networkSchema } from "../../../shared/network"
import { settingsStore } from "../../../shared/settings"
import { defaultBlockExplorers } from "../../../shared/settings/defaultBlockExplorers"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { useAppState } from "../../app.state"
import { IconButton } from "../../components/IconButton"
import { ArrowBackIosNewIcon } from "../../components/Icons/MuiIcons"
import { ControlledInputText } from "../../components/InputText"
import { makeClickable } from "../../services/a11y"
import { A, FormError, P } from "../../theme/Typography"
import { DeprecatedConfirmScreen } from "../actions/DeprecatedConfirmScreen"
import { slugify } from "./slugify"
import { useYupValidationResolver } from "./useYupValidationResolver"

const ExtendableControl = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-top: 8px;
`

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
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)

  const blockExplorerKey = useKeyValueStorage(settingsStore, "blockExplorerKey")
  const settingsBlockExplorer = defaultBlockExplorers[blockExplorerKey]

  const defaultNetwork = useMemo<Network>(() => {
    if (props.mode === "add") {
      return { id: "", name: "", chainId: 0, explorerApiUrl: "", nodeUrl: "" }
    }
    /** display selected block explorer url from settings for readonly network */
    if (
      props.network.readonly &&
      (props.network.id === "mainnet-alpha" ||
        props.network.id === "goerli-alpha")
    ) {
      const blockExplorerUrl = settingsBlockExplorer.url[props.network.id]
      return {
        ...props.network,
        blockExplorerUrl,
      }
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
    <NavigationContainer leftButton={<BarBackButton />} title={"Networks"}>
      <DeprecatedConfirmScreen
        title={props.mode === "add" ? "Add network" : "Edit network"}
        singleButton
        confirmButtonText={props.mode === "add" ? "Create" : "Save"}
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
          <P>Here you can add your own custom network.</P>
          <ControlledInputText
            autoFocus
            autoComplete="off"
            control={control}
            placeholder="Network name"
            name="name"
            type="text"
            disabled={defaultNetwork.readonly}
          />
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder="Internal ID"
            name="id"
            type="text"
            disabled
          />
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder="Node URL"
            name="nodeUrl"
            type="url"
            disabled={defaultNetwork.readonly}
          />
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder="Explorer API URL"
            name="explorerApiUrl"
            type="url"
            disabled={defaultNetwork.readonly}
          />
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder="Explorer URL"
            name="explorerUrl"
            type="url"
            disabled={defaultNetwork.readonly}
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
