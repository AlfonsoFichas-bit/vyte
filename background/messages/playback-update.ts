import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  // This message is sent from offscreen document to background,
  // but we need it in the UI window. We can broadcast it using chrome.runtime.sendMessage
  // so the store in the UI window can pick it up.
  chrome.runtime.sendMessage({
    action: "playback-update",
    currentTime: req.body.currentTime,
    duration: req.body.duration
  })
  res.send({ success: true })
}

export default handler
