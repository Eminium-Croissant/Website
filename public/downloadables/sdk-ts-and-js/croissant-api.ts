const croissantBaseUrl = 'https://croissant-api.fr/api';

export interface Game {
    gameId: string;
    name: string;
    description: string;
    price: number;
    owner_id: string;
    showInStore: boolean;
    iconHash?: string;
    splashHash?: string;
    bannerHash?: string;
    genre?: string;
    release_date?: string;
    developer?: string;
    publisher?: string;
    platforms?: string[];
    rating: number;
    website?: string;
    trailer_link?: string;
    multiplayer: boolean;
    download_link?: string;
}

export interface User {
    userId: string;
    username: string;
    email?: string;
    verified: boolean;
    studios?: Studio[];
    roles?: string[];
    inventory?: InventoryItem[];
    ownedItems?: Item[];
    createdGames?: Game[];
    verificationKey?: string;
    steam_id?: string;
    steam_username?: string;
    steam_avatar_url?: string;
    isStudio?: boolean;
    admin?: boolean;
    disabled?: boolean;
    google_id?: string;
    discord_id?: string;
    balance?: number;
    haveAuthenticator?: boolean;
}

export interface Item {
    itemId: string;
    name: string;
    description: string;
    owner: string;
    price: number;
    iconHash: string;
    showInStore?: boolean;
    deleted?: boolean;
}

export interface InventoryItem {
    user_id?: string;
    item_id?: string;
    amount: number;
    metadata?: Record<string, any>;
    itemId: string;
    name: string;
    description: string;
    iconHash: string;
    price: number;
    owner: string;
    showInStore: boolean;
}

export interface Studio {
    user_id: string;
    username: string;
    verified: boolean;
    admin_id: string;
    isAdmin?: boolean;
    apiKey?: string;
    users?: Array<{
        user_id: string;
        username: string;
        verified: boolean;
        admin: boolean;
    }>;
}

export interface Lobby {
    lobbyId: string;
    users: Array<{
        username: string;
        user_id: string;
        verified: boolean;
        steam_username?: string;
        steam_avatar_url?: string;
        steam_id?: string;
    }>;
}

export interface TradeItem {
    itemId: string;
    amount: number;
    metadata?: Record<string, any>;
}

