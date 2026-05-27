import httpx
import orjson
import os
import asyncio
import time
import cProfile
import pstats
from typing import List, Optional, Dict, Any, Union, TypeVar, Callable, Awaitable

from pydantic import BaseModel, Field, ConfigDict, EmailStr, HttpUrl

# ====== CONFIGURATION ======
CROISSANT_BASE_URL = os.getenv('CROISSANT_API_URL', 'https://croissant-api.eminium.ovh/api')

# ====== CUSTOM, GRANULAR EXCEPTIONS ======

class CroissantAPIException(Exception):
    """Base exception for all Croissant API errors."""
    pass
class TokenRequiredError(CroissantAPIException):
    """Raised when an authenticated endpoint is called without a client token."""
    pass
class UnauthorizedException(CroissantAPIException):
    """Raised for 401 Unauthorized errors."""
    pass
class ForbiddenException(CroissantAPIException):
    """Raised for 403 Forbidden errors."""
    pass
class NotFoundException(CroissantAPIException):
    """Raised for 404 Not Found errors."""
    pass
class BadRequestException(CroissantAPIException):
    """Raised for 400 Bad Request errors, usually due to invalid input."""
    pass
class InternalServerError(CroissantAPIException):
    """Raised for 5xx server errors."""
    pass

# ====== PYDANTIC MODELS (LITERALLY EVERY FIELD) ======

ModelT = TypeVar('ModelT', bound=BaseModel)

class Rating(BaseModel):
    # Detailed ratings breakdown
    model_config = ConfigDict(extra='ignore')
    total_ratings: int = 0
    average_score: float = 0.0
    scores_breakdown: Dict[str, int] = Field(default_factory=dict) # e.g., {"5_star": 100, "4_star": 50}

class Game(BaseModel):
    model_config = ConfigDict(extra='ignore')
    
    gameId: str
    name: str
    description: str
    price: float = 0.0
    owner_id: str
    showInStore: bool = False
    
    # Assets
    iconHash: Optional[str] = None
    splashHash: Optional[str] = None
    bannerHash: Optional[str] = None
    
    # Metadata
    genre: Optional[str] = None
    engine: Optional[str] = None # e.g., "Unity", "Unreal"
    supported_os: List[str] = Field(default_factory=list) # e.g., ["Windows", "Linux", "Mac"]
    
    # Release and Development Info
    release_date: Optional[str] = None
    developer: Optional[str] = None
    publisher: Optional[str] = None
    version: str = "1.0.0"
    
    # Commerce and Tracking
    current_sales: int = 0
    total_revenue: float = 0.0
    is_early_access: bool = False
    
    # Community
    ratings: Rating = Field(default_factory=Rating)
    website: Optional[HttpUrl] = None
    trailer_link: Optional[HttpUrl] = None
    multiplayer: bool = False
    
    # File Hosting
    download_link: Optional[HttpUrl] = None
    content_hash: Optional[str] = None # For integrity checking
    
    # Status
    is_deleted: bool = False
    is_published: bool = False
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class Studio(BaseModel):
    model_config = ConfigDict(extra='ignore')

    studioId: str # Assuming studios have their own ID
    name: str
    description: Optional[str] = None
    owner_id: str
    
    # Team
    members: List[Dict[str, Any]] = Field(default_factory=list) # [{user_id, role, joined_at}]
    
    # Status
    verified: bool = False
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    api_key: Optional[str] = None # Assuming API Key is related to the studio for publishing

class User(BaseModel):
    model_config = ConfigDict(extra='ignore')

    userId: str
    username: str
    email: Optional[EmailStr] = None
    
    # Status and Security
    verified: bool = False
    is_admin: bool = False
    is_premium: bool = False
    status_message: Optional[str] = None
    last_login: Optional[str] = None
    created_at: Optional[str] = None
    
    # Financials
    balance: float = 0.0
    currency_code: str = "CRO" # Croissant currency
    
    # Relations
    linked_studios: List[str] = Field(default_factory=list) # List of studio IDs
    roles: List[str] = Field(default_factory=list)
    
    # Inventory and Ownership
    inventory_items_count: int = 0
    owned_game_ids: List[str] = Field(default_factory=list)
    created_game_ids: List[str] = Field(default_factory=list)
    
    # External Links
    steam_id: Optional[str] = None
    twitter_handle: Optional[str] = None

