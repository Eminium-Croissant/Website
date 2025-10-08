#include "croissant_api_new.hpp"
#include <stdexcept>
#include <sstream>
#include <algorithm>
#include <cctype>

using namespace CroissantAPI;

std::string Client::urlEncode(const std::string& str) const {
    std::ostringstream encoded;
    for (char c : str) {
        if (std::isalnum(c) || c == '-' || c == '_' || c == '.' || c == '~') {
            encoded << c;
        } else {
            encoded << '%' << std::hex << std::uppercase << static_cast<unsigned char>(c);
        }
    }
    return encoded.str();
}

APIResponse Client::makeRequest(const std::string& method, const std::string& endpoint, 
                               const json& body, bool requireAuth) const {
    if (requireAuth && token.empty()) {
        throw std::runtime_error("Token is required for this operation");
    }

    std::string url = base_url + endpoint;
    cpr::Header headers = {{"Content-Type", "application/json"}};
    
    if (!token.empty()) {
        headers["Authorization"] = "Bearer " + token;
    }

    cpr::Response response;
    
    if (method == "GET") {
        response = cpr::Get(cpr::Url{url}, headers);
    } else if (method == "POST") {
        response = cpr::Post(cpr::Url{url}, headers, cpr::Body{body.dump()});
    } else if (method == "PUT") {
        response = cpr::Put(cpr::Url{url}, headers, cpr::Body{body.dump()});
    } else if (method == "DELETE") {
        response = cpr::Delete(cpr::Url{url}, headers);
    } else if (method == "PATCH") {
        response = cpr::Patch(cpr::Url{url}, headers, cpr::Body{body.dump()});
    } else {
        return APIResponse(false, "Unsupported HTTP method");
    }

    bool success = response.status_code >= 200 && response.status_code < 300;
    std::string message = success ? "Success" : "Request failed";
    
    json responseData = json::object();
    if (!response.text.empty()) {
        try {
            responseData = json::parse(response.text);
            if (responseData.contains("message")) {
                message = responseData["message"];
            }
        } catch (const json::exception&) {
            message = response.text;
        }
    }

    return APIResponse(success, message, responseData);
}

LobbyUser::LobbyUser(const json& j) {
    username = j.value("username", "");
    user_id = j.value("user_id", "");
    verified = j.value("verified", false);
    
    steam_username = j.contains("steam_username") && !j["steam_username"].is_null() 
        ? std::optional<std::string>(j["steam_username"]) : std::nullopt;
    steam_avatar_url = j.contains("steam_avatar_url") && !j["steam_avatar_url"].is_null()
        ? std::optional<std::string>(j["steam_avatar_url"]) : std::nullopt;
    steam_id = j.contains("steam_id") && !j["steam_id"].is_null()
        ? std::optional<std::string>(j["steam_id"]) : std::nullopt;
}

json LobbyUser::to_json() const {
    json j = {
        {"username", username},
        {"user_id", user_id},
        {"verified", verified}
    };
    if (steam_username) j["steam_username"] = *steam_username;
    if (steam_avatar_url) j["steam_avatar_url"] = *steam_avatar_url;
    if (steam_id) j["steam_id"] = *steam_id;
    return j;
}

StudioUser::StudioUser(const json& j) {
    user_id = j.value("user_id", "");
    username = j.value("username", "");
    verified = j.value("verified", false);
    admin = j.value("admin", false);
}

json StudioUser::to_json() const {
    return {
        {"user_id", user_id},
        {"username", username},
        {"verified", verified},
        {"admin", admin}
    };
}

TradeItemDetail::TradeItemDetail(const json& j) {
    itemId = j.value("itemId", "");
    name = j.value("name", "");
    description = j.value("description", "");
    iconHash = j.value("iconHash", "");
    amount = j.value("amount", 0);
}

json TradeItemDetail::to_json() const {
    return {
        {"itemId", itemId},
        {"name", name},
        {"description", description},
        {"iconHash", iconHash},
        {"amount", amount}
    };
}

