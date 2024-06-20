import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { makeClickable } from "../services/a11y"
import { IconButton } from "./IconButton"
import { ArrowBackIosNewIcon } from "./Icons/MuiIcons"
import { useTranslation } from "react-i18next"

interface BackButtonProps {
  to?: string
}

export const BackButton: FC<BackButtonProps> = (props) => {
  const navigate = useNavigate()
  const onClick = () => (props.to ? navigate(props.to) : navigate(-1))
  const { t } = useTranslation()

  return (
    <IconButton
      {...makeClickable(onClick, { label: t("Back"), tabIndex: 99 })}
      size={36}
      {...props}
    >
      <ArrowBackIosNewIcon />
    </IconButton>
  )
}
