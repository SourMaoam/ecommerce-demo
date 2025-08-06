using System.Net;
using System.Net.Http.Json;
using Xunit;
using EcommerceApi.DTOs;

namespace EcommerceApi.Tests.Integration;

public class OrdersApiTests : IClassFixture<TestWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory<Program> _factory;
    private readonly string _testUserId = "test-order-user-123";

    public OrdersApiTests(TestWebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateOrder_WithValidCartItems_CreatesOrder()
    {
        // Arrange - Get product IDs and add items to cart first
        var productsResponse = await _client.GetAsync("/api/products");
        var products = await productsResponse.Content.ReadFromJsonAsync<ProductListResponse>();
        var firstProductId = products!.Products[0].Id;
        var secondProductId = products.Products[1].Id;
        
        var addCartRequest1 = new AddToCartRequest
        {
            UserId = _testUserId,
            ProductId = firstProductId,
            Quantity = 2
        };
        var addCartRequest2 = new AddToCartRequest
        {
            UserId = _testUserId,
            ProductId = secondProductId,
            Quantity = 1
        };

        await _client.PostAsJsonAsync("/api/cart/add", addCartRequest1);
        await _client.PostAsJsonAsync("/api/cart/add", addCartRequest2);

        // Get cart to find cart item IDs
        var cartResponse = await _client.GetAsync($"/api/cart/{_testUserId}");
        var cart = await cartResponse.Content.ReadFromJsonAsync<CartDto>();
        var cartItemIds = cart!.Items.Select(i => i.Id).ToArray();

        var createOrderRequest = new CreateOrderRequest
        {
            UserId = _testUserId,
            CartItemIds = cartItemIds.ToList(),
            ShippingAddress = "123 Test Street, Test City, Test State 12345",
            PaymentMethod = "Credit Card"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/orders", createOrderRequest);
        
        // Assert
        response.EnsureSuccessStatusCode();
        var order = await response.Content.ReadFromJsonAsync<OrderDto>();
        
        Assert.NotNull(order);
        Assert.Equal(_testUserId, order.UserId);
        Assert.Equal("Pending", order.Status.ToString());
        Assert.Equal("123 Test Street, Test City, Test State 12345", order.ShippingAddress);
        Assert.Equal("Credit Card", order.PaymentMethod);
        Assert.Equal(2, order.Items.Count);
        Assert.True(order.Total > 0);
        Assert.True(order.CreatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public async Task CreateOrder_WithEmptyCartItems_ReturnsBadRequest()
    {
        // Arrange
        var createOrderRequest = new CreateOrderRequest
        {
            UserId = _testUserId,
            CartItemIds = new List<int>(),
            ShippingAddress = "123 Test Street",
            PaymentMethod = "Credit Card"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/orders", createOrderRequest);
        
        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateOrder_WithInvalidCartItems_ReturnsBadRequest()
    {
        // Arrange
        var createOrderRequest = new CreateOrderRequest
        {
            UserId = _testUserId,
            CartItemIds = new List<int> { 999, 998 }, // Non-existent cart items
            ShippingAddress = "123 Test Street",
            PaymentMethod = "Credit Card"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/orders", createOrderRequest);
        
        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateOrder_WithMissingShippingAddress_ReturnsBadRequest()
    {
        // Arrange
        var createOrderRequest = new CreateOrderRequest
        {
            UserId = _testUserId,
            CartItemIds = new List<int> { 1 },
            ShippingAddress = "", // Empty shipping address
            PaymentMethod = "Credit Card"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/orders", createOrderRequest);
        
        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetUserOrders_WithValidUser_ReturnsOrders()
    {
        // Arrange - Create an order first
        var orderUserId = _testUserId + "-orders";
        
        // Get product ID and add item to cart
        var productsResponse = await _client.GetAsync("/api/products");
        var products = await productsResponse.Content.ReadFromJsonAsync<ProductListResponse>();
        var thirdProductId = products!.Products[2].Id;
        
        var addCartRequest = new AddToCartRequest
        {
            UserId = orderUserId,
            ProductId = thirdProductId,
            Quantity = 1
        };
        await _client.PostAsJsonAsync("/api/cart/add", addCartRequest);

        // Get cart item ID
        var cartResponse = await _client.GetAsync($"/api/cart/{orderUserId}");
        var cart = await cartResponse.Content.ReadFromJsonAsync<CartDto>();
        var cartItemId = cart!.Items[0].Id;

        // Create order
        var createOrderRequest = new CreateOrderRequest
        {
            UserId = orderUserId,
            CartItemIds = new List<int> { cartItemId },
            ShippingAddress = "456 Order Street",
            PaymentMethod = "Debit Card"
        };
        await _client.PostAsJsonAsync("/api/orders", createOrderRequest);

        // Act
        var response = await _client.GetAsync($"/api/orders/{orderUserId}");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var orders = await response.Content.ReadFromJsonAsync<List<OrderDto>>();
        
        Assert.NotNull(orders);
        Assert.NotEmpty(orders);
        
        var order = orders[0];
        Assert.Equal(orderUserId, order.UserId);
        Assert.Equal("456 Order Street", order.ShippingAddress);
        Assert.Single(order.Items);
    }

    [Fact]
    public async Task GetUserOrders_WithNoOrders_ReturnsEmptyList()
    {
        // Act
        var response = await _client.GetAsync($"/api/orders/user-with-no-orders");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var orders = await response.Content.ReadFromJsonAsync<List<OrderDto>>();
        
        Assert.NotNull(orders);
        Assert.Empty(orders);
    }

    [Fact]
    public async Task GetUserOrders_AfterOrderCreation_CartIsCleared()
    {
        // Arrange
        var clearCartUserId = _testUserId + "-clear";
        
        // Get product ID and add items to cart
        var productsResponse = await _client.GetAsync("/api/products");
        var products = await productsResponse.Content.ReadFromJsonAsync<ProductListResponse>();
        var firstProductId = products!.Products[0].Id;
        
        var addCartRequest = new AddToCartRequest
        {
            UserId = clearCartUserId,
            ProductId = firstProductId,
            Quantity = 1
        };
        await _client.PostAsJsonAsync("/api/cart/add", addCartRequest);

        // Get cart item ID
        var cartResponse = await _client.GetAsync($"/api/cart/{clearCartUserId}");
        var cart = await cartResponse.Content.ReadFromJsonAsync<CartDto>();
        var cartItemId = cart!.Items[0].Id;

        // Create order
        var createOrderRequest = new CreateOrderRequest
        {
            UserId = clearCartUserId,
            CartItemIds = new List<int> { cartItemId },
            ShippingAddress = "789 Clear Street",
            PaymentMethod = "Cash"
        };

        // Act
        await _client.PostAsJsonAsync("/api/orders", createOrderRequest);
        
        // Assert - Cart should be empty after order creation
        var updatedCartResponse = await _client.GetAsync($"/api/cart/{clearCartUserId}");
        var updatedCart = await updatedCartResponse.Content.ReadFromJsonAsync<CartDto>();
        
        Assert.Empty(updatedCart!.Items);
        Assert.Equal(0, updatedCart.Total);
    }
}