TradeItem::TradeItem(const json& j) {
    itemId = j.value("itemId", "");
    amount = j.value("amount", 0);
    
    if (j.contains("metadata") && !j["metadata"].is_null()) {
        std::unordered_map<std::string, json> meta;
        for (auto& [key, value] : j["metadata"].items()) {
            meta[key] = value;
        }
        metadata = meta;
    }
}

json TradeItem::to_json() const {
    json j = {
        {"itemId", itemId},
        {"amount", amount}
    };
    if (metadata) {
        json metaJson = json::object();
        for (const auto& [key, value] : *metadata) {
            metaJson[key] = value;
        }
        j["metadata"] = metaJson;
    }
    return j;
}

Game::Game(const json& j) {
    gameId = j.value("gameId", "");
    name = j.value("name", "");
    description = j.value("description", "");
    price = j.value("price", 0.0);
    owner_id = j.value("owner_id", "");
    showInStore = j.value("showInStore", false);
    rating = j.value("rating", 0.0);
    multiplayer = j.value("multiplayer", false);
    
    iconHash = j.contains("iconHash") && !j["iconHash"].is_null() 
        ? std::optional<std::string>(j["iconHash"]) : std::nullopt;
    splashHash = j.contains("splashHash") && !j["splashHash"].is_null()
        ? std::optional<std::string>(j["splashHash"]) : std::nullopt;
    bannerHash = j.contains("bannerHash") && !j["bannerHash"].is_null()
        ? std::optional<std::string>(j["bannerHash"]) : std::nullopt;
    genre = j.contains("genre") && !j["genre"].is_null()
        ? std::optional<std::string>(j["genre"]) : std::nullopt;
    release_date = j.contains("release_date") && !j["release_date"].is_null()
        ? std::optional<std::string>(j["release_date"]) : std::nullopt;
    developer = j.contains("developer") && !j["developer"].is_null()
        ? std::optional<std::string>(j["developer"]) : std::nullopt;
    publisher = j.contains("publisher") && !j["publisher"].is_null()
        ? std::optional<std::string>(j["publisher"]) : std::nullopt;
    website = j.contains("website") && !j["website"].is_null()
        ? std::optional<std::string>(j["website"]) : std::nullopt;
    trailer_link = j.contains("trailer_link") && !j["trailer_link"].is_null()
        ? std::optional<std::string>(j["trailer_link"]) : std::nullopt;
    download_link = j.contains("download_link") && !j["download_link"].is_null()
        ? std::optional<std::string>(j["download_link"]) : std::nullopt;
    
    if (j.contains("platforms") && j["platforms"].is_array()) {
        std::vector<std::string> plat;
        for (const auto& platform : j["platforms"]) {
            plat.push_back(platform);
        }
        platforms = plat;
    }
}

json Game::to_json() const {
    json j = {
        {"gameId", gameId},
        {"name", name},
        {"description", description},
        {"price", price},
        {"owner_id", owner_id},
        {"showInStore", showInStore},
        {"rating", rating},
        {"multiplayer", multiplayer}
    };
    
    if (iconHash) j["iconHash"] = *iconHash;
    if (splashHash) j["splashHash"] = *splashHash;
    if (bannerHash) j["bannerHash"] = *bannerHash;
    if (genre) j["genre"] = *genre;
    if (release_date) j["release_date"] = *release_date;
    if (developer) j["developer"] = *developer;
    if (publisher) j["publisher"] = *publisher;
    if (website) j["website"] = *website;
    if (trailer_link) j["trailer_link"] = *trailer_link;
    if (download_link) j["download_link"] = *download_link;
    if (platforms) j["platforms"] = *platforms;
    
    return j;
}

