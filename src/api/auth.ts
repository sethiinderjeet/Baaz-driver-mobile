// app/api/auth.ts
export type SignInResponse = { token: string; name?: string };

export async function signInApi(email: string, password: string): Promise<SignInResponse> {
  // MOCK - replace with your backend fetch later
  await new Promise((r) => setTimeout(r, 600));
  if (email === 'driver@baaz.com' && password === 'password') {
    return { token: 'mock-token-123', name: 'Ravi Kumar' };
  }
  if (email === 'user@example.com' && password === 'password') {
    return { token: 'mock-token-123', name: 'Test Driver' };
  }
  throw new Error('Invalid credentials');
}
