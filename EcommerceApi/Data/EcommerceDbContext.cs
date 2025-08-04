using Microsoft.EntityFrameworkCore;
using EcommerceApi.Models;

namespace EcommerceApi.Data;

public class EcommerceDbContext : DbContext
{
    public EcommerceDbContext(DbContextOptions<EcommerceDbContext> options) : base(options) { }

    public DbSet<Product> Products { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            entity.Property(e => e.Price).HasPrecision(18, 2);
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Category).HasMaxLength(100);
        });

        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasOne(c => c.Product)
                  .WithMany()
                  .HasForeignKey(c => c.ProductId);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
            entity.HasMany(o => o.OrderItems)
                  .WithOne(oi => oi.Order)
                  .HasForeignKey(oi => oi.OrderId);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.Property(e => e.Price).HasPrecision(18, 2);
            entity.HasOne(oi => oi.Product)
                  .WithMany()
                  .HasForeignKey(oi => oi.ProductId);
        });

        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>().HasData(
            new Product
            {
                Id = 1,
                Name = "Laptop Computer",
                Description = "High-performance laptop for work and gaming",
                Price = 1299.99m,
                Category = "Electronics",
                ImageUrl = "https://example.com/laptop.jpg",
                StockQuantity = 25
            },
            new Product
            {
                Id = 2,
                Name = "Wireless Headphones",
                Description = "Premium noise-canceling headphones",
                Price = 299.99m,
                Category = "Electronics",
                ImageUrl = "https://example.com/headphones.jpg",
                StockQuantity = 50
            },
            new Product
            {
                Id = 3,
                Name = "Coffee Maker",
                Description = "Automatic drip coffee maker with timer",
                Price = 79.99m,
                Category = "Appliances",
                ImageUrl = "https://example.com/coffee-maker.jpg",
                StockQuantity = 30
            },
            new Product
            {
                Id = 4,
                Name = "Running Shoes",
                Description = "Comfortable athletic shoes for running",
                Price = 129.99m,
                Category = "Sports",
                ImageUrl = "https://example.com/shoes.jpg",
                StockQuantity = 40
            }
        );
    }
}