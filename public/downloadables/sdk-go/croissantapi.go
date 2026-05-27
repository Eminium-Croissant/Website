package croissantapi

import (
    "bytes"
    "encoding/json"
    "errors"
    "fmt"
    "io"
    "net/http"
    "net/url"
)

const croissantBaseUrl = "https://croissant-api.eminium.ovh/api"

// --- Structures ---

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

type TradeItem struct {
    ItemId   string                 `json:"itemId"`
    Amount   int                    `json:"amount"`
    Metadata map[string]interface{} `json:"metadata,omitempty"`
}

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

type OAuth2App struct {
    ClientId     string   `json:"client_id"`
    ClientSecret string   `json:"client_secret"`
    Name         string   `json:"name"`
    RedirectUrls []string `json:"redirect_urls"`
}

// --- Client ---

type CroissantAPI struct {
    Token string
}

func NewCroissantAPI(token string) *CroissantAPI {
    return &CroissantAPI{Token: token}
}

// --- Helper ---

func (api *CroissantAPI) doRequest(method, url string, body interface{}, result interface{}) error {
    var reqBody io.Reader
    if body != nil {
        b, err := json.Marshal(body)
        if err != nil {
            return err
        }
        reqBody = bytes.NewBuffer(b)
    }
    req, err := http.NewRequest(method, url, reqBody)
    if err != nil {
        return err
    }
    if api.Token != "" {
        req.Header.Set("Authorization", "Bearer "+api.Token)
    }
    if body != nil {
        req.Header.Set("Content-Type", "application/json")
    }
    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    if resp.StatusCode < 200 || resp.StatusCode >= 300 {
        return errors.New("API request failed: " + resp.Status)
    }
    return json.NewDecoder(resp.Body).Decode(result)
}

// --- USERS ---

func (api *CroissantAPI) GetMe() (*User, error) {
    var user User
    err := api.doRequest("GET", croissantBaseUrl+"/users/@me", nil, &user)
    return &user, err
}

func (api *CroissantAPI) SearchUsers(query string) ([]User, error) {
    var users []User
    err := api.doRequest("GET", croissantBaseUrl+"/users/search?q="+url.QueryEscape(query), nil, &users)
    return users, err
}

func (api *CroissantAPI) GetUser(userId string) (*User, error) {
    var user User
    err := api.doRequest("GET", croissantBaseUrl+"/users/"+userId, nil, &user)
    return &user, err
}

func (api *CroissantAPI) TransferCredits(targetUserId string, amount float64) (map[string]string, error) {
    var res map[string]string
    body := map[string]interface{}{"targetUserId": targetUserId, "amount": amount}
    err := api.doRequest("POST", croissantBaseUrl+"/users/transfer-credits", body, &res)
    return res, err
}

func (api *CroissantAPI) VerifyUser(userId, verificationKey string) (map[string]bool, error) {
    var res map[string]bool
    body := map[string]interface{}{"userId": userId, "verificationKey": verificationKey}
    err := api.doRequest("POST", croissantBaseUrl+"/users/auth-verification", body, &res)
    return res, err
}

// --- GAMES ---

func (api *CroissantAPI) ListGames() ([]Game, error) {
    var games []Game
    err := api.doRequest("GET", croissantBaseUrl+"/games", nil, &games)
    return games, err
}

func (api *CroissantAPI) SearchGames(query string) ([]Game, error) {
    var games []Game
    err := api.doRequest("GET", croissantBaseUrl+"/games/search?q="+url.QueryEscape(query), nil, &games)
    return games, err
}

func (api *CroissantAPI) GetMyCreatedGames() ([]Game, error) {
    var games []Game
    err := api.doRequest("GET", croissantBaseUrl+"/games/@mine", nil, &games)
    return games, err
}

func (api *CroissantAPI) GetMyOwnedGames() ([]Game, error) {
    var games []Game
    err := api.doRequest("GET", croissantBaseUrl+"/games/list/@me", nil, &games)
    return games, err
}

func (api *CroissantAPI) GetGame(gameId string) (*Game, error) {
    var game Game
    err := api.doRequest("GET", croissantBaseUrl+"/games/"+gameId, nil, &game)
    return &game, err
}

// --- INVENTORY ---

func (api *CroissantAPI) GetMyInventory() (map[string]interface{}, error) {
    var inv map[string]interface{}
    err := api.doRequest("GET", croissantBaseUrl+"/inventory/@me", nil, &inv)
    return inv, err
}

func (api *CroissantAPI) GetInventory(userId string) (map[string]interface{}, error) {
    var inv map[string]interface{}
    err := api.doRequest("GET", croissantBaseUrl+"/inventory/"+userId, nil, &inv)
    return inv, err
}

// --- ITEMS ---

func (api *CroissantAPI) ListItems() ([]Item, error) {
    var items []Item
    err := api.doRequest("GET", croissantBaseUrl+"/items", nil, &items)
    return items, err
}

func (api *CroissantAPI) GetMyItems() ([]Item, error) {
    var items []Item
    err := api.doRequest("GET", croissantBaseUrl+"/items/@mine", nil, &items)
    return items, err
}

