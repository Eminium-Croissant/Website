const croissantBaseUrl = 'https://croissant-api.eminium.ovh/api'

export class CroissantAPI {
  constructor(params = {}) {
    this.users = {
      getMe: async () => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/users/@me`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch user')
        return await res.json()
      },

      search: async (query) => {
        const res = await fetch(`${croissantBaseUrl}/users/search?q=${encodeURIComponent(query)}`)
        if (!res.ok) return []
        return await res.json()
      },

      getUser: async (userId) => {
        const res = await fetch(`${croissantBaseUrl}/users/${userId}`)
        if (!res.ok) throw new Error('User not found')
        return await res.json()
      },

      transferCredits: async (targetUserId, amount) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/users/transfer-credits`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify({ targetUserId, amount })
        })
        if (!res.ok) throw new Error('Failed to transfer credits')
        return await res.json()
      },

      verify: async (userId, verificationKey) => {
        const res = await fetch(`${croissantBaseUrl}/users/auth-verification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, verificationKey })
        })
        if (!res.ok) return { success: false }
        return await res.json()
      }
    }

    this.games = {
      list: async () => {
        const res = await fetch(`${croissantBaseUrl}/games`)
        if (!res.ok) return []
        return await res.json()
      },

      search: async (query) => {
        const res = await fetch(`${croissantBaseUrl}/games/search?q=${encodeURIComponent(query)}`)
        if (!res.ok) return []
        return await res.json()
      },

      getMyCreatedGames: async () => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/games/@mine`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!res.ok) return []
        return await res.json()
      },

      getMyOwnedGames: async () => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/games/list/@me`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!res.ok) return []
        return await res.json()
      },

      get: async (gameId) => {
        const res = await fetch(`${croissantBaseUrl}/games/${gameId}`)
        if (!res.ok) throw new Error('Game not found')
        return await res.json()
      }
    }

    this.inventory = {
      getMyInventory: async () => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/inventory/@me`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch inventory')
        return await res.json()
      },

      get: async (userId) => {
        const res = await fetch(`${croissantBaseUrl}/inventory/${userId}`)
        if (!res.ok) throw new Error('Failed to fetch inventory')
        return await res.json()
      }
    }

    this.items = {
      list: async () => {
        const res = await fetch(`${croissantBaseUrl}/items`)
        if (!res.ok) return []
        return await res.json()
      },

      getMyItems: async () => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/items/@mine`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!res.ok) return []
        return await res.json()
      },

      search: async (query) => {
        const res = await fetch(`${croissantBaseUrl}/items/search?q=${encodeURIComponent(query)}`)
        if (!res.ok) return []
        return await res.json()
      },

      get: async (itemId) => {
        const res = await fetch(`${croissantBaseUrl}/items/${itemId}`)
        if (!res.ok) throw new Error('Item not found')
        return await res.json()
      },

      create: async (itemData) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/items/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify(itemData)
        })
        if (!res.ok) throw new Error('Failed to create item')
        return await res.json()
      },

      update: async (itemId, itemData) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/items/update/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify(itemData)
        })
        if (!res.ok) throw new Error('Failed to update item')
        return await res.json()
      },

      delete: async (itemId) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/items/delete/${itemId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!res.ok) throw new Error('Failed to delete item')
        return await res.json()
      },

      buy: async (itemId, amount) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/items/buy/${itemId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify({ amount })
        })
        if (!res.ok) throw new Error('Failed to buy item')
        return await res.json()
      },

      sell: async (itemId, amount) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/items/sell/${itemId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify({ amount })
        })
        if (!res.ok) throw new Error('Failed to sell item')
        return await res.json()
      },

      give: async (itemId, amount, userId, metadata) => {
        if (!this.token) throw new Error('Token is required')
        const body = { amount, userId }
        if (metadata) body.metadata = metadata
        const res = await fetch(`${croissantBaseUrl}/items/give/${itemId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify(body)
        })
        if (!res.ok) throw new Error('Failed to give item')
        return await res.json()
      },

      consume: async (itemId, params) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/items/consume/${itemId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify(params)
        })
        if (!res.ok) throw new Error('Failed to consume item')
        return await res.json()
      },

      updateMetadata: async (itemId, uniqueId, metadata) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/items/update-metadata/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify({ uniqueId, metadata })
        })
        if (!res.ok) throw new Error('Failed to update metadata')
        return await res.json()
      },

      drop: async (itemId, params) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/items/drop/${itemId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify(params)
        })
        if (!res.ok) throw new Error('Failed to drop item')
        return await res.json()
      }
    }

    this.lobbies = {
      create: async () => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/lobbies`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!res.ok) throw new Error('Failed to create lobby')
        return await res.json()
      },

      get: async (lobbyId) => {
        const res = await fetch(`${croissantBaseUrl}/lobbies/${lobbyId}`)
        if (!res.ok) throw new Error('Lobby not found')
        return await res.json()
      },

      getMyLobby: async () => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/lobbies/user/@me`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!res.ok) throw new Error('User not in any lobby')
        return await res.json()
      },

      getUserLobby: async (userId) => {
        const res = await fetch(`${croissantBaseUrl}/lobbies/user/${userId}`)
        if (!res.ok) throw new Error('User not in any lobby')
        return await res.json()
      },

      join: async (lobbyId) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/lobbies/${lobbyId}/join`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!res.ok) throw new Error('Failed to join lobby')
        return await res.json()
      },

      leave: async (lobbyId) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/lobbies/${lobbyId}/leave`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!res.ok) throw new Error('Failed to leave lobby')
        return await res.json()
      }
    }

    this.studios = {
      create: async (studioName) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/studios`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify({ studioName })
        })
        if (!res.ok) throw new Error('Failed to create studio')
        return await res.json()
      },

      get: async (studioId) => {
        const res = await fetch(`${croissantBaseUrl}/studios/${studioId}`)
        if (!res.ok) throw new Error('Studio not found')
        return await res.json()
      },

      getMyStudios: async () => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/studios/user/@me`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch studios')
        return await res.json()
      },

      addUser: async (studioId, userId) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/studios/${studioId}/add-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify({ userId })
        })
        if (!res.ok) throw new Error('Failed to add user to studio')
        return await res.json()
      },

      removeUser: async (studioId, userId) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/studios/${studioId}/remove-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify({ userId })
        })
        if (!res.ok) throw new Error('Failed to remove user from studio')
        return await res.json()
      }
    }

    this.trades = {
      startOrGetPending: async (userId) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/trades/start-or-latest/${userId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!res.ok) throw new Error('Failed to start or get trade')
        return await res.json()
      },

      get: async (tradeId) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/trades/${tradeId}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!res.ok) throw new Error('Trade not found')
        return await res.json()
      },

      getUserTrades: async (userId) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/trades/user/${userId}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch trades')
        return await res.json()
      },

      addItem: async (tradeId, tradeItem) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/trades/${tradeId}/add-item`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify({ tradeItem })
        })
        if (!res.ok) throw new Error('Failed to add item to trade')
        return await res.json()
      },

      removeItem: async (tradeId, tradeItem) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/trades/${tradeId}/remove-item`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify({ tradeItem })
        })
        if (!res.ok) throw new Error('Failed to remove item from trade')
        return await res.json()
      },

      approve: async (tradeId) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/trades/${tradeId}/approve`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!res.ok) throw new Error('Failed to approve trade')
        return await res.json()
      },

      cancel: async (tradeId) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/trades/${tradeId}/cancel`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!res.ok) throw new Error('Failed to cancel trade')
        return await res.json()
      }
    }

    this.oauth2 = {
      getApp: async (client_id) => {
        const res = await fetch(`${croissantBaseUrl}/oauth2/app/${client_id}`)
        if (!res.ok) throw new Error('OAuth2 app not found')
        return await res.json()
      },

      createApp: async (name, redirect_urls) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/oauth2/app`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify({ name, redirect_urls })
        })
        if (!res.ok) throw new Error('Failed to create OAuth2 app')
        return await res.json()
      },

      getMyApps: async () => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/oauth2/apps`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch OAuth2 apps')
        return await res.json()
      },

      updateApp: async (client_id, data) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/oauth2/app/${client_id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify(data)
        })
        if (!res.ok) throw new Error('Failed to update OAuth2 app')
        return await res.json()
      },

      deleteApp: async (client_id) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(`${croissantBaseUrl}/oauth2/app/${client_id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!res.ok) throw new Error('Failed to delete OAuth2 app')
        return await res.json()
      },

      authorize: async (client_id, redirect_uri) => {
        if (!this.token) throw new Error('Token is required')
        const res = await fetch(
          `${croissantBaseUrl}/oauth2/authorize?client_id=${encodeURIComponent(client_id)}&redirect_uri=${encodeURIComponent(redirect_uri)}`,
          {
            headers: { Authorization: `Bearer ${this.token}` }
          }
        )
        if (!res.ok) throw new Error('Failed to authorize')
        return await res.json()
      },

      getUserByCode: async (code, client_id) => {
        const res = await fetch(`${croissantBaseUrl}/oauth2/user?code=${encodeURIComponent(code)}&client_id=${encodeURIComponent(client_id)}`)
        if (!res.ok) throw new Error('Failed to fetch user by code')
        return await res.json()
      }
    }
    this.token = params.token
  }
}
export default CroissantAPI
