import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (_req, res) => {
  // Pass the command to the offscreen document
  chrome.runtime.sendMessage({ action: "play" })
  res.send({ success: true })
}

export default handler
