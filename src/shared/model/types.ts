export interface AuthUser {
  id: number;
  email: string;
  role: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface Service {
  id: number;
  name: string;
  icon: string;
  description: string;
  price: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceInput {
  name: string;
  icon: string;
  description: string;
  price: string;
}

export interface Review {
  id: number;
  name: string;
  text: string;
  rating: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewInput {
  name: string;
  text: string;
  rating: number;
}

export interface LoadServicesResult {
  services: Service[];
  usingFallback: boolean;
  message: string;
}

export interface LoadReviewsResult {
  reviews: Review[];
  usingFallback: boolean;
  message: string;
}

export interface TestimonialSubmitResult {
  review: Review;
  offline: boolean;
}

export type StatusTone = 'note' | 'error';
