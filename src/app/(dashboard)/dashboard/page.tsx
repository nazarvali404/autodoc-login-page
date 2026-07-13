'use client';

import React from 'react';
import { motion } from 'motion/react';
import ModuleCard from '@/components/dashboard/ModuleCard';
import { moduleCards } from '@/lib/mock-data';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Manage your corporate documents and compliance.
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: 'Companies', value: '4', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Directors', value: '5', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Pending Filings', value: '2', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Templates', value: '3', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
        ].map((stat, i) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 md:p-5`}>
            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            <p className={`text-2xl md:text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {moduleCards.map((card, index) => (
          <ModuleCard key={card.id} card={card} index={index} />
        ))}
      </div>
    </div>
  );
}