func (api *CroissantAPI) SearchItems(query string) ([]Item, error) {
    var items []Item
    err := api.doRequest("GET", croissantBaseUrl+"/items/search?q="+url.QueryEscape(query), nil, &items)
    return items, err
}

func (api *CroissantAPI) GetItem(itemId string) (*Item, error) {
    var item Item
    err := api.doRequest("GET", croissantBaseUrl+"/items/"+itemId, nil, &item)
    return &item, err
}

func (api *CroissantAPI) CreateItem(itemData map[string]interface{}) (map[string]string, error) {
    var res map[string]string
    err := api.doRequest("POST", croissantBaseUrl+"/items/create", itemData, &res)
    return res, err
}

func (api *CroissantAPI) UpdateItem(itemId string, itemData map[string]interface{}) (map[string]string, error) {
    var res map[string]string
    err := api.doRequest("PUT", croissantBaseUrl+"/items/update/"+itemId, itemData, &res)
    return res, err
}

func (api *CroissantAPI) DeleteItem(itemId string) (map[string]string, error) {
    var res map[string]string
    err := api.doRequest("DELETE", croissantBaseUrl+"/items/delete/"+itemId, nil, &res)
    return res, err
}

func (api *CroissantAPI) BuyItem(itemId string, amount int) (map[string]string, error) {
    var res map[string]string
    body := map[string]interface{}{"amount": amount}
    err := api.doRequest("POST", croissantBaseUrl+"/items/buy/"+itemId, body, &res)
    return res, err
}

func (api *CroissantAPI) SellItem(itemId string, amount int) (map[string]string, error) {
    var res map[string]string
    body := map[string]interface{}{"amount": amount}
    err := api.doRequest("POST", croissantBaseUrl+"/items/sell/"+itemId, body, &res)
    return res, err
}

func (api *CroissantAPI) GiveItem(itemId string, amount int, userId string, metadata map[string]interface{}) (map[string]string, error) {
    var res map[string]string
    body := map[string]interface{}{"amount": amount, "userId": userId, "metadata": metadata}
    err := api.doRequest("POST", croissantBaseUrl+"/items/give/"+itemId, body, &res)
    return res, err
}

func (api *CroissantAPI) ConsumeItem(itemId string, params map[string]interface{}) (map[string]string, error) {
    var res map[string]string
    err := api.doRequest("POST", croissantBaseUrl+"/items/consume/"+itemId, params, &res)
    return res, err
}

func (api *CroissantAPI) UpdateItemMetadata(itemId, uniqueId string, metadata map[string]interface{}) (map[string]string, error) {
    var res map[string]string
    body := map[string]interface{}{"uniqueId": uniqueId, "metadata": metadata}
    err := api.doRequest("PUT", croissantBaseUrl+"/items/update-metadata/"+itemId, body, &res)
    return res, err
}

func (api *CroissantAPI) DropItem(itemId string, params map[string]interface{}) (map[string]string, error) {
    var res map[string]string
    err := api.doRequest("POST", croissantBaseUrl+"/items/drop/"+itemId, params, &res)
    return res, err
}

// --- LOBBIES ---

func (api *CroissantAPI) CreateLobby() (map[string]string, error) {
    var res map[string]string
    err := api.doRequest("POST", croissantBaseUrl+"/lobbies", nil, &res)
    return res, err
}

func (api *CroissantAPI) GetLobby(lobbyId string) (*Lobby, error) {
    var lobby Lobby
    err := api.doRequest("GET", croissantBaseUrl+"/lobbies/"+lobbyId, nil, &lobby)
    return &lobby, err
}

func (api *CroissantAPI) GetMyLobby() (*Lobby, error) {
    var lobby Lobby
    err := api.doRequest("GET", croissantBaseUrl+"/lobbies/user/@me", nil, &lobby)
    return &lobby, err
}

func (api *CroissantAPI) GetUserLobby(userId string) (*Lobby, error) {
    var lobby Lobby
    err := api.doRequest("GET", croissantBaseUrl+"/lobbies/user/"+userId, nil, &lobby)
    return &lobby, err
}

func (api *CroissantAPI) JoinLobby(lobbyId string) (map[string]string, error) {
    var res map[string]string
    err := api.doRequest("POST", croissantBaseUrl+"/lobbies/"+lobbyId+"/join", nil, &res)
    return res, err
}

func (api *CroissantAPI) LeaveLobby(lobbyId string) (map[string]string, error) {
    var res map[string]string
    err := api.doRequest("POST", croissantBaseUrl+"/lobbies/"+lobbyId+"/leave", nil, &res)
    return res, err
}

// --- STUDIOS ---

func (api *CroissantAPI) CreateStudio(studioName string) (map[string]string, error) {
    var res map[string]string
    body := map[string]interface{}{"studioName": studioName}
    err := api.doRequest("POST", croissantBaseUrl+"/studios", body, &res)
    return res, err
}

func (api *CroissantAPI) GetStudio(studioId string) (*Studio, error) {
    var studio Studio
    err := api.doRequest("GET", croissantBaseUrl+"/studios/"+studioId, nil, &studio)
    return &studio, err
}

