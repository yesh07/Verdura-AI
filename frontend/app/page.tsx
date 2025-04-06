'use client'

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Leaf, ShoppingBag, Calendar, Package, Calculator, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

// Define features array for better organization
const features = [
  {
    title: "Fresh Marketplace",
    description: "Discover local farmers markets and fresh produce near you",
    icon: ShoppingBag,
    href: "/get-started",
    color: "text-primary",
  },
  {
    title: "Meal Planner",
    description: "Get personalized weekly meal plans based on your goals",
    icon: Calendar,
    href: "/planner",
    color: "text-blue-600",
  },
  {
    title: "Smart Bundles",
    description: "Curated food bundles tailored to your wellness goals",
    icon: Package,
    href: "/bundle",
    color: "text-purple-600",
  },
  {
    title: "Macro Analyzer",
    description: "Track your nutrition with our AI-powered analyzer",
    icon: Calculator,
    href: "/macro-analyzer",
    color: "text-secondary",
  },
  {
    title: "Wellness Chat",
    description: "Get personalized nutrition advice from our AI assistant",
    icon: MessageSquare,
    href: "/chat",
    color: "text-pink-600",
  },
];

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* Hero Section with enhanced visual appeal */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-50 via-white to-white">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
        
        <div className="container mx-auto max-w-4xl relative">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Eat Well. Live Fresh.
              <span className="text-primary block mt-2">Powered by AI.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Your AI-powered wellness companion for finding fresh produce, planning meals, and getting personalized nutrition advice.
            </p>
            <div className="flex justify-center">
              <Link href="/get-started">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-300 text-lg px-10 py-6 h-auto"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section with animations */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <motion.h2 
            className="text-3xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Discover Our Features
          </motion.h2>

          <motion.div 
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={feature.href}
                    className="group block p-6 bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg bg-gray-50 group-hover:bg-gray-100 ${feature.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section with enhanced styling */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-8 leading-tight">
              Start Your Wellness Journey Today with AI-Powered Nutrition Guidance
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Join our hackathon-winning platform and discover how AI can transform your approach to healthy eating and local food choices.
            </p>
            <Link href="/get-started">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-300 text-lg px-10 py-6 h-auto"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
