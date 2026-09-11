export interface AppPreferences {
  id: string;
  default_currency: string;
  date_format: string;
  time_format: string;
  theme: string;
  language: string;
}

export interface HostelProfile {
  id: string;
  hostel_name: string;
  hostel_logo?: string | null;
  owner_name: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gst_number: string | null;
  description: string | null;
}

export interface UPIPaymentSettings {
  id: string;
  upi_id: string;
  account_holder_name: string;
  bank_name: string;
  qr_code_image: string | null;
  payment_instructions: string | null;
  enable_online_payment: boolean;
}

export interface AdminProfile {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  mobile: string;
  role: string;
  profile_photo: string | null;
}
