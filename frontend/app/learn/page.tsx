'use client'

import { motion } from "framer-motion"
import { ArrowRight, Leaf, MapPin, Brain, Heart } from "lucide-react"
import Link from "next/link"

export default function LearnMore() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const features = [
    {
      icon: <MapPin className="h-6 w-6 text-[#4CAF50]" />,
      title: "Local Focus",
      description: "Connect with Chicago's vibrant farmers' markets and local produce vendors."
    },
    {
      icon: <Brain className="h-6 w-6 text-[#4CAF50]" />,
      title: "AI-Powered Insights",
      description: "Get personalized recommendations based on local seasonal availability and your wellness goals."
    },
    {
      icon: <Heart className="h-6 w-6 text-[#4CAF50]" />,
      title: "Community Health",
      description: "Join a community of health-conscious Chicagoans making sustainable food choices."
    },
    {
      icon: <Leaf className="h-6 w-6 text-[#4CAF50]" />,
      title: "Seasonal Wisdom",
      description: "Learn about and enjoy the best local produce each season has to offer."
    }
  ]

  return (
    <div className="w-full">
      {/* Hero Section */}
      <motion.section 
        className="relative py-24 bg-gradient-to-b from-[#4CAF50]/5 to-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              {...fadeIn}
            >
              Connecting Chicago to
              <span className="text-[#4CAF50] block mt-2">Healthier Choices</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 mb-8"
              {...fadeIn}
              transition={{ delay: 0.2 }}
            >
              Verdura AI brings the power of artificial intelligence to Chicago's local food scene,
              helping you make healthier, more sustainable choices with produce from your neighborhood markets.
            </motion.p>
            <motion.div
              {...fadeIn}
              transition={{ delay: 0.4 }}
            >
              <Link 
                href="/marketplace"
                className="inline-flex items-center px-8 py-3 text-lg font-medium text-white bg-[#4CAF50] rounded-lg hover:bg-[#45a049] hover:shadow-lg transition-all"
              >
                Find Local Markets
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="initial"
            animate="animate"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-8 bg-gray-50/50 rounded-lg border-0 hover:shadow-lg transition-shadow"
                variants={fadeIn}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2 
              className="text-3xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Our Mission
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              We're on a mission to make healthy eating accessible and sustainable for every Chicagoan.
              By connecting local markets with AI-powered nutrition guidance, we're building a healthier,
              more connected food community in the heart of Chicago.
            </motion.p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join our community and discover the best local produce Chicago has to offer.
            </p>
            <Link 
              href="/sign-in"
              className="inline-flex items-center px-8 py-3 text-lg font-medium text-white bg-[#4CAF50] rounded-lg hover:bg-[#45a049] hover:shadow-lg transition-all"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
} 