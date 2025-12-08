// app/api/auth.ts
import { API_BASE_URL } from '../constants/config';

export type SignInResponse = {
  token?: string;
  name?: string;
  clientOrDriverID?: number;
  success?: boolean;
  message?: string;
};

export async function signInApi(email: string, password: string): Promise<SignInResponse> {
  // MOCK - replace with your backend fetch later
  await new Promise((r) => setTimeout(r, 600));
  if (email === 'driver@baaz.com' && password === 'password') {
    return { token: 'mock-token-123', name: 'Ravi Kumar' };
  }
  throw new Error('Invalid credentials');
}

export async function validateEmailApi(email: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/DriverAuth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Backend expects an object, likely { email: "..." }
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Email verification failed');
    }

    return true;
  } catch (error) {
    console.error('Validate email error:', error);
    throw error;
  }
}

export async function verifyOtpApi(email: string, otp: string): Promise<SignInResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/DriverAuth/validate-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'OTP verification failed');
    }

    // Assuming the response is correct JSON matching SignInResponse (token, name, etc.)
    return await response.json();
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
}
