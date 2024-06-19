import React, { Children, FC, PropsWithChildren } from "react"

import { PageWrapper, Panel } from "../../components/FullScreenPage"

export const LedgerPage: FC<PropsWithChildren> = ({ children }) => {
  const [panel, ...restChildren] = Children.toArray(children)
  return (
    <>
      <PageWrapper>
        <Panel>{restChildren}</Panel>
        <Panel>{panel}</Panel>
      </PageWrapper>
    </>
  )
}
