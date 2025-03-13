import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Mic } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white p-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2">
          <Mic className="h-6 w-6 text-emerald-600" />
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 text-transparent bg-clip-text">
            VoiceMD
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to VoiceMD
          </h1>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white",
                footerActionLink: "text-emerald-600 hover:text-emerald-800",
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            redirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
