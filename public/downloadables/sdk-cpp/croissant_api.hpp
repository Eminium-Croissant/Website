#pragma once

#include <string>
#include <vector>
#include <optional>
#include <unordered_map>
#include <nlohmann/json.hpp>
#include <cpr/cpr.h>

using json = nlohmann::json;

namespace CroissantAPI {

// Forward declarations for response types
struct APIResponse {
    bool success;
    std::string message;
    json data;
    
    APIResponse(bool success = false, const std::string& message = "", const json& data = json::object())
        : success(success), message(message), data(data) {}
};

// Struct definitions based on TypeScript interfaces

struct LobbyUser {
    std::string username;
    std::string user_id;
    bool verified;
    std::optional<std::string> steam_username;
    std::optional<std::string> steam_avatar_url;
    std::optional<std::string> steam_id;

    LobbyUser() = default;
    LobbyUser(const json& j);
    json to_json() const;
};

struct StudioUser {
    std::string user_id;
    std::string username;
    bool verified;
    bool admin;

    StudioUser() = default;
    StudioUser(const json& j);
    json to_json() const;
};

struct TradeItemDetail {
    std::string itemId;
    std::string name;
    std::string description;
    std::string iconHash;
    int amount;

    TradeItemDetail() = default;
    TradeItemDetail(const json& j);
    json to_json() const;
};

struct TradeItem {
    std::string itemId;
    int amount;
    std::optional<std::unordered_map<std::string, json>> metadata;

    TradeItem() = default;
    TradeItem(const json& j);
    json to_json() const;
};

struct Game {
    std::string gameId;
    std::string name;
    std::string description;
    double price;
    std::string owner_id;
    bool showInStore;
    std::optional<std::string> iconHash;
    std::optional<std::string> splashHash;
    std::optional<std::string> bannerHash;
    std::optional<std::string> genre;
    std::optional<std::string> release_date;
    std::optional<std::string> developer;
    std::optional<std::string> publisher;
    std::optional<std::vector<std::string>> platforms;
    double rating;
    std::optional<std::string> website;
    std::optional<std::string> trailer_link;
    bool multiplayer;
    std::optional<std::string> download_link;

    Game() = default;
    Game(const json& j);
    json to_json() const;
};

struct User {
    std::string userId;
    std::string username;
    std::optional<std::string> email;
    bool verified;
    std::optional<std::vector<struct Studio>> studios;
    std::optional<std::vector<std::string>> roles;
    std::optional<std::vector<struct InventoryItem>> inventory;
    std::optional<std::vector<struct Item>> ownedItems;
    std::optional<std::vector<Game>> createdGames;
    std::optional<std::string> verificationKey;
    std::optional<std::string> steam_id;
    std::optional<std::string> steam_username;
    std::optional<std::string> steam_avatar_url;
    std::optional<bool> isStudio;
    std::optional<bool> admin;
    std::optional<bool> disabled;
    std::optional<std::string> google_id;
    std::optional<std::string> discord_id;
    std::optional<double> balance;
    std::optional<bool> haveAuthenticator;

    User() = default;
    User(const json& j);
    json to_json() const;
};

struct Item {
    std::string itemId;
    std::string name;
    std::string description;
    std::string owner;
    double price;
    std::string iconHash;
    std::optional<bool> showInStore;
    std::optional<bool> deleted;

    Item() = default;
    Item(const json& j);
    json to_json() const;
};

struct InventoryItem {
    std::optional<std::string> user_id;
    std::optional<std::string> item_id;
    int amount;
    std::optional<std::unordered_map<std::string, json>> metadata;
    std::string itemId;
    std::string name;
    std::string description;
    std::string iconHash;
    double price;
    std::string owner;
    bool showInStore;

    InventoryItem() = default;
    InventoryItem(const json& j);
    json to_json() const;
};

struct Lobby {
    std::string lobbyId;
    std::vector<LobbyUser> users;

