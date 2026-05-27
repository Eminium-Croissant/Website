# Croissant API Client Library - C#

A comprehensive C# client library for the Croissant gaming platform API. This library provides a fully typed interface for all platform features including user management, game operations, inventory, trading, and more.

## Installation

### Direct Download

Download the library directly from the Croissant platform:

- **C#**: [CroissantAPI.cs](https://croissant-api.eminium.ovh/downloadables/sdk-cs/CroissantAPI.cs)

### NuGet Package

```bash
# Coming soon
Install-Package CroissantAPI
```

### Manual Integration

```csharp
// Add the CroissantAPI.cs file to your project
// Ensure you have Newtonsoft.Json NuGet package installed
Install-Package Newtonsoft.Json
```

## Requirements

- **.NET**: Framework 4.6.1+ or .NET Core 2.0+
- **Dependencies**: Newtonsoft.Json, System.Net.Http
- **C# Version**: 7.0+

## Getting Started

### Basic Initialization

```csharp
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        // Authenticated access (full functionality)
        var api = new CroissantAPI("your_api_token");

        try
        {
            var user = await api.users.GetMe();
            Console.WriteLine($"Welcome, {user.username}!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
```

### Authentication

To perform authenticated operations, you need an API token:

1. **Via Web Dashboard**: Login to [croissant-api.eminium.ovh](https://croissant-api.eminium.ovh) and generate a token
2. **Via OAuth2**: Implement OAuth2 flow for third-party applications
3. **Via Bot Token**: Use dedicated bot tokens for automated systems

```csharp
// Environment variable (recommended)
var api = new CroissantAPI(Environment.GetEnvironmentVariable("CROISSANT_API_TOKEN"));

// Or directly
var api = new CroissantAPI("your_token_here");
```

## API Reference

### Core Structure

#### `CroissantAPI`

Main API client class providing access to all platform modules.

**Constructor**

```csharp
public CroissantAPI(string token)
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

#### `GetMe(): Task<User>`

Retrieve the authenticated user's profile.

```csharp
var user = await api.users.GetMe(); // Requires authentication
Console.WriteLine($"Welcome, {user.username}!");
Console.WriteLine($"Balance: {user.balance} credits");
```

#### `Search(string query): Task<List<User>>`

Search for users by username.

```csharp
var users = await api.users.Search("john");
foreach (var user in users)
{
    Console.WriteLine($"Found user: {user.username}");
}
```

#### `GetUser(string userId): Task<User>`

Get a specific user by ID (supports Croissant ID, Discord ID, Google ID, or Steam ID).

```csharp
var user = await api.users.GetUser("user_12345");
Console.WriteLine($"User: {user.username}");
```

#### `TransferCredits(string targetUserId, int amount): Task<dynamic>`

Transfer credits to another user.

```csharp
var result = await api.users.TransferCredits("user_67890", 100);
Console.WriteLine($"Transfer completed: {result}");
```

#### `Verify(string userId, string verificationKey): Task<dynamic>`

Verify a user account.

```csharp
var result = await api.users.Verify("user_id", "verification_key");
```

#### `ChangeUsername(string username): Task<dynamic>`

Change the authenticated user's username.

```csharp
var result = await api.users.ChangeUsername("new_username");
```

#### `ChangePassword(string oldPassword, string newPassword, string confirmPassword): Task<dynamic>`

Change the authenticated user's password.

```csharp
var result = await api.users.ChangePassword("old_pass", "new_pass", "new_pass");
```

---

### Games Module (`api.games`)

#### `List(): Task<List<Game>>`

List all available games.

```csharp
var games = await api.games.List();
Console.WriteLine($"Available games: {games.Count}");
```

#### `Search(string query): Task<List<Game>>`

Search games by name, genre, or description.

```csharp
var games = await api.games.Search("adventure platformer");
foreach (var game in games)
{
    Console.WriteLine($"Found game: {game.name} - {game.description}");
}
```

#### `Get(string gameId): Task<Game>`

Get detailed information about a specific game.

```csharp
var game = await api.games.Get("game_abc123");
Console.WriteLine($"Game: {game.name} - Price: {game.price}");
```

#### `GetMyCreatedGames(): Task<List<Game>>`

Get games created by the authenticated user.

```csharp
var myGames = await api.games.GetMyCreatedGames(); // Requires authentication
```

#### `GetMyOwnedGames(): Task<List<Game>>`

Get games owned by the authenticated user.

```csharp
var ownedGames = await api.games.GetMyOwnedGames(); // Requires authentication
```

#### `Create(object gameData): Task<dynamic>`

Create a new game.

```csharp
var gameData = new
{
    name = "Awesome Platformer",
    description = "A fun platforming adventure",
    price = 29.99,
    genre = "Platformer"
};

var result = await api.games.Create(gameData); // Requires authentication
```

#### `Update(string gameId, object gameData): Task<Game>`

Update an existing game.

```csharp
var updates = new
{
    price = 24.99,
    description = "Updated description with new features"
};

var updatedGame = await api.games.Update("game_abc123", updates); // Requires authentication
```

#### `Buy(string gameId): Task<dynamic>`

Purchase a game.

```csharp
var result = await api.games.Buy("game_abc123"); // Requires authentication
Console.WriteLine($"Purchase result: {result}");
```

---

### Items Module (`api.items`)

#### `List(): Task<List<Item>>`

List all available items in the marketplace.

```csharp
var items = await api.items.List();
Console.WriteLine($"Available items: {items.Count}");
```

#### `Search(string query): Task<List<Item>>`

Search items by name or description.

```csharp
var items = await api.items.Search("magic sword");
foreach (var item in items)
{
    Console.WriteLine($"Found item: {item.name} - Price: {item.price}");
}
```

#### `Get(string itemId): Task<Item>`

Get detailed information about a specific item.

```csharp
var item = await api.items.Get("item_xyz789");
Console.WriteLine($"Item: {item.name} - {item.description}");
```

#### `GetMyItems(): Task<List<Item>>`

Get items owned by the authenticated user.

```csharp
var myItems = await api.items.GetMyItems(); // Requires authentication
```

#### `Create(object itemData): Task<dynamic>`

Create a new item for sale.

```csharp
var itemData = new
{
    name = "Enchanted Shield",
    description = "Provides magical protection",
    price = 150.0,
    iconHash = "optional_hash"
};

var result = await api.items.Create(itemData); // Requires authentication
```

#### `Update(string itemId, object itemData): Task<dynamic>`

Update an existing item.

```csharp
var updates = new
{
    price = 125.0,
    description = "Updated description"
};

var result = await api.items.Update("item_xyz789", updates); // Requires authentication
```

#### `Delete(string itemId): Task<dynamic>`

Delete an item.

```csharp
var result = await api.items.Delete("item_xyz789"); // Requires authentication
```

#### `Buy(string itemId, int amount): Task<dynamic>`

Purchase items from the marketplace.

```csharp
var result = await api.items.Buy("item_xyz789", 2); // Requires authentication
Console.WriteLine($"Purchase completed: {result}");
```

#### `Sell(string itemId, int amount): Task<dynamic>`

Sell items from inventory.

```csharp
var result = await api.items.Sell("item_xyz789", 1); // Requires authentication
```

#### `Give(string itemId, int amount): Task<dynamic>`

Give items to another user.

```csharp
var result = await api.items.Give("item_xyz789", 1); // Requires authentication
```

#### `Consume(string itemId, int amount): Task<dynamic>`

Consume item instances from inventory.

```csharp
var result = await api.items.Consume("item_xyz789", 1); // Requires authentication
```

#### `Drop(string itemId, int amount): Task<dynamic>`

Drop items from inventory.

```csharp
var result = await api.items.Drop("item_xyz789", 1); // Requires authentication
```

---

### Inventory Module (`api.inventory`)

#### `GetMyInventory(): Task<List<InventoryItem>>`

Get the authenticated user's inventory.

```csharp
var inventory = await api.inventory.GetMyInventory(); // Requires authentication
foreach (var item in inventory)
{
    Console.WriteLine($"{item.name}: {item.amount}");
}
```

#### `Get(string userId): Task<List<InventoryItem>>`

Get another user's public inventory.

```csharp
var userInventory = await api.inventory.Get("user_12345");
```

---

### Studios Module (`api.studios`)

#### `Create(string studioName): Task<dynamic>`

Create a new development studio.

```csharp
var result = await api.studios.Create("Awesome Games Studio"); // Requires authentication
```

#### `Get(string studioId): Task<Studio>`

Get information about a specific studio.

```csharp
var studio = await api.studios.Get("studio_abc123");
Console.WriteLine($"Studio: {studio.username}");
```

#### `GetMyStudios(): Task<List<Studio>>`

Get studios the authenticated user is part of.

```csharp
var myStudios = await api.studios.GetMyStudios(); // Requires authentication
```

#### `AddUser(string studioId, string userId): Task<dynamic>`

Add a user to a studio team.

```csharp
var result = await api.studios.AddUser("studio_abc123", "user_67890"); // Requires authentication
```

#### `RemoveUser(string studioId, string userId): Task<dynamic>`

Remove a user from a studio team.

```csharp
var result = await api.studios.RemoveUser("studio_abc123", "user_67890"); // Requires authentication
```

---

### Lobbies Module (`api.lobbies`)

#### `Create(): Task<dynamic>`

Create a new game lobby.

```csharp
var result = await api.lobbies.Create(); // Requires authentication
Console.WriteLine($"Lobby created: {result}");
```

#### `Get(string lobbyId): Task<Lobby>`

Get information about a specific lobby.

```csharp
var lobby = await api.lobbies.Get("lobby_xyz789");
Console.WriteLine($"Lobby: {lobby.users.Count} players");
```

#### `GetMyLobby(): Task<Lobby>`

Get the authenticated user's current lobby.

```csharp
var myLobby = await api.lobbies.GetMyLobby(); // Requires authentication
```

#### `GetUserLobby(string userId): Task<Lobby>`

Get the lobby a specific user is in.

```csharp
var userLobby = await api.lobbies.GetUserLobby("user_12345");
```

#### `Join(string lobbyId): Task<dynamic>`

Join an existing lobby.

```csharp
var result = await api.lobbies.Join("lobby_xyz789"); // Requires authentication
```

#### `Leave(string lobbyId): Task<dynamic>`

Leave a lobby.

```csharp
var result = await api.lobbies.Leave("lobby_xyz789"); // Requires authentication
```

---

### Trading Module (`api.trades`)

#### `StartOrGetPending(string userId): Task<Trade>`

Start a new trade or get existing pending trade with a user.

```csharp
var trade = await api.trades.StartOrGetPending("user_67890"); // Requires authentication
Console.WriteLine($"Trade ID: {trade.id}");
```

#### `Get(string tradeId): Task<Trade>`

Get information about a specific trade.

```csharp
var trade = await api.trades.Get("trade_abc123");
Console.WriteLine($"Trade status: {trade.status}");
```

#### `GetMyTrades(): Task<List<Trade>>`

Get all trades for the authenticated user.

```csharp
var myTrades = await api.trades.GetMyTrades(); // Requires authentication
```

#### `AddItem(string tradeId, TradeItem tradeItem): Task<dynamic>`

Add an item to a trade.

```csharp
var tradeItem = new TradeItem
{
    itemId = "item_xyz789",
    amount = 1
};

var result = await api.trades.AddItem("trade_abc123", tradeItem); // Requires authentication
```

#### `RemoveItem(string tradeId, TradeItem tradeItem): Task<dynamic>`

Remove an item from a trade.

```csharp
var tradeItem = new TradeItem
{
    itemId = "item_xyz789",
    amount = 1
};

var result = await api.trades.RemoveItem("trade_abc123", tradeItem); // Requires authentication
```

#### `Approve(string tradeId): Task<dynamic>`

Approve and execute a trade.

```csharp
var result = await api.trades.Approve("trade_abc123"); // Requires authentication
```

#### `Cancel(string tradeId): Task<dynamic>`

Cancel a pending trade.

```csharp
var result = await api.trades.Cancel("trade_abc123"); // Requires authentication
```

---

### Search Module (`api.search`)

#### `Global(string query): Task<SearchResult>`

Perform a global search across all content types.

```csharp
var results = await api.search.Global("adventure game");
Console.WriteLine($"Found {results.games.Count} games, {results.users.Count} users, {results.items.Count} items");
```

---

### OAuth2 Module (`api.oauth2`)

#### `CreateApp(string name, List<string> redirectUrls): Task<dynamic>`

Create a new OAuth2 application.

```csharp
var redirectUrls = new List<string> { "https://mygame.com/auth/callback" };
var result = await api.oauth2.CreateApp("My Game Client", redirectUrls); // Requires authentication
```

#### `GetApp(string clientId): Task<OAuth2App>`

Get OAuth2 application by client ID.

```csharp
var app = await api.oauth2.GetApp("client_12345");
```

#### `GetMyApps(): Task<List<OAuth2App>>`

Get OAuth2 applications owned by the authenticated user.

```csharp
var apps = await api.oauth2.GetMyApps(); // Requires authentication
```

#### `UpdateApp(string clientId, object data): Task<dynamic>`

Update an OAuth2 application.

```csharp
var updates = new { name = "Updated App Name" };
var result = await api.oauth2.UpdateApp("client_12345", updates); // Requires authentication
```

#### `DeleteApp(string clientId): Task<dynamic>`

Delete an OAuth2 application.

```csharp
var result = await api.oauth2.DeleteApp("client_12345"); // Requires authentication
```

#### `Authorize(string clientId, string redirectUri): Task<dynamic>`

Authorize a user for an OAuth2 app.

```csharp
var result = await api.oauth2.Authorize("client_12345", "https://app.com/callback"); // Requires authentication
```

#### `GetUserByCode(string code, string clientId): Task<User>`

Get user information using OAuth2 authorization code.

```csharp
var userData = await api.oauth2.GetUserByCode("auth_code", "client_12345");
```

## Model Definitions

### Core Models

#### `User`

```csharp
public class User
{
    public string userId { get; set; }
    public string username { get; set; }
    public string email { get; set; }
    public double? balance { get; set; }
    public bool verified { get; set; }
    public string steam_id { get; set; }
    public string steam_username { get; set; }
    public string steam_avatar_url { get; set; }
    public bool isStudio { get; set; }
    public bool admin { get; set; }
    public bool? disabled { get; set; }
    public string google_id { get; set; }
    public string discord_id { get; set; }
    public List<Studio> studios { get; set; }
    public List<string> roles { get; set; }
    public List<InventoryItem> inventory { get; set; }
    public List<Item> ownedItems { get; set; }
    public List<Game> createdGames { get; set; }
    public bool? haveAuthenticator { get; set; }
    public string verificationKey { get; set; }
}
```

#### `Game`

```csharp
public class Game
{
    public string gameId { get; set; }
    public string name { get; set; }
    public string description { get; set; }
    public string owner_id { get; set; }
    public string download_link { get; set; }
    public double price { get; set; }
    public bool showInStore { get; set; }
    public string iconHash { get; set; }
    public string splashHash { get; set; }
    public string bannerHash { get; set; }
    public string genre { get; set; }
    public string release_date { get; set; }
    public string developer { get; set; }
    public string publisher { get; set; }
    public string platforms { get; set; }
    public double rating { get; set; }
    public string website { get; set; }
    public string trailer_link { get; set; }
    public bool multiplayer { get; set; }
}
```

#### `Item`

```csharp
public class Item
{
    public string itemId { get; set; }
    public string name { get; set; }
    public string description { get; set; }
    public double price { get; set; }
    public string owner { get; set; }
    public bool showInStore { get; set; }
    public string iconHash { get; set; }
    public bool deleted { get; set; }
}
```

#### `InventoryItem`

```csharp
public class InventoryItem
{
    public string itemId { get; set; }
    public string name { get; set; }
    public string description { get; set; }
    public int amount { get; set; }
    public string iconHash { get; set; }
}
```

#### `Trade`

```csharp
public class Trade
{
    public string id { get; set; }
    public string fromUserId { get; set; }
    public string toUserId { get; set; }
    public List<TradeItemInfo> fromUserItems { get; set; }
    public List<TradeItemInfo> toUserItems { get; set; }
    public bool approvedFromUser { get; set; }
    public bool approvedToUser { get; set; }
    public string status { get; set; }
    public string createdAt { get; set; }
    public string updatedAt { get; set; }
}
```

#### `Studio`

```csharp
public class Studio
{
    public string user_id { get; set; }
    public string username { get; set; }
    public bool verified { get; set; }
    public string admin_id { get; set; }
    public bool? isAdmin { get; set; }
    public string apiKey { get; set; }
    public List<StudioUser> users { get; set; }
}
```

#### `Lobby`

```csharp
public class Lobby
{
    public string lobbyId { get; set; }
    public List<LobbyUser> users { get; set; }
}
```

#### `OAuth2App`

```csharp
public class OAuth2App
{
    public string clientId { get; set; }
    public string name { get; set; }
    public List<string> redirectUrls { get; set; }
    public string ownerId { get; set; }
    public string createdAt { get; set; }
    public string updatedAt { get; set; }
}
```

## Error Handling

All API methods are async and may throw exceptions. Always wrap calls in try/catch blocks:

```csharp
try
{
    var user = await api.users.GetMe();
    Console.WriteLine($"Welcome, {user.username}!");
}
catch (HttpRequestException ex)
{
    if (ex.Message.Contains("401"))
    {
        Console.WriteLine("Unauthorized - check token");
    }
    else if (ex.Message.Contains("404"))
    {
        Console.WriteLine("Resource not found");
    }
    else if (ex.Message.Contains("403"))
    {
        Console.WriteLine("Forbidden - insufficient permissions");
    }
    else
    {
        Console.WriteLine($"HTTP Error: {ex.Message}");
    }
}
catch (ArgumentException ex)
{
    Console.WriteLine($"Token Error: {ex.Message}");
}
catch (Exception ex)
{
    Console.WriteLine($"API Error: {ex.Message}");
}
```

### Common Error Types

| Error Pattern       | Description                      | Solution                    |
| ------------------- | -------------------------------- | --------------------------- |
| `Token is required` | Authentication required          | Provide valid API token     |
| HTTP 401            | Invalid or expired token         | Refresh or regenerate token |
| HTTP 404            | Resource not found               | Verify resource ID          |
| HTTP 400            | Bad request/insufficient balance | Check request parameters    |
| HTTP 429            | Rate limit exceeded              | Implement rate limiting     |
| HTTP 403            | Permission denied                | Check token permissions     |

## Platform Integration

### ASP.NET Core Integration

```csharp
// Startup.cs
using Microsoft.Extensions.DependencyInjection;

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // Register CroissantAPI as a singleton
        services.AddSingleton<CroissantAPI>(provider =>
        {
            var configuration = provider.GetService<IConfiguration>();
            var token = configuration["CroissantAPI:Token"];
            return new CroissantAPI(token);
        });

        services.AddControllers();
    }
}

