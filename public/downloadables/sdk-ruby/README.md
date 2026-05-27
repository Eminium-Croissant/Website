# Croissant API Client Library - Ruby

A comprehensive Ruby client library for the Croissant gaming platform API. This library provides a fully typed interface for all platform features including user management, game operations, inventory, trading, and more.

## Installation

### Direct Download

Download the library directly from the Croissant platform:

- **Ruby**: [croissant_api.rb](https://croissant-api.eminium.ovh/downloadables/sdk-ruby/croissant_api.rb)

### Add Dependencies

Add the following dependencies to your `Gemfile`:

```ruby
# Gemfile
gem 'json', '~> 2.0'
gem 'uri', '~> 0.10'
```

### Include in your project

```ruby
require_relative 'croissant_api'
```

## Requirements

- **Ruby**: 2.7+
- **Dependencies**: json, uri, net/http (built-in)
- **SSL Support**: Required for HTTPS connections

## Getting Started

### Basic Initialization

```ruby
require_relative 'croissant_api'

# Initialize with API token (required)
api = CroissantAPI.new('your_api_token')
```

### Authentication

To perform operations, you need an API token:

1. **Via Web Dashboard**: Login to [croissant-api.eminium.ovh](https://croissant-api.eminium.ovh) and generate a token
2. **Via OAuth2**: Implement OAuth2 flow for third-party applications
3. **Via Bot Token**: Use dedicated bot tokens for automated systems

```ruby
# Environment variable (recommended)
api = CroissantAPI.new(ENV['CROISSANT_API_TOKEN'])

# Or directly
api = CroissantAPI.new('your_token_here')
```

## API Reference

### Core Structure

#### `CroissantAPI`

Main API client class providing access to all platform modules.

**Constructor**

```ruby
def initialize(token = nil)
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
- Global search

---

### Users Module

#### `get_me() -> User`

Retrieve the authenticated user's profile.

```ruby
user = api.get_me # Requires authentication
puts "Welcome, #{user.username}!"
```

#### `search_users(query) -> Array<User>`

Search for users by username.

```ruby
users = api.search_users('john')
users.each { |user| puts "Found user: #{user.username}" }
```

#### `get_user(user_id) -> User`

Get a specific user by ID (supports Croissant ID, Discord ID, Google ID, or Steam ID).

```ruby
user = api.get_user('user_12345')
puts "User: #{user.username}"
```

#### `transfer_credits(target_user_id, amount) -> Hash`

Transfer credits to another user.

```ruby
result = api.transfer_credits('user_67890', 100.0)
puts "Transfer completed: #{result}"
```

#### `verify_user(user_id, verification_key) -> Hash`

Verify a user account.

```ruby
result = api.verify_user('user_id', 'verification_key')
```

#### `change_username(username) -> Hash`

Change the authenticated user's username.

```ruby
result = api.change_username('new_username')
```

#### `change_password(old_password, new_password, confirm_password) -> Hash`

Change the authenticated user's password.

```ruby
result = api.change_password('old_pass', 'new_pass', 'new_pass')
```

---

### Games Module

#### `list_games() -> Array<Game>`

List all available games.

```ruby
games = api.list_games
puts "Available games: #{games.length}"
```

#### `search_games(query) -> Array<Game>`

Search games by name, genre, or description.

```ruby
games = api.search_games('adventure platformer')
games.each { |game| puts "Found game: #{game.name} - #{game.description}" }
```

#### `get_game(game_id) -> Game`

Get detailed information about a specific game.

```ruby
game = api.get_game('game_abc123')
puts "Game: #{game.name} - Price: #{game.price}"
```

#### `get_my_created_games() -> Array<Game>`

Get games created by the authenticated user.

```ruby
my_games = api.get_my_created_games # Requires authentication
```

#### `get_my_owned_games() -> Array<Game>`

Get games owned by the authenticated user.

```ruby
owned_games = api.get_my_owned_games # Requires authentication
```

#### `create_game(game_hash) -> Hash`

Create a new game.

```ruby
game_data = {
  name: 'My Awesome Game',
  description: 'An epic adventure game',
  price: 29.99,
  genre: 'Adventure'
}

result = api.create_game(game_data) # Requires authentication
```

#### `update_game(game_id, game_hash) -> Game`

Update an existing game.

```ruby
updates = { price: 19.99, description: 'Updated description' }
updated_game = api.update_game('game_abc123', updates) # Requires authentication
```

#### `buy_game(game_id) -> Hash`

Purchase a game.

```ruby
result = api.buy_game('game_abc123') # Requires authentication
```

---

### Items Module

#### `list_items() -> Array<Item>`

List all available items in the marketplace.

```ruby
items = api.list_items
puts "Available items: #{items.length}"
```

#### `search_items(query) -> Array<Item>`

Search items by name or description.

```ruby
items = api.search_items('magic sword')
items.each { |item| puts "Found item: #{item.name} - Price: #{item.price}" }
```

#### `get_item(item_id) -> Item`

Get detailed information about a specific item.

```ruby
item = api.get_item('item_xyz789')
puts "Item: #{item.name} - #{item.description}"
```

#### `get_my_items() -> Array<Item>`

Get items owned by the authenticated user.

```ruby
my_items = api.get_my_items # Requires authentication
```

#### `create_item(item_hash) -> Hash`

Create a new item for sale.

```ruby
item_data = {
  name: 'Enchanted Shield',
  description: 'Provides magical protection',
  price: 150.0,
  icon_hash: 'optional_hash'
}

result = api.create_item(item_data) # Requires authentication
```

#### `update_item(item_id, item_hash) -> Hash`

Update an existing item.

```ruby
updates = { price: 125.0, description: 'Updated description' }
result = api.update_item('item_xyz789', updates) # Requires authentication
```

#### `delete_item(item_id) -> Hash`

Delete an item.

```ruby
result = api.delete_item('item_xyz789') # Requires authentication
```

#### `buy_item(item_id, amount) -> Hash`

Purchase items from the marketplace.

```ruby
result = api.buy_item('item_xyz789', 2) # Requires authentication
puts "Purchase completed: #{result}"
```

#### `sell_item(item_id, amount) -> Hash`

Sell items from inventory.

```ruby
result = api.sell_item('item_xyz789', 1) # Requires authentication
```

#### `give_item(item_id, amount, user_id = nil) -> Hash`

Give items to another user.

```ruby
result = api.give_item('item_xyz789', 1, 'user_67890') # Requires authentication
```

#### `give_item_with_metadata(item_id, amount, user_id, metadata = nil) -> Hash`

Give items to another user with metadata.

```ruby
metadata = { enchantment: 'fire', level: 5 }
result = api.give_item_with_metadata('item_xyz789', 1, 'user_67890', metadata) # Requires authentication
```

#### `consume_item(item_id, amount) -> Hash`

Consume items from inventory.

```ruby
result = api.consume_item('item_xyz789', 1) # Requires authentication
```

#### `consume_item_instance(item_id, params) -> Hash`

Consume specific item instances with parameters.

```ruby
params = { amount: 1, unique_id: 'instance_123' }
result = api.consume_item_instance('item_xyz789', params) # Requires authentication
```

#### `drop_item(item_id, amount) -> Hash`

Drop items from inventory.

```ruby
result = api.drop_item('item_xyz789', 1) # Requires authentication
```

#### `drop_item_instance(item_id, params) -> Hash`

Drop specific item instances with parameters.

```ruby
params = { amount: 1, unique_id: 'instance_123' }
result = api.drop_item_instance('item_xyz789', params) # Requires authentication
```

#### `update_item_metadata(item_id, unique_id, metadata) -> Hash`

Update metadata for a specific item instance.

```ruby
metadata = { enchantment: 'ice', level: 10 }
result = api.update_item_metadata('item_xyz789', 'instance_123', metadata) # Requires authentication
```

---

### Inventory Module

#### `get_my_inventory() -> Array<InventoryItem>`

Get the authenticated user's inventory.

```ruby
inventory = api.get_my_inventory # Requires authentication
puts "Inventory items: #{inventory.length}"
```

#### `get_inventory(user_id) -> Array<InventoryItem>`

Get another user's public inventory.

```ruby
user_inventory = api.get_inventory('user_12345')
```

---

### Studios Module

#### `create_studio(studio_name) -> Hash`

Create a new development studio.

```ruby
result = api.create_studio('Awesome Games Studio') # Requires authentication
```

#### `get_studio(studio_id) -> Studio`

Get information about a specific studio.

```ruby
studio = api.get_studio('studio_abc123')
puts "Studio: #{studio.username}"
```

#### `get_my_studios() -> Array<Studio>`

Get studios the authenticated user is part of.

```ruby
my_studios = api.get_my_studios # Requires authentication
```

#### `add_user_to_studio(studio_id, user_id) -> Hash`

Add a user to a studio team.

```ruby
result = api.add_user_to_studio('studio_abc123', 'user_67890') # Requires authentication
```

#### `remove_user_from_studio(studio_id, user_id) -> Hash`

Remove a user from a studio team.

```ruby
result = api.remove_user_from_studio('studio_abc123', 'user_67890') # Requires authentication
```

---

### Lobbies Module

#### `create_lobby() -> Hash`

Create a new game lobby.

```ruby
result = api.create_lobby # Requires authentication
puts "Lobby created: #{result}"
```

#### `get_lobby(lobby_id) -> Lobby`

Get information about a specific lobby.

```ruby
lobby = api.get_lobby('lobby_xyz789')
puts "Lobby: #{lobby.users.length} players"
```

#### `get_my_lobby() -> Lobby`

Get the authenticated user's current lobby.

```ruby
my_lobby = api.get_my_lobby # Requires authentication
```

#### `get_user_lobby(user_id) -> Lobby`

Get the lobby a specific user is in.

```ruby
user_lobby = api.get_user_lobby('user_12345')
```

#### `join_lobby(lobby_id) -> Hash`

Join an existing lobby.

```ruby
result = api.join_lobby('lobby_xyz789') # Requires authentication
```

#### `leave_lobby(lobby_id) -> Hash`

Leave a lobby.

```ruby
result = api.leave_lobby('lobby_xyz789') # Requires authentication
```

---

### Trading Module

#### `start_or_get_pending_trade(user_id) -> Trade`

Start a new trade or get existing pending trade with a user.

```ruby
trade = api.start_or_get_pending_trade('user_67890') # Requires authentication
puts "Trade ID: #{trade.id}"
```

#### `get_trade(trade_id) -> Trade`

Get information about a specific trade.

```ruby
trade = api.get_trade('trade_abc123')
puts "Trade status: #{trade.status}"
```

#### `get_my_trades() -> Array<Trade>`

Get all trades for the authenticated user.

```ruby
my_trades = api.get_my_trades # Requires authentication
```

#### `add_item_to_trade(trade_id, trade_item) -> Hash`

Add an item to a trade.

```ruby
trade_item = {
  item_id: 'item_xyz789',
  amount: 1
}

result = api.add_item_to_trade('trade_abc123', trade_item) # Requires authentication
```

#### `remove_item_from_trade(trade_id, trade_item) -> Hash`

Remove an item from a trade.

```ruby
trade_item = {
  item_id: 'item_xyz789',
  amount: 1
}

result = api.remove_item_from_trade('trade_abc123', trade_item) # Requires authentication
```

#### `approve_trade(trade_id) -> Hash`

Approve and execute a trade.

```ruby
result = api.approve_trade('trade_abc123') # Requires authentication
```

#### `cancel_trade(trade_id) -> Hash`

Cancel a pending trade.

```ruby
result = api.cancel_trade('trade_abc123') # Requires authentication
```

---

### Search Module

#### `global_search(query) -> SearchResult`

Global search across users, items, and games.

```ruby
results = api.global_search('adventure')
puts "Found #{results.games.length} games, #{results.items.length} items, #{results.users.length} users"
```

---

### OAuth2 Module

#### `create_oauth2_app(name, redirect_urls) -> Hash`

Create a new OAuth2 application.

```ruby
redirect_urls = ['https://mygame.com/auth/callback']
result = api.create_oauth2_app('My Game Client', redirect_urls) # Requires authentication
```

#### `get_oauth2_app(client_id) -> Hash`

Get OAuth2 application by client ID.

```ruby
app = api.get_oauth2_app('client_12345')
```

#### `get_my_oauth2_apps() -> Array<Hash>`

Get OAuth2 applications owned by the authenticated user.

```ruby
apps = api.get_my_oauth2_apps # Requires authentication
```

#### `update_oauth2_app(client_id, data) -> Hash`

Update an OAuth2 application.

```ruby
updates = { name: 'Updated App Name' }
result = api.update_oauth2_app('client_12345', updates) # Requires authentication
```

#### `delete_oauth2_app(client_id) -> Hash`

Delete an OAuth2 application.

```ruby
result = api.delete_oauth2_app('client_12345') # Requires authentication
```

#### `authorize_oauth2(client_id, redirect_uri) -> Hash`

Authorize a user for an OAuth2 app.

```ruby
result = api.authorize_oauth2('client_12345', 'https://app.com/callback') # Requires authentication
```

#### `get_user_by_code(code, client_id) -> Hash`

Get user information using OAuth2 authorization code.

```ruby
user_data = api.get_user_by_code('auth_code', 'client_12345')
```

## Class Definitions

### Core Classes

#### `User`

```ruby
class User
  attr_accessor :user_id, :username, :email, :balance, :verified, :steam_id,
                :steam_username, :steam_avatar_url, :is_studio, :admin, :disabled,
                :google_id, :discord_id, :studios, :roles, :inventory, :owned_items,
                :created_games, :have_authenticator, :verification_key
end
```

#### `Game`

```ruby
class Game
  attr_accessor :game_id, :name, :description, :owner_id, :download_link, :price,
                :show_in_store, :icon_hash, :splash_hash, :banner_hash, :genre,
                :release_date, :developer, :publisher, :platforms, :rating,
                :website, :trailer_link, :multiplayer
end
```

#### `Item`

```ruby
class Item
  attr_accessor :item_id, :name, :description, :price, :owner, :show_in_store,
                :icon_hash, :deleted
end
```

#### `InventoryItem`

```ruby
class InventoryItem
  attr_accessor :item_id, :name, :description, :amount, :icon_hash
end
```

#### `Trade`

```ruby
class Trade
  attr_accessor :id, :from_user_id, :to_user_id, :from_user_items, :to_user_items,
                :approved_from_user, :approved_to_user, :status, :created_at, :updated_at
end
```

#### `Studio`

```ruby
class Studio
  attr_accessor :user_id, :username, :verified, :admin_id, :is_admin, :api_key, :users
end
```

#### `Lobby`

```ruby
class Lobby
  attr_accessor :lobby_id, :users
end
```

#### `SearchResult`

```ruby
class SearchResult
  attr_accessor :users, :items, :games
end
```

## Error Handling

All API methods may raise exceptions. Always wrap calls in rescue blocks:

```ruby
begin
  user = api.get_me
  puts "Welcome, #{user.username}!"
rescue StandardError => e
  puts "API Error: #{e.message}"

  case e.message
  when /Token is required/
    puts "Authentication required"
  when /404/
    puts "Resource not found"
  when /401/
    puts "Unauthorized - check token"
  when /403/
    puts "Forbidden - insufficient permissions"
  else
    puts "Unknown error occurred"
  end
end
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

### Ruby on Rails Integration

```ruby
# config/initializers/croissant.rb
Rails.application.configure do
  config.croissant_api_token = ENV['CROISSANT_API_TOKEN']
end

# app/services/croissant_service.rb
class CroissantService
  def initialize
    @api = CroissantAPI.new(Rails.application.config.croissant_api_token)
  end

  def handle_player_login(player_id)
    user = @api.get_user(player_id)
    inventory = @api.get_inventory(player_id)

    {
      username: user.username,
      verified: user.verified,
      items: inventory.map { |item|
        {
          id: item.item_id,
          name: item.name,
          quantity: item.amount
        }
      }
    }
  rescue StandardError => e
    Rails.logger.error "Croissant API Error: #{e.message}"
    nil
  end

  def give_reward(player_id, item_id, amount)
    @api.give_item(item_id, amount, player_id)
    Rails.logger.info "Reward given to #{player_id}: #{item_id} x#{amount}"
  rescue StandardError => e
    Rails.logger.error "Failed to give reward: #{e.message}"
    false
  end
end

# app/controllers/players_controller.rb
class PlayersController < ApplicationController
  def login
    service = CroissantService.new
    player_data = service.handle_player_login(params[:player_id])

    if player_data
      render json: player_data
    else
      render json: { error: 'Login failed' }, status: :unauthorized
    end
  end
end
```

### Sinatra Integration

```ruby
require 'sinatra'
require_relative 'croissant_api'

# Initialize API
configure do
  set :croissant_api, CroissantAPI.new(ENV['CROISSANT_API_TOKEN'])
end

# Helper methods
helpers do
  def croissant_api
    settings.croissant_api
  end

  def handle_api_error(&block)
    begin
      yield
    rescue StandardError => e
      logger.error "Croissant API Error: #{e.message}"
      halt 500, json({ error: e.message })
    end
  end
end

# Routes
get '/api/user/:id' do
  handle_api_error do
    user = croissant_api.get_user(params[:id])
    json(user)
  end
end

get '/api/games' do
  handle_api_error do
    games = croissant_api.list_games
    json(games)
  end
end

post '/api/items/:id/buy' do
  handle_api_error do
    data = JSON.parse(request.body.read)
    result = croissant_api.buy_item(params[:id], data['amount'])
    json(result)
  end
end
```

### Game Server Implementation

```ruby
class GameServer
  def initialize(api_token)
    @api = CroissantAPI.new(api_token)
    @players = {}
  end

  def handle_player_join(player_id)
    begin
      user = @api.get_user(player_id)
      inventory = @api.get_inventory(player_id)

      @players[player_id] = {
        username: user.username,
        verified: user.verified,
        items: inventory.map(&:item_id)
      }

      puts "Player joined: #{user.username}"
      true
    rescue StandardError => e
      puts "Failed to load player #{player_id}: #{e.message}"
      false
    end
  end

  def give_quest_reward(player_id, quest_id)
    rewards = get_quest_rewards(quest_id)

    rewards.each do |reward|
      begin
        @api.give_item(reward[:item_id], reward[:amount], player_id)
        puts "Gave #{reward[:amount]}x #{reward[:item_id]} to #{player_id}"
      rescue StandardError => e
        puts "Failed to give reward: #{e.message}"
      end
    end
  end

  def handle_player_trade(from_player_id, to_player_id, items)
    begin
      trade = @api.start_or_get_pending_trade(to_player_id)

      items.each do |item|
        trade_item = {
          item_id: item[:id],
          amount: item[:amount]
        }
        @api.add_item_to_trade(trade.id, trade_item)
      end

      puts "Trade created: #{trade.id}"
      trade.id
    rescue StandardError => e
      puts "Trade failed: #{e.message}"
      nil
    end
  end

  private

  def get_quest_rewards(quest_id)
    # Define quest rewards
    {
      'quest_1' => [
        { item_id: 'gold_coin', amount: 100 },
        { item_id: 'health_potion', amount: 5 }
      ],
      'quest_2' => [
        { item_id: 'magic_sword', amount: 1 },
        { item_id: 'gold_coin', amount: 250 }
      ]
    }[quest_id] || []
  end
end

# Usage
server = GameServer.new(ENV['CROISSANT_API_TOKEN'])

# Handle events
server.handle_player_join('player_123')
server.give_quest_reward('player_123', 'quest_1')
trade_id = server.handle_player_trade('player_123', 'player_456', [
  { id: 'magic_sword', amount: 1 }
])
```

## Complete Examples

### Complete Game Store Implementation

```ruby
class GameStore
  def initialize(api_token)
    @api = CroissantAPI.new(api_token)
  end

  # Browse games with filters
  def browse_games(options = {})
    games = if options[:search]
              @api.search_games(options[:search])
            else
              @api.list_games
            end

    # Apply filters
    games = games.select { |game| game.price <= options[:max_price] } if options[:max_price]
    games = games.select { |game| game.rating >= options[:min_rating] } if options[:min_rating]
    games = games.select { |game| game.multiplayer == options[:multiplayer] } if options.key?(:multiplayer)

    games
  rescue StandardError => e
    raise "Failed to browse games: #{e.message}"
  end

  # Browse items with filters
  def browse_items(options = {})
    items = if options[:search]
              @api.search_items(options[:search])
            else
              @api.list_items
            end

    # Apply filters
    items = items.select { |item| item.price <= options[:max_price] } if options[:max_price]
    items = items.select { |item| !item.deleted } # Filter out deleted items

    items
  rescue StandardError => e
    raise "Failed to browse items: #{e.message}"
  end

  # Purchase item with balance check
  def purchase_item(item_id, quantity)
    # Get item details
    item = @api.get_item(item_id)

    # Check user balance
    user = @api.get_me
    total_cost = item.price * quantity

    raise 'Insufficient balance' if !user.balance || user.balance < total_cost

    # Make purchase
    result = @api.buy_item(item_id, quantity)

    {
      success: true,
      item: item,
      quantity: quantity,
      total_cost: total_cost,
      new_balance: user.balance - total_cost,
      result: result
    }
  rescue StandardError => e
    raise "Purchase failed: #{e.message}"
  end

  # Get user's library
  def get_library
    @api.get_my_owned_games
  rescue StandardError => e
    raise "Failed to load library: #{e.message}"
  end

  # Get user's inventory
  def get_inventory
    @api.get_my_inventory
  rescue StandardError => e
    raise "Failed to load inventory: #{e.message}"
  end
end

# Usage
store = GameStore.new(ENV['CROISSANT_API_TOKEN'])

begin
  # Browse and purchase
  games = store.browse_games(search: 'adventure', max_price: 50)
  puts "Found #{games.length} adventure games under 50 credits"

  items = store.browse_items(search: 'sword', max_price: 100)
  puts "Found #{items.length} swords under 100 credits"

  # Purchase item
  purchase_result = store.purchase_item('item_123', 1)
  puts "Purchase successful! New balance: #{purchase_result[:new_balance]}"

rescue StandardError => e
  puts "Error: #{e.message}"
end
```

### Trading System Implementation

```ruby
class TradingSystem
  def initialize(api_token)
    @api = CroissantAPI.new(api_token)
  end

  # Create a trade offer
  def create_trade_offer(target_user_id, offered_items)
    # Start or get pending trade
    trade = @api.start_or_get_pending_trade(target_user_id)

    # Add items to trade
    offered_items.each do |item|
      trade_item = {
        item_id: item[:id],
        amount: item[:amount]
      }

      @api.add_item_to_trade(trade.id, trade_item)
    end

    puts "Trade offer created: #{trade.id}"
    trade
  rescue StandardError => e
    raise "Failed to create trade: #{e.message}"
  end

  # Get all user's trades
  def get_my_trades
    @api.get_my_trades
  rescue StandardError => e
    raise "Failed to get trades: #{e.message}"
  end

  # Accept a trade
  def accept_trade(trade_id)
    result = @api.approve_trade(trade_id)
    puts "Trade accepted: #{trade_id}"
    result
  rescue StandardError => e
    raise "Failed to accept trade: #{e.message}"
  end

  # Cancel a trade
  def cancel_trade(trade_id)
    result = @api.cancel_trade(trade_id)
    puts "Trade cancelled: #{trade_id}"
    result
  rescue StandardError => e
    raise "Failed to cancel trade: #{e.message}"
  end

  # Get trade details
  def get_trade_details(trade_id)
    @api.get_trade(trade_id)
  rescue StandardError => e
    raise "Failed to get trade details: #{e.message}"
  end
end

# Usage
trading = TradingSystem.new(ENV['CROISSANT_API_TOKEN'])

begin
  # Create a trade offer
  trade = trading.create_trade_offer('other_player_id', [
    { id: 'sword_123', amount: 1 },
    { id: 'potion_456', amount: 5 }
  ])

  puts "Trade created: #{trade.id}"

  # List my trades
  my_trades = trading.get_my_trades
  puts "I have #{my_trades.length} active trades"

  # Accept a trade (example)
  # trading.accept_trade('trade_id_here')

rescue StandardError => e
  puts "Trading error: #{e.message}"
end
```

## Best Practices

### Rate Limiting

```ruby
class RateLimitedAPI
  def initialize(api_token)
    @api = CroissantAPI.new(api_token)
    @last_request = Time.now - 1
    @min_interval = 0.1 # 100ms between requests
  end

  def safe_request(&block)
    # Ensure minimum interval between requests
    time_since_last = Time.now - @last_request
    if time_since_last < @min_interval
      sleep(@min_interval - time_since_last)
    end

    @last_request = Time.now
    block.call
  end

  def get_user(user_id)
    safe_request { @api.get_user(user_id) }
  end

  def search_items(query)
    safe_request { @api.search_items(query) }
  end
end
```

### Caching Strategy

```ruby
class CachedCroissantAPI
  def initialize(api_token)
    @api = CroissantAPI.new(api_token)
    @cache = {}
    @cache_timeout = 300 # 5 minutes
  end

  def get_cached_games
    cache_key = 'games_list'

    if @cache[cache_key] && (Time.now - @cache[cache_key][:timestamp]) < @cache_timeout
      return @cache[cache_key][:data]
    end

    games = @api.list_games
    @cache[cache_key] = {
      data: games,
      timestamp: Time.now
    }

    games
  end

  def get_cached_user(user_id)
    cache_key = "user_#{user_id}"

    if @cache[cache_key] && (Time.now - @cache[cache_key][:timestamp]) < @cache_timeout
      return @cache[cache_key][:data]
    end

    user = @api.get_user(user_id)
    @cache[cache_key] = {
      data: user,
      timestamp: Time.now
    }

    user
  end

  def clear_cache
    @cache.clear
  end
end
```

### Environment Configuration

```ruby
# config/croissant.rb
class CroissantConfig
  attr_reader :api_token, :timeout, :retry_attempts

  def initialize
    @api_token = ENV['CROISSANT_API_TOKEN']
    @timeout = (ENV['CROISSANT_TIMEOUT'] || '30').to_i
    @retry_attempts = (ENV['CROISSANT_RETRY_ATTEMPTS'] || '3').to_i

    validate_config
  end

  def create_api
    CroissantAPI.new(@api_token)
  end

  private

  def validate_config
    raise 'CROISSANT_API_TOKEN environment variable is required' unless @api_token

    warn 'No Croissant API token found' if @api_token.nil? || @api_token.empty?
  end
end

# Usage
config = CroissantConfig.new
api = config.create_api
```

### Error Recovery

```ruby
class ResilientCroissantAPI
  def initialize(api_token)
    @api = CroissantAPI.new(api_token)
    @max_retries = 3
    @retry_delay = 1 # seconds
  end

  def with_retry(&block)
    retries = 0

    begin
      block.call
    rescue StandardError => e
      retries += 1

      if retries <= @max_retries && should_retry?(e)
        puts "Retry #{retries}/#{@max_retries} after error: #{e.message}"
        sleep(@retry_delay * retries) # Exponential backoff
        retry
      else
        raise e
      end
    end
  end

  def get_user(user_id)
    with_retry { @api.get_user(user_id) }
  end

  def list_games
    with_retry { @api.list_games }
  end

  private

  def should_retry?(error)
    # Retry on network errors, timeouts, and 5xx server errors
    error.message.match?(/(timeout|network|5\d\d)/)
  end
end
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
- **Minimum Requirements**: Ruby 2.7+

### Changelog

#### v1.0.0 (July 2025)

- Initial release
- Complete API coverage
- Full Ruby support
- Comprehensive documentation

---

\*Built with ❤️ for the Croissant
