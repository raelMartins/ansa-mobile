export type Merchant = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  phone: string | null;
  whatsapp: string | null;
  location: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  instagramHandle: string | null;
  tiktokHandle: string | null;
  xHandle: string | null;
  onboardingCompleted: boolean;
};

export type CreateMerchantInput = {
  name: string;
  description?: string;
  category?: string;
  phone?: string;
  whatsapp?: string;
  location?: string;
  onboardingCompleted?: boolean;
};
