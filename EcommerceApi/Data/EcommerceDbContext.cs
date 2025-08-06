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
            // Electronics
            new Product
            {
                Id = 1,
                Name = "Laptop Computer",
                Description = "High-performance laptop for work and gaming with 16GB RAM and 512GB SSD",
                Price = 1299.99m,
                Category = "Electronics",
                ImageUrl = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
                StockQuantity = 25
            },
            new Product
            {
                Id = 2,
                Name = "Wireless Headphones",
                Description = "Premium noise-canceling headphones with 30-hour battery life",
                Price = 299.99m,
                Category = "Electronics",
                ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
                StockQuantity = 50
            },
            new Product
            {
                Id = 3,
                Name = "Smartphone",
                Description = "Latest flagship smartphone with triple camera system and 5G connectivity",
                Price = 899.99m,
                Category = "Electronics",
                ImageUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
                StockQuantity = 35
            },
            new Product
            {
                Id = 4,
                Name = "Wireless Mouse",
                Description = "Ergonomic wireless mouse with precision tracking and long battery life",
                Price = 49.99m,
                Category = "Electronics",
                ImageUrl = "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
                StockQuantity = 75
            },
            new Product
            {
                Id = 5,
                Name = "4K Monitor",
                Description = "27-inch 4K UHD monitor with HDR support and USB-C connectivity",
                Price = 399.99m,
                Category = "Electronics",
                ImageUrl = "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400",
                StockQuantity = 20
            },

            // Home & Kitchen
            new Product
            {
                Id = 6,
                Name = "Coffee Maker",
                Description = "Automatic drip coffee maker with programmable timer and thermal carafe",
                Price = 79.99m,
                Category = "Home & Kitchen",
                ImageUrl = "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
                StockQuantity = 30
            },
            new Product
            {
                Id = 7,
                Name = "Air Fryer",
                Description = "Digital air fryer with 8 preset cooking functions and non-stick basket",
                Price = 129.99m,
                Category = "Home & Kitchen",
                ImageUrl = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
                StockQuantity = 25
            },
            new Product
            {
                Id = 8,
                Name = "Vacuum Cleaner",
                Description = "Cordless stick vacuum with powerful suction and HEPA filtration",
                Price = 249.99m,
                Category = "Home & Kitchen",
                ImageUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
                StockQuantity = 15
            },

            // Sports & Fitness
            new Product
            {
                Id = 9,
                Name = "Running Shoes",
                Description = "Comfortable athletic shoes with advanced cushioning technology",
                Price = 129.99m,
                Category = "Sports & Fitness",
                ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
                StockQuantity = 40
            },
            new Product
            {
                Id = 10,
                Name = "Yoga Mat",
                Description = "Non-slip exercise mat with extra thickness for comfort and stability",
                Price = 39.99m,
                Category = "Sports & Fitness",
                ImageUrl = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
                StockQuantity = 60
            },
            new Product
            {
                Id = 11,
                Name = "Fitness Tracker",
                Description = "Waterproof fitness tracker with heart rate monitor and sleep tracking",
                Price = 199.99m,
                Category = "Sports & Fitness",
                ImageUrl = "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400",
                StockQuantity = 30
            },

            // Books & Media
            new Product
            {
                Id = 12,
                Name = "Programming Book",
                Description = "Comprehensive guide to modern web development with practical examples",
                Price = 49.99m,
                Category = "Books & Media",
                ImageUrl = "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
                StockQuantity = 45
            },
            new Product
            {
                Id = 13,
                Name = "Bluetooth Speaker",
                Description = "Portable wireless speaker with 360-degree sound and water resistance",
                Price = 89.99m,
                Category = "Electronics",
                ImageUrl = "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400",
                StockQuantity = 35
            },

            // Fashion & Accessories
            new Product
            {
                Id = 14,
                Name = "Leather Wallet",
                Description = "Genuine leather wallet with RFID blocking and multiple card slots",
                Price = 59.99m,
                Category = "Fashion & Accessories",
                ImageUrl = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
                StockQuantity = 50
            },
            new Product
            {
                Id = 15,
                Name = "Sunglasses",
                Description = "UV protection sunglasses with polarized lenses and durable frame",
                Price = 79.99m,
                Category = "Fashion & Accessories",
                ImageUrl = "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
                StockQuantity = 40
            }
        );
    }
}