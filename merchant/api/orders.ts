import type { ApiClient } from "../../core/api/client";
import type { MerchantOrder, OrderStatus, UpdateOrderStatusResult } from "../types";

export async function listOrders(api: ApiClient, merchantId: string): Promise<MerchantOrder[]> {
  const { orders } = await api.request<{ orders: MerchantOrder[] }>(`/v1/me/merchants/${merchantId}/orders`);
  return orders;
}

export async function fetchOrder(api: ApiClient, merchantId: string, orderId: string): Promise<MerchantOrder> {
  const { order } = await api.request<{ order: MerchantOrder }>(
    `/v1/me/merchants/${merchantId}/orders/${orderId}`,
  );
  return order;
}

export async function updateOrderStatus(
  api: ApiClient,
  merchantId: string,
  orderId: string,
  status: OrderStatus,
): Promise<UpdateOrderStatusResult> {
  return api.patch<UpdateOrderStatusResult>(`/v1/me/merchants/${merchantId}/orders/${orderId}`, { status });
}
