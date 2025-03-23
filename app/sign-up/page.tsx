import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Mic } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-0 py-8 sm:px-4">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10">
        <Link href="/" className="flex items-center gap-2">
          <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 text-transparent bg-clip-text">
            VoiceMD
          </span>
        </Link>
      </div>

      <div className="w-full max-w-[95%] sm:max-w-md mt-12 sm:mt-0 flex flex-col items-center pt-6 sm:pt-0">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Join VoiceMD
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Create your account to get started
          </p>
        </div>

        <div className="w-full flex justify-center">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white",
                footerActionLink: "text-emerald-600 hover:text-emerald-800",
                card: "bg-white p-4 sm:p-8 rounded-xl shadow-md border border-gray-200 w-full",
                formFieldInput: "text-sm sm:text-base",
                formFieldLabel: "text-sm sm:text-base",
                rootBox: "w-full mx-auto",
                main: "w-full",
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            redirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