User::User(const json& j) {
    userId = j.value("userId", "");
    username = j.value("username", "");
    verified = j.value("verified", false);
    
    email = j.contains("email") && !j["email"].is_null()
        ? std::optional<std::string>(j["email"]) : std::nullopt;
    verificationKey = j.contains("verificationKey") && !j["verificationKey"].is_null()
        ? std::optional<std::string>(j["verificationKey"]) : std::nullopt;
    steam_id = j.contains("steam_id") && !j["steam_id"].is_null()
        ? std::optional<std::string>(j["steam_id"]) : std::nullopt;
    steam_username = j.contains("steam_username") && !j["steam_username"].is_null()
        ? std::optional<std::string>(j["steam_username"]) : std::nullopt;
    steam_avatar_url = j.contains("steam_avatar_url") && !j["steam_avatar_url"].is_null()
        ? std::optional<std::string>(j["steam_avatar_url"]) : std::nullopt;
    google_id = j.contains("google_id") && !j["google_id"].is_null()
        ? std::optional<std::string>(j["google_id"]) : std::nullopt;
    discord_id = j.contains("discord_id") && !j["discord_id"].is_null()
        ? std::optional<std::string>(j["discord_id"]) : std::nullopt;
    
    isStudio = j.contains("isStudio") ? std::optional<bool>(j["isStudio"]) : std::nullopt;
    admin = j.contains("admin") ? std::optional<bool>(j["admin"]) : std::nullopt;
    disabled = j.contains("disabled") ? std::optional<bool>(j["disabled"]) : std::nullopt;
    haveAuthenticator = j.contains("haveAuthenticator") ? std::optional<bool>(j["haveAuthenticator"]) : std::nullopt;
    balance = j.contains("balance") ? std::optional<double>(j["balance"]) : std::nullopt;
    
    
    
}

json User::to_json() const {
    json j = {
        {"userId", userId},
        {"username", username},
        {"verified", verified}
    };
    
    if (email) j["email"] = *email;
    if (verificationKey) j["verificationKey"] = *verificationKey;
    if (steam_id) j["steam_id"] = *steam_id;
    if (steam_username) j["steam_username"] = *steam_username;
    if (steam_avatar_url) j["steam_avatar_url"] = *steam_avatar_url;
    if (google_id) j["google_id"] = *google_id;
    if (discord_id) j["discord_id"] = *discord_id;
    if (isStudio) j["isStudio"] = *isStudio;
    if (admin) j["admin"] = *admin;
    if (disabled) j["disabled"] = *disabled;
    if (haveAuthenticator) j["haveAuthenticator"] = *haveAuthenticator;
    if (balance) j["balance"] = *balance;
    
    return j;
}

Item::Item(const json& j) {
    itemId = j.value("itemId", "");
    name = j.value("name", "");
    description = j.value("description", "");
    owner = j.value("owner", "");
    price = j.value("price", 0.0);
    iconHash = j.value("iconHash", "");
    
    showInStore = j.contains("showInStore") ? std::optional<bool>(j["showInStore"]) : std::nullopt;
    deleted = j.contains("deleted") ? std::optional<bool>(j["deleted"]) : std::nullopt;
}

json Item::to_json() const {
    json j = {
        {"itemId", itemId},
        {"name", name},
        {"description", description},
        {"owner", owner},
        {"price", price},
        {"iconHash", iconHash}
    };
    
    if (showInStore) j["showInStore"] = *showInStore;
    if (deleted) j["deleted"] = *deleted;
    
    return j;
}

InventoryItem::InventoryItem(const json& j) {
    amount = j.value("amount", 0);
    itemId = j.value("itemId", "");
    name = j.value("name", "");
    description = j.value("description", "");
    iconHash = j.value("iconHash", "");
    price = j.value("price", 0.0);
    owner = j.value("owner", "");
    showInStore = j.value("showInStore", false);
    
    user_id = j.contains("user_id") && !j["user_id"].is_null()
        ? std::optional<std::string>(j["user_id"]) : std::nullopt;
    item_id = j.contains("item_id") && !j["item_id"].is_null()
        ? std::optional<std::string>(j["item_id"]) : std::nullopt;
    
    if (j.contains("metadata") && !j["metadata"].is_null()) {
        std::unordered_map<std::string, json> meta;
        for (auto& [key, value] : j["metadata"].items()) {
            meta[key] = value;
        }
        metadata = meta;
    }
}

json InventoryItem::to_json() const {
    json j = {
        {"amount", amount},
        {"itemId", itemId},
        {"name", name},
        {"description", description},
        {"iconHash", iconHash},
        {"price", price},
        {"owner", owner},
        {"showInStore", showInStore}
    };
    
    if (user_id) j["user_id"] = *user_id;
    if (item_id) j["item_id"] = *item_id;
    if (metadata) {
        json metaJson = json::object();
        for (const auto& [key, value] : *metadata) {
            metaJson[key] = value;
        }
        j["metadata"] = metaJson;
    }
    
    return j;
}

