# Croissant API Client Library - Java

A comprehensive Java client library for the Croissant gaming platform API. This library provides a fully typed interface for all platform features including user management, game operations, inventory, trading, and more.

## Installation

### Direct Download

Download the library files directly from the Croissant platform:

- **Java**: [CroissantAPI.java](https://croissant-api.eminium.ovh/downloadables/sdk-java/CroissantAPI.java)
- **Complete Package**: [croissant-api-java.zip](https://croissant-api.eminium.ovh/downloadables/sdk-java/croissant-api-java.zip)

### Maven Integration

```xml
<dependency>
    <groupId>fr.croissant</groupId>
    <artifactId>croissant-api</artifactId>
    <version>1.0.0</version>
</dependency>

<!-- Add Gson dependency -->
<dependency>
    <groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
    <version>2.10.1</version>
</dependency>
```

### Gradle Integration

```groovy
dependencies {
    implementation 'fr.croissant:croissant-api:1.0.0'
    implementation 'com.google.code.gson:gson:2.10.1'
}
```

### Manual Installation

```bash
# Download and compile
wget https://croissant-api.eminium.ovh/downloadables/sdk-java/CroissantAPI.java
wget https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar

# Compile
javac -cp gson-2.10.1.jar CroissantAPI.java

# Run your application
java -cp .:gson-2.10.1.jar YourApplication
```

## Requirements

- **Java**: 8+ (Java 8, 11, 17, or 21+)
- **Dependencies**: Gson 2.10.1+ (for JSON serialization)
- **No external dependencies**: Uses only standard Java libraries + Gson

## Getting Started

### Basic Initialization

```java
// Authenticated access (full functionality)
CroissantAPI api = new CroissantAPI("your_api_token");

// Public access (read-only operations)
CroissantAPI api = new CroissantAPI();
```

### Authentication

To perform authenticated operations, you need an API token:

1. **Via Web Dashboard**: Login to [croissant-api.eminium.ovh](https://croissant-api.eminium.ovh) and generate a token
2. **Via OAuth2**: Implement OAuth2 flow for third-party applications
3. **Via Bot Token**: Use dedicated bot tokens for automated systems

```java
// Environment variable (recommended)
String token = System.getenv("CROISSANT_API_TOKEN");
CroissantAPI api = new CroissantAPI(token);

// Or directly
CroissantAPI api = new CroissantAPI("your_token_here");
```

## API Reference

### Core Structure

#### `CroissantAPI`

Main API client class providing access to all platform modules.

**Constructor**

```java
public CroissantAPI(String token)  // With authentication
public CroissantAPI()              // Without authentication
```

**Available modules**

- `api.users` - User operations and profile management
- `api.games` - Game discovery and management
- `api.inventory` - Inventory operations
- `api.items` - Item management and marketplace
- `api.studios` - Studio and team management
- `api.lobbies` - Game lobby operations
- `api.trades` - Trading system
- `api.oauth2` - OAuth2 authentication
- `api.search` - Global search functionality

---

### Users Module (`api.users`)

#### `getMe(): User`

Retrieve the authenticated user's profile.

```java
try {
    CroissantAPI.User user = api.users.getMe(); // Requires authentication
    System.out.println("Welcome, " + user.username + "!");
    System.out.println("Balance: " + user.balance + " credits");
} catch (Exception e) {
    System.err.println("Error: " + e.getMessage());
}
```

#### `search(String query): List<User>`

Search for users by username.

```java
try {
    List<CroissantAPI.User> users = api.users.search("john");
    for (CroissantAPI.User user : users) {
        System.out.println("Found user: " + user.username);
    }
} catch (Exception e) {
    System.err.println("Search failed: " + e.getMessage());
}
```

#### `getUser(String userId): User`

Get a specific user by ID (supports Croissant ID, Discord ID, Google ID, or Steam ID).

```java
try {
    CroissantAPI.User user = api.users.getUser("user_12345");
    System.out.println("User: " + user.username);
} catch (Exception e) {
    System.err.println("User not found: " + e.getMessage());
}
```

#### `transferCredits(String targetUserId, int amount): Map<String, Object>`

Transfer credits to another user.

```java
try {
    Map<String, Object> result = api.users.transferCredits("user_67890", 100);
    System.out.println("Transfer completed: " + result);
} catch (Exception e) {
    System.err.println("Transfer failed: " + e.getMessage());
}
```

#### `verify(String userId, String verificationKey): Map<String, Object>`

Verify a user account.

```java
try {
    Map<String, Object> result = api.users.verify("user_id", "verification_key");
    System.out.println("Verification result: " + result);
} catch (Exception e) {
    System.err.println("Verification failed: " + e.getMessage());
}
```

#### `changeUsername(String username): Map<String, Object>`

Change the authenticated user's username.

```java
try {
    Map<String, Object> result = api.users.changeUsername("new_username");
    System.out.println("Username changed: " + result);
} catch (Exception e) {
    System.err.println("Username change failed: " + e.getMessage());
}
```

#### `changePassword(String oldPassword, String newPassword, String confirmPassword): Map<String, Object>`

Change the authenticated user's password.

```java
try {
    Map<String, Object> result = api.users.changePassword("old_pass", "new_pass", "new_pass");
    System.out.println("Password changed: " + result);
} catch (Exception e) {
    System.err.println("Password change failed: " + e.getMessage());
}
```

---

### Games Module (`api.games`)

#### `list(): List<Game>`

List all available games.

```java
try {
    List<CroissantAPI.Game> games = api.games.list();
    System.out.println("Available games: " + games.size());

    for (CroissantAPI.Game game : games) {
        System.out.println(game.name + " - " + game.price + " credits");
    }
} catch (Exception e) {
    System.err.println("Failed to load games: " + e.getMessage());
}
```

#### `search(String query): List<Game>`

Search games by name, genre, or description.

```java
try {
    List<CroissantAPI.Game> games = api.games.search("adventure platformer");
    for (CroissantAPI.Game game : games) {
        System.out.println("Found game: " + game.name + " - " + game.description);
    }
} catch (Exception e) {
    System.err.println("Search failed: " + e.getMessage());
}
```

#### `get(String gameId): Game`

Get detailed information about a specific game.

```java
try {
    CroissantAPI.Game game = api.games.get("game_abc123");
    System.out.println("Game: " + game.name);
    System.out.println("Price: " + game.price + " credits");
    System.out.println("Rating: " + game.rating + "/5");
    System.out.println("Developer: " + game.developer);
} catch (Exception e) {
    System.err.println("Game not found: " + e.getMessage());
}
```

#### `getMyCreatedGames(): List<Game>`

Get games created by the authenticated user.

```java
try {
    List<CroissantAPI.Game> myGames = api.games.getMyCreatedGames(); // Requires authentication
    System.out.println("Created games: " + myGames.size());
} catch (Exception e) {
    System.err.println("Failed to load created games: " + e.getMessage());
}
```

#### `getMyOwnedGames(): List<Game>`

Get games owned by the authenticated user.

```java
try {
    List<CroissantAPI.Game> ownedGames = api.games.getMyOwnedGames(); // Requires authentication
    System.out.println("Owned games: " + ownedGames.size());
} catch (Exception e) {
    System.err.println("Failed to load owned games: " + e.getMessage());
}
```

#### `create(Map<String, Object> gameData): Map<String, Object>`

Create a new game.

```java
try {
    Map<String, Object> gameData = new HashMap<>();
    gameData.put("name", "Awesome Platformer");
    gameData.put("description", "A fun platforming adventure");
    gameData.put("price", 29.99);
    gameData.put("genre", "Platformer");
    gameData.put("multiplayer", false);

    Map<String, Object> result = api.games.create(gameData); // Requires authentication
    System.out.println("Game created: " + result);
} catch (Exception e) {
    System.err.println("Game creation failed: " + e.getMessage());
}
```

#### `update(String gameId, Map<String, Object> gameData): Game`

Update an existing game.

```java
try {
    Map<String, Object> updates = new HashMap<>();
    updates.put("price", 24.99);
    updates.put("description", "Updated description with new features");

    CroissantAPI.Game updatedGame = api.games.update("game_abc123", updates); // Requires authentication
    System.out.println("Game updated: " + updatedGame.name);
} catch (Exception e) {
    System.err.println("Game update failed: " + e.getMessage());
}
```

#### `buy(String gameId): Map<String, Object>`

Purchase a game.

```java
try {
    Map<String, Object> result = api.games.buy("game_abc123"); // Requires authentication
    System.out.println("Purchase result: " + result);
} catch (Exception e) {
    System.err.println("Purchase failed: " + e.getMessage());
}
```

---

### Items Module (`api.items`)

#### `list(): List<Item>`

List all available items in the marketplace.

```java
try {
    List<CroissantAPI.Item> items = api.items.list();
    System.out.println("Available items: " + items.size());

    for (CroissantAPI.Item item : items) {
        System.out.println(item.name + " - " + item.price + " credits");
    }
} catch (Exception e) {
    System.err.println("Failed to load items: " + e.getMessage());
}
```

#### `search(String query): List<Item>`

Search items by name or description.

```java
try {
    List<CroissantAPI.Item> items = api.items.search("magic sword");
    for (CroissantAPI.Item item : items) {
        System.out.println("Found item: " + item.name + " - Price: " + item.price);
    }
} catch (Exception e) {
    System.err.println("Search failed: " + e.getMessage());
}
```

#### `get(String itemId): Item`

Get detailed information about a specific item.

```java
try {
    CroissantAPI.Item item = api.items.get("item_xyz789");
    System.out.println("Item: " + item.name);
    System.out.println("Description: " + item.description);
    System.out.println("Price: " + item.price + " credits");
} catch (Exception e) {
    System.err.println("Item not found: " + e.getMessage());
}
```

#### `getMyItems(): List<Item>`

Get items created by the authenticated user.

```java
try {
    List<CroissantAPI.Item> myItems = api.items.getMyItems(); // Requires authentication
    System.out.println("Created items: " + myItems.size());
} catch (Exception e) {
    System.err.println("Failed to load created items: " + e.getMessage());
}
```

#### `create(Map<String, Object> itemData): Map<String, Object>`

Create a new item for sale.

```java
try {
    Map<String, Object> itemData = new HashMap<>();
    itemData.put("name", "Enchanted Shield");
    itemData.put("description", "Provides magical protection");
    itemData.put("price", 150.0);
    itemData.put("iconHash", "optional_hash");

    Map<String, Object> result = api.items.create(itemData); // Requires authentication
    System.out.println("Item created: " + result);
} catch (Exception e) {
    System.err.println("Item creation failed: " + e.getMessage());
}
```

#### `update(String itemId, Map<String, Object> itemData): Map<String, Object>`

Update an existing item.

```java
try {
    Map<String, Object> updates = new HashMap<>();
    updates.put("price", 125.0);
    updates.put("description", "Updated description");

    Map<String, Object> result = api.items.update("item_xyz789", updates); // Requires authentication
    System.out.println("Item updated: " + result);
} catch (Exception e) {
    System.err.println("Item update failed: " + e.getMessage());
}
```

#### `delete(String itemId): Map<String, Object>`

Delete an item.

```java
try {
    Map<String, Object> result = api.items.delete("item_xyz789"); // Requires authentication
    System.out.println("Item deleted: " + result);
} catch (Exception e) {
    System.err.println("Item deletion failed: " + e.getMessage());
}
```

#### `buy(String itemId, int amount): Map<String, Object>`

Purchase items from the marketplace.

```java
try {
    Map<String, Object> result = api.items.buy("item_xyz789", 2); // Requires authentication
    System.out.println("Purchase completed: " + result);
} catch (Exception e) {
    System.err.println("Purchase failed: " + e.getMessage());
}
```

#### `sell(String itemId, int amount): Map<String, Object>`

Sell items from inventory.

```java
try {
    Map<String, Object> result = api.items.sell("item_xyz789", 1); // Requires authentication
    System.out.println("Sale completed: " + result);
} catch (Exception e) {
    System.err.println("Sale failed: " + e.getMessage());
}
```

#### `give(String itemId, int amount, String userId): Map<String, Object>`

Give items to another user.

```java
try {
    Map<String, Object> result = api.items.give("item_xyz789", 1, "user_67890"); // Requires authentication
    System.out.println("Gift completed: " + result);
} catch (Exception e) {
    System.err.println("Gift failed: " + e.getMessage());
}
```

#### `give(String itemId, int amount, String userId, Map<String, Object> metadata): Map<String, Object>`

Give items to another user with metadata.

```java
try {
    Map<String, Object> metadata = new HashMap<>();
    metadata.put("enchantment", "fire");
    metadata.put("level", 5);

    Map<String, Object> result = api.items.give("item_xyz789", 1, "user_67890", metadata); // Requires authentication
    System.out.println("Gift with metadata completed: " + result);
} catch (Exception e) {
    System.err.println("Gift failed: " + e.getMessage());
}
```

#### `consume(String itemId, int amount, String userId): Map<String, Object>`

Consume item instances from inventory.

```java
try {
    Map<String, Object> result = api.items.consume("item_xyz789", 1, "user_67890"); // Requires authentication
    System.out.println("Item consumed: " + result);
} catch (Exception e) {
    System.err.println("Consumption failed: " + e.getMessage());
}
```

#### `drop(String itemId, int amount): Map<String, Object>`

Drop items from inventory by amount.

```java
try {
    Map<String, Object> result = api.items.drop("item_xyz789", 1); // Requires authentication
    System.out.println("Item dropped: " + result);
} catch (Exception e) {
    System.err.println("Drop failed: " + e.getMessage());
}
```

#### `drop(String itemId, String uniqueId): Map<String, Object>`

Drop items from inventory by unique ID.

```java
try {
    Map<String, Object> result = api.items.drop("item_xyz789", "instance_123"); // Requires authentication
    System.out.println("Item dropped: " + result);
} catch (Exception e) {
    System.err.println("Drop failed: " + e.getMessage());
}
```

#### `updateMetadata(String itemId, String uniqueId, Map<String, Object> metadata): Map<String, Object>`

Update metadata for a specific item instance.

```java
try {
    Map<String, Object> metadata = new HashMap<>();
    metadata.put("enchantment", "ice");
    metadata.put("level", 10);

    Map<String, Object> result = api.items.updateMetadata("item_xyz789", "instance_123", metadata); // Requires authentication
    System.out.println("Metadata updated: " + result);
} catch (Exception e) {
    System.err.println("Metadata update failed: " + e.getMessage());
}
```

---

### Inventory Module (`api.inventory`)

#### `getMyInventory(): Inventory.InventoryResponse`

Get the authenticated user's inventory.

```java
try {
    CroissantAPI.Inventory.InventoryResponse inventory = api.inventory.getMyInventory(); // Requires authentication
    System.out.println("User ID: " + inventory.user_id);
    System.out.println("Items in inventory: " + inventory.inventory.size());

    for (CroissantAPI.InventoryItem item : inventory.inventory) {
        System.out.println(item.name + ": " + item.amount);
    }
} catch (Exception e) {
    System.err.println("Failed to load inventory: " + e.getMessage());
}
```

#### `get(String userId): Inventory.InventoryResponse`

Get another user's public inventory.

```java
try {
    CroissantAPI.Inventory.InventoryResponse userInventory = api.inventory.get("user_12345");
    System.out.println("User " + userInventory.user_id + " has " + userInventory.inventory.size() + " items");
} catch (Exception e) {
    System.err.println("Failed to load user inventory: " + e.getMessage());
}
```

---

### Studios Module (`api.studios`)

#### `create(String studioName): Map<String, Object>`

Create a new development studio.

```java
try {
    Map<String, Object> result = api.studios.create("Awesome Games Studio"); // Requires authentication
    System.out.println("Studio created: " + result);
} catch (Exception e) {
    System.err.println("Studio creation failed: " + e.getMessage());
}
```

#### `get(String studioId): Studio`

Get information about a specific studio.

```java
try {
    CroissantAPI.Studio studio = api.studios.get("studio_abc123");
    System.out.println("Studio: " + studio.username);
    System.out.println("Verified: " + studio.verified);
    System.out.println("Members: " + studio.users.size());
} catch (Exception e) {
    System.err.println("Studio not found: " + e.getMessage());
}
```

#### `getMyStudios(): List<Studio>`

Get studios the authenticated user is part of.

```java
try {
    List<CroissantAPI.Studio> myStudios = api.studios.getMyStudios(); // Requires authentication
    System.out.println("My studios: " + myStudios.size());

    for (CroissantAPI.Studio studio : myStudios) {
        System.out.println("Studio: " + studio.username + " (Admin: " + studio.isAdmin + ")");
    }
} catch (Exception e) {
    System.err.println("Failed to load studios: " + e.getMessage());
}
```

#### `addUser(String studioId, String userId): Map<String, Object>`

Add a user to a studio team.

```java
try {
    Map<String, Object> result = api.studios.addUser("studio_abc123", "user_67890"); // Requires authentication
    System.out.println("User added to studio: " + result);
} catch (Exception e) {
    System.err.println("Failed to add user to studio: " + e.getMessage());
}
```

#### `removeUser(String studioId, String userId): Map<String, Object>`

Remove a user from a studio team.

```java
try {
    Map<String, Object> result = api.studios.removeUser("studio_abc123", "user_67890"); // Requires authentication
    System.out.println("User removed from studio: " + result);
} catch (Exception e) {
    System.err.println("Failed to remove user from studio: " + e.getMessage());
}
```

---

### Lobbies Module (`api.lobbies`)

#### `create(): Map<String, Object>`

Create a new game lobby.

```java
try {
    Map<String, Object> result = api.lobbies.create(); // Requires authentication
    System.out.println("Lobby created: " + result);
} catch (Exception e) {
    System.err.println("Lobby creation failed: " + e.getMessage());
}
```

#### `get(String lobbyId): Lobby`

Get information about a specific lobby.

```java
try {
    CroissantAPI.Lobby lobby = api.lobbies.get("lobby_xyz789");
    System.out.println("Lobby ID: " + lobby.lobbyId);
    System.out.println("Players: " + lobby.users.size());

    for (CroissantAPI.Lobby.LobbyUser user : lobby.users) {
        System.out.println("Player: " + user.username + " (Verified: " + user.verified + ")");
    }
} catch (Exception e) {
    System.err.println("Lobby not found: " + e.getMessage());
}
```

#### `getMyLobby(): Lobby`

Get the authenticated user's current lobby.

```java
try {
    CroissantAPI.Lobby myLobby = api.lobbies.getMyLobby(); // Requires authentication
    System.out.println("My lobby: " + myLobby.lobbyId);
} catch (Exception e) {
    System.err.println("Not in a lobby: " + e.getMessage());
}
```

#### `getUserLobby(String userId): Lobby`

Get the lobby a specific user is in.

```java
try {
    CroissantAPI.Lobby userLobby = api.lobbies.getUserLobby("user_12345");
    System.out.println("User is in lobby: " + userLobby.lobbyId);
} catch (Exception e) {
    System.err.println("User not in a lobby: " + e.getMessage());
}
```

#### `join(String lobbyId): Map<String, Object>`

Join an existing lobby.

```java
try {
    Map<String, Object> result = api.lobbies.join("lobby_xyz789"); // Requires authentication
    System.out.println("Joined lobby: " + result);
} catch (Exception e) {
    System.err.println("Failed to join lobby: " + e.getMessage());
}
```

#### `leave(String lobbyId): Map<String, Object>`

Leave a lobby.

```java
try {
    Map<String, Object> result = api.lobbies.leave("lobby_xyz789"); // Requires authentication
    System.out.println("Left lobby: " + result);
} catch (Exception e) {
    System.err.println("Failed to leave lobby: " + e.getMessage());
}
```

---

### Trading Module (`api.trades`)

#### `startOrGetPending(String userId): Trade`

Start a new trade or get existing pending trade with a user.

```java
try {
    CroissantAPI.Trade trade = api.trades.startOrGetPending("user_67890"); // Requires authentication
    System.out.println("Trade ID: " + trade.id);
    System.out.println("Status: " + trade.status);
} catch (Exception e) {
    System.err.println("Failed to start trade: " + e.getMessage());
}
```

#### `get(String tradeId): Trade`

Get information about a specific trade.

```java
try {
    CroissantAPI.Trade trade = api.trades.get("trade_abc123");
    System.out.println("Trade status: " + trade.status);
    System.out.println("From user items: " + trade.fromUserItems.size());
    System.out.println("To user items: " + trade.toUserItems.size());
} catch (Exception e) {
    System.err.println("Trade not found: " + e.getMessage());
}
```

#### `getMyTrades(): List<Trade>`

Get all trades for the authenticated user.

```java
try {
    List<CroissantAPI.Trade> myTrades = api.trades.getMyTrades(); // Requires authentication
    System.out.println("My trades: " + myTrades.size());

    for (CroissantAPI.Trade trade : myTrades) {
        System.out.println("Trade " + trade.id + " - Status: " + trade.status);
    }
} catch (Exception e) {
    System.err.println("Failed to load trades: " + e.getMessage());
}
```

#### `getUserTrades(String userId): List<Trade>`

Get all trades for a specific user.

```java
try {
    List<CroissantAPI.Trade> userTrades = api.trades.getUserTrades("user_12345"); // Requires authentication
    System.out.println("User trades: " + userTrades.size());
} catch (Exception e) {
    System.err.println("Failed to load user trades: " + e.getMessage());
}
```

#### `addItem(String tradeId, TradeItem tradeItem): Map<String, Object>`

Add an item to a trade.

```java
try {
    CroissantAPI.TradeItem tradeItem = new CroissantAPI.TradeItem("item_xyz789", 1);
    Map<String, Object> result = api.trades.addItem("trade_abc123", tradeItem); // Requires authentication
    System.out.println("Item added to trade: " + result);
} catch (Exception e) {
    System.err.println("Failed to add item to trade: " + e.getMessage());
}
```

#### `removeItem(String tradeId, TradeItem tradeItem): Map<String, Object>`

Remove an item from a trade.

```java
try {
    CroissantAPI.TradeItem tradeItem = new CroissantAPI.TradeItem("item_xyz789", 1);
    Map<String, Object> result = api.trades.removeItem("trade_abc123", tradeItem); // Requires authentication
    System.out.println("Item removed from trade: " + result);
} catch (Exception e) {
    System.err.println("Failed to remove item from trade: " + e.getMessage());
}
```

#### `approve(String tradeId): Map<String, Object>`

Approve and execute a trade.

```java
try {
    Map<String, Object> result = api.trades.approve("trade_abc123"); // Requires authentication
    System.out.println("Trade approved: " + result);
} catch (Exception e) {
    System.err.println("Failed to approve trade: " + e.getMessage());
}
```

#### `cancel(String tradeId): Map<String, Object>`

Cancel a pending trade.

```java
try {
    Map<String, Object> result = api.trades.cancel("trade_abc123"); // Requires authentication
    System.out.println("Trade cancelled: " + result);
} catch (Exception e) {
    System.err.println("Failed to cancel trade: " + e.getMessage());
}
```

---

### Search Module (`api.search`)

#### `global(String query): Search.GlobalSearchResult`

Perform a global search across all content types.

```java
try {
    CroissantAPI.Search.GlobalSearchResult results = api.search.global("adventure game");
    System.out.println("Found " + results.games.size() + " games");
    System.out.println("Found " + results.users.size() + " users");
    System.out.println("Found " + results.items.size() + " items");
} catch (Exception e) {
    System.err.println("Search failed: " + e.getMessage());
}
```

---

### OAuth2 Module (`api.oauth2`)

#### `createApp(String name, List<String> redirectUrls): Map<String, String>`

Create a new OAuth2 application.

```java
try {
    List<String> redirectUrls = Arrays.asList("https://mygame.com/auth/callback");
    Map<String, String> result = api.oauth2.createApp("My Game Client", redirectUrls); // Requires authentication
    System.out.println("App created with client_id: " + result.get("client_id"));
} catch (Exception e) {
    System.err.println("App creation failed: " + e.getMessage());
}
```

#### `getApp(String clientId): OAuth2App`

Get OAuth2 application by client ID.

```java
try {
    CroissantAPI.OAuth2App app = api.oauth2.getApp("client_12345");
    System.out.println("App name: " + app.name);
    System.out.println("Redirect URLs: " + app.redirect_urls);
} catch (Exception e) {
    System.err.println("App not found: " + e.getMessage());
}
```

#### `getMyApps(): List<OAuth2App>`

Get OAuth2 applications owned by the authenticated user.

```java
try {
    List<CroissantAPI.OAuth2App> apps = api.oauth2.getMyApps(); // Requires authentication
    System.out.println("My apps: " + apps.size());

    for (CroissantAPI.OAuth2App app : apps) {
        System.out.println("App: " + app.name + " (ID: " + app.client_id + ")");
    }
} catch (Exception e) {
    System.err.println("Failed to load apps: " + e.getMessage());
}
```

#### `updateApp(String clientId, Map<String, Object> data): Map<String, Boolean>`

Update an OAuth2 application.

```java
try {
    Map<String, Object> updates = new HashMap<>();
    updates.put("name", "Updated App Name");

    Map<String, Boolean> result = api.oauth2.updateApp("client_12345", updates); // Requires authentication
    System.out.println("App update result: " + result);
} catch (Exception e) {
    System.err.println("App update failed: " + e.getMessage());
}
```

#### `deleteApp(String clientId): Map<String, String>`

Delete an OAuth2 application.

```java
try {
    Map<String, String> result = api.oauth2.deleteApp("client_12345"); // Requires authentication
    System.out.println("App deleted: " + result);
} catch (Exception e) {
    System.err.println("App deletion failed: " + e.getMessage());
}
```

#### `authorize(String clientId, String redirectUri): Map<String, String>`

Authorize a user for an OAuth2 app.

```java
try {
    Map<String, String> result = api.oauth2.authorize("client_12345", "https://app.com/callback"); // Requires authentication
    System.out.println("Authorization result: " + result);
} catch (Exception e) {
    System.err.println("Authorization failed: " + e.getMessage());
}
```

#### `getUserByCode(String code, String clientId): User`

Get user information using OAuth2 authorization code.

```java
try {
    CroissantAPI.User userData = api.oauth2.getUserByCode("auth_code", "client_12345");
    System.out.println("Authenticated user: " + userData.username);
} catch (Exception e) {
    System.err.println("Failed to get user by code: " + e.getMessage());
}
```

## Model Definitions

### Core Models

#### `User`

```java
public static class User {
    public String userId;
    public String username;
    public String email;
    public Double balance;
    public boolean verified;
    public String steam_id;
    public String steam_username;
    public String steam_avatar_url;
    public boolean isStudio;
    public boolean admin;
    public Boolean disabled;
    public String google_id;
    public String discord_id;
    public List<Studio> studios;
    public List<String> roles;
    public List<InventoryItem> inventory;
    public List<Item> ownedItems;
    public List<Game> createdGames;
    public Boolean haveAuthenticator;
    public String verificationKey;
}
```

#### `Game`

```java
public static class Game {
    public String gameId;
    public String name;
    public String description;
    public String owner_id;
    public String download_link;
    public double price;
    public boolean showInStore;
    public String iconHash;
    public String splashHash;
    public String bannerHash;
    public String genre;
    public String release_date;
    public String developer;
    public String publisher;
    public String platforms;
    public double rating;
    public String website;
    public String trailer_link;
    public boolean multiplayer;
}
```

#### `Item`

```java
public static class Item {
    public String itemId;
    public String name;
    public String description;
    public double price;
    public String owner;
    public boolean showInStore;
    public String iconHash;
    public boolean deleted;
}
```

#### `InventoryItem`

```java
public static class InventoryItem {
    public String user_id;
    public String item_id;
    public String itemId;
    public String name;
    public String description;
    public int amount;
    public String iconHash;
    public double price;
    public String owner;
    public boolean showInStore;
    public Map<String, Object> metadata;
}
```

#### `Trade`

```java
public static class Trade {
    public String id;
    public String fromUserId;
    public String toUserId;
    public List<TradeItemDetails> fromUserItems;
    public List<TradeItemDetails> toUserItems;
    public boolean approvedFromUser;
    public boolean approvedToUser;
    public String status;
    public String createdAt;
    public String updatedAt;
}
```

#### `TradeItem`

```java
public static class TradeItem {
    public String itemId;
    public int amount;
    public Map<String, Object> metadata;

    public TradeItem(String itemId, int amount) {
        this.itemId = itemId;
        this.amount = amount;
    }

    public TradeItem(String itemId, int amount, Map<String, Object> metadata) {
        this.itemId = itemId;
        this.amount = amount;
        this.metadata = metadata;
    }
}
```

#### `Studio`

```java
public static class Studio {
    public String user_id;
    public String username;
    public boolean verified;
    public String admin_id;
    public Boolean isAdmin;
    public String apiKey;
    public List<StudioUser> users;
}
```

#### `Lobby`

```java
public static class Lobby {
    public String lobbyId;
    public List<LobbyUser> users;
}
```

#### `OAuth2App`

```java
public static class OAuth2App {
    public String client_id;
    public String client_secret;
    public String name;
    public List<String> redirect_urls;
}
```

## Error Handling

All API methods throw exceptions on errors. Always wrap calls in try/catch blocks:

```java
try {
    CroissantAPI.User user = api.users.getMe();
    System.out.println("Welcome, " + user.username + "!");
} catch (IllegalStateException e) {
    if (e.getMessage().contains("token")) {
        System.err.println("Authentication required");
    }
} catch (RuntimeException e) {
    String message = e.getMessage();
    if (message.contains("401")) {
        System.err.println("Unauthorized - check token");
    } else if (message.contains("404")) {
        System.err.println("Resource not found");
    } else if (message.contains("403")) {
        System.err.println("Forbidden - insufficient permissions");
    } else if (message.contains("400")) {
        System.err.println("Bad request - check parameters");
    } else {
        System.err.println("API Error: " + message);
    }
} catch (Exception e) {
    System.err.println("Unexpected error: " + e.getMessage());
}
```

### Common Error Types

| Error Pattern                      | Description                      | Solution                    |
| ---------------------------------- | -------------------------------- | --------------------------- |
| `No authentication token provided` | Authentication required          | Provide valid API token     |
| HTTP 401                           | Invalid or expired token         | Refresh or regenerate token |
| HTTP 404                           | Resource not found               | Verify resource ID          |
| HTTP 400                           | Bad request/insufficient balance | Check request parameters    |
| HTTP 429                           | Rate limit exceeded              | Implement rate limiting     |
| HTTP 403                           | Permission denied                | Check token permissions     |

## Platform Integration

### Spring Boot Integration

```java
// Application.java
@SpringBootApplication
public class Application {
    @Bean
    public CroissantAPI croissantAPI(@Value("${croissant.api.token}") String token) {
        return new CroissantAPI(token);
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// GameController.java
@RestController
@RequestMapping("/api/games")
public class GameController {

    @Autowired
    private CroissantAPI croissantAPI;

    @GetMapping
    public ResponseEntity<List<CroissantAPI.Game>> listGames() {
        try {
            List<CroissantAPI.Game> games = croissantAPI.games.list();
            return ResponseEntity.ok(games);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<CroissantAPI.Game> getGame(@PathVariable String gameId) {
        try {
            CroissantAPI.Game game = croissantAPI.games.get(gameId);
            return ResponseEntity.ok(game);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{gameId}/buy")
    public ResponseEntity<Map<String, Object>> buyGame(@PathVariable String gameId) {
        try {
            Map<String, Object> result = croissantAPI.games.buy(gameId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

// PlayerController.java
@RestController
@RequestMapping("/api/players")
public class PlayerController {

    @Autowired
    private CroissantAPI croissantAPI;

    @GetMapping("/{playerId}")
    public ResponseEntity<PlayerInfo> getPlayer(@PathVariable String playerId) {
        try {
            CroissantAPI.User user = croissantAPI.users.getUser(playerId);
            CroissantAPI.Inventory.InventoryResponse inventory = croissantAPI.inventory.get(playerId);

            PlayerInfo playerInfo = new PlayerInfo();
            playerInfo.setUsername(user.username);
            playerInfo.setVerified(user.verified);
            playerInfo.setBalance(user.balance);
            playerInfo.setItemCount(inventory.inventory.size());

            return ResponseEntity.ok(playerInfo);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{playerId}/reward")
    public ResponseEntity<Map<String, Object>> giveReward(
            @PathVariable String playerId,
            @RequestBody RewardRequest request) {
        try {
            Map<String, Object> result = croissantAPI.items.give(
                request.getItemId(),
                request.getAmount(),
                playerId
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

// Data classes
public class PlayerInfo {
    private String username;
    private boolean verified;
    private Double balance;
    private int itemCount;

    // Getters and setters...
}

public class RewardRequest {
    private String itemId;
    private int amount;

    // Getters and setters...
}

// application.properties
croissant.api.token=${CROISSANT_API_TOKEN:your_default_token}
```

### Minecraft Plugin Integration

```java
// CroissantPlugin.java
public class CroissantPlugin extends JavaPlugin {
    private CroissantAPI croissantAPI;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        String token = getConfig().getString("croissant.token");
        croissantAPI = new CroissantAPI(token);

        getCommand("profile").setExecutor(new ProfileCommand(croissantAPI));
        getCommand("give").setExecutor(new GiveCommand(croissantAPI));
        getCommand("trade").setExecutor(new TradeCommand(croissantAPI));
    }
}

// ProfileCommand.java
public class ProfileCommand implements CommandExecutor {
    private final CroissantAPI api;

    public ProfileCommand(CroissantAPI api) {
        this.api = api;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("This command can only be used by players");
            return true;
        }

        Player player = (Player) sender;

        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                // Use player's UUID or custom ID system
                CroissantAPI.User user = api.users.getUser(player.getUniqueId().toString());
                CroissantAPI.Inventory.InventoryResponse inventory = api.inventory.get(player.getUniqueId().toString());

                Bukkit.getScheduler().runTask(plugin, () -> {
                    player.sendMessage("§6=== Croissant Profile ===");
                    player.sendMessage("§7Username: §f" + user.username);
                    player.sendMessage("§7Balance: §f" + user.balance + " credits");
                    player.sendMessage("§7Items: §f" + inventory.inventory.size());
                    player.sendMessage("§7Verified: " + (user.verified ? "§aYes" : "§cNo"));
                });
            } catch (Exception e) {
                Bukkit.getScheduler().runTask(plugin, () -> {
                    player.sendMessage("§cFailed to load profile: " + e.getMessage());
                });
            }
        });

        return true;
    }
}

// GiveCommand.java
public class GiveCommand implements CommandExecutor {
    private final CroissantAPI api;

    public GiveCommand(CroissantAPI api) {
        this.api = api;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length < 3) {
            sender.sendMessage("Usage: /give <player> <item_id> <amount>");
            return true;
        }

        String targetPlayer = args[0];
        String itemId = args[1];
        int amount;

        try {
            amount = Integer.parseInt(args[2]);
        } catch (NumberFormatException e) {
            sender.sendMessage("§cInvalid amount");
            return true;
        }

        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                Map<String, Object> result = api.items.give(itemId, amount, targetPlayer);

                Bukkit.getScheduler().runTask(plugin, () -> {
                    sender.sendMessage("§aGave " + amount + "x " + itemId + " to " + targetPlayer);
                });
            } catch (Exception e) {
                Bukkit.getScheduler().runTask(plugin, () -> {
                    sender.sendMessage("§cFailed to give item: " + e.getMessage());
                });
            }
        });

        return true;
    }
}

// config.yml
croissant:
  token: "your_api_token_here"

# plugin.yml
name: CroissantPlugin
version: 1.0.0
main: com.example.CroissantPlugin
api-version: 1.16
commands:
  profile:
    description: Show Croissant profile
  give:
    description: Give items to players
  trade:
    description: Manage trades
```

### Android Game Integration

```java
// CroissantManager.java
public class CroissantManager {
    private CroissantAPI api;
    private Context context;

    public CroissantManager(Context context) {
        this.context = context;
        String token = getStoredToken();
        this.api = new CroissantAPI(token);
    }

    private String getStoredToken() {
        SharedPreferences prefs = context.getSharedPreferences("croissant", Context.MODE_PRIVATE);
        return prefs.getString("api_token", null);
    }

    public void saveToken(String token) {
        SharedPreferences prefs = context.getSharedPreferences("croissant", Context.MODE_PRIVATE);
        prefs.edit().putString("api_token", token).apply();
        this.api = new CroissantAPI(token);
    }

    public void loginPlayer(String playerId, Callback<PlayerData> callback) {
        new AsyncTask<Void, Void, PlayerData>() {
            @Override
            protected PlayerData doInBackground(Void... voids) {
                try {
                    CroissantAPI.User user = api.users.getUser(playerId);
                    CroissantAPI.Inventory.InventoryResponse inventory = api.inventory.get(playerId);

                    PlayerData data = new PlayerData();
                    data.username = user.username;
                    data.verified = user.verified;
                    data.balance = user.balance;
                    data.itemCount = inventory.inventory.size();

                    return data;
                } catch (Exception e) {
                    return null;
                }
            }

            @Override
            protected void onPostExecute(PlayerData result) {
                if (result != null) {
                    callback.onSuccess(result);
                } else {
                    callback.onError("Failed to load player data");
                }
            }
        }.execute();
    }

    public void giveQuestReward(String playerId, String itemId, int amount, Callback<Boolean> callback) {
        new AsyncTask<Void, Void, Boolean>() {
            @Override
            protected Boolean doInBackground(Void... voids) {
                try {
                    api.items.give(itemId, amount, playerId);
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }

            @Override
            protected void onPostExecute(Boolean success) {
                if (success) {
                    callback.onSuccess(success);
                } else {
                    callback.onError("Failed to give reward");
                }
            }
        }.execute();
    }

    public interface Callback<T> {
        void onSuccess(T result);
        void onError(String error);
    }

    public static class PlayerData {
        public String username;
        public boolean verified;
        public Double balance;
        public int itemCount;
    }
}

// MainActivity.java
public class MainActivity extends AppCompatActivity {
    private CroissantManager croissantManager;
    private TextView usernameText, balanceText, itemCountText;
    private Button loginButton, rewardButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        croissantManager = new CroissantManager(this);

        usernameText = findViewById(R.id.username);
        balanceText = findViewById(R.id.balance);
        itemCountText = findViewById(R.id.itemCount);
        loginButton = findViewById(R.id.loginButton);
        rewardButton = findViewById(R.id.rewardButton);

        loginButton.setOnClickListener(v -> loginPlayer());
        rewardButton.setOnClickListener(v -> giveReward());
    }

    private void loginPlayer() {
        String playerId = "player_12345"; // Get from input or user system

        croissantManager.loginPlayer(playerId, new CroissantManager.Callback<CroissantManager.PlayerData>() {
            @Override
            public void onSuccess(CroissantManager.PlayerData result) {
                usernameText.setText("Username: " + result.username);
                balanceText.setText("Balance: " + result.balance + " credits");
                itemCountText.setText("Items: " + result.itemCount);

                Toast.makeText(MainActivity.this, "Login successful!", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onError(String error) {
                Toast.makeText(MainActivity.this, error, Toast.LENGTH_LONG).show();
            }
        });
    }

    private void giveReward() {
        String playerId = "player_12345";
        String itemId = "quest_reward_1";
        int amount = 1;

        croissantManager.giveQuestReward(playerId, itemId, amount, new CroissantManager.Callback<Boolean>() {
            @Override
            public void onSuccess(Boolean result) {
                Toast.makeText(MainActivity.this, "Reward given!", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onError(String error) {
                Toast.makeText(MainActivity.this, error, Toast.LENGTH_LONG).show();
            }
        });
    }
}
```

## Complete Examples

### Complete Game Store Implementation

```java
import java.util.*;
import java.util.stream.Collectors;

public class GameStore {
    private final CroissantAPI api;

    public GameStore(String apiToken) {
        this.api = new CroissantAPI(apiToken);
    }

    // Browse games with filters
    public List<CroissantAPI.Game> browseGames(BrowseOptions options) throws Exception {
        List<CroissantAPI.Game> games;

        if (options.search != null && !options.search.isEmpty()) {
            games = api.games.search(options.search);
        } else {
            games = api.games.list();
        }

        // Apply filters
        if (options.maxPrice != null) {
            games = games.stream()
                    .filter(game -> game.price <= options.maxPrice)
                    .collect(Collectors.toList());
        }

        if (options.minRating != null) {
            games = games.stream()
                    .filter(game -> game.rating >= options.minRating)
                    .collect(Collectors.toList());
        }

        if (options.multiplayer != null) {
            games = games.stream()
                    .filter(game -> game.multiplayer == options.multiplayer)
                    .collect(Collectors.toList());
        }

        return games;
    }

    // Browse items with filters
    public List<CroissantAPI.Item> browseItems(BrowseOptions options) throws Exception {
        List<CroissantAPI.Item> items;

        if (options.search != null && !options.search.isEmpty()) {
            items = api.items.search(options.search);
        } else {
            items = api.items.list();
        }

        // Apply filters
        if (options.maxPrice != null) {
            items = items.stream()
                    .filter(item -> item.price <= options.maxPrice)
                    .collect(Collectors.toList());
        }

        // Filter out deleted items
        items = items.stream()
                .filter(item -> !item.deleted)
                .collect(Collectors.toList());

        return items;
    }

    // Purchase item with balance check
    public PurchaseResult purchaseItem(String itemId, int quantity) throws Exception {
        // Get item details
        CroissantAPI.Item item = api.items.get(itemId);

        // Check user balance
        CroissantAPI.User user = api.users.getMe();
        double totalCost = item.price * quantity;

        if (user.balance == null || user.balance < totalCost) {
            throw new Exception("Insufficient balance");
        }

        // Make purchase
        Map<String, Object> result = api.items.buy(itemId, quantity);

        return new PurchaseResult(true, item, quantity, totalCost, user.balance - totalCost, result);
    }

    // Get user's game library
    public List<CroissantAPI.Game> getLibrary() throws Exception {
        return api.games.getMyOwnedGames();
    }

    // Get user's inventory
    public CroissantAPI.Inventory.InventoryResponse getInventory() throws Exception {
        return api.inventory.getMyInventory();
    }

    public static class BrowseOptions {
        public String search;
        public Double maxPrice;
        public Double minRating;
        public Boolean multiplayer;

        public BrowseOptions() {}

        public BrowseOptions(String search, Double maxPrice, Double minRating, Boolean multiplayer) {
            this.search = search;
            this.maxPrice = maxPrice;
            this.minRating = minRating;
            this.multiplayer = multiplayer;
        }
    }

    public static class PurchaseResult {
        public boolean success;
        public CroissantAPI.Item item;
        public int quantity;
        public double totalCost;
        public double newBalance;
        public Map<String, Object> result;

        public PurchaseResult(boolean success, CroissantAPI.Item item, int quantity,
                            double totalCost, double newBalance, Map<String, Object> result) {
            this.success = success;
            this.item = item;
            this.quantity = quantity;
            this.totalCost = totalCost;
            this.newBalance = newBalance;
            this.result = result;
        }
    }

    // Usage example
    public static void main(String[] args) {
        try {
            GameStore store = new GameStore(System.getenv("CROISSANT_API_TOKEN"));

            // Browse and purchase
            BrowseOptions options = new BrowseOptions("adventure", 50.0, null, null);
            List<CroissantAPI.Game> games = store.browseGames(options);
            System.out.println("Found " + games.size() + " adventure games under 50 credits");

            List<CroissantAPI.Item> items = store.browseItems(new BrowseOptions("sword", 100.0, null, null));
            System.out.println("Found " + items.size() + " swords under 100 credits");

            // Purchase item
            PurchaseResult purchaseResult = store.purchaseItem("item_123", 1);
            System.out.println("Purchase successful! New balance: " + purchaseResult.newBalance);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}
```

### Trading System Implementation

```java
import java.util.*;

public class TradingSystem {
    private final CroissantAPI api;

    public TradingSystem(String apiToken) {
        this.api = new CroissantAPI(apiToken);
    }

    // Create a trade offer
    public CroissantAPI.Trade createTradeOffer(String targetUserId, List<OfferItem> offeredItems) throws Exception {
        // Start trade
        CroissantAPI.Trade trade = api.trades.startOrGetPending(targetUserId);

        // Add items to trade
        for (OfferItem item : offeredItems) {
            CroissantAPI.TradeItem tradeItem = new CroissantAPI.TradeItem(item.id, item.amount, item.metadata);
            api.trades.addItem(trade.id, tradeItem);
        }

        System.out.println("Trade offer created: " + trade.id);
        return trade;
    }

    // Get all user's trades
    public List<CroissantAPI.Trade> getUserTrades() throws Exception {
        return api.trades.getMyTrades();
    }

    // Accept a trade
    public Map<String, Object> acceptTrade(String tradeId) throws Exception {
        Map<String, Object> result = api.trades.approve(tradeId);
        System.out.println("Trade accepted: " + tradeId);
        return result;
    }

    // Cancel a trade
    public Map<String, Object> cancelTrade(String tradeId) throws Exception {
        Map<String, Object> result = api.trades.cancel(tradeId);
        System.out.println("Trade cancelled: " + tradeId);
        return result;
    }

    // Get trade details
    public CroissantAPI.Trade getTradeDetails(String tradeId) throws Exception {
        return api.trades.get(tradeId);
    }

    public static class OfferItem {
        public String id;
        public int amount;
        public Map<String, Object> metadata;

        public OfferItem(String id, int amount) {
            this.id = id;
            this.amount = amount;
        }

        public OfferItem(String id, int amount, Map<String, Object> metadata) {
            this.id = id;
            this.amount = amount;
            this.metadata = metadata;
        }
    }

    // Usage example
    public static void main(String[] args) {
        try {
            TradingSystem trading = new TradingSystem(System.getenv("CROISSANT_API_TOKEN"));

            // Create a trade offer
            List<OfferItem> offer = Arrays.asList(
                new OfferItem("sword_123", 1),
                new OfferItem("potion_456", 5)
            );

            CroissantAPI.Trade trade = trading.createTradeOffer("other_player_id", offer);
            System.out.println("Trade created: " + trade.id);

            // List my trades
            List<CroissantAPI.Trade> myTrades = trading.getUserTrades();
            System.out.println("I have " + myTrades.size() + " active trades");

            // Accept a trade (example)
            // trading.acceptTrade("trade_id_here");
        } catch (Exception e) {
            System.err.println("Trading error: " + e.getMessage());
        }
    }
}
```

## Best Practices

### Rate Limiting

```java
import java.util.concurrent.Semaphore;

public class RateLimitedAPI {
    private final CroissantAPI api;
    private long lastRequest = 0;
    private final long minInterval = 100; // ms between requests
    private final Semaphore semaphore = new Semaphore(1);

    public RateLimitedAPI(String apiToken) {
        this.api = new CroissantAPI(apiToken);
    }

    private void throttle() throws InterruptedException {
        semaphore.acquire();
        try {
            long timeSinceLastRequest = System.currentTimeMillis() - lastRequest;
            if (timeSinceLastRequest < minInterval) {
                Thread.sleep(minInterval - timeSinceLastRequest);
            }
            lastRequest = System.currentTimeMillis();
        } finally {
            semaphore.release();
        }
    }

    public <T> T safeRequest(RequestFunction<T> request) throws Exception {
        throttle();
        return request.execute();
    }

    @FunctionalInterface
    public interface RequestFunction<T> {
        T execute() throws Exception;
    }

    // Usage
    public CroissantAPI.User getUser(String userId) throws Exception {
        return safeRequest(() -> api.users.getUser(userId));
    }

    public List<CroissantAPI.Item> searchItems(String query) throws Exception {
        return safeRequest(() -> api.items.search(query));
    }
}
```

### Caching Strategy

````java
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

public class CachedCroissantAPI {
    private final CroissantAPI api;
    // filepath: d:\Documents\Croissant\Website\public\downloadables\sdk-java\README.md
# Croissant API Client Library - Java

A comprehensive Java client library for the Croissant gaming platform API. This library provides a fully typed interface for all platform features including user management, game operations, inventory, trading, and more.

## Installation

### Direct Download
Download the library files directly from the Croissant platform:
- **Java**: [CroissantAPI.java](https://croissant-api.eminium.ovh/downloadables/sdk-java/CroissantAPI.java)
- **Complete Package**: [croissant-api-java.zip](https://croissant-api.eminium.ovh/downloadables/sdk-java/croissant-api-java.zip)

### Maven Integration
```xml
<dependency>
    <groupId>fr.croissant</groupId>
    <artifactId>croissant-api</artifactId>
    <version>1.0.0</version>
</dependency>

<!-- Add Gson dependency -->
<dependency>
    <groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
    <version>2.10.1</version>
</dependency>
````

### Gradle Integration

```groovy
dependencies {
    implementation 'fr.croissant:croissant-api:1.0.0'
    implementation 'com.google.code.gson:gson:2.10.1'
}
```

### Manual Installation

```bash
# Download and compile
wget https://croissant-api.eminium.ovh/downloadables/sdk-java/CroissantAPI.java
wget https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar

# Compile
javac -cp gson-2.10.1.jar CroissantAPI.java

# Run your application
java -cp .:gson-2.10.1.jar YourApplication
```

## Requirements

- **Java**: 8+ (Java 8, 11, 17, or 21+)
- **Dependencies**: Gson 2.10.1+ (for JSON serialization)
- **No external dependencies**: Uses only standard Java libraries + Gson

## Getting Started

### Basic Initialization

```java
// Authenticated access (full functionality)
CroissantAPI api = new CroissantAPI("your_api_token");

// Public access (read-only operations)
CroissantAPI api = new CroissantAPI();
```

### Authentication

To perform authenticated operations, you need an API token:

1. **Via Web Dashboard**: Login to [croissant-api.eminium.ovh](https://croissant-api.eminium.ovh) and generate a token
2. **Via OAuth2**: Implement OAuth2 flow for third-party applications
3. **Via Bot Token**: Use dedicated bot tokens for automated systems

```java
// Environment variable (recommended)
String token = System.getenv("CROISSANT_API_TOKEN");
CroissantAPI api = new CroissantAPI(token);

// Or directly
CroissantAPI api = new CroissantAPI("your_token_here");
```

## API Reference

### Core Structure

#### `CroissantAPI`

Main API client class providing access to all platform modules.

**Constructor**

```java
public CroissantAPI(String token)  // With authentication
public CroissantAPI()              // Without authentication
```

**Available modules**

- `api.users` - User operations and profile management
- `api.games` - Game discovery and management
- `api.inventory` - Inventory operations
- `api.items` - Item management and marketplace
- `api.studios` - Studio and team management
- `api.lobbies` - Game lobby operations
- `api.trades` - Trading system
- `api.oauth2` - OAuth2 authentication
- `api.search` - Global search functionality

---

### Users Module (`api.users`)

#### `getMe(): User`

Retrieve the authenticated user's profile.

```java
try {
    CroissantAPI.User user = api.users.getMe(); // Requires authentication
    System.out.println("Welcome, " + user.username + "!");
    System.out.println("Balance: " + user.balance + " credits");
} catch (Exception e) {
    System.err.println("Error: " + e.getMessage());
}
```

#### `search(String query): List<User>`

Search for users by username.

```java
try {
    List<CroissantAPI.User> users = api.users.search("john");
    for (CroissantAPI.User user : users) {
        System.out.println("Found user: " + user.username);
    }
} catch (Exception e) {
    System.err.println("Search failed: " + e.getMessage());
}
```

#### `getUser(String userId): User`

Get a specific user by ID (supports Croissant ID, Discord ID, Google ID, or Steam ID).

```java
try {
    CroissantAPI.User user = api.users.getUser("user_12345");
    System.out.println("User: " + user.username);
} catch (Exception e) {
    System.err.println("User not found: " + e.getMessage());
}
```

#### `transferCredits(String targetUserId, int amount): Map<String, Object>`

Transfer credits to another user.

```java
try {
    Map<String, Object> result = api.users.transferCredits("user_67890", 100);
    System.out.println("Transfer completed: " + result);
} catch (Exception e) {
    System.err.println("Transfer failed: " + e.getMessage());
}
```

#### `verify(String userId, String verificationKey): Map<String, Object>`

Verify a user account.

```java
try {
    Map<String, Object> result = api.users.verify("user_id", "verification_key");
    System.out.println("Verification result: " + result);
} catch (Exception e) {
    System.err.println("Verification failed: " + e.getMessage());
}
```

#### `changeUsername(String username): Map<String, Object>`

Change the authenticated user's username.

```java
try {
    Map<String, Object> result = api.users.changeUsername("new_username");
    System.out.println("Username changed: " + result);
} catch (Exception e) {
    System.err.println("Username change failed: " + e.getMessage());
}
```

#### `changePassword(String oldPassword, String newPassword, String confirmPassword): Map<String, Object>`

Change the authenticated user's password.

```java
try {
    Map<String, Object> result = api.users.changePassword("old_pass", "new_pass", "new_pass");
    System.out.println("Password changed: " + result);
} catch (Exception e) {
    System.err.println("Password change failed: " + e.getMessage());
}
```

---

### Games Module (`api.games`)

#### `list(): List<Game>`

List all available games.

```java
try {
    List<CroissantAPI.Game> games = api.games.list();
    System.out.println("Available games: " + games.size());

    for (CroissantAPI.Game game : games) {
        System.out.println(game.name + " - " + game.price + " credits");
    }
} catch (Exception e) {
    System.err.println("Failed to load games: " + e.getMessage());
}
```

#### `search(String query): List<Game>`

Search games by name, genre, or description.

```java
try {
    List<CroissantAPI.Game> games = api.games.search("adventure platformer");
    for (CroissantAPI.Game game : games) {
        System.out.println("Found game: " + game.name + " - " + game.description);
    }
} catch (Exception e) {
    System.err.println("Search failed: " + e.getMessage());
}
```

#### `get(String gameId): Game`

Get detailed information about a specific game.

```java
try {
    CroissantAPI.Game game = api.games.get("game_abc123");
    System.out.println("Game: " + game.name);
    System.out.println("Price: " + game.price + " credits");
    System.out.println("Rating: " + game.rating + "/5");
    System.out.println("Developer: " + game.developer);
} catch (Exception e) {
    System.err.println("Game not found: " + e.getMessage());
}
```

#### `getMyCreatedGames(): List<Game>`

Get games created by the authenticated user.

```java
try {
    List<CroissantAPI.Game> myGames = api.games.getMyCreatedGames(); // Requires authentication
    System.out.println("Created games: " + myGames.size());
} catch (Exception e) {
    System.err.println("Failed to load created games: " + e.getMessage());
}
```

#### `getMyOwnedGames(): List<Game>`

Get games owned by the authenticated user.

```java
try {
    List<CroissantAPI.Game> ownedGames = api.games.getMyOwnedGames(); // Requires authentication
    System.out.println("Owned games: " + ownedGames.size());
} catch (Exception e) {
    System.err.println("Failed to load owned games: " + e.getMessage());
}
```

#### `create(Map<String, Object> gameData): Map<String, Object>`

Create a new game.

```java
try {
    Map<String, Object> gameData = new HashMap<>();
    gameData.put("name", "Awesome Platformer");
    gameData.put("description", "A fun platforming adventure");
    gameData.put("price", 29.99);
    gameData.put("genre", "Platformer");
    gameData.put("multiplayer", false);

    Map<String, Object> result = api.games.create(gameData); // Requires authentication
    System.out.println("Game created: " + result);
} catch (Exception e) {
    System.err.println("Game creation failed: " + e.getMessage());
}
```

#### `update(String gameId, Map<String, Object> gameData): Game`

Update an existing game.

```java
try {
    Map<String, Object> updates = new HashMap<>();
    updates.put("price", 24.99);
    updates.put("description", "Updated description with new features");

    CroissantAPI.Game updatedGame = api.games.update("game_abc123", updates); // Requires authentication
    System.out.println("Game updated: " + updatedGame.name);
} catch (Exception e) {
    System.err.println("Game update failed: " + e.getMessage());
}
```

#### `buy(String gameId): Map<String, Object>`

Purchase a game.

```java
try {
    Map<String, Object> result = api.games.buy("game_abc123"); // Requires authentication
    System.out.println("Purchase result: " + result);
} catch (Exception e) {
    System.err.println("Purchase failed: " + e.getMessage());
}
```

---

### Items Module (`api.items`)

#### `list(): List<Item>`

List all available items in the marketplace.

```java
try {
    List<CroissantAPI.Item> items = api.items.list();
    System.out.println("Available items: " + items.size());

    for (CroissantAPI.Item item : items) {
        System.out.println(item.name + " - " + item.price + " credits");
    }
} catch (Exception e) {
    System.err.println("Failed to load items: " + e.getMessage());
}
```

#### `search(String query): List<Item>`

Search items by name or description.

```java
try {
    List<CroissantAPI.Item> items = api.items.search("magic sword");
    for (CroissantAPI.Item item : items) {
        System.out.println("Found item: " + item.name + " - Price: " + item.price);
    }
} catch (Exception e) {
    System.err.println("Search failed: " + e.getMessage());
}
```

#### `get(String itemId): Item`

Get detailed information about a specific item.

```java
try {
    CroissantAPI.Item item = api.items.get("item_xyz789");
    System.out.println("Item: " + item.name);
    System.out.println("Description: " + item.description);
    System.out.println("Price: " + item.price + " credits");
} catch (Exception e) {
    System.err.println("Item not found: " + e.getMessage());
}
```

#### `getMyItems(): List<Item>`

Get items created by the authenticated user.

```java
try {
    List<CroissantAPI.Item> myItems = api.items.getMyItems(); // Requires authentication
    System.out.println("Created items: " + myItems.size());
} catch (Exception e) {
    System.err.println("Failed to load created items: " + e.getMessage());
}
```

#### `create(Map<String, Object> itemData): Map<String, Object>`

Create a new item for sale.

```java
try {
    Map<String, Object> itemData = new HashMap<>();
    itemData.put("name", "Enchanted Shield");
    itemData.put("description", "Provides magical protection");
    itemData.put("price", 150.0);
    itemData.put("iconHash", "optional_hash");

    Map<String, Object> result = api.items.create(itemData); // Requires authentication
    System.out.println("Item created: " + result);
} catch (Exception e) {
    System.err.println("Item creation failed: " + e.getMessage());
}
```

#### `update(String itemId, Map<String, Object> itemData): Map<String, Object>`

Update an existing item.

```java
try {
    Map<String, Object> updates = new HashMap<>();
    updates.put("price", 125.0);
    updates.put("description", "Updated description");

    Map<String, Object> result = api.items.update("item_xyz789", updates); // Requires authentication
    System.out.println("Item updated: " + result);
} catch (Exception e) {
    System.err.println("Item update failed: " + e.getMessage());
}
```

#### `delete(String itemId): Map<String, Object>`

Delete an item.

```java
try {
    Map<String, Object> result = api.items.delete("item_xyz789"); // Requires authentication
    System.out.println("Item deleted: " + result);
} catch (Exception e) {
    System.err.println("Item deletion failed: " + e.getMessage());
}
```

#### `buy(String itemId, int amount): Map<String, Object>`

Purchase items from the marketplace.

```java
try {
    Map<String, Object> result = api.items.buy("item_xyz789", 2); // Requires authentication
    System.out.println("Purchase completed: " + result);
} catch (Exception e) {
    System.err.println("Purchase failed: " + e.getMessage());
}
```

#### `sell(String itemId, int amount): Map<String, Object>`

Sell items from inventory.

```java
try {
    Map<String, Object> result = api.items.sell("item_xyz789", 1); // Requires authentication
    System.out.println("Sale completed: " + result);
} catch (Exception e) {
    System.err.println("Sale failed: " + e.getMessage());
}
```

#### `give(String itemId, int amount, String userId): Map<String, Object>`

Give items to another user.

```java
try {
    Map<String, Object> result = api.items.give("item_xyz789", 1, "user_67890"); // Requires authentication
    System.out.println("Gift completed: " + result);
} catch (Exception e) {
    System.err.println("Gift failed: " + e.getMessage());
}
```

#### `give(String itemId, int amount, String userId, Map<String, Object> metadata): Map<String, Object>`

Give items to another user with metadata.

```java
try {
    Map<String, Object> metadata = new HashMap<>();
    metadata.put("enchantment", "fire");
    metadata.put("level", 5);

    Map<String, Object> result = api.items.give("item_xyz789", 1, "user_67890", metadata); // Requires authentication
    System.out.println("Gift with metadata completed: " + result);
} catch (Exception e) {
    System.err.println("Gift failed: " + e.getMessage());
}
```

#### `consume(String itemId, int amount, String userId): Map<String, Object>`

Consume item instances from inventory.

```java
try {
    Map<String, Object> result = api.items.consume("item_xyz789", 1, "user_67890"); // Requires authentication
    System.out.println("Item consumed: " + result);
} catch (Exception e) {
    System.err.println("Consumption failed: " + e.getMessage());
}
```

#### `drop(String itemId, int amount): Map<String, Object>`

Drop items from inventory by amount.

```java
try {
    Map<String, Object> result = api.items.drop("item_xyz789", 1); // Requires authentication
    System.out.println("Item dropped: " + result);
} catch (Exception e) {
    System.err.println("Drop failed: " + e.getMessage());
}
```

#### `drop(String itemId, String uniqueId): Map<String, Object>`

Drop items from inventory by unique ID.

```java
try {
    Map<String, Object> result = api.items.drop("item_xyz789", "instance_123"); // Requires authentication
    System.out.println("Item dropped: " + result);
} catch (Exception e) {
    System.err.println("Drop failed: " + e.getMessage());
}
```

#### `updateMetadata(String itemId, String uniqueId, Map<String, Object> metadata): Map<String, Object>`

Update metadata for a specific item instance.

```java
try {
    Map<String, Object> metadata = new HashMap<>();
    metadata.put("enchantment", "ice");
    metadata.put("level", 10);

    Map<String, Object> result = api.items.updateMetadata("item_xyz789", "instance_123", metadata); // Requires authentication
    System.out.println("Metadata updated: " + result);
} catch (Exception e) {
    System.err.println("Metadata update failed: " + e.getMessage());
}
```

---

### Inventory Module (`api.inventory`)

#### `getMyInventory(): Inventory.InventoryResponse`

Get the authenticated user's inventory.

```java
try {
    CroissantAPI.Inventory.InventoryResponse inventory = api.inventory.getMyInventory(); // Requires authentication
    System.out.println("User ID: " + inventory.user_id);
    System.out.println("Items in inventory: " + inventory.inventory.size());

    for (CroissantAPI.InventoryItem item : inventory.inventory) {
        System.out.println(item.name + ": " + item.amount);
    }
} catch (Exception e) {
    System.err.println("Failed to load inventory: " + e.getMessage());
}
```

#### `get(String userId): Inventory.InventoryResponse`

Get another user's public inventory.

```java
try {
    CroissantAPI.Inventory.InventoryResponse userInventory = api.inventory.get("user_12345");
    System.out.println("User " + userInventory.user_id + " has " + userInventory.inventory.size() + " items");
} catch (Exception e) {
    System.err.println("Failed to load user inventory: " + e.getMessage());
}
```

---

### Studios Module (`api.studios`)

#### `create(String studioName): Map<String, Object>`

Create a new development studio.

```java
try {
    Map<String, Object> result = api.studios.create("Awesome Games Studio"); // Requires authentication
    System.out.println("Studio created: " + result);
} catch (Exception e) {
    System.err.println("Studio creation failed: " + e.getMessage());
}
```

#### `get(String studioId): Studio`

Get information about a specific studio.

```java
try {
    CroissantAPI.Studio studio = api.studios.get("studio_abc123");
    System.out.println("Studio: " + studio.username);
    System.out.println("Verified: " + studio.verified);
    System.out.println("Members: " + studio.users.size());
} catch (Exception e) {
    System.err.println("Studio not found: " + e.getMessage());
}
```

#### `getMyStudios(): List<Studio>`

Get studios the authenticated user is part of.

```java
try {
    List<CroissantAPI.Studio> myStudios = api.studios.getMyStudios(); // Requires authentication
    System.out.println("My studios: " + myStudios.size());

    for (CroissantAPI.Studio studio : myStudios) {
        System.out.println("Studio: " + studio.username + " (Admin: " + studio.isAdmin + ")");
    }
} catch (Exception e) {
    System.err.println("Failed to load studios: " + e.getMessage());
}
```

#### `addUser(String studioId, String userId): Map<String, Object>`

Add a user to a studio team.

```java
try {
    Map<String, Object> result = api.studios.addUser("studio_abc123", "user_67890"); // Requires authentication
    System.out.println("User added to studio: " + result);
} catch (Exception e) {
    System.err.println("Failed to add user to studio: " + e.getMessage());
}
```

#### `removeUser(String studioId, String userId): Map<String, Object>`

Remove a user from a studio team.

```java
try {
    Map<String, Object> result = api.studios.removeUser("studio_abc123", "user_67890"); // Requires authentication
    System.out.println("User removed from studio: " + result);
} catch (Exception e) {
    System.err.println("Failed to remove user from studio: " + e.getMessage());
}
```

---

### Lobbies Module (`api.lobbies`)

#### `create(): Map<String, Object>`

Create a new game lobby.

```java
try {
    Map<String, Object> result = api.lobbies.create(); // Requires authentication
    System.out.println("Lobby created: " + result);
} catch (Exception e) {
    System.err.println("Lobby creation failed: " + e.getMessage());
}
```

#### `get(String lobbyId): Lobby`

Get information about a specific lobby.

```java
try {
    CroissantAPI.Lobby lobby = api.lobbies.get("lobby_xyz789");
    System.out.println("Lobby ID: " + lobby.lobbyId);
    System.out.println("Players: " + lobby.users.size());

    for (CroissantAPI.Lobby.LobbyUser user : lobby.users) {
        System.out.println("Player: " + user.username + " (Verified: " + user.verified + ")");
    }
} catch (Exception e) {
    System.err.println("Lobby not found: " + e.getMessage());
}
```

#### `getMyLobby(): Lobby`

Get the authenticated user's current lobby.

```java
try {
    CroissantAPI.Lobby myLobby = api.lobbies.getMyLobby(); // Requires authentication
    System.out.println("My lobby: " + myLobby.lobbyId);
} catch (Exception e) {
    System.err.println("Not in a lobby: " + e.getMessage());
}
```

#### `getUserLobby(String userId): Lobby`

Get the lobby a specific user is in.

```java
try {
    CroissantAPI.Lobby userLobby = api.lobbies.getUserLobby("user_12345");
    System.out.println("User is in lobby: " + userLobby.lobbyId);
} catch (Exception e) {
    System.err.println("User not in a lobby: " + e.getMessage());
}
```

#### `join(String lobbyId): Map<String, Object>`

Join an existing lobby.

```java
try {
    Map<String, Object> result = api.lobbies.join("lobby_xyz789"); // Requires authentication
    System.out.println("Joined lobby: " + result);
} catch (Exception e) {
    System.err.println("Failed to join lobby: " + e.getMessage());
}
```

#### `leave(String lobbyId): Map<String, Object>`

Leave a lobby.

```java
try {
    Map<String, Object> result = api.lobbies.leave("lobby_xyz789"); // Requires authentication
    System.out.println("Left lobby: " + result);
} catch (Exception e) {
    System.err.println("Failed to leave lobby: " + e.getMessage());
}
```

---

### Trading Module (`api.trades`)

#### `startOrGetPending(String userId): Trade`

Start a new trade or get existing pending trade with a user.

```java
try {
    CroissantAPI.Trade trade = api.trades.startOrGetPending("user_67890"); // Requires authentication
    System.out.println("Trade ID: " + trade.id);
    System.out.println("Status: " + trade.status);
} catch (Exception e) {
    System.err.println("Failed to start trade: " + e.getMessage());
}
```

#### `get(String tradeId): Trade`

Get information about a specific trade.

```java
try {
    CroissantAPI.Trade trade = api.trades.get("trade_abc123");
    System.out.println("Trade status: " + trade.status);
    System.out.println("From user items: " + trade.fromUserItems.size());
    System.out.println("To user items: " + trade.toUserItems.size());
} catch (Exception e) {
    System.err.println("Trade not found: " + e.getMessage());
}
```

#### `getMyTrades(): List<Trade>`

Get all trades for the authenticated user.

```java
try {
    List<CroissantAPI.Trade> myTrades = api.trades.getMyTrades(); // Requires authentication
    System.out.println("My trades: " + myTrades.size());

    for (CroissantAPI.Trade trade : myTrades) {
        System.out.println("Trade " + trade.id + " - Status: " + trade.status);
    }
} catch (Exception e) {
    System.err.println("Failed to load trades: " + e.getMessage());
}
```

#### `getUserTrades(String userId): List<Trade>`

Get all trades for a specific user.

```java
try {
    List<CroissantAPI.Trade> userTrades = api.trades.getUserTrades("user_12345"); // Requires authentication
    System.out.println("User trades: " + userTrades.size());
} catch (Exception e) {
    System.err.println("Failed to load user trades: " + e.getMessage());
}
```

#### `addItem(String tradeId, TradeItem tradeItem): Map<String, Object>`

Add an item to a trade.

```java
try {
    CroissantAPI.TradeItem tradeItem = new CroissantAPI.TradeItem("item_xyz789", 1);
    Map<String, Object> result = api.trades.addItem("trade_abc123", tradeItem); // Requires authentication
    System.out.println("Item added to trade: " + result);
} catch (Exception e) {
    System.err.println("Failed to add item to trade: " + e.getMessage());
}
```

#### `removeItem(String tradeId, TradeItem tradeItem): Map<String, Object>`

Remove an item from a trade.

```java
try {
    CroissantAPI.TradeItem tradeItem = new CroissantAPI.TradeItem("item_xyz789", 1);
    Map<String, Object> result = api.trades.removeItem("trade_abc123", tradeItem); // Requires authentication
    System.out.println("Item removed from trade: " + result);
} catch (Exception e) {
    System.err.println("Failed to remove item from trade: " + e.getMessage());
}
```

#### `approve(String tradeId): Map<String, Object>`

Approve and execute a trade.

```java
try {
    Map<String, Object> result = api.trades.approve("trade_abc123"); // Requires authentication
    System.out.println("Trade approved: " + result);
} catch (Exception e) {
    System.err.println("Failed to approve trade: " + e.getMessage());
}
```

#### `cancel(String tradeId): Map<String, Object>`

Cancel a pending trade.

```java
try {
    Map<String, Object> result = api.trades.cancel("trade_abc123"); // Requires authentication
    System.out.println("Trade cancelled: " + result);
} catch (Exception e) {
    System.err.println("Failed to cancel trade: " + e.getMessage());
}
```

---

### Search Module (`api.search`)

#### `global(String query): Search.GlobalSearchResult`

Perform a global search across all content types.

```java
try {
    CroissantAPI.Search.GlobalSearchResult results = api.search.global("adventure game");
    System.out.println("Found " + results.games.size() + " games");
    System.out.println("Found " + results.users.size() + " users");
    System.out.println("Found " + results.items.size() + " items");
} catch (Exception e) {
    System.err.println("Search failed: " + e.getMessage());
}
```

---

### OAuth2 Module (`api.oauth2`)

#### `createApp(String name, List<String> redirectUrls): Map<String, String>`

Create a new OAuth2 application.

```java
try {
    List<String> redirectUrls = Arrays.asList("https://mygame.com/auth/callback");
    Map<String, String> result = api.oauth2.createApp("My Game Client", redirectUrls); // Requires authentication
    System.out.println("App created with client_id: " + result.get("client_id"));
} catch (Exception e) {
    System.err.println("App creation failed: " + e.getMessage());
}
```

#### `getApp(String clientId): OAuth2App`

Get OAuth2 application by client ID.

```java
try {
    CroissantAPI.OAuth2App app = api.oauth2.getApp("client_12345");
    System.out.println("App name: " + app.name);
    System.out.println("Redirect URLs: " + app.redirect_urls);
} catch (Exception e) {
    System.err.println("App not found: " + e.getMessage());
}
```

#### `getMyApps(): List<OAuth2App>`

Get OAuth2 applications owned by the authenticated user.

```java
try {
    List<CroissantAPI.OAuth2App> apps = api.oauth2.getMyApps(); // Requires authentication
    System.out.println("My apps: " + apps.size());

    for (CroissantAPI.OAuth2App app : apps) {
        System.out.println("App: " + app.name + " (ID: " + app.client_id + ")");
    }
} catch (Exception e) {
    System.err.println("Failed to load apps: " + e.getMessage());
}
```

#### `updateApp(String clientId, Map<String, Object> data): Map<String, Boolean>`

Update an OAuth2 application.

```java
try {
    Map<String, Object> updates = new HashMap<>();
    updates.put("name", "Updated App Name");

    Map<String, Boolean> result = api.oauth2.updateApp("client_12345", updates); // Requires authentication
    System.out.println("App update result: " + result);
} catch (Exception e) {
    System.err.println("App update failed: " + e.getMessage());
}
```

#### `deleteApp(String clientId): Map<String, String>`

Delete an OAuth2 application.

```java
try {
    Map<String, String> result = api.oauth2.deleteApp("client_12345"); // Requires authentication
    System.out.println("App deleted: " + result);
} catch (Exception e) {
    System.err.println("App deletion failed: " + e.getMessage());
}
```

#### `authorize(String clientId, String redirectUri): Map<String, String>`

Authorize a user for an OAuth2 app.

```java
try {
    Map<String, String> result = api.oauth2.authorize("client_12345", "https://app.com/callback"); // Requires authentication
    System.out.println("Authorization result: " + result);
} catch (Exception e) {
    System.err.println("Authorization failed: " + e.getMessage());
}
```

#### `getUserByCode(String code, String clientId): User`

Get user information using OAuth2 authorization code.

```java
try {
    CroissantAPI.User userData = api.oauth2.getUserByCode("auth_code", "client_12345");
    System.out.println("Authenticated user: " + userData.username);
} catch (Exception e) {
    System.err.println("Failed to get user by code: " + e.getMessage());
}
```

## Model Definitions

### Core Models

#### `User`

```java
public static class User {
    public String userId;
    public String username;
    public String email;
    public Double balance;
    public boolean verified;
    public String steam_id;
    public String steam_username;
    public String steam_avatar_url;
    public boolean isStudio;
    public boolean admin;
    public Boolean disabled;
    public String google_id;
    public String discord_id;
    public List<Studio> studios;
    public List<String> roles;
    public List<InventoryItem> inventory;
    public List<Item> ownedItems;
    public List<Game> createdGames;
    public Boolean haveAuthenticator;
    public String verificationKey;
}
```

#### `Game`

```java
public static class Game {
    public String gameId;
    public String name;
    public String description;
    public String owner_id;
    public String download_link;
    public double price;
    public boolean showInStore;
    public String iconHash;
    public String splashHash;
    public String bannerHash;
    public String genre;
    public String release_date;
    public String developer;
    public String publisher;
    public String platforms;
    public double rating;
    public String website;
    public String trailer_link;
    public boolean multiplayer;
}
```

#### `Item`

```java
public static class Item {
    public String itemId;
    public String name;
    public String description;
    public double price;
    public String owner;
    public boolean showInStore;
    public String iconHash;
    public boolean deleted;
}
```

#### `InventoryItem`

```java
public static class InventoryItem {
    public String user_id;
    public String item_id;
    public String itemId;
    public String name;
    public String description;
    public int amount;
    public String iconHash;
    public double price;
    public String owner;
    public boolean showInStore;
    public Map<String, Object> metadata;
}
```

#### `Trade`

```java
public static class Trade {
    public String id;
    public String fromUserId;
    public String toUserId;
    public List<TradeItemDetails> fromUserItems;
    public List<TradeItemDetails> toUserItems;
    public boolean approvedFromUser;
    public boolean approvedToUser;
    public String status;
    public String createdAt;
    public String updatedAt;
}
```

#### `TradeItem`

```java
public static class TradeItem {
    public String itemId;
    public int amount;
    public Map<String, Object> metadata;

    public TradeItem(String itemId, int amount) {
        this.itemId = itemId;
        this.amount = amount;
    }

    public TradeItem(String itemId, int amount, Map<String, Object> metadata) {
        this.itemId = itemId;
        this.amount = amount;
        this.metadata = metadata;
    }
}
```

#### `Studio`

```java
public static class Studio {
    public String user_id;
    public String username;
    public boolean verified;
    public String admin_id;
    public Boolean isAdmin;
    public String apiKey;
    public List<StudioUser> users;
}
```

#### `Lobby`

```java
public static class Lobby {
    public String lobbyId;
    public List<LobbyUser> users;
}
```

#### `OAuth2App`

```java
public static class OAuth2App {
    public String client_id;
    public String client_secret;
    public String name;
    public List<String> redirect_urls;
}
```

## Error Handling

All API methods throw exceptions on errors. Always wrap calls in try/catch blocks:

```java
try {
    CroissantAPI.User user = api.users.getMe();
    System.out.println("Welcome, " + user.username + "!");
} catch (IllegalStateException e) {
    if (e.getMessage().contains("token")) {
        System.err.println("Authentication required");
    }
} catch (RuntimeException e) {
    String message = e.getMessage();
    if (message.contains("401")) {
        System.err.println("Unauthorized - check token");
    } else if (message.contains("404")) {
        System.err.println("Resource not found");
    } else if (message.contains("403")) {
        System.err.println("Forbidden - insufficient permissions");
    } else if (message.contains("400")) {
        System.err.println("Bad request - check parameters");
    } else {
        System.err.println("API Error: " + message);
    }
} catch (Exception e) {
    System.err.println("Unexpected error: " + e.getMessage());
}
```

### Common Error Types

| Error Pattern                      | Description                      | Solution                    |
| ---------------------------------- | -------------------------------- | --------------------------- |
| `No authentication token provided` | Authentication required          | Provide valid API token     |
| HTTP 401                           | Invalid or expired token         | Refresh or regenerate token |
| HTTP 404                           | Resource not found               | Verify resource ID          |
| HTTP 400                           | Bad request/insufficient balance | Check request parameters    |
| HTTP 429                           | Rate limit exceeded              | Implement rate limiting     |
| HTTP 403                           | Permission denied                | Check token permissions     |

## Platform Integration

### Spring Boot Integration

```java
// Application.java
@SpringBootApplication
public class Application {
    @Bean
    public CroissantAPI croissantAPI(@Value("${croissant.api.token}") String token) {
        return new CroissantAPI(token);
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// GameController.java
@RestController
@RequestMapping("/api/games")
public class GameController {

    @Autowired
    private CroissantAPI croissantAPI;

    @GetMapping
    public ResponseEntity<List<CroissantAPI.Game>> listGames() {
        try {
            List<CroissantAPI.Game> games = croissantAPI.games.list();
            return ResponseEntity.ok(games);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<CroissantAPI.Game> getGame(@PathVariable String gameId) {
        try {
            CroissantAPI.Game game = croissantAPI.games.get(gameId);
            return ResponseEntity.ok(game);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{gameId}/buy")
    public ResponseEntity<Map<String, Object>> buyGame(@PathVariable String gameId) {
        try {
            Map<String, Object> result = croissantAPI.games.buy(gameId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

// PlayerController.java
@RestController
@RequestMapping("/api/players")
public class PlayerController {

    @Autowired
    private CroissantAPI croissantAPI;

    @GetMapping("/{playerId}")
    public ResponseEntity<PlayerInfo> getPlayer(@PathVariable String playerId) {
        try {
            CroissantAPI.User user = croissantAPI.users.getUser(playerId);
            CroissantAPI.Inventory.InventoryResponse inventory = croissantAPI.inventory.get(playerId);

            PlayerInfo playerInfo = new PlayerInfo();
            playerInfo.setUsername(user.username);
            playerInfo.setVerified(user.verified);
            playerInfo.setBalance(user.balance);
            playerInfo.setItemCount(inventory.inventory.size());

            return ResponseEntity.ok(playerInfo);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{playerId}/reward")
    public ResponseEntity<Map<String, Object>> giveReward(
            @PathVariable String playerId,
            @RequestBody RewardRequest request) {
        try {
            Map<String, Object> result = croissantAPI.items.give(
                request.getItemId(),
                request.getAmount(),
                playerId
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

// Data classes
public class PlayerInfo {
    private String username;
    private boolean verified;
    private Double balance;
    private int itemCount;

    // Getters and setters...
}

public class RewardRequest {
    private String itemId;
    private int amount;

    // Getters and setters...
}

// application.properties
croissant.api.token=${CROISSANT_API_TOKEN:your_default_token}
```

### Minecraft Plugin Integration

```java
// CroissantPlugin.java
public class CroissantPlugin extends JavaPlugin {
    private CroissantAPI croissantAPI;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        String token = getConfig().getString("croissant.token");
        croissantAPI = new CroissantAPI(token);

        getCommand("profile").setExecutor(new ProfileCommand(croissantAPI));
        getCommand("give").setExecutor(new GiveCommand(croissantAPI));
        getCommand("trade").setExecutor(new TradeCommand(croissantAPI));
    }
}

// ProfileCommand.java
public class ProfileCommand implements CommandExecutor {
    private final CroissantAPI api;

    public ProfileCommand(CroissantAPI api) {
        this.api = api;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("This command can only be used by players");
            return true;
        }

        Player player = (Player) sender;

        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                // Use player's UUID or custom ID system
                CroissantAPI.User user = api.users.getUser(player.getUniqueId().toString());
                CroissantAPI.Inventory.InventoryResponse inventory = api.inventory.get(player.getUniqueId().toString());

                Bukkit.getScheduler().runTask(plugin, () -> {
                    player.sendMessage("§6=== Croissant Profile ===");
                    player.sendMessage("§7Username: §f" + user.username);
                    player.sendMessage("§7Balance: §f" + user.balance + " credits");
                    player.sendMessage("§7Items: §f" + inventory.inventory.size());
                    player.sendMessage("§7Verified: " + (user.verified ? "§aYes" : "§cNo"));
                });
            } catch (Exception e) {
                Bukkit.getScheduler().runTask(plugin, () -> {
                    player.sendMessage("§cFailed to load profile: " + e.getMessage());
                });
            }
        });

        return true;
    }
}

// GiveCommand.java
public class GiveCommand implements CommandExecutor {
    private final CroissantAPI api;

    public GiveCommand(CroissantAPI api) {
        this.api = api;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length < 3) {
            sender.sendMessage("Usage: /give <player> <item_id> <amount>");
            return true;
        }

        String targetPlayer = args[0];
        String itemId = args[1];
        int amount;

        try {
            amount = Integer.parseInt(args[2]);
        } catch (NumberFormatException e) {
            sender.sendMessage("§cInvalid amount");
            return true;
        }

        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                Map<String, Object> result = api.items.give(itemId, amount, targetPlayer);

                Bukkit.getScheduler().runTask(plugin, () -> {
                    sender.sendMessage("§aGave " + amount + "x " + itemId + " to " + targetPlayer);
                });
            } catch (Exception e) {
                Bukkit.getScheduler().runTask(plugin, () -> {
                    sender.sendMessage("§cFailed to give item: " + e.getMessage());
                });
            }
        });

        return true;
    }
}

// config.yml
croissant:
  token: "your_api_token_here"

# plugin.yml
name: CroissantPlugin
version: 1.0.0
main: com.example.CroissantPlugin
api-version: 1.16
commands:
  profile:
    description: Show Croissant profile
  give:
    description: Give items to players
  trade:
    description: Manage trades
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
