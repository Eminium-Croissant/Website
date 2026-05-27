require 'net/http'
require 'json'
require 'uri'

CROISSANT_BASE_URL = 'https://croissant-api.eminium.ovh/api'

# Game represents a game in the Croissant API
class Game
  attr_accessor :game_id, :name, :description, :owner_id, :download_link, :price, :show_in_store,
                :icon_hash, :splash_hash, :banner_hash, :genre, :release_date, :developer,
                :publisher, :platforms, :rating, :website, :trailer_link, :multiplayer

  def initialize(attrs = {})
    attrs.each { |k, v| send("#{k}=", v) if respond_to?("#{k}=") }
  end
end

# User represents a user in the Croissant API
class User
  attr_accessor :user_id, :username, :email, :balance, :verified, :steam_id, :steam_username,
                :steam_avatar_url, :is_studio, :admin, :disabled, :google_id, :discord_id,
                :studios, :roles, :inventory, :owned_items, :created_games, :have_authenticator,
                :verification_key

  def initialize(attrs = {})
    attrs.each { |k, v| send("#{k}=", v) if respond_to?("#{k}=") }
  end
end

# Item represents an item in the Croissant API
class Item
  attr_accessor :item_id, :name, :description, :price, :owner, :show_in_store, :icon_hash, :deleted

  def initialize(attrs = {})
    attrs.each { |k, v| send("#{k}=", v) if respond_to?("#{k}=") }
  end
end

# InventoryItem represents an item in a user's inventory
class InventoryItem
  attr_accessor :item_id, :name, :description, :amount, :icon_hash

  def initialize(attrs = {})
    attrs.each { |k, v| send("#{k}=", v) if respond_to?("#{k}=") }
  end
end

# LobbyUser represents a user in a lobby
class LobbyUser
  attr_accessor :username, :user_id, :verified, :steam_username, :steam_avatar_url, :steam_id

  def initialize(attrs = {})
    attrs.each { |k, v| send("#{k}=", v) if respond_to?("#{k}=") }
  end
end

# Lobby represents a lobby
class Lobby
  attr_accessor :lobby_id, :users

  def initialize(attrs = {})
    @lobby_id = attrs['lobby_id']
    @users = (attrs['users'] || []).map { |u| LobbyUser.new(u) }
  end
end

# StudioUser represents a user in a studio
class StudioUser
  attr_accessor :user_id, :username, :verified, :admin

  def initialize(attrs = {})
    attrs.each { |k, v| send("#{k}=", v) if respond_to?("#{k}=") }
  end
end

# Studio represents a studio
class Studio
  attr_accessor :user_id, :username, :verified, :admin_id, :is_admin, :api_key, :users

  def initialize(attrs = {})
    @user_id = attrs['user_id']
    @username = attrs['username']
    @verified = attrs['verified']
    @admin_id = attrs['admin_id']
    @is_admin = attrs['is_admin']
    @api_key = attrs['api_key']
    @users = (attrs['users'] || []).map { |u| StudioUser.new(u) }
  end
end

# TradeItem represents a trade item
class TradeItem
  attr_accessor :item_id, :amount

  def initialize(attrs = {})
    attrs.each { |k, v| send("#{k}=", v) if respond_to?("#{k}=") }
  end
end

# TradeItemInfo represents enriched trade item information
class TradeItemInfo
  attr_accessor :item_id, :name, :description, :icon_hash, :amount

  def initialize(attrs = {})
    attrs.each { |k, v| send("#{k}=", v) if respond_to?("#{k}=") }
  end
end

# Trade represents a trade with enriched item information
class Trade
  attr_accessor :id, :from_user_id, :to_user_id, :from_user_items, :to_user_items,
                :approved_from_user, :approved_to_user, :status, :created_at, :updated_at

  def initialize(attrs = {})
    @id = attrs['id']
    @from_user_id = attrs['from_user_id']
    @to_user_id = attrs['to_user_id']
    @from_user_items = (attrs['from_user_items'] || []).map { |i| TradeItemInfo.new(i) }
    @to_user_items = (attrs['to_user_items'] || []).map { |i| TradeItemInfo.new(i) }
    @approved_from_user = attrs['approved_from_user']
    @approved_to_user = attrs['approved_to_user']
    @status = attrs['status']
    @created_at = attrs['created_at']
    @updated_at = attrs['updated_at']
  end