export interface Trade {
    id: string;
    fromUserId: string;
    toUserId: string;
    fromUserItems: Array<{
        itemId: string;
        name: string;
        description: string;
        iconHash: string;
        amount: number;
    }>;
    toUserItems: Array<{
        itemId: string;
        name: string;
        description: string;
        iconHash: string;
        amount: number;
    }>;
    approvedFromUser: boolean;
    approvedToUser: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface OAuth2App {
    client_id: string;
    client_secret: string;
    name: string;
    redirect_urls: string[];
}

export class CroissantAPI {
    private token?: string;

    
    constructor(params: { token?: string } = {}) {
        this.token = params.token;
    }

    
    users = {
        
        getMe: async (): Promise<User> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/users/@me`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch user');
            return await res.json();
        },

        
        search: async (query: string): Promise<User[]> => {
            const res = await fetch(`${croissantBaseUrl}/users/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) return [];
            return await res.json();
        },

        
        getUser: async (userId: string): Promise<User> => {
            const res = await fetch(`${croissantBaseUrl}/users/${userId}`);
            if (!res.ok) throw new Error('User not found');
            return await res.json();
        },

        
        transferCredits: async (targetUserId: string, amount: number): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/users/transfer-credits`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ targetUserId, amount })
            });
            if (!res.ok) throw new Error('Failed to transfer credits');
            return await res.json();
        },

        
        verify: async (userId: string, verificationKey: string): Promise<{ success: boolean }> => {
            const res = await fetch(`${croissantBaseUrl}/users/auth-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, verificationKey })
            });
            if (!res.ok) return { success: false };
            return await res.json();
        }
    };

    
    games = {
        
        list: async (): Promise<Game[]> => {
            const res = await fetch(`${croissantBaseUrl}/games`);
            if (!res.ok) return [];
            return await res.json();
        },

        
        search: async (query: string): Promise<Game[]> => {
            const res = await fetch(`${croissantBaseUrl}/games/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) return [];
            return await res.json();
        },

        
        getMyCreatedGames: async (): Promise<Game[]> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/games/@mine`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) return [];
            return await res.json();
        },

        
        getMyOwnedGames: async (): Promise<Game[]> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/games/list/@me`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) return [];
            return await res.json();
        },

        
        get: async (gameId: string): Promise<Game> => {
            const res = await fetch(`${croissantBaseUrl}/games/${gameId}`);
            if (!res.ok) throw new Error('Game not found');
            return await res.json();
        }
    };

    
    inventory = {
        
        getMyInventory: async (): Promise<{ user_id: string; inventory: InventoryItem[] }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/inventory/@me`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch inventory');
            return await res.json();
        },

        
        get: async (userId: string): Promise<{ user_id: string; inventory: InventoryItem[] }> => {
            const res = await fetch(`${croissantBaseUrl}/inventory/${userId}`);
            if (!res.ok) throw new Error('Failed to fetch inventory');
            return await res.json();
        }
    };

    
    items = {
        
        list: async (): Promise<Item[]> => {
            const res = await fetch(`${croissantBaseUrl}/items`);
            if (!res.ok) return [];
            return await res.json();
        },

        
        getMyItems: async (): Promise<Item[]> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/items/@mine`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) return [];
            return await res.json();
        },

        
        search: async (query: string): Promise<Item[]> => {
            const res = await fetch(`${croissantBaseUrl}/items/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) return [];
            return await res.json();
        },

        
        get: async (itemId: string): Promise<Item> => {
            const res = await fetch(`${croissantBaseUrl}/items/${itemId}`);
            if (!res.ok) throw new Error('Item not found');
            return await res.json();
        },

        
        create: async (itemData: { name: string; description: string; price: number; iconHash?: string; showInStore?: boolean }): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/items/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(itemData)
            });
            if (!res.ok) throw new Error('Failed to create item');
            return await res.json();
        },

        
        update: async (itemId: string, itemData: Partial<Item>): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/items/update/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(itemData)
            });
            if (!res.ok) throw new Error('Failed to update item');
            return await res.json();
        },

        
        delete: async (itemId: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/items/delete/${itemId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to delete item');
            return await res.json();
        },

        
        buy: async (itemId: string, amount: number): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/items/buy/${itemId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ amount })
            });
            if (!res.ok) throw new Error('Failed to buy item');
            return await res.json();
        },

        
        sell: async (itemId: string, amount: number): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/items/sell/${itemId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ amount })
            });
            if (!res.ok) throw new Error('Failed to sell item');
            return await res.json();
        },

        
        give: async (itemId: string, amount: number, userId: string, metadata?: Record<string, any>): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const body: any = { amount, userId };
            if (metadata) body.metadata = metadata;
            const res = await fetch(`${croissantBaseUrl}/items/give/${itemId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error('Failed to give item');
            return await res.json();
        },

        
        consume: async (itemId: string, params: { amount?: number; uniqueId?: string; userId: string }): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/items/consume/${itemId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(params)
            });
            if (!res.ok) throw new Error('Failed to consume item');
            return await res.json();
        },

        
        updateMetadata: async (itemId: string, uniqueId: string, metadata: Record<string, any>): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/items/update-metadata/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ uniqueId, metadata })
            });
            if (!res.ok) throw new Error('Failed to update metadata');
            return await res.json();
        },

        
        drop: async (itemId: string, params: { amount?: number; uniqueId?: string }): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/items/drop/${itemId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(params)
            });
            if (!res.ok) throw new Error('Failed to drop item');
            return await res.json();
        }
    };

    
    lobbies = {
        
        create: async (): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/lobbies`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to create lobby');
            return await res.json();
        },

        
        get: async (lobbyId: string): Promise<Lobby> => {
            const res = await fetch(`${croissantBaseUrl}/lobbies/${lobbyId}`);
            if (!res.ok) throw new Error('Lobby not found');
            return await res.json();
        },

        
        getMyLobby: async (): Promise<Lobby> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/lobbies/user/@me`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('User not in any lobby');
            return await res.json();
        },

        
        getUserLobby: async (userId: string): Promise<Lobby> => {
            const res = await fetch(`${croissantBaseUrl}/lobbies/user/${userId}`);
            if (!res.ok) throw new Error('User not in any lobby');
            return await res.json();
        },

        
        join: async (lobbyId: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/lobbies/${lobbyId}/join`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to join lobby');
            return await res.json();
        },

        
        leave: async (lobbyId: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/lobbies/${lobbyId}/leave`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to leave lobby');
            return await res.json();
        }
    };

    
    studios = {
        
        create: async (studioName: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/studios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ studioName })
            });
            if (!res.ok) throw new Error('Failed to create studio');
            return await res.json();
        },

        
        get: async (studioId: string): Promise<Studio> => {
            const res = await fetch(`${croissantBaseUrl}/studios/${studioId}`);
            if (!res.ok) throw new Error('Studio not found');
            return await res.json();
        },

        
        getMyStudios: async (): Promise<Studio[]> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/studios/user/@me`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch studios');
            return await res.json();
        },

        
        addUser: async (studioId: string, userId: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/studios/${studioId}/add-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ userId })
            });
            if (!res.ok) throw new Error('Failed to add user to studio');
            return await res.json();
        },

        
        removeUser: async (studioId: string, userId: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/studios/${studioId}/remove-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ userId })
            });
            if (!res.ok) throw new Error('Failed to remove user from studio');
            return await res.json();
        }
    };

    
    trades = {
        
        startOrGetPending: async (userId: string): Promise<Trade> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/trades/start-or-latest/${userId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to start or get trade');
            return await res.json();
        },

        
        get: async (tradeId: string): Promise<Trade> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/trades/${tradeId}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Trade not found');
            return await res.json();
        },

        
        getUserTrades: async (userId: string): Promise<Trade[]> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/trades/user/${userId}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch trades');
            return await res.json();
        },

        
        addItem: async (tradeId: string, tradeItem: TradeItem): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/trades/${tradeId}/add-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ tradeItem })
            });
            if (!res.ok) throw new Error('Failed to add item to trade');
            return await res.json();
        },

        
        removeItem: async (tradeId: string, tradeItem: TradeItem): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/trades/${tradeId}/remove-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ tradeItem })
            });
            if (!res.ok) throw new Error('Failed to remove item from trade');
            return await res.json();
        },

        
        approve: async (tradeId: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/trades/${tradeId}/approve`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to approve trade');
            return await res.json();
        },

        
        cancel: async (tradeId: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/trades/${tradeId}/cancel`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to cancel trade');
            return await res.json();
        }
    };

    
    oauth2 = {
        
        getApp: async (client_id: string): Promise<OAuth2App> => {
            const res = await fetch(`${croissantBaseUrl}/oauth2/app/${client_id}`);
            if (!res.ok) throw new Error('OAuth2 app not found');
            return await res.json();
        },

        
        createApp: async (name: string, redirect_urls: string[]): Promise<{ client_id: string; client_secret: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/oauth2/app`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ name, redirect_urls })
            });
            if (!res.ok) throw new Error('Failed to create OAuth2 app');
            return await res.json();
        },

        
        getMyApps: async (): Promise<OAuth2App[]> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/oauth2/apps`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch OAuth2 apps');
            return await res.json();
        },

        
        updateApp: async (client_id: string, data: { name?: string; redirect_urls?: string[] }): Promise<{ success: boolean }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/oauth2/app/${client_id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update OAuth2 app');
            return await res.json();
        },

        
        deleteApp: async (client_id: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/oauth2/app/${client_id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to delete OAuth2 app');
            return await res.json();
        },

        
        authorize: async (client_id: string, redirect_uri: string): Promise<{ code: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/oauth2/authorize?client_id=${encodeURIComponent(client_id)}&redirect_uri=${encodeURIComponent(redirect_uri)}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to authorize');
            return await res.json();
        },

        
        getUserByCode: async (code: string, client_id: string): Promise<User> => {
            const res = await fetch(`${croissantBaseUrl}/oauth2/user?code=${encodeURIComponent(code)}&client_id=${encodeURIComponent(client_id)}`);
            if (!res.ok) throw new Error('Failed to fetch user by code');
            return await res.json();
        }
    };
}

export default CroissantAPI;
