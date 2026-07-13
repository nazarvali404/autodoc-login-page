'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import DataTable, { Column } from '@/components/modules/DataTable';
import { mockShareCapital } from '@/lib/mock-data';
import { ShareCapital } from '@/lib/types';

import { useEffect } from 'react';

export default function ShareCapitalPage() {
  const [capitals, setCapitals] = useState<ShareCapital[]>([]);

  const fetchCapitals = async () => {
    try {
      const res = await fetch('/api/share-capital');
      if (res.ok) {
        const data = await res.json();
        setCapitals(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCapitals();
  }, []);

  const columns: Column<ShareCapital>[] = [
    { key: 'companyName', label: 'Company Name', sortable: true },
    { key: 'authorizedCapital', label: 'Authorized Capital', render: (item) => `₹${item.authorizedCapital}` },
    { key: 'paidUpCapital', label: 'Paid-Up Capital', render: (item) => `₹${item.paidUpCapital}` },
    { key: 'faceValue', label: 'Face Value', render: (item) => `₹${item.faceValue}` },
    { key: 'totalShares', label: 'Total Shares', render: (item) => item.totalShares.toLocaleString() },
    { key: 'equityShares', label: 'Equity Shares', render: (item) => item.equityShares.toLocaleString() },
    { key: 'preferenceShares', label: 'Preference Shares', render: (item) => item.preferenceShares.toLocaleString() }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Share Capital</h1>
          <p className="text-sm text-muted-foreground mt-1">Authorized and paid-up share capital structure details</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
        <DataTable
          data={capitals}
          columns={columns}
          searchKeys={['companyName']}
        />
      </div>
    </motion.div>
  );
}
