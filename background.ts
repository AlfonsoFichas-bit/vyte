let playerWindowId: number | null = null

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.action === "open_player") {
    openPlayerWindow()
  }
})

async function openPlayerWindow() {
  if (playerWindowId !== null) {
    try {
      const existingWindow = await chrome.windows.get(playerWindowId)
      if (existingWindow) {
        // Window already exists, just focus it
        await chrome.windows.update(playerWindowId, { focused: true })
        return
      }
    } catch (_e) {
      // Window was closed but we didn't catch the event, ID is stale
      playerWindowId = null
    }
  }

  // Create a new window for the player
  const window = await chrome.windows.create({
    url: chrome.runtime.getURL("tabs/player.html"),
    type: "popup",
    width: 1000,
    height: 800
  })

  if (window.id !== undefined) {
    playerWindowId = window.id
  }
}

// Keep track of closed windows to reset the ID
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === playerWindowId) {
    playerWindowId = null
  }
})
