# Croissant API Client Library - PHP

A comprehensive PHP client library for the Croissant gaming platform API. This library provides a fully documented interface for all platform features including user management, game operations, inventory, trading, and more.

## Installation

### Direct Download

Download the library directly from the Croissant platform:

- **PHP**: [croissant_api.php](https://croissant-api.eminium.ovh/downloadables/sdk-php/croissant_api.php)

### Include in your project

```php
<?php
require_once 'croissant_api.php';

// Initialize the API client
$api = new CroissantAPI('your_api_token');
?>
```

## Requirements

- **PHP**: 7.4+
- **Extensions**: json, curl (recommended) or allow_url_fopen enabled
- **Dependencies**: None (uses built-in PHP functions)

## Getting Started

### Basic Initialization

```php
<?php
require_once 'croissant_api.php';

// Public access (read-only operations)
$api = new CroissantAPI();

// Authenticated access (full functionality)
$api = new CroissantAPI('your_api_token');
?>
```

### Authentication

To perform authenticated operations, you need an API token:

1. **Via Web Dashboard**: Login to [croissant-api.eminium.ovh](https://croissant-api.eminium.ovh) and generate a token
2. **Via OAuth2**: Implement OAuth2 flow for third-party applications
3. **Via Bot Token**: Use dedicated bot tokens for automated systems

```php
<?php
// Environment variable (recommended)
$api = new CroissantAPI($_ENV['CROISSANT_API_TOKEN'] ?? null);

// Or directly
$api = new CroissantAPI('your_token_here');
?>
```

## API Reference

### Core Structure

#### `CroissantAPI`

Main API client class providing access to all platform modules.

**Constructor**

```php
public function __construct($token = null)
```

**Available methods**

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

#### `getMe(): array`

Retrieve the authenticated user's profile.

```php
$user = $api->getMe(); // Requires authentication
echo "Welcome, " . $user['username'] . "!";
```

#### `searchUsers(string $query): array`

Search for users by username.

```php
$users = $api->searchUsers('john');
foreach ($users as $user) {
    echo "Found user: " . $user['username'] . "\n";
}
```

#### `getUser(string $userId): array`

Get a specific user by ID.

```php
$user = $api->getUser('user_12345');
echo "User: " . $user['username'];
```

#### `transferCredits(string $targetUserId, int $amount): array`

Transfer credits to another user.

```php
$result = $api->transferCredits('user_67890', 100);
echo "Transfer completed: " . json_encode($result);
```

#### `verifyUser(string $userId, string $verificationKey): array`

Verify a user account.

```php
$result = $api->verifyUser('user_id', 'verification_key');
```

---

### Games Module

#### `listGames(): array`

List all available games.

```php
$games = $api->listGames();
echo "Available games: " . count($games);
```

#### `searchGames(string $query): array`

Search games by name, genre, or description.

```php
$games = $api->searchGames('adventure platformer');
foreach ($games as $game) {
    echo "Found game: " . $game['name'] . " - " . $game['description'] . "\n";
}
```

#### `getGame(string $gameId): array`

Get detailed information about a specific game.

```php
$game = $api->getGame('game_abc123');
echo "Game: " . $game['name'] . " - Price: " . $game['price'];
```

#### `getMyCreatedGames(): array`

Get games created by the authenticated user.

```php
$myGames = $api->getMyCreatedGames(); // Requires authentication
```

#### `getMyOwnedGames(): array`

Get games owned by the authenticated user.

```php
$ownedGames = $api->getMyOwnedGames(); // Requires authentication
```

---

### Items Module

#### `listItems(): array`

List all available items in the marketplace.

```php
$items = $api->listItems();
echo "Available items: " . count($items);
```

#### `searchItems(string $query): array`

Search items by name or description.

```php
$items = $api->searchItems('magic sword');
foreach ($items as $item) {
    echo "Found item: " . $item['name'] . " - Price: " . $item['price'] . "\n";
}
```

#### `getItem(string $itemId): array`

Get detailed information about a specific item.

```php
$item = $api->getItem('item_xyz789');
echo "Item: " . $item['name'] . " - " . $item['description'];
```

#### `getMyItems(): array`

Get items owned by the authenticated user.

```php
$myItems = $api->getMyItems(); // Requires authentication
```

#### `createItem(array $itemData): array`

Create a new item for sale.

```php
$itemData = [
    'name' => 'Enchanted Shield',
    'description' => 'Provides magical protection',
    'price' => 150,
    'iconHash' => 'optional_hash'
];

$result = $api->createItem($itemData); // Requires authentication
```

#### `updateItem(string $itemId, array $itemData): array`

Update an existing item.

```php
$updates = [
    'price' => 125,
    'description' => 'Updated description'
];

$result = $api->updateItem('item_xyz789', $updates); // Requires authentication
```

#### `deleteItem(string $itemId): array`

Delete an item.

```php
$result = $api->deleteItem('item_xyz789'); // Requires authentication
```

#### `buyItem(string $itemId, int $amount): array`

Purchase items from the marketplace.

```php
$result = $api->buyItem('item_xyz789', 2); // Requires authentication
echo "Purchase completed: " . json_encode($result);
```

#### `sellItem(string $itemId, int $amount): array`

Sell items from inventory.

```php
$result = $api->sellItem('item_xyz789', 1); // Requires authentication
```

#### `giveItem(string $itemId, int $amount, string $userId, array $metadata = null): array`

Give items to another user.

```php
$metadata = ['enchantment' => 'fire', 'level' => 5];
$result = $api->giveItem('item_xyz789', 1, 'user_67890', $metadata); // Requires authentication
```

#### `consumeItem(string $itemId, array $params): array`

Consume specific item instances with parameters.

```php
$params = ['amount' => 1, 'uniqueId' => 'instance_123'];
$result = $api->consumeItem('item_xyz789', $params); // Requires authentication
```

#### `dropItem(string $itemId, array $params): array`

Drop specific item instances with parameters.

```php
$params = ['amount' => 1, 'uniqueId' => 'instance_123'];
$result = $api->dropItem('item_xyz789', $params); // Requires authentication
```

#### `updateItemMetadata(string $itemId, string $uniqueId, array $metadata): array`

Update metadata for a specific item instance.

```php
$metadata = ['enchantment' => 'ice', 'level' => 10];
$result = $api->updateItemMetadata('item_xyz789', 'instance_123', $metadata); // Requires authentication
```

---

### Inventory Module

#### `getMyInventory(): array`

Get the authenticated user's inventory.

```php
$inventory = $api->getMyInventory(); // Requires authentication
echo "Inventory: " . json_encode($inventory);
```

#### `getInventory(string $userId): array`

Get another user's public inventory.

```php
$userInventory = $api->getInventory('user_12345');
```

---

### Studios Module

#### `createStudio(string $studioName): array`

Create a new development studio.

```php
$result = $api->createStudio('Awesome Games Studio'); // Requires authentication
```

#### `getStudio(string $studioId): array`

Get information about a specific studio.

```php
$studio = $api->getStudio('studio_abc123');
echo "Studio: " . $studio['username'];
```

#### `getMyStudios(): array`

Get studios the authenticated user is part of.

```php
$myStudios = $api->getMyStudios(); // Requires authentication
```

#### `addUserToStudio(string $studioId, string $userId): array`

Add a user to a studio team.

```php
$result = $api->addUserToStudio('studio_abc123', 'user_67890'); // Requires authentication
```

#### `removeUserFromStudio(string $studioId, string $userId): array`

Remove a user from a studio team.

```php
$result = $api->removeUserFromStudio('studio_abc123', 'user_67890'); // Requires authentication
```

---

### Lobbies Module

#### `createLobby(): array`

Create a new game lobby.

```php
$result = $api->createLobby(); // Requires authentication
echo "Lobby created: " . json_encode($result);
```

#### `getLobby(string $lobbyId): array`

Get information about a specific lobby.

```php
$lobby = $api->getLobby('lobby_xyz789');
echo "Lobby: " . count($lobby['users']) . " players";
```

#### `getMyLobby(): array`

Get the authenticated user's current lobby.

```php
$myLobby = $api->getMyLobby(); // Requires authentication
```

#### `getUserLobby(string $userId): array`

Get the lobby a specific user is in.

```php
$userLobby = $api->getUserLobby('user_12345');
```

#### `joinLobby(string $lobbyId): array`

Join an existing lobby.

```php
$result = $api->joinLobby('lobby_xyz789'); // Requires authentication
```

#### `leaveLobby(string $lobbyId): array`

Leave a lobby.

```php
$result = $api->leaveLobby('lobby_xyz789'); // Requires authentication
```

---

### Trading Module

#### `startOrGetPendingTrade(string $userId): array`

Start a new trade or get existing pending trade with a user.

```php
$trade = $api->startOrGetPendingTrade('user_67890'); // Requires authentication
echo "Trade ID: " . $trade['id'];
```

#### `getTrade(string $tradeId): array`

Get information about a specific trade.

```php
$trade = $api->getTrade('trade_abc123');
echo "Trade status: " . $trade['status'];
```

#### `getUserTrades(string $userId): array`

Get all trades for a specific user.

```php
$userTrades = $api->getUserTrades('user_12345'); // Requires authentication
```

#### `addItemToTrade(string $tradeId, array $tradeItem): array`

Add an item to a trade.

```php
$tradeItem = [
    'itemId' => 'item_xyz789',
    'amount' => 1,
    'metadata' => ['enchantment' => 'fire']
];

$result = $api->addItemToTrade('trade_abc123', $tradeItem); // Requires authentication
```

#### `removeItemFromTrade(string $tradeId, array $tradeItem): array`

Remove an item from a trade.

```php
$tradeItem = [
    'itemId' => 'item_xyz789',
    'amount' => 1
];

$result = $api->removeItemFromTrade('trade_abc123', $tradeItem); // Requires authentication
```

#### `approveTrade(string $tradeId): array`

Approve and execute a trade.

```php
$result = $api->approveTrade('trade_abc123'); // Requires authentication
```

#### `cancelTrade(string $tradeId): array`

Cancel a pending trade.

```php
$result = $api->cancelTrade('trade_abc123'); // Requires authentication
```

---

### OAuth2 Module

#### `createOAuth2App(string $name, array $redirectUrls): array`

Create a new OAuth2 application.

```php
$redirectUrls = ['https://mygame.com/auth/callback'];
$result = $api->createOAuth2App('My Game Client', $redirectUrls); // Requires authentication
```

#### `getOAuth2App(string $clientId): array`

Get OAuth2 application by client ID.

```php
$app = $api->getOAuth2App('client_12345');
```

#### `getMyOAuth2Apps(): array`

Get OAuth2 applications owned by the authenticated user.

```php
$apps = $api->getMyOAuth2Apps(); // Requires authentication
```

#### `updateOAuth2App(string $clientId, array $data): array`

Update an OAuth2 application.

```php
$updates = ['name' => 'Updated App Name'];
$result = $api->updateOAuth2App('client_12345', $updates); // Requires authentication
```

#### `deleteOAuth2App(string $clientId): array`

Delete an OAuth2 application.

```php
$result = $api->deleteOAuth2App('client_12345'); // Requires authentication
```

#### `authorize(string $clientId, string $redirectUri): array`

Authorize a user for an OAuth2 app.

```php
$result = $api->authorize('client_12345', 'https://app.com/callback'); // Requires authentication
```

#### `getUserByOAuth2Code(string $code, string $clientId): array`

Get user information using OAuth2 authorization code.

```php
$userData = $api->getUserByOAuth2Code('auth_code', 'client_12345');
```

## Error Handling

All API methods may throw exceptions. Always wrap calls in try/catch blocks:

```php
<?php
try {
    $user = $api->getMe();
    echo "Welcome, " . $user['username'] . "!";
} catch (Exception $e) {
    echo "API Error: " . $e->getMessage();

    // Check specific error types
    if (strpos($e->getMessage(), 'Token is required') !== false) {
        echo "Authentication required";
    } elseif (strpos($e->getMessage(), '404') !== false) {
        echo "Resource not found";
    } elseif (strpos($e->getMessage(), '401') !== false) {
        echo "Unauthorized - check token";
    } elseif (strpos($e->getMessage(), '403') !== false) {
        echo "Forbidden - insufficient permissions";
    } else {
        echo "Unknown error occurred";
    }
}
?>
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

### Laravel Integration

```php
<?php
// config/croissant.php
return [
    'api_token' => env('CROISSANT_API_TOKEN'),
    'timeout' => env('CROISSANT_TIMEOUT', 30),
    'retry_attempts' => env('CROISSANT_RETRY_ATTEMPTS', 3),
];

// app/Services/CroissantService.php
<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;

class CroissantService
{
    private $api;

    public function __construct()
    {
        require_once base_path('croissant_api.php');
        $this->api = new \CroissantAPI(config('croissant.api_token'));
    }

    public function handlePlayerLogin($playerId)
    {
        try {
            $user = $this->api->getUser($playerId);
            $inventory = $this->api->getInventory($playerId);

            return [
                'username' => $user['username'],
                'verified' => $user['verified'],
                'items' => array_map(function($item) {
                    return [
                        'id' => $item['itemId'],
                        'name' => $item['name'],
                        'quantity' => $item['amount'] ?? 0
                    ];
                }, $inventory['items'] ?? [])
            ];
        } catch (Exception $e) {
            Log::error('Croissant API Error: ' . $e->getMessage());
            return null;
        }
    }

    public function giveReward($playerId, $itemId, $amount)
    {
        try {
            $this->api->giveItem($itemId, $amount, $playerId);
            Log::info("Reward given to {$playerId}: {$itemId} x{$amount}");
            return true;
        } catch (Exception $e) {
            Log::error('Failed to give reward: ' . $e->getMessage());
            return false;
        }
    }
}

// app/Http/Controllers/PlayersController.php
<?php

namespace App\Http\Controllers;

use App\Services\CroissantService;
use Illuminate\Http\Request;

class PlayersController extends Controller
{
    private $croissantService;

    public function __construct(CroissantService $croissantService)
    {
        $this->croissantService = $croissantService;
    }

    public function login(Request $request)
    {
        $playerId = $request->input('player_id');
        $playerData = $this->croissantService->handlePlayerLogin($playerId);

        if ($playerData) {
            return response()->json($playerData);
        } else {
            return response()->json(['error' => 'Login failed'], 401);
        }
    }
}
?>
```

### Symfony Integration

```php
<?php
// src/Service/CroissantService.php
namespace App\Service;

use Exception;
use Psr\Log\LoggerInterface;

class CroissantService
{
    private $api;
    private $logger;

    public function __construct(LoggerInterface $logger, string $apiToken)
    {
        require_once __DIR__ . '/../../croissant_api.php';
        $this->api = new \CroissantAPI($apiToken);
        $this->logger = $logger;
    }

    public function getUser(string $userId): ?array
    {
        try {
            return $this->api->getUser($userId);
        } catch (Exception $e) {
            $this->logger->error('Failed to get user: ' . $e->getMessage());
            return null;
        }
    }

    public function listGames(): array
    {
        try {
            return $this->api->listGames();
        } catch (Exception $e) {
            $this->logger->error('Failed to list games: ' . $e->getMessage());
            return [];
        }
    }
}

// config/services.yaml
services:
    App\Service\CroissantService:
        arguments:
            $apiToken: '%env(CROISSANT_API_TOKEN)%'

// src/Controller/ApiController.php
namespace App\Controller;

use App\Service\CroissantService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class ApiController extends AbstractController
{
    private $croissantService;

    public function __construct(CroissantService $croissantService)
    {
        $this->croissantService = $croissantService;
    }

    #[Route('/api/user/{userId}', methods: ['GET'])]
    public function getUser(string $userId): JsonResponse
    {
        $user = $this->croissantService->getUser($userId);

        if ($user) {
            return $this->json($user);
        } else {
            return $this->json(['error' => 'User not found'], 404);
        }
    }

    #[Route('/api/games', methods: ['GET'])]
    public function listGames(): JsonResponse
    {
        $games = $this->croissantService->listGames();
        return $this->json($games);
    }
}
?>
```

### CodeIgniter Integration

```php
<?php
// application/libraries/Croissant.php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'third_party/croissant_api.php';

class Croissant
{
    private $api;

    public function __construct($params = [])
    {
        $CI =& get_instance();
        $CI->load->config('croissant');

        $token = $params['token'] ?? $CI->config->item('croissant_api_token');
        $this->api = new CroissantAPI($token);
    }

    public function get_user($user_id)
    {
        try {
            return $this->api->getUser($user_id);
        } catch (Exception $e) {
            log_message('error', 'Croissant API Error: ' . $e->getMessage());
            return FALSE;
        }
    }

    public function list_games()
    {
        try {
            return $this->api->listGames();
        } catch (Exception $e) {
            log_message('error', 'Croissant API Error: ' . $e->getMessage());
            return [];
        }
    }
}

// application/config/croissant.php
<?php
defined('BASEPATH') OR exit('No direct script access allowed');

$config['croissant_api_token'] = $_ENV['CROISSANT_API_TOKEN'] ?? '';

// application/controllers/Api.php
<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Api extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->library('croissant');
    }

    public function user($user_id)
    {
        $user = $this->croissant->get_user($user_id);

        if ($user) {
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode($user));
        } else {
            $this->output
                ->set_status_header(404)
                ->set_content_type('application/json')
                ->set_output(json_encode(['error' => 'User not found']));
        }
    }

    public function games()
    {
        $games = $this->croissant->list_games();

        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode($games));
    }
}
?>
```

### Plain PHP Game Server Implementation

```php
<?php
require_once 'croissant_api.php';