    Lobby() = default;
    Lobby(const json& j);
    json to_json() const;
};

struct Studio {
    std::string user_id;
    std::string username;
    bool verified;
    std::string admin_id;
    std::optional<bool> isAdmin;
    std::optional<std::string> apiKey;
    std::optional<std::vector<StudioUser>> users;

    Studio() = default;
    Studio(const json& j);
    json to_json() const;
};

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

    Trade() = default;
    Trade(const json& j);
    json to_json() const;
};

struct OAuth2App {
    std::string client_id;
    std::string client_secret;
    std::string name;
    std::vector<std::string> redirect_urls;

    OAuth2App() = default;
    OAuth2App(const json& j);
    json to_json() const;
};

// Main API client class
class Client {
private:
    std::string token;
    const std::string base_url = "https://croissant-api.eminium.ovh/api";
    
    // Internal helper methods
    APIResponse makeRequest(const std::string& method, const std::string& endpoint, 
                           const json& body = json::object(), bool requireAuth = false) const;
    std::string urlEncode(const std::string& str) const;

public:
    // Constructor
    explicit Client(const std::string& token = "") : token(token) {}
    
    // Token management
    void setToken(const std::string& newToken) { token = newToken; }
    std::string getToken() const { return token; }

    // --- USERS NAMESPACE ---
    struct Users {
        const Client& client;
        explicit Users(const Client& c) : client(c) {}

        /**
         * Get the authenticated user's profile.
         * @returns The current user object or nullopt if failed.
         * @throws std::runtime_error if no token is set.
         */
        std::optional<User> getMe() const;

        /**
         * Search users by username or other criteria.
         * @param query The search string.
         * @returns Vector of matching users.
         */
        std::vector<User> search(const std::string& query) const;

        /**
         * Get a user by their userId.
         * @param userId The user's ID.
         * @returns The user object or nullopt if not found.
         */
        std::optional<User> getUser(const std::string& userId) const;

        /**
         * Transfer credits to another user.
         * @param targetUserId The recipient's user ID.
         * @param amount The amount to transfer.
         * @returns APIResponse with message about the transfer.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse transferCredits(const std::string& targetUserId, double amount) const;

        /**
         * Verify a user with a verification key.
         * @param userId The user ID to verify.
         * @param verificationKey The verification key.
         * @returns APIResponse with success status.
         */
        APIResponse verify(const std::string& userId, const std::string& verificationKey) const;

        /**
         * Change username of authenticated user.
         * @param username The new username.
         * @returns APIResponse with result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse changeUsername(const std::string& username) const;

        /**
         * Change password of authenticated user.
         * @param oldPassword Current password.
         * @param newPassword New password.
         * @param confirmPassword Confirmation of new password.
         * @returns APIResponse with result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse changePassword(const std::string& oldPassword, 
                                 const std::string& newPassword, 
                                 const std::string& confirmPassword) const;
    } users;

    // --- GAMES NAMESPACE ---
    struct Games {
        const Client& client;
        explicit Games(const Client& c) : client(c) {}

        /**
         * List all games visible in the store.
         * @returns Vector of games.
         */
        std::vector<Game> list() const;

        /**
         * Search for games by name, genre, or description.
         * @param query The search string.
         * @returns Vector of matching games.
         */
        std::vector<Game> search(const std::string& query) const;

        /**
         * Get all games created by the authenticated user.
         * @returns Vector of games created by the user.
         * @throws std::runtime_error if not authenticated.
         */
        std::vector<Game> getMyCreatedGames() const;

        /**
         * Get all games owned by the authenticated user.
         * @returns Vector of games owned by the user.
         * @throws std::runtime_error if not authenticated.
         */
        std::vector<Game> getMyOwnedGames() const;

        /**
         * Get a game by its ID.
         * @param gameId The game ID.
         * @returns The game object or nullopt if not found.
         */
        std::optional<Game> get(const std::string& gameId) const;

