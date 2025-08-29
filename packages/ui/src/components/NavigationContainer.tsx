import React, { FC, ReactNode, PropsWithChildren } from "react"

import { useScroll } from "../hooks"
import { useScrollRestoration } from "../hooks/useScrollRestoration"
import { NavigationBar, NavigationBarProps } from "./NavigationBar"
import { ScrollContainer } from "./ScrollContainer"

export interface NavigationContainerProps extends NavigationBarProps {
  /** Unique id for persisting scroll position - if provided, scroll position will be restored when navigating 'back' to this component. See {@link useScrollRestoration} */
  scrollKey?: string
}

interface ScrollRestorationNavigationContainerProps
  extends NavigationBarProps {
  scrollKey: string
}

/**
 * Combines {@link NavigationBar} and {@link ScrollContainer} and sets up the scroll interaction between them
 */

export const NavigationContainer: FC<NavigationContainerProps> = ({
  scrollKey,
  ...rest
}) => {
  if (scrollKey) {
    return (
      <ScrollRestorationNavigationContainer scrollKey={scrollKey} {...rest} />
    )
  }
  return <BaseNavigationContainer {...rest} />
}

/** No `scrollKey`, no scroll restoration */

const BaseNavigationContainer: FC<NavigationBarProps> = ({
  children,
  ...rest
}) => {
  const { scrollRef, scroll } = useScroll()
  return (
    <>
      <NavigationBar scroll={scroll} {...rest} />
      <ScrollContainer ref={scrollRef}>{children}</ScrollContainer>
    </>
  )
}

/** With scroll restoration */

const ScrollRestorationNavigationContainer: FC<
  ScrollRestorationNavigationContainerProps
> = ({ scrollKey, children, ...rest }) => {
  const { scrollRef, scroll } = useScrollRestoration(scrollKey)
  return (
    <>
      <NavigationBar scroll={scroll} {...rest} />
      <ScrollContainer ref={scrollRef}>{children}</ScrollContainer>
    </>
  )
}
