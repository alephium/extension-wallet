import { AccountListItemProps } from "@alephium/extension/src/ui/features/accounts/AccountListItem"
import { AccountSelect } from "@alephium/extension/src/ui/features/accounts/AccountSelect"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "accounts/AccountSelect",
  component: AccountSelect,
} as ComponentMeta<typeof AccountSelect>

const Template: ComponentStory<typeof AccountSelect> = (props) => (
  <AccountSelect {...props}></AccountSelect>
)

const accounts = [
  {
    accountName: "Account 1",
    accountAddress:
      "1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH",
    networkId: "devnet",
  }
]

const onSelectedAccountChange = (selectedAccount: AccountListItemProps) => {
  console.log("onSelectedAccountChange", selectedAccount)
}

export const Default = Template.bind({})
Default.args = {
  accounts,
  selectedAccount: accounts[0],
  onSelectedAccountChange,
}
