'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import DataTable, { Column } from '@/components/modules/DataTable';
import { mockShareholders } from '@/lib/mock-data';
import { Shareholder } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ShareholderPage() {
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [selectedShareholder, setSelectedShareholder] = useState<Shareholder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);

  // Form states for creating new Shareholder
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newType, setNewType] = useState('Equity');
  const [newShares, setNewShares] = useState(0);

  const fetchShareholders = async () => {
    try {
      const res = await fetch('/api/shareholders');
      if (res.ok) {
        const data = await res.json();
        setShareholders(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchShareholders();
  }, []);

  const columns: Column<Shareholder>[] = [
    { key: 'name', label: 'Shareholder Name', sortable: true },
    { key: 'companyName', label: 'Company', sortable: true },
    { key: 'type', label: 'Type' },
    { key: 'shares', label: 'Shares', render: (item) => item.shares.toLocaleString() },
    { key: 'percentage', label: 'Percentage', render: (item) => `${item.percentage}%` },
    { key: 'shareCertificate', label: 'Certificate No' }
  ];

  const handleRowClick = (sh: Shareholder) => {
    setSelectedShareholder(sh);
    setIsDetailOpen(true);
  };

  const handleCreateShareholder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/shareholders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          companyName: newCompany,
          shares: Number(newShares),
          shareCertificate: `CERT-${1000 + shareholders.length + 1}`,
          type: 'Individual',
        }),
      });

      if (res.ok) {
        fetchShareholders();
        setIsNewOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
    // Reset form
    setNewName('');
    setNewCompany('');
    setNewShares(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shareholders</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage corporate shareholder registers and equity allocations</p>
        </div>
        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <Button onClick={() => setIsNewOpen(true)} className="rounded-xl gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> New Shareholder
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Shareholder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateShareholder} className="space-y-4 py-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Jane Doe" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder="Company Name" className="mt-1" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shares">Shares Count</Label>
                  <Input id="shares" type="number" value={newShares} onChange={e => setNewShares(Number(e.target.value))} placeholder="1000" className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="type">Share Type</Label>
                  <Input id="type" value={newType} onChange={e => setNewType(e.target.value)} placeholder="Equity" className="mt-1" required />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl mt-2">Create Shareholder</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
        <DataTable
          data={shareholders}
          columns={columns}
          searchKeys={['name', 'companyName']}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Shareholder Details</DialogTitle>
          </DialogHeader>
          {selectedShareholder && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Name</span>
                  <p className="text-sm font-medium">{selectedShareholder.name}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Type</span>
                  <p className="text-sm font-medium">{selectedShareholder.type}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Shares Count</span>
                  <p className="text-sm font-medium">{selectedShareholder.shares.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Percentage</span>
                  <p className="text-sm font-medium">{selectedShareholder.percentage}%</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Certificate No</span>
                  <p className="text-sm font-medium">{selectedShareholder.shareCertificate}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Company</span>
                  <p className="text-sm font-medium">{selectedShareholder.companyName}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
