import { AlertIcon } from "@alephium/extension/src/ui/components/Icons/AlertIcon"
import { AspectLogo } from "@alephium/extension/src/ui/components/Icons/AspectLogo"
import { AtTheRateIcon } from "@alephium/extension/src/ui/components/Icons/AtTheRateIcon"
import { BackIcon } from "@alephium/extension/src/ui/components/Icons/BackIcon"
import { ChevronDown } from "@alephium/extension/src/ui/components/Icons/ChevronDown"
import { ChevronRight } from "@alephium/extension/src/ui/components/Icons/ChevronRight"
import { CloseIcon } from "@alephium/extension/src/ui/components/Icons/CloseIcon"
import { CloseIconAlt } from "@alephium/extension/src/ui/components/Icons/CloseIconAlt"
import { DangerIcon } from "@alephium/extension/src/ui/components/Icons/DangerIcon"
import { DiscordIcon } from "@alephium/extension/src/ui/components/Icons/DiscordIcon"
import { EditIcon } from "@alephium/extension/src/ui/components/Icons/EditIcon"
import { GithubIcon } from "@alephium/extension/src/ui/components/Icons/GithubIcon"
import { MintSquareLogo } from "@alephium/extension/src/ui/components/Icons/MintSquareLogo"
import { NetworkWarningIcon } from "@alephium/extension/src/ui/components/Icons/NetworkWarningIcon"
import { PlusCircle } from "@alephium/extension/src/ui/components/Icons/PlusCircle"
import { SearchIcon } from "@alephium/extension/src/ui/components/Icons/SearchIcon"
import { SupportIcon } from "@alephium/extension/src/ui/components/Icons/SupportIcon"
import { UpdateIcon } from "@alephium/extension/src/ui/components/Icons/UpdateIcon"
import { ViewOnBlockExplorerIcon } from "@alephium/extension/src/ui/components/Icons/ViewOnBlockExplorerIcon"
import { WarningIcon } from "@alephium/extension/src/ui/components/Icons/WarningIcon"
import { WarningIconRounded } from "@alephium/extension/src/ui/components/Icons/WarningIconRounded"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { FC } from "react"
import styled from "styled-components"

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  font-size: 48px;
  color: #ff00ff;
  > * {
    background-color: #333333;
  }
`

const Icons: FC = () => (
  <Container>
    <AlertIcon />
    <AspectLogo />
    <AtTheRateIcon />
    <BackIcon />
    <ChevronDown />
    <ChevronRight />
    <CloseIcon />
    <CloseIconAlt />
    <DangerIcon />
    <DiscordIcon />
    <EditIcon />
    <GithubIcon />
    <MintSquareLogo />
    <NetworkWarningIcon />
    <PlusCircle />
    <SearchIcon />
    <SupportIcon />
    <UpdateIcon />
    <ViewOnBlockExplorerIcon />
    <WarningIcon />
    <WarningIconRounded />
  </Container>
)

export default {
  title: "components/IconsDeprecated",
  component: Icons,
} as ComponentMeta<typeof Icons>

const Template: ComponentStory<typeof Icons> = (props) => (
  <Icons {...props}></Icons>
)

export const Default = Template.bind({})
Default.args = {}
