'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import type { ModuleCard as ModuleCardType } from '@/lib/types';
import {
  Database, Users, Building2, UserCheck, Shield, PieChart,
  Coins, MapPin, FileEdit, CalendarCheck, ArrowLeftRight,
  Award, FileSignature
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Database, Users, Building2, UserCheck, Shield, PieChart,
  Coins, MapPin, FileEdit, CalendarCheck, ArrowLeftRight,
  Award, FileSignature,
};

interface ModuleCardProps {
  card: ModuleCardType;
  index: number;
}

export default function ModuleCard({ card, index }: ModuleCardProps) {
  const Icon = iconMap[card.icon] || Database;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={card.href}>
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-shadow duration-300 hover:shadow-lg group"
          style={{ background: card.gradient }}
        >
          {/* Decorative circle */}
          <div
            className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 transition-transform duration-500 group-hover:scale-150"
            style={{ backgroundColor: card.color }}
          />
          <div
            className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10"
            style={{ backgroundColor: card.color }}
          />

          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${card.color}20`, color: card.color }}
          >
            <Icon className="w-6 h-6" />
          </div>

          {/* Content */}
          <h3 className="text-base font-semibold text-gray-800 mb-1.5 tracking-tight">
            {card.title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
            {card.description}
          </p>

          {/* Arrow indicator */}
          <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <svg className="w-4 h-4" style={{ color: card.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}