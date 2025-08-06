using Microsoft.EntityFrameworkCore;
using EcommerceApi.Data;
using EcommerceApi.Models;
using EcommerceApi.DTOs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddDbContext<EcommerceDbContext>(options =>
    options.UseInMemoryDatabase("EcommerceDb"));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS for frontend integration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

// Ensure database is created and seeded
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<EcommerceDbContext>();
    context.Database.EnsureCreated();
}

// Product API endpoints
app.MapGet("/api/products", async (EcommerceDbContext db, string? search, string? category, decimal? minPrice, decimal? maxPrice, int page = 1, int limit = 10) =>
{
    var query = db.Products.Where(p => p.IsActive);

    if (!string.IsNullOrEmpty(search))
    {
        query = query.Where(p => p.Name.Contains(search) || p.Description.Contains(search));
    }

    if (!string.IsNullOrEmpty(category))
    {
        query = query.Where(p => p.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
    }

    if (minPrice.HasValue)
    {
        query = query.Where(p => p.Price >= minPrice.Value);
    }

    if (maxPrice.HasValue)
    {
        query = query.Where(p => p.Price <= maxPrice.Value);
    }

    var total = await query.CountAsync();
    var products = await query
        .Skip((page - 1) * limit)
        .Take(limit)
        .Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Category = p.Category,
            ImageUrl = p.ImageUrl,
            StockQuantity = p.StockQuantity,
            IsActive = p.IsActive
        })
        .ToListAsync();

    return Results.Ok(new { products, total, page, limit });
})
.WithName("GetProducts")
.WithOpenApi();

app.MapGet("/api/products/{id}", async (int id, EcommerceDbContext db) =>
{
    var product = await db.Products.FindAsync(id);
    
    if (product == null || !product.IsActive)
        return Results.NotFound();

    var productDto = new ProductDto
    {
        Id = product.Id,
        Name = product.Name,
        Description = product.Description,
        Price = product.Price,
        Category = product.Category,
        ImageUrl = product.ImageUrl,
        StockQuantity = product.StockQuantity,
        IsActive = product.IsActive
    };

    return Results.Ok(productDto);
})
.WithName("GetProduct")
.WithOpenApi();

app.MapPost("/api/products", async (CreateProductDto createDto, EcommerceDbContext db) =>
{
    var product = new Product
    {
        Name = createDto.Name,
        Description = createDto.Description,
        Price = createDto.Price,
        Category = createDto.Category,
        ImageUrl = createDto.ImageUrl,
        StockQuantity = createDto.StockQuantity
    };

    db.Products.Add(product);
    await db.SaveChangesAsync();

    var productDto = new ProductDto
    {
        Id = product.Id,
        Name = product.Name,
        Description = product.Description,
        Price = product.Price,
        Category = product.Category,
        ImageUrl = product.ImageUrl,
        StockQuantity = product.StockQuantity,
        IsActive = product.IsActive
    };

    return Results.Created($"/api/products/{product.Id}", productDto);
})
.WithName("CreateProduct")
.WithOpenApi();

// Cart API endpoints
app.MapGet("/api/cart/{userId}", async (string userId, EcommerceDbContext db) =>
{
    var cartItems = await db.CartItems
        .Where(c => c.UserId == userId)
        .Include(c => c.Product)
        .Select(c => new CartItemDto
        {
            Id = c.Id,
            UserId = c.UserId,
            ProductId = c.ProductId,
            Product = c.Product != null ? new ProductDto
            {
                Id = c.Product.Id,
                Name = c.Product.Name,
                Description = c.Product.Description,
                Price = c.Product.Price,
                Category = c.Product.Category,
                ImageUrl = c.Product.ImageUrl,
                StockQuantity = c.Product.StockQuantity,
                IsActive = c.Product.IsActive
            } : null,
            Quantity = c.Quantity
        })
        .ToListAsync();

    var total = cartItems.Sum(item => item.Product?.Price * item.Quantity ?? 0);
    
    var cart = new CartDto
    {
        Items = cartItems,
        Total = total
    };

    return Results.Ok(cart);
})
.WithName("GetCart")
.WithOpenApi();

