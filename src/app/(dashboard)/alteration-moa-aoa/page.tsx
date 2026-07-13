'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import DataTable, { Column } from '@/components/modules/DataTable';
import { mockAlterations } from '@/lib/mock-data';
import { AlterationRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

import { useEffect } from 'react';

export default function AlterationPage() {
  const [alterations, setAlterations] = useState<AlterationRecord[]>([]);

  const fetchAlterations = async () => {
    try {
      const res = await fetch('/api/alteration-moa-aoa');
      if (res.ok) {
        const data = await res.json();
        setAlterations(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlterations();
  }, []);

  const columns: Column<AlterationRecord>[] = [
    { key: 'companyName', label: 'Company Name', sortable: true },
    { key: 'type', label: 'Type' },
    { key: 'description', label: 'Description' },
    { key: 'resolutionDate', label: 'Resolution Date', render: (item) => formatDate(item.resolutionDate) },
    { key: 'filingDate', label: 'Filing Date', render: (item) => formatDate(item.filingDate) },
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
          <h1 className="text-2xl font-bold tracking-tight">Alteration of MOA / AOA</h1>
          <p className="text-sm text-muted-foreground mt-1">Track alterations to the Memorandum and Articles of Association</p>
        </div>
        <Button className="rounded-xl gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> New Alteration
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
        <DataTable
          data={alterations}
          columns={columns}
          searchKeys={['companyName', 'type']}
          statusKey="status"
          statusOptions={['Approved', 'Pending', 'Filed']}
        />
      </div>
    </motion.div>
  );
}
