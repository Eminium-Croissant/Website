<?php

/**
 * Croissant API Client for PHP (strictly adapted to the official endpoint documentation)
 *
 * This library provides a simple interface to all documented endpoints of the Croissant API.
 * Each method matches an official endpoint and is fully documented for IDE autocompletion.
 *
 * Usage example:
 *   $api = new CroissantAPI('your_token');
 *   $games = $api->listGames();
 */
class CroissantAPI {
    private $token;
    private $baseUrl = 'https://croissant-api.eminium.ovh/api';

    /**
     * Create a new CroissantAPI client.
     * @param string|null $token Optional authentication token.
     */
    public function __construct($token = null) {
        $this->token = $token;
    }

    /**
     * Internal HTTP request helper.
     * @param string $method HTTP method (GET, POST, PUT, DELETE, PATCH)
     * @param string $endpoint API endpoint (e.g. /users/@me)
     * @param array|null $body Optional request body (for POST/PUT/PATCH)
     * @param bool $auth Whether to include the Authorization header
     * @return array Decoded JSON response
     * @throws Exception on network or JSON error
     */
    private function request($method, $endpoint, $body = null, $auth = false) {
        $url = $this->baseUrl . $endpoint;
        $headers = [
            'Content-Type: application/json'
        ];
        if ($auth && $this->token) {
            $headers[] = 'Authorization: Bearer ' . $this->token;
        }
        $opts = [
            'http' => [
                'method' => $method,
                'header' => implode("\r\n", $headers),
                'ignore_errors' => true
            ]
        ];
        if ($body) {
            $opts['http']['content'] = json_encode($body);
        }
        $context = stream_context_create($opts);
        $result = file_get_contents($url, false, $context);
        if ($result === false) {
            throw new Exception('Failed to make API request');
        }
        $decoded = json_decode($result, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON response: ' . json_last_error_msg());
        }
        return $decoded;
    }

    // === USERS ===

    /**
     * Get the authenticated user's profile.
     * GET /users/@me
     * @return array User object
     * @throws Exception if not authenticated or request fails
     */
    public function getMe() {
        return $this->request('GET', '/users/@me', null, true);
    }

    /**
     * Search users by username or other criteria.
     * GET /users/search?q=...
     * @param string $query Search string
     * @return array List of users
     */
    public function searchUsers($query) {
        return $this->request('GET', '/users/search?q=' . urlencode($query));
    }

    /**
     * Get a user by their userId.
     * GET /users/:userId
     * @param string $userId User ID
     * @return array User object
     */
    public function getUser($userId) {
        return $this->request('GET', "/users/$userId");
    }

    /**
     * Transfer credits to another user.
     * POST /users/transfer-credits
     * @param string $targetUserId Recipient user ID
     * @param int $amount Amount to transfer
     * @return array Message about the transfer
     * @throws Exception if not authenticated or request fails
     */
    public function transferCredits($targetUserId, $amount) {
        return $this->request('POST', '/users/transfer-credits', [
            'targetUserId' => $targetUserId,
            'amount' => $amount
        ], true);
    }

    /**
     * Verify a user with a verification key.
     * POST /users/auth-verification
     * @param string $userId User ID to verify
     * @param string $verificationKey Verification key
     * @return array Success status
     */
    public function verifyUser($userId, $verificationKey) {
        return $this->request('POST', "/users/auth-verification?userId=$userId&verificationKey=" . urlencode($verificationKey));
    }

    // === GAMES ===

    /**
     * List all games visible in the store.
     * GET /games
     * @return array List of games
     */
    public function listGames() {
        return $this->request('GET', '/games');
    }

    /**
     * Search for games by name, genre, or description.
     * GET /games/search?q=...
     * @param string $query Search string
     * @return array List of games
     */
    public function searchGames($query) {
        return $this->request('GET', '/games/search?q=' . urlencode($query));
    }

    /**
     * Get all games created by the authenticated user.
     * GET /games/@mine
     * @return array List of games
     * @throws Exception if not authenticated
     */
    public function getMyCreatedGames() {
        return $this->request('GET', '/games/@mine', null, true);
    }

    /**
     * Get all games owned by the authenticated user.
     * GET /games/list/@me
     * @return array List of games
     * @throws Exception if not authenticated
     */
    public function getMyOwnedGames() {
        return $this->request('GET', '/games/list/@me', null, true);
    }

    /**
     * Get a game by its ID.
     * GET /games/:gameId
     * @param string $gameId Game ID
     * @return array Game object
     */
    public function getGame($gameId) {
        return $this->request('GET', "/games/$gameId");
    }

    // === INVENTORY ===