Lobby::Lobby(const json& j) {
    lobbyId = j.value("lobbyId", "");
    users.clear();
    
    if (j.contains("users") && j["users"].is_array()) {
        for (const auto& userJson : j["users"]) {
            users.emplace_back(userJson);
        }
    }
}

json Lobby::to_json() const {
    json j = {
        {"lobbyId", lobbyId}
    };
    
    json usersArray = json::array();
    for (const auto& user : users) {
        usersArray.push_back(user.to_json());
    }
    j["users"] = usersArray;
    
    return j;
}

Studio::Studio(const json& j) {
    user_id = j.value("user_id", "");
    username = j.value("username", "");
    verified = j.value("verified", false);
    admin_id = j.value("admin_id", "");
    
    isAdmin = j.contains("isAdmin") ? std::optional<bool>(j["isAdmin"]) : std::nullopt;
    apiKey = j.contains("apiKey") && !j["apiKey"].is_null()
        ? std::optional<std::string>(j["apiKey"]) : std::nullopt;
    
    if (j.contains("users") && j["users"].is_array()) {
        std::vector<StudioUser> studioUsers;
        for (const auto& userJson : j["users"]) {
            studioUsers.emplace_back(userJson);
        }
        users = studioUsers;
    }
}

json Studio::to_json() const {
    json j = {
        {"user_id", user_id},
        {"username", username},
        {"verified", verified},
        {"admin_id", admin_id}
    };
    
    if (isAdmin) j["isAdmin"] = *isAdmin;
    if (apiKey) j["apiKey"] = *apiKey;
    if (users) {
        json usersArray = json::array();
        for (const auto& user : *users) {
            usersArray.push_back(user.to_json());
        }
        j["users"] = usersArray;
    }
    
    return j;
}

Trade::Trade(const json& j) {
    id = j.value("id", "");
    fromUserId = j.value("fromUserId", "");
    toUserId = j.value("toUserId", "");
    approvedFromUser = j.value("approvedFromUser", false);
    approvedToUser = j.value("approvedToUser", false);
    status = j.value("status", "");
    createdAt = j.value("createdAt", "");
    updatedAt = j.value("updatedAt", "");
    
    fromUserItems.clear();
    if (j.contains("fromUserItems") && j["fromUserItems"].is_array()) {
        for (const auto& itemJson : j["fromUserItems"]) {
            fromUserItems.emplace_back(itemJson);
        }
    }
    
    toUserItems.clear();
    if (j.contains("toUserItems") && j["toUserItems"].is_array()) {
        for (const auto& itemJson : j["toUserItems"]) {
            toUserItems.emplace_back(itemJson);
        }
    }
}

json Trade::to_json() const {
    json j = {
        {"id", id},
        {"fromUserId", fromUserId},
        {"toUserId", toUserId},
        {"approvedFromUser", approvedFromUser},
        {"approvedToUser", approvedToUser},
        {"status", status},
        {"createdAt", createdAt},
        {"updatedAt", updatedAt}
    };
    
    json fromItems = json::array();
    for (const auto& item : fromUserItems) {
        fromItems.push_back(item.to_json());
    }
    j["fromUserItems"] = fromItems;
    
    json toItems = json::array();
    for (const auto& item : toUserItems) {
        toItems.push_back(item.to_json());
    }
    j["toUserItems"] = toItems;
    
    return j;
}

OAuth2App::OAuth2App(const json& j) {
    client_id = j.value("client_id", "");
    client_secret = j.value("client_secret", "");
    name = j.value("name", "");
    
    redirect_urls.clear();
    if (j.contains("redirect_urls") && j["redirect_urls"].is_array()) {
        for (const auto& url : j["redirect_urls"]) {
            redirect_urls.push_back(url);
        }
    }
}

json OAuth2App::to_json() const {
    return {
        {"client_id", client_id},
        {"client_secret", client_secret},
        {"name", name},
        {"redirect_urls", redirect_urls}
    };
}

