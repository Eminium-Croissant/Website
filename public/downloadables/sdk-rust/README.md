# Croissant API Client Library - Rust

A comprehensive Rust client library for the Croissant gaming platform API. This library provides a fully typed interface for all platform features including user management, game operations, inventory, trading, and more.

## Installation

### Direct Download

Download the library directly from the Croissant platform:

- **Rust**: [croissant_api.rs](https://croissant-api.eminium.ovh/downloadables/sdk-rust/croissant_api.rs)

### Add Dependencies

Add the following dependencies to your `Cargo.toml`:

```toml
[dependencies]
reqwest = { version = "0.11", features = ["json"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
urlencoding = "2.1"
tokio = { version = "1.0", features = ["full"] }
```

### Import in your project

```rust
mod croissant_api;
use croissant_api::CroissantApi;
```

## Requirements

- **Rust**: 1.70+
- **Runtime**: Tokio for asynchronous operations
- **Dependencies**: reqwest, serde, serde_json, urlencoding

## Getting Started

### Basic Initialization

```rust
use croissant_api::CroissantApi;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Public access (read-only operations)
    let api = CroissantApi::new(None);

    // Authenticated access (full functionality)
    let api = CroissantApi::new(Some("your_api_token".to_string()));

    Ok(())
}
```

### Authentication

To perform authenticated operations, you need an API token:

1. **Via Web Dashboard**: Login to [croissant-api.eminium.ovh](https://croissant-api.eminium.ovh) and generate a token
2. **Via OAuth2**: Implement OAuth2 flow for third-party applications
3. **Via Bot Token**: Use dedicated bot tokens for automated systems

```rust
use std::env;

// Environment variable (recommended)
let token = env::var("CROISSANT_API_TOKEN").ok();
let api = CroissantApi::new(token);
```

## API Reference

### Core Structure

#### `CroissantApi`

Main API client class providing access to all platform modules.

**Constructor**

```rust
impl CroissantApi {
    pub fn new(token: Option<String>) -> Self
}
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

#### `get_me() -> Result<User, Error>`

Retrieve the authenticated user's profile.

```rust
let user = api.get_me().await?; // Requires authentication
println!("Welcome, {}!", user.username);
```

#### `search_users(query: &str) -> Result<Vec<User>, Error>`

Search for users by username.

```rust
let users = api.search_users("john").await?;
for user in users {
    println!("Found user: {}", user.username);
}
```

#### `get_user(user_id: &str) -> Result<User, Error>`

Get a specific user by ID.

```rust
let user = api.get_user("user_12345").await?;
println!("User: {}", user.username);
```

#### `transfer_credits(target_user_id: &str, amount: f64) -> Result<HashMap<String, serde_json::Value>, Error>`

Transfer credits to another user.

```rust
let result = api.transfer_credits("user_67890", 100.0).await?;
println!("Transfer completed: {:?}", result);
```

#### `verify_user(user_id: &str, verification_key: &str) -> Result<HashMap<String, serde_json::Value>, Error>`

Verify a user account.

```rust
let result = api.verify_user("user_id", "verification_key").await?;
```

---

### Games Module

#### `list_games() -> Result<Vec<Game>, Error>`

List all available games.

```rust
let games = api.list_games().await?;
println!("Available games: {}", games.len());
```

#### `search_games(query: &str) -> Result<Vec<Game>, Error>`

Search games by name or description.

```rust
let games = api.search_games("adventure platformer").await?;
for game in games {
    println!("Found game: {} - {}", game.name, game.description);
}
```

#### `get_game(game_id: &str) -> Result<Game, Error>`

Get detailed information about a specific game.

```rust
let game = api.get_game("game_abc123").await?;
println!("Game: {} - Price: {}", game.name, game.price);
```

#### `get_my_created_games() -> Result<Vec<Game>, Error>`

Get games created by the authenticated user.

```rust
let my_games = api.get_my_created_games().await?; // Requires authentication
```

#### `get_my_owned_games() -> Result<Vec<Game>, Error>`

Get games owned by the authenticated user.

```rust
let owned_games = api.get_my_owned_games().await?; // Requires authentication
```

---

### Inventory Module

#### `get_my_inventory() -> Result<HashMap<String, serde_json::Value>, Error>`

Get the authenticated user's inventory.

```rust
let inventory = api.get_my_inventory().await?; // Requires authentication
println!("Inventory: {:?}", inventory);
```

#### `get_inventory(user_id: &str) -> Result<HashMap<String, serde_json::Value>, Error>`

Get another user's public inventory.

```rust
let user_inventory = api.get_inventory("user_12345").await?;
```

---

### Items Module

#### `list_items() -> Result<Vec<Item>, Error>`

List all available items in the marketplace.

```rust
let items = api.list_items().await?;
println!("Available items: {}", items.len());
```

#### `search_items(query: &str) -> Result<Vec<Item>, Error>`

Search items by name or description.

```rust
let items = api.search_items("magic sword").await?;
for item in items {
    println!("Found item: {} - Price: {}", item.name, item.price);
}
```

#### `get_item(item_id: &str) -> Result<Item, Error>`

Get detailed information about a specific item.

```rust
let item = api.get_item("item_xyz789").await?;
println!("Item: {} - {}", item.name, item.description);
```

#### `create_item(item_data: &serde_json::Value) -> Result<HashMap<String, serde_json::Value>, Error>`

Create a new item for sale.

```rust
use serde_json::json;

let item_data = json!({
    "name": "Enchanted Shield",
    "description": "Provides magical protection",
    "price": 150.0,
    "iconHash": "optional_hash"
});

let result = api.create_item(&item_data).await?; // Requires authentication
```

#### `buy_item(item_id: &str, amount: i32) -> Result<HashMap<String, serde_json::Value>, Error>`

Purchase items from the marketplace.

```rust
let result = api.buy_item("item_xyz789", 2).await?; // Requires authentication
println!("Purchase completed: {:?}", result);
```

#### `sell_item(item_id: &str, amount: i32) -> Result<HashMap<String, serde_json::Value>, Error>`

Sell items from inventory.

```rust
let result = api.sell_item("item_xyz789", 1).await?; // Requires authentication
```

#### `give_item(item_id: &str, amount: i32, user_id: &str, metadata: Option<&serde_json::Value>) -> Result<HashMap<String, serde_json::Value>, Error>`

Give items to another user.

```rust
let metadata = json!({"enchantment": "fire"});
let result = api.give_item("item_xyz789", 1, "user_67890", Some(&metadata)).await?; // Requires authentication
```

#### `drop_item(item_id: &str, params: &serde_json::Value) -> Result<HashMap<String, serde_json::Value>, Error>`

Remove items from inventory.

```rust
let params = json!({"amount": 1});
let result = api.drop_item("item_xyz789", &params).await?; // Requires authentication
```

---

### Studios Module

#### `create_studio(studio_name: &str) -> Result<HashMap<String, serde_json::Value>, Error>`

Create a new development studio.

```rust
let result = api.create_studio("Awesome Games Studio").await?; // Requires authentication
```

#### `get_studio(studio_id: &str) -> Result<Studio, Error>`

Get information about a specific studio.

```rust
let studio = api.get_studio("studio_abc123").await?;
println!("Studio: {}", studio.username);
```

#### `get_my_studios() -> Result<Vec<Studio>, Error>`

Get studios owned by the authenticated user.

```rust
let my_studios = api.get_my_studios().await?; // Requires authentication
```

#### `add_user_to_studio(studio_id: &str, user_id: &str) -> Result<HashMap<String, serde_json::Value>, Error>`

Add a user to a studio team.

```rust
let result = api.add_user_to_studio("studio_abc123", "user_67890").await?; // Requires authentication
```

---

### Lobbies Module

#### `create_lobby() -> Result<HashMap<String, serde_json::Value>, Error>`

Create a new game lobby.

```rust
let result = api.create_lobby().await?; // Requires authentication
println!("Lobby created: {:?}", result);
```

#### `get_lobby(lobby_id: &str) -> Result<Lobby, Error>`

Get information about a specific lobby.

```rust
let lobby = api.get_lobby("lobby_xyz789").await?;
println!("Lobby: {} players", lobby.users.len());
```

#### `get_my_lobby() -> Result<Lobby, Error>`

Get the authenticated user's current lobby.

```rust
let my_lobby = api.get_my_lobby().await?; // Requires authentication
```

#### `join_lobby(lobby_id: &str) -> Result<HashMap<String, serde_json::Value>, Error>`

Join an existing lobby.

```rust
let result = api.join_lobby("lobby_xyz789").await?; // Requires authentication
```

#### `leave_lobby(lobby_id: &str) -> Result<HashMap<String, serde_json::Value>, Error>`

Leave a lobby.

```rust
let result = api.leave_lobby("lobby_xyz789").await?; // Requires authentication
```

---

### Trading Module

#### `start_or_get_pending_trade(user_id: &str) -> Result<Trade, Error>`

Start a new trade or get existing pending trade with a user.

```rust
let trade = api.start_or_get_pending_trade("user_67890").await?; // Requires authentication
println!("Trade ID: {}", trade.id);
```

#### `get_trade(trade_id: &str) -> Result<Trade, Error>`

Get information about a specific trade.

```rust
let trade = api.get_trade("trade_abc123").await?;
println!("Trade status: {}", trade.status);
```

#### `add_item_to_trade(trade_id: &str, trade_item: &serde_json::Value) -> Result<HashMap<String, serde_json::Value>, Error>`

Add an item to a trade.

```rust
let trade_item = json!({
    "itemId": "item_xyz789",
    "amount": 1,
    "metadata": {"enchantment": "fire"}
});

let result = api.add_item_to_trade("trade_abc123", &trade_item).await?; // Requires authentication
```

#### `approve_trade(trade_id: &str) -> Result<HashMap<String, serde_json::Value>, Error>`

Approve and execute a trade.

```rust
let result = api.approve_trade("trade_abc123").await?; // Requires authentication
```

#### `cancel_trade(trade_id: &str) -> Result<HashMap<String, serde_json::Value>, Error>`

Cancel a pending trade.

```rust
let result = api.cancel_trade("trade_abc123").await?; // Requires authentication
```

---

### OAuth2 Module

#### `create_oauth2_app(name: &str, redirect_urls: &[String]) -> Result<HashMap<String, serde_json::Value>, Error>`

Create a new OAuth2 application.

```rust
let redirect_urls = vec!["https://mygame.com/auth/callback".to_string()];
let result = api.create_oauth2_app("My Game Client", &redirect_urls).await?; // Requires authentication
```

#### `get_my_oauth2_apps() -> Result<Vec<OAuth2App>, Error>`

Get OAuth2 applications owned by the authenticated user.

```rust
let apps = api.get_my_oauth2_apps().await?; // Requires authentication
```

## Type Definitions

### Core Types

#### `User`

```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    #[serde(rename = "userId")]
    pub user_id: String,
    pub username: String,
    pub email: Option<String>,
    pub verified: bool,
    pub studios: Option<Vec<Studio>>,
    pub roles: Option<Vec<String>>,
    pub inventory: Option<Vec<InventoryItem>>,
    #[serde(rename = "ownedItems")]
    pub owned_items: Option<Vec<Item>>,
    #[serde(rename = "createdGames")]
    pub created_games: Option<Vec<Game>>,
    pub balance: Option<f64>,
    pub admin: Option<bool>,
    pub disabled: Option<bool>,
    // ... other fields
}
```

#### `Game`

```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Game {
    #[serde(rename = "gameId")]
    pub game_id: String,
    pub name: String,
    pub description: String,
    pub price: f64,
    pub owner_id: String,
    #[serde(rename = "showInStore")]
    pub show_in_store: bool,
    #[serde(rename = "iconHash")]
    pub icon_hash: Option<String>,
    pub genre: Option<String>,
    pub release_date: Option<String>,
    pub rating: f64,
    pub multiplayer: bool,
    // ... other fields
}
```

#### `Item`

```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Item {
    #[serde(rename = "itemId")]
    pub item_id: String,
    pub name: String,
    pub description: String,
    pub owner: String,
    pub price: f64,
    #[serde(rename = "iconHash")]
    pub icon_hash: String,
    #[serde(rename = "showInStore")]
    pub show_in_store: Option<bool>,
    pub deleted: Option<bool>,
}
```

#### `InventoryItem`

```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InventoryItem {
    pub user_id: Option<String>,
    pub item_id: Option<String>,
    pub amount: i32,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
    #[serde(rename = "itemId")]
    pub item_id_main: String,
    pub name: String,
    pub description: String,
    #[serde(rename = "iconHash")]
    pub icon_hash: String,
    pub price: f64,
    pub owner: String,
    #[serde(rename = "showInStore")]
    pub show_in_store: bool,
}
```

#### `Trade`

```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Trade {
    pub id: String,
    #[serde(rename = "fromUserId")]
    pub from_user_id: String,
    #[serde(rename = "toUserId")]
    pub to_user_id: String,
    #[serde(rename = "fromUserItems")]
    pub from_user_items: Vec<TradeItemInfo>,
    #[serde(rename = "toUserItems")]
    pub to_user_items: Vec<TradeItemInfo>,
    #[serde(rename = "approvedFromUser")]
    pub approved_from_user: bool,
    #[serde(rename = "approvedToUser")]
    pub approved_to_user: bool,
    pub status: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}
```

#### `Studio`

```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Studio {
    pub user_id: String,
    pub username: String,
    pub verified: bool,
    pub admin_id: String,
    #[serde(rename = "isAdmin")]
    pub is_admin: Option<bool>,
    #[serde(rename = "apiKey")]
    pub api_key: Option<String>,
    pub users: Option<Vec<StudioUser>>,
}
```

#### `Lobby`

```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Lobby {
    #[serde(rename = "lobbyId")]
    pub lobby_id: String,
    pub users: Vec<LobbyUser>,
}
```

## Error Handling

All API methods return `Result` and may throw errors. Always wrap calls in error handling blocks:

```rust
use std::error::Error;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let api = CroissantApi::new(Some("your_token".to_string()));

    match api.get_me().await {
        Ok(user) => {
            println!("Welcome, {}!", user.username);
        }
        Err(e) => {
            eprintln!("API Error: {}", e);
            // Specific error handling
            if e.to_string().contains("401") {
                eprintln!("Authentication required");
            } else if e.to_string().contains("404") {
                eprintln!("User not found");
            }
        }
    }

    Ok(())
}
```

### Common Error Types

| Error Type | Description              | Solution                    |
| ---------- | ------------------------ | --------------------------- |
| Status 401 | Authentication required  | Provide valid API token     |
| Status 403 | Invalid or expired token | Refresh or regenerate token |
| Status 404 | Resource not found       | Verify resource ID          |
| Status 400 | Insufficient balance     | Add credits to account      |
| Status 429 | Rate limit exceeded      | Implement rate limiting     |

## Platform Integration

### Game Server

```rust
use croissant_api::CroissantApi;
use std::env;