    /**
     * Get the inventory of the authenticated user.
     * GET /inventory/@me
     * @return array Inventory data
     * @throws Exception if not authenticated
     */
    public function getMyInventory() {
        return $this->request('GET', '/inventory/@me', null, true);
    }

    /**
     * Get the inventory of a user by userId.
     * GET /inventory/:userId
     * @param string $userId User ID
     * @return array Inventory data
     */
    public function getInventory($userId) {
        return $this->request('GET', "/inventory/$userId");
    }

    // === ITEMS ===

    /**
     * List all non-deleted items visible in the store.
     * GET /items
     * @return array List of items
     */
    public function listItems() {
        return $this->request('GET', '/items');
    }

    /**
     * Get all items owned by the authenticated user.
     * GET /items/@mine
     * @return array List of items
     * @throws Exception if not authenticated
     */
    public function getMyItems() {
        return $this->request('GET', '/items/@mine', null, true);
    }

    /**
     * Search for items by name (only those visible in store).
     * GET /items/search?q=...
     * @param string $query Search string
     * @return array List of items
     */
    public function searchItems($query) {
        return $this->request('GET', '/items/search?q=' . urlencode($query));
    }

    /**
     * Get a single item by itemId.
     * GET /items/:itemId
     * @param string $itemId Item ID
     * @return array Item object
     */
    public function getItem($itemId) {
        return $this->request('GET', "/items/$itemId");
    }

    /**
     * Create a new item.
     * POST /items/create
     * @param array $itemData Item data to create
     * @return array Message about the creation
     * @throws Exception if not authenticated or request fails
     */
    public function createItem($itemData) {
        return $this->request('POST', '/items/create', $itemData, true);
    }

    /**
     * Update an existing item.
     * PUT /items/update/:itemId
     * @param string $itemId Item ID
     * @param array $itemData Fields to update
     * @return array Message about the update
     * @throws Exception if not authenticated or request fails
     */
    public function updateItem($itemId, $itemData) {
        return $this->request('PUT', "/items/update/$itemId", $itemData, true);
    }

    /**
     * Delete an item by its ID.
     * DELETE /items/delete/:itemId
     * @param string $itemId Item ID
     * @return array Message about the deletion
     * @throws Exception if not authenticated or request fails
     */
    public function deleteItem($itemId) {
        return $this->request('DELETE', "/items/delete/$itemId", null, true);
    }

    /**
     * Buy an item by its ID.
     * POST /items/buy/:itemId
     * @param string $itemId Item ID
     * @param int $amount Amount to buy
     * @return array Message about the purchase
     * @throws Exception if not authenticated or request fails
     */
    public function buyItem($itemId, $amount) {
        return $this->request('POST', "/items/buy/$itemId", ['amount' => $amount], true);
    }

    /**
     * Sell an item by its ID.
     * POST /items/sell/:itemId
     * @param string $itemId Item ID
     * @param int $amount Amount to sell
     * @return array Message about the sale
     * @throws Exception if not authenticated or request fails
     */
    public function sellItem($itemId, $amount) {
        return $this->request('POST', "/items/sell/$itemId", ['amount' => $amount], true);
    }

    /**
     * Give an item to a user.
     * POST /items/give/:itemId
     * @param string $itemId Item ID
     * @param int $amount Amount to give
     * @param string $userId Recipient user ID
     * @param array|null $metadata Optional metadata for the item instance
     * @return array Message about the operation
     * @throws Exception if not authenticated or request fails
     */
    public function giveItem($itemId, $amount, $userId, $metadata = null) {
        $body = ['amount' => $amount, 'userId' => $userId];
        if ($metadata) $body['metadata'] = $metadata;
        return $this->request('POST', "/items/give/$itemId", $body, true);
    }

    /**
     * Consume an item instance.
     * POST /items/consume/:itemId
     * @param string $itemId Item ID
     * @param array $params Consumption parameters (amount, uniqueId, userId)
     * @return array Message about the operation
     * @throws Exception if not authenticated or request fails
     */
    public function consumeItem($itemId, $params) {
        return $this->request('POST', "/items/consume/$itemId", $params, true);
    }

    /**
     * Update metadata for an item instance.
     * PUT /items/update-metadata/:itemId
     * @param string $itemId Item ID
     * @param string $uniqueId Unique instance ID
     * @param array $metadata New metadata
     * @return array Message about the update
     * @throws Exception if not authenticated or request fails
     */
    public function updateItemMetadata($itemId, $uniqueId, $metadata) {
        return $this->request('PUT', "/items/update-metadata/$itemId", [
            'uniqueId' => $uniqueId,
            'metadata' => $metadata
        ], true);
    }

    /**
     * Drop an item instance from the user's inventory.
     * POST /items/drop/:itemId
     * @param string $itemId Item ID
     * @param array $params Drop parameters (amount, uniqueId)
     * @return array Message about the operation
     * @throws Exception if not authenticated or request fails
     */
    public function dropItem($itemId, $params) {
        return $this->request('POST', "/items/drop/$itemId", $params, true);
    }

