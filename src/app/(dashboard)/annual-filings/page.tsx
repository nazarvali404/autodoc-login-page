'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import DataTable, { Column } from '@/components/modules/DataTable';
import { mockAnnualFilings } from '@/lib/mock-data';
import { AnnualFiling } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

import { useEffect } from 'react';

export default function AnnualFilingsPage() {
  const [filings, setFilings] = useState<AnnualFiling[]>([]);

  const fetchFilings = async () => {
    try {
      const res = await fetch('/api/annual-filings');
      if (res.ok) {
        const data = await res.json();
        setFilings(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFilings();
  }, []);

  const columns: Column<AnnualFiling>[] = [
    { key: 'companyName', label: 'Company Name', sortable: true },
    { key: 'formType', label: 'Form Type' },
    { key: 'financialYear', label: 'Financial Year' },
    { key: 'dueDate', label: 'Due Date', render: (item) => formatDate(item.dueDate) },
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
          <h1 className="text-2xl font-bold tracking-tight">Annual Filings</h1>
          <p className="text-sm text-muted-foreground mt-1">Track compliance calendar and ROC annual filings</p>
        </div>
        <Button className="rounded-xl gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> New Filing
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
        <DataTable
          data={filings}
          columns={columns}
          searchKeys={['companyName', 'formType']}
          statusKey="status"
          statusOptions={['Filed', 'Pending', 'Overdue']}
        />
      </div>
    </motion.div>
  );
}