class GameServer
{
    private $api;
    private $players = [];

    public function __construct($apiToken)
    {
        $this->api = new CroissantAPI($apiToken);
    }

    public function handlePlayerJoin($playerId)
    {
        try {
            $user = $this->api->getUser($playerId);
            $inventory = $this->api->getInventory($playerId);

            $this->players[$playerId] = [
                'username' => $user['username'],
                'verified' => $user['verified'],
                'items' => array_column($inventory['items'] ?? [], 'itemId')
            ];

            echo "Player joined: " . $user['username'] . "\n";
            return true;
        } catch (Exception $e) {
            echo "Failed to load player {$playerId}: " . $e->getMessage() . "\n";
            return false;
        }
    }

    public function giveQuestReward($playerId, $questId)
    {
        $rewards = $this->getQuestRewards($questId);

        foreach ($rewards as $reward) {
            try {
                $this->api->giveItem($reward['item_id'], $reward['amount'], $playerId);
                echo "Gave {$reward['amount']}x {$reward['item_id']} to {$playerId}\n";
            } catch (Exception $e) {
                echo "Failed to give reward: " . $e->getMessage() . "\n";
            }
        }
    }

    public function handlePlayerTrade($fromPlayerId, $toPlayerId, $items)
    {
        try {
            $trade = $this->api->startOrGetPendingTrade($toPlayerId);

            foreach ($items as $item) {
                $tradeItem = [
                    'itemId' => $item['id'],
                    'amount' => $item['amount']
                ];
                $this->api->addItemToTrade($trade['id'], $tradeItem);
            }

            echo "Trade created: " . $trade['id'] . "\n";
            return $trade['id'];
        } catch (Exception $e) {
            echo "Trade failed: " . $e->getMessage() . "\n";
            return null;
        }
    }