struct GameServer {
    api: CroissantApi,
}

impl GameServer {
    pub fn new() -> Self {
        let token = env::var("CROISSANT_API_TOKEN").ok();
        Self {
            api: CroissantApi::new(token),
        }
    }

    pub async fn handle_player_login(&self, player_id: &str) -> Result<String, Box<dyn std::error::Error>> {
        match self.api.get_user(player_id).await {
            Ok(user) => {
                println!("Player logged in: {}", user.username);
                Ok(user.username)
            }
            Err(e) => {
                eprintln!("Login failed: {}", e);
                Err(e.into())
            }
        }
    }

    pub async fn give_reward(&self, player_id: &str, item_id: &str, amount: i32) -> Result<(), Box<dyn std::error::Error>> {
        self.api.give_item(item_id, amount, player_id, None).await?;
        println!("Reward given to player {}: {} x{}", player_id, item_id, amount);
        Ok(())
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let server = GameServer::new();

    // Example usage
    let username = server.handle_player_login("user_12345").await?;
    server.give_reward("user_12345", "reward_item", 1).await?;

    Ok(())
}
```

### Game Client

```rust
use croissant_api::CroissantApi;
use serde_json::json;

struct GameClient {
    api: CroissantApi,
}

impl GameClient {
    pub fn new(token: String) -> Self {
        Self {
            api: CroissantApi::new(Some(token)),
        }
    }