        /**
         * Create a new game.
         * @param game The game data to create.
         * @returns The created game or nullopt if failed.
         * @throws std::runtime_error if not authenticated.
         */
        std::optional<Game> create(const Game& game) const;

        /**
         * Update an existing game.
         * @param gameId The game ID to update.
         * @param game The updated game data.
         * @returns The updated game or nullopt if failed.
         * @throws std::runtime_error if not authenticated.
         */
        std::optional<Game> update(const std::string& gameId, const Game& game) const;

        /**
         * Buy a game by its ID.
         * @param gameId The game ID to buy.
         * @returns APIResponse with purchase result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse buy(const std::string& gameId) const;
    } games;

    // --- INVENTORY NAMESPACE ---
    struct Inventory {
        const Client& client;
        explicit Inventory(const Client& c) : client(c) {}

        /**
         * Get the inventory of the authenticated user.
         * @returns Pair of user_id and inventory items.
         * @throws std::runtime_error if not authenticated.
         */
        std::pair<std::string, std::vector<InventoryItem>> getMyInventory() const;

        /**
         * Get the inventory of a user by userId.
         * @param userId The user ID.
         * @returns Pair of user_id and inventory items.
         */
        std::pair<std::string, std::vector<InventoryItem>> get(const std::string& userId) const;
    } inventory;

    // --- ITEMS NAMESPACE ---
    struct Items {
        const Client& client;
        explicit Items(const Client& c) : client(c) {}

        /**
         * List all non-deleted items visible in the store.
         * @returns Vector of items.
         */
        std::vector<Item> list() const;

        /**
         * Get all items owned by the authenticated user.
         * @returns Vector of items owned by the user.
         * @throws std::runtime_error if not authenticated.
         */
        std::vector<Item> getMyItems() const;

        /**
         * Search for items by name (only those visible in store).
         * @param query The search string.
         * @returns Vector of matching items.
         */
        std::vector<Item> search(const std::string& query) const;

        /**
         * Get a single item by itemId.
         * @param itemId The item ID.
         * @returns The item object or nullopt if not found.
         */
        std::optional<Item> get(const std::string& itemId) const;

        /**
         * Create a new item.
         * @param name Item name.
         * @param description Item description.
         * @param price Item price.
         * @param iconHash Optional icon hash.
         * @param showInStore Whether to show in store.
         * @returns APIResponse with creation result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse create(const std::string& name, const std::string& description, 
                          double price, const std::string& iconHash = "", 
                          bool showInStore = true) const;

        /**
         * Update an existing item.
         * @param itemId The item ID.
         * @param item The updated item data.
         * @returns APIResponse with update result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse update(const std::string& itemId, const Item& item) const;

        /**
         * Delete an item by its ID.
         * @param itemId The item ID.
         * @returns APIResponse with deletion result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse deleteItem(const std::string& itemId) const;

        /**
         * Buy an item by its ID.
         * @param itemId The item ID.
         * @param amount The amount to buy.
         * @returns APIResponse with purchase result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse buy(const std::string& itemId, int amount) const;

        /**
         * Sell an item by its ID.
         * @param itemId The item ID.
         * @param amount The amount to sell.
         * @returns APIResponse with sale result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse sell(const std::string& itemId, int amount) const;

        /**
         * Give an item to a user.
         * @param itemId The item ID.
         * @param amount The amount to give.
         * @param userId The recipient's user ID.
         * @param metadata Optional metadata for the item instance.
         * @returns APIResponse with operation result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse give(const std::string& itemId, int amount, const std::string& userId,
                        const std::optional<std::unordered_map<std::string, json>>& metadata = std::nullopt) const;

        /**
         * Consume an item instance.
         * @param itemId The item ID.
         * @param userId The user ID.
         * @param amount Optional amount (if not specified, uniqueId must be provided).
         * @param uniqueId Optional unique instance ID.
         * @returns APIResponse with operation result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse consume(const std::string& itemId, const std::string& userId,
                           const std::optional<int>& amount = std::nullopt,
                           const std::optional<std::string>& uniqueId = std::nullopt) const;

        /**
         * Update metadata for an item instance.
         * @param itemId The item ID.
         * @param uniqueId The unique instance ID.
         * @param metadata The new metadata.
         * @returns APIResponse with update result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse updateMetadata(const std::string& itemId, const std::string& uniqueId,
                                  const std::unordered_map<std::string, json>& metadata) const;

        /**
         * Drop an item instance from the user's inventory.
         * @param itemId The item ID.
         * @param amount Optional amount (if not specified, uniqueId must be provided).
         * @param uniqueId Optional unique instance ID.
         * @returns APIResponse with operation result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse drop(const std::string& itemId,
                        const std::optional<int>& amount = std::nullopt,
                        const std::optional<std::string>& uniqueId = std::nullopt) const;
    } items;

    // --- LOBBIES NAMESPACE ---
    struct Lobbies {
        const Client& client;
        explicit Lobbies(const Client& c) : client(c) {}

        /**
         * Create a new lobby for the authenticated user.
         * @returns APIResponse with creation result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse create() const;

        /**
         * Get a lobby by its ID.
         * @param lobbyId The lobby ID.
         * @returns The lobby object or nullopt if not found.
         */
        std::optional<Lobby> get(const std::string& lobbyId) const;

