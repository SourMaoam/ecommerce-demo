using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using EcommerceApi.Data;
using EcommerceApi.Models;

namespace EcommerceApi.Tests.Integration;

public class TestWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove the existing DbContext registration
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<EcommerceDbContext>));
            if (descriptor != null)
                services.Remove(descriptor);

            // Add a test database
            services.AddDbContext<EcommerceDbContext>(options =>
            {
                options.UseInMemoryDatabase($"TestDb_{Guid.NewGuid()}");
            });

            // Build the service provider
            var sp = services.BuildServiceProvider();

            // Create a scope to obtain a reference to the database context
            using var scope = sp.CreateScope();
            var scopedServices = scope.ServiceProvider;
            var db = scopedServices.GetRequiredService<EcommerceDbContext>();

            // Ensure the database is created
            db.Database.EnsureCreated();

            // Seed test data
            SeedTestData(db);
        });

        builder.UseEnvironment("Testing");
    }

    private static void SeedTestData(EcommerceDbContext context)
    {
        context.Products.AddRange(
            new Product
            {
                Name = "Test Laptop",
                Price = 999.99m,
                Description = "Test laptop description",
                Category = "Electronics",
                ImageUrl = "https://example.com/laptop.jpg",
                StockQuantity = 10,
                IsActive = true
            },
            new Product
            {
                Name = "Test Phone",
                Price = 699.99m,
                Description = "Test phone description", 
                Category = "Electronics",
                ImageUrl = "https://example.com/phone.jpg",
                StockQuantity = 15,
                IsActive = true
            },
            new Product
            {
                Name = "Test Coffee Maker",
                Price = 79.99m,
                Description = "Test coffee maker description",
                Category = "Appliances",
                ImageUrl = "https://example.com/coffee.jpg",
                StockQuantity = 5,
                IsActive = true
            }
        );

        context.SaveChanges();
    }
}