app.MapPost("/api/cart/add", async (AddToCartDto addDto, EcommerceDbContext db) =>
{
    var product = await db.Products.FindAsync(addDto.ProductId);
    if (product == null || !product.IsActive)
        return Results.BadRequest("Product not found or inactive");

    if (product.StockQuantity < addDto.Quantity)
        return Results.BadRequest("Insufficient stock");

    var existingCartItem = await db.CartItems
        .FirstOrDefaultAsync(c => c.UserId == addDto.UserId && c.ProductId == addDto.ProductId);

    if (existingCartItem != null)
    {
        existingCartItem.Quantity += addDto.Quantity;
        existingCartItem.UpdatedAt = DateTime.UtcNow;
    }
    else
    {
        var cartItem = new CartItem
        {
            UserId = addDto.UserId,
            ProductId = addDto.ProductId,
            Quantity = addDto.Quantity
        };
        db.CartItems.Add(cartItem);
    }

    await db.SaveChangesAsync();
    return Results.Ok("Item added to cart");
})
.WithName("AddToCart")
.WithOpenApi();

app.MapPut("/api/cart/{itemId}", async (int itemId, UpdateCartItemDto updateDto, EcommerceDbContext db) =>
{
    var cartItem = await db.CartItems.FindAsync(itemId);
    if (cartItem == null)
        return Results.NotFound();

    cartItem.Quantity = updateDto.Quantity;
    cartItem.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();
    return Results.Ok("Cart item updated");
})
.WithName("UpdateCartItem")
.WithOpenApi();

app.MapDelete("/api/cart/{itemId}", async (int itemId, EcommerceDbContext db) =>
{
    var cartItem = await db.CartItems.FindAsync(itemId);
    if (cartItem == null)
        return Results.NotFound();

    db.CartItems.Remove(cartItem);
    await db.SaveChangesAsync();
    return Results.Ok("Item removed from cart");
})
.WithName("RemoveFromCart")
.WithOpenApi();

// Order API endpoints
app.MapPost("/api/orders", async (CreateOrderDto createDto, EcommerceDbContext db) =>
{
    var cartItems = await db.CartItems
        .Where(c => createDto.CartItemIds.Contains(c.Id) && c.UserId == createDto.UserId)
        .Include(c => c.Product)
        .ToListAsync();

    if (!cartItems.Any())
        return Results.BadRequest("No valid cart items found");

    var order = new Order
    {
        UserId = createDto.UserId,
        ShippingAddress = createDto.ShippingAddress,
        PaymentMethod = createDto.PaymentMethod,
        TotalAmount = cartItems.Sum(c => c.Product!.Price * c.Quantity)
    };

    foreach (var cartItem in cartItems)
    {
        order.OrderItems.Add(new OrderItem
        {
            ProductId = cartItem.ProductId,
            Quantity = cartItem.Quantity,
            Price = cartItem.Product!.Price
        });
    }

    db.Orders.Add(order);
    db.CartItems.RemoveRange(cartItems);
    await db.SaveChangesAsync();

    var orderDto = new OrderDto
    {
        Id = order.Id,
        UserId = order.UserId,
        TotalAmount = order.TotalAmount,
        Status = order.Status,
        ShippingAddress = order.ShippingAddress,
        PaymentMethod = order.PaymentMethod,
        CreatedAt = order.CreatedAt,
        OrderItems = order.OrderItems.Select(oi => new OrderItemDto
        {
            Id = oi.Id,
            ProductId = oi.ProductId,
            Quantity = oi.Quantity,
            Price = oi.Price
        }).ToList()
    };

    return Results.Created($"/api/orders/{order.Id}", orderDto);
})
.WithName("CreateOrder")
.WithOpenApi();

app.MapGet("/api/orders/{userId}", async (string userId, EcommerceDbContext db) =>
{
    var orders = await db.Orders
        .Where(o => o.UserId == userId)
        .Include(o => o.OrderItems)
        .ThenInclude(oi => oi.Product)
        .Select(o => new OrderDto
        {
            Id = o.Id,
            UserId = o.UserId,
            TotalAmount = o.TotalAmount,
            Status = o.Status,
            ShippingAddress = o.ShippingAddress,
            PaymentMethod = o.PaymentMethod,
            CreatedAt = o.CreatedAt,
            OrderItems = o.OrderItems.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                Product = oi.Product != null ? new ProductDto
                {
                    Id = oi.Product.Id,
                    Name = oi.Product.Name,
                    Description = oi.Product.Description,
                    Price = oi.Product.Price,
                    Category = oi.Product.Category,
                    ImageUrl = oi.Product.ImageUrl,
                    StockQuantity = oi.Product.StockQuantity,
                    IsActive = oi.Product.IsActive
                } : null,
                Quantity = oi.Quantity,
                Price = oi.Price
            }).ToList()
        })
        .ToListAsync();

    return Results.Ok(orders);
})
.WithName("GetUserOrders")
.WithOpenApi();

app.Run();

// Make Program accessible to tests
public partial class Program { }
