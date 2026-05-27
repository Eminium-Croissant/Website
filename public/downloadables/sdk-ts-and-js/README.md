# Croissant API Client Library - Typescript/Javascript

A comprehensive JavaScript/TypeScript client library for the Croissant gaming platform API. This library provides a fully typed interface for all platform features including user management, game operations, inventory, trading, and more.

## Installation

### Direct Download

Download the library files directly from the Croissant platform:

- **TypeScript**: [croissant-api.ts](https://croissant-api.eminium.ovh/downloadables/sdk-ts-and-js/croissant-api.ts)
- **JavaScript**: [croissant-api.js](https://croissant-api.eminium.ovh/downloadables/sdk-ts-and-js/croissant-api.js)

### Direct Import

```typescript
import { CroissantAPI } from './croissant-api.ts'
```

## Requirements

- **Runtime**: ES2020+ or Node.js 14+
- **Dependencies**: Modern browser or Node.js with fetch API support

## Getting Started

### Basic Initialization

```typescript
import { CroissantAPI } from './croissant-api'

// Public access (read-only operations)
const api = new CroissantAPI()

// Authenticated access (full functionality)
const api = new CroissantAPI({
  token: 'your_auth_token_here'
})
```

### Authentication

To perform authenticated operations, you need an API token:

1. **Via Web Dashboard**: Login to [croissant-api.eminium.ovh](https://croissant-api.eminium.ovh) and generate a token
2. **Via OAuth2**: Implement OAuth2 flow for third-party applications
3. **Via Bot Token**: Use dedicated bot tokens for automated systems

```typescript
// Environment variable (recommended)
const api = new CroissantAPI({
  token: process.env.CROISSANT_API_TOKEN
})
```

## API Reference

### Core Classes

#### `CroissantAPI`

Main API client class providing access to all platform modules.

**Constructor**

```typescript
new CroissantAPI(options?: { token?: string })
```

**Modules**

- `api.users` - User operations and profile management
- `api.games` - Game discovery and management
- `api.inventory` - Inventory operations
- `api.items` - Item management and marketplace
- `api.studios` - Studio and team management
- `api.lobbies` - Game lobby operations
- `api.trades` - Trading system
- `api.oauth2` - OAuth2 authentication

---

### Users Module (`api.users`)

#### `getMe(): Promise<User>`

Retrieve the authenticated user's profile.

```typescript
const user = await api.users.getMe() // Requires authentication
```

#### `search(query: string): Promise<User[]>`

Search for users by username.

```typescript
const users = await api.users.search('john')
```

#### `getUser(userId: string): Promise<User>`

Get a specific user by ID.

```typescript
const user = await api.users.getUser('user_12345')
```

#### `transferCredits(targetUserId: string, amount: number): Promise<TransferResult>`

Transfer credits to another user.

```typescript
const result = await api.users.transferCredits('user_67890', 100)
```

#### `verify(userId: string, verificationKey: string): Promise<VerificationResult>`

Verify a user account.

```typescript
const result = await api.users.verify('user_id', 'verification_key')
```

---

### Games Module (`api.games`)

#### `list(): Promise<Game[]>`

List all available games.

```typescript
const games = await api.games.list()
```

#### `search(query: string): Promise<Game[]>`

Search games by name or description.

```typescript
const games = await api.games.search('platformer adventure')
```

#### `get(gameId: string): Promise<Game>`

Get detailed information about a specific game.

```typescript
const game = await api.games.get('game_abc123')
```

#### `getMyCreatedGames(): Promise<Game[]>`

Get games created by the authenticated user.

```typescript
const myGames = await api.games.getMyCreatedGames() // Requires authentication
```

#### `getMyOwnedGames(): Promise<Game[]>`

Get games owned by the authenticated user.

```typescript
const ownedGames = await api.games.getMyOwnedGames() // Requires authentication
```

---

### Inventory Module (`api.inventory`)

#### `getMyInventory(): Promise<InventoryItem[]>`

Get the authenticated user's inventory.

```typescript
const inventory = await api.inventory.getMyInventory() // Requires authentication
```

#### `get(userId: string): Promise<InventoryItem[]>`

Get another user's public inventory.

```typescript
const userInventory = await api.inventory.get('user_12345')
```

---

### Items Module (`api.items`)

#### `list(): Promise<Item[]>`

List all available items in the marketplace.

```typescript
const items = await api.items.list()
```

#### `search(query: string): Promise<Item[]>`

Search items by name or description.

```typescript
const items = await api.items.search('magic sword')
```

#### `get(itemId: string): Promise<Item>`

Get detailed information about a specific item.

```typescript
const item = await api.items.get('item_xyz789')
```

#### `create(itemData: CreateItemRequest): Promise<CreateItemResult>`

Create a new item for sale.

```typescript
const result = await api.items.create({
  name: 'Enchanted Shield',
  description: 'Provides magical protection',
  price: 150,
  iconHash: 'optional_icon_hash'
}) // Requires authentication
```

#### `buy(itemId: string, quantity: number): Promise<PurchaseResult>`

Purchase items from the marketplace.

```typescript
const result = await api.items.buy('item_xyz789', 2) // Requires authentication
```

#### `sell(itemId: string, quantity: number): Promise<SellResult>`

Sell items from inventory.

```typescript
const result = await api.items.sell('item_xyz789', 1) // Requires authentication
```

#### `give(itemId: string, quantity: number, targetUserId: string): Promise<GiveResult>`

Give items to another user.

```typescript
const result = await api.items.give('item_xyz789', 1, 'user_67890') // Requires authentication
```

#### `drop(itemId: string, options: DropOptions): Promise<DropResult>`

Remove items from inventory.

```typescript
const result = await api.items.drop('item_xyz789', { amount: 1 }) // Requires authentication
```

---

### Studios Module (`api.studios`)

#### `create(name: string): Promise<CreateStudioResult>`

Create a new development studio.

```typescript
const result = await api.studios.create('Awesome Games Studio') // Requires authentication
```

#### `get(studioId: string): Promise<Studio>`

Get information about a specific studio.

```typescript
const studio = await api.studios.get('studio_abc123')
```

#### `getMyStudios(): Promise<Studio[]>`

Get studios owned by the authenticated user.

```typescript
const myStudios = await api.studios.getMyStudios() // Requires authentication
```

#### `addUser(studioId: string, userId: string): Promise<AddUserResult>`

Add a user to a studio team.

```typescript
const result = await api.studios.addUser('studio_abc123', 'user_67890') // Requires authentication
```

---

### Lobbies Module (`api.lobbies`)

#### `create(): Promise<CreateLobbyResult>`

Create a new game lobby.

```typescript
const result = await api.lobbies.create() // Requires authentication
```

#### `get(lobbyId: string): Promise<Lobby>`

Get information about a specific lobby.

```typescript
const lobby = await api.lobbies.get('lobby_xyz789')
```

#### `getMyLobby(): Promise<Lobby>`

Get the authenticated user's current lobby.

```typescript
const myLobby = await api.lobbies.getMyLobby() // Requires authentication
```

#### `join(lobbyId: string): Promise<JoinLobbyResult>`

Join an existing lobby.

```typescript
const result = await api.lobbies.join('lobby_xyz789') // Requires authentication
```

#### `leave(lobbyId: string): Promise<LeaveLobbyResult>`

Leave a lobby.

```typescript
const result = await api.lobbies.leave('lobby_xyz789') // Requires authentication
```

---

### Trades Module (`api.trades`)

#### `startOrGetPending(userId: string): Promise<Trade>`

Start a new trade or get existing pending trade with a user.

```typescript
const trade = await api.trades.startOrGetPending('user_67890') // Requires authentication
```

#### `get(tradeId: string): Promise<Trade>`

Get information about a specific trade.

```typescript
const trade = await api.trades.get('trade_abc123')
```

#### `addItem(tradeId: string, itemData: TradeItemData): Promise<AddItemResult>`

Add an item to a trade.

```typescript
const result = await api.trades.addItem('trade_abc123', {
  itemId: 'item_xyz789',
  amount: 1,
  metadata: { enchantment: 'fire' }
}) // Requires authentication
```

#### `approve(tradeId: string): Promise<ApproveResult>`

Approve and execute a trade.

```typescript
const result = await api.trades.approve('trade_abc123') // Requires authentication
```

#### `cancel(tradeId: string): Promise<CancelResult>`

Cancel a pending trade.

```typescript
const result = await api.trades.cancel('trade_abc123') // Requires authentication
```

---

### OAuth2 Module (`api.oauth2`)

#### `createApp(name: string, redirectUris: string[]): Promise<OAuth2App>`

Create a new OAuth2 application.

```typescript
const app = await api.oauth2.createApp('My Game Client', ['https://mygame.com/auth/callback']) // Requires authentication
```

#### `getMyApps(): Promise<OAuth2App[]>`

Get OAuth2 applications owned by the authenticated user.

```typescript
const apps = await api.oauth2.getMyApps() // Requires authentication
```

#### `authorize(clientId: string, redirectUri: string): Promise<AuthorizeResult>`

Authorize an OAuth2 application.

```typescript
const result = await api.oauth2.authorize('client_12345', 'https://app.com/callback')
```

## Type Definitions

### Core Types

#### `User`

```typescript
interface User {
  userId: string
  username: string
  email?: string
  verified: boolean
  balance?: number
  createdAt: string
  lastActive: string
}
```

#### `Game`

```typescript
interface Game {
  gameId: string
  name: string
  description: string
  price: number
  rating: number
  downloads: number
  creatorId: string
  createdAt: string
  updatedAt: string
  tags: string[]
  iconHash?: string
}
```

#### `Item`

```typescript
interface Item {
  itemId: string
  name: string
  description: string
  price: number
  iconHash?: string
  creatorId: string
  createdAt: string
  rarity: 'uncommon' | 'rare' | 'epic' | 'legendary'
  tradeable: boolean
}
```

#### `InventoryItem`

```typescript
interface InventoryItem {
  item: Item
  quantity: number
  acquiredAt: string
  metadata?: Record<string, any>
}
```

#### `Trade`

```typescript
interface Trade {
  tradeId: string
  initiatorId: string
  recipientId: string
  status: 'pending' | 'approved' | 'cancelled' | 'completed'
  initiatorItems: TradeItem[]
  recipientItems: TradeItem[]
  createdAt: string
  expiresAt: string
}
```

#### `Studio`

```typescript
interface Studio {
  studioId: string
  name: string
  description?: string
  ownerId: string
  members: string[]
  createdAt: string
  games: string[]
}
```

#### `Lobby`

```typescript
interface Lobby {
  lobbyId: string
  gameId?: string
  hostId: string
  players: string[]
  maxPlayers: number
  isPrivate: boolean
  createdAt: string
  status: 'waiting' | 'in_game' | 'finished'
}
```

### Request/Response Types

#### `CreateItemRequest`

```typescript
interface CreateItemRequest {
  name: string
  description: string
  price: number
  iconHash?: string
  rarity?: 'uncommon' | 'rare' | 'epic' | 'legendary'
  tradeable?: boolean
}
```

#### `TradeItemData`

```typescript
interface TradeItemData {
  itemId: string
  amount: number
  metadata?: Record<string, any>
}
```

#### `PurchaseResult`

```typescript
interface PurchaseResult {
  success: boolean
  message: string
  transactionId?: string
  newBalance?: number
}
```

## Error Handling

All API methods return Promises and may throw errors. Always wrap calls in try/catch blocks:

```typescript
try {
  const user = await api.users.getMe()
  console.log(`Welcome, ${user.username}!`)
} catch (error) {
  if (error.message === 'Token is required') {
    console.error('Authentication required')
  } else if (error.message === 'User not found') {
    console.error('User does not exist')
  } else {
    console.error('API Error:', error.message)
  }
}
```

### Common Error Types

| Error Message          | Description              | Solution                    |
| ---------------------- | ------------------------ | --------------------------- |
| `Token is required`    | Authentication required  | Provide valid API token     |
| `Invalid token`        | Token expired or invalid | Refresh or regenerate token |
| `User not found`       | User ID does not exist   | Verify user ID              |
| `Item not found`       | Item ID does not exist   | Verify item ID              |
| `Insufficient balance` | Not enough credits       | Add credits to account      |
| `Rate limit exceeded`  | Too many requests        | Implement rate limiting     |
| `Permission denied`    | Insufficient permissions | Check token permissions     |

## Platform Integration

### Node.js Environment

```typescript
// Install fetch polyfill if using Node.js < 18
import fetch from 'node-fetch'
if (!globalThis.fetch) {
  globalThis.fetch = fetch
}

import { CroissantAPI } from './croissant-api'

const api = new CroissantAPI({
  token: process.env.CROISSANT_API_TOKEN
})

// Example: Game server integration
async function handlePlayerLogin(playerId: string) {
  try {
    const user = await api.users.getUser(playerId)
    const inventory = await api.inventory.get(playerId)

    return {
      username: user.username,
      verified: user.verified,
      items: inventory.map((item) => ({
        id: item.item.itemId,
        name: item.item.name,
        quantity: item.quantity
      }))
    }
  } catch (error) {
    console.error('Login failed:', error.message)
    return null
  }
}
```

### Browser Environment

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Croissant Game Client</title>
  </head>
  <body>
    <script type="module">
      import { CroissantAPI } from './croissant-api.js'

      // Initialize with token from localStorage
      const api = new CroissantAPI({
        token: localStorage.getItem('croissant_token')
      })

      async function loadUserProfile() {
        try {
          const user = await api.users.getMe()
          document.getElementById('username').textContent = user.username
          document.getElementById('balance').textContent = user.balance
        } catch (error) {
          console.error('Failed to load profile:', error.message)
        }
      }

      // Load profile on page load
      if (localStorage.getItem('croissant_token')) {
        loadUserProfile()
      }
    </script>
  </body>
</html>
```

### React Integration

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CroissantAPI } from './croissant-api';

// Create API context
const CroissantContext = createContext<CroissantAPI | null>(null);

// Provider component
export function CroissantProvider({ children, token }: { children: React.ReactNode, token?: string }) {
  const [api] = useState(() => new CroissantAPI({ token }));

  return (
    <CroissantContext.Provider value={api}>
      {children}
    </CroissantContext.Provider>
  );
}

// Hook for using the API
export function useCroissantAPI() {
  const context = useContext(CroissantContext);
  if (!context) {
    throw new Error('useCroissantAPI must be used within CroissantProvider');
  }
  return context;
}

// Example component
function GamesList() {
  const api = useCroissantAPI();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.games.list()
      .then(setGames)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [api]);

  if (loading) return <div>Loading games...</div>;

  return (
    <div>
      {games.map(game => (
        <div key={game.gameId}>
          <h3>{game.name}</h3>
          <p>{game.description}</p>
          <span>{game.price} credits</span>
        </div>
      ))}
    </div>
  );
}
```

### Vue.js Integration

```typescript
// composables/useCroissantAPI.ts
import { ref, reactive } from 'vue'
import { CroissantAPI } from './croissant-api'

const api = new CroissantAPI({ token: localStorage.getItem('croissant_token') })

export function useCroissantAPI() {
  return api
}

export function useGames() {
  const games = ref([])
  const loading = ref(false)
  const error = ref(null)

  const loadGames = async () => {
    loading.value = true
    error.value = null

    try {
      games.value = await api.games.list()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    games,
    loading,
    error,
    loadGames
  }
}
```

```vue
<!-- GamesList.vue -->
<template>
  <div>
    <h2>Available Games</h2>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-for="game in games" :key="game.gameId" class="game-card">
        <h3>{{ game.name }}</h3>
        <p>{{ game.description }}</p>
        <span class="price">{{ game.price }} credits</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useGames } from '@/composables/useCroissantAPI'

const { games, loading, error, loadGames } = useGames()

onMounted(() => {
  loadGames()
})
</script>
```

## Examples

### Complete Game Store Implementation

```typescript
import { CroissantAPI } from './croissant-api'

class GameStore {
  private api: CroissantAPI

  constructor(token?: string) {
    this.api = new CroissantAPI({ token })
  }

  // Browse games with filters
  async browseGames(
    filters: {
      search?: string
      maxPrice?: number
      minRating?: number
    } = {}
  ) {
    try {
      let games = await this.api.games.list()

      if (filters.search) {
        games = await this.api.games.search(filters.search)
      }

      if (filters.maxPrice) {
        games = games.filter((game) => game.price <= filters.maxPrice)
      }

      if (filters.minRating) {
        games = games.filter((game) => game.rating >= filters.minRating)
      }

      return games
    } catch (error) {
      throw new Error(`Failed to browse games: ${error.message}`)
    }
  }

  // Purchase game with balance check
  async purchaseGame(gameId: string) {
    try {
      // Get game details
      const game = await this.api.games.get(gameId)

      // Check user balance
      const user = await this.api.users.getMe()

      if (!user.balance || user.balance < game.price) {
        throw new Error('Insufficient balance')
      }

      // In a real implementation, you'd have a purchase endpoint
      // For now, this is conceptual
      console.log(`Purchasing ${game.name} for ${game.price} credits`)

      return {
        success: true,
        game,
        newBalance: user.balance - game.price
      }
    } catch (error) {
      throw new Error(`Purchase failed: ${error.message}`)
    }
  }

  // Get user's game library
  async getLibrary() {
    try {
      return await this.api.games.getMyOwnedGames()
    } catch (error) {
      throw new Error(`Failed to load library: ${error.message}`)
    }
  }
}

// Usage
const store = new GameStore('your_token_here')

// Browse and purchase
const games = await store.browseGames({ search: 'adventure', maxPrice: 50 })
console.log(`Found ${games.length} adventure games under 50 credits`)

try {
  const result = await store.purchaseGame('game_123')
  console.log('Purchase successful!', result)
} catch (error) {
  console.error('Purchase failed:', error.message)
}
```

### Trading System Implementation

```typescript
import { CroissantAPI } from './croissant-api'

class TradingSystem {
  private api: CroissantAPI

  constructor(token: string) {
    this.api = new CroissantAPI({ token })
  }

  // Initiate a trade with another player
  async createTrade(targetUserId: string, offer: { itemId: string; amount: number }[]) {
    try {
      // Start trade
      const trade = await this.api.trades.startOrGetPending(targetUserId)

      // Add items to trade
      for (const item of offer) {
        await this.api.trades.addItem(trade.tradeId, {
          itemId: item.itemId,
          amount: item.amount,
          metadata: {}
        })
      }

      return trade
    } catch (error) {
      throw new Error(`Failed to create trade: ${error.message}`)
    }
  }

  // Get all pending trades
  async getPendingTrades() {
    try {
      // This would require an endpoint to list user's trades
      // For demonstration purposes
      console.log('Getting pending trades...')
      return []
    } catch (error) {
      throw new Error(`Failed to get trades: ${error.message}`)
    }
  }

  // Complete a trade
  async completeTrade(tradeId: string) {
    try {
      const result = await this.api.trades.approve(tradeId)

      if (result.success) {
        console.log('Trade completed successfully!')
        return result
      } else {
        throw new Error(result.message || 'Trade approval failed')
      }
    } catch (error) {
      throw new Error(`Failed to complete trade: ${error.message}`)
    }
  }
}

// Usage
const trading = new TradingSystem('your_token_here')

// Create a trade offer
const trade = await trading.createTrade('other_player_id', [
  { itemId: 'sword_123', amount: 1 },
  { itemId: 'potion_456', amount: 5 }
])

console.log(`Trade created: ${trade.tradeId}`)
```

## Best Practices

### Rate Limiting

```typescript
class RateLimitedAPI {
  private api: CroissantAPI
  private lastRequest: number = 0
  private minInterval: number = 100 // ms between requests

  constructor(token?: string) {
    this.api = new CroissantAPI({ token })
  }

  private async throttle() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequest

    if (timeSinceLastRequest < this.minInterval) {
      await new Promise((resolve) => setTimeout(resolve, this.minInterval - timeSinceLastRequest))
    }

    this.lastRequest = Date.now()
  }

  async safeRequest<T>(request: () => Promise<T>): Promise<T> {
    await this.throttle()
    return request()
  }
}
```

### Caching Strategy

```typescript
class CachedCroissantAPI {
  private api: CroissantAPI
  private cache: Map<string, { data: any; expires: number }> = new Map()
  private cacheTimeout: number = 5 * 60 * 1000 // 5 minutes

  constructor(token?: string) {
    this.api = new CroissantAPI({ token })
  }

  private getCacheKey(method: string, ...args: any[]): string {
    return `${method}:${JSON.stringify(args)}`
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() > timestamp
  }

  async getCachedGames(): Promise<Game[]> {
    const key = this.getCacheKey('games.list')
    const cached = this.cache.get(key)

    if (cached && !this.isExpired(cached.expires)) {
      return cached.data
    }

    const games = await this.api.games.list()
    this.cache.set(key, {
      data: games,
      expires: Date.now() + this.cacheTimeout
    })

    return games
  }
}
```

### Environment Configuration

```typescript
// config.ts
interface CroissantConfig {
  apiToken?: string
  baseUrl?: string
  timeout?: number
  retryAttempts?: number
}

function createConfiguredAPI(): CroissantAPI {
  const config: CroissantConfig = {
    apiToken: process.env.CROISSANT_API_TOKEN || process.env.NEXT_PUBLIC_CROISSANT_TOKEN || localStorage?.getItem('croissant_token'),
    timeout: 10000,
    retryAttempts: 3
  }

  if (!config.apiToken) {
    console.warn('No Croissant API token found')
  }

  return new CroissantAPI({ token: config.apiToken })
}

export const api = createConfiguredAPI()
```

## Support and Resources

### Documentation

- **API Reference**: [croissant-api.eminium.ovh/api-docs](https://croissant-api.eminium.ovh/api-docs)
- **Platform Guide**: [croissant-api.eminium.ovh/docs](https://croissant-api.eminium.ovh/docs)
- **Developer Portal**: [croissant-api.eminium.ovh/developers](https://croissant-api.eminium.ovh/developers)

### Community

- **Discord Server**: [discord.gg/PjhRBDYZ3p](https://discord.gg/PjhRBDYZ3p)
- **Community Forum**: Available on the main website
- **GitHub Issues**: Report library-specific issues

### Professional Support

- **Enterprise Support**: Available for commercial applications
- **Custom Integration**: Professional services available
- **Priority Support**: Available for verified developers

### Getting Help

1. **Check Documentation**: Most questions are answered in the API docs
2. **Search Community**: Check Discord and forums for similar issues
3. **Create Support Ticket**: Use the support system on the website
4. **Report Bugs**: Use appropriate channels for library or API bugs

## License

This library is provided under the Croissant Platform License. By using this library, you agree to:

- Use the library only with the official Croissant API
- Not reverse engineer or modify the library
- Follow platform terms of service and community guidelines
- Respect rate limits and usage guidelines

For complete terms, visit [croissant-api.eminium.ovh/terms](https://croissant-api.eminium.ovh/terms).

## Version Information

- **Library Version**: 1.0.0
- **API Version**: v1
- **Last Updated**: July 2025
- **Minimum Requirements**: ES2020+, Node.js 14+

### Changelog

#### v1.0.0 (July 2025)

- Initial release
- Complete API coverage
- TypeScript support
- Full documentation

---

_Built with ❤️ for the Croissant gaming community_
