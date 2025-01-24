"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Montserrat } from "next/font/google";

import { IconMoodPuzzled } from '@tabler/icons-react';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})


export default function NotFound() {
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen dark:from-blue-900 dark:to-gray-900 px-4 ${montserrat.className}`}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <IconMoodPuzzled className="w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 text-[#242F5C]"/>
          <h1 className="text-6xl sm:text-7xl lg:text-9xl font-extrabold text-[#242F5C]">404</h1>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 10 }}
          className="mt-4 text-xl sm:text-2xl font-semibold text-[#242F5C]"
        >
          Oops! Page Not Found
        </motion.div>
        <p className="mt-4 text-base sm:text-lg text-[#242F5C] px-4">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8"
      >
        <Link 
          href="/" 
          className="inline-flex items-center px-6 py-3 rounded-full bg-[#242F5C] text-white hover:scale-105 transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Return Home
        </Link>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-12"
      >
      </motion.div>
    </div>
  )
}