    pub async fn get_player_inventory(&self) -> Result<(), Box<dyn std::error::Error>> {
        let inventory = self.api.get_my_inventory().await?;
        println!("Player inventory: {:?}", inventory);
        Ok(())
    }

    pub async fn buy_item_from_store(&self, item_id: &str, quantity: i32) -> Result<(), Box<dyn std::error::Error>> {
        match self.api.buy_item(item_id, quantity).await {
            Ok(result) => {
                println!("Purchase successful: {:?}", result);
                Ok(())
            }
            Err(e) => {
                eprintln!("Purchase failed: {}", e);
                Err(e.into())
            }
        }
    }

    pub async fn create_lobby(&self) -> Result<String, Box<dyn std::error::Error>> {
        let result = self.api.create_lobby().await?;
        if let Some(lobby_id) = result.get("lobbyId") {
            println!("Lobby created: {}", lobby_id);
            Ok(lobby_id.as_str().unwrap_or_default().to_string())
        } else {
            Err("Failed to create lobby".into())
        }
    }
}
```

### Trading System

```rust
use croissant_api::CroissantApi;
use serde_json::json;

struct TradingSystem {
    api: CroissantApi,
}

impl TradingSystem {
    pub fn new(token: String) -> Self {
        Self {
            api: CroissantApi::new(Some(token)),
        }
    }

