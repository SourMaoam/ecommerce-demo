using EcommerceApi.Models;

namespace EcommerceApi.DTOs;

public class OrderDto
{
    public int Id { get; set; }
    public int OrderId => Id; // Frontend expects 'orderId'
    public string UserId { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal Total => TotalAmount; // Frontend expects 'total'
    public OrderStatus Status { get; set; }
    public string ShippingAddress { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<OrderItemDto> OrderItems { get; set; } = new();
    public List<OrderItemDto> Items => OrderItems; // Frontend expects 'items'
}

public class OrderItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public ProductDto? Product { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}

public class CreateOrderDto
{
    public string UserId { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public List<int> CartItemIds { get; set; } = new();
}

public class CreateOrderRequest
{
    public string UserId { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public List<int> CartItemIds { get; set; } = new();
}