func (api *CroissantAPI) GetMyStudios() ([]Studio, error) {
    var studios []Studio
    err := api.doRequest("GET", croissantBaseUrl+"/studios/user/@me", nil, &studios)
    return studios, err
}

func (api *CroissantAPI) AddUserToStudio(studioId, userId string) (map[string]string, error) {
    var res map[string]string
    body := map[string]interface{}{"userId": userId}
    err := api.doRequest("POST", croissantBaseUrl+"/studios/"+studioId+"/add-user", body, &res)
    return res, err
}

func (api *CroissantAPI) RemoveUserFromStudio(studioId, userId string) (map[string]string, error) {
    var res map[string]string
    body := map[string]interface{}{"userId": userId}
    err := api.doRequest("POST", croissantBaseUrl+"/studios/"+studioId+"/remove-user", body, &res)
    return res, err
}

// --- TRADES ---

func (api *CroissantAPI) StartOrGetPendingTrade(userId string) (*Trade, error) {
    var trade Trade
    err := api.doRequest("POST", croissantBaseUrl+"/trades/start-or-latest/"+userId, nil, &trade)
    return &trade, err
}

func (api *CroissantAPI) GetTrade(tradeId string) (*Trade, error) {
    var trade Trade
    err := api.doRequest("GET", croissantBaseUrl+"/trades/"+tradeId, nil, &trade)
    return &trade, err
}

func (api *CroissantAPI) GetUserTrades(userId string) ([]Trade, error) {
    var trades []Trade
    err := api.doRequest("GET", croissantBaseUrl+"/trades/user/"+userId, nil, &trades)
    return trades, err
}

func (api *CroissantAPI) AddItemToTrade(tradeId string, tradeItem TradeItem) (map[string]string, error) {
    var res map[string]string
    body := map[string]interface{}{"tradeItem": tradeItem}
    err := api.doRequest("POST", croissantBaseUrl+"/trades/"+tradeId+"/add-item", body, &res)
    return res, err
}

func (api *CroissantAPI) RemoveItemFromTrade(tradeId string, tradeItem TradeItem) (map[string]string, error) {
    var res map[string]string
    body := map[string]interface{}{"tradeItem": tradeItem}
    err := api.doRequest("POST", croissantBaseUrl+"/trades/"+tradeId+"/remove-item", body, &res)
    return res, err
}

func (api *CroissantAPI) ApproveTrade(tradeId string) (map[string]string, error) {
    var res map[string]string
    err := api.doRequest("PUT", croissantBaseUrl+"/trades/"+tradeId+"/approve", nil, &res)
    return res, err
}

func (api *CroissantAPI) CancelTrade(tradeId string) (map[string]string, error) {
    var res map[string]string
    err := api.doRequest("PUT", croissantBaseUrl+"/trades/"+tradeId+"/cancel", nil, &res)
    return res, err
}

// --- OAUTH2 ---

func (api *CroissantAPI) GetOAuth2App(clientId string) (*OAuth2App, error) {
    var app OAuth2App
    err := api.doRequest("GET", croissantBaseUrl+"/oauth2/app/"+clientId, nil, &app)
    return &app, err
}

func (api *CroissantAPI) CreateOAuth2App(name string, redirectUrls []string) (map[string]string, error) {
    var res map[string]string
    body := map[string]interface{}{"name": name, "redirect_urls": redirectUrls}
    err := api.doRequest("POST", croissantBaseUrl+"/oauth2/app", body, &res)
    return res, err
}

func (api *CroissantAPI) GetMyOAuth2Apps() ([]OAuth2App, error) {
    var apps []OAuth2App
    err := api.doRequest("GET", croissantBaseUrl+"/oauth2/apps", nil, &apps)
    return apps, err
}

func (api *CroissantAPI) UpdateOAuth2App(clientId string, data map[string]interface{}) (map[string]bool, error) {
    var res map[string]bool
    err := api.doRequest("PATCH", croissantBaseUrl+"/oauth2/app/"+clientId, data, &res)
    return res, err
}

func (api *CroissantAPI) DeleteOAuth2App(clientId string) (map[string]string, error) {
    var res map[string]string
    err := api.doRequest("DELETE", croissantBaseUrl+"/oauth2/app/"+clientId, nil, &res)
    return res, err
}

func (api *CroissantAPI) AuthorizeOAuth2(clientId, redirectUri string) (map[string]string, error) {
    var res map[string]string
    url := fmt.Sprintf("%s/oauth2/authorize?client_id=%s&redirect_uri=%s", 
        croissantBaseUrl, url.QueryEscape(clientId), url.QueryEscape(redirectUri))
    err := api.doRequest("GET", url, nil, &res)
    return res, err
}

func (api *CroissantAPI) GetUserByOAuth2Code(code, clientId string) (*User, error) {
    var user User
    url := fmt.Sprintf("%s/oauth2/user?code=%s&client_id=%s", 
        croissantBaseUrl, url.QueryEscape(code), url.QueryEscape(clientId))
    err := api.doRequest("GET", url, nil, &user)
    return &user, err
}
