
export interface Room {
  _id?: string;
  roomId: string;
  name: string;
  image: string;
  price: number;
  basePackage: number;
  maxCapacity: number;
  extraAdultCharge: number;
  extraChildCharge: number;
  description: string;
  isActive?: boolean;
  amenities?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Booking {
  _id?: string;
  bookingId: string;
  customerName: string;
  phone: string;
  email: string;
  roomId: string;
  date: string;
  timeSlot: string;
  adults: number;
  children: number;
  addons: string[];
  totalPrice: number;
  paymentOption: 'full' | 'half';
  paymentMethod: 'online' | 'manual';
  amountPaid: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus?: 'pending' | 'partial' | 'completed' | 'refunded';
  transactionId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
  token?: string;
}

export interface User {
  _id?: string;
  username: string;
  role: 'admin' | 'manager';
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: any[];
}

export interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  roomId: string;
  date: string;
  timeSlot: string;
  adults: number;
  children: number;
  selectedAddons: string[];
}