std::optional<User> Client::Users::getMe() const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    auto response = client.makeRequest("GET", "/users/@me", json::object(), true);
    if (response.success) {
        return User(response.data);
    }
    return std::nullopt;
}

std::vector<User> Client::Users::search(const std::string& query) const {
    std::string endpoint = "/users/search?q=" + client.urlEncode(query);
    auto response = client.makeRequest("GET", endpoint);
    
    std::vector<User> users;
    if (response.success && response.data.is_array()) {
        for (const auto& userJson : response.data) {
            users.emplace_back(userJson);
        }
    }
    return users;
}

std::optional<User> Client::Users::getUser(const std::string& userId) const {
    auto response = client.makeRequest("GET", "/users/" + userId);
    if (response.success) {
        return User(response.data);
    }
    return std::nullopt;
}

APIResponse Client::Users::transferCredits(const std::string& targetUserId, double amount) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    json body = {
        {"targetUserId", targetUserId},
        {"amount", amount}
    };
    
    return client.makeRequest("POST", "/users/transfer-credits", body, true);
}

APIResponse Client::Users::verify(const std::string& userId, const std::string& verificationKey) const {
    json body = {
        {"userId", userId},
        {"verificationKey", verificationKey}
    };
    
    return client.makeRequest("POST", "/users/auth-verification", body);
}

APIResponse Client::Users::changeUsername(const std::string& username) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    json body = {{"username", username}};
    return client.makeRequest("POST", "/users/change-username", body, true);
}

APIResponse Client::Users::changePassword(const std::string& oldPassword, 
                                         const std::string& newPassword, 
                                         const std::string& confirmPassword) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    json body = {
        {"oldPassword", oldPassword},
        {"newPassword", newPassword},
        {"confirmPassword", confirmPassword}
    };
    
    return client.makeRequest("POST", "/users/change-password", body, true);
}

std::vector<Game> Client::Games::list() const {
    auto response = client.makeRequest("GET", "/games");
    
    std::vector<Game> games;
    if (response.success && response.data.is_array()) {
        for (const auto& gameJson : response.data) {
            games.emplace_back(gameJson);
        }
    }
    return games;
}

std::vector<Game> Client::Games::search(const std::string& query) const {
    std::string endpoint = "/games/search?q=" + client.urlEncode(query);
    auto response = client.makeRequest("GET", endpoint);
    
    std::vector<Game> games;
    if (response.success && response.data.is_array()) {
        for (const auto& gameJson : response.data) {
            games.emplace_back(gameJson);
        }
    }
    return games;
}

std::vector<Game> Client::Games::getMyCreatedGames() const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    auto response = client.makeRequest("GET", "/games/@mine", json::object(), true);
    
    std::vector<Game> games;
    if (response.success && response.data.is_array()) {
        for (const auto& gameJson : response.data) {
            games.emplace_back(gameJson);
        }
    }
    return games;
}

std::vector<Game> Client::Games::getMyOwnedGames() const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    auto response = client.makeRequest("GET", "/games/list/@me", json::object(), true);
    
    std::vector<Game> games;
    if (response.success && response.data.is_array()) {
        for (const auto& gameJson : response.data) {
            games.emplace_back(gameJson);
        }
    }
    return games;
}

std::optional<Game> Client::Games::get(const std::string& gameId) const {
    auto response = client.makeRequest("GET", "/games/" + gameId);
    if (response.success) {
        return Game(response.data);
    }
    return std::nullopt;
}

std::optional<Game> Client::Games::create(const Game& game) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    auto response = client.makeRequest("POST", "/games", game.to_json(), true);
    if (response.success) {
        return Game(response.data);
    }
    return std::nullopt;
}

std::optional<Game> Client::Games::update(const std::string& gameId, const Game& game) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    auto response = client.makeRequest("PUT", "/games/" + gameId, game.to_json(), true);
    if (response.success) {
        return Game(response.data);
    }
    return std::nullopt;
}

APIResponse Client::Games::buy(const std::string& gameId) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    return client.makeRequest("POST", "/games/" + gameId + "/buy", json::object(), true);
}