// appsettings.json
{
  "CroissantAPI": {
    "Token": "your_api_token_here"
  }
}

// Controllers/PlayersController.cs
[ApiController]
[Route("api/[controller]")]
public class PlayersController : ControllerBase
{
    private readonly CroissantAPI _croissantAPI;

    public PlayersController(CroissantAPI croissantAPI)
    {
        _croissantAPI = croissantAPI;
    }

    [HttpGet("{playerId}")]
    public async Task<IActionResult> GetPlayer(string playerId)
    {
        try
        {
            var user = await _croissantAPI.users.GetUser(playerId);
            var inventory = await _croissantAPI.inventory.Get(playerId);

            var response = new
            {
                Username = user.username,
                Verified = user.verified,
                Items = inventory.Select(i => new
                {
                    Id = i.itemId,
                    Name = i.name,
                    Quantity = i.amount
                })
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return NotFound(new { Error = ex.Message });
        }
    }

    [HttpPost("{playerId}/reward")]
    public async Task<IActionResult> GiveReward(string playerId, [FromBody] RewardRequest request)
    {
        try
        {
            var result = await _croissantAPI.items.Give(request.ItemId, request.Amount);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }
}

public class RewardRequest
{
    public string ItemId { get; set; }
    public int Amount { get; set; }
}
```

### Unity Integration

```csharp
// CroissantManager.cs
using UnityEngine;
using System.Threading.Tasks;
using System;

public class CroissantManager : MonoBehaviour
{
    [SerializeField] private string apiToken;
    private CroissantAPI api;

    private void Start()
    {
        // Initialize API with token from Unity Inspector or PlayerPrefs
        apiToken = PlayerPrefs.GetString("CroissantToken", apiToken);
        api = new CroissantAPI(apiToken);
    }

    public async Task<bool> LoginPlayer(string playerId)
    {
        try
        {
            var user = await api.users.GetUser(playerId);
            var inventory = await api.inventory.Get(playerId);

            Debug.Log($"Player logged in: {user.username}");

            // Update UI with player data
            UpdatePlayerUI(user, inventory);

            return true;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Login failed: {ex.Message}");
            return false;
        }
    }

    public async Task GiveQuestReward(string playerId, string itemId, int amount)
    {
        try
        {
            var result = await api.items.Give(itemId, amount);
            Debug.Log($"Reward given: {result}");

            // Update player inventory UI
            await RefreshPlayerInventory(playerId);
        }
        catch (Exception ex)
        {
            Debug.LogError($"Failed to give reward: {ex.Message}");
        }
    }

    public async Task StartTrade(string targetPlayerId, string itemId, int amount)
    {
        try
        {
            var trade = await api.trades.StartOrGetPending(targetPlayerId);

            var tradeItem = new TradeItem
            {
                itemId = itemId,
                amount = amount
            };

            await api.trades.AddItem(trade.id, tradeItem);

            Debug.Log($"Trade started: {trade.id}");
        }
        catch (Exception ex)
        {
            Debug.LogError($"Trade failed: {ex.Message}");
        }
    }

    private void UpdatePlayerUI(User user, List<InventoryItem> inventory)
    {
        // Update Unity UI elements
        // This would connect to your UI system
    }

    private async Task RefreshPlayerInventory(string playerId)
    {
        try
        {
            var inventory = await api.inventory.Get(playerId);
            // Update inventory UI
        }
        catch (Exception ex)
        {
            Debug.LogError($"Failed to refresh inventory: {ex.Message}");
        }
    }
}

// PlayerLogin.cs - UI Script
using UnityEngine;
using UnityEngine.UI;

public class PlayerLogin : MonoBehaviour
{
    [SerializeField] private InputField playerIdInput;
    [SerializeField] private Button loginButton;
    [SerializeField] private Text statusText;
    [SerializeField] private CroissantManager croissantManager;

    private void Start()
    {
        loginButton.onClick.AddListener(OnLoginClick);
    }

    private async void OnLoginClick()
    {
        string playerId = playerIdInput.text;

        if (string.IsNullOrEmpty(playerId))
        {
            statusText.text = "Please enter a player ID";
            return;
        }

        statusText.text = "Logging in...";
        loginButton.interactable = false;

        bool success = await croissantManager.LoginPlayer(playerId);

        if (success)
        {
            statusText.text = "Login successful!";
            // Switch to game scene or update UI
        }
        else
        {
            statusText.text = "Login failed";
            loginButton.interactable = true;
        }
    }
}
```

### Windows Forms Integration

```csharp
// MainForm.cs
using System;
using System.Threading.Tasks;
using System.Windows.Forms;

public partial class MainForm : Form
{
    private CroissantAPI api;

    public MainForm()
    {
        InitializeComponent();

        // Initialize API
        string token = Properties.Settings.Default.CroissantToken;
        if (!string.IsNullOrEmpty(token))
        {
            api = new CroissantAPI(token);
            LoadUserData();
        }
    }

    private async void LoadUserData()
    {
        try
        {
            var user = await api.users.GetMe();

            // Update UI on main thread
            Invoke(new Action(() =>
            {
                labelUsername.Text = user.username;
                labelBalance.Text = $"{user.balance} credits";
                checkBoxVerified.Checked = user.verified;
            }));

            await LoadGames();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Failed to load user data: {ex.Message}");
        }
    }

    private async Task LoadGames()
    {
        try
        {
            var games = await api.games.List();

            Invoke(new Action(() =>
            {
                listBoxGames.Items.Clear();
                foreach (var game in games)
                {
                    listBoxGames.Items.Add($"{game.name} - {game.price} credits");
                }
            }));
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Failed to load games: {ex.Message}");
        }
    }

    private async void buttonBuyGame_Click(object sender, EventArgs e)
    {
        if (listBoxGames.SelectedIndex < 0) return;

        try
        {
            var games = await api.games.List();
            var selectedGame = games[listBoxGames.SelectedIndex];

            var result = await api.games.Buy(selectedGame.gameId);

            MessageBox.Show($"Game purchased successfully!");
            await LoadUserData(); // Refresh balance
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Purchase failed: {ex.Message}");
        }
    }
}
```

## Complete Examples

### Complete Game Store Implementation

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class GameStore
{
    private readonly CroissantAPI api;

    public GameStore(string apiToken)
    {
        api = new CroissantAPI(apiToken);
    }

    // Browse games with filters
    public async Task<List<Game>> BrowseGames(BrowseOptions options = null)
    {
        options = options ?? new BrowseOptions();

        try
        {
            List<Game> games;

            if (!string.IsNullOrEmpty(options.Search))
            {
                games = await api.games.Search(options.Search);
            }
            else
            {
                games = await api.games.List();
            }

            // Apply filters
            if (options.MaxPrice.HasValue)
            {
                games = games.Where(g => g.price <= options.MaxPrice.Value).ToList();
            }

            if (options.MinRating.HasValue)
            {
                games = games.Where(g => g.rating >= options.MinRating.Value).ToList();
            }

            if (options.Multiplayer.HasValue)
            {
                games = games.Where(g => g.multiplayer == options.Multiplayer.Value).ToList();
            }

            return games;
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to browse games: {ex.Message}");
        }
    }

    // Browse items with filters
    public async Task<List<Item>> BrowseItems(BrowseOptions options = null)
    {
        options = options ?? new BrowseOptions();

        try
        {
            List<Item> items;

            if (!string.IsNullOrEmpty(options.Search))
            {
                items = await api.items.Search(options.Search);
            }
            else
            {
                items = await api.items.List();
            }

            // Apply filters
            if (options.MaxPrice.HasValue)
            {
                items = items.Where(i => i.price <= options.MaxPrice.Value).ToList();
            }

            // Filter out deleted items
            items = items.Where(i => !i.deleted).ToList();

            return items;
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to browse items: {ex.Message}");
        }
    }

    // Purchase item with balance check
    public async Task<PurchaseResult> PurchaseItem(string itemId, int quantity)
    {
        try
        {
            // Get item details
            var item = await api.items.Get(itemId);

            // Check user balance
            var user = await api.users.GetMe();
            var totalCost = item.price * quantity;

            if (!user.balance.HasValue || user.balance.Value < totalCost)
            {
                throw new Exception("Insufficient balance");
            }

            // Make purchase
            var result = await api.items.Buy(itemId, quantity);

            return new PurchaseResult
            {
                Success = true,
                Item = item,
                Quantity = quantity,
                TotalCost = totalCost,
                NewBalance = user.balance.Value - totalCost,
                Result = result
            };
        }
        catch (Exception ex)
        {
            throw new Exception($"Purchase failed: {ex.Message}");
        }
    }

    // Get user's game library
    public async Task<List<Game>> GetLibrary()
    {
        try
        {
            return await api.games.GetMyOwnedGames();
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to load library: {ex.Message}");
        }
    }

    // Get user's inventory
    public async Task<List<InventoryItem>> GetInventory()
    {
        try
        {
            return await api.inventory.GetMyInventory();
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to load inventory: {ex.Message}");
        }
    }
}

public class BrowseOptions
{
    public string Search { get; set; }
    public double? MaxPrice { get; set; }
    public double? MinRating { get; set; }
    public bool? Multiplayer { get; set; }
}

public class PurchaseResult
{
    public bool Success { get; set; }
    public Item Item { get; set; }
    public int Quantity { get; set; }
    public double TotalCost { get; set; }
    public double NewBalance { get; set; }
    public dynamic Result { get; set; }
}

// Usage
class Program
{
    static async Task Main(string[] args)
    {
        var store = new GameStore(Environment.GetEnvironmentVariable("CROISSANT_API_TOKEN"));

        try
        {
            // Browse and purchase
            var games = await store.BrowseGames(new BrowseOptions
            {
                Search = "adventure",
                MaxPrice = 50
            });
            Console.WriteLine($"Found {games.Count} adventure games under 50 credits");

            var items = await store.BrowseItems(new BrowseOptions
            {
                Search = "sword",
                MaxPrice = 100
            });
            Console.WriteLine($"Found {items.Count} swords under 100 credits");

            // Purchase item
            var purchaseResult = await store.PurchaseItem("item_123", 1);
            Console.WriteLine($"Purchase successful! New balance: {purchaseResult.NewBalance}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
```

### Trading System Implementation

```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public class TradingSystem
{
    private readonly CroissantAPI api;

    public TradingSystem(string apiToken)
    {
        api = new CroissantAPI(apiToken);
    }

    // Create a trade offer
    public async Task<Trade> CreateTradeOffer(string targetUserId, List<OfferItem> offeredItems)
    {
        try
        {
            // Start or get pending trade
            var trade = await api.trades.StartOrGetPending(targetUserId);

            // Add items to trade
            foreach (var item in offeredItems)
            {
                var tradeItem = new TradeItem
                {
                    itemId = item.Id,
                    amount = item.Amount
                };

                await api.trades.AddItem(trade.id, tradeItem);
            }

            Console.WriteLine($"Trade offer created: {trade.id}");
            return trade;
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to create trade: {ex.Message}");
        }
    }

    // Get all user's trades
    public async Task<List<Trade>> GetUserTrades()
    {
        try
        {
            return await api.trades.GetMyTrades();
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to get trades: {ex.Message}");
        }
    }

    // Accept a trade
    public async Task<dynamic> AcceptTrade(string tradeId)
    {
        try
        {
            var result = await api.trades.Approve(tradeId);
            Console.WriteLine($"Trade accepted: {tradeId}");
            return result;
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to accept trade: {ex.Message}");
        }
    }

    // Cancel a trade
    public async Task<dynamic> CancelTrade(string tradeId)
    {
        try
        {
            var result = await api.trades.Cancel(tradeId);
            Console.WriteLine($"Trade cancelled: {tradeId}");
            return result;
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to cancel trade: {ex.Message}");
        }
    }

    // Get trade details
    public async Task<Trade> GetTradeDetails(string tradeId)
    {
        try
        {
            return await api.trades.Get(tradeId);
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to get trade details: {ex.Message}");
        }
    }
}

public class OfferItem
{
    public string Id { get; set; }
    public int Amount { get; set; }
}

// Usage
class Program
{
    static async Task Main(string[] args)
    {
        var trading = new TradingSystem(Environment.GetEnvironmentVariable("CROISSANT_API_TOKEN"));

        try
        {
            // Create a trade offer
            var trade = await trading.CreateTradeOffer("other_player_id", new List<OfferItem>
            {
                new OfferItem { Id = "sword_123", Amount = 1 },
                new OfferItem { Id = "potion_456", Amount = 5 }
            });

            Console.WriteLine($"Trade created: {trade.id}");

            // List my trades
            var myTrades = await trading.GetUserTrades();
            Console.WriteLine($"I have {myTrades.Count} active trades");

            // Accept a trade (example)
            // await trading.AcceptTrade("trade_id_here");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Trading error: {ex.Message}");
        }
    }
}
```

## Best Practices

### Rate Limiting

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

public class RateLimitedAPI
{
    private readonly CroissantAPI api;
    private DateTime lastRequest = DateTime.MinValue;
    private readonly TimeSpan minInterval = TimeSpan.FromMilliseconds(100); // 100ms between requests
    private readonly SemaphoreSlim semaphore = new SemaphoreSlim(1, 1);

    public RateLimitedAPI(string apiToken)
    {
        api = new CroissantAPI(apiToken);
    }

    private async Task EnsureRateLimit()
    {
        await semaphore.WaitAsync();
        try
        {
            var timeSinceLastRequest = DateTime.Now - lastRequest;
            if (timeSinceLastRequest < minInterval)
            {
                await Task.Delay(minInterval - timeSinceLastRequest);
            }
            lastRequest = DateTime.Now;
        }
        finally
        {
            semaphore.Release();
        }
    }

    public async Task<T> SafeRequest<T>(Func<Task<T>> request)
    {
        await EnsureRateLimit();
        return await request();
    }

    public async Task<User> GetUser(string userId)
    {
        return await SafeRequest(() => api.users.GetUser(userId));
    }

    public async Task<List<Item>> SearchItems(string query)
    {
        return await SafeRequest(() => api.items.Search(query));
    }
}
```

### Caching Strategy

```csharp
using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;

public class CachedCroissantAPI
{
    private readonly CroissantAPI api;
    private readonly ConcurrentDictionary<string, CacheEntry> cache = new ConcurrentDictionary<string, CacheEntry>();
    private readonly TimeSpan cacheTimeout = TimeSpan.FromMinutes(5); // 5 minutes

    public CachedCroissantAPI(string apiToken)
    {
        api = new CroissantAPI(apiToken);
    }

    private string GetCacheKey(string method, params string[] args)
    {
        return $"{method}:{string.Join(":", args)}";
    }

    private bool IsExpired(DateTime timestamp)
    {
        return DateTime.Now > timestamp;
    }

    public async Task<List<Game>> GetCachedGames()
    {
        var key = GetCacheKey("games", "list");

        if (cache.TryGetValue(key, out var cached) && !IsExpired(cached.Expires))
        {
            return (List<Game>)cached.Data;
        }

        var games = await api.games.List();
        cache[key] = new CacheEntry
        {
            Data = games,
            Expires = DateTime.Now.Add(cacheTimeout)
        };

        return games;
    }

    public async Task<User> GetCachedUser(string userId)
    {
        var key = GetCacheKey("user", userId);

        if (cache.TryGetValue(key, out var cached) && !IsExpired(cached.Expires))
        {
            return (User)cached.Data;
        }

        var user = await api.users.GetUser(userId);
        cache[key] = new CacheEntry
        {
            Data = user,
            Expires = DateTime.Now.Add(cacheTimeout)
        };

        return user;
    }

    public void ClearCache()
    {
        cache.Clear();
    }

    private class CacheEntry
    {
        public object Data { get; set; }
        public DateTime Expires { get; set; }
    }
}
```

### Configuration Management

```csharp
using Microsoft.Extensions.Configuration;
using System;

public class CroissantConfig
{
    public string ApiToken { get; set; }
    public int Timeout { get; set; } = 30000; // 30 seconds
    public int RetryAttempts { get; set; } = 3;

    public static CroissantConfig LoadFromConfiguration(IConfiguration configuration)
    {
        var config = new CroissantConfig();
        configuration.GetSection("Croissant").Bind(config);

        // Fallback to environment variables
        config.ApiToken = config.ApiToken ?? Environment.GetEnvironmentVariable("CROISSANT_API_TOKEN");

        if (string.IsNullOrEmpty(config.ApiToken))
        {
            Console.WriteLine("Warning: No Croissant API token found");
        }

        return config;
    }

    public CroissantAPI CreateAPI()
    {
        if (string.IsNullOrEmpty(ApiToken))
        {
            throw new InvalidOperationException("CROISSANT_API_TOKEN is required");
        }

        return new CroissantAPI(ApiToken);
    }
}

// appsettings.json
{
  "Croissant": {
    "ApiToken": "your_token_here",
    "Timeout": 30000,
    "RetryAttempts": 3
  }
}

// Usage
var configuration = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json")
    .AddEnvironmentVariables()
    .Build();

var config = CroissantConfig.LoadFromConfiguration(configuration);
var api = config.CreateAPI();
```

### Error Recovery

```csharp
using System;
using System.Net.Http;
using System.Threading.Tasks;

public class ResilientCroissantAPI
{
    private readonly CroissantAPI api;
    private readonly int maxRetries = 3;
    private readonly TimeSpan retryDelay = TimeSpan.FromSeconds(1);

    public ResilientCroissantAPI(string apiToken)
    {
        api = new CroissantAPI(apiToken);
    }

    public async Task<T> WithRetry<T>(Func<Task<T>> operation)
    {
        Exception lastException = null;

        for (int attempt = 0; attempt <= maxRetries; attempt++)
        {
            try
            {
                return await operation();
            }
            catch (Exception ex)
            {
                lastException = ex;

                if (attempt < maxRetries && ShouldRetry(ex))
                {
                    Console.WriteLine($"Retry {attempt + 1}/{maxRetries} after error: {ex.Message}");
                    await Task.Delay(retryDelay * (attempt + 1)); // Exponential backoff
                }
                else
                {
                    break;
                }
            }
        }

        throw lastException;
    }

    private bool ShouldRetry(Exception error)
    {
        // Retry on network errors, timeouts, and 5xx server errors
        return error is HttpRequestException ||
               error is TaskCanceledException ||
               (error is HttpRequestException httpEx &&
                httpEx.Message.Contains("5")); // 5xx errors
    }

    public async Task<User> GetUser(string userId)
    {
        return await WithRetry(() => api.users.GetUser(userId));
    }

    public async Task<List<Game>> ListGames()
    {
        return await WithRetry(() => api.games.List());
    }
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
- **Minimum Requirements**: .NET Framework 4.6.1+ or .NET Core 2.0+

### Changelog

#### v1.0.0 (July 2025)

- Initial release
- Complete API coverage
- Full C# support
- Comprehensive documentation
- ASP.NET Core integration support
