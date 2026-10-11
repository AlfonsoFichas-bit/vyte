import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  // We send the track info to offscreen
  // But wait, background can't send FileSystemFileHandle easily over messaging due to serialization limits.
  // Actually, FileSystemFileHandle is serializable if sent via postMessage / runtime.sendMessage!
  chrome.runtime.sendMessage({
    action: "load",
    track: req.body.track,
    fileHandle: req.body.fileHandle
  })
  res.send({ success: true })
}

export default handler