std::pair<std::string, std::vector<InventoryItem>> Client::Inventory::getMyInventory() const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    auto response = client.makeRequest("GET", "/inventory/@me", json::object(), true);
    
    std::string userId;
    std::vector<InventoryItem> inventory;
    
    if (response.success) {
        userId = response.data.value("user_id", "");
        if (response.data.contains("inventory") && response.data["inventory"].is_array()) {
            for (const auto& itemJson : response.data["inventory"]) {
                inventory.emplace_back(itemJson);
            }
        }
    }
    
    return std::make_pair(userId, inventory);
}

std::pair<std::string, std::vector<InventoryItem>> Client::Inventory::get(const std::string& userId) const {
    auto response = client.makeRequest("GET", "/inventory/" + userId);
    
    std::string returnedUserId;
    std::vector<InventoryItem> inventory;
    
    if (response.success) {
        returnedUserId = response.data.value("user_id", "");
        if (response.data.contains("inventory") && response.data["inventory"].is_array()) {
            for (const auto& itemJson : response.data["inventory"]) {
                inventory.emplace_back(itemJson);
            }
        }
    }
    
    return std::make_pair(returnedUserId, inventory);
}

std::vector<Item> Client::Items::list() const {
    auto response = client.makeRequest("GET", "/items");
    
    std::vector<Item> items;
    if (response.success && response.data.is_array()) {
        for (const auto& itemJson : response.data) {
            items.emplace_back(itemJson);
        }
    }
    return items;
}

std::vector<Item> Client::Items::getMyItems() const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    auto response = client.makeRequest("GET", "/items/@mine", json::object(), true);
    
    std::vector<Item> items;
    if (response.success && response.data.is_array()) {
        for (const auto& itemJson : response.data) {
            items.emplace_back(itemJson);
        }
    }
    return items;
}

std::vector<Item> Client::Items::search(const std::string& query) const {
    std::string endpoint = "/items/search?q=" + client.urlEncode(query);
    auto response = client.makeRequest("GET", endpoint);
    
    std::vector<Item> items;
    if (response.success && response.data.is_array()) {
        for (const auto& itemJson : response.data) {
            items.emplace_back(itemJson);
        }
    }
    return items;
}

std::optional<Item> Client::Items::get(const std::string& itemId) const {
    auto response = client.makeRequest("GET", "/items/" + itemId);
    if (response.success) {
        return Item(response.data);
    }
    return std::nullopt;
}

APIResponse Client::Items::create(const std::string& name, const std::string& description, 
                                 double price, const std::string& iconHash, bool showInStore) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    json body = {
        {"name", name},
        {"description", description},
        {"price", price},
        {"showInStore", showInStore}
    };
    
    if (!iconHash.empty()) {
        body["iconHash"] = iconHash;
    }
    
    return client.makeRequest("POST", "/items/create", body, true);
}

APIResponse Client::Items::update(const std::string& itemId, const Item& item) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    return client.makeRequest("PUT", "/items/update/" + itemId, item.to_json(), true);
}

APIResponse Client::Items::deleteItem(const std::string& itemId) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    return client.makeRequest("DELETE", "/items/delete/" + itemId, json::object(), true);
}

APIResponse Client::Items::buy(const std::string& itemId, int amount) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    json body = {{"amount", amount}};
    return client.makeRequest("POST", "/items/buy/" + itemId, body, true);
}

APIResponse Client::Items::sell(const std::string& itemId, int amount) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    json body = {{"amount", amount}};
    return client.makeRequest("POST", "/items/sell/" + itemId, body, true);
}

APIResponse Client::Items::give(const std::string& itemId, int amount, const std::string& userId,
                               const std::optional<std::unordered_map<std::string, json>>& metadata) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    json body = {
        {"amount", amount},
        {"userId", userId}
    };
    
    if (metadata) {
        json metaJson = json::object();
        for (const auto& [key, value] : *metadata) {
            metaJson[key] = value;
        }
        body["metadata"] = metaJson;
    }
    
    return client.makeRequest("POST", "/items/give/" + itemId, body, true);
}

