import { BarBackButton, ButtonCell, CellStack, NavigationContainer } from "@argent/ui"
import { FC } from "react"

import { Language, languageOptions } from "./languages"
import { routes } from "../../routes"
import i18next from "i18next"
import { useNavigate } from "react-router-dom"

export const SettingsLanguageScreen: FC = () => {
  const navigate = useNavigate()

  const handleLanguageChange = (lang: Language) => {
    i18next.changeLanguage(lang).then(() => {
      navigate(routes.settings())
    })
  }

  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      title="Language"
    >
      <CellStack>
        {languageOptions.map(({ value, label }) => (
          <ButtonCell key={label} onClick={() => handleLanguageChange(value)} title={label}>
            {label}
          </ButtonCell>
        ))}
      </CellStack>
    </NavigationContainer>
  )
}
