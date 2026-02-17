"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

export default function LoginPage() {
  const router = useRouter();
  const loginSuccess = async (credentialResponse: any) => {
    try {
      const response = await api.loginWithGoogle(credentialResponse.credential);
      api.setAccessToken(response.accessToken);
      router.push("/map");
    } catch (error) {
      console.error("Login Failed: ", error);
      toast.error("Login failed. Please try again.");
    }
  };
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
            Trace
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Your travel journey, visualized
          </p>

          <div className="flex flex-col items-center space-y-4">
            <GoogleLogin
              onSuccess={loginSuccess}
              onError={() => console.log("Login Failed")}
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Track places you've been</p>
            <p>Visualize your travel graph</p>
            <p>Share your journey</p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
