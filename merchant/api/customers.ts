import type { ApiClient } from "../../core/api/client";
import type { CustomerIdentity, MerchantCustomer, MerchantCustomerDetail } from "../types";

function customerQuery(identity: CustomerIdentity): string {
  const params = new URLSearchParams({
    name: identity.name,
    phone: identity.phone,
  });
  if (identity.email) params.set("email", identity.email);
  return params.toString();
}

export async function listCustomers(api: ApiClient, merchantId: string): Promise<MerchantCustomer[]> {
  const { customers } = await api.request<{ customers: MerchantCustomer[] }>(
    `/v1/me/merchants/${merchantId}/customers`,
  );
  return customers;
}

export async function fetchCustomerDetail(
  api: ApiClient,
  merchantId: string,
  identity: CustomerIdentity,
): Promise<MerchantCustomerDetail> {
  return api.request<MerchantCustomerDetail>(
    `/v1/me/merchants/${merchantId}/customers/detail?${customerQuery(identity)}`,
  );
}
