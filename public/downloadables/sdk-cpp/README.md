# Croissant API C++ Client Library

A comprehensive C++ client library for the Croissant gaming platform API. This library provides a fully typed interface for all platform features including user management, game operations, inventory, trading, and more.

## Features

- **Complete API Coverage**: Full access to all Croissant platform endpoints
- **Modern C++17**: Uses modern C++ features for clean, safe code
- **Type Safety**: Strongly typed interfaces with optional types
- **Cross-Platform**: Works on Windows, Linux, and macOS
- **CMake Integration**: Easy integration with CMake-based projects
- **JSON Support**: Built-in JSON serialization and deserialization
- **HTTP Client**: Integrated HTTP client for seamless API communication

## Requirements

- **C++ Standard**: C++17 or later
- **CMake**: Version 3.15 or later
- **Dependencies**:
  - [nlohmann/json](https://github.com/nlohmann/json) - JSON library
  - [cpr](https://github.com/libcpr/cpr) - HTTP requests library

## Installation

### Using CMake FetchContent

Add this to your CMakeLists.txt:

```cmake
include(FetchContent)

FetchContent_Declare(
    CroissantAPI
    URL https://croissant-api.eminium.ovh/downloadables/sdk-cpp/croissant-api-cpp.zip
)

FetchContent_MakeAvailable(CroissantAPI)

target_link_libraries(your_target PRIVATE CroissantAPI::croissant_api)
```

### Manual Installation

1. Download the SDK from [croissant-api.eminium.ovh/downloadables/sdk-cpp/](https://croissant-api.eminium.ovh/downloadables/sdk-cpp/)
2. Extract the files to your project directory
3. Build and install using CMake:

```bash
mkdir build && cd build
cmake ..
make install
```

### Using vcpkg

```bash
vcpkg install nlohmann-json cpr
```

Then include the library files directly in your project.

## Quick Start

### Basic Setup

```cpp
#include "croissant_api_new.hpp"
#include <iostream>

using namespace CroissantAPI;

int main() {
    // Create client with authentication token
    Client api("your_auth_token_here");

    try {
        // Get authenticated user information
        auto user = api.users.getMe();
        if (user) {
            std::cout << "Welcome, " << user->username << "!" << std::endl;
            std::cout << "Verified: " << (user->verified ? "Yes" : "No") << std::endl;
            if (user->balance) {
                std::cout << "Balance: " << *user->balance << " credits" << std::endl;
            }
        }
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }

    return 0;
}
```

### CMake Integration

```cmake
cmake_minimum_required(VERSION 3.15)
project(MyGame)

find_package(CroissantAPI REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)
find_package(cpr CONFIG REQUIRED)

add_executable(my_game main.cpp)
target_link_libraries(my_game PRIVATE CroissantAPI::croissant_api)

set_property(TARGET my_game PROPERTY CXX_STANDARD 17)
```

## Authentication

To access authenticated endpoints, you need an API token:

1. **Web Dashboard**: Visit [croissant-api.eminium.ovh](https://croissant-api.eminium.ovh) and generate a token
2. **OAuth2 Flow**: Implement OAuth2 for third-party applications
3. **Bot Tokens**: Use dedicated tokens for automated systems

```cpp
// Initialize with token
Client api("your_token_here");

// Set token later
Client api;
api.setToken("your_token_here");

// Environment variable (recommended)
Client api(std::getenv("CROISSANT_API_TOKEN"));
```

## API Reference

### Core Classes

#### `Client`

Main API client providing access to all platform modules.

**Constructor**

```cpp
Client(const std::string& token = "")
```

**Methods**

```cpp
void setToken(const std::string& newToken);
std::string getToken() const;
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

#### `APIResponse`

Standard response structure for API operations.

```cpp
struct APIResponse {
    bool success;           // Operation success status
    std::string message;    // Response message
    json data;             // Response data (JSON)
};
```

---

### Users Module (`api.users`)

#### `getMe() -> std::optional<User>`

Retrieve the authenticated user's profile.

```cpp
auto user = api.users.getMe(); // Requires authentication
if (user) {
    std::cout << "Username: " << user->username << std::endl;
}
```

#### `search(query) -> std::vector<User>`

Search for users by username.

```cpp
auto users = api.users.search("john");
for (const auto& user : users) {
    std::cout << user.username << std::endl;
}
```

#### `getUser(userId) -> std::optional<User>`

Get a specific user by ID.

```cpp
auto user = api.users.getUser("user_12345");
```

#### `transferCredits(targetUserId, amount) -> APIResponse`

Transfer credits to another user.

```cpp
auto response = api.users.transferCredits("user_67890", 100.0);
if (response.success) {
    std::cout << "Transfer successful: " << response.message << std::endl;
}
```

#### `verify(userId, verificationKey) -> APIResponse`

Verify a user account.

```cpp
auto result = api.users.verify("user_id", "verification_key");
```

#### `changeUsername(username) -> APIResponse`

Change the authenticated user's username.

```cpp
auto result = api.users.changeUsername("new_username");
```

#### `changePassword(oldPassword, newPassword, confirmPassword) -> APIResponse`

Change the authenticated user's password.

```cpp
auto result = api.users.changePassword("old_pass", "new_pass", "new_pass");
```

---

### Games Module (`api.games`)

#### `list() -> std::vector<Game>`

List all available games.

```cpp
auto games = api.games.list();
for (const auto& game : games) {
    std::cout << game.name << " - " << game.price << "€" << std::endl;
}
```

#### `search(query) -> std::vector<Game>`

Search games by name, genre, or description.

```cpp
auto games = api.games.search("platformer adventure");
```

#### `get(gameId) -> std::optional<Game>`

Get detailed information about a specific game.

```cpp
auto game = api.games.get("game_abc123");
if (game) {
    std::cout << "Genre: " << game->genre.value_or("Unknown") << std::endl;
    std::cout << "Multiplayer: " << (game->multiplayer ? "Yes" : "No") << std::endl;
}
```

#### `getMyCreatedGames() -> std::vector<Game>`

Get games created by the authenticated user.

```cpp
auto myGames = api.games.getMyCreatedGames(); // Requires authentication
```

#### `getMyOwnedGames() -> std::vector<Game>`

Get games owned by the authenticated user.

```cpp
auto ownedGames = api.games.getMyOwnedGames(); // Requires authentication
```

#### `create(game) -> std::optional<Game>`

Create a new game.

```cpp
Game newGame;
newGame.name = "My Awesome Game";
newGame.description = "An amazing adventure";
newGame.price = 19.99;

auto created = api.games.create(newGame); // Requires authentication
```

#### `update(gameId, game) -> std::optional<Game>`

Update an existing game.

```cpp
auto updated = api.games.update("game_id", modifiedGame); // Requires authentication
```

#### `buy(gameId) -> APIResponse`

Purchase a game.

```cpp
auto result = api.games.buy("game_abc123"); // Requires authentication
```

---

### Inventory Module (`api.inventory`)

#### `getMyInventory() -> std::pair<std::string, std::vector<InventoryItem>>`

Get the authenticated user's inventory.

```cpp
auto [userId, inventory] = api.inventory.getMyInventory(); // Requires authentication
for (const auto& item : inventory) {
    std::cout << item.name << " x" << item.amount << std::endl;
}
```

#### `get(userId) -> std::pair<std::string, std::vector<InventoryItem>>`

Get another user's public inventory.

```cpp
auto [userId, inventory] = api.inventory.get("user_12345");
```

---

### Items Module (`api.items`)

#### `list() -> std::vector<Item>`

List all available items in the marketplace.

```cpp
auto items = api.items.list();
```

#### `search(query) -> std::vector<Item>`

Search items by name or description.

```cpp
auto items = api.items.search("magic sword");
```

#### `get(itemId) -> std::optional<Item>`

Get detailed information about a specific item.

```cpp
auto item = api.items.get("item_xyz789");
```

#### `getMyItems() -> std::vector<Item>`

Get items created by the authenticated user.

```cpp
auto myItems = api.items.getMyItems(); // Requires authentication
```

#### `create(name, description, price, iconHash, showInStore) -> APIResponse`

Create a new item for sale.

```cpp
auto result = api.items.create(
    "Enchanted Shield",
    "Provides magical protection",
    150.0,
    "optional_icon_hash",
    true
); // Requires authentication
```

#### `update(itemId, item) -> APIResponse`

Update an existing item.

```cpp
auto result = api.items.update("item_id", modifiedItem); // Requires authentication
```

#### `deleteItem(itemId) -> APIResponse`

Delete an item.

```cpp
auto result = api.items.deleteItem("item_xyz789"); // Requires authentication
```

#### `buy(itemId, amount) -> APIResponse`

Purchase items from the marketplace.

```cpp
auto result = api.items.buy("item_xyz789", 2); // Requires authentication
```

#### `sell(itemId, amount) -> APIResponse`

Sell items from inventory.

```cpp
auto result = api.items.sell("item_xyz789", 1); // Requires authentication
```

#### `give(itemId, amount, userId, metadata) -> APIResponse`

Give items to another user.

```cpp
std::unordered_map<std::string, json> metadata = {
    {"enchantment", "fire"},
    {"level", 5}
};

auto result = api.items.give("item_xyz789", 1, "user_67890", metadata); // Requires authentication
```

#### `consume(itemId, userId, amount, uniqueId) -> APIResponse`

Consume an item instance.

```cpp
auto result = api.items.consume("item_xyz789", "user_id", 1); // Requires authentication
```

#### `updateMetadata(itemId, uniqueId, metadata) -> APIResponse`

Update metadata for an item instance.

```cpp
std::unordered_map<std::string, json> newMetadata = {
    {"durability", 95},
    {"last_used", "2025-01-15"}
};

auto result = api.items.updateMetadata("item_id", "unique_id", newMetadata); // Requires authentication
```

#### `drop(itemId, amount, uniqueId) -> APIResponse`

Remove items from inventory.

```cpp
auto result = api.items.drop("item_xyz789", 1); // Requires authentication
```

---

### Studios Module (`api.studios`)

#### `create(studioName) -> APIResponse`

Create a new development studio.

```cpp
auto result = api.studios.create("Awesome Games Studio"); // Requires authentication
```

#### `get(studioId) -> std::optional<Studio>`

Get information about a specific studio.

```cpp
auto studio = api.studios.get("studio_abc123");
```

#### `getMyStudios() -> std::vector<Studio>`

Get studios owned by the authenticated user.

```cpp
auto myStudios = api.studios.getMyStudios(); // Requires authentication
```

#### `addUser(studioId, userId) -> APIResponse`

Add a user to a studio team.

```cpp
auto result = api.studios.addUser("studio_abc123", "user_67890"); // Requires authentication
```

#### `removeUser(studioId, userId) -> APIResponse`

Remove a user from a studio team.

```cpp
auto result = api.studios.removeUser("studio_abc123", "user_67890"); // Requires authentication
```

---

### Lobbies Module (`api.lobbies`)

#### `create() -> APIResponse`

Create a new game lobby.

```cpp
auto result = api.lobbies.create(); // Requires authentication
```

#### `get(lobbyId) -> std::optional<Lobby>`

Get information about a specific lobby.

```cpp
auto lobby = api.lobbies.get("lobby_xyz789");
```

#### `getMyLobby() -> std::optional<Lobby>`

Get the authenticated user's current lobby.

```cpp
auto myLobby = api.lobbies.getMyLobby(); // Requires authentication
```

#### `getUserLobby(userId) -> std::optional<Lobby>`

Get the lobby a user is in.

```cpp
auto userLobby = api.lobbies.getUserLobby("user_12345");
```

#### `join(lobbyId) -> APIResponse`

Join an existing lobby.

```cpp
auto result = api.lobbies.join("lobby_xyz789"); // Requires authentication
```

#### `leave(lobbyId) -> APIResponse`

Leave a lobby.

```cpp
auto result = api.lobbies.leave("lobby_xyz789"); // Requires authentication
```

---

### Trades Module (`api.trades`)

#### `startOrGetPending(userId) -> std::optional<Trade>`

Start a new trade or get existing pending trade with a user.

```cpp
auto trade = api.trades.startOrGetPending("user_67890"); // Requires authentication
```

#### `get(tradeId) -> std::optional<Trade>`

Get information about a specific trade.

```cpp
auto trade = api.trades.get("trade_abc123");
```

#### `getUserTrades(userId) -> std::vector<Trade>`

Get all trades for a user.

```cpp
auto trades = api.trades.getUserTrades("user_id"); // Requires authentication
```

#### `addItem(tradeId, tradeItem) -> APIResponse`

Add an item to a trade.

```cpp
TradeItem item;
item.itemId = "item_xyz789";
item.amount = 1;
item.metadata = {{"enchantment", "fire"}};

auto result = api.trades.addItem("trade_abc123", item); // Requires authentication
```

#### `removeItem(tradeId, tradeItem) -> APIResponse`

Remove an item from a trade.

```cpp
auto result = api.trades.removeItem("trade_abc123", item); // Requires authentication
```

#### `approve(tradeId) -> APIResponse`

Approve and execute a trade.

```cpp
auto result = api.trades.approve("trade_abc123"); // Requires authentication
```

#### `cancel(tradeId) -> APIResponse`

Cancel a pending trade.

```cpp
auto result = api.trades.cancel("trade_abc123"); // Requires authentication
```

---

### OAuth2 Module (`api.oauth2`)

#### `createApp(name, redirectUrls) -> std::optional<std::pair<std::string, std::string>>`

Create a new OAuth2 application.

```cpp
std::vector<std::string> redirects = {"https://mygame.com/auth/callback"};
auto app = api.oauth2.createApp("My Game Client", redirects); // Requires authentication

if (app) {
    auto [clientId, clientSecret] = *app;
    std::cout << "Client ID: " << clientId << std::endl;
}
```

#### `getMyApps() -> std::vector<OAuth2App>`

Get OAuth2 applications owned by the authenticated user.

```cpp
auto apps = api.oauth2.getMyApps(); // Requires authentication
```

#### `getApp(clientId) -> std::optional<OAuth2App>`

Get an OAuth2 application by client ID.

```cpp
auto app = api.oauth2.getApp("client_12345");
```

#### `updateApp(clientId, name, redirectUrls) -> APIResponse`

Update an OAuth2 application.

```cpp
auto result = api.oauth2.updateApp("client_id", "New Name", std::nullopt); // Requires authentication
```

#### `deleteApp(clientId) -> APIResponse`

Delete an OAuth2 application.

```cpp
auto result = api.oauth2.deleteApp("client_12345"); // Requires authentication
```

#### `authorize(clientId, redirectUri) -> std::string`

Authorize an OAuth2 application.

```cpp
std::string code = api.oauth2.authorize("client_12345", "https://app.com/callback");
```

#### `getUserByCode(code, clientId) -> std::optional<User>`

Get user information using OAuth2 authorization code.

```cpp
auto user = api.oauth2.getUserByCode("auth_code", "client_id");
```

---

### Global Search

#### `globalSearch(query) -> json`

Perform a global search across all content types.

```cpp
auto results = api.globalSearch("adventure");
// Results contain games, items, users, etc.
```

## Data Types

### Core Types

#### `User`

```cpp
struct User {
    std::string userId;
    std::string username;
    std::optional<std::string> email;
    bool verified;
    std::optional<double> balance;
    std::optional<std::string> steam_id;
    std::optional<std::string> steam_username;
    std::optional<std::string> steam_avatar_url;
    std::optional<bool> isStudio;
    std::optional<bool> admin;
    std::optional<bool> disabled;
    // ... additional optional fields
};
```

#### `Game`

```cpp
struct Game {
    std::string gameId;
    std::string name;
    std::string description;
    double price;
    std::string owner_id;
    bool showInStore;
    std::optional<std::string> iconHash;
    std::optional<std::string> genre;
    std::optional<std::string> release_date;
    std::optional<std::vector<std::string>> platforms;
    double rating;
    bool multiplayer;
    std::optional<std::string> download_link;
    // ... additional optional fields
};
```

#### `Item`

```cpp
struct Item {
    std::string itemId;
    std::string name;
    std::string description;
    std::string owner;
    double price;
    std::string iconHash;
    std::optional<bool> showInStore;
    std::optional<bool> deleted;
};
```

#### `InventoryItem`

```cpp
struct InventoryItem {
    std::string itemId;
    std::string name;
    std::string description;
    std::string iconHash;
    double price;
    std::string owner;
    int amount;
    bool showInStore;
    std::optional<std::unordered_map<std::string, json>> metadata;
};
```

#### `Trade`

```cpp
struct Trade {
    std::string id;
    std::string fromUserId;
    std::string toUserId;
    std::vector<TradeItemDetail> fromUserItems;
    std::vector<TradeItemDetail> toUserItems;
    bool approvedFromUser;
    bool approvedToUser;
    std::string status;
    std::string createdAt;
    std::string updatedAt;
};
```

#### `Studio`

```cpp
struct Studio {
    std::string user_id;
    std::string username;
    bool verified;
    std::string admin_id;
    std::optional<bool> isAdmin;
    std::optional<std::string> apiKey;
    std::optional<std::vector<StudioUser>> users;
};
```

#### `Lobby`

```cpp
struct Lobby {
    std::string lobbyId;
    std::vector<LobbyUser> users;
};
```

#### `OAuth2App`

```cpp
struct OAuth2App {
    std::string client_id;
    std::string client_secret;
    std::string name;
    std::vector<std::string> redirect_urls;
};
```

## Error Handling

All API methods use C++ exceptions for error handling. Always wrap API calls in try-catch blocks:

```cpp
try {
    auto user = api.users.getMe();
    if (user) {
        std::cout << "Welcome, " << user->username << "!" << std::endl;
    } else {
        std::cout << "Failed to get user information" << std::endl;
    }
} catch (const std::runtime_error& e) {
    if (std::string(e.what()) == "Token is required") {
        std::cerr << "Authentication required" << std::endl;
    } else {
        std::cerr << "API Error: " << e.what() << std::endl;
    }
} catch (const std::exception& e) {
    std::cerr << "Unexpected error: " << e.what() << std::endl;
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
| `Permission denied`    | Insufficient permissions | Check token permissions     |

## Complete Examples

### Game Store Implementation

```cpp
#include "croissant_api_new.hpp"
#include <iostream>
#include <vector>
#include <algorithm>

class GameStore {
private:
    CroissantAPI::Client api;

public:
    GameStore(const std::string& token) : api(token) {}

    // Browse games with filters
    std::vector<CroissantAPI::Game> browseGames(
        const std::string& search = "",
        double maxPrice = std::numeric_limits<double>::max(),
        double minRating = 0.0
    ) {
        try {
            std::vector<CroissantAPI::Game> games;

            if (!search.empty()) {
                games = api.games.search(search);
            } else {
                games = api.games.list();
            }

            // Apply filters
            auto filtered = games;
            filtered.erase(
                std::remove_if(filtered.begin(), filtered.end(),
                    [maxPrice, minRating](const auto& game) {
                        return game.price > maxPrice || game.rating < minRating;
                    }),
                filtered.end()
            );

            return filtered;
        } catch (const std::exception& e) {
            std::cerr << "Failed to browse games: " << e.what() << std::endl;
            return {};
        }
    }

    // Purchase game with balance check
    bool purchaseGame(const std::string& gameId) {
        try {
            // Get game details
            auto game = api.games.get(gameId);
            if (!game) {
                std::cerr << "Game not found" << std::endl;
                return false;
            }

            // Check user balance
            auto user = api.users.getMe();
            if (!user || !user->balance || *user->balance < game->price) {
                std::cerr << "Insufficient balance" << std::endl;
                return false;
            }

            // Purchase game
            auto result = api.games.buy(gameId);
            if (result.success) {
                std::cout << "Successfully purchased " << game->name
                         << " for " << game->price << " credits" << std::endl;
                return true;
            } else {
                std::cerr << "Purchase failed: " << result.message << std::endl;
                return false;
            }
        } catch (const std::exception& e) {
            std::cerr << "Purchase failed: " << e.what() << std::endl;
            return false;
        }
    }

    // Get user's game library
    std::vector<CroissantAPI::Game> getLibrary() {
        try {
            return api.games.getMyOwnedGames();
        } catch (const std::exception& e) {
            std::cerr << "Failed to load library: " << e.what() << std::endl;
            return {};
        }
    }
};

// Usage
int main() {
    GameStore store("your_token_here");

    // Browse games
    auto games = store.browseGames("adventure", 50.0, 4.0);
    std::cout << "Found " << games.size()
              << " adventure games under 50 credits with rating 4+" << std::endl;

    // Purchase a game
    if (!games.empty()) {
        store.purchaseGame(games[0].gameId);
    }

    // View library
    auto library = store.getLibrary();
    std::cout << "Your library contains " << library.size() << " games" << std::endl;

    return 0;
}
```

### Trading System Implementation

```cpp
#include "croissant_api_new.hpp"
#include <iostream>
#include <vector>

class TradingSystem {
private:
    CroissantAPI::Client api;

public:
    TradingSystem(const std::string& token) : api(token) {}

    // Create a trade with another player
    std::optional<CroissantAPI::Trade> createTrade(
        const std::string& targetUserId,
        const std::vector<std::pair<std::string, int>>& offer
    ) {
        try {
            // Start trade
            auto trade = api.trades.startOrGetPending(targetUserId);
            if (!trade) {
                std::cerr << "Failed to create trade" << std::endl;
                return std::nullopt;
            }

            // Add items to trade
            for (const auto& [itemId, amount] : offer) {
                CroissantAPI::TradeItem tradeItem;
                tradeItem.itemId = itemId;
                tradeItem.amount = amount;

                auto result = api.trades.addItem(trade->id, tradeItem);
                if (!result.success) {
                    std::cerr << "Failed to add item to trade: "
                             << result.message << std::endl;
                }
            }

            return trade;
        } catch (const std::exception& e) {
            std::cerr << "Failed to create trade: " << e.what() << std::endl;
            return std::nullopt;
        }
    }

    // Complete a trade
    bool completeTrade(const std::string& tradeId) {
        try {
            auto result = api.trades.approve(tradeId);
            if (result.success) {
                std::cout << "Trade completed successfully!" << std::endl;
                return true;
            } else {
                std::cerr << "Trade approval failed: " << result.message << std::endl;
                return false;
            }
        } catch (const std::exception& e) {
            std::cerr << "Failed to complete trade: " << e.what() << std::endl;
            return false;
        }
    }

    // Display trade details
    void displayTrade(const CroissantAPI::Trade& trade) {
        std::cout << "Trade ID: " << trade.id << std::endl;
        std::cout << "From: " << trade.fromUserId << std::endl;
        std::cout << "To: " << trade.toUserId << std::endl;
        std::cout << "Status: " << trade.status << std::endl;

        std::cout << "Offered items:" << std::endl;
        for (const auto& item : trade.fromUserItems) {
            std::cout << "  - " << item.name << " x" << item.amount << std::endl;
        }

        std::cout << "Requested items:" << std::endl;
        for (const auto& item : trade.toUserItems) {
            std::cout << "  - " << item.name << " x" << item.amount << std::endl;
        }
    }
};

// Usage
int main() {
    TradingSystem trading("your_token_here");

    // Create a trade offer
    std::vector<std::pair<std::string, int>> offer = {
        {"sword_123", 1},
        {"potion_456", 5}
    };

    auto trade = trading.createTrade("other_player_id", offer);
    if (trade) {
        std::cout << "Trade created: " << trade->id << std::endl;
        trading.displayTrade(*trade);
    }

    return 0;
}
```

### Inventory Management

```cpp
#include "croissant_api_new.hpp"
#include <iostream>
#include <unordered_map>

class InventoryManager {
private:
    CroissantAPI::Client api;

public:
    InventoryManager(const std::string& token) : api(token) {}

    // Display user inventory with categorization
    void displayInventory() {
        try {
            auto [userId, inventory] = api.inventory.getMyInventory();

            std::unordered_map<std::string, std::vector<CroissantAPI::InventoryItem>> categories;

            // Categorize items (you could implement more sophisticated categorization)
            for (const auto& item : inventory) {
                std::string category = "Other";

                if (item.name.find("Weapon") != std::string::npos ||
                    item.name.find("Sword") != std::string::npos) {
                    category = "Weapons";
                } else if (item.name.find("Potion") != std::string::npos ||
                          item.name.find("Health") != std::string::npos) {
                    category = "Consumables";
                } else if (item.name.find("Armor") != std::string::npos ||
                          item.name.find("Shield") != std::string::npos) {
                    category = "Armor";
                }

                categories[category].push_back(item);
            }

            std::cout << "=== Inventory for User: " << userId << " ===" << std::endl;

            for (const auto& [category, items] : categories) {
                std::cout << "\n" << category << ":" << std::endl;
                for (const auto& item : items) {
                    std::cout << "  - " << item.name << " x" << item.amount
                             << " (" << item.price << "€ each)" << std::endl;
                }
            }
        } catch (const std::exception& e) {
            std::cerr << "Failed to load inventory: " << e.what() << std::endl;
        }
    }

    // Buy multiple items
    bool buyItems(const std::vector<std::pair<std::string, int>>& purchases) {
        bool allSuccessful = true;

        for (const auto& [itemId, amount] : purchases) {
            try {
                auto result = api.items.buy(itemId, amount);
                if (result.success) {
                    std::cout << "Successfully bought " << amount
                             << " of item " << itemId << std::endl;
                } else {
                    std::cerr << "Failed to buy item " << itemId
                             << ": " << result.message << std::endl;
                    allSuccessful = false;
                }
            } catch (const std::exception& e) {
                std::cerr << "Error buying item " << itemId
                         << ": " << e.what() << std::endl;
                allSuccessful = false;
            }
        }

        return allSuccessful;
    }

    // Give items to another user
    bool giveItems(const std::string& targetUserId,
                   const std::vector<std::tuple<std::string, int, std::unordered_map<std::string, nlohmann::json>>>& gifts) {
        bool allSuccessful = true;

        for (const auto& [itemId, amount, metadata] : gifts) {
            try {
                auto result = api.items.give(itemId, amount, targetUserId, metadata);
                if (result.success) {
                    std::cout << "Successfully gave " << amount
                             << " of item " << itemId << " to " << targetUserId << std::endl;
                } else {
                    std::cerr << "Failed to give item " << itemId
                             << ": " << result.message << std::endl;
                    allSuccessful = false;
                }
            } catch (const std::exception& e) {
                std::cerr << "Error giving item " << itemId
                         << ": " << e.what() << std::endl;
                allSuccessful = false;
            }
        }

        return allSuccessful;
    }
};

// Usage
int main() {
    InventoryManager manager("your_token_here");

    // Display current inventory
    manager.displayInventory();

    // Buy some items
    std::vector<std::pair<std::string, int>> purchases = {
        {"potion_health", 5},
        {"sword_iron", 1}
    };
    manager.buyItems(purchases);

    // Give items to friend
    std::unordered_map<std::string, nlohmann::json> giftMetadata = {
        {"gift_message", "Happy birthday!"},
        {"gift_from", "your_username"}
    };

    std::vector<std::tuple<std::string, int, std::unordered_map<std::string, nlohmann::json>>> gifts = {
        {"potion_health", 2, giftMetadata}
    };
    manager.giveItems("friend_user_id", gifts);

    return 0;
}
```

## Best Practices

### Memory Management

```cpp
// Use smart pointers for complex objects
std::unique_ptr<CroissantAPI::Client> createClient(const std::string& token) {
    return std::make_unique<CroissantAPI::Client>(token);
}

// RAII for resource management
class APISession {
private:
    CroissantAPI::Client api;
    bool authenticated;

public:
    APISession(const std::string& token) : api(token), authenticated(false) {
        try {
            auto user = api.users.getMe();
            authenticated = user.has_value();
        } catch (...) {
            authenticated = false;
        }
    }

    bool isAuthenticated() const { return authenticated; }
    CroissantAPI::Client& getClient() { return api; }
};
```

### Error Handling Strategy

```cpp
class APIResult {
private:
    bool success;
    std::string error;

public:
    template<typename T>
    static APIResult fromOptional(const std::optional<T>& opt) {
        if (opt) {
            return APIResult{true, ""};
        } else {
            return APIResult{false, "Operation returned no result"};
        }
    }

    static APIResult fromResponse(const CroissantAPI::APIResponse& response) {
        return APIResult{response.success, response.message};
    }

    bool isSuccess() const { return success; }
    const std::string& getError() const { return error; }
};

// Usage
APIResult result = APIResult::fromResponse(api.users.transferCredits("user_id", 100));
if (!result.isSuccess()) {
    std::cerr << "Transfer failed: " << result.getError() << std::endl;
}
```

### Configuration Management

```cpp
struct CroissantConfig {
    std::string apiToken;
    std::string baseUrl = "https://croissant-api.eminium.ovh/api";
    int timeout = 30000; // milliseconds
    bool enableRetry = true;

    static CroissantConfig fromEnvironment() {
        CroissantConfig config;

        if (const char* token = std::getenv("CROISSANT_API_TOKEN")) {
            config.apiToken = token;
        }

        if (const char* baseUrl = std::getenv("CROISSANT_BASE_URL")) {
            config.baseUrl = baseUrl;
        }

        return config;
    }
};

// Usage
auto config = CroissantConfig::fromEnvironment();
CroissantAPI::Client api(config.apiToken);
```

## Platform Integration

### Windows Integration

```cpp
#ifdef _WIN32
#include <windows.h>

std::string getTokenFromRegistry() {
    HKEY hKey;
    LONG result = RegOpenKeyEx(HKEY_CURRENT_USER,
                              L"SOFTWARE\\Croissant\\API",
                              0, KEY_READ, &hKey);

    if (result == ERROR_SUCCESS) {
        WCHAR token[256];
        DWORD size = sizeof(token);
        result = RegQueryValueEx(hKey, L"Token", nullptr, nullptr,
                               (LPBYTE)token, &size);
        RegCloseKey(hKey);

        if (result == ERROR_SUCCESS) {
            // Convert wide string to string
            std::wstring ws(token);
            return std::string(ws.begin(), ws.end());
        }
    }

    return "";
}
#endif
```

### Linux Integration

```cpp
#ifdef __linux__
#include <pwd.h>
#include <unistd.h>
#include <fstream>

std::string getTokenFromConfigFile() {
    struct passwd* pw = getpwuid(getuid());
    std::string configPath = std::string(pw->pw_dir) + "/.config/croissant/token";

    std::ifstream file(configPath);
    if (file.is_open()) {
        std::string token;
        std::getline(file, token);
        return token;
    }

    return "";
}
#endif
```

## Testing

### Unit Test Example

```cpp
#include <gtest/gtest.h>
#include "croissant_api_new.hpp"

class CroissantAPITest : public ::testing::Test {
protected:
    void SetUp() override {
        // Use test token or mock
        api = std::make_unique<CroissantAPI::Client>("test_token");
    }

    std::unique_ptr<CroissantAPI::Client> api;
};

TEST_F(CroissantAPITest, UserSearchReturnsResults) {
    auto users = api->users.search("test");
    EXPECT_FALSE(users.empty());
}

TEST_F(CroissantAPITest, GameListReturnsGames) {
    auto games = api->games.list();
    EXPECT_FALSE(games.empty());

    for (const auto& game : games) {
        EXPECT_FALSE(game.name.empty());
        EXPECT_FALSE(game.gameId.empty());
        EXPECT_GE(game.price, 0.0);
    }
}

TEST_F(CroissantAPITest, InvalidTokenThrowsException) {
    CroissantAPI::Client invalidApi("invalid_token");
    EXPECT_THROW(invalidApi.users.getMe(), std::runtime_error);
}
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
- **C++ Standard**: C++17
- **CMake Version**: 3.15+
- **Last Updated**: July 2025

### Changelog

#### v1.0.0 (July 2025)

- Initial release
- Complete API coverage
- Modern C++17 implementation
- CMake integration
- Full documentation

---

_Built with ❤️ for the Croissant gaming community_
