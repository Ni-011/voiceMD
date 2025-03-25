"use client";

import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Loader2, Send } from "lucide-react";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);

    // Simulate a delay
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get form data using the event target
    const target = e.target as typeof e.target & {
      name: { value: string };
      email: { value: string };
      message: { value: string };
    };

    console.log("Form submitted:", {
      name: target.name.value,
      email: target.email.value,
      message: target.message.value,
      timestamp: new Date().toISOString(),
    });
    const form = await fetch("/api/mail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: target.name.value,
        email: target.email.value,
        message: target.message.value,
        timestamp: new Date().toISOString(),
      }),
    });
    const jsn = await form.json();
    if (!form.ok) {
      console.error("Failed to send email:", jsn);
      setIsSubmitting(false);
      return;
    }

    console.log("Form response:", jsn);

    setSuccess(true);
    formRef.current?.reset();
    setIsSubmitting(false);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm">
          Message sent successfully! We'll get back to you soon.
        </div>
      )}
      <div className="space-y-4">
        <div className="space-y-2 group/name">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              id="name"
              required
              placeholder="Your name"
              className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover/name:border-emerald-500 group-hover/name:bg-emerald-50/50"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover/name:from-emerald-500/10 group-hover/name:to-emerald-500/10 transition-all duration-300 pointer-events-none"></div>
          </div>
        </div>
        <div className="space-y-2 group/email">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              id="email"
              required
              placeholder="your.email@example.com"
              className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover/email:border-emerald-500 group-hover/email:bg-emerald-50/50"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover/email:from-emerald-500/10 group-hover/email:to-emerald-500/10 transition-all duration-300 pointer-events-none"></div>
          </div>
        </div>
        <div className="space-y-2 group/message">
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700"
          >
            Message
          </label>
          <div className="relative">
            <textarea
              name="message"
              id="message"
              rows={4}
              required
              placeholder="How can we help you?"
              className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-300 resize-none bg-white/50 backdrop-blur-sm group-hover/message:border-emerald-500 group-hover/message:bg-emerald-50/50"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover/message:from-emerald-500/10 group-hover/message:to-emerald-500/10 transition-all duration-300 pointer-events-none"></div>
          </div>
        </div>
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-6 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Send Message
            <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </form>
  );
}
