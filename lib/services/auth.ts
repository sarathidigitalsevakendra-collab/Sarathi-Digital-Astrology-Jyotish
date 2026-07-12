export interface Session {
  userId: string;
  token: string;
  expiresAt: string;
}

export interface AuthClient {
  login(email: string, password: string): Promise<Session>;
  logout(): Promise<void>;
}

export class MockAuthClient implements AuthClient {
  async login(_email: string, _password: string) {
    return {
      userId: "mock-user",
      token: "mock-token",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
  }

  async logout() {
    return;
  }
}