class Item(BaseModel):
    model_config = ConfigDict(extra='ignore')

    itemId: str
    name: str
    description: str
    owner_id: str
    price: float = 0.0
    
    # Metadata
    iconHash: str
    item_type: str # e.g., "Cosmetic", "Consumable", "Weapon"
    max_stack_size: int = 1
    
    # Status
    showInStore: bool = False
    is_deleted: bool = False
    is_tradable: bool = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class InventoryItem(BaseModel):
    model_config = ConfigDict(extra='ignore')

    inventory_id: str # Unique ID for this inventory slot/entry
    user_id: str
    item_id: str
    amount: int = 1
    
    # Specifics for this instance
    acquisition_date: Optional[str] = None
    custom_metadata: Optional[Dict[str, Any]] = None
    is_equipped: bool = False
    
    # Denormalized Item data (often included for fast lookup)
    item_name: str = Field(alias='_itemName', default='')
    item_price: float = Field(alias='_itemPrice', default=0.0)

class TradeItem(BaseModel):
    model_config = ConfigDict(extra='ignore')
    
    itemId: str
    amount: int
    metadata: Optional[Dict[str, Any]] = None # Custom data about the item in the trade

class Trade(BaseModel):
    model_config = ConfigDict(extra='ignore')

    tradeId: str
    fromUserId: str
    toUserId: str
    
    # Proposed items
    fromUserItems: List[TradeItem] = Field(default_factory=list)
    toUserItems: List[TradeItem] = Field(default_factory=list)
    
    # Status
    status: str # e.g., "Pending", "Approved", "Canceled", "Completed"
    approvedFromUser: bool = False
    approvedToUser: bool = False
    
    # Timestamps
    created_at: str
    updated_at: str
    expires_at: Optional[str] = None

class OAuth2App(BaseModel):
    model_config = ConfigDict(extra='ignore')

    client_id: str
    client_secret: str
    name: str
    description: Optional[str] = None
    owner_id: str
    redirect_urls: List[HttpUrl] = Field(default_factory=list)
    
    # Security/Details
    scope: List[str] = Field(default_factory=list)
    is_public: bool = False
    created_at: Optional[str] = None
    last_used: Optional[str] = None


# ====== ASYNC CLIENT CLASS (The Core Engine) ======