        /**
         * Get the lobby the authenticated user is in.
         * @returns The lobby object or nullopt if not in a lobby.
         * @throws std::runtime_error if not authenticated.
         */
        std::optional<Lobby> getMyLobby() const;

        /**
         * Get the lobby a user is in by userId.
         * @param userId The user ID.
         * @returns The lobby object or nullopt if user not in a lobby.
         */
        std::optional<Lobby> getUserLobby(const std::string& userId) const;

        /**
         * Join a lobby by its ID.
         * @param lobbyId The lobby ID.
         * @returns APIResponse with join result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse join(const std::string& lobbyId) const;

        /**
         * Leave a lobby by its ID.
         * @param lobbyId The lobby ID.
         * @returns APIResponse with leave result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse leave(const std::string& lobbyId) const;
    } lobbies;

    // --- STUDIOS NAMESPACE ---
    struct Studios {
        const Client& client;
        explicit Studios(const Client& c) : client(c) {}

        /**
         * Create a new studio.
         * @param studioName The name of the studio.
         * @returns APIResponse with creation result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse create(const std::string& studioName) const;

        /**
         * Get a studio by its ID.
         * @param studioId The studio ID.
         * @returns The studio object or nullopt if not found.
         */
        std::optional<Studio> get(const std::string& studioId) const;

        /**
         * Get all studios the authenticated user is a member of.
         * @returns Vector of studios.
         * @throws std::runtime_error if not authenticated.
         */
        std::vector<Studio> getMyStudios() const;

        /**
         * Add a user to a studio.
         * @param studioId The studio ID.
         * @param userId The user ID to add.
         * @returns APIResponse with operation result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse addUser(const std::string& studioId, const std::string& userId) const;

        /**
         * Remove a user from a studio.
         * @param studioId The studio ID.
         * @param userId The user ID to remove.
         * @returns APIResponse with operation result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse removeUser(const std::string& studioId, const std::string& userId) const;
    } studios;

    // --- TRADES NAMESPACE ---
    struct Trades {
        const Client& client;
        explicit Trades(const Client& c) : client(c) {}

        /**
         * Start a new trade or get the latest pending trade with a user.
         * @param userId The user ID to trade with.
         * @returns The trade object or nullopt if failed.
         * @throws std::runtime_error if not authenticated.
         */
        std::optional<Trade> startOrGetPending(const std::string& userId) const;

