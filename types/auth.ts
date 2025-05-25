import { UserResponse } from "./user";

// src/types/auth.ts
export type LoginRequest = {
    email: string;
    password: string;
  };
  
  export type LoginResponse = {
    token: string;
    user: UserResponse;
  };
  