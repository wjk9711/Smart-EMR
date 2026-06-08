import jwt from 'jsonwebtoken'
import { config } from '../config'

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, config.jwt.secret as string)
}

export function verifyToken(token: string): { userId: number } {
  return jwt.verify(token, config.jwt.secret as string) as { userId: number }
}
