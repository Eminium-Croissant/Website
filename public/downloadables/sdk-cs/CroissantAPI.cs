using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using Newtonsoft.Json;

public class CroissantAPI
{
    private static readonly string CROISSANT_BASE_URL = "https://croissant-api.eminium.ovh/api";
    private readonly string token;
    private readonly HttpClient http;

    public CroissantAPI(string token)
    {
        if (string.IsNullOrEmpty(token)) throw new ArgumentException("Token is required");
        this.token = token;
        this.http = new HttpClient();
    }

    // --- USERS ---
    public class Users
    {
        private readonly CroissantAPI api;
        public Users(CroissantAPI api) { this.api = api; }

        /// <summary>
        /// Get the current authenticated user's profile, including studios, roles, inventory, owned items, and created games.
        /// </summary>
        public async Task<User> GetMe()
        {
            var req = new HttpRequestMessage(HttpMethod.Get, $"{CROISSANT_BASE_URL}/users/@me");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<User>(json);
        }

        /// <summary>
        /// Get a user by userId. userId can be a Croissant ID, Discord ID, Google ID or Steam ID.
        /// </summary>
        public async Task<User> GetUser(string userId)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/users/{userId}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<User>(json);
        }

        /// <summary>
        /// Search for users by username.
        /// </summary>
        public async Task<List<User>> Search(string query)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/users/search?q={Uri.EscapeDataString(query)}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<User>>(json);
        }

        /// <summary>
        /// Check the verification key for the user.
        /// </summary>
        public async Task<dynamic> Verify(string userId, string verificationKey)
        {
            var data = new { userId, verificationKey };
            var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
            var res = await api.http.PostAsync($"{CROISSANT_BASE_URL}/users/auth-verification", content);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        /// <summary>
        /// Transfer credits from one user to another.
        /// </summary>
        public async Task<dynamic> TransferCredits(string targetUserId, int amount)
        {
            var data = new { targetUserId, amount };
            var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/users/transfer-credits")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        /// <summary>
        /// Change username (authenticated user only).
        /// </summary>
        public async Task<dynamic> ChangeUsername(string username)
        {
            var data = new { username };
            var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/users/change-username")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        /// <summary>
        /// Change password (authenticated user only).
        /// </summary>
        public async Task<dynamic> ChangePassword(string oldPassword, string newPassword, string confirmPassword)
        {
            var data = new { oldPassword, newPassword, confirmPassword };
            var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/users/change-password")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }
    }
    public Users users => new Users(this);

    // --- GAMES ---
    public class Games
    {
        private readonly CroissantAPI api;
        public Games(CroissantAPI api) { this.api = api; }

        /// <summary>
        /// List all games visible in the store.
        /// </summary>
        public async Task<List<Game>> List()
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/games");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<Game>>(json);
        }

        /// <summary>
        /// Search for games by name, genre, or description.
        /// </summary>
        public async Task<List<Game>> Search(string query)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/games/search?q={Uri.EscapeDataString(query)}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<Game>>(json);
        }

        /// <summary>
        /// Get a game by gameId.
        /// </summary>
        public async Task<Game> Get(string gameId)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/games/{gameId}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Game>(json);
        }

        /// <summary>
        /// Get all games created by the authenticated user.
        /// </summary>
        public async Task<List<Game>> GetMyCreatedGames()
        {
            var req = new HttpRequestMessage(HttpMethod.Get, $"{CROISSANT_BASE_URL}/games/@mine");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<Game>>(json);
        }

        /// <summary>
        /// Get all games owned by the authenticated user.
        /// </summary>
        public async Task<List<Game>> GetMyOwnedGames()
        {
            var req = new HttpRequestMessage(HttpMethod.Get, $"{CROISSANT_BASE_URL}/games/list/@me");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<Game>>(json);
        }

        /// <summary>
        /// Create a new game.
        /// </summary>
        public async Task<dynamic> Create(object gameData)
        {
            var content = new StringContent(JsonConvert.SerializeObject(gameData), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/games")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        /// <summary>
        /// Update an existing game.
        /// </summary>
        public async Task<Game> Update(string gameId, object gameData)
        {
            var content = new StringContent(JsonConvert.SerializeObject(gameData), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Put, $"{CROISSANT_BASE_URL}/games/{gameId}")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Game>(json);
        }

        /// <summary>
        /// Buy a game.
        /// </summary>
        public async Task<dynamic> Buy(string gameId)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/games/{gameId}/buy");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }
    }
    public Games games => new Games(this);

    // --- ITEMS ---
    public class Items
    {
        private readonly CroissantAPI api;
        public Items(CroissantAPI api) { this.api = api; }

        /// <summary>
        /// Get all non-deleted items visible in store.
        /// </summary>
        public async Task<List<Item>> List()
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/items");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<Item>>(json);
        }

        /// <summary>
        /// Get all items owned by the authenticated user.
        /// </summary>
        public async Task<List<Item>> GetMyItems()
        {
            var req = new HttpRequestMessage(HttpMethod.Get, $"{CROISSANT_BASE_URL}/items/@mine");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<Item>>(json);
        }

        /// <summary>
        /// Search for items by name (only those visible in store).
        /// </summary>
        public async Task<List<Item>> Search(string query)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/items/search?q={Uri.EscapeDataString(query)}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<Item>>(json);
        }

        /// <summary>
        /// Get a single item by itemId.
        /// </summary>
        public async Task<Item> Get(string itemId)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/items/{itemId}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Item>(json);
        }

        /// <summary>
        /// Create a new item.
        /// </summary>
        public async Task<dynamic> Create(object itemData)
        {
            var content = new StringContent(JsonConvert.SerializeObject(itemData), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/items/create")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        /// <summary>
        /// Update an existing item.
        /// </summary>
        public async Task<dynamic> Update(string itemId, object itemData)
        {
            var content = new StringContent(JsonConvert.SerializeObject(itemData), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Put, $"{CROISSANT_BASE_URL}/items/update/{itemId}")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        /// <summary>
        /// Delete an item.
        /// </summary>
        public async Task<dynamic> Delete(string itemId)
        {
            var req = new HttpRequestMessage(HttpMethod.Delete, $"{CROISSANT_BASE_URL}/items/delete/{itemId}");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        /// <summary>
        /// Buy an item.
        /// </summary>
        public async Task<dynamic> Buy(string itemId, int amount)
        {
            var data = new { amount };
            var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/items/buy/{itemId}")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        /// <summary>
        /// Sell an item.
        /// </summary>
        public async Task<dynamic> Sell(string itemId, int amount)
        {
            var data = new { amount };
            var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/items/sell/{itemId}")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        /// <summary>
        /// Give item occurrences to a user (owner only).
        /// </summary>
        public async Task<dynamic> Give(string itemId, int amount)
        {
            var data = new { amount };
            var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/items/give/{itemId}")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        /// <summary>
        /// Consume item occurrences from a user (owner only).
        /// </summary>
        public async Task<dynamic> Consume(string itemId, int amount)
        {
            var data = new { amount };
            var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/items/consume/{itemId}")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        /// <summary>
        /// Drop item occurrences from your inventory.
        /// </summary>
        public async Task<dynamic> Drop(string itemId, int amount)
        {
            var data = new { amount };
            var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/items/drop/{itemId}")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }
    }
    public Items items => new Items(this);

    // --- INVENTORY ---
    public class Inventory
    {
        private readonly CroissantAPI api;
        public Inventory(CroissantAPI api) { this.api = api; }

        /// <summary>
        /// Get the inventory of the authenticated user.
        /// </summary>
        public async Task<List<InventoryItem>> GetMyInventory()
        {
            var req = new HttpRequestMessage(HttpMethod.Get, $"{CROISSANT_BASE_URL}/inventory/@me");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<InventoryItem>>(json);
        }

        /// <summary>
        /// Get the inventory of a user.
        /// </summary>
        public async Task<List<InventoryItem>> Get(string userId)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/inventory/{userId}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<InventoryItem>>(json);
        }
    }
    public Inventory inventory => new Inventory(this);

    // --- LOBBIES ---
    public class Lobbies
    {
        private readonly CroissantAPI api;
        public Lobbies(CroissantAPI api) { this.api = api; }

        public async Task<dynamic> Create()
        {
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/lobbies");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        public async Task<Lobby> Get(string lobbyId)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/lobbies/{lobbyId}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Lobby>(json);
        }

        public async Task<Lobby> GetMyLobby()
        {
            var req = new HttpRequestMessage(HttpMethod.Get, $"{CROISSANT_BASE_URL}/lobbies/@me");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Lobby>(json);
        }

        public async Task<Lobby> GetUserLobby(string userId)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/lobbies/user/{userId}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Lobby>(json);
        }

        public async Task<dynamic> Join(string lobbyId)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/lobbies/{lobbyId}/join");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        public async Task<dynamic> Leave(string lobbyId)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/lobbies/{lobbyId}/leave");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }
    }
    public Lobbies lobbies => new Lobbies(this);

    // --- STUDIOS ---
    public class Studios
    {
        private readonly CroissantAPI api;
        public Studios(CroissantAPI api) { this.api = api; }

        public async Task<dynamic> Create(string studioName)
        {
            var data = new { studioName };
            var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/studios/create")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        public async Task<Studio> Get(string studioId)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/studios/{studioId}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Studio>(json);
        }

        public async Task<List<Studio>> GetMyStudios()
        {
            var req = new HttpRequestMessage(HttpMethod.Get, $"{CROISSANT_BASE_URL}/studios/@me");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<Studio>>(json);
        }

        public async Task<dynamic> AddUser(string studioId, string userId)
        {
            var data = new { userId };
            var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/studios/{studioId}/add-user")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        public async Task<dynamic> RemoveUser(string studioId, string userId)
        {
            var data = new { userId };
            var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/studios/{studioId}/remove-user")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }
    }
    public Studios studios => new Studios(this);

    // --- TRADES ---
    public class Trades
    {
        private readonly CroissantAPI api;
        public Trades(CroissantAPI api) { this.api = api; }

        public async Task<Trade> StartOrGetPending(string userId)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/trades/start-or-get/{userId}");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Trade>(json);
        }

        public async Task<Trade> Get(string tradeId)
        {
            var req = new HttpRequestMessage(HttpMethod.Get, $"{CROISSANT_BASE_URL}/trades/{tradeId}");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Trade>(json);
        }

        public async Task<List<Trade>> GetMyTrades()
        {
            var req = new HttpRequestMessage(HttpMethod.Get, $"{CROISSANT_BASE_URL}/trades/@me");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<Trade>>(json);
        }

        public async Task<dynamic> AddItem(string tradeId, TradeItem tradeItem)
        {
            var content = new StringContent(JsonConvert.SerializeObject(tradeItem), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/trades/{tradeId}/add-item")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        public async Task<dynamic> RemoveItem(string tradeId, TradeItem tradeItem)
        {
            var content = new StringContent(JsonConvert.SerializeObject(tradeItem), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/trades/{tradeId}/remove-item")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        public async Task<dynamic> Approve(string tradeId)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/trades/{tradeId}/approve");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        public async Task<dynamic> Cancel(string tradeId)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/trades/{tradeId}/cancel");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }
    }
    public Trades trades => new Trades(this);

    // --- SEARCH ---
    public class Search
    {
        private readonly CroissantAPI api;
        public Search(CroissantAPI api) { this.api = api; }

        public async Task<SearchResult> Global(string query)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/search?q={Uri.EscapeDataString(query)}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<SearchResult>(json);
        }
    }
    public Search search => new Search(this);

    // --- OAUTH2 ---
    public class OAuth2
    {
        private readonly CroissantAPI api;
        public OAuth2(CroissantAPI api) { this.api = api; }

        /// <summary>
        /// Get an OAuth2 application by client_id.
        /// </summary>
        public async Task<OAuth2App> GetApp(string clientId)
        {
            var req = new HttpRequestMessage(HttpMethod.Get, $"{CROISSANT_BASE_URL}/oauth2/apps/{clientId}");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<OAuth2App>(json);
        }

        /// <summary>
        /// Create a new OAuth2 application.
        /// </summary>
        public async Task<dynamic> CreateApp(string name, List<string> redirectUrls)
        {
            var data = new { name, redirect_urls = redirectUrls };
            var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/oauth2/apps")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        /// <summary>
        /// Get all OAuth2 applications owned by the authenticated user.
        /// </summary>
        public async Task<List<OAuth2App>> GetMyApps()
        {
            var req = new HttpRequestMessage(HttpMethod.Get, $"{CROISSANT_BASE_URL}/oauth2/apps/@me");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<OAuth2App>>(json);
        }

        /// <summary>
        /// Update an OAuth2 application.
        /// </summary>
        public async Task<dynamic> UpdateApp(string clientId, object data)
        {
            var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Put, $"{CROISSANT_BASE_URL}/oauth2/apps/{clientId}")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        /// <summary>
        /// Delete an OAuth2 application.
        /// </summary>
        public async Task<dynamic> DeleteApp(string clientId)
        {
            var req = new HttpRequestMessage(HttpMethod.Delete, $"{CROISSANT_BASE_URL}/oauth2/apps/{clientId}");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        /// <summary>
        /// Authorize a user for an OAuth2 app (returns a code).
        /// </summary>
        public async Task<dynamic> Authorize(string clientId, string redirectUri)
        {
            var data = new { client_id = clientId, redirect_uri = redirectUri };
            var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/oauth2/authorize")
            {
                Content = content
            };
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        /// <summary>
        /// Get a user by OAuth2 code and client_id.
        /// </summary>
        public async Task<User> GetUserByCode(string code, string clientId)
        {
            var data = new { code, client_id = clientId };
            var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/oauth2/token")
            {
                Content = content
            };
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<User>(json);
        }
    }
    public OAuth2 oauth2 => new OAuth2(this);
}

// --- Models ---
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

public class InventoryItem
{
    public string itemId { get; set; }
    public string name { get; set; }
    public string description { get; set; }
    public int amount { get; set; }
    public string iconHash { get; set; }
}

public class Lobby
{
    public string lobbyId { get; set; }
    public List<LobbyUser> users { get; set; }
}

public class LobbyUser
{
    public string username { get; set; }
    public string user_id { get; set; }
    public bool verified { get; set; }
    public string steam_username { get; set; }
    public string steam_avatar_url { get; set; }
    public string steam_id { get; set; }
}

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

public class StudioUser
{
    public string user_id { get; set; }
    public string username { get; set; }
    public bool verified { get; set; }
    public bool admin { get; set; }
}

public class TradeItem
{
    public string itemId { get; set; }
    public int amount { get; set; }
}

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

public class TradeItemInfo
{
    public string itemId { get; set; }
    public string name { get; set; }
    public string description { get; set; }
    public string iconHash { get; set; }
    public int amount { get; set; }
}

public class SearchResult
{
    public List<User> users { get; set; }
    public List<Item> items { get; set; }
    public List<Game> games { get; set; }
}

public class OAuth2App
{
    public string clientId { get; set; }
    public string name { get; set; }
    public List<string> redirectUrls { get; set; }
    public string ownerId { get; set; }
    public string createdAt { get; set; }
    public string updatedAt { get; set; }
}
