import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  chrome.runtime.sendMessage({ action: "seek", time: req.body.time })
  res.send({ success: true })
}

export default handler
