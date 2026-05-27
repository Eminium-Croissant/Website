use serde::{Deserialize, Serialize};
use reqwest::{Client, Error, header::HeaderMap, header::AUTHORIZATION, header::CONTENT_TYPE};
use std::collections::HashMap;

const CROISSANT_BASE_URL: &str = "https://croissant-api.eminium.ovh/api";

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
    #[serde(rename = "splashHash")]
    pub splash_hash: Option<String>,
    #[serde(rename = "bannerHash")]
    pub banner_hash: Option<String>,
    pub genre: Option<String>,
    pub release_date: Option<String>,
    pub developer: Option<String>,
    pub publisher: Option<String>,
    pub platforms: Option<Vec<String>>,
    pub rating: f64,
    pub website: Option<String>,
    pub trailer_link: Option<String>,
    pub multiplayer: bool,
    pub download_link: Option<String>,
}

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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StudioUser {
    pub user_id: String,
    pub username: String,
    pub verified: bool,
    pub admin: bool,
}

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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LobbyUser {
    pub username: String,
    pub user_id: String,
    pub verified: bool,
    pub steam_username: Option<String>,
    pub steam_avatar_url: Option<String>,
    pub steam_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Lobby {
    #[serde(rename = "lobbyId")]
    pub lobby_id: String,
    pub users: Vec<LobbyUser>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TradeItem {
    #[serde(rename = "itemId")]
    pub item_id: String,
    pub amount: i32,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TradeItemInfo {
    #[serde(rename = "itemId")]
    pub item_id: String,
    pub name: String,
    pub description: String,
    #[serde(rename = "iconHash")]
    pub icon_hash: String,
    pub amount: i32,
}

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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OAuth2App {
    pub client_id: String,
    pub client_secret: String,
    pub name: String,
    pub redirect_urls: Vec<String>,
}

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
    #[serde(rename = "verificationKey")]
    pub verification_key: Option<String>,
    pub steam_id: Option<String>,
    pub steam_username: Option<String>,
    pub steam_avatar_url: Option<String>,
    #[serde(rename = "isStudio")]
    pub is_studio: Option<bool>,
    pub admin: Option<bool>,
    pub disabled: Option<bool>,
    pub google_id: Option<String>,
    pub discord_id: Option<String>,
    pub balance: Option<f64>,
    #[serde(rename = "haveAuthenticator")]
    pub have_authenticator: Option<bool>,
}

pub struct CroissantApi {
    client: Client,
    token: Option<String>,
}

impl CroissantApi {
    pub fn new(token: Option<String>) -> Self {
        Self {
            client: Client::new(),
            token,
        }
    }

    fn get_headers(&self, auth: bool) -> HeaderMap {
        let mut headers = HeaderMap::new();
        headers.insert(CONTENT_TYPE, "application/json".parse().unwrap());
        if auth {
            if let Some(token) = &self.token {
                headers.insert(AUTHORIZATION, format!("Bearer {}", token).parse().unwrap());
            }
        }
        headers
    }
    // --- USERS ---
    pub async fn get_me(&self) -> Result<User, Error> {
        let url = format!("{}/users/@me", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<User>()
            .await?;
        Ok(res)
    }

    pub async fn search_users(&self, query: &str) -> Result<Vec<User>, Error> {
        let url = format!("{}/users/search?q={}", CROISSANT_BASE_URL, urlencoding::encode(query));
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Vec<User>>()
            .await?;
        Ok(res)
    }

    pub async fn get_user(&self, user_id: &str) -> Result<User, Error> {
        let url = format!("{}/users/{}", CROISSANT_BASE_URL, user_id);
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<User>()
            .await?;
        Ok(res)
    }

    pub async fn transfer_credits(&self, target_user_id: &str, amount: f64) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/users/transfer-credits", CROISSANT_BASE_URL);
        let body = serde_json::json!({"targetUserId": target_user_id, "amount": amount});
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn verify_user(&self, user_id: &str, verification_key: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/users/auth-verification", CROISSANT_BASE_URL);
        let body = serde_json::json!({"userId": user_id, "verificationKey": verification_key});
        let res = self.client
            .post(&url)
            .headers(self.get_headers(false))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    // --- GAMES ---
    pub async fn list_games(&self) -> Result<Vec<Game>, Error> {
        let url = format!("{}/games", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Vec<Game>>()
            .await?;
        Ok(res)
    }

    pub async fn search_games(&self, query: &str) -> Result<Vec<Game>, Error> {
        let url = format!("{}/games/search?q={}", CROISSANT_BASE_URL, urlencoding::encode(query));
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Vec<Game>>()
            .await?;
        Ok(res)
    }

    pub async fn get_my_created_games(&self) -> Result<Vec<Game>, Error> {
        let url = format!("{}/games/@mine", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<Vec<Game>>()
            .await?;
        Ok(res)
    }

    pub async fn get_my_owned_games(&self) -> Result<Vec<Game>, Error> {
        let url = format!("{}/games/list/@me", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<Vec<Game>>()
            .await?;
        Ok(res)
    }

    pub async fn get_game(&self, game_id: &str) -> Result<Game, Error> {
        let url = format!("{}/games/{}", CROISSANT_BASE_URL, game_id);
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Game>()
            .await?;
        Ok(res)
    }

    // --- INVENTORY ---
    pub async fn get_my_inventory(&self) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/inventory/@me", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn get_inventory(&self, user_id: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/inventory/{}", CROISSANT_BASE_URL, user_id);
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    // --- ITEMS ---
    pub async fn list_items(&self) -> Result<Vec<Item>, Error> {
        let url = format!("{}/items", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Vec<Item>>()
            .await?;
        Ok(res)
    }

    pub async fn get_my_items(&self) -> Result<Vec<Item>, Error> {
        let url = format!("{}/items/@mine", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<Vec<Item>>()
            .await?;
        Ok(res)
    }

    pub async fn search_items(&self, query: &str) -> Result<Vec<Item>, Error> {
        let url = format!("{}/items/search?q={}", CROISSANT_BASE_URL, urlencoding::encode(query));
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Vec<Item>>()
            .await?;
        Ok(res)
    }

    pub async fn get_item(&self, item_id: &str) -> Result<Item, Error> {
        let url = format!("{}/items/{}", CROISSANT_BASE_URL, item_id);
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Item>()
            .await?;
        Ok(res)
    }

    pub async fn create_item(&self, item_data: &serde_json::Value) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/items/create", CROISSANT_BASE_URL);
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(item_data)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn update_item(&self, item_id: &str, item_data: &serde_json::Value) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/items/update/{}", CROISSANT_BASE_URL, item_id);
        let res = self.client
            .put(&url)
            .headers(self.get_headers(true))
            .json(item_data)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn delete_item(&self, item_id: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/items/delete/{}", CROISSANT_BASE_URL, item_id);
        let res = self.client
            .delete(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn buy_item(&self, item_id: &str, amount: i32) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/items/buy/{}", CROISSANT_BASE_URL, item_id);
        let body = serde_json::json!({"amount": amount});
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn sell_item(&self, item_id: &str, amount: i32) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/items/sell/{}", CROISSANT_BASE_URL, item_id);
        let body = serde_json::json!({"amount": amount});
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn give_item(&self, item_id: &str, amount: i32, user_id: &str, metadata: Option<&serde_json::Value>) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/items/give/{}", CROISSANT_BASE_URL, item_id);
        let mut body = serde_json::json!({"amount": amount, "userId": user_id});
        if let Some(meta) = metadata {
            body["metadata"] = meta.clone();
        }
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn consume_item(&self, item_id: &str, params: &serde_json::Value) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/items/consume/{}", CROISSANT_BASE_URL, item_id);
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(params)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn update_item_metadata(&self, item_id: &str, unique_id: &str, metadata: &serde_json::Value) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/items/update-metadata/{}", CROISSANT_BASE_URL, item_id);
        let body = serde_json::json!({"uniqueId": unique_id, "metadata": metadata});
        let res = self.client
            .put(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn drop_item(&self, item_id: &str, params: &serde_json::Value) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/items/drop/{}", CROISSANT_BASE_URL, item_id);
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(params)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    // --- LOBBIES ---
    pub async fn create_lobby(&self) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/lobbies", CROISSANT_BASE_URL);
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn get_lobby(&self, lobby_id: &str) -> Result<Lobby, Error> {
        let url = format!("{}/lobbies/{}", CROISSANT_BASE_URL, lobby_id);
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Lobby>()
            .await?;
        Ok(res)
    }

    pub async fn get_my_lobby(&self) -> Result<Lobby, Error> {
        let url = format!("{}/lobbies/user/@me", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<Lobby>()
            .await?;
        Ok(res)
    }

    pub async fn get_user_lobby(&self, user_id: &str) -> Result<Lobby, Error> {
        let url = format!("{}/lobbies/user/{}", CROISSANT_BASE_URL, user_id);
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Lobby>()
            .await?;
        Ok(res)
    }

    pub async fn join_lobby(&self, lobby_id: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/lobbies/{}/join", CROISSANT_BASE_URL, lobby_id);
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn leave_lobby(&self, lobby_id: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/lobbies/{}/leave", CROISSANT_BASE_URL, lobby_id);
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    // --- STUDIOS ---
    pub async fn create_studio(&self, studio_name: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/studios", CROISSANT_BASE_URL);
        let body = serde_json::json!({"studioName": studio_name});
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn get_studio(&self, studio_id: &str) -> Result<Studio, Error> {
        let url = format!("{}/studios/{}", CROISSANT_BASE_URL, studio_id);
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Studio>()
            .await?;
        Ok(res)
    }

    pub async fn get_my_studios(&self) -> Result<Vec<Studio>, Error> {
        let url = format!("{}/studios/user/@me", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<Vec<Studio>>()
            .await?;
        Ok(res)
    }

    pub async fn add_user_to_studio(&self, studio_id: &str, user_id: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/studios/{}/add-user", CROISSANT_BASE_URL, studio_id);
        let body = serde_json::json!({"userId": user_id});
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn remove_user_from_studio(&self, studio_id: &str, user_id: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/studios/{}/remove-user", CROISSANT_BASE_URL, studio_id);
        let body = serde_json::json!({"userId": user_id});
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    // --- TRADES ---
    pub async fn start_or_get_pending_trade(&self, user_id: &str) -> Result<Trade, Error> {
        let url = format!("{}/trades/start-or-latest/{}", CROISSANT_BASE_URL, user_id);
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<Trade>()
            .await?;
        Ok(res)
    }

    pub async fn get_trade(&self, trade_id: &str) -> Result<Trade, Error> {
        let url = format!("{}/trades/{}", CROISSANT_BASE_URL, trade_id);
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<Trade>()
            .await?;
        Ok(res)
    }

    pub async fn get_user_trades(&self, user_id: &str) -> Result<Vec<Trade>, Error> {
        let url = format!("{}/trades/user/{}", CROISSANT_BASE_URL, user_id);
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<Vec<Trade>>()
            .await?;
        Ok(res)
    }

    pub async fn add_item_to_trade(&self, trade_id: &str, trade_item: &serde_json::Value) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/trades/{}/add-item", CROISSANT_BASE_URL, trade_id);
        let body = serde_json::json!({"tradeItem": trade_item});
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn remove_item_from_trade(&self, trade_id: &str, trade_item: &serde_json::Value) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/trades/{}/remove-item", CROISSANT_BASE_URL, trade_id);
        let body = serde_json::json!({"tradeItem": trade_item});
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn approve_trade(&self, trade_id: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/trades/{}/approve", CROISSANT_BASE_URL, trade_id);
        let res = self.client
            .put(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn cancel_trade(&self, trade_id: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/trades/{}/cancel", CROISSANT_BASE_URL, trade_id);
        let res = self.client
            .put(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    // --- OAUTH2 ---
    pub async fn get_oauth2_app(&self, client_id: &str) -> Result<OAuth2App, Error> {
        let url = format!("{}/oauth2/app/{}", CROISSANT_BASE_URL, client_id);
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<OAuth2App>()
            .await?;
        Ok(res)
    }

    pub async fn create_oauth2_app(&self, name: &str, redirect_urls: &[String]) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/oauth2/app", CROISSANT_BASE_URL);
        let body = serde_json::json!({"name": name, "redirect_urls": redirect_urls});
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn get_my_oauth2_apps(&self) -> Result<Vec<OAuth2App>, Error> {
        let url = format!("{}/oauth2/apps", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<Vec<OAuth2App>>()
            .await?;
        Ok(res)
    }

    pub async fn update_oauth2_app(&self, client_id: &str, data: &serde_json::Value) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/oauth2/app/{}", CROISSANT_BASE_URL, client_id);
        let res = self.client
            .patch(&url)
            .headers(self.get_headers(true))
            .json(data)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn delete_oauth2_app(&self, client_id: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/oauth2/app/{}", CROISSANT_BASE_URL, client_id);
        let res = self.client
            .delete(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn authorize(&self, client_id: &str, redirect_uri: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/oauth2/authorize?client_id={}&redirect_uri={}", CROISSANT_BASE_URL, client_id, urlencoding::encode(redirect_uri));
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    pub async fn get_user_by_code(&self, code: &str, client_id: &str) -> Result<User, Error> {
        let url = format!("{}/oauth2/user?code={}&client_id={}", CROISSANT_BASE_URL, urlencoding::encode(code), urlencoding::encode(client_id));
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<User>()
            .await?;
        Ok(res)
    }