    private function getQuestRewards($questId)
    {
        $rewards = [
            'quest_1' => [
                ['item_id' => 'gold_coin', 'amount' => 100],
                ['item_id' => 'health_potion', 'amount' => 5]
            ],
            'quest_2' => [
                ['item_id' => 'magic_sword', 'amount' => 1],
                ['item_id' => 'gold_coin', 'amount' => 250]
            ]
        ];

        return $rewards[$questId] ?? [];
    }
}

// Usage
$server = new GameServer($_ENV['CROISSANT_API_TOKEN']);

// Handle events
$server->handlePlayerJoin('player_123');
$server->giveQuestReward('player_123', 'quest_1');
$tradeId = $server->handlePlayerTrade('player_123', 'player_456', [
    ['id' => 'magic_sword', 'amount' => 1]
]);
?>
```

## Complete Examples

### Complete Game Store Implementation

```php
<?php
require_once 'croissant_api.php';

class GameStore
{
    private $api;

    public function __construct($apiToken)
    {
        $this->api = new CroissantAPI($apiToken);
    }

    /**
     * Browse games with filters
     */
    public function browseGames($options = [])
    {
        try {
            if (isset($options['search'])) {
                $games = $this->api->searchGames($options['search']);
            } else {
                $games = $this->api->listGames();
            }

            // Apply filters
            if (isset($options['max_price'])) {
                $games = array_filter($games, function($game) use ($options) {
                    return $game['price'] <= $options['max_price'];
                });
            }

            if (isset($options['min_rating'])) {
                $games = array_filter($games, function($game) use ($options) {
                    return ($game['rating'] ?? 0) >= $options['min_rating'];
                });
            }

            if (isset($options['multiplayer'])) {
                $games = array_filter($games, function($game) use ($options) {
                    return ($game['multiplayer'] ?? false) === $options['multiplayer'];
                });
            }

            return array_values($games); // Re-index array
        } catch (Exception $e) {
            throw new Exception("Failed to browse games: " . $e->getMessage());
        }
    }

