'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import DataTable, { Column } from '@/components/modules/DataTable';
import { mockAuditors } from '@/lib/mock-data';
import { Auditor } from '@/lib/types';
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

export default function AuditorPage() {
  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [selectedAuditor, setSelectedAuditor] = useState<Auditor | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [newFirmName, setNewFirmName] = useState('');
  const [newMembershipNo, setNewMembershipNo] = useState('');
  const [newCompany, setNewCompany] = useState('');

  const fetchAuditors = async () => {
    try {
      const res = await fetch('/api/auditors');
      if (res.ok) {
        const data = await res.json();
        setAuditors(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAuditors();
  }, []);

  const columns: Column<Auditor>[] = [
    { key: 'name', label: 'Auditor Name', sortable: true },
    { key: 'firmName', label: 'Firm Name', sortable: true },
    { key: 'membershipNo', label: 'Membership No' },
    { key: 'companyName', label: 'Company' },
    { key: 'status', label: 'Status' }
  ];

  const handleRowClick = (aud: Auditor) => {
    setSelectedAuditor(aud);
    setIsDetailOpen(true);
  };

  const handleCreateAuditor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auditors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          firmName: newFirmName,
          membershipNo: newMembershipNo,
          companyName: newCompany,
        }),
      });

      if (res.ok) {
        fetchAuditors();
        setIsNewOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
    setNewName('');
    setNewFirmName('');
    setNewMembershipNo('');
    setNewCompany('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Auditors</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage external auditors, firms, and appointment records</p>
        </div>
        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <Button onClick={() => setIsNewOpen(true)} className="rounded-xl gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> New Auditor
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Auditor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAuditor} className="space-y-4 py-2">
              <div>
                <Label htmlFor="name">Auditor Name</Label>
                <Input id="name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Mr. Rajesh Kumar" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="firm">Firm Name</Label>
                <Input id="firm" value={newFirmName} onChange={e => setNewFirmName(e.target.value)} placeholder="Kumar & Associates" className="mt-1" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="membership">Membership No</Label>
                  <Input id="membership" value={newMembershipNo} onChange={e => setNewMembershipNo(e.target.value)} placeholder="FCA-12345" className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder="Apex Ltd" className="mt-1" required />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl mt-2">Create Auditor</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
        <DataTable
          data={auditors}
          columns={columns}
          searchKeys={['name', 'firmName', 'companyName']}
          statusKey="status"
          statusOptions={['Active', 'Resigned']}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Auditor Details</DialogTitle>
          </DialogHeader>
          {selectedAuditor && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Name</span>
                  <p className="text-sm font-medium">{selectedAuditor.name}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Status</span>
                  <div className="mt-0.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {selectedAuditor.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Firm Name</span>
                  <p className="text-sm font-medium">{selectedAuditor.firmName}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Membership No</span>
                  <p className="text-sm font-medium">{selectedAuditor.membershipNo}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Company</span>
                  <p className="text-sm font-medium">{selectedAuditor.companyName}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