    // === LOBBIES ===

    /**
     * Create a new lobby for the authenticated user.
     * POST /lobbies
     * @return array Message about the creation
     * @throws Exception if not authenticated or request fails
     */
    public function createLobby() {
        return $this->request('POST', '/lobbies', null, true);
    }

    /**
     * Get a lobby by its ID.
     * GET /lobbies/:lobbyId
     * @param string $lobbyId Lobby ID
     * @return array Lobby object
     */
    public function getLobby($lobbyId) {
        return $this->request('GET', "/lobbies/$lobbyId");
    }

    /**
     * Get the lobby the authenticated user is in.
     * GET /lobbies/user/@me
     * @return array Lobby object
     * @throws Exception if not authenticated or not in a lobby
     */
    public function getMyLobby() {
        return $this->request('GET', '/lobbies/user/@me', null, true);
    }

    /**
     * Get the lobby a user is in by userId.
     * GET /lobbies/user/:userId
     * @param string $userId User ID
     * @return array Lobby object
     */
    public function getUserLobby($userId) {
        return $this->request('GET', "/lobbies/user/$userId");
    }

    /**
     * Join a lobby by its ID.
     * POST /lobbies/:lobbyId/join
     * @param string $lobbyId Lobby ID
     * @return array Message about the join operation
     * @throws Exception if not authenticated or request fails
     */
    public function joinLobby($lobbyId) {
        return $this->request('POST', "/lobbies/$lobbyId/join", null, true);
    }

    /**
     * Leave a lobby by its ID.
     * POST /lobbies/:lobbyId/leave
     * @param string $lobbyId Lobby ID
     * @return array Message about the leave operation
     * @throws Exception if not authenticated or request fails
     */
    public function leaveLobby($lobbyId) {
        return $this->request('POST', "/lobbies/$lobbyId/leave", null, true);
    }

    // === STUDIOS ===

    /**
     * Create a new studio.
     * POST /studios
     * @param string $studioName Name of the studio
     * @return array Message about the creation
     * @throws Exception if not authenticated or request fails
     */
    public function createStudio($studioName) {
        return $this->request('POST', '/studios', ['studioName' => $studioName], true);
    }

    /**
     * Get a studio by its ID.
     * GET /studios/:studioId
     * @param string $studioId Studio ID
     * @return array Studio object
     */
    public function getStudio($studioId) {
        return $this->request('GET', "/studios/$studioId");
    }

    /**
     * Get all studios the authenticated user is a member of.
     * GET /studios/user/@me
     * @return array List of studios
     * @throws Exception if not authenticated or request fails
     */
    public function getMyStudios() {
        return $this->request('GET', '/studios/user/@me', null, true);
    }

    /**
     * Add a user to a studio.
     * POST /studios/:studioId/add-user
     * @param string $studioId Studio ID
     * @param string $userId User ID to add
     * @return array Message about the operation
     * @throws Exception if not authenticated or request fails
     */
    public function addUserToStudio($studioId, $userId) {
        return $this->request('POST', "/studios/$studioId/add-user", ['userId' => $userId], true);
    }

    /**
     * Remove a user from a studio.
     * POST /studios/:studioId/remove-user
     * @param string $studioId Studio ID
     * @param string $userId User ID to remove
     * @return array Message about the operation
     * @throws Exception if not authenticated or request fails
     */
    public function removeUserFromStudio($studioId, $userId) {
        return $this->request('POST', "/studios/$studioId/remove-user", ['userId' => $userId], true);
    }

    // === TRADES ===

    /**
     * Start a new trade or get the latest pending trade with a user.
     * POST /trades/start-or-latest/:userId
     * @param string $userId User ID to trade with
     * @return array Trade object
     * @throws Exception if not authenticated or request fails
     */
    public function startOrGetPendingTrade($userId) {
        return $this->request('POST', "/trades/start-or-latest/$userId", null, true);
    }

    /**
     * Get a trade by its ID.
     * GET /trades/:id
     * @param string $tradeId Trade ID
     * @return array Trade object
     * @throws Exception if not authenticated or trade not found
     */
    public function getTrade($tradeId) {
        return $this->request('GET', "/trades/$tradeId", null, true);
    }

    /**
     * Get all trades for a user.
     * GET /trades/user/:userId
     * @param string $userId User ID
     * @return array List of trades
     * @throws Exception if not authenticated or request fails
     */
    public function getUserTrades($userId) {
        return $this->request('GET', "/trades/user/$userId", null, true);
    }

