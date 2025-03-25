import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, Brain, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import { Route } from "next";

export function HowItWorks() {
  return (
    <div className="container px-4 md:px-6 max-w-7xl mx-auto relative">
      <div className="flex flex-col items-center justify-center space-y-4 md:space-y-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-800 px-4 md:px-5 py-1.5 md:py-2 text-sm text-white shadow-sm hover:shadow-md transition-all duration-300">
          <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 animate-pulse" />
          How It Works
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-emerald-800 to-emerald-900 text-transparent bg-clip-text">
          AI-Powered Voice to Structured Report
        </h2>
        <p className="text-sm md:text-base lg:text-xl text-gray-600 max-w-2xl">
          Watch how VoiceMD transforms your natural speech into perfectly
          structured medical documentation
        </p>
      </div>

      {/* Process Steps */}
      <div className="mt-12 md:mt-20 space-y-6 md:space-y-8 max-w-4xl mx-auto">
        {/* Step 1 */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 p-6 md:p-8 rounded-2xl border border-gray-300 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:border-emerald-500 group relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:to-emerald-500/10 transition-all duration-300 pointer-events-none"></div>

          <div className="flex-shrink-0">
            <div className="p-4 md:p-5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Mic className="h-5 w-5 md:h-7 md:w-7" />
            </div>
          </div>

          <div className="flex-grow w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">
                  Speak Naturally
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Just speak as you normally would with your patients
                </p>
              </div>
              <div className="hidden md:block">
                <ArrowRight className="h-6 w-6 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <div className="mt-4 p-4 md:p-5 bg-white/50 backdrop-blur-sm rounded-xl text-left border border-gray-300 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:border-emerald-500">
              <p className="text-xs md:text-sm text-gray-600 italic leading-relaxed">
                "Patient presented with fever and cough for 3 days. Temperature
                101°F, BP 120/80. Prescribed paracetamol 500mg TDS for 5 days."
              </p>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 p-6 md:p-8 rounded-2xl border border-gray-300 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:border-emerald-500 group relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:to-emerald-500/10 transition-all duration-300 pointer-events-none"></div>

          <div className="flex-shrink-0">
            <div className="p-4 md:p-5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Brain className="h-5 w-5 md:h-7 md:w-7" />
            </div>
          </div>

          <div className="flex-grow w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">
                  AI Processing
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Our AI analyzes and categorizes your speech in real-time
                </p>
              </div>
              <div className="hidden md:block">
                <ArrowRight className="h-6 w-6 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <div className="mt-4 p-4 md:p-5 bg-white/50 backdrop-blur-sm rounded-xl text-left border border-gray-300 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:border-emerald-500">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-baseline gap-2">
                  <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1"></div>
                  <p className="text-xs md:text-sm">
                    <span className="font-medium">Symptoms:</span> Fever, Cough
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1"></div>
                  <p className="text-xs md:text-sm">
                    <span className="font-medium">Duration:</span> 3 days
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1"></div>
                  <p className="text-xs md:text-sm">
                    <span className="font-medium">Vitals:</span> Temp: 101°F,
                    BP: 120/80
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 p-6 md:p-8 rounded-2xl border border-gray-300 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:border-emerald-500 group relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:to-emerald-500/10 transition-all duration-300 pointer-events-none"></div>

          <div className="flex-shrink-0">
            <div className="p-4 md:p-5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-5 w-5 md:h-7 md:w-7" />
            </div>
          </div>

          <div className="flex-grow w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">
                  Structured Report
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Get a perfectly formatted medical report instantly
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 md:p-5 bg-white/50 backdrop-blur-sm rounded-xl text-left border border-gray-300 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:border-emerald-500">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-baseline gap-2">
                  <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1"></div>
                  <p className="text-xs md:text-sm">
                    <span className="font-medium">Prescription:</span>{" "}
                    Paracetamol 500mg
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1"></div>
                  <p className="text-xs md:text-sm">
                    <span className="font-medium">Dosage:</span> TDS
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1"></div>
                  <p className="text-xs md:text-sm">
                    <span className="font-medium">Duration:</span> 5 days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-12 md:mt-16 flex justify-center">
        <Button
          className="bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden px-6 md:px-8 py-4 md:py-6 text-base md:text-lg"
          asChild
        >
          <Link href={"/sign-in" as Route} className="relative z-10">
            Try It Yourself
            <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
