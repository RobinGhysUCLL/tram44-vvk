import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Order } from "./orders";
import { storage } from "./storage";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const TICKET_PRICE = 3;

// Helper function to generate order ID
export function generateOrderId(): string {
  return `ORDER-${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)
    .toUpperCase()}`;
}

// Helper function to calculate total price
function calculateTotalPrice(order: Order): Order {
  if (!order.totalPrice || order.totalPrice === 0) {
    return {
      ...order,
      totalPrice: order.ticketCount * TICKET_PRICE,
    };
  }
  return order;
}

export async function fetchAllOrders(): Promise<Order[]> {
  const token = storage.getItem("adminToken");

  const response = await fetch(`${API_BASE_URL}`, {
    mode: "cors",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // Als token verlopen is, log uit
  if (response.status === 403 || response.status === 401) {
    storage.removeItem("adminToken");
    window.location.href = "/admin";
    throw new Error("Session expired");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${response.status}`);
  }

  const orders = await response.json();
  return orders.map(calculateTotalPrice);
}

export async function createOrder(
  orderId: string,
  orderData: {
    name: string;
    email: string;
    ticketCount: number;
    additionalNames: string[];
    organization?: string | null;
    referer: string | null;
    totalPrice: number;
  }
): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}`, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: orderId,
      ...orderData,
      timestamp: new Date().toISOString(),
      paid: false,
    }),
  });

  if (!response.ok && response.status !== 201) {
    throw new Error(`Failed to create order: ${response.status}`);
  }

  const createdOrder = await response.json();
  return calculateTotalPrice(createdOrder);
}

export async function toggleOrderPaidStatus(orderId: string): Promise<Order> {
  const token = storage.getItem("adminToken");

  const response = await fetch(`${API_BASE_URL}/${orderId}/paid`, {
    method: "PATCH",
    mode: "cors",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 403 || response.status === 401) {
    storage.removeItem("adminToken");
    window.location.href = "/admin";
    throw new Error("Session expired");
  }

  if (!response.ok) {
    throw new Error(`Failed to update paid status: ${response.status}`);
  }

  const updatedOrder = await response.json();
  return calculateTotalPrice(updatedOrder);
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/${orderId}`, {
      mode: "cors",
    });
    if (!response.ok) {
      return null;
    }
    const order = await response.json();
    return calculateTotalPrice(order);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return null;
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  const token = storage.getItem("adminToken");

  const response = await fetch(`${API_BASE_URL}/${orderId}`, {
    method: "DELETE",
    mode: "cors",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // Accept 200, 204 (No Content), and even 400 if the order is actually deleted
  if (!response.ok && response.status !== 400) {
    throw new Error(`Failed to delete order: ${response.status}`);
  }
}
