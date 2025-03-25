import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";
import { HowItWorks } from "@/components/how-it-works";
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
  Mail,
  Phone,
} from "lucide-react";
import { Metadata } from "next";
import { FAQ } from "@/components/faq";
import { Route } from "next";

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
    <div className="flex min-h-screen flex-col items-center w-full relative">
      {/* Background gradient limited to main content */}
      <div className="absolute inset-0 bottom-[68px] md:bottom-[100px] bg-gradient-to-b from-emerald-50 via-white to-emerald-50/30 pointer-events-none"></div>

      {/* Modern background patterns and elements */}
      <div className="absolute inset-0 bottom-[68px] md:bottom-[100px] overflow-hidden pointer-events-none">
        {/* 3D Mesh gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(4,120,87,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.1),transparent_50%),radial-gradient(ellipse_at_center,rgba(209,250,229,0.2),transparent_70%)] opacity-70"></div>

        {/* Animated gradient blobs */}
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-[800px] h-[800px] bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/30 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>

        {/* Additional decorative blobs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-100/40 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-1000"></div>
        <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-3000"></div>

        {/* Glassmorphism circles */}
        <div className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-gradient-to-br from-emerald-300/20 to-emerald-500/10 backdrop-blur-3xl border border-emerald-200/20 animate-float"></div>
        <div className="absolute bottom-40 left-[15%] w-80 h-80 rounded-full bg-gradient-to-tl from-emerald-200/10 to-emerald-400/5 backdrop-blur-3xl border border-emerald-100/20 animate-float animation-delay-2000"></div>

        {/* Modern grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4ade80_1px,transparent_1px),linear-gradient(to_bottom,#4ade80_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-[0.07]"></div>

        {/* Subtle dot pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#4ade80_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05]"></div>

        {/* 3D angle lines */}
        <div className="absolute inset-0 bg-[linear-gradient(60deg,#057a55_1px,transparent_1px),linear-gradient(-60deg,#057a55_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.03]"></div>

        {/* Green wave pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.2),transparent_70%)]"></div>

        {/* Subtle top gradients */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-emerald-50/50 to-transparent"></div>

        {/* Glowing accent spots */}
        <div className="absolute top-[15%] left-[20%] w-20 h-20 rounded-full bg-emerald-300/30 filter blur-xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-[35%] right-[15%] w-16 h-16 rounded-full bg-emerald-400/20 filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-[30%] left-[30%] w-24 h-24 rounded-full bg-emerald-200/30 filter blur-xl animate-pulse animation-delay-3000"></div>

        {/* Gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white/30"></div>
      </div>

      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2">
            <Link href={"/" as Route}>
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
            <Link
              href="#contact"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button
              className="bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
              asChild
            >
              <Link href={"/sign-in" as Route}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-32 relative overflow-hidden">
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
                  className="bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white shadow-sm hover:shadow-md cursor-pointer"
                  asChild
                >
                  <Link href={"/sign-in" as Route}>Start Free Trial</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                  asChild
                >
                  <Link href={"/sign-in" as Route}>View Dashboard Demo</Link>
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
          className="w-full py-12 md:py-24 lg:py-32 lg:pt-10 md:pt-10 relative overflow-hidden"
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

        {/* How It Works Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
          <HowItWorks />
        </section>

        {/* Pricing Section */}
        <section
          id="pricing"
          className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden"
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
                  className="bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white shadow-sm hover:shadow-md cursor-pointer"
                  asChild
                >
                  <Link href={"/sign-in" as Route}>Get Started Now</Link>
                </Button>
              </div>
            </div>
            <div className="mt-10 text-center text-sm text-gray-600">
              Limited time offer. Sign up now to lock in free access.
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section
          id="faq"
          className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden"
        >
          <div className="container px-4 md:px-6 max-w-7xl mx-auto relative">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
              <div className="inline-block rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-800 px-3 py-1 text-sm text-white shadow-sm">
                FAQ
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-gray-900 via-emerald-800 to-emerald-900 text-transparent bg-clip-text">
                Frequently asked questions
              </h2>
              <p className="text-gray-600 md:text-xl">
                Find answers to common questions about VoiceMD.
              </p>
            </div>
            <div className="mt-16">
              <FAQ
                items={[
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
                ]}
              />
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section
          id="contact"
          className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden"
        >
          <div className="container px-4 md:px-6 max-w-7xl mx-auto relative">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
              <div className="inline-block rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-800 px-3 py-1 text-sm text-white shadow-sm">
                Contact Us
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-gray-900 via-emerald-800 to-emerald-900 text-transparent bg-clip-text">
                Get in Touch
              </h2>
              <p className="text-gray-600 md:text-xl">
                Have questions? We&apos;d love to hear from you. Send us a
                message and we&apos;ll respond as soon as possible.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 max-w-6xl mx-auto">
              {/* Contact Information */}
              <div className="flex flex-col space-y-6 p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="flex items-center gap-3 relative">
                  <div className="p-2.5 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors duration-300">
                    <Mail className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Contact Information
                  </h3>
                </div>
                <div className="space-y-6 relative">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1 p-2.5 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors duration-300">
                      <Mail className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Email</h4>
                      <div className="space-y-2">
                        <a
                          href="mailto:nitin@voicemd.tech"
                          className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors group/link"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 group-hover/link:scale-150 transition-transform duration-300"></span>
                          nitin@voicemd.tech
                        </a>
                        <a
                          href="mailto:lakshya.kumar@voicemd.tech"
                          className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors group/link"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 group-hover/link:scale-150 transition-transform duration-300"></span>
                          lakshya.kumar@voicemd.tech
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="mt-1 p-2.5 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors duration-300">
                      <Phone className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Phone</h4>
                      <a
                        href="tel:+919560335724"
                        className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors group/link"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 group-hover/link:scale-150 transition-transform duration-300"></span>
                        +91 95603 35724
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="flex flex-col space-y-6 p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="flex items-center gap-3 relative">
                  <div className="p-2.5 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors duration-300">
                    <Mail className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Send us a Message
                  </h3>
                </div>
                <div className="relative">
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Simplified background elements */}
            <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-emerald-700/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-[800px] h-[800px] bg-emerald-800/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

            {/* Simplified patterns */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a5d1a_1px,transparent_1px)] [background-size:3rem_3rem] opacity-5"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/30 via-transparent to-emerald-900/30"></div>
          </div>
          <div className="container px-4 md:px-6 max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col items-center justify-center space-y-8 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to transform your practice?
              </h2>
              <p className="md:text-xl/relaxed text-gray-300">
                Join thousands of healthcare professionals who are saving time
                and improving patient care with VoiceMD.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 relative z-20">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative"
                  asChild
                >
                  <Link href={"/sign-in" as Route}>Start Your Free Trial</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-black hover:bg-gray-100 shadow-sm hover:shadow-md cursor-pointer relative"
                  asChild
                >
                  <Link href={"/sign-in" as Route}>Schedule a Demo</Link>
                </Button>
              </div>
              <p className="text-sm text-gray-300">No credit card required.</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-white py-6 md:py-12 relative z-10">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 text-center max-w-7xl mx-auto relative bg-white">
          <div className="flex items-center gap-2">
            <Link href={"/" as Route}>
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
              href="#contact"
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
