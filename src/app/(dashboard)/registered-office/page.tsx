'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import DataTable, { Column } from '@/components/modules/DataTable';
import { mockRegisteredOffices } from '@/lib/mock-data';
import { RegisteredOffice } from '@/lib/types';
import { formatDate } from '@/lib/utils';

import { useEffect } from 'react';

export default function RegisteredOfficePage() {
  const [offices, setOffices] = useState<RegisteredOffice[]>([]);

  const fetchOffices = async () => {
    try {
      const res = await fetch('/api/registered-office');
      if (res.ok) {
        const data = await res.json();
        setOffices(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, []);

  const columns: Column<RegisteredOffice>[] = [
    { key: 'companyName', label: 'Company Name', sortable: true },
    { key: 'address', label: 'Address', render: (item) => `${item.address}, ${item.city}, ${item.state} - ${item.pincode}` },
    { key: 'effectiveDate', label: 'Effective Date', render: (item) => formatDate(item.effectiveDate) },
    { key: 'status', label: 'Status' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Registered Office</h1>
          <p className="text-sm text-muted-foreground mt-1">Track registered office addresses and location history</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
        <DataTable
          data={offices}
          columns={columns}
          searchKeys={['companyName', 'city', 'state']}
          statusKey="status"
          statusOptions={['Current', 'Changed']}
        />
      </div>
    </motion.div>
  );
}
