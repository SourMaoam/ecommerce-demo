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

            // Use a shared database name for this test class to ensure data consistency
            services.AddDbContext<EcommerceDbContext>(options =>
            {
                options.UseInMemoryDatabase("SharedTestDb");
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
        // Let the main OnModelCreating handle seeding
        // Just verify that products are available
        if (!context.Products.Any())
        {
            // This should not happen if OnModelCreating is working properly
            throw new InvalidOperationException("No products found in test database after initialization");
        }
    }
}