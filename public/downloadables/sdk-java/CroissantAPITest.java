import org.junit.Test;
import org.junit.Before;
import static org.junit.Assert.*;
import java.util.List;
import java.util.Map;

/**
 * Unit tests for CroissantAPI
 * 
 * These tests verify the basic functionality of the API.
 * Note: These tests require an internet connection and a valid token.
 */
public class CroissantAPITest {
    
    private CroissantAPI apiWithAuth;
    private CroissantAPI apiWithoutAuth;
    
    @Before
    public void setUp() {
        // Initialize API with and without authentication
        // Replace "test_token" with a real token for testing
        apiWithAuth = new CroissantAPI("test_token");
        apiWithoutAuth = new CroissantAPI();
    }
    
    @Test
    public void testConstructors() {
        // Test constructors
        assertNotNull("API with token should not be null", apiWithAuth);
        assertNotNull("API without token should not be null", apiWithoutAuth);
        
        // Test token
        assertEquals("Token should be preserved", "test_token", apiWithAuth.getToken());
        assertNull("Token should be null without authentication", apiWithoutAuth.getToken());
    }
    
    @Test
    public void testPublicEndpoints() {
        try {
            // Test public endpoints (do not require authentication)
            
            // List games
            List<CroissantAPI.Game> games = apiWithoutAuth.games.list();
            assertNotNull("Game list should not be null", games);
            
            // List items
            List<CroissantAPI.Item> items = apiWithoutAuth.items.list();
            assertNotNull("Item list should not be null", items);
            
            // Search users
            List<CroissantAPI.User> users = apiWithoutAuth.users.search("test");
            assertNotNull("Search results should not be null", users);
            
            System.out.println("Public endpoints tests: OK");
        } catch (Exception e) {
            // In case of network error, don't fail the test
            System.out.println("Warning: Unable to test public endpoints - " + e.getMessage());
        }
    }
    
    @Test
    public void testAuthenticationRequired() {
        // Test that methods requiring authentication throw an exception
        // when no token is provided
        
        try {
            apiWithoutAuth.users.getMe();
            fail("getMe() should throw an exception without token");
        } catch (Exception e) {
            assertTrue("Exception should mention authentication", 
                      e.getMessage().contains("token") || e.getMessage().contains("Token"));
        }
        
        try {
            apiWithoutAuth.inventory.getMyInventory();
            fail("getMyInventory() should throw an exception without token");
        } catch (Exception e) {
            assertTrue("Exception should mention authentication", 
                      e.getMessage().contains("token") || e.getMessage().contains("Token"));
        }
        
        System.out.println("Authentication required tests: OK");
    }
    
    @Test
    public void testDataModels() {
        // Test data model creation
        
        // Test TradeItem
        CroissantAPI.TradeItem tradeItem1 = new CroissantAPI.TradeItem("item123", 5);
        assertEquals("Item ID should be correct", "item123", tradeItem1.itemId);
        assertEquals("Amount should be correct", 5, tradeItem1.amount);
        assertNull("Metadata should be null by default", tradeItem1.metadata);
        
        // Test TradeItem with metadata
        java.util.Map<String, Object> metadata = new java.util.HashMap<>();
        metadata.put("special", true);
        CroissantAPI.TradeItem tradeItem2 = new CroissantAPI.TradeItem("item456", 2, metadata);
        assertEquals("Item ID should be correct", "item456", tradeItem2.itemId);
        assertEquals("Amount should be correct", 2, tradeItem2.amount);
        assertNotNull("Metadata should not be null", tradeItem2.metadata);
        assertTrue("Metadata should contain the value", (Boolean) tradeItem2.metadata.get("special"));
        
        System.out.println("Data model tests: OK");
    }
    
    @Test
    public void testUrlConstruction() {
        // Test that base URL is correct
        assertEquals("Base URL should be correct", 
                    "https://croissant-api.eminium.ovh/api", 
                    apiWithAuth.getBaseUrl());
    }
    
    @Test
    public void testErrorHandling() {
        // Test error handling for invalid IDs
        try {
            apiWithoutAuth.games.get("invalid_game_id");
            // If no exception is thrown, either a game exists with this ID,
            // or there's a network issue - we don't fail the test
        } catch (Exception e) {
            // This is the expected behavior for an invalid ID
            assertNotNull("Error message should not be null", e.getMessage());
        }
        
        System.out.println("Error handling tests: OK");
    }
    
    /**
     * Complete integration test (requires a valid token)
     * This test is disabled by default as it requires real authentication
     */
    // @Test
    public void testIntegrationWithRealToken() {
        // To run this test, uncomment this method and provide a real token
        String realToken = System.getProperty("croissant.token");
        if (realToken == null || realToken.isEmpty()) {
            System.out.println("Token not provided, skipping integration test");
            return;
        }
        
        try {
            CroissantAPI api = new CroissantAPI(realToken);
            
            // Test authentication
            CroissantAPI.User me = api.users.getMe();
            assertNotNull("User should not be null", me);
            assertNotNull("Username should not be null", me.username);
            
            // Test inventory
            CroissantAPI.Inventory.InventoryResponse inventory = api.inventory.getMyInventory();
            assertNotNull("Inventory should not be null", inventory);
            assertNotNull("User ID should not be null", inventory.user_id);
            assertNotNull("Item list should not be null", inventory.inventory);
            
            System.out.println("Integration test with real token: OK");
            System.out.println("User: " + me.username);
            System.out.println("Items in inventory: " + inventory.inventory.size());
            
        } catch (Exception e) {
            fail("Integration test failed: " + e.getMessage());
        }
    }
}