        /**
         * Get a trade by its ID.
         * @param tradeId The trade ID.
         * @returns The trade object or nullopt if not found.
         * @throws std::runtime_error if not authenticated.
         */
        std::optional<Trade> get(const std::string& tradeId) const;

        /**
         * Get all trades for a user.
         * @param userId The user ID.
         * @returns Vector of trades.
         * @throws std::runtime_error if not authenticated.
         */
        std::vector<Trade> getUserTrades(const std::string& userId) const;

        /**
         * Add an item to a trade.
         * @param tradeId The trade ID.
         * @param tradeItem The item to add.
         * @returns APIResponse with operation result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse addItem(const std::string& tradeId, const TradeItem& tradeItem) const;

        /**
         * Remove an item from a trade.
         * @param tradeId The trade ID.
         * @param tradeItem The item to remove.
         * @returns APIResponse with operation result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse removeItem(const std::string& tradeId, const TradeItem& tradeItem) const;

        /**
         * Approve a trade.
         * @param tradeId The trade ID.
         * @returns APIResponse with operation result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse approve(const std::string& tradeId) const;

        /**
         * Cancel a trade.
         * @param tradeId The trade ID.
         * @returns APIResponse with operation result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse cancel(const std::string& tradeId) const;
    } trades;

    // --- OAUTH2 NAMESPACE ---
    struct OAuth2 {
        const Client& client;
        explicit OAuth2(const Client& c) : client(c) {}

        /**
         * Get an OAuth2 app by its client ID.
         * @param client_id The client ID.
         * @returns The OAuth2 app object or nullopt if not found.
         */
        std::optional<OAuth2App> getApp(const std::string& client_id) const;

        /**
         * Create a new OAuth2 app.
         * @param name The app name.
         * @param redirect_urls The allowed redirect URLs.
         * @returns Pair of client_id and client_secret or nullopt if failed.
         * @throws std::runtime_error if not authenticated.
         */
        std::optional<std::pair<std::string, std::string>> createApp(const std::string& name, 
                                                                    const std::vector<std::string>& redirect_urls) const;

        /**
         * Get all OAuth2 apps owned by the authenticated user.
         * @returns Vector of OAuth2 apps.
         * @throws std::runtime_error if not authenticated.
         */
        std::vector<OAuth2App> getMyApps() const;

        /**
         * Update an OAuth2 app.
         * @param client_id The client ID.
         * @param name Optional new name.
         * @param redirect_urls Optional new redirect URLs.
         * @returns APIResponse with update result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse updateApp(const std::string& client_id,
                             const std::optional<std::string>& name = std::nullopt,
                             const std::optional<std::vector<std::string>>& redirect_urls = std::nullopt) const;

        /**
         * Delete an OAuth2 app by its client ID.
         * @param client_id The client ID.
         * @returns APIResponse with deletion result.
         * @throws std::runtime_error if not authenticated.
         */
        APIResponse deleteApp(const std::string& client_id) const;

        /**
         * Authorize a user for an OAuth2 app.
         * @param client_id The client ID.
         * @param redirect_uri The redirect URI.
         * @returns The authorization code or empty string if failed.
         * @throws std::runtime_error if not authenticated.
         */
        std::string authorize(const std::string& client_id, const std::string& redirect_uri) const;

        /**
         * Get a user by OAuth2 code and client ID.
         * @param code The authorization code.
         * @param client_id The client ID.
         * @returns The user object or nullopt if failed.
         */
        std::optional<User> getUserByCode(const std::string& code, const std::string& client_id) const;
    } oauth2;

    // Constructor initializes all namespaces
    Client(const std::string& token = "") 
        : token(token), users(*this), games(*this), inventory(*this), items(*this), 
          lobbies(*this), studios(*this), trades(*this), oauth2(*this) {}

    // --- GLOBAL SEARCH ---
    /**
     * Perform a global search across all content types.
     * @param query The search string.
     * @returns JSON object with search results.
     */
    json globalSearch(const std::string& query) const;
};

} // namespace CroissantAPI
