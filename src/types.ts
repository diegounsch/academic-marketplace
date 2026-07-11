/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Category {
  TEXTBOOKS = "Libros de Texto",
  NOTES = "Apuntes y Guías",
  TECH = "Tecnología y Electrónica",
  LAB_EQUIPMENT = "Material de Laboratorio y Estudio",
  TUTORING = "Tutorías y Asesorías",
}

export enum Condition {
  NEW = "Nuevo",
  LIKE_NEW = "Como Nuevo",
  GOOD = "Buen Estado",
  USED = "Usado / Aceptable",
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  role: string; // e.g. "Estudiante de 4to año de Medicina", "Profesor Jubilado"
  rating: number;
  salesCount: number;
  persona: string; // Instructions for Gemini to act as this seller
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  condition: Condition;
  courseCode?: string; // e.g., "MAT-101", "BIO-302"
  image: string;
  seller: Seller;
  createdAt: string;
  isCustom?: boolean; // If listed by current user
}

export interface Message {
  id: string;
  sender: "user" | "seller";
  text: string;
  timestamp: string;
  isOffer?: boolean;
  offerAmount?: number;
}

export interface ChatSession {
  productId: string;
  sellerId: string;
  messages: Message[];
  currentPrice: number; // The price agreed upon or being discussed
  status: "active" | "accepted" | "declined";
  lastUpdated: string;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  university: string;
  avatar: string;
  balance: number;
  dni?: string;
  dniFrontUrl?: string;
  dniBackUrl?: string;
  isDniVerified?: boolean;
  isAdmin?: boolean;
  isBlocked?: boolean;
}