    /**
     * Browse items with filters
     */
    public function browseItems($options = [])
    {
        try {
            if (isset($options['search'])) {
                $items = $this->api->searchItems($options['search']);
            } else {
                $items = $this->api->listItems();
            }

            // Apply filters
            if (isset($options['max_price'])) {
                $items = array_filter($items, function($item) use ($options) {
                    return $item['price'] <= $options['max_price'];
                });
            }

            // Filter out deleted items
            $items = array_filter($items, function($item) {
                return !($item['deleted'] ?? false);
            });

            return array_values($items);
        } catch (Exception $e) {
            throw new Exception("Failed to browse items: " . $e->getMessage());
        }
    }

    /**
     * Purchase item with balance check
     */
    public function purchaseItem($itemId, $quantity)
    {
        try {
            // Get item details
            $item = $this->api->getItem($itemId);

            // Check user balance
            $user = $this->api->getMe();
            $totalCost = $item['price'] * $quantity;

            if (!isset($user['balance']) || $user['balance'] < $totalCost) {
                throw new Exception('Insufficient balance');
            }

            // Make purchase
            $result = $this->api->buyItem($itemId, $quantity);

            return [
                'success' => true,
                'item' => $item,
                'quantity' => $quantity,
                'total_cost' => $totalCost,
                'new_balance' => $user['balance'] - $totalCost,
                'result' => $result
            ];
        } catch (Exception $e) {
            throw new Exception("Purchase failed: " . $e->getMessage());
        }
    }

