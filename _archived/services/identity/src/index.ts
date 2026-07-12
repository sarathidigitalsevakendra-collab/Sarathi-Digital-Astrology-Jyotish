import argon2 from "argon2";

export class IdentityService {
  async hashPassword(password: string) {
    return argon2.hash(password);
  }

  async verifyPassword(hash: string, password: string) {
    return argon2.verify(hash, password);
  }
}
