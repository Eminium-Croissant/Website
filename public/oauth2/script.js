const { data } = require('react-router-dom')

window.croissantOAuthCallbacks = window.croissantOAuthCallbacks || {}

let popup = null
const croissantWebsiteOrigin = 'https://croissant-api.eminium.ovh'

document.addEventListener('DOMContentLoaded', () => {
  console.log('OAuth2 script loaded')

  const oauthBtn = document.querySelector('.croissantWebsiteOrigin')
  if (!oauthBtn) {
    console.error('OAuth2 button not found')
    return
  }

  if (location.origin !== croissantWebsiteOrigin) {
    oauthBtn.style.display = 'inline-flex'
    oauthBtn.style.alignItems = 'center'
    oauthBtn.style.gap = '8px'
    oauthBtn.style.padding = '8px 16px'
    oauthBtn.style.fontSize = '1rem'
    oauthBtn.style.borderRadius = '6px'
    oauthBtn.style.border = 'none'
    oauthBtn.style.background = '#333'
    oauthBtn.style.color = '#fff'
    oauthBtn.style.cursor = 'pointer'

    oauthBtn.addEventListener('click', () => {
      const clientId = oauthBtn.getAttribute('data-client_id')
      const callbackName = oauthBtn.getAttribute('data-callback')

      if (!clientId || !callbackName) {
        console.error('Missing client_id or callback on OAuth button')
        return
      }

      const redirectUri = location.origin
      const authUrl = `${croissantWebsiteOrigin}/oauth2/auth?/client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}`

      popup = window.open(authUrl, '_oauth2', 'width=600,height=600')

      startPollingForCode(clientId, callbackName)
    })
  } else {
    console.warn('OAuth2 script is running from the same origin:', location.origin)
  }
})

function startPollingForCode(clientId, callbackName) {
  const interval = setInterval(() => {
    if (!popup || popup.closed) {
      clearInterval(interval)
      return
    }

    try {
      const url = new URL(popup.location.href)
      const code = url.searchParams.get('code')

      if (code) {
        popup.close()
        clearInterval(interval)

        fetch(`${croissantWebsiteOrigin}/api/oauth2/user?code=${encodeURI(code)}&client_id=${encodeURIComponent(clientId)}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.error) {
              console.error('Error fetching user by code:', data.error)
              return
            }

            const user = { ...data, code }

            if (window.croissantOAuthCallbacks[callbackName]) {
              window.croissantOAuthCallbacks[callbackName](user)
            } else {
              console.warn(`OAuth2 callback '${callbackName}' not found croissantOAuthCallbacks`)
            }
          })
          .catch((error) => {
            console.error('Failed to fetch user data:', error)
          })
      }
    } catch (e) {
      if (e instanceof DOMException) return
      console.error('Error checking popup URL:', e)
    }
  }, 500)
}