    pub async fn create_trade_offer(&self, other_player_id: &str, items: Vec<(&str, i32)>) -> Result<String, Box<dyn std::error::Error>> {
        // Start or get pending trade
        let trade = self.api.start_or_get_pending_trade(other_player_id).await?;

        // Add items to trade
        for (item_id, amount) in items {
            let trade_item = json!({
                "itemId": item_id,
                "amount": amount
            });

            self.api.add_item_to_trade(&trade.id, &trade_item).await?;
        }

        println!("Trade offer created: {}", trade.id);
        Ok(trade.id)
    }

    pub async fn accept_trade(&self, trade_id: &str) -> Result<(), Box<dyn std::error::Error>> {
        self.api.approve_trade(trade_id).await?;
        println!("Trade accepted: {}", trade_id);
        Ok(())
    }

    pub async fn cancel_trade(&self, trade_id: &str) -> Result<(), Box<dyn std::error::Error>> {
        self.api.cancel_trade(trade_id).await?;
        println!("Trade cancelled: {}", trade_id);
        Ok(())
    }
}
```

## Complete Examples

### Complete Game Store Implementation

```rust
use croissant_api::{CroissantApi, Game, Item};
use std::error::Error;

pub struct GameStore {
    api: CroissantApi,
}

impl GameStore {
    pub fn new(token: String) -> Self {
        Self {
            api: CroissantApi::new(Some(token)),
        }
    }