APIResponse Client::Items::consume(const std::string& itemId, const std::string& userId,
                                  const std::optional<int>& amount,
                                  const std::optional<std::string>& uniqueId) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    json body = {{"userId", userId}};
    
    if (amount) {
        body["amount"] = *amount;
    }
    if (uniqueId) {
        body["uniqueId"] = *uniqueId;
    }
    
    return client.makeRequest("POST", "/items/consume/" + itemId, body, true);
}

APIResponse Client::Items::updateMetadata(const std::string& itemId, const std::string& uniqueId,
                                         const std::unordered_map<std::string, json>& metadata) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    json metaJson = json::object();
    for (const auto& [key, value] : metadata) {
        metaJson[key] = value;
    }
    
    json body = {
        {"uniqueId", uniqueId},
        {"metadata", metaJson}
    };
    
    return client.makeRequest("PUT", "/items/update-metadata/" + itemId, body, true);
}

APIResponse Client::Items::drop(const std::string& itemId,
                               const std::optional<int>& amount,
                               const std::optional<std::string>& uniqueId) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    json body = json::object();
    
    if (amount) {
        body["amount"] = *amount;
    }
    if (uniqueId) {
        body["uniqueId"] = *uniqueId;
    }
    
    return client.makeRequest("POST", "/items/drop/" + itemId, body, true);
}

APIResponse Client::Lobbies::create() const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    return client.makeRequest("POST", "/lobbies", json::object(), true);
}

std::optional<Lobby> Client::Lobbies::get(const std::string& lobbyId) const {
    auto response = client.makeRequest("GET", "/lobbies/" + lobbyId);
    if (response.success) {
        return Lobby(response.data);
    }
    return std::nullopt;
}

std::optional<Lobby> Client::Lobbies::getMyLobby() const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    auto response = client.makeRequest("GET", "/lobbies/user/@me", json::object(), true);
    if (response.success) {
        return Lobby(response.data);
    }
    return std::nullopt;
}

std::optional<Lobby> Client::Lobbies::getUserLobby(const std::string& userId) const {
    auto response = client.makeRequest("GET", "/lobbies/user/" + userId);
    if (response.success) {
        return Lobby(response.data);
    }
    return std::nullopt;
}

APIResponse Client::Lobbies::join(const std::string& lobbyId) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    return client.makeRequest("POST", "/lobbies/" + lobbyId + "/join", json::object(), true);
}

APIResponse Client::Lobbies::leave(const std::string& lobbyId) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    return client.makeRequest("POST", "/lobbies/" + lobbyId + "/leave", json::object(), true);
}

APIResponse Client::Studios::create(const std::string& studioName) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    json body = {{"studioName", studioName}};
    return client.makeRequest("POST", "/studios", body, true);
}

std::optional<Studio> Client::Studios::get(const std::string& studioId) const {
    auto response = client.makeRequest("GET", "/studios/" + studioId);
    if (response.success) {
        return Studio(response.data);
    }
    return std::nullopt;
}

std::vector<Studio> Client::Studios::getMyStudios() const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    auto response = client.makeRequest("GET", "/studios/user/@me", json::object(), true);
    
    std::vector<Studio> studios;
    if (response.success && response.data.is_array()) {
        for (const auto& studioJson : response.data) {
            studios.emplace_back(studioJson);
        }
    }
    return studios;
}

APIResponse Client::Studios::addUser(const std::string& studioId, const std::string& userId) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    json body = {{"userId", userId}};
    return client.makeRequest("POST", "/studios/" + studioId + "/add-user", body, true);
}

APIResponse Client::Studios::removeUser(const std::string& studioId, const std::string& userId) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    json body = {{"userId", userId}};
    return client.makeRequest("POST", "/studios/" + studioId + "/remove-user", body, true);
}

std::optional<Trade> Client::Trades::startOrGetPending(const std::string& userId) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    auto response = client.makeRequest("POST", "/trades/start-or-latest/" + userId, json::object(), true);
    if (response.success) {
        return Trade(response.data);
    }
    return std::nullopt;
}

std::optional<Trade> Client::Trades::get(const std::string& tradeId) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    auto response = client.makeRequest("GET", "/trades/" + tradeId, json::object(), true);
    if (response.success) {
        return Trade(response.data);
    }
    return std::nullopt;
}

