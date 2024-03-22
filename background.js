const injectedTab = []

async function handleInject(tabId, changeInfo) {
  if(changeInfo.status !== 'complete') return
  const [tab] = await chrome.tabs.query({url: 'https://*.github.com/*/*/issues*'})
  if(!tab) return

  await chrome.scripting.insertCSS({target: {tabId: tab.id}, files: ["injector.css"]})
  await chrome.scripting.executeScript({target: {tabId: tab.id}, files: ["injector.js"]})
}

// chrome.tabs.onCreated.addListener(handleInject)
chrome.tabs.onUpdated.addListener(handleInject)
// chrome.tabs.onMoved.addListener(handleInject)
// chrome.tabs.onDetached.addListener(handleInject)
// chrome.tabs.onAttached.addListener(handleInject)
// chrome.tabs.onRemoved.addListener(handleInject)
// chrome.tabs.onReplaced.addListener(handleInject)