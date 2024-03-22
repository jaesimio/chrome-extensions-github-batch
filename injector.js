var batchDeleteLoading = document.createElement('div')
batchDeleteLoading.classList.add('batch-delete-loading')
batchDeleteLoading.classList.add('batch-delete-hide')
batchDeleteLoading.innerHTML = `
  <svg viewBox="0 0 150 150">
    <circle class="background" cx="50%" cy="50%" r="50" />
    <circle class="fill" cx="50%" cy="50%" r="50" />
  </svg>
`

var batchDeleteSpan = document.createElement('span')
batchDeleteSpan.innerText = 'Delete selection'

var batchDeletePermission = false
var batchDeleteButton = null
async function ButtonInject() {
  const target = Array.from(document.querySelectorAll('input[type=checkbox][name="issues[]"]')).find(el => el.checked)
  if(!target) {
    if(batchDeleteButton) batchDeleteButton.remove()
    batchDeleteButton = null
    return
  }
  
  const idList = Array.from(document.querySelectorAll('input[type=checkbox][name="issues[]"]')).reduce((p,e) => e.checked ? [...p, e.value] : p, [])

  if(batchDeleteButton) batchDeleteButton.remove()
  target.parentElement.parentElement.style.position = 'relative'
  
  const button = document.createElement('button')
  button.classList.add('batch-delete-button')
  button.classList.add('Popover-message')
  button.classList.add('Popover-message--left')

  button.appendChild(batchDeleteSpan)
  button.appendChild(batchDeleteLoading)

  if(batchDeletePermission) button.onclick = await handleBatchDelete(idList)

  target.parentElement.after(button)
  batchDeleteButton = button
}

async function handleBatchDelete(idList) {
  return async function() {
    const max = idList.length, maxp = 314
    let count = 0

    const handleProcess = () => {
      const each = maxp / max
      const now = maxp - each * ++count
      batchDeleteLoading.querySelector('circle.fill').style.strokeDashoffset = `${now}px`
    }

    batchDeleteLoading.classList.remove('batch-delete-hide')
    batchDeleteSpan.classList.add('batch-delete-hide')

    await idList.reduce(async (p, id) => {
      await p
      const url = `${location.pathname}/${id}`
      await fetch(url).then(response => response.text()).then(async res => {
        const token = /<form.+?class="edit_issue".+?name="authenticity_token".+?value="(?<token>[^"]+)"/.exec(res).groups?.token??''
        
        const formData = new FormData()
        formData.append('verify_delete', 1)
        formData.append('_method', 'delete')
        formData.append('authenticity_token', token)
        
        await fetch(`${location.pathname}/${id}`, {
          method: 'POST',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          },
          body: formData,
        })

        handleProcess()
      })
    }, Promise.resolve())

    window.location.reload()
  }
}

async function Initialize() {
  // Permission check
  try {
    const id = Array.from(document.querySelectorAll('input[type=checkbox][name="issues[]"]'))?.[0]?.value
    if(!id) throw new Error('Checkbox not exists')

    const url = `${location.pathname}/${id}`
    await fetch(url).then(response => response.text()).then(async res => {
      const token = /<form.+?class="edit_issue".+?name="authenticity_token".+?value="(?<token>[^"]+)"/.exec(res)?.groups?.token??''
      if(!token) throw new Error(`You don't have permission to delete`)
      return token
    })
    batchDeletePermission = true
  } catch(e) {
    const err = e.message
    batchDeleteSpan.innerText = err
    batchDeletePermission = false
  }


  document.querySelectorAll('input[type=checkbox][name="issues[]"]').forEach(el => {
    el.addEventListener('change', async function() {
      await ButtonInject()
    })
  })
}

Initialize()