std::vector<Trade> Client::Trades::getUserTrades(const std::string& userId) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    auto response = client.makeRequest("GET", "/trades/user/" + userId, json::object(), true);
    
    std::vector<Trade> trades;
    if (response.success && response.data.is_array()) {
        for (const auto& tradeJson : response.data) {
            trades.emplace_back(tradeJson);
        }
    }
    return trades;
}

APIResponse Client::Trades::addItem(const std::string& tradeId, const TradeItem& tradeItem) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    json body = {{"tradeItem", tradeItem.to_json()}};
    return client.makeRequest("POST", "/trades/" + tradeId + "/add-item", body, true);
}

APIResponse Client::Trades::removeItem(const std::string& tradeId, const TradeItem& tradeItem) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    json body = {{"tradeItem", tradeItem.to_json()}};
    return client.makeRequest("POST", "/trades/" + tradeId + "/remove-item", body, true);
}

APIResponse Client::Trades::approve(const std::string& tradeId) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    return client.makeRequest("PUT", "/trades/" + tradeId + "/approve", json::object(), true);
}

APIResponse Client::Trades::cancel(const std::string& tradeId) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    return client.makeRequest("PUT", "/trades/" + tradeId + "/cancel", json::object(), true);
}

std::optional<OAuth2App> Client::OAuth2::getApp(const std::string& client_id) const {
    auto response = client.makeRequest("GET", "/oauth2/app/" + client_id);
    if (response.success) {
        return OAuth2App(response.data);
    }
    return std::nullopt;
}

std::optional<std::pair<std::string, std::string>> Client::OAuth2::createApp(
    const std::string& name, const std::vector<std::string>& redirect_urls) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    json body = {
        {"name", name},
        {"redirect_urls", redirect_urls}
    };
    
    auto response = client.makeRequest("POST", "/oauth2/app", body, true);
    if (response.success) {
        std::string client_id = response.data.value("client_id", "");
        std::string client_secret = response.data.value("client_secret", "");
        return std::make_pair(client_id, client_secret);
    }
    return std::nullopt;
}

std::vector<OAuth2App> Client::OAuth2::getMyApps() const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    auto response = client.makeRequest("GET", "/oauth2/apps", json::object(), true);
    
    std::vector<OAuth2App> apps;
    if (response.success && response.data.is_array()) {
        for (const auto& appJson : response.data) {
            apps.emplace_back(appJson);
        }
    }
    return apps;
}

APIResponse Client::OAuth2::updateApp(const std::string& client_id,
                                     const std::optional<std::string>& name,
                                     const std::optional<std::vector<std::string>>& redirect_urls) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    json body = json::object();
    if (name) {
        body["name"] = *name;
    }
    if (redirect_urls) {
        body["redirect_urls"] = *redirect_urls;
    }
    
    return client.makeRequest("PATCH", "/oauth2/app/" + client_id, body, true);
}

APIResponse Client::OAuth2::deleteApp(const std::string& client_id) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    return client.makeRequest("DELETE", "/oauth2/app/" + client_id, json::object(), true);
}

std::string Client::OAuth2::authorize(const std::string& client_id, const std::string& redirect_uri) const {
    if (client.token.empty()) {
        throw std::runtime_error("Token is required");
    }
    
    std::string endpoint = "/oauth2/authorize?client_id=" + client.urlEncode(client_id) + 
                          "&redirect_uri=" + client.urlEncode(redirect_uri);
    
    auto response = client.makeRequest("GET", endpoint, json::object(), true);
    if (response.success) {
        return response.data.value("code", "");
    }
    return "";
}

std::optional<User> Client::OAuth2::getUserByCode(const std::string& code, const std::string& client_id) const {
    std::string endpoint = "/oauth2/user?code=" + client.urlEncode(code) + 
                          "&client_id=" + client.urlEncode(client_id);
    
    auto response = client.makeRequest("GET", endpoint);
    if (response.success) {
        return User(response.data);
    }
    return std::nullopt;
}

json Client::globalSearch(const std::string& query) const {
    std::string endpoint = "/search?q=" + urlEncode(query);
    auto response = makeRequest("GET", endpoint);
    
    if (response.success) {
        return response.data;
    }
    return json::object();
}

