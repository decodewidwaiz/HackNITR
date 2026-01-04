export interface User {
  _id?: string;
  name: string;
  mobile: string;
  location: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  category: string;
  image: string;
  farmerName: string;
  aadhaar: string;
  location: string;
}

export interface Order {
  _id: string;
  productId: string;
  productName: string;
  productPrice: number;
  finalAmount: number;
  quantity: number;
  unit: string;
  deliveryCharge?: number;
  farmerAadhar: string;
  farmerName: string;
  customerName: string;
  customerMobile: string;
  date: string;
  status: 'pending' | 'confirmed' | 'payment_verified' | 'delivery' | 'rejected' | 'completed';
  deliveryType: 'pickup' | 'home_delivery';
  deliveryLocation?: string;
  farmerDeliveryLocation?: string;
  rejectionReason?: string;
  paymentVerified?: boolean;
  paymentVerifiedAt?: string;
  confirmedAt?: string;
  completedAt?: string;
}
