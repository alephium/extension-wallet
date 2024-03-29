import { AccountListItem } from "@alephium/extension/src/ui/features/accounts/AccountListItem"
import { Flex } from "@chakra-ui/layout"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "accounts/AccountListItem",
  component: AccountListItem,
} as ComponentMeta<typeof AccountListItem>

const Template: ComponentStory<typeof AccountListItem> = (props) => (
  <Flex flex={1} flexDirection="column">
    <AccountListItem {...props}></AccountListItem>
  </Flex>
)

const account = {
  accountName: "Account 1 Lorem Ipsum Dolor Sit Amet",
  accountAddress:
    "16VPvbF1ShQsj8TappJWtoW6gRM1AEQXYqwo5rQ7BiAy3",
  networkId: "goerli-alpha",
}

export const Default = Template.bind({})
Default.args = {
  ...account,
}

export const Outline = Template.bind({})
Outline.args = {
  ...account,
  outlined: true,
}

export const Highlight = Template.bind({})
Highlight.args = {
  ...account,
  highlighted: true,
}

export const Deploying = Template.bind({})
Deploying.args = {
  ...account,
  deploying: true,
}

export const Upgrade = Template.bind({})
Upgrade.args = {
  ...account,
  upgrade: true,
}

export const Connected = Template.bind({})
Connected.args = {
  ...account,
  connectedHost: "foobar.xyz",
}

export const Hidden = Template.bind({})
Hidden.args = {
  ...account,
  hidden: true,
}

export const Children = Template.bind({})
Children.args = {
  ...account,
  children: <span>Child in here</span>,
}

export const AvatarOutlined = Template.bind({})
AvatarOutlined.args = {
  ...account,
  avatarOutlined: true,
}

export const PluginAccount = Template.bind({})
PluginAccount.args = {
  ...account,
  accountType: "argent-plugin",
}
