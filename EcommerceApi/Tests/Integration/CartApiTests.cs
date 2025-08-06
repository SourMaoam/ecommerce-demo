using System.Net;
using System.Net.Http.Json;
using Xunit;
using EcommerceApi.DTOs;

namespace EcommerceApi.Tests.Integration;

public class CartApiTests : IClassFixture<TestWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory<Program> _factory;
    private readonly string _testUserId = "test-user-123";

    public CartApiTests(TestWebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetCart_EmptyCart_ReturnsEmptyCart()
    {
        // Act
        var response = await _client.GetAsync($"/api/cart/{_testUserId}");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var cart = await response.Content.ReadFromJsonAsync<CartDto>();
        
        Assert.NotNull(cart);
        Assert.Empty(cart.Items);
        Assert.Equal(0, cart.Total);
    }

    [Fact]
    public async Task AddToCart_ValidProduct_AddsItemToCart()
    {
        // Arrange - Get first product ID
        var productsResponse = await _client.GetAsync("/api/products");
        productsResponse.EnsureSuccessStatusCode();
        
        var products = await productsResponse.Content.ReadFromJsonAsync<ProductListResponse>();
        Assert.NotNull(products);
        Assert.True(products.Products.Count > 0, "No products available for testing");
        
        var firstProductId = products.Products[0].Id;
        
        var addCartRequest = new AddToCartRequest
        {
            UserId = _testUserId,
            ProductId = firstProductId,
            Quantity = 2
        };

        // Act
        var addResponse = await _client.PostAsJsonAsync("/api/cart/add", addCartRequest);
        
        // Assert
        addResponse.EnsureSuccessStatusCode();
        
        // Verify cart contents
        var getResponse = await _client.GetAsync($"/api/cart/{_testUserId}");
        getResponse.EnsureSuccessStatusCode();
        var cart = await getResponse.Content.ReadFromJsonAsync<CartDto>();
        
        Assert.NotNull(cart);
        Assert.Single(cart.Items);
        Assert.Equal(firstProductId, cart.Items[0].ProductId);
        Assert.Equal(2, cart.Items[0].Quantity);
        // Expect first product from main seeded data (will be "Laptop Computer" from main app's seeding)
        Assert.NotEmpty(cart.Items[0].ProductName);
        Assert.True(cart.Total > 0);
    }

    [Fact]
    public async Task AddToCart_SameProductTwice_UpdatesQuantity()
    {
        // Arrange - Get second product ID
        var productsResponse = await _client.GetAsync("/api/products");
        var products = await productsResponse.Content.ReadFromJsonAsync<ProductListResponse>();
        var secondProductId = products!.Products[1].Id;
        
        var addCartRequest = new AddToCartRequest
        {
            UserId = _testUserId,
            ProductId = secondProductId,
            Quantity = 1
        };

        // Act - Add same product twice
        await _client.PostAsJsonAsync("/api/cart/add", addCartRequest);
        await _client.PostAsJsonAsync("/api/cart/add", addCartRequest);
        
        // Assert
        var getResponse = await _client.GetAsync($"/api/cart/{_testUserId}");
        getResponse.EnsureSuccessStatusCode();
        var cart = await getResponse.Content.ReadFromJsonAsync<CartDto>();
        
        Assert.NotNull(cart);
        var phoneItem = cart.Items.FirstOrDefault(i => i.ProductId == secondProductId);
        Assert.NotNull(phoneItem);
        Assert.Equal(2, phoneItem.Quantity); // Should be accumulated
    }

    [Fact]
    public async Task AddToCart_InvalidProduct_ReturnsBadRequest()
    {
        // Arrange
        var addCartRequest = new AddToCartRequest
        {
            UserId = _testUserId,
            ProductId = 999, // Non-existent product
            Quantity = 1
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/cart/add", addCartRequest);
        
        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateCartItem_ValidUpdate_UpdatesQuantity()
    {
        // Arrange - Get third product ID and add an item to cart
        var productsResponse = await _client.GetAsync("/api/products");
        var products = await productsResponse.Content.ReadFromJsonAsync<ProductListResponse>();
        var thirdProductId = products!.Products[2].Id;
        
        var addCartRequest = new AddToCartRequest
        {
            UserId = _testUserId,
            ProductId = thirdProductId,
            Quantity = 1
        };
        await _client.PostAsJsonAsync("/api/cart/add", addCartRequest);

        // Get the cart to find the cart item ID
        var getResponse = await _client.GetAsync($"/api/cart/{_testUserId}");
        var cart = await getResponse.Content.ReadFromJsonAsync<CartDto>();
        var cartItemId = cart!.Items[0].Id;

        var updateRequest = new UpdateCartItemRequest { Quantity = 5 };

        // Act
        var updateResponse = await _client.PutAsJsonAsync($"/api/cart/{cartItemId}", updateRequest);
        
        // Assert
        updateResponse.EnsureSuccessStatusCode();
        
        // Verify update
        var updatedCartResponse = await _client.GetAsync($"/api/cart/{_testUserId}");
        var updatedCart = await updatedCartResponse.Content.ReadFromJsonAsync<CartDto>();
        var updatedItem = updatedCart!.Items.FirstOrDefault(i => i.Id == cartItemId);
        
        Assert.NotNull(updatedItem);
        Assert.Equal(5, updatedItem.Quantity);
    }

    [Fact]
    public async Task RemoveCartItem_ValidItem_RemovesFromCart()
    {
        // Arrange - Get first product ID and add item first
        var productsResponse = await _client.GetAsync("/api/products");
        var products = await productsResponse.Content.ReadFromJsonAsync<ProductListResponse>();
        var firstProductId = products!.Products[0].Id;
        
        var addCartRequest = new AddToCartRequest
        {
            UserId = _testUserId + "remove",
            ProductId = firstProductId,
            Quantity = 1
        };
        await _client.PostAsJsonAsync("/api/cart/add", addCartRequest);

        // Get cart item ID
        var getResponse = await _client.GetAsync($"/api/cart/{_testUserId}remove");
        var cart = await getResponse.Content.ReadFromJsonAsync<CartDto>();
        var cartItemId = cart!.Items[0].Id;

        // Act
        var deleteResponse = await _client.DeleteAsync($"/api/cart/{cartItemId}");
        
        // Assert
        deleteResponse.EnsureSuccessStatusCode();
        
        // Verify removal
        var updatedCartResponse = await _client.GetAsync($"/api/cart/{_testUserId}remove");
        var updatedCart = await updatedCartResponse.Content.ReadFromJsonAsync<CartDto>();
        
        Assert.Empty(updatedCart!.Items);
    }

    [Fact]
    public async Task RemoveCartItem_InvalidItemId_ReturnsNotFound()
    {
        // Act
        var response = await _client.DeleteAsync("/api/cart/999");
        
        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetCartCount_EmptyCart_ReturnsZero()
    {
        // Act
        var response = await _client.GetAsync($"/api/cart/{_testUserId}/count");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<dynamic>();
        
        Assert.NotNull(result);
        // Access count property from anonymous object
        var countProperty = ((System.Text.Json.JsonElement)result).GetProperty("count");
        Assert.Equal(0, countProperty.GetInt32());
    }

    [Fact]
    public async Task GetCartCount_WithItems_ReturnsCorrectCount()
    {
        // Arrange - Add items to cart
        var addRequest = new AddToCartDto 
        { 
            UserId = _testUserId, 
            ProductId = 1, 
            Quantity = 2 
        };
        await _client.PostAsJsonAsync("/api/cart/add", addRequest);

        var addRequest2 = new AddToCartDto 
        { 
            UserId = _testUserId, 
            ProductId = 2, 
            Quantity = 3 
        };
        await _client.PostAsJsonAsync("/api/cart/add", addRequest2);

        // Act
        var response = await _client.GetAsync($"/api/cart/{_testUserId}/count");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<dynamic>();
        
        Assert.NotNull(result);
        var countProperty = ((System.Text.Json.JsonElement)result).GetProperty("count");
        Assert.Equal(5, countProperty.GetInt32()); // 2 + 3 = 5 total items
    }

    [Fact]
    public async Task ClearCart_WithItems_RemovesAllItems()
    {
        // Arrange - Add items to cart
        var addRequest = new AddToCartDto 
        { 
            UserId = _testUserId, 
            ProductId = 1, 
            Quantity = 2 
        };
        await _client.PostAsJsonAsync("/api/cart/add", addRequest);

        // Verify cart has items
        var cartResponse = await _client.GetAsync($"/api/cart/{_testUserId}");
        var cart = await cartResponse.Content.ReadFromJsonAsync<CartDto>();
        Assert.NotEmpty(cart!.Items);

        // Act - Clear cart
        var clearResponse = await _client.DeleteAsync($"/api/cart/{_testUserId}/clear");
        
        // Assert
        clearResponse.EnsureSuccessStatusCode();
        
        // Verify cart is empty
        var updatedCartResponse = await _client.GetAsync($"/api/cart/{_testUserId}");
        var updatedCart = await updatedCartResponse.Content.ReadFromJsonAsync<CartDto>();
        Assert.Empty(updatedCart!.Items);
    }

    [Fact]
    public async Task ClearCart_EmptyCart_ReturnsSuccess()
    {
        // Act - Clear empty cart
        var response = await _client.DeleteAsync($"/api/cart/{_testUserId}/clear");
        
        // Assert - Should still return success
        response.EnsureSuccessStatusCode();
    }
}