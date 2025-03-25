"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export function FAQ({ items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-3 sm:gap-4">
      {items.map((faq, i) => (
        <div
          key={i}
          className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-sm border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300"
        >
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div
            className="flex items-center justify-between p-4 sm:p-6 cursor-pointer relative"
            onClick={() => toggleFAQ(i)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleFAQ(i);
              }
            }}
            aria-expanded={openIndex === i}
            aria-controls={`faq-answer-${i}`}
          >
            <div className="flex items-center gap-2 sm:gap-3 flex-1 pr-4">
              <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors duration-300 shrink-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors leading-tight">
                {faq.question}
              </h3>
            </div>
            <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors shrink-0">
              <svg
                className={`w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 transform transition-transform duration-300 ${
                  openIndex === i ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
          <div
            id={`faq-answer-${i}`}
            className={`relative overflow-hidden transition-all duration-300 ${
              openIndex === i
                ? "max-h-[500px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
            aria-hidden={openIndex !== i}
          >
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