    /**
     * Get user's game library
     */
    public function getLibrary()
    {
        try {
            return $this->api->getMyOwnedGames();
        } catch (Exception $e) {
            throw new Exception("Failed to load library: " . $e->getMessage());
        }
    }

    /**
     * Get user's inventory
     */
    public function getInventory()
    {
        try {
            return $this->api->getMyInventory();
        } catch (Exception $e) {
            throw new Exception("Failed to load inventory: " . $e->getMessage());
        }
    }
}

// Usage
$store = new GameStore($_ENV['CROISSANT_API_TOKEN']);

try {
    // Browse and purchase
    $games = $store->browseGames(['search' => 'adventure', 'max_price' => 50]);
    echo "Found " . count($games) . " adventure games under 50 credits\n";

    $items = $store->browseItems(['search' => 'sword', 'max_price' => 100]);
    echo "Found " . count($items) . " swords under 100 credits\n";

    // Purchase item
    $purchaseResult = $store->purchaseItem('item_123', 1);
    echo "Purchase successful! New balance: " . $purchaseResult['new_balance'] . "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
```

### Trading System Implementation

```php
<?php
require_once 'croissant_api.php';

class TradingSystem
{
    private $api;

    public function __construct($apiToken)
    {
        $this->api = new CroissantAPI($apiToken);
    }

    /**
     * Create a trade offer
     */
    public function createTradeOffer($targetUserId, $offeredItems)
    {
        try {
            // Start or get pending trade
            $trade = $this->api->startOrGetPendingTrade($targetUserId);

            // Add items to trade
            foreach ($offeredItems as $item) {
                $tradeItem = [
                    'itemId' => $item['id'],
                    'amount' => $item['amount'],
                    'metadata' => $item['metadata'] ?? []
                ];

                $this->api->addItemToTrade($trade['id'], $tradeItem);
            }

            echo "Trade offer created: " . $trade['id'] . "\n";
            return $trade;
        } catch (Exception $e) {
            throw new Exception("Failed to create trade: " . $e->getMessage());
        }
    }

    /**
     * Get all user's trades
     */
    public function getUserTrades($userId)
    {
        try {
            return $this->api->getUserTrades($userId);
        } catch (Exception $e) {
            throw new Exception("Failed to get trades: " . $e->getMessage());
        }
    }

    /**
     * Accept a trade
     */
    public function acceptTrade($tradeId)
    {
        try {
            $result = $this->api->approveTrade($tradeId);
            echo "Trade accepted: " . $tradeId . "\n";
            return $result;
        } catch (Exception $e) {
            throw new Exception("Failed to accept trade: " . $e->getMessage());
        }
    }

    /**
     * Cancel a trade
     */
    public function cancelTrade($tradeId)
    {
        try {
            $result = $this->api->cancelTrade($tradeId);
            echo "Trade cancelled: " . $tradeId . "\n";
            return $result;
        } catch (Exception $e) {
            throw new Exception("Failed to cancel trade: " . $e->getMessage());
        }
    }

    /**
     * Get trade details
     */
    public function getTradeDetails($tradeId)
    {
        try {
            return $this->api->getTrade($tradeId);
        } catch (Exception $e) {
            throw new Exception("Failed to get trade details: " . $e->getMessage());
        }
    }
}

// Usage
$trading = new TradingSystem($_ENV['CROISSANT_API_TOKEN']);

try {
    // Create a trade offer
    $trade = $trading->createTradeOffer('other_player_id', [
        ['id' => 'sword_123', 'amount' => 1],
        ['id' => 'potion_456', 'amount' => 5]
    ]);

    echo "Trade created: " . $trade['id'] . "\n";

    // List my trades
    $myTrades = $trading->getUserTrades('my_user_id');
    echo "I have " . count($myTrades) . " active trades\n";

    // Accept a trade (example)
    // $trading->acceptTrade('trade_id_here');

} catch (Exception $e) {
    echo "Trading error: " . $e->getMessage() . "\n";
}
?>
```

## Best Practices

### Rate Limiting

```php
<?php
class RateLimitedAPI
{
    private $api;
    private $lastRequest = 0;
    private $minInterval = 0.1; // 100ms between requests

    public function __construct($apiToken)
    {
        $this->api = new CroissantAPI($apiToken);
    }

    private function ensureRateLimit()
    {
        $timeSinceLastRequest = microtime(true) - $this->lastRequest;
        if ($timeSinceLastRequest < $this->minInterval) {
            usleep(($this->minInterval - $timeSinceLastRequest) * 1000000);
        }
        $this->lastRequest = microtime(true);
    }

    public function safeRequest($method, ...$args)
    {
        $this->ensureRateLimit();
        return call_user_func_array([$this->api, $method], $args);
    }

    public function getUser($userId)
    {
        return $this->safeRequest('getUser', $userId);
    }

    public function searchItems($query)
    {
        return $this->safeRequest('searchItems', $query);
    }
}
?>
```

### Caching Strategy

```php
<?php
class CachedCroissantAPI
{
    private $api;
    private $cache = [];
    private $cacheTimeout = 300; // 5 minutes

    public function __construct($apiToken)
    {
        $this->api = new CroissantAPI($apiToken);
    }

    private function getCacheKey($method, ...$args)
    {
        return $method . ':' . md5(serialize($args));
    }

    private function isExpired($timestamp)
    {
        return time() > $timestamp;
    }

    public function getCachedGames()
    {
        $cacheKey = $this->getCacheKey('listGames');

        if (isset($this->cache[$cacheKey]) &&
            !$this->isExpired($this->cache[$cacheKey]['expires'])) {
            return $this->cache[$cacheKey]['data'];
        }

        $games = $this->api->listGames();
        $this->cache[$cacheKey] = [
            'data' => $games,
            'expires' => time() + $this->cacheTimeout
        ];

        return $games;
    }

    public function getCachedUser($userId)
    {
        $cacheKey = $this->getCacheKey('getUser', $userId);

        if (isset($this->cache[$cacheKey]) &&
            !$this->isExpired($this->cache[$cacheKey]['expires'])) {
            return $this->cache[$cacheKey]['data'];
        }

        $user = $this->api->getUser($userId);
        $this->cache[$cacheKey] = [
            'data' => $user,
            'expires' => time() + $this->cacheTimeout
        ];

        return $user;
    }

    public function clearCache()
    {
        $this->cache = [];
    }
}
?>
```

### Environment Configuration

```php
<?php
class CroissantConfig
{
    private $apiToken;
    private $timeout;
    private $retryAttempts;

    public function __construct()
    {
        $this->apiToken = $_ENV['CROISSANT_API_TOKEN'] ?? null;
        $this->timeout = intval($_ENV['CROISSANT_TIMEOUT'] ?? 30);
        $this->retryAttempts = intval($_ENV['CROISSANT_RETRY_ATTEMPTS'] ?? 3);

        $this->validateConfig();
    }

    public function createAPI()
    {
        return new CroissantAPI($this->apiToken);
    }

    public function getApiToken()
    {
        return $this->apiToken;
    }

    public function getTimeout()
    {
        return $this->timeout;
    }

    public function getRetryAttempts()
    {
        return $this->retryAttempts;
    }

    private function validateConfig()
    {
        if (empty($this->apiToken)) {
            error_log('Warning: No Croissant API token found');
        }
    }
}

// Usage
$config = new CroissantConfig();
$api = $config->createAPI();
?>
```

### Error Recovery

```php
<?php
class ResilientCroissantAPI
{
    private $api;
    private $maxRetries = 3;
    private $retryDelay = 1; // seconds

    public function __construct($apiToken)
    {
        $this->api = new CroissantAPI($apiToken);
    }

    public function withRetry($method, ...$args)
    {
        $retries = 0;

        while ($retries <= $this->maxRetries) {
            try {
                return call_user_func_array([$this->api, $method], $args);
            } catch (Exception $e) {
                $retries++;

                if ($retries <= $this->maxRetries && $this->shouldRetry($e)) {
                    echo "Retry {$retries}/{$this->maxRetries} after error: " . $e->getMessage() . "\n";
                    sleep($this->retryDelay * $retries); // Exponential backoff
                } else {
                    throw $e;
                }
            }
        }
    }

    private function shouldRetry($error)
    {
        // Retry on network errors, timeouts, and 5xx server errors
        $message = strtolower($error->getMessage());
        return strpos($message, 'timeout') !== false ||
               strpos($message, 'network') !== false ||
               strpos($message, '5') === 0; // 5xx errors
    }

    public function getUser($userId)
    {
        return $this->withRetry('getUser', $userId);
    }

    public function listGames()
    {
        return $this->withRetry('listGames');
    }
}
?>
```

### Utility Helper Class

```php
<?php
class CroissantHelper
{
    private $api;

    public function __construct($apiToken)
    {
        $this->api = new CroissantAPI($apiToken);
    }

    /**
     * Validate if user exists and is verified
     */
    public function validateUser($userId)
    {
        try {
            $user = $this->api->getUser($userId);
            return [
                'exists' => true,
                'verified' => $user['verified'] ?? false,
                'username' => $user['username']
            ];
        } catch (Exception $e) {
            return [
                'exists' => false,
                'verified' => false,
                'username' => null
            ];
        }
    }

    /**
     * Check if user can afford item
     */
    public function canAffordItem($itemId, $quantity = 1)
    {
        try {
            $item = $this->api->getItem($itemId);
            $user = $this->api->getMe();

            $totalCost = $item['price'] * $quantity;
            $userBalance = $user['balance'] ?? 0;

            return [
                'can_afford' => $userBalance >= $totalCost,
                'total_cost' => $totalCost,
                'user_balance' => $userBalance,
                'difference' => $userBalance - $totalCost
            ];
        } catch (Exception $e) {
            return [
                'can_afford' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get user's item count in inventory
     */
    public function getUserItemCount($userId, $itemId)
    {
        try {
            $inventory = $this->api->getInventory($userId);

            foreach ($inventory['items'] ?? [] as $item) {
                if ($item['itemId'] === $itemId) {
                    return $item['amount'] ?? 0;
                }
            }

            return 0;
        } catch (Exception $e) {
            return 0;
        }
    }

    /**
     * Format user display name
     */
    public function formatUserDisplay($user)
    {
        $name = $user['username'];

        if ($user['verified'] ?? false) {
            $name .= ' ✓';
        }

        if ($user['admin'] ?? false) {
            $name .= ' [ADMIN]';
        }

        return $name;
    }

    /**
     * Format price with currency
     */
    public function formatPrice($price)
    {
        return number_format($price, 0) . ' credits';
    }
}
?>
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
- **Minimum Requirements**: PHP 7.4+

### Changelog

#### v1.0.0 (July 2025)

- Initial release
- Complete API coverage
- Full PHP support
- Comprehensive documentation