    pub async fn browse_games(&self, search_term: Option<&str>, max_price: Option<f64>) -> Result<Vec<Game>, Box<dyn Error>> {
        let games = match search_term {
            Some(term) => self.api.search_games(term).await?,
            None => self.api.list_games().await?,
        };

        let filtered_games = games.into_iter()
            .filter(|game| {
                if let Some(price_limit) = max_price {
                    game.price <= price_limit
                } else {
                    true
                }
            })
            .collect();

        Ok(filtered_games)
    }

    pub async fn browse_items(&self, search_term: Option<&str>, max_price: Option<f64>) -> Result<Vec<Item>, Box<dyn Error>> {
        let items = match search_term {
            Some(term) => self.api.search_items(term).await?,
            None => self.api.list_items().await?,
        };

        let filtered_items = items.into_iter()
            .filter(|item| {
                if let Some(price_limit) = max_price {
                    item.price <= price_limit
                } else {
                    true
                }
            })
            .collect();

        Ok(filtered_items)
    }

    pub async fn purchase_item(&self, item_id: &str, quantity: i32) -> Result<(), Box<dyn Error>> {
        match self.api.buy_item(item_id, quantity).await {
            Ok(_) => {
                println!("Purchase successful: {} x{}", item_id, quantity);
                Ok(())
            }
            Err(e) => {
                eprintln!("Purchase failed: {}", e);
                Err(e.into())
            }
        }
    }
}

// Usage
#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let store = GameStore::new("your_token_here".to_string());

