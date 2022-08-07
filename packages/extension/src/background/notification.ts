import { Storage } from "./storage"

const notificationsStorage = new Storage({
  notificationsShown: [] as string[],
})

export async function hasShownNotification(hash: string) {
  const notificationsShown = await notificationsStorage.getItem(
    "notificationsShown",
  )
  return notificationsShown.includes(hash)
}

export async function addToAlreadyShown(hash: string) {
  const notificationsShown = await notificationsStorage.getItem(
    "notificationsShown",
  )
  await notificationsStorage.setItem("notificationsShown", [
    ...notificationsShown,
    hash,
  ])
}
