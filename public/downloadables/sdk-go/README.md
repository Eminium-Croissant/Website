# Croissant API Client Library - Go

A comprehensive Go client library for the Croissant gaming platform API. This library provides a fully typed interface for all platform features including user management, game operations, inventory, trading, and more.

## Installation

### Direct Download

Download the library directly from the Croissant platform:

- **Go**: [croissantapi.go](https://croissant-api.eminium.ovh/downloadables/sdk-go/croissantapi.go)

### Go Module Integration

```bash
# Add to your go.mod
require (
    croissantapi v1.0.0
)
```

### Import in your project

```go
import "croissantapi"
```

## Requirements

- **Go**: 1.18+
- **Dependencies**: Standard library only (net/http, encoding/json, etc.)
- **No external dependencies required**

## Getting Started

### Basic Initialization

```go
package main

import (
    "fmt"
    "log"
    "croissantapi"
)

func main() {
    // Public access (read-only operations)
    api := croissantapi.NewCroissantAPI("")

    // Authenticated access (full functionality)
    api := croissantapi.NewCroissantAPI("your_api_token")
}
```

### Authentication

To perform authenticated operations, you need an API token:

1. **Via Web Dashboard**: Login to [croissant-api.eminium.ovh](https://croissant-api.eminium.ovh) and generate a token
2. **Via OAuth2**: Implement OAuth2 flow for third-party applications
3. **Via Bot Token**: Use dedicated bot tokens for automated systems

```go
import "os"

// Environment variable (recommended)
api := croissantapi.NewCroissantAPI(os.Getenv("CROISSANT_API_TOKEN"))

// Or directly
api := croissantapi.NewCroissantAPI("your_token_here")
```

## API Reference

### Core Structure

#### `CroissantAPI`

Main API client struct providing access to all platform modules.

**Constructor**

```go
func NewCroissantAPI(token string) *CroissantAPI
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

#### `GetMe() (*User, error)`

Retrieve the authenticated user's profile.

```go
user, err := api.GetMe() // Requires authentication
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Welcome, %s!\n", user.Username)
```

#### `SearchUsers(query string) ([]User, error)`

Search for users by username.

```go
users, err := api.SearchUsers("john")
if err != nil {
    log.Fatal(err)
}
for _, user := range users {
    fmt.Printf("Found user: %s\n", user.Username)
}
```

#### `GetUser(userId string) (*User, error)`

Get a specific user by ID (supports Croissant ID, Discord ID, Google ID, or Steam ID).

```go
user, err := api.GetUser("user_12345")
if err != nil {
    log.Fatal(err)
}
fmt.Printf("User: %s\n", user.Username)
```

#### `TransferCredits(targetUserId string, amount float64) (map[string]string, error)`

Transfer credits to another user.

```go
result, err := api.TransferCredits("user_67890", 100.0)
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Transfer completed: %v\n", result)
```

#### `VerifyUser(userId, verificationKey string) (map[string]bool, error)`

Verify a user account.

```go
result, err := api.VerifyUser("user_id", "verification_key")
if err != nil {
    log.Fatal(err)
}
```

---

### Games Module

#### `ListGames() ([]Game, error)`

List all available games.

```go
games, err := api.ListGames()
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Available games: %d\n", len(games))
```

#### `SearchGames(query string) ([]Game, error)`

Search games by name, genre, or description.

```go
games, err := api.SearchGames("adventure platformer")
if err != nil {
    log.Fatal(err)
}
for _, game := range games {
    fmt.Printf("Found game: %s - %s\n", game.Name, game.Description)
}
```

#### `GetGame(gameId string) (*Game, error)`

Get detailed information about a specific game.

```go
game, err := api.GetGame("game_abc123")
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Game: %s - Price: %.2f\n", game.Name, game.Price)
```

#### `GetMyCreatedGames() ([]Game, error)`

Get games created by the authenticated user.

```go
myGames, err := api.GetMyCreatedGames() // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `GetMyOwnedGames() ([]Game, error)`

Get games owned by the authenticated user.

```go
ownedGames, err := api.GetMyOwnedGames() // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

---

### Items Module

#### `ListItems() ([]Item, error)`

List all available items in the marketplace.

```go
items, err := api.ListItems()
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Available items: %d\n", len(items))
```

#### `SearchItems(query string) ([]Item, error)`

Search items by name or description.

```go
items, err := api.SearchItems("magic sword")
if err != nil {
    log.Fatal(err)
}
for _, item := range items {
    fmt.Printf("Found item: %s - Price: %.2f\n", item.Name, item.Price)
}
```

#### `GetItem(itemId string) (*Item, error)`

Get detailed information about a specific item.

```go
item, err := api.GetItem("item_xyz789")
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Item: %s - %s\n", item.Name, item.Description)
```

#### `GetMyItems() ([]Item, error)`

Get items owned by the authenticated user.

```go
myItems, err := api.GetMyItems() // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `CreateItem(itemData map[string]interface{}) (map[string]string, error)`

Create a new item for sale.

```go
itemData := map[string]interface{}{
    "name":        "Enchanted Shield",
    "description": "Provides magical protection",
    "price":       150.0,
    "iconHash":    "optional_hash",
}

result, err := api.CreateItem(itemData) // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `UpdateItem(itemId string, itemData map[string]interface{}) (map[string]string, error)`

Update an existing item.

```go
updates := map[string]interface{}{
    "price":       125.0,
    "description": "Updated description",
}

result, err := api.UpdateItem("item_xyz789", updates) // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `DeleteItem(itemId string) (map[string]string, error)`

Delete an item.

```go
result, err := api.DeleteItem("item_xyz789") // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `BuyItem(itemId string, amount int) (map[string]string, error)`

Purchase items from the marketplace.

```go
result, err := api.BuyItem("item_xyz789", 2) // Requires authentication
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Purchase completed: %v\n", result)
```

#### `SellItem(itemId string, amount int) (map[string]string, error)`

Sell items from inventory.

```go
result, err := api.SellItem("item_xyz789", 1) // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `GiveItem(itemId string, amount int, userId string, metadata map[string]interface{}) (map[string]string, error)`

Give items to another user.

```go
metadata := map[string]interface{}{
    "enchantment": "fire",
    "level":       5,
}

result, err := api.GiveItem("item_xyz789", 1, "user_67890", metadata) // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `ConsumeItem(itemId string, params map[string]interface{}) (map[string]string, error)`

Consume specific item instances with parameters.

```go
params := map[string]interface{}{
    "amount":   1,
    "uniqueId": "instance_123",
}

result, err := api.ConsumeItem("item_xyz789", params) // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `DropItem(itemId string, params map[string]interface{}) (map[string]string, error)`

Drop specific item instances with parameters.

```go
params := map[string]interface{}{
    "amount":   1,
    "uniqueId": "instance_123",
}

result, err := api.DropItem("item_xyz789", params) // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `UpdateItemMetadata(itemId, uniqueId string, metadata map[string]interface{}) (map[string]string, error)`

Update metadata for a specific item instance.

```go
metadata := map[string]interface{}{
    "enchantment": "ice",
    "level":       10,
}

result, err := api.UpdateItemMetadata("item_xyz789", "instance_123", metadata) // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

---

### Inventory Module

#### `GetMyInventory() (map[string]interface{}, error)`

Get the authenticated user's inventory.

```go
inventory, err := api.GetMyInventory() // Requires authentication
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Inventory: %v\n", inventory)
```

#### `GetInventory(userId string) (map[string]interface{}, error)`

Get another user's public inventory.

```go
userInventory, err := api.GetInventory("user_12345")
if err != nil {
    log.Fatal(err)
}
```

---

### Studios Module

#### `CreateStudio(studioName string) (map[string]string, error)`

Create a new development studio.

```go
result, err := api.CreateStudio("Awesome Games Studio") // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `GetStudio(studioId string) (*Studio, error)`

Get information about a specific studio.

```go
studio, err := api.GetStudio("studio_abc123")
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Studio: %s\n", studio.Username)
```

#### `GetMyStudios() ([]Studio, error)`

Get studios the authenticated user is part of.

```go
myStudios, err := api.GetMyStudios() // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `AddUserToStudio(studioId, userId string) (map[string]string, error)`

Add a user to a studio team.

```go
result, err := api.AddUserToStudio("studio_abc123", "user_67890") // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `RemoveUserFromStudio(studioId, userId string) (map[string]string, error)`

Remove a user from a studio team.

```go
result, err := api.RemoveUserFromStudio("studio_abc123", "user_67890") // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

---

### Lobbies Module

#### `CreateLobby() (map[string]string, error)`

Create a new game lobby.

```go
result, err := api.CreateLobby() // Requires authentication
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Lobby created: %v\n", result)
```

#### `GetLobby(lobbyId string) (*Lobby, error)`

Get information about a specific lobby.

```go
lobby, err := api.GetLobby("lobby_xyz789")
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Lobby: %d players\n", len(lobby.Users))
```

#### `GetMyLobby() (*Lobby, error)`

Get the authenticated user's current lobby.

```go
myLobby, err := api.GetMyLobby() // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `GetUserLobby(userId string) (*Lobby, error)`

Get the lobby a specific user is in.

```go
userLobby, err := api.GetUserLobby("user_12345")
if err != nil {
    log.Fatal(err)
}
```

#### `JoinLobby(lobbyId string) (map[string]string, error)`

Join an existing lobby.

```go
result, err := api.JoinLobby("lobby_xyz789") // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `LeaveLobby(lobbyId string) (map[string]string, error)`

Leave a lobby.

```go
result, err := api.LeaveLobby("lobby_xyz789") // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

---

### Trading Module

#### `StartOrGetPendingTrade(userId string) (*Trade, error)`

Start a new trade or get existing pending trade with a user.

```go
trade, err := api.StartOrGetPendingTrade("user_67890") // Requires authentication
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Trade ID: %s\n", trade.Id)
```

#### `GetTrade(tradeId string) (*Trade, error)`

Get information about a specific trade.

```go
trade, err := api.GetTrade("trade_abc123")
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Trade status: %s\n", trade.Status)
```

#### `GetUserTrades(userId string) ([]Trade, error)`

Get all trades for a specific user.

```go
userTrades, err := api.GetUserTrades("user_12345") // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `AddItemToTrade(tradeId string, tradeItem TradeItem) (map[string]string, error)`

Add an item to a trade.

```go
tradeItem := croissantapi.TradeItem{
    ItemId: "item_xyz789",
    Amount: 1,
    Metadata: map[string]interface{}{
        "enchantment": "fire",
    },
}

result, err := api.AddItemToTrade("trade_abc123", tradeItem) // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `RemoveItemFromTrade(tradeId string, tradeItem TradeItem) (map[string]string, error)`

Remove an item from a trade.

```go
tradeItem := croissantapi.TradeItem{
    ItemId: "item_xyz789",
    Amount: 1,
}

result, err := api.RemoveItemFromTrade("trade_abc123", tradeItem) // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `ApproveTrade(tradeId string) (map[string]string, error)`

Approve and execute a trade.

```go
result, err := api.ApproveTrade("trade_abc123") // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `CancelTrade(tradeId string) (map[string]string, error)`

Cancel a pending trade.

```go
result, err := api.CancelTrade("trade_abc123") // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

---

### OAuth2 Module

#### `CreateOAuth2App(name string, redirectUrls []string) (map[string]string, error)`

Create a new OAuth2 application.

```go
redirectUrls := []string{"https://mygame.com/auth/callback"}
result, err := api.CreateOAuth2App("My Game Client", redirectUrls) // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `GetOAuth2App(clientId string) (*OAuth2App, error)`

Get OAuth2 application by client ID.

```go
app, err := api.GetOAuth2App("client_12345")
if err != nil {
    log.Fatal(err)
}
```

#### `GetMyOAuth2Apps() ([]OAuth2App, error)`

Get OAuth2 applications owned by the authenticated user.

```go
apps, err := api.GetMyOAuth2Apps() // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `UpdateOAuth2App(clientId string, data map[string]interface{}) (map[string]bool, error)`

Update an OAuth2 application.

```go
updates := map[string]interface{}{
    "name": "Updated App Name",
}
result, err := api.UpdateOAuth2App("client_12345", updates) // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `DeleteOAuth2App(clientId string) (map[string]string, error)`

Delete an OAuth2 application.

```go
result, err := api.DeleteOAuth2App("client_12345") // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `AuthorizeOAuth2(clientId, redirectUri string) (map[string]string, error)`

Authorize a user for an OAuth2 app.

```go
result, err := api.AuthorizeOAuth2("client_12345", "https://app.com/callback") // Requires authentication
if err != nil {
    log.Fatal(err)
}
```

#### `GetUserByOAuth2Code(code, clientId string) (*User, error)`

Get user information using OAuth2 authorization code.

```go
userData, err := api.GetUserByOAuth2Code("auth_code", "client_12345")
if err != nil {
    log.Fatal(err)
}
```

## Type Definitions

### Core Types

#### `User`

```go
type User struct {
    UserId           string         `json:"userId"`
    Username         string         `json:"username"`
    Email            *string        `json:"email,omitempty"`
    Verified         bool           `json:"verified"`
    Studios          []Studio       `json:"studios,omitempty"`
    Roles            []string       `json:"roles,omitempty"`
    Inventory        []InventoryItem `json:"inventory,omitempty"`
    OwnedItems       []Item         `json:"ownedItems,omitempty"`
    CreatedGames     []Game         `json:"createdGames,omitempty"`
    VerificationKey  *string        `json:"verificationKey,omitempty"`
    SteamId          *string        `json:"steam_id,omitempty"`
    SteamUsername    *string        `json:"steam_username,omitempty"`
    SteamAvatarUrl   *string        `json:"steam_avatar_url,omitempty"`
    IsStudio         *bool          `json:"isStudio,omitempty"`
    Admin            *bool          `json:"admin,omitempty"`
    Disabled         *bool          `json:"disabled,omitempty"`
    GoogleId         *string        `json:"google_id,omitempty"`
    DiscordId        *string        `json:"discord_id,omitempty"`
    Balance          *float64       `json:"balance,omitempty"`
    HaveAuthenticator *bool         `json:"haveAuthenticator,omitempty"`
}
```

#### `Game`

```go
type Game struct {
    GameId      string   `json:"gameId"`
    Name        string   `json:"name"`
    Description string   `json:"description"`
    Price       float64  `json:"price"`
    OwnerId     string   `json:"owner_id"`
    ShowInStore bool     `json:"showInStore"`
    IconHash    *string  `json:"iconHash,omitempty"`
    SplashHash  *string  `json:"splashHash,omitempty"`
    BannerHash  *string  `json:"bannerHash,omitempty"`
    Genre       *string  `json:"genre,omitempty"`
    ReleaseDate *string  `json:"release_date,omitempty"`
    Developer   *string  `json:"developer,omitempty"`
    Publisher   *string  `json:"publisher,omitempty"`
    Platforms   []string `json:"platforms,omitempty"`
    Rating      float64  `json:"rating"`
    Website     *string  `json:"website,omitempty"`
    TrailerLink *string  `json:"trailer_link,omitempty"`
    Multiplayer bool     `json:"multiplayer"`
    DownloadLink *string `json:"download_link,omitempty"`
}
```

#### `Item`

```go
type Item struct {
    ItemId      string  `json:"itemId"`
    Name        string  `json:"name"`
    Description string  `json:"description"`
    Owner       string  `json:"owner"`
    Price       float64 `json:"price"`
    IconHash    string  `json:"iconHash"`
    ShowInStore *bool   `json:"showInStore,omitempty"`
    Deleted     *bool   `json:"deleted,omitempty"`
}
```

#### `InventoryItem`

```go
type InventoryItem struct {
    UserId     *string                `json:"user_id,omitempty"`
    ItemId     string                 `json:"itemId"`
    ItemIdAlt  *string                `json:"item_id,omitempty"`
    Amount     int                    `json:"amount"`
    Metadata   map[string]interface{} `json:"metadata,omitempty"`
    Name       string                 `json:"name"`
    Description string                `json:"description"`
    IconHash   string                 `json:"iconHash"`
    Price      float64                `json:"price"`
    Owner      string                 `json:"owner"`
    ShowInStore bool                  `json:"showInStore"`
}
```

#### `Trade`

```go
type Trade struct {
    Id             string `json:"id"`
    FromUserId     string `json:"fromUserId"`
    ToUserId       string `json:"toUserId"`
    FromUserItems  []struct {
        ItemId      string `json:"itemId"`
        Name        string `json:"name"`
        Description string `json:"description"`
        IconHash    string `json:"iconHash"`
        Amount      int    `json:"amount"`
    } `json:"fromUserItems"`
    ToUserItems []struct {
        ItemId      string `json:"itemId"`
        Name        string `json:"name"`
        Description string `json:"description"`
        IconHash    string `json:"iconHash"`
        Amount      int    `json:"amount"`
    } `json:"toUserItems"`
    ApprovedFromUser bool   `json:"approvedFromUser"`
    ApprovedToUser   bool   `json:"approvedToUser"`
    Status           string `json:"status"`
    CreatedAt        string `json:"createdAt"`
    UpdatedAt        string `json:"updatedAt"`
}
```

#### `Studio`

```go
type Studio struct {
    UserId   string `json:"user_id"`
    Username string `json:"username"`
    Verified bool   `json:"verified"`
    AdminId  string `json:"admin_id"`
    IsAdmin  *bool  `json:"isAdmin,omitempty"`
    ApiKey   *string `json:"apiKey,omitempty"`
    Users    []struct {
        UserId   string `json:"user_id"`
        Username string `json:"username"`
        Verified bool   `json:"verified"`
        Admin    bool   `json:"admin"`
    } `json:"users,omitempty"`
}
```

#### `Lobby`

```go
type Lobby struct {
    LobbyId string `json:"lobbyId"`
    Users   []struct {
        Username       string  `json:"username"`
        UserId         string  `json:"user_id"`
        Verified       bool    `json:"verified"`
        SteamUsername  *string `json:"steam_username,omitempty"`
        SteamAvatarUrl *string `json:"steam_avatar_url,omitempty"`
        SteamId        *string `json:"steam_id,omitempty"`
    } `json:"users"`
}
```

#### `TradeItem`

```go
type TradeItem struct {
    ItemId   string                 `json:"itemId"`
    Amount   int                    `json:"amount"`
    Metadata map[string]interface{} `json:"metadata,omitempty"`
}
```

#### `OAuth2App`

```go
type OAuth2App struct {
    ClientId     string   `json:"client_id"`
    ClientSecret string   `json:"client_secret"`
    Name         string   `json:"name"`
    RedirectUrls []string `json:"redirect_urls"`
}
```

## Error Handling

All API methods return errors that should be checked. Always handle errors appropriately:

```go
user, err := api.GetMe()
if err != nil {
    switch {
    case strings.Contains(err.Error(), "Token is required"):
        log.Println("Authentication required")
    case strings.Contains(err.Error(), "404"):
        log.Println("Resource not found")
    case strings.Contains(err.Error(), "401"):
        log.Println("Unauthorized - check token")
    case strings.Contains(err.Error(), "403"):
        log.Println("Forbidden - insufficient permissions")
    default:
        log.Printf("API Error: %v", err)
    }
    return
}

fmt.Printf("Welcome, %s!\n", user.Username)
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

### HTTP Server Integration

```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
    "croissantapi"
)

type Server struct {
    api *croissantapi.CroissantAPI
}

func NewServer() *Server {
    api := croissantapi.NewCroissantAPI(os.Getenv("CROISSANT_API_TOKEN"))
    return &Server{api: api}
}

func (s *Server) handleUser(w http.ResponseWriter, r *http.Request) {
    userID := r.URL.Path[len("/api/user/"):]

    user, err := s.api.GetUser(userID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}

func (s *Server) handleGames(w http.ResponseWriter, r *http.Request) {
    games, err := s.api.ListGames()
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(games)
}

func (s *Server) handleBuyItem(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    itemID := r.URL.Path[len("/api/items/"):]
    itemID = itemID[:len(itemID)-len("/buy")]

    var request struct {
        Amount int `json:"amount"`
    }

    if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    result, err := s.api.BuyItem(itemID, request.Amount)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(result)
}

func main() {
    server := NewServer()

    http.HandleFunc("/api/user/", server.handleUser)
    http.HandleFunc("/api/games", server.handleGames)
    http.HandleFunc("/api/items/", server.handleBuyItem)

    log.Println("Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

### Gin Framework Integration

```go
package main

import (
    "net/http"
    "os"
    "strconv"

    "github.com/gin-gonic/gin"
    "croissantapi"
)

type GameServer struct {
    api *croissantapi.CroissantAPI
}

func NewGameServer() *GameServer {
    api := croissantapi.NewCroissantAPI(os.Getenv("CROISSANT_API_TOKEN"))
    return &GameServer{api: api}
}

func (gs *GameServer) handlePlayerLogin(c *gin.Context) {
    playerID := c.Param("id")

    user, err := gs.api.GetUser(playerID)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
        return
    }

    inventory, err := gs.api.GetInventory(playerID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    response := gin.H{
        "username":  user.Username,
        "verified":  user.Verified,
        "inventory": inventory,
    }

    c.JSON(http.StatusOK, response)
}

func (gs *GameServer) handleGiveReward(c *gin.Context) {
    playerID := c.Param("id")
    itemID := c.PostForm("itemId")
    amountStr := c.PostForm("amount")

    amount, err := strconv.Atoi(amountStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid amount"})
        return
    }

    result, err := gs.api.GiveItem(itemID, amount, playerID, nil)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, result)
}

func main() {
    r := gin.Default()
    server := NewGameServer()

    api := r.Group("/api")
    {
        api.GET("/player/:id", server.handlePlayerLogin)
        api.POST("/player/:id/reward", server.handleGiveReward)
    }

    r.Run(":8080")
}
```

### Game Server Implementation

```go
package main

import (
    "fmt"
    "log"
    "os"
    "croissantapi"
)

type GameServer struct {
    api     *croissantapi.CroissantAPI
    players map[string]*PlayerData
}

type PlayerData struct {
    Username string
    Verified bool
    Items    []string
}

func NewGameServer() *GameServer {
    api := croissantapi.NewCroissantAPI(os.Getenv("CROISSANT_API_TOKEN"))
    return &GameServer{
        api:     api,
        players: make(map[string]*PlayerData),
    }
}

func (gs *GameServer) HandlePlayerJoin(playerID string) error {
    user, err := gs.api.GetUser(playerID)
    if err != nil {
        return fmt.Errorf("failed to load player %s: %v", playerID, err)
    }

    inventory, err := gs.api.GetInventory(playerID)
    if err != nil {
        return fmt.Errorf("failed to load inventory for %s: %v", playerID, err)
    }

    // Extract item IDs from inventory
    var items []string
    if inventoryItems, ok := inventory["items"].([]interface{}); ok {
        for _, item := range inventoryItems {
            if itemMap, ok := item.(map[string]interface{}); ok {
                if itemID, ok := itemMap["itemId"].(string); ok {
                    items = append(items, itemID)
                }
            }
        }
    }

    gs.players[playerID] = &PlayerData{
        Username: user.Username,
        Verified: user.Verified,
        Items:    items,
    }

    fmt.Printf("Player joined: %s\n", user.Username)
    return nil
}

func (gs *GameServer) GiveQuestReward(playerID, questID string) error {
    rewards := gs.getQuestRewards(questID)

    for _, reward := range rewards {
        _, err := gs.api.GiveItem(reward.ItemID, reward.Amount, playerID, nil)
        if err != nil {
            return fmt.Errorf("failed to give reward: %v", err)
        }
        fmt.Printf("Gave %dx %s to %s\n", reward.Amount, reward.ItemID, playerID)
    }

    return nil
}

func (gs *GameServer) HandlePlayerTrade(fromPlayerID, toPlayerID string, items []TradeItemRequest) (string, error) {
    trade, err := gs.api.StartOrGetPendingTrade(toPlayerID)
    if err != nil {
        return "", fmt.Errorf("failed to start trade: %v", err)
    }

    for _, item := range items {
        tradeItem := croissantapi.TradeItem{
            ItemId: item.ID,
            Amount: item.Amount,
        }

        _, err := gs.api.AddItemToTrade(trade.Id, tradeItem)
        if err != nil {
            return "", fmt.Errorf("failed to add item to trade: %v", err)
        }
    }

    fmt.Printf("Trade created: %s\n", trade.Id)
    return trade.Id, nil
}

type QuestReward struct {
    ItemID string
    Amount int
}

type TradeItemRequest struct {
    ID     string
    Amount int
}

func (gs *GameServer) getQuestRewards(questID string) []QuestReward {
    rewards := map[string][]QuestReward{
        "quest_1": {
            {ItemID: "gold_coin", Amount: 100},
            {ItemID: "health_potion", Amount: 5},
        },
        "quest_2": {
            {ItemID: "magic_sword", Amount: 1},
            {ItemID: "gold_coin", Amount: 250},
        },
    }

    return rewards[questID]
}

func main() {
    server := NewGameServer()

    // Handle events
    if err := server.HandlePlayerJoin("player_123"); err != nil {
        log.Printf("Error: %v", err)
    }

    if err := server.GiveQuestReward("player_123", "quest_1"); err != nil {
        log.Printf("Error: %v", err)
    }

    tradeID, err := server.HandlePlayerTrade("player_123", "player_456", []TradeItemRequest{
        {ID: "magic_sword", Amount: 1},
    })
    if err != nil {
        log.Printf("Error: %v", err)
    } else {
        fmt.Printf("Trade ID: %s\n", tradeID)
    }
}
```

## Complete Examples

### Complete Game Store Implementation

```go
package main

import (
    "fmt"
    "log"
    "croissantapi"
)

type GameStore struct {
    api *croissantapi.CroissantAPI
}

type BrowseOptions struct {
    Search    string
    MaxPrice  *float64
    MinRating *float64
}

func NewGameStore(apiToken string) *GameStore {
    api := croissantapi.NewCroissantAPI(apiToken)
    return &GameStore{api: api}
}

// BrowseGames searches and filters games
func (gs *GameStore) BrowseGames(options BrowseOptions) ([]croissantapi.Game, error) {
    var games []croissantapi.Game
    var err error

    if options.Search != "" {
        games, err = gs.api.SearchGames(options.Search)
    } else {
        games, err = gs.api.ListGames()
    }

    if err != nil {
        return nil, fmt.Errorf("failed to browse games: %v", err)
    }

    // Apply filters
    if options.MaxPrice != nil {
        filtered := make([]croissantapi.Game, 0)
        for _, game := range games {
            if game.Price <= *options.MaxPrice {
                filtered = append(filtered, game)
            }
        }
        games = filtered
    }

    if options.MinRating != nil {
        filtered := make([]croissantapi.Game, 0)
        for _, game := range games {
            if game.Rating >= *options.MinRating {
                filtered = append(filtered, game)
            }
        }
        games = filtered
    }

    return games, nil
}

// BrowseItems searches and filters items
func (gs *GameStore) BrowseItems(options BrowseOptions) ([]croissantapi.Item, error) {
    var items []croissantapi.Item
    var err error

    if options.Search != "" {
        items, err = gs.api.SearchItems(options.Search)
    } else {
        items, err = gs.api.ListItems()
    }

    if err != nil {
        return nil, fmt.Errorf("failed to browse items: %v", err)
    }

    // Apply filters
    if options.MaxPrice != nil {
        filtered := make([]croissantapi.Item, 0)
        for _, item := range items {
            if item.Price <= *options.MaxPrice {
                filtered = append(filtered, item)
            }
        }
        items = filtered
    }

    // Filter out deleted items
    filtered := make([]croissantapi.Item, 0)
    for _, item := range items {
        if item.Deleted == nil || !*item.Deleted {
            filtered = append(filtered, item)
        }
    }

    return filtered, nil
}

type PurchaseResult struct {
    Success    bool
    Item       *croissantapi.Item
    Quantity   int
    TotalCost  float64
    NewBalance float64
    Result     map[string]string
}

// PurchaseItem purchases an item with balance check
func (gs *GameStore) PurchaseItem(itemID string, quantity int) (*PurchaseResult, error) {
    // Get item details
    item, err := gs.api.GetItem(itemID)
    if err != nil {
        return nil, fmt.Errorf("failed to get item: %v", err)
    }

    // Check user balance
    user, err := gs.api.GetMe()
    if err != nil {
        return nil, fmt.Errorf("failed to get user: %v", err)
    }

    totalCost := item.Price * float64(quantity)

    if user.Balance == nil || *user.Balance < totalCost {
        return nil, fmt.Errorf("insufficient balance")
    }

    // Make purchase
    result, err := gs.api.BuyItem(itemID, quantity)
    if err != nil {
        return nil, fmt.Errorf("purchase failed: %v", err)
    }

    return &PurchaseResult{
        Success:    true,
        Item:       item,
        Quantity:   quantity,
        TotalCost:  totalCost,
        NewBalance: *user.Balance - totalCost,
        Result:     result,
    }, nil
}

// GetLibrary returns user's game library
func (gs *GameStore) GetLibrary() ([]croissantapi.Game, error) {
    games, err := gs.api.GetMyOwnedGames()
    if err != nil {
        return nil, fmt.Errorf("failed to load library: %v", err)
    }
    return games, nil
}

// GetInventory returns user's inventory
func (gs *GameStore) GetInventory() (map[string]interface{}, error) {
    inventory, err := gs.api.GetMyInventory()
    if err != nil {
        return nil, fmt.Errorf("failed to load inventory: %v", err)
    }
    return inventory, nil
}

func main() {
    store := NewGameStore(os.Getenv("CROISSANT_API_TOKEN"))

    // Browse and purchase
    maxPrice := 50.0
    games, err := store.BrowseGames(BrowseOptions{
        Search:   "adventure",
        MaxPrice: &maxPrice,
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Found %d adventure games under 50 credits\n", len(games))

    items, err := store.BrowseItems(BrowseOptions{
        Search:   "sword",
        MaxPrice: &maxPrice,
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Found %d swords under 50 credits\n", len(items))

    // Purchase item
    purchaseResult, err := store.PurchaseItem("item_123", 1)
    if err != nil {
        log.Printf("Purchase failed: %v", err)
    } else {
        fmt.Printf("Purchase successful! New balance: %.2f\n", purchaseResult.NewBalance)
    }
}
```

### Trading System Implementation

```go
package main

import (
    "fmt"
    "log"
    "os"
    "croissantapi"
)

type TradingSystem struct {
    api *croissantapi.CroissantAPI
}

type OfferItem struct {
    ID       string
    Amount   int
    Metadata map[string]interface{}
}

func NewTradingSystem(apiToken string) *TradingSystem {
    api := croissantapi.NewCroissantAPI(apiToken)
    return &TradingSystem{api: api}
}

// CreateTradeOffer creates a trade offer with another player
func (ts *TradingSystem) CreateTradeOffer(targetUserID string, offeredItems []OfferItem) (*croissantapi.Trade, error) {
    // Start or get pending trade
    trade, err := ts.api.StartOrGetPendingTrade(targetUserID)
    if err != nil {
        return nil, fmt.Errorf("failed to start trade: %v", err)
    }

    // Add items to trade
    for _, item := range offeredItems {
        tradeItem := croissantapi.TradeItem{
            ItemId:   item.ID,
            Amount:   item.Amount,
            Metadata: item.Metadata,
        }

        _, err := ts.api.AddItemToTrade(trade.Id, tradeItem)
        if err != nil {
            return nil, fmt.Errorf("failed to add item to trade: %v", err)
        }
    }

    fmt.Printf("Trade offer created: %s\n", trade.Id)
    return trade, nil
}

// GetUserTrades gets all trades for a user
func (ts *TradingSystem) GetUserTrades(userID string) ([]croissantapi.Trade, error) {
    trades, err := ts.api.GetUserTrades(userID)
    if err != nil {
        return nil, fmt.Errorf("failed to get trades: %v", err)
    }
    return trades, nil
}

// AcceptTrade accepts a trade
func (ts *TradingSystem) AcceptTrade(tradeID string) (map[string]string, error) {
    result, err := ts.api.ApproveTrade(tradeID)
    if err != nil {
        return nil, fmt.Errorf("failed to accept trade: %v", err)
    }

    fmt.Printf("Trade accepted: %s\n", tradeID)
    return result, nil
}

// CancelTrade cancels a trade
func (ts *TradingSystem) CancelTrade(tradeID string) (map[string]string, error) {
    result, err := ts.api.CancelTrade(tradeID)
    if err != nil {
        return nil, fmt.Errorf("failed to cancel trade: %v", err)
    }

    fmt.Printf("Trade cancelled: %s\n", tradeID)
    return result, nil
}

// GetTradeDetails gets trade details
func (ts *TradingSystem) GetTradeDetails(tradeID string) (*croissantapi.Trade, error) {
    trade, err := ts.api.GetTrade(tradeID)
    if err != nil {
        return nil, fmt.Errorf("failed to get trade details: %v", err)
    }
    return trade, nil
}

func main() {
    trading := NewTradingSystem(os.Getenv("CROISSANT_API_TOKEN"))

    // Create a trade offer
    trade, err := trading.CreateTradeOffer("other_player_id", []OfferItem{
        {ID: "sword_123", Amount: 1},
        {ID: "potion_456", Amount: 5},
    })
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Trade created: %s\n", trade.Id)

    // List my trades
    myTrades, err := trading.GetUserTrades("my_user_id")
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("I have %d active trades\n", len(myTrades))

    // Accept a trade (example)
    // _, err = trading.AcceptTrade("trade_id_here")
    // if err != nil {
    //     log.Printf("Failed to accept trade: %v", err)
    // }
}
```

## Best Practices

### Rate Limiting

```go
package main

import (
    "sync"
    "time"
    "croissantapi"
)

type RateLimitedAPI struct {
    api         *croissantapi.CroissantAPI
    lastRequest time.Time
    minInterval time.Duration
    mutex       sync.Mutex
}

func NewRateLimitedAPI(apiToken string) *RateLimitedAPI {
    api := croissantapi.NewCroissantAPI(apiToken)
    return &RateLimitedAPI{
        api:         api,
        lastRequest: time.Now().Add(-time.Second),
        minInterval: 100 * time.Millisecond, // 100ms between requests
    }
}

func (r *RateLimitedAPI) throttle() {
    r.mutex.Lock()
    defer r.mutex.Unlock()

    timeSinceLastRequest := time.Since(r.lastRequest)
    if timeSinceLastRequest < r.minInterval {
        time.Sleep(r.minInterval - timeSinceLastRequest)
    }

    r.lastRequest = time.Now()
}

func (r *RateLimitedAPI) GetUser(userID string) (*croissantapi.User, error) {
    r.throttle()
    return r.api.GetUser(userID)
}

func (r *RateLimitedAPI) SearchItems(query string) ([]croissantapi.Item, error) {
    r.throttle()
    return r.api.SearchItems(query)
}
```

### Caching Strategy

```go
package main

import (
    "sync"
    "time"
    "croissantapi"
)

type CacheEntry struct {
    Data    interface{}
    Expires time.Time
}

type CachedCroissantAPI struct {
    api          *croissantapi.CroissantAPI
    cache        map[string]*CacheEntry
    cacheTimeout time.Duration
    mutex        sync.RWMutex
}

func NewCachedCroissantAPI(apiToken string) *CachedCroissantAPI {
    api := croissantapi.NewCroissantAPI(apiToken)
    return &CachedCroissantAPI{
        api:          api,
        cache:        make(map[string]*CacheEntry),
        cacheTimeout: 5 * time.Minute, // 5 minutes
    }
}

func (c *CachedCroissantAPI) getCacheKey(prefix string, args ...string) string {
    key := prefix
    for _, arg := range args {
        key += ":" + arg
    }
    return key
}

func (c *CachedCroissantAPI) isExpired(timestamp time.Time) bool {
    return time.Now().After(timestamp)
}

func (c *CachedCroissantAPI) GetCachedGames() ([]croissantapi.Game, error) {
    key := c.getCacheKey("games", "list")

    c.mutex.RLock()
    cached, exists := c.cache[key]
    c.mutex.RUnlock()

    if exists && !c.isExpired(cached.Expires) {
        return cached.Data.([]croissantapi.Game), nil
    }

    games, err := c.api.ListGames()
    if err != nil {
        return nil, err
    }

    c.mutex.Lock()
    c.cache[key] = &CacheEntry{
        Data:    games,
        Expires: time.Now().Add(c.cacheTimeout),
    }
    c.mutex.Unlock()

    return games, nil
}

func (c *CachedCroissantAPI) GetCachedUser(userID string) (*croissantapi.User, error) {
    key := c.getCacheKey("user", userID)

    c.mutex.RLock()
    cached, exists := c.cache[key]
    c.mutex.RUnlock()

    if exists && !c.isExpired(cached.Expires) {
        return cached.Data.(*croissantapi.User), nil
    }

    user, err := c.api.GetUser(userID)
    if err != nil {
        return nil, err
    }

    c.mutex.Lock()
    c.cache[key] = &CacheEntry{
        Data:    user,
        Expires: time.Now().Add(c.cacheTimeout),
    }
    c.mutex.Unlock()

    return user, nil
}

func (c *CachedCroissantAPI) ClearCache() {
    c.mutex.Lock()
    defer c.mutex.Unlock()
    c.cache = make(map[string]*CacheEntry)
}
```

### Environment Configuration

```go
package main

import (
    "fmt"
    "log"
    "os"
    "strconv"
    "time"
    "croissantapi"
)

type CroissantConfig struct {
    APIToken      string
    Timeout       time.Duration
    RetryAttempts int
}

func LoadConfigFromEnv() (*CroissantConfig, error) {
    config := &CroissantConfig{
        APIToken:      os.Getenv("CROISSANT_API_TOKEN"),
        Timeout:       30 * time.Second,
        RetryAttempts: 3,
    }

    if timeoutStr := os.Getenv("CROISSANT_TIMEOUT"); timeoutStr != "" {
        if timeout, err := strconv.Atoi(timeoutStr); err == nil {
            config.Timeout = time.Duration(timeout) * time.Second
        }
    }

    if retriesStr := os.Getenv("CROISSANT_RETRY_ATTEMPTS"); retriesStr != "" {
        if retries, err := strconv.Atoi(retriesStr); err == nil {
            config.RetryAttempts = retries
        }
    }

    if config.APIToken == "" {
        log.Println("Warning: No Croissant API token found")
    }

    return config, nil
}

func (c *CroissantConfig) CreateAPI() *croissantapi.CroissantAPI {
    if c.APIToken == "" {
        log.Fatal("CROISSANT_API_TOKEN environment variable is required")
    }

    return croissantapi.NewCroissantAPI(c.APIToken)
}

func main() {
    config, err := LoadConfigFromEnv()
    if err != nil {
        log.Fatal(err)
    }

    api := config.CreateAPI()

    user, err := api.GetMe()
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Logged in as: %s\n", user.Username)
}
```

### Error Recovery

```go
package main

import (
    "fmt"
    "strings"
    "time"
    "croissantapi"
)

type ResilientCroissantAPI struct {
    api           *croissantapi.CroissantAPI
    maxRetries    int
    retryDelay    time.Duration
}

func NewResilientCroissantAPI(apiToken string) *ResilientCroissantAPI {
    api := croissantapi.NewCroissantAPI(apiToken)
    return &ResilientCroissantAPI{
        api:        api,
        maxRetries: 3,
        retryDelay: 1 * time.Second,
    }
}

func (r *ResilientCroissantAPI) shouldRetry(err error) bool {
    // Retry on network errors, timeouts, and 5xx server errors
    errMsg := strings.ToLower(err.Error())
    return strings.Contains(errMsg, "timeout") ||
           strings.Contains(errMsg, "network") ||
           strings.Contains(errMsg, "5") // 5xx errors
}

func (r *ResilientCroissantAPI) withRetry(operation func() error) error {
    var lastErr error

    for attempt := 0; attempt <= r.maxRetries; attempt++ {
        lastErr = operation()
        if lastErr == nil {
            return nil
        }

        if attempt < r.maxRetries && r.shouldRetry(lastErr) {
            fmt.Printf("Retry %d/%d after error: %v\n", attempt+1, r.maxRetries, lastErr)
            time.Sleep(r.retryDelay * time.Duration(attempt+1)) // Exponential backoff
        } else {
            break
        }
    }

    return lastErr
}

func (r *ResilientCroissantAPI) GetUser(userID string) (*croissantapi.User, error) {
    var user *croissantapi.User
    var err error

    retryErr := r.withRetry(func() error {
        user, err = r.api.GetUser(userID)
        return err
    })

    return user, retryErr
}

func (r *ResilientCroissantAPI) ListGames() ([]croissantapi.Game, error) {
    var games []croissantapi.Game
    var err error

    retryErr := r.withRetry(func() error {
        games, err = r.api.ListGames()
        return err
    })

    return games, retryErr
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
- **Minimum Requirements**: Go 1.18+

### Changelog

#### v1.0.0 (July 2025)

- Initial release
- Complete API coverage
- Full Go support
- Comprehensive documentation
- Zero external dependencies

---

\*Built with ❤️ for