    // Browse and purchase
    let games = store.browse_games(Some("adventure"), Some(50.0)).await?;
    println!("Found {} adventure games under 50 credits", games.len());

    store.purchase_item("item_123", 1).await?;

    Ok(())
}
```

## Best Practices

### Rate Limiting

```rust
use std::time::{Duration, Instant};
use tokio::time::sleep;

struct RateLimitedApi {
    api: CroissantApi,
    last_request: Option<Instant>,
    min_interval: Duration,
}

impl RateLimitedApi {
    pub fn new(token: String) -> Self {
        Self {
            api: CroissantApi::new(Some(token)),
            last_request: None,
            min_interval: Duration::from_millis(100), // Max 10 requests per second
        }
    }

    async fn ensure_rate_limit(&mut self) {
        if let Some(last) = self.last_request {
            let elapsed = last.elapsed();
            if elapsed < self.min_interval {
                sleep(self.min_interval - elapsed).await;
            }
        }
        self.last_request = Some(Instant::now());
    }

    pub async fn get_user(&mut self, user_id: &str) -> Result<croissant_api::User, reqwest::Error> {
        self.ensure_rate_limit().await;
        self.api.get_user(user_id).await
    }
}
```

### Caching Strategy

```rust
use std::collections::HashMap;
use std::time::{Duration, Instant};

struct CachedCroissantApi {
    api: CroissantApi,
    user_cache: HashMap<String, (croissant_api::User, Instant)>,
    cache_duration: Duration,
}

impl CachedCroissantApi {
    pub fn new(token: String) -> Self {
        Self {
            api: CroissantApi::new(Some(token)),
            user_cache: HashMap::new(),
            cache_duration: Duration::from_secs(300), // 5 minute cache
        }
    }

    pub async fn get_user(&mut self, user_id: &str) -> Result<croissant_api::User, reqwest::Error> {
        // Check cache
        if let Some((user, timestamp)) = self.user_cache.get(user_id) {
            if timestamp.elapsed() < self.cache_duration {
                return Ok(user.clone());
            }
        }

        // Fetch from API and cache
        let user = self.api.get_user(user_id).await?;
        self.user_cache.insert(user_id.to_string(), (user.clone(), Instant::now()));
        Ok(user)
    }
}
```

### Environment Configuration

```rust
use std::env;

#[derive(Debug)]
pub struct CroissantConfig {
    pub api_token: Option<String>,
    pub retry_attempts: u32,
    pub timeout_seconds: u64,
}

impl CroissantConfig {
    pub fn from_env() -> Self {
        Self {
            api_token: env::var("CROISSANT_API_TOKEN").ok(),
            retry_attempts: env::var("CROISSANT_RETRY_ATTEMPTS")
                .unwrap_or_else(|_| "3".to_string())
                .parse()
                .unwrap_or(3),
            timeout_seconds: env::var("CROISSANT_TIMEOUT")
                .unwrap_or_else(|_| "30".to_string())
                .parse()
                .unwrap_or(30),
        }
    }
}

pub fn create_configured_api() -> CroissantApi {
    let config = CroissantConfig::from_env();
    CroissantApi::new(config.api_token)
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
- Follow the platform's terms of service and community guidelines
- Respect rate limits and usage guidelines

For complete terms, visit [croissant-api.eminium.ovh/terms](https://croissant-api.eminium.ovh/terms).

## Version Information

- **Library Version**: 1.0.0
- **API Version**: v1
- **Last Updated**: July 2025
- **Minimum Requirements**: Rust 1.70+, Tokio 1.0+

### Changelog

#### v1.0.0 (July 2025)

- Initial release
- Complete API coverage
- Full Rust support
- Comprehensive documentation

---

\*Built with ❤️ for the Croissant gaming
