# Croissant API Client Library - Python

A comprehensive Python client library for the Croissant gaming platform API. This library provides a fully typed interface for all platform features including user management, game operations, inventory, trading, and more.

## Installation

### Direct Download

Download the library directly from the Croissant platform:

- **Python**: [croissant_api.py](https://croissant-api.eminium.ovh/downloadables/sdk-python/croissant_api.py)

### Add Dependencies

Add the following dependencies to your `requirements.txt` or install via pip:

```bash
pip install requests
pip install dataclasses  # Python < 3.7 only
```

### Import in your project

```python
from croissant_api import CroissantAPI
```

## Requirements

- **Python**: 3.7+
- **Dependencies**: requests, dataclasses (built-in for Python 3.7+)
- **Type Hints**: Full typing support included

## Getting Started

### Basic Initialization

```python
from croissant_api import CroissantAPI

# Public access (read-only operations)
api = CroissantAPI()

# Authenticated access (full functionality)
api = CroissantAPI(token='your_api_token')
```

### Authentication

To perform authenticated operations, you need an API token:

1. **Via Web Dashboard**: Login to [croissant-api.eminium.ovh](https://croissant-api.eminium.ovh) and generate a token
2. **Via OAuth2**: Implement OAuth2 flow for third-party applications
3. **Via Bot Token**: Use dedicated bot tokens for automated systems

```python
import os

# Environment variable (recommended)
api = CroissantAPI(token=os.getenv('CROISSANT_API_TOKEN'))

# Or directly
api = CroissantAPI(token='your_token_here')
```

## API Reference

### Core Structure

#### `CroissantAPI`

Main API client class providing access to all platform modules.

**Constructor**

```python
def __init__(self, token: Optional[str] = None)
```

**Available modules**

- User management
- Game discovery and management
- Inventory operations
- Item management and marketplace
- Studio and team management
- Game lobby operations
- Trading system
- OAuth2 authentication

---

### Users Module

#### `get_me() -> User`

Retrieve the authenticated user's profile.

```python
user = api.get_me()  # Requires authentication
print(f"Welcome, {user.username}!")
```

#### `search_users(query: str) -> List[User]`

Search for users by username.

```python
users = api.search_users('john')
for user in users:
    print(f"Found user: {user.username}")
```

#### `get_user(user_id: str) -> User`

Get a specific user by ID (supports Croissant ID, Discord ID, Google ID, or Steam ID).

```python
user = api.get_user('user_12345')
print(f"User: {user.username}")
```

#### `transfer_credits(target_user_id: str, amount: float) -> dict`

Transfer credits to another user.

```python
result = api.transfer_credits('user_67890', 100.0)
print(f"Transfer completed: {result}")
```

#### `verify_user(user_id: str, verification_key: str) -> dict`

Verify a user account.

```python
result = api.verify_user('user_id', 'verification_key')
```

---

### Games Module

#### `list_games() -> List[Game]`

List all available games.

```python
games = api.list_games()
print(f"Available games: {len(games)}")
```

#### `search_games(query: str) -> List[Game]`

Search games by name, genre, or description.

```python
games = api.search_games('adventure platformer')
for game in games:
    print(f"Found game: {game.name} - {game.description}")
```

#### `get_game(game_id: str) -> Game`

Get detailed information about a specific game.

```python
game = api.get_game('game_abc123')
print(f"Game: {game.name} - Price: {game.price}")
```

#### `get_my_created_games() -> List[Game]`

Get games created by the authenticated user.

```python
my_games = api.get_my_created_games()  # Requires authentication
```

#### `get_my_owned_games() -> List[Game]`

Get games owned by the authenticated user.

```python
owned_games = api.get_my_owned_games()  # Requires authentication
```

---

### Items Module

#### `list_items() -> List[Item]`

List all available items in the marketplace.

```python
items = api.list_items()
print(f"Available items: {len(items)}")
```

#### `search_items(query: str) -> List[Item]`

Search items by name or description.

```python
items = api.search_items('magic sword')
for item in items:
    print(f"Found item: {item.name} - Price: {item.price}")
```

#### `get_item(item_id: str) -> Item`

Get detailed information about a specific item.

```python
item = api.get_item('item_xyz789')
print(f"Item: {item.name} - {item.description}")
```

#### `get_my_items() -> List[Item]`

Get items owned by the authenticated user.

```python
my_items = api.get_my_items()  # Requires authentication
```

#### `create_item(item_data: dict) -> dict`

Create a new item for sale.

```python
item_data = {
    'name': 'Enchanted Shield',
    'description': 'Provides magical protection',
    'price': 150.0,
    'iconHash': 'optional_hash'
}

result = api.create_item(item_data)  # Requires authentication
```

#### `update_item(item_id: str, item_data: dict) -> dict`

Update an existing item.

```python
updates = {'price': 125.0, 'description': 'Updated description'}
result = api.update_item('item_xyz789', updates)  # Requires authentication
```

#### `delete_item(item_id: str) -> dict`

Delete an item.

```python
result = api.delete_item('item_xyz789')  # Requires authentication
```

#### `buy_item(item_id: str, amount: int) -> dict`

Purchase items from the marketplace.

```python
result = api.buy_item('item_xyz789', 2)  # Requires authentication
print(f"Purchase completed: {result}")
```

#### `sell_item(item_id: str, amount: int) -> dict`

Sell items from inventory.

```python
result = api.sell_item('item_xyz789', 1)  # Requires authentication
```

#### `give_item(item_id: str, amount: int, user_id: str, metadata: Optional[dict] = None) -> dict`

Give items to another user.

```python
metadata = {'enchantment': 'fire', 'level': 5}
result = api.give_item('item_xyz789', 1, 'user_67890', metadata)  # Requires authentication
```

#### `consume_item(item_id: str, params: dict) -> dict`

Consume specific item instances with parameters.

```python
params = {'amount': 1, 'uniqueId': 'instance_123'}
result = api.consume_item('item_xyz789', params)  # Requires authentication
```

#### `drop_item(item_id: str, params: dict) -> dict`

Drop specific item instances with parameters.

```python
params = {'amount': 1, 'uniqueId': 'instance_123'}
result = api.drop_item('item_xyz789', params)  # Requires authentication
```

#### `update_item_metadata(item_id: str, unique_id: str, metadata: dict) -> dict`

Update metadata for a specific item instance.

```python
metadata = {'enchantment': 'ice', 'level': 10}
result = api.update_item_metadata('item_xyz789', 'instance_123', metadata)  # Requires authentication
```

---

### Inventory Module

#### `get_my_inventory() -> dict`

Get the authenticated user's inventory.

```python
inventory = api.get_my_inventory()  # Requires authentication
print(f"Inventory: {inventory}")
```

#### `get_inventory(user_id: str) -> dict`

Get another user's public inventory.

```python
user_inventory = api.get_inventory('user_12345')
```

---

### Studios Module

#### `create_studio(studio_name: str) -> dict`

Create a new development studio.

```python
result = api.create_studio('Awesome Games Studio')  # Requires authentication
```

#### `get_studio(studio_id: str) -> Studio`

Get information about a specific studio.

```python
studio = api.get_studio('studio_abc123')
print(f"Studio: {studio.username}")
```

#### `get_my_studios() -> List[Studio]`

Get studios the authenticated user is part of.

```python
my_studios = api.get_my_studios()  # Requires authentication
```

#### `add_user_to_studio(studio_id: str, user_id: str) -> dict`

Add a user to a studio team.

```python
result = api.add_user_to_studio('studio_abc123', 'user_67890')  # Requires authentication
```

#### `remove_user_from_studio(studio_id: str, user_id: str) -> dict`

Remove a user from a studio team.

```python
result = api.remove_user_from_studio('studio_abc123', 'user_67890')  # Requires authentication
```

---

### Lobbies Module

#### `create_lobby() -> dict`

Create a new game lobby.

```python
result = api.create_lobby()  # Requires authentication
print(f"Lobby created: {result}")
```

#### `get_lobby(lobby_id: str) -> Lobby`

Get information about a specific lobby.

```python
lobby = api.get_lobby('lobby_xyz789')
print(f"Lobby: {len(lobby.users)} players")
```

#### `get_my_lobby() -> Lobby`

Get the authenticated user's current lobby.

```python
my_lobby = api.get_my_lobby()  # Requires authentication
```

#### `get_user_lobby(user_id: str) -> Lobby`

Get the lobby a specific user is in.

```python
user_lobby = api.get_user_lobby('user_12345')
```

#### `join_lobby(lobby_id: str) -> dict`

Join an existing lobby.

```python
result = api.join_lobby('lobby_xyz789')  # Requires authentication
```

#### `leave_lobby(lobby_id: str) -> dict`

Leave a lobby.

```python
result = api.leave_lobby('lobby_xyz789')  # Requires authentication
```

---

### Trading Module

#### `start_or_get_pending_trade(user_id: str) -> Trade`

Start a new trade or get existing pending trade with a user.

```python
trade = api.start_or_get_pending_trade('user_67890')  # Requires authentication
print(f"Trade ID: {trade.id}")
```

#### `get_trade(trade_id: str) -> Trade`

Get information about a specific trade.

```python
trade = api.get_trade('trade_abc123')
print(f"Trade status: {trade.status}")
```

#### `get_user_trades(user_id: str) -> List[Trade]`

Get all trades for a specific user.

```python
user_trades = api.get_user_trades('user_12345')  # Requires authentication
```

#### `add_item_to_trade(trade_id: str, trade_item: dict) -> dict`

Add an item to a trade.

```python
trade_item = {
    'itemId': 'item_xyz789',
    'amount': 1,
    'metadata': {'enchantment': 'fire'}
}

result = api.add_item_to_trade('trade_abc123', trade_item)  # Requires authentication
```

#### `remove_item_from_trade(trade_id: str, trade_item: dict) -> dict`

Remove an item from a trade.

```python
trade_item = {
    'itemId': 'item_xyz789',
    'amount': 1
}

result = api.remove_item_from_trade('trade_abc123', trade_item)  # Requires authentication
```

#### `approve_trade(trade_id: str) -> dict`

Approve and execute a trade.

```python
result = api.approve_trade('trade_abc123')  # Requires authentication
```

#### `cancel_trade(trade_id: str) -> dict`

Cancel a pending trade.

```python
result = api.cancel_trade('trade_abc123')  # Requires authentication
```

---

### OAuth2 Module

#### `create_oauth2_app(name: str, redirect_urls: List[str]) -> dict`

Create a new OAuth2 application.

```python
redirect_urls = ['https://mygame.com/auth/callback']
result = api.create_oauth2_app('My Game Client', redirect_urls)  # Requires authentication
```

#### `get_oauth2_app(client_id: str) -> OAuth2App`

Get OAuth2 application by client ID.

```python
app = api.get_oauth2_app('client_12345')
```

#### `get_my_oauth2_apps() -> List[OAuth2App]`

Get OAuth2 applications owned by the authenticated user.

```python
apps = api.get_my_oauth2_apps()  # Requires authentication
```

#### `update_oauth2_app(client_id: str, data: dict) -> dict`

Update an OAuth2 application.

```python
updates = {'name': 'Updated App Name'}
result = api.update_oauth2_app('client_12345', updates)  # Requires authentication
```

#### `delete_oauth2_app(client_id: str) -> dict`

Delete an OAuth2 application.

```python
result = api.delete_oauth2_app('client_12345')  # Requires authentication
```

#### `authorize(client_id: str, redirect_uri: str) -> dict`

Authorize a user for an OAuth2 app.

```python
result = api.authorize('client_12345', 'https://app.com/callback')  # Requires authentication
```

#### `get_user_by_code(code: str, client_id: str) -> User`

Get user information using OAuth2 authorization code.

```python
user_data = api.get_user_by_code('auth_code', 'client_12345')
```

## Data Classes

### Core Data Classes

#### `User`

```python
@dataclass
class User:
    userId: str
    username: str
    email: Optional[str] = None
    verified: bool = False
    studios: Optional[List[dict]] = None
    roles: Optional[List[str]] = None
    inventory: Optional[List[dict]] = None
    ownedItems: Optional[List[dict]] = None
    createdGames: Optional[List[Game]] = None
    verificationKey: Optional[str] = None
    steam_id: Optional[str] = None
    steam_username: Optional[str] = None
    steam_avatar_url: Optional[str] = None
    isStudio: Optional[bool] = None
    admin: Optional[bool] = None
    disabled: Optional[bool] = None
    google_id: Optional[str] = None
    discord_id: Optional[str] = None
    balance: Optional[float] = None
    haveAuthenticator: Optional[bool] = None
```

#### `Game`

```python
@dataclass
class Game:
    gameId: str
    name: str
    description: str
    price: float
    owner_id: str
    showInStore: bool
    iconHash: Optional[str] = None
    splashHash: Optional[str] = None
    bannerHash: Optional[str] = None
    genre: Optional[str] = None
    release_date: Optional[str] = None
    developer: Optional[str] = None
    publisher: Optional[str] = None
    platforms: Optional[List[str]] = None
    rating: float = 0.0
    website: Optional[str] = None
    trailer_link: Optional[str] = None
    multiplayer: bool = False
    download_link: Optional[str] = None
```

#### `Item`

```python
@dataclass
class Item:
    itemId: str
    name: str
    description: str
    owner: str
    price: float
    iconHash: str
    showInStore: Optional[bool] = None
    deleted: Optional[bool] = None
```

#### `InventoryItem`

```python
@dataclass
class InventoryItem:
    user_id: Optional[str] = None
    item_id: Optional[str] = None
    amount: int = 0
    metadata: Optional[Dict[str, Any]] = None
    itemId: str = ''
    name: str = ''
    description: str = ''
    iconHash: str = ''
    price: float = 0.0
    owner: str = ''
    showInStore: bool = False
```

#### `Trade`

```python
@dataclass
class Trade:
    id: str
    fromUserId: str
    toUserId: str
    fromUserItems: List[dict]
    toUserItems: List[dict]
    approvedFromUser: bool
    approvedToUser: bool
    status: str
    createdAt: str
    updatedAt: str
```

#### `Studio`

```python
@dataclass
class Studio:
    user_id: str
    username: str
    verified: bool
    admin_id: str
    isAdmin: Optional[bool] = None
    apiKey: Optional[str] = None
    users: Optional[List[dict]] = None
```

#### `Lobby`

```python
@dataclass
class Lobby:
    lobbyId: str
    users: List[dict]
```

#### `OAuth2App`

```python
@dataclass
class OAuth2App:
    client_id: str
    client_secret: str
    name: str
    redirect_urls: List[str]
```

## Error Handling

All API methods may raise exceptions. Always wrap calls in try/except blocks:

```python
try:
    user = api.get_me()
    print(f"Welcome, {user.username}!")
except Exception as e:
    print(f"API Error: {e}")

    if 'Token is required' in str(e):
        print("Authentication required")
    elif '404' in str(e):
        print("Resource not found")
    elif '401' in str(e):
        print("Unauthorized - check token")
    elif '403' in str(e):
        print("Forbidden - insufficient permissions")
    else:
        print("Unknown error occurred")
```

### Common Error Types

| Error Pattern       | Description                      | Solution                    |
| ------------------- | -------------------------------- | --------------------------- |
| "Token is required" | Authentication required          | Provide valid API token     |
| HTTP 401            | Invalid or expired token         | Refresh or regenerate token |
| HTTP 404            | Resource not found               | Verify resource ID          |
| HTTP 400            | Bad request/insufficient balance | Check request parameters    |
| HTTP 429            | Rate limit exceeded              | Implement rate limiting     |
| HTTP 403            | Permission denied                | Check token permissions     |

## Platform Integration

### Django Integration

```python
# settings.py
CROISSANT_API_TOKEN = os.environ.get('CROISSANT_API_TOKEN')

# services/croissant_service.py
from django.conf import settings
from croissant_api import CroissantAPI

class CroissantService:
    def __init__(self):
        self.api = CroissantAPI(token=settings.CROISSANT_API_TOKEN)

    def handle_player_login(self, player_id):
        try:
            user = self.api.get_user(player_id)
            inventory = self.api.get_inventory(player_id)

            return {
                'username': user.username,
                'verified': user.verified,
                'items': [
                    {
                        'id': item.get('itemId'),
                        'name': item.get('name'),
                        'quantity': item.get('amount', 0)
                    }
                    for item in inventory.get('items', [])
                ]
            }
        except Exception as e:
            print(f"Croissant API Error: {e}")
            return None

    def give_reward(self, player_id, item_id, amount):
        try:
            self.api.give_item(item_id, amount, player_id)
            print(f"Reward given to {player_id}: {item_id} x{amount}")
            return True
        except Exception as e:
            print(f"Failed to give reward: {e}")
            return False

# views.py
from django.http import JsonResponse
from django.views import View
from .services.croissant_service import CroissantService

class PlayerLoginView(View):
    def post(self, request):
        player_id = request.POST.get('player_id')
        service = CroissantService()
        player_data = service.handle_player_login(player_id)

        if player_data:
            return JsonResponse(player_data)
        else:
            return JsonResponse({'error': 'Login failed'}, status=401)
```

### Flask Integration

```python
from flask import Flask, request, jsonify
from croissant_api import CroissantAPI
import os

app = Flask(__name__)

# Initialize API
api = CroissantAPI(token=os.getenv('CROISSANT_API_TOKEN'))

def handle_api_error(func):
    """Decorator for handling API errors"""
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            app.logger.error(f"Croissant API Error: {e}")
            return jsonify({'error': str(e)}), 500
    wrapper.__name__ = func.__name__
    return wrapper

@app.route('/api/user/<user_id>')
@handle_api_error
def get_user(user_id):
    user = api.get_user(user_id)
    return jsonify({
        'userId': user.userId,
        'username': user.username,
        'verified': user.verified
    })

@app.route('/api/games')
@handle_api_error
def list_games():
    games = api.list_games()
    return jsonify([{
        'gameId': game.gameId,
        'name': game.name,
        'description': game.description,
        'price': game.price
    } for game in games])

@app.route('/api/items/<item_id>/buy', methods=['POST'])
@handle_api_error
def buy_item(item_id):
    data = request.get_json()
    amount = data.get('amount', 1)
    result = api.buy_item(item_id, amount)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
```

### FastAPI Integration

```python
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from croissant_api import CroissantAPI
import os

app = FastAPI()

# Initialize API
api = CroissantAPI(token=os.getenv('CROISSANT_API_TOKEN'))

class PurchaseRequest(BaseModel):
    amount: int

class UserResponse(BaseModel):
    userId: str
    username: str
    verified: bool

async def get_croissant_api():
    return api

@app.get("/api/user/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, api: CroissantAPI = Depends(get_croissant_api)):
    try:
        user = api.get_user(user_id)
        return UserResponse(
            userId=user.userId,
            username=user.username,
            verified=user.verified
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/games")
async def list_games(api: CroissantAPI = Depends(get_croissant_api)):
    try:
        games = api.list_games()
        return [
            {
                'gameId': game.gameId,
                'name': game.name,
                'description': game.description,
                'price': game.price
            }
            for game in games
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/items/{item_id}/buy")
async def buy_item(
    item_id: str,
    purchase: PurchaseRequest,
    api: CroissantAPI = Depends(get_croissant_api)
):
    try:
        result = api.buy_item(item_id, purchase.amount)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

### Game Server Implementation

```python
import asyncio
from croissant_api import CroissantAPI

class GameServer:
    def __init__(self, api_token):
        self.api = CroissantAPI(token=api_token)
        self.players = {}

    def handle_player_join(self, player_id):
        try:
            user = self.api.get_user(player_id)
            inventory = self.api.get_inventory(player_id)

            self.players[player_id] = {
                'username': user.username,
                'verified': user.verified,
                'items': [item.get('itemId') for item in inventory.get('items', [])]
            }

            print(f"Player joined: {user.username}")
            return True
        except Exception as e:
            print(f"Failed to load player {player_id}: {e}")
            return False

    def give_quest_reward(self, player_id, quest_id):
        rewards = self.get_quest_rewards(quest_id)

        for reward in rewards:
            try:
                self.api.give_item(reward['item_id'], reward['amount'], player_id)
                print(f"Gave {reward['amount']}x {reward['item_id']} to {player_id}")
            except Exception as e:
                print(f"Failed to give reward: {e}")

    def handle_player_trade(self, from_player_id, to_player_id, items):
        try:
            trade = self.api.start_or_get_pending_trade(to_player_id)

            for item in items:
                trade_item = {
                    'itemId': item['id'],
                    'amount': item['amount']
                }
                self.api.add_item_to_trade(trade.id, trade_item)

            print(f"Trade created: {trade.id}")
            return trade.id
        except Exception as e:
            print(f"Trade failed: {e}")
            return None

    def get_quest_rewards(self, quest_id):
        """Define quest rewards"""
        rewards = {
            'quest_1': [
                {'item_id': 'gold_coin', 'amount': 100},
                {'item_id': 'health_potion', 'amount': 5}
            ],
            'quest_2': [
                {'item_id': 'magic_sword', 'amount': 1},
                {'item_id': 'gold_coin', 'amount': 250}
            ]
        }
        return rewards.get(quest_id, [])

# Usage
if __name__ == "__main__":
    server = GameServer(os.getenv('CROISSANT_API_TOKEN'))

    # Handle events
    server.handle_player_join('player_123')
    server.give_quest_reward('player_123', 'quest_1')
    trade_id = server.handle_player_trade('player_123', 'player_456', [
        {'id': 'magic_sword', 'amount': 1}
    ])
```

## Complete Examples

### Complete Game Store Implementation

```python
from croissant_api import CroissantAPI
from typing import List, Optional, Dict, Any

class GameStore:
    def __init__(self, api_token: str):
        self.api = CroissantAPI(token=api_token)

    def browse_games(self, options: Dict[str, Any] = None) -> List[Game]:
        """Browse games with filters"""
        if options is None:
            options = {}

        try:
            if options.get('search'):
                games = self.api.search_games(options['search'])
            else:
                games = self.api.list_games()

            # Apply filters
            if options.get('max_price'):
                games = [game for game in games if game.price <= options['max_price']]

            if options.get('min_rating'):
                games = [game for game in games if game.rating >= options['min_rating']]

            if 'multiplayer' in options:
                games = [game for game in games if game.multiplayer == options['multiplayer']]

            return games
        except Exception as e:
            raise Exception(f"Failed to browse games: {e}")

    def browse_items(self, options: Dict[str, Any] = None) -> List[Item]:
        """Browse items with filters"""
        if options is None:
            options = {}

        try:
            if options.get('search'):
                items = self.api.search_items(options['search'])
            else:
                items = self.api.list_items()

            # Apply filters
            if options.get('max_price'):
                items = [item for item in items if item.price <= options['max_price']]

            # Filter out deleted items
            items = [item for item in items if not getattr(item, 'deleted', False)]

            return items
        except Exception as e:
            raise Exception(f"Failed to browse items: {e}")

    def purchase_item(self, item_id: str, quantity: int) -> Dict[str, Any]:
        """Purchase item with balance check"""
        try:
            # Get item details
            item = self.api.get_item(item_id)

            # Check user balance
            user = self.api.get_me()
            total_cost = item.price * quantity

            if not user.balance or user.balance < total_cost:
                raise Exception('Insufficient balance')

            # Make purchase
            result = self.api.buy_item(item_id, quantity)

            return {
                'success': True,
                'item': item,
                'quantity': quantity,
                'total_cost': total_cost,
                'new_balance': user.balance - total_cost,
                'result': result
            }
        except Exception as e:
            raise Exception(f"Purchase failed: {e}")

    def get_library(self) -> List[Game]:
        """Get user's game library"""
        try:
            return self.api.get_my_owned_games()
        except Exception as e:
            raise Exception(f"Failed to load library: {e}")

    def get_inventory(self) -> dict:
        """Get user's inventory"""
        try:
            return self.api.get_my_inventory()
        except Exception as e:
            raise Exception(f"Failed to load inventory: {e}")

# Usage
if __name__ == "__main__":
    import os

    store = GameStore(os.getenv('CROISSANT_API_TOKEN'))

    try:
        # Browse and purchase
        games = store.browse_games({'search': 'adventure', 'max_price': 50})
        print(f"Found {len(games)} adventure games under 50 credits")

        items = store.browse_items({'search': 'sword', 'max_price': 100})
        print(f"Found {len(items)} swords under 100 credits")

        # Purchase item
        purchase_result = store.purchase_item('item_123', 1)
        print(f"Purchase successful! New balance: {purchase_result['new_balance']}")

    except Exception as e:
        print(f"Error: {e}")
```

### Trading System Implementation

```python
from croissant_api import CroissantAPI, Trade
from typing import List, Dict, Any

class TradingSystem:
    def __init__(self, api_token: str):
        self.api = CroissantAPI(token=api_token)

    def create_trade_offer(self, target_user_id: str, offered_items: List[Dict[str, Any]]) -> Trade:
        """Create a trade offer"""
        try:
            # Start or get pending trade
            trade = self.api.start_or_get_pending_trade(target_user_id)

            # Add items to trade
            for item in offered_items:
                trade_item = {
                    'itemId': item['id'],
                    'amount': item['amount'],
                    'metadata': item.get('metadata', {})
                }

                self.api.add_item_to_trade(trade.id, trade_item)

            print(f"Trade offer created: {trade.id}")
            return trade
        except Exception as e:
            raise Exception(f"Failed to create trade: {e}")

    def get_user_trades(self, user_id: str) -> List[Trade]:
        """Get all user's trades"""
        try:
            return self.api.get_user_trades(user_id)
        except Exception as e:
            raise Exception(f"Failed to get trades: {e}")

    def accept_trade(self, trade_id: str) -> dict:
        """Accept a trade"""
        try:
            result = self.api.approve_trade(trade_id)
            print(f"Trade accepted: {trade_id}")
            return result
        except Exception as e:
            raise Exception(f"Failed to accept trade: {e}")

    def cancel_trade(self, trade_id: str) -> dict:
        """Cancel a trade"""
        try:
            result = self.api.cancel_trade(trade_id)
            print(f"Trade cancelled: {trade_id}")
            return result
        except Exception as e:
            raise Exception(f"Failed to cancel trade: {e}")

    def get_trade_details(self, trade_id: str) -> Trade:
        """Get trade details"""
        try:
            return self.api.get_trade(trade_id)
        except Exception as e:
            raise Exception(f"Failed to get trade details: {e}")

# Usage
if __name__ == "__main__":
    import os

    trading = TradingSystem(os.getenv('CROISSANT_API_TOKEN'))

    try:
        # Create a trade offer
        trade = trading.create_trade_offer('other_player_id', [
            {'id': 'sword_123', 'amount': 1},
            {'id': 'potion_456', 'amount': 5}
        ])

        print(f"Trade created: {trade.id}")

        # List my trades
        my_trades = trading.get_user_trades('my_user_id')
        print(f"I have {len(my_trades)} active trades")

        # Accept a trade (example)
        # trading.accept_trade('trade_id_here')

    except Exception as e:
        print(f"Trading error: {e}")
```

## Best Practices

### Rate Limiting

```python
import time
from croissant_api import CroissantAPI

class RateLimitedAPI:
    def __init__(self, api_token: str):
        self.api = CroissantAPI(token=api_token)
        self.last_request = time.time() - 1
        self.min_interval = 0.1  # 100ms between requests

    def safe_request(self, func, *args, **kwargs):
        """Ensure minimum interval between requests"""
        time_since_last = time.time() - self.last_request
        if time_since_last < self.min_interval:
            time.sleep(self.min_interval - time_since_last)

        self.last_request = time.time()
        return func(*args, **kwargs)

    def get_user(self, user_id: str):
        return self.safe_request(self.api.get_user, user_id)

    def search_items(self, query: str):
        return self.safe_request(self.api.search_items, query)
```

### Caching Strategy

```python
import time
from typing import Dict, Any, Optional
from croissant_api import CroissantAPI

class CachedCroissantAPI:
    def __init__(self, api_token: str):
        self.api = CroissantAPI(token=api_token)
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.cache_timeout = 300  # 5 minutes

    def _is_expired(self, timestamp: float) -> bool:
        return time.time() > timestamp

    def get_cached_games(self):
        cache_key = 'games_list'

        if (cache_key in self.cache and
            not self._is_expired(self.cache[cache_key]['expires'])):
            return self.cache[cache_key]['data']

        games = self.api.list_games()
        self.cache[cache_key] = {
            'data': games,
            'expires': time.time() + self.cache_timeout
        }

        return games

    def get_cached_user(self, user_id: str):
        cache_key = f'user_{user_id}'

        if (cache_key in self.cache and
            not self._is_expired(self.cache[cache_key]['expires'])):
            return self.cache[cache_key]['data']

        user = self.api.get_user(user_id)
        self.cache[cache_key] = {
            'data': user,
            'expires': time.time() + self.cache_timeout
        }

        return user

    def clear_cache(self):
        self.cache.clear()
```

### Environment Configuration

```python
# config.py
import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class CroissantConfig:
    api_token: Optional[str]
    timeout: int
    retry_attempts: int

    @classmethod
    def from_env(cls) -> 'CroissantConfig':
        return cls(
            api_token=os.getenv('CROISSANT_API_TOKEN'),
            timeout=int(os.getenv('CROISSANT_TIMEOUT', '30')),
            retry_attempts=int(os.getenv('CROISSANT_RETRY_ATTEMPTS', '3'))
        )

    def create_api(self) -> CroissantAPI:
        if not self.api_token:
            raise ValueError('CROISSANT_API_TOKEN environment variable is required')

        return CroissantAPI(token=self.api_token)

# Usage
config = CroissantConfig.from_env()
api = config.create_api()
```

### Error Recovery

```python
import time
from croissant_api import CroissantAPI

class ResilientCroissantAPI:
    def __init__(self, api_token: str):
        self.api = CroissantAPI(token=api_token)
        self.max_retries = 3
        self.retry_delay = 1  # seconds

    def with_retry(self, func, *args, **kwargs):
        retries = 0

        while retries <= self.max_retries:
            try:
                return func(*args, **kwargs)
            except Exception as e:
                retries += 1

                if retries <= self.max_retries and self._should_retry(e):
                    print(f"Retry {retries}/{self.max_retries} after error: {e}")
                    time.sleep(self.retry_delay * retries)  # Exponential backoff
                else:
                    raise e

    def _should_retry(self, error: Exception) -> bool:
        """Retry on network errors, timeouts, and 5xx server errors"""
        error_msg = str(error).lower()
        return any(keyword in error_msg for keyword in ['timeout', 'network', '5'])

    def get_user(self, user_id: str):
        return self.with_retry(self.api.get_user, user_id)

    def list_games(self):
        return self.with_retry(self.api.list_games)
```

### Async Support (using aiohttp)

```python
import aiohttp
import asyncio
from dataclasses import dataclass
from typing import Optional, List, Dict, Any

class AsyncCroissantAPI:
    def __init__(self, token: Optional[str] = None):
        self.token = token
        self.base_url = 'https://croissant-api.eminium.ovh/api'

    def _headers(self, content_type: bool = False) -> Dict[str, str]:
        headers = {}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        if content_type:
            headers['Content-Type'] = 'application/json'
        return headers

    async def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"

        async with aiohttp.ClientSession() as session:
            async with session.request(method, url, **kwargs) as response:
                response.raise_for_status()
                return await response.json()

    async def get_user(self, user_id: str) -> Dict[str, Any]:
        return await self._request('GET', f'/users/{user_id}')

    async def list_games(self) -> List[Dict[str, Any]]:
        return await self._request('GET', '/games')

    async def search_items(self, query: str) -> List[Dict[str, Any]]:
        return await self._request('GET', f'/items/search?q={query}')

# Usage
async def main():
    api = AsyncCroissantAPI(token='your_token')

    # Concurrent requests
    user_task = api.get_user('user_123')
    games_task = api.list_games()
    items_task = api.search_items('sword')

    user, games, items = await asyncio.gather(user_task, games_task, items_task)

    print(f"User: {user['username']}")
    print(f"Games: {len(games)}")
    print(f"Items: {len(items)}")

if __name__ == "__main__":
    asyncio.run(main())
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
- Follow the platform's terms of service and community guidelines
- Respect rate limits and usage guidelines

For complete terms, visit [croissant-api.eminium.ovh/terms](https://croissant-api.eminium.ovh/terms).

## Version Information

- **Library Version**: 1.0.0
- **API Version**: v1
- **Last Updated**: July 2025
- **Minimum Requirements**: Python 3.7+

### Changelog

#### v1.0.0 (July 2025)

- Initial release
- Complete API coverage
- Full Python support
- Comprehensive documentation
- Type hints support

---

\*Built with ❤️
