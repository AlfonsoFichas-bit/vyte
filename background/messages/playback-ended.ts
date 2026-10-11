import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (_req, res) => {
  chrome.runtime.sendMessage({ action: "playback-ended" })
  res.send({ success: true })
}

export default handler
