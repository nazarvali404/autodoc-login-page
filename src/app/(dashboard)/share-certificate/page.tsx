'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import DataTable, { Column } from '@/components/modules/DataTable';
import { mockShareCertificates } from '@/lib/mock-data';
import { ShareCertificate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

import { useEffect } from 'react';

export default function ShareCertificatePage() {
  const [certificates, setCertificates] = useState<ShareCertificate[]>([]);

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/share-certificate');
      if (res.ok) {
        const data = await res.json();
        setCertificates(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const columns: Column<ShareCertificate>[] = [
    { key: 'certificateNo', label: 'Certificate No', sortable: true },
    { key: 'companyName', label: 'Company', sortable: true },
    { key: 'holderName', label: 'Holder' },
    { key: 'shares', label: 'Shares', render: (item) => item.shares.toLocaleString() },
    { key: 'issueDate', label: 'Issue Date', render: (item) => formatDate(item.issueDate) },
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
          <h1 className="text-2xl font-bold tracking-tight">Share Certificates</h1>
          <p className="text-sm text-muted-foreground mt-1">Issue and track physical/digital share certificates (Form SH-1)</p>
        </div>
        <Button className="rounded-xl gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Issue Certificate
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
        <DataTable
          data={certificates}
          columns={columns}
          searchKeys={['certificateNo', 'companyName', 'shareholderName']}
          statusKey="status"
          statusOptions={['Active', 'Cancelled', 'Transferred']}
        />
      </div>
    </motion.div>
  );
}
