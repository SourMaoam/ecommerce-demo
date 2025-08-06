using System.Net.Http.Json;
using EcommerceApi.DTOs;

var client = new HttpClient { BaseAddress = new Uri("https://localhost:5001") };

try 
{
    var response = await client.GetAsync("/api/products");
    var responseString = await response.Content.ReadAsStringAsync();
    Console.WriteLine($"Raw Response: {responseString}");
    
    var products = await response.Content.ReadFromJsonAsync<ProductListResponse>();
    Console.WriteLine($"Deserialized: Products count = {products?.Products?.Count}");
    
    if (products?.Products?.Count > 0)
    {
        Console.WriteLine($"First product: {products.Products[0].Name}");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Error: {ex}");
}