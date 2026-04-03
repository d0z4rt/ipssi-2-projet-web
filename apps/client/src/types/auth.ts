import { UserResponse } from './users'

export type LoginResponse = {
  token: string
  expires_at: string
  user: Omit<UserResponse, 'created_at'>
}

export type LoginRequest = {
  mail: string
  password: string
}

export type RegisterResponse = {
  token: string
  expires_at: string
  user: Omit<UserResponse, 'created_at'>
}

export type RegisterRequest = {
  username: string
  mail: string
  is_curator: boolean
  password: string
}
