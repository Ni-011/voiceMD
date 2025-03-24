import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ClipboardList,
  FileText,
  Users,
  Shield,
  ArrowRight,
  CheckCircle2,
  Star,
  Mic,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "VoiceMD - Document Patient Care With Your Voice",
  description:
    "VoiceMD helps doctors focus on what matters most—their patients. Simplify documentation, prescriptions, and patient management with our AI-powered voice platform.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center w-full bg-gradient-to-b from-emerald-50 to-white">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2">
            <Link href="/">
              <div className="flex items-center gap-2">
                <Mic className="h-6 w-6 text-emerald-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 text-transparent bg-clip-text">
                  VoiceMD
                </span>
              </div>
            </Link>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button
              className="bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white shadow-sm hover:shadow-md transition-all duration-300"
              asChild
            >
              <Link href="/sign-in">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-32 bg-gradient-to-b from-emerald-50 to-white">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
              <div className="inline-block rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-800 px-3 py-1 text-sm text-white">
                Voice-Powered Medical Documentation
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-gray-900 via-emerald-800 to-emerald-900 text-transparent bg-clip-text">
                Document Patient Care With Your Voice
              </h1>
              <p className="text-gray-600 md:text-xl max-w-[800px]">
                VoiceMD helps doctors focus on what matters most—their patients.
                Simplify documentation, prescriptions, and patient management
                with our AI-powered voice platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white shadow-sm hover:shadow-md"
                  asChild
                >
                  <Link href="/sign-in">Start Free Trial</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                  asChild
                >
                  <Link href="/sign-in">View Dashboard Demo</Link>
                </Button>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-gray-900" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-gray-900" />
                  <span>free trial</span>
                </div>
              </div>
            </div>
            <div className="mt-16 flex justify-center">
              <div className="relative w-full max-w-4xl">
                <div className="relative rounded-2xl border bg-white p-2 shadow-sm">
                  <Image
                    src="/voiceMD.png"
                    width={1200}
                    height={600}
                    alt="VoiceMD Dashboard"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 lg:pt-10 md:pt-10 bg-gradient-to-b from-white to-emerald-50"
        >
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
              <div className="inline-block rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-800 px-3 py-1 text-sm text-white">
                Features
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-gray-900 via-emerald-800 to-emerald-900 text-transparent bg-clip-text">
                Everything you need to run your clinic
              </h2>
              <p className="text-gray-600 md:text-xl">
                VoiceMD combines all the tools you need into one seamless
                platform, designed specifically for healthcare professionals.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-16 max-w-6xl mx-auto">
              {[
                {
                  icon: <Mic className="h-10 w-10 text-gray-900" />,
                  title: "Voice-to-Text Documentation",
                  description:
                    "Dictate notes naturally and watch them transform into structured clinical documentation in real-time.",
                },
                {
                  icon: <FileText className="h-10 w-10 text-gray-900" />,
                  title: "AI-Powered Templates",
                  description:
                    "Smart templates that adapt to your specialty and practice style, saving hours of documentation time.",
                },
                {
                  icon: <ClipboardList className="h-10 w-10 text-gray-900" />,
                  title: "E-Prescriptions",
                  description:
                    "Write and send prescriptions using voice commands with built-in drug interaction checks.",
                },
                {
                  icon: <Users className="h-10 w-10 text-gray-900" />,
                  title: "Patient Management",
                  description:
                    "Easily manage patient records, history, and appointments with simple voice commands.",
                },
                {
                  icon: <Calendar className="h-10 w-10 text-gray-900" />,
                  title: "Smart Scheduling",
                  description:
                    "Streamline your clinic&apos;s schedule with our intuitive voice-controlled appointment system.",
                },
                {
                  icon: <Shield className="h-10 w-10 text-gray-900" />,
                  title: "Secure Data",
                  description:
                    "Enterprise-grade security ensures your patient data is secure and compliant with all regulations.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center p-8 space-y-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:border-emerald-200 group"
                >
                  <div className="p-3 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          id="testimonials"
          className="w-full py-12 md:py-24 lg:py-32 bg-white"
        >
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
              <div className="inline-block rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-800 px-3 py-1 text-sm text-white">
                Testimonials
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-gray-900 via-emerald-800 to-emerald-900 text-transparent bg-clip-text">
                Loved by healthcare professionals
              </h2>
              <p className="text-gray-600 md:text-xl">
                Don&apos;t just take our word for it. See what doctors and
                clinic staff have to say about VoiceMD.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mt-16 max-w-6xl mx-auto">
              {[
                {
                  quote:
                    "VoiceMD has transformed our practice. Documentation that used to take hours now takes minutes, giving me more time with patients.",
                  name: "Dr. Sarah Johnson",
                  role: "Family Physician",
                  rating: 5,
                },
                {
                  quote:
                    "The voice recognition accuracy is incredible, even with complex medical terminology. It&apos;s like having a medical scribe that never makes mistakes.",
                  name: "Dr. Michael Chen",
                  role: "Internal Medicine",
                  rating: 5,
                },
                {
                  quote:
                    "As a clinic manager, I appreciate how VoiceMD streamlines our entire operation. The voice-controlled scheduling system has reduced no-shows by 35%.",
                  name: "Rebecca Torres",
                  role: "Clinic Manager",
                  rating: 4,
                },
              ].map((testimonial, i) => (
                <div
                  key={i}
                  className="flex flex-col p-6 space-y-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex gap-1">
                    {Array(testimonial.rating)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-emerald-600 text-emerald-600"
                        />
                      ))}
                  </div>
                  <p className="flex-1 text-gray-600">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-gray-900 p-1">
                      <div className="rounded-full bg-white h-10 w-10 flex items-center justify-center text-gray-900 font-medium">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section
          id="pricing"
          className="w-full py-12 md:py-24 lg:py-32 lg:pt-5 md:pt-5 bg-gradient-to-b from-white to-emerald-50"
        >
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
              <div className="inline-block rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-800 px-3 py-1 text-sm text-white">
                Special Offer
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-gray-900">
                Currently Free for Early Users
              </h2>
              <p className="text-gray-600 md:text-xl">
                For a limited time, we&apos;re offering VoiceMD completely free
                to early adopters. Get full access to all features with no
                limitations.
              </p>
            </div>
            <div className="mt-16 max-w-2xl mx-auto">
              <div className="flex flex-col p-6 space-y-6 rounded-xl border-2 border-emerald-600 bg-white shadow-lg">
                <div className="inline-block rounded-full bg-gradient-to-r from-emerald-600 to-emerald-800 px-3 py-1 text-xs text-white w-fit">
                  Early Access
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Full Featured Plan
                  </h3>
                  <p className="text-gray-600">
                    Get complete access to all VoiceMD features
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-gray-900">Free</div>
                  <p className="text-sm text-gray-600">Limited time offer</p>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm text-gray-600">
                      Unlimited patient records
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm text-gray-600">
                      Full voice documentation suite with AI
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm text-gray-600">
                      Complete prescription management
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm text-gray-600">
                      Advanced analytics and reporting
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm text-gray-600">
                      Priority support
                    </span>
                  </li>
                </ul>
                <Button
                  className="bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white shadow-sm hover:shadow-md"
                  asChild
                >
                  <Link href="/sign-in">Get Started Now</Link>
                </Button>
              </div>
            </div>
            <div className="mt-10 text-center text-sm text-gray-600">
              Limited time offer. Sign up now to lock in free access.
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
              <div className="inline-block rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-800 px-3 py-1 text-sm text-white">
                FAQ
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900">
                Frequently asked questions
              </h2>
              <p className="text-gray-600 md:text-xl">
                Find answers to common questions about VoiceMD.
              </p>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 mt-16">
              {[
                {
                  question: "How voiceMD saves us Money?",
                  answer:
                    "VoiceMD saves you money by reducing the amount of time you spend on documentation, writing prescriptions, and managing patient records.",
                },
                {
                  question: "How accurate is the voice recognition?",
                  answer:
                    "VoiceMD uses Google&apos;s speech-to-text it is 99% accurate for slow speech, and over 90% for fast speech.",
                },
                {
                  question: "Is VoiceMD Secure?",
                  answer:
                    "Yes, VoiceMD is fully Secure with patient Data. We implement all required security measures to protect patient data, including encryption, access controls, and regular security audits.",
                },
                {
                  question: "How long does implementation take?",
                  answer:
                    "Most clinics are up and running with VoiceMD within minutes. Our implementation team will go through every feature with you.",
                },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="space-y-2 text-center p-6 rounded-xl bg-emerald-50 border hover:shadow-sm transition-all duration-300 hover:border-emerald-200"
                >
                  <h3 className="text-xl font-bold text-gray-900">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center space-y-8 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to transform your practice?
              </h2>
              <p className="md:text-xl/relaxed text-gray-300">
                Join thousands of healthcare professionals who are saving time
                and improving patient care with VoiceMD.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all duration-300"
                  asChild
                >
                  <Link href="/sign-in">Start Your Free Trial</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-black hover:bg-gray-100 shadow-sm hover:shadow-md"
                  asChild
                >
                  <Link href="/sign-in">Schedule a Demo</Link>
                </Button>
              </div>
              <p className="text-sm text-gray-300">
                No credit card required. 14-day free trial.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-white py-6 md:py-12">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 text-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Link href="/">
              <div className="flex items-center gap-2">
                <Mic className="h-6 w-6 text-emerald-600" />
                <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 text-transparent bg-clip-text">
                  VoiceMD
                </span>
              </div>
            </Link>
          </div>
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link
              href="#"
              className="text-xs hover:underline underline-offset-4 text-gray-600 hover:text-gray-900"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-xs hover:underline underline-offset-4 text-gray-600 hover:text-gray-900"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-xs hover:underline underline-offset-4 text-gray-600 hover:text-gray-900"
            >
              HIPAA Compliance
            </Link>
            <Link
              href="#"
              className="text-xs hover:underline underline-offset-4 text-gray-600 hover:text-gray-900"
            >
              Contact
            </Link>
          </nav>
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} VoiceMD. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
