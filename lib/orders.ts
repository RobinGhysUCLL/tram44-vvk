export interface Order {
  id: string;
  name: string;
  email: string;
  ticketCount: number;
  totalPrice: number;
  paid: boolean;
  timestamp: string;
  referer?: string;
  organization?: string;
  additionalNames: string[];
  message?: string; // Add this optional property
}
// Local orders array (in real app this would be a database)
const orders: Order[] = [];

export function addOrder(order: Omit<Order, "id">): Order {
  const newOrder: Order = {
    ...order,
    id: `ORDER-${Date.now()}-${Math.random().toString(36).substring(7)}`,
  };
  orders.push(newOrder);
  return newOrder;
}

export function getOrder(id: string): Order | undefined {
  return orders.find((order) => order.id === id);
}

export function getAllOrders(): Order[] {
  return orders;
}
