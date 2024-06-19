import { Button, icons } from "@argent/ui"
import { ComponentProps, FC } from "react"
import { Link } from "react-router-dom"

import { routes } from "../../routes"
import { useTranslation } from "react-i18next"

const { AddIcon } = icons

export const NewTokenButton: FC<ComponentProps<typeof Button>> = (props) => {
  const { t } = useTranslation()
  return (
    <Button
      size={"sm"}
      colorScheme={"transparent"}
      mx={"auto"}
      as={Link}
      to={routes.newToken()}
      leftIcon={<AddIcon />}
      color="neutrals.400"
      loadingText={t("Fetching tokens")}
      {...props}
    >
      {t("New token")}
    </Button>
  )
}
