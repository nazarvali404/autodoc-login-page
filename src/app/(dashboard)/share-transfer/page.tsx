'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

// Local mock data since share transfers might not be fully in mock-data.ts
const mockTransfers = [
  { id: '1', company: 'TechVista Solutions', from: 'Amit Sharma', to: 'Priya Patel', shares: 5000, value: 50000, date: '2024-05-12', status: 'Approved' },
  { id: '2', company: 'Apex Industries Ltd', from: 'Rohan Gupta', to: 'Vikram Singh', shares: 2500, value: 25000, date: '2024-06-01', status: 'Pending' },
  { id: '3', company: 'Nexon Ventures', from: 'Siddharth Roy', to: 'Ananya Sen', shares: 10000, value: 100000, date: '2024-04-18', status: 'Approved' }
];

export default function ShareTransferPage() {
  const [transfers, setTransfers] = useState(mockTransfers);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Split / Transfer of Shares</h1>
          <p className="text-sm text-muted-foreground mt-1">Record and verify share transfers and share split histories</p>
        </div>
        <Button className="rounded-xl gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> New Transfer
        </Button>
      </div>

      <div className="grid gap-4">
        {transfers.map(t => (
          <Card key={t.id} className="overflow-hidden border border-border/80 hover:shadow-md transition-all duration-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">{t.company}</span>
                  <div className="flex items-center gap-3 font-semibold text-foreground">
                    <span>{t.from}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span>{t.to}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 md:gap-8">
                  <div>
                    <span className="block text-xs text-muted-foreground">Shares</span>
                    <span className="text-sm font-semibold">{t.shares.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground">Transfer Value</span>
                    <span className="text-sm font-semibold">₹{t.value.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground">Date</span>
                    <span className="text-sm font-semibold">{formatDate(t.date)}</span>
                  </div>
                  <Badge className="capitalize rounded-full px-3 py-1 font-medium bg-emerald-100 text-emerald-700 border-none">
                    {t.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