    /**
     * Add an item to a trade.
     * POST /trades/:id/add-item
     * @param string $tradeId Trade ID
     * @param array $tradeItem Item to add
     * @return array Message about the operation
     * @throws Exception if not authenticated or request fails
     */
    public function addItemToTrade($tradeId, $tradeItem) {
        return $this->request('POST', "/trades/$tradeId/add-item", ['tradeItem' => $tradeItem], true);
    }

    /**
     * Remove an item from a trade.
     * POST /trades/:id/remove-item
     * @param string $tradeId Trade ID
     * @param array $tradeItem Item to remove
     * @return array Message about the operation
     * @throws Exception if not authenticated or request fails
     */
    public function removeItemFromTrade($tradeId, $tradeItem) {
        return $this->request('POST', "/trades/$tradeId/remove-item", ['tradeItem' => $tradeItem], true);
    }

    /**
     * Approve a trade.
     * PUT /trades/:id/approve
     * @param string $tradeId Trade ID
     * @return array Message about the operation
     * @throws Exception if not authenticated or request fails
     */
    public function approveTrade($tradeId) {
        return $this->request('PUT', "/trades/$tradeId/approve", null, true);
    }

    /**
     * Cancel a trade.
     * PUT /trades/:id/cancel
     * @param string $tradeId Trade ID
     * @return array Message about the operation
     * @throws Exception if not authenticated or request fails
     */
    public function cancelTrade($tradeId) {
        return $this->request('PUT', "/trades/$tradeId/cancel", null, true);
    }

    // === OAUTH2 ===

    /**
     * Get an OAuth2 app by its client ID.
     * GET /oauth2/app/:client_id
     * @param string $clientId Client ID
     * @return array OAuth2 app object
     */
    public function getOAuth2App($clientId) {
        return $this->request('GET', "/oauth2/app/$clientId");
    }

    /**
     * Create a new OAuth2 app.
     * POST /oauth2/app
     * @param string $name App name
     * @param array $redirectUrls Allowed redirect URLs
     * @return array New app's client ID and secret
     * @throws Exception if not authenticated or request fails
     */
    public function createOAuth2App($name, $redirectUrls) {
        return $this->request('POST', '/oauth2/app', [
            'name' => $name,
            'redirect_urls' => $redirectUrls
        ], true);
    }

    /**
     * Get all OAuth2 apps owned by the authenticated user.
     * GET /oauth2/apps
     * @return array List of OAuth2 apps
     * @throws Exception if not authenticated or request fails
     */
    public function getMyOAuth2Apps() {
        return $this->request('GET', '/oauth2/apps', null, true);
    }

    /**
     * Update an OAuth2 app.
     * PATCH /oauth2/app/:client_id
     * @param string $clientId Client ID
     * @param array $data Fields to update (name, redirect_urls)
     * @return array Success status
     * @throws Exception if not authenticated or request fails
     */
    public function updateOAuth2App($clientId, $data) {
        return $this->request('PATCH', "/oauth2/app/$clientId", $data, true);
    }

    /**
     * Delete an OAuth2 app by its client ID.
     * DELETE /oauth2/app/:client_id
     * @param string $clientId Client ID
     * @return array Message about the deletion
     * @throws Exception if not authenticated or request fails
     */
    public function deleteOAuth2App($clientId) {
        return $this->request('DELETE', "/oauth2/app/$clientId", null, true);
    }

    /**
     * Authorize a user for an OAuth2 app.
     * GET /oauth2/authorize
     * @param string $clientId Client ID
     * @param string $redirectUri Redirect URI
     * @return array Authorization code
     * @throws Exception if not authenticated or request fails
     */
    public function authorize($clientId, $redirectUri) {
        return $this->request('GET', '/oauth2/authorize?client_id=' . urlencode($clientId) . '&redirect_uri=' . urlencode($redirectUri), null, true);
    }

    /**
     * Get a user by OAuth2 code and client ID.
     * GET /oauth2/user
     * @param string $code Authorization code
     * @param string $clientId Client ID
     * @return array User object
     */
    public function getUserByOAuth2Code($code, $clientId) {
        return $this->request('GET', '/oauth2/user?code=' . urlencode($code) . '&client_id=' . urlencode($clientId));
    }

    // === UTILS ===

    /**
     * Set the authentication token.
     * @param string $token
     */
    public function setToken($token) {
        $this->token = $token;
    }
    /**
     * Get the authentication token.
     * @return string|null
     */
    public function getToken() {
        return $this->token;
    }
    /**
     * Set the API base URL.
     * @param string $baseUrl
     */
    public function setBaseUrl($baseUrl) {
        $this->baseUrl = rtrim($baseUrl, '/');
    }
    /**
     * Get the API base URL.
     * @return string
     */
    public function getBaseUrl() {
        return $this->baseUrl;
    }
}

?>
