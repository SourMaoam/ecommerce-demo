using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
using EcommerceApi.Data;
using EcommerceApi.Models;
using EcommerceApi.DTOs;

namespace EcommerceApi.Tests.Integration;

public class ProductsApiTests : IClassFixture<TestWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory<Program> _factory;

    public ProductsApiTests(TestWebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetProducts_ReturnsProducts()
    {
        // Act
        var response = await _client.GetAsync("/api/products");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var products = await response.Content.ReadFromJsonAsync<ProductListResponse>();
        
        Assert.NotNull(products);
        Assert.True(products.Products.Count >= 3);
        Assert.True(products.Total >= 3);
        Assert.Equal(1, products.Page);
        Assert.Equal(10, products.Limit);
    }

    [Fact]
    public async Task GetProducts_WithSearch_ReturnsFilteredProducts()
    {
        // Act
        var response = await _client.GetAsync("/api/products?search=laptop");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var products = await response.Content.ReadFromJsonAsync<ProductListResponse>();
        
        Assert.NotNull(products);
        Assert.Single(products.Products);
        Assert.Contains("Laptop", products.Products[0].Name);
    }

    [Fact]
    public async Task GetProducts_WithCategory_ReturnsFilteredProducts()
    {
        // Act
        var response = await _client.GetAsync("/api/products?category=Electronics");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var products = await response.Content.ReadFromJsonAsync<ProductListResponse>();
        
        Assert.NotNull(products);
        Assert.True(products.Products.Count >= 2);
        Assert.All(products.Products, p => Assert.Equal("Electronics", p.Category));
    }

    [Fact]
    public async Task GetProducts_WithPriceRange_ReturnsFilteredProducts()
    {
        // Act
        var response = await _client.GetAsync("/api/products?minPrice=500&maxPrice=1000");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var products = await response.Content.ReadFromJsonAsync<ProductListResponse>();
        
        Assert.NotNull(products);
        Assert.All(products.Products, p => 
        {
            Assert.True(p.Price >= 500);
            Assert.True(p.Price <= 1000);
        });
    }

    [Fact]
    public async Task GetProducts_WithPagination_ReturnsCorrectPage()
    {
        // Act
        var response = await _client.GetAsync("/api/products?page=1&limit=2");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var products = await response.Content.ReadFromJsonAsync<ProductListResponse>();
        
        Assert.NotNull(products);
        Assert.True(products.Products.Count <= 2);
        Assert.Equal(1, products.Page);
        Assert.Equal(2, products.Limit);
    }

    [Fact]
    public async Task GetProduct_WithValidId_ReturnsProduct()
    {
        // Arrange - Get the first product ID
        var allProductsResponse = await _client.GetAsync("/api/products");
        var allProducts = await allProductsResponse.Content.ReadFromJsonAsync<ProductListResponse>();
        var firstProductId = allProducts!.Products[0].Id;

        // Act
        var response = await _client.GetAsync($"/api/products/{firstProductId}");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var product = await response.Content.ReadFromJsonAsync<ProductDto>();
        
        Assert.NotNull(product);
        Assert.Equal(firstProductId, product.Id);
        Assert.Equal("Test Laptop", product.Name);
    }

    [Fact]
    public async Task GetProduct_WithInvalidId_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/products/999");
        
        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CreateProduct_WithValidData_CreatesProduct()
    {
        // Arrange
        var newProduct = new ProductDto
        {
            Name = "New Test Product",
            Price = 199.99m,
            Description = "A new test product",
            Category = "Test Category",
            ImageUrl = "https://example.com/new-product.jpg",
            StockQuantity = 20
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/products", newProduct);
        
        // Assert
        response.EnsureSuccessStatusCode();
        var createdProduct = await response.Content.ReadFromJsonAsync<ProductDto>();
        
        Assert.NotNull(createdProduct);
        Assert.Equal(newProduct.Name, createdProduct.Name);
        Assert.Equal(newProduct.Price, createdProduct.Price);
        Assert.Equal(newProduct.Category, createdProduct.Category);
        Assert.True(createdProduct.Id > 0);
    }

    [Fact]
    public async Task CreateProduct_WithInvalidData_ReturnsBadRequest()
    {
        // Arrange - Missing required Name field
        var invalidProduct = new ProductDto
        {
            Price = 199.99m,
            Description = "A product without name",
            Category = "Test Category"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/products", invalidProduct);
        
        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}