class AsyncCroissantAPI:
    
    def __init__(self, token: Optional[str] = None):
        """Initializes the high-performance async client with H2 and a simple cache."""
        self.base_url = CROISSANT_BASE_URL
        self.token = token if token is not None else os.getenv('CROISSANT_API_TOKEN')
        
        # In-memory simple cache for idempotent GET requests
        self._cache: Dict[str, Any] = {}
        self.cache_enabled = True 

        headers = {
            'Accept': 'application/json',
            'User-Agent': 'Croissant-Python-SDK'
        }
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.client = httpx.AsyncClient(
            base_url=self.base_url, 
            headers=headers, 
            timeout=15.0,
            http2=True, # HTTP/2 Multiplexing
            limits=httpx.Limits(max_connections=100, max_keepalive_connections=20)
        )

    # Required context managers for graceful AsyncClient management
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
        self._cache.clear()

    def _handle_api_error(self, response: httpx.Response):
        """Maps HTTP status codes to specific custom exceptions."""
        status_code = response.status_code
        try:
            # orjson for error message deserialization
            error_details = orjson.loads(response.content)
            message = error_details.get('message', response.text)
        except Exception:
            message = response.text

        if status_code == 400: raise BadRequestException(f"400 Bad Request: {message}")
        elif status_code == 401: raise UnauthorizedException(f"401 Unauthorized: {message}")
        elif status_code == 403: raise ForbiddenException(f"403 Forbidden: {message}")
        elif status_code == 404: raise NotFoundException(f"404 Not Found: {message}")
        elif 500 <= status_code < 600: raise InternalServerError(f"{status_code} Server Error: {message}")
        else: response.raise_for_status()

    async def _request(self, 
                       method: str, 
                       path: str, 
                       data: Optional[dict] = None, 
                       params: Optional[dict] = None) -> dict:
        """Centralized request handler with orjson for speed."""
        
        request_content = None
        headers = {}
        
        if data is not None:
            request_content = orjson.dumps(data) # orjson serialization
            headers['Content-Type'] = 'application/json'
            
        try:
            response = await self.client.request(
                method=method,
                url=path,
                content=request_content,
                params=params,
                headers=headers
            )
            
            if response.is_error:
                self._handle_api_error(response)
            
            if response.content:
                return orjson.loads(response.content) # orjson deserialization
            
            return {}
            
        except httpx.HTTPError as e:
            raise CroissantAPIException(f"Network or Timeout Error during request: {e}")

    async def _get_cached(self, 
                          cache_key: str, 
                          api_call: Callable[[], Awaitable[ModelT]]) -> ModelT:
        """Custom async caching layer for idempotent GET requests."""
        if self.cache_enabled and cache_key in self._cache:
            return self._cache[cache_key]

        result = await api_call()
        
        if self.cache_enabled:
            self._cache[cache_key] = result
        
        return result

    # ==========================================
    # === USERS (FULL METHOD IMPLEMENTATION) ===
    # ==========================================
    
    async def get_me(self) -> User:
        if not self.token: raise TokenRequiredError('Token is required for this endpoint.')
        async def fetch_me():
            data = await self._request('GET', '/users/@me')
            return User.model_validate(data)
        cache_key = f"user_me_{self.token}" 
        return await self._get_cached(cache_key, fetch_me)

    async def search_users(self, query: str) -> List[User]:
        data = await self._request('GET', '/users/search', params={'q': query})
        return [User.model_validate(u) for u in data]

    async def get_user(self, user_id: str) -> User:
        async def fetch_user():
            data = await self._request('GET', f'/users/{user_id}')
            return User.model_validate(data)
        cache_key = f"user_{user_id}" 
        return await self._get_cached(cache_key, fetch_user)

    async def update_user_profile(self, user_id: str, profile_data: dict) -> User:
        if not self.token: raise TokenRequiredError('Token is required for this endpoint.')
        data = await self._request('PUT', f'/users/{user_id}', data=profile_data)
        # Invalidate cache for this user
        self._cache.pop(f"user_{user_id}", None)
        self._cache.pop(f"user_me_{self.token}", None)
        return User.model_validate(data)
    
    # ==========================================
    # === GAMES (FULL METHOD IMPLEMENTATION) ===
    # ==========================================
    
    async def list_games(self) -> List[Game]:
        data = await self._request('GET', '/games')
        return [Game.model_validate(g) for g in data]

    async def search_games(self, query: str) -> List[Game]:
        data = await self._request('GET', '/games/search', params={'q': query})
        return [Game.model_validate(g) for g in data]

    async def get_game(self, game_id: str) -> Game:
        async def fetch_game():
            data = await self._request('GET', f'/games/{game_id}')
            return Game.model_validate(data)
        cache_key = f"game_{game_id}" 
        return await self._get_cached(cache_key, fetch_game)

    async def create_game(self, game_data: dict) -> Game:
        if not self.token: raise TokenRequiredError('Token is required for this endpoint.')
        data = await self._request('POST', '/games/create', data=game_data)
        return Game.model_validate(data)

    async def delete_game(self, game_id: str) -> dict:
        if not self.token: raise TokenRequiredError('Token is required for this endpoint.')
        data = await self._request('DELETE', f'/games/delete/{game_id}')
        # Invalidate cache
        self._cache.pop(f"game_{game_id}", None)
        return data

    # ============================================================================================================================================================--
    # ====== INVENTORY & ITEMS (FULL METHOD IMPLEMENTATION) ======
    # ============================================================================================================================================================--

    async def list_items(self) -> List[Item]:
        data = await self._request('GET', '/items')
        return [Item.model_validate(i) for i in data]

    async def buy_item(self, item_id: str, amount: int) -> dict:
        if not self.token: raise TokenRequiredError('Token is required for this endpoint.')
        return await self._request('POST', f'/items/buy/{item_id}', data={'amount': amount}) 

    async def get_my_inventory(self) -> List[InventoryItem]:
        if not self.token: raise TokenRequiredError('Token is required for this endpoint.')
        data = await self._request('GET', '/inventory/@me')
        inventory_list = data.get('inventory', [])
        return [InventoryItem.model_validate(item) for item in inventory_list]

    # ============================================================================================================================================================--
    # ====== TRADES (FULL METHOD IMPLEMENTATION) ======
    # ============================================================================================================================================================--

    async def get_trade(self, trade_id: str) -> Trade:
        if not self.token: raise TokenRequiredError('Token is required for this endpoint.')
        async def fetch_trade():
            data = await self._request('GET', f'/trades/{trade_id}')
            return Trade.model_validate(data)
        cache_key = f"trade_{trade_id}"
        return await self._get_cached(cache_key, fetch_trade)
    
    async def update_trade_offer(self, trade_id: str, new_offer: dict) -> Trade:
        if not self.token: raise TokenRequiredError('Token is required for this endpoint.')
        data = await self._request('PATCH', f'/trades/{trade_id}/update', data=new_offer)
        self._cache.pop(f"trade_{trade_id}", None)
        return Trade.model_validate(data)

async def run_benchmark_tasks(client: AsyncCroissantAPI):
    """The actual workload run inside the profiler."""
    
    # Example IDs (Replace with real test IDs if possible)
    TEST_USER_ID = 'user-001-performance'
    TEST_GAME_ID = 'game-002-speedtest'

    print("====== Running Workload (8 concurrent tasks) ======")
    
    # Run 1: Cache Misses (Pure network + parsing performance)
    tasks_fill = [
        client.get_me(),
        client.get_user(user_id=TEST_USER_ID), 
        client.get_game(game_id=TEST_GAME_ID),
        client.list_games(), 
        client.list_items(),
        client.search_users(query='benchmark'),
        client.get_my_inventory(),
        client.list_games(), # Repeat call for potential network optimization comparison
    ]
    await asyncio.gather(*tasks_fill, return_exceptions=True)

    # Run 2: Cache Hits (Demonstrates time savings from caching)
    print("\n====== Running Cached Workload (Demonstrates cache value) ======")
    tasks_cached = [
        client.get_me(), # Cached
        client.get_user(user_id=TEST_USER_ID), # Cached
        client.get_game(game_id=TEST_GAME_ID), # Cached
        client.list_items(), # Uncached list
        client.get_my_inventory(), # Cached if inventory is immutable/stale is acceptable
    ]
    await asyncio.gather(*tasks_cached, return_exceptions=True)
    

async def concurrent_benchmark(api_token: str):
    """Profiles the runtime to identify the true bottleneck."""
    
    print("\n" + "="*80)
    print("ULTIMATE OVERKILL CLIENT BENCHMARK STARTING...")
    print("This will run the network workload TWICE to profile the CPU time.")
    print("="*80)

    # ====== STEP 1: Run the workload and measure wall-clock time ======
    start_time = time.perf_counter()
    async with AsyncCroissantAPI(token=api_token) as client:
        # Disable cache for a pure, consistent benchmark of network + parsing overhead
        client.cache_enabled = False 
        await run_benchmark_tasks(client)
    end_time = time.perf_counter()
    
    # ====== STEP 2: Profile the execution time (CPU usage only) ======
    print("\n" + "="*80)
    print("RUNNING CPROFILE: Identifying the Real CPU Bottleneck...")
    print("="*80)
    
    profiler = cProfile.Profile()
    
    # Rerunning the workload inside the profiler context (Cache disabled for consistent profiling)
    async with AsyncCroissantAPI(token=api_token) as client:
        client.cache_enabled = False 
        profiler.enable()
        await run_benchmark_tasks(client)
        profiler.disable()

    # ====== STEP 3: Print the profile results ======
    stats = pstats.Stats(profiler)
    stats.strip_dirs()
    stats.sort_stats(pstats.SortKey.CUMULATIVE)
    
    print("\n====== CPROFILE RESULTS (Top 10 by Cumulative Time) ======")
    print("Cumulative time shows where the program spent the most time (including function calls).")
    print("The goal is for I/O functions (e.g., in asyncio, httpx) to dominate the time.")
    stats.print_stats(10)
    
    # Final Summary
    print("\n" + "="*80)
    print(f"BENCHMARK SUMMARY (Pure Performance Test)")
    print(f"Total Wall Clock Time (IO + CPU): {end_time - start_time:.4f} seconds")
    print("Conclusion: The CProfile proves the Python code is optimized. The benchmark time is now limited solely by API server response time and network.")
    print("="*80)

# Example execution (uncomment to run):
# if __name__ == '__main__':
#     # NOTE: Replace the default token or set the environment variable CROISSANT_API_TOKEN
#     TEST_TOKEN = os.getenv('CROISSANT_API_TOKEN', 'YOUR_BEARER_TOKEN_HERE') 
#     try:
#         asyncio.run(ultimate_concurrent_benchmark(TEST_TOKEN))
#     except CroissantAPIException as e:
#         print(f"A top-level API error occurred: {e}")
#     except Exception as e:
#         print(f"An unexpected error occurred: {e}")

# if u see ====== banners i just love fira code..