end

# SearchResult represents global search results
class SearchResult
  attr_accessor :users, :items, :games

  def initialize(attrs = {})
    @users = (attrs['users'] || []).map { |u| User.new(u) }
    @items = (attrs['items'] || []).map { |i| Item.new(i) }
    @games = (attrs['games'] || []).map { |g| Game.new(g) }
  end
end

# CroissantAPI provides methods to interact with the Croissant API
class CroissantAPI
  def initialize(token = nil)
    raise 'Token is required' if token.nil? || token.empty?
    @token = token
  end

  def get(path, auth: false)
    uri = URI("#{CROISSANT_BASE_URL}#{path}")
    req = Net::HTTP::Get.new(uri)
    req['Authorization'] = "Bearer #{@token}" if auth && @token
    res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(req) }
    JSON.parse(res.body)
  end

  def post(path, body = {}, auth: false)
    uri = URI("#{CROISSANT_BASE_URL}#{path}")
    req = Net::HTTP::Post.new(uri)
    req['Content-Type'] = 'application/json'
    req['Authorization'] = "Bearer #{@token}" if auth && @token
    req.body = body.to_json
    res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(req) }
    JSON.parse(res.body)
  end

  def put(path, body = {}, auth: false)
    uri = URI("#{CROISSANT_BASE_URL}#{path}")
    req = Net::HTTP::Put.new(uri)
    req['Content-Type'] = 'application/json'
    req['Authorization'] = "Bearer #{@token}" if auth && @token
    req.body = body.to_json
    res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(req) }
    JSON.parse(res.body)
  end

  def delete(path, auth: false)
    uri = URI("#{CROISSANT_BASE_URL}#{path}")
    req = Net::HTTP::Delete.new(uri)
    req['Authorization'] = "Bearer #{@token}" if auth && @token
    res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(req) }
    JSON.parse(res.body)
  end

  # --- USERS ---
  
  # Get the current authenticated user's profile, including studios, roles, inventory, owned items, and created games.
  def get_me
    User.new(get('/users/@me', auth: true))
  end

  # Get a user by userId. userId can be a Croissant ID, Discord ID, Google ID or Steam ID.
  def get_user(user_id)
    User.new(get("/users/#{user_id}"))
  end

  # Search for users by username.
  def search_users(query)
    get("/users/search?q=#{URI.encode_www_form_component(query)}").map { |u| User.new(u) }
  end

  # Check the verification key for the user.
  def verify_user(user_id, verification_key)
    post('/users/auth-verification', { userId: user_id, verificationKey: verification_key })
  end

  # Transfer credits from one user to another.
  def transfer_credits(target_user_id, amount)
    post('/users/transfer-credits', { targetUserId: target_user_id, amount: amount }, auth: true)
  end

  # Change username (authenticated user only).
  def change_username(username)
    post('/users/change-username', { username: username }, auth: true)
  end

  # Change password (authenticated user only).
  def change_password(old_password, new_password, confirm_password)
    post('/users/change-password', {
      oldPassword: old_password,
      newPassword: new_password,
      confirmPassword: confirm_password
    }, auth: true)
  end

  # --- GAMES ---
  
  # List all games visible in the store.
  def list_games
    get('/games').map { |g| Game.new(g) }
  end

  # Search for games by name, genre, or description.
  def search_games(query)
    get("/games/search?q=#{URI.encode_www_form_component(query)}").map { |g| Game.new(g) }
  end

  # Get a game by gameId.
  def get_game(game_id)
    Game.new(get("/games/#{game_id}"))
  end

  # Get all games created by the authenticated user.
  def get_my_created_games
    get('/games/@mine', auth: true).map { |g| Game.new(g) }
  end

  # Get all games owned by the authenticated user.
  def get_my_owned_games
    get('/games/list/@me', auth: true).map { |g| Game.new(g) }
  end

  # Create a new game.
  def create_game(game_hash)
    post('/games', game_hash, auth: true)
  end

  # Update an existing game.
  def update_game(game_id, game_hash)
    Game.new(put("/games/#{game_id}", game_hash, auth: true))
  end

  # Buy a game.
  def buy_game(game_id)
    post("/games/#{game_id}/buy", {}, auth: true)
  end

  # --- ITEMS ---
  
  # Get all non-deleted items visible in store.
  def list_items
    get('/items').map { |i| Item.new(i) }
  end

  # Get all items owned by the authenticated user.
  def get_my_items
    get('/items/@mine', auth: true).map { |i| Item.new(i) }
  end

  # Search for items by name (only those visible in store).
  def search_items(query)
    get("/items/search?q=#{URI.encode_www_form_component(query)}").map { |i| Item.new(i) }
  end

  # Get a single item by itemId.
  def get_item(item_id)
    Item.new(get("/items/#{item_id}"))
  end

  # Create a new item.
  def create_item(item_hash)
    post('/items/create', item_hash, auth: true)
  end

  # Update an existing item.
  def update_item(item_id, item_hash)
    put("/items/update/#{item_id}", item_hash, auth: true)
  end

  # Delete an item.
  def delete_item(item_id)
    delete("/items/delete/#{item_id}", auth: true)
  end

  # Buy an item.
  def buy_item(item_id, amount)
    post("/items/buy/#{item_id}", { amount: amount }, auth: true)
  end

  # Sell an item.
  def sell_item(item_id, amount)
    post("/items/sell/#{item_id}", { amount: amount }, auth: true)
  end

  # Give item occurrences to a user (owner only).
  def give_item(item_id, amount, user_id = nil)
    body = { amount: amount }
    body[:userId] = user_id if user_id
    post("/items/give/#{item_id}", body, auth: true)
  end

  # Consume item occurrences from a user (owner only).
  def consume_item(item_id, amount)
    post("/items/consume/#{item_id}", { amount: amount }, auth: true)
  end

  # Drop item occurrences from your inventory.
  def drop_item(item_id, amount)
    post("/items/drop/#{item_id}", { amount: amount }, auth: true)
  end

  # --- INVENTORY ---
  
  # Get the inventory of the authenticated user.
  def get_my_inventory
    get('/inventory/@me', auth: true).map { |i| InventoryItem.new(i) }
  end

  # Get the inventory of a user.
  def get_inventory(user_id)
    get("/inventory/#{user_id}").map { |i| InventoryItem.new(i) }
  end

  # --- LOBBIES ---
  
  # Create a new lobby.
  def create_lobby
    post('/lobbies', {}, auth: true)
  end

  # Get a lobby by lobbyId.
  def get_lobby(lobby_id)
    Lobby.new(get("/lobbies/#{lobby_id}"))
  end

  # Get the lobby the authenticated user is in.
  def get_my_lobby
    Lobby.new(get('/lobbies/user/@me', auth: true))
  end

  # Get the lobby a user is in.
  def get_user_lobby(user_id)
    Lobby.new(get("/lobbies/user/#{user_id}"))
  end

  # Join a lobby.
  def join_lobby(lobby_id)
    post("/lobbies/#{lobby_id}/join", {}, auth: true)
  end

  # Leave a lobby.
  def leave_lobby(lobby_id)
    post("/lobbies/#{lobby_id}/leave", {}, auth: true)
  end

  # --- STUDIOS ---
  
  # Create a new studio.
  def create_studio(studio_name)
    post('/studios', { studioName: studio_name }, auth: true)
  end

  # Get a studio by studioId.
  def get_studio(studio_id)
    Studio.new(get("/studios/#{studio_id}"))
  end

  # Get all studios the authenticated user is part of.
  def get_my_studios
    get('/studios/user/@me', auth: true).map { |s| Studio.new(s) }
  end

  # Add a user to a studio.
  def add_user_to_studio(studio_id, user_id)
    post("/studios/#{studio_id}/add-user", { userId: user_id }, auth: true)
  end

  # Remove a user from a studio.
  def remove_user_from_studio(studio_id, user_id)
    post("/studios/#{studio_id}/remove-user", { userId: user_id }, auth: true)
  end

  # --- TRADES ---
  
  # Start a new trade or get the latest pending trade with a user.
  def start_or_get_pending_trade(user_id)
    Trade.new(post("/trades/start-or-latest/#{user_id}", {}, auth: true))
  end

  # Get a trade by ID with enriched item information.
  def get_trade(trade_id)
    Trade.new(get("/trades/#{trade_id}", auth: true))
  end

  # Get all trades for a user with enriched item information.
  def get_my_trades
    get('/trades/user/@me', auth: true).map { |t| Trade.new(t) }
  end

  # Add an item to a trade.
  def add_item_to_trade(trade_id, trade_item)
    post("/trades/#{trade_id}/add-item", { tradeItem: trade_item }, auth: true)
  end

  # Remove an item from a trade.
  def remove_item_from_trade(trade_id, trade_item)
    post("/trades/#{trade_id}/remove-item", { tradeItem: trade_item }, auth: true)
  end

  # Approve a trade.
  def approve_trade(trade_id)
    put("/trades/#{trade_id}/approve", {}, auth: true)
  end

  # Cancel a trade.
  def cancel_trade(trade_id)
    put("/trades/#{trade_id}/cancel", {}, auth: true)
  end

  # --- SEARCH ---
  
  # Global search across users, items, and games.
  def global_search(query)
    SearchResult.new(get("/search?q=#{URI.encode_www_form_component(query)}"))
  end

  # --- OAUTH2 ---

  # Get an OAuth2 app by its client ID.
  def get_oauth2_app(client_id)
    get("/oauth2/app/#{client_id}", auth: false)
  end

  # Create a new OAuth2 app.
  def create_oauth2_app(name, redirect_urls)
    post('/oauth2/app', { name: name, redirect_urls: redirect_urls }, auth: true)
  end

  # Get all OAuth2 apps owned by the authenticated user.
  def get_my_oauth2_apps
    get('/oauth2/apps', auth: true)
  end

  # Update an OAuth2 app.
  def update_oauth2_app(client_id, data)
    uri = "/oauth2/app/#{client_id}"
    Net::HTTP.start(URI(CROISSANT_BASE_URL + uri).hostname, URI(CROISSANT_BASE_URL + uri).port, use_ssl: true) do |http|
      req = Net::HTTP::Patch.new(URI(CROISSANT_BASE_URL + uri))
      req['Content-Type'] = 'application/json'
      req['Authorization'] = "Bearer #{@token}"
      req.body = data.to_json
      res = http.request(req)
      JSON.parse(res.body)
    end
  end

  # Delete an OAuth2 app by its client ID.
  def delete_oauth2_app(client_id)
    delete("/oauth2/app/#{client_id}", auth: true)
  end

  # Authorize a user for an OAuth2 app.
  def authorize_oauth2(client_id, redirect_uri)
    get("/oauth2/authorize?client_id=#{URI.encode_www_form_component(client_id)}&redirect_uri=#{URI.encode_www_form_component(redirect_uri)}", auth: true)
  end

  # Get a user by OAuth2 code and client ID.
  def get_user_by_code(code, client_id)
    get("/oauth2/user?code=#{URI.encode_www_form_component(code)}&client_id=#{URI.encode_www_form_component(client_id)}")
  end

  # --- ITEMS METADATA ---

  # Give an item to a user with metadata.
  def give_item_with_metadata(item_id, amount, user_id, metadata = nil)
    body = { amount: amount, userId: user_id }
    body[:metadata] = metadata if metadata
    post("/items/give/#{item_id}", body, auth: true)
  end

  # Update metadata for an item instance.
  def update_item_metadata(item_id, unique_id, metadata)
    put("/items/update-metadata/#{item_id}", { uniqueId: unique_id, metadata: metadata }, auth: true)
  end

  # Consume an item instance (with params hash).
  def consume_item_instance(item_id, params)
    post("/items/consume/#{item_id}", params, auth: true)
  end

  # Drop an item instance (with params hash).
  def drop_item_instance(item_id, params)
    post("/items/drop/#{item_id}", params, auth: true)
  end
end
