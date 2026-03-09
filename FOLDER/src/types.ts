import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId?: string;
  category: string;
  status: string;
  views: number;
  likes?: number;
  created_at: string;
  image_url: string;
  image_gallery?: string[];
}

export interface Comment {
  id: string;
  post_id: string;
  author: string;
  authorId?: string;
  designation: string;
  content: string;
  created_at: string;
  likes?: number;
  replies?: Comment[];
}

export interface Stats {
  posts: number;
  views: number;
  comments: number;
  subscribers: number;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}
