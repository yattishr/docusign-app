import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// import FloatingBubbles from "@/components/FloatingBubbles";
import { LinkAccountButton } from "@/components/ui/link-account-button";

import {
  BrainCogIcon,
  GlobeIcon,
  MessageCircleWarning,
  MonitorSmartphoneIcon,
  ServerCogIcon,
  ZapIcon,
} from "lucide-react";

const features = [
  {
    name: "AI-Powered Email Composition",
    description: "Draft professional and personalized emails effortlessly with advanced AI assistance.",
    icon: BrainCogIcon,
  },
  {
    name: "Smart Email Search",
    description: "Quickly find specific emails or information using AI-enhanced search and RAG technology.",
    icon: MessageCircleWarning,
  },
  {
    name: "Automated Summaries",
    description: "Get concise summaries of long email threads to save time and stay informed.",
    icon: ServerCogIcon,
  },
  {
    name: "Context-Aware Replies",
    description: "Respond faster with AI-generated replies tailored to the conversation's context.",
    icon: GlobeIcon,
  },
  {
    name: "Inbox Organization",
    description: "Keep your inbox tidy with AI-driven email categorization and prioritization.",
    icon: ZapIcon,
  },
  {
    name: "Privacy and Security",
    description: "Enjoy secure email processing with a focus on data protection and encryption.",
    icon: BrainCogIcon,
  },
  {
    name: "Cross-Platform Compatibility",
    description: "Access your emails and AI features seamlessly on any device.",
    icon: GlobeIcon,
  },
  {
    name: "Blazing Fast Performance",
    description: "Experience lightning-fast email processing and AI assistance.",
    icon: ZapIcon,
  },
];

export default function Home() {
  return (
    <main className="flex-1 overflow-scroll p-2 lg:p-5 bg-gradient-to-bl from-white to-indigo-600">
      {/* <FloatingBubbles /> */}
      <div className="min-h-screen flex flex-col justify-center items-center py-12 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl w-full space-y-16 relative z-10">
          {/* Hero Section */}
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Transform your emails
              <span className="text-indigo-600"> into intelligent conversations.</span>
            </h1>
            <p className="mt-6 text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
              Introducing <span className="font-bold text-indigo-600">Signify AI</span>.
              Manage your emails smarter than ever—compose responses, search threads, and summarize conversations effortlessly with our intelligent AI.
            </p>

            <div className="flex flex-row gap-3 mt-2 justify-center items-center">
              <LinkAccountButton />
              <Button asChild className="text-lg px-8 py-3">
                <Link href="/mail">Get Started</Link>
              </Button>
            </div>

          </div>

          {/* Features Section */}
          <div className="bg-white/80 py-16 sm:py-24 rounded-lg shadow-xl">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                Powerful Features at Your Fingertips
              </h2>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-16">
                    <dt className="text-base font-semibold leading-7 text-gray-900">
                      <div className="absolute top-0 left-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      {feature.name}
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}