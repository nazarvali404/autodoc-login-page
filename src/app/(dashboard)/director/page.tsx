'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import DataTable, { Column } from '@/components/modules/DataTable';
import { Director } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/lib/utils';

export default function DirectorPage() {
  const [directors, setDirectors] = useState<Director[]>([]);
  const [selectedDirector, setSelectedDirector] = useState<Director | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);

  // Form states for creating new Director
  const [newName, setNewName] = useState('');
  const [newDin, setNewDin] = useState('');
  const [newPan, setNewPan] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');

  // Fetch from API
  const fetchDirectors = async () => {
    try {
      const res = await fetch('/api/directors');
      if (res.ok) {
        const data = await res.json();
        setDirectors(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDirectors();
  }, []);

  const columns: Column<Director>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'din', label: 'DIN', sortable: true },
    { key: 'pan', label: 'PAN' },
    { key: 'email', label: 'Email' },
    { key: 'companyName', label: 'Company' },
    { key: 'status', label: 'Status' }
  ];

  const handleRowClick = (director: Director) => {
    setSelectedDirector(director);
    setIsDetailOpen(true);
  };

  const handleCreateDirector = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/directors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          din: newDin,
          pan: newPan,
          email: newEmail,
          companyName: newCompany,
        }),
      });

      if (res.ok) {
        fetchDirectors();
        setIsNewOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
    // Reset form
    setNewName('');
    setNewDin('');
    setNewPan('');
    setNewEmail('');
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
          <h1 className="text-2xl font-bold tracking-tight">Directors</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage corporate directors and DIN associations</p>
        </div>
        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <Button onClick={() => setIsNewOpen(true)} className="rounded-xl gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> New Director
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Director</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateDirector} className="space-y-4 py-2">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="John Doe" className="mt-1" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="din">DIN (8 digits)</Label>
                  <Input id="din" value={newDin} onChange={e => setNewDin(e.target.value)} placeholder="12345678" className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="pan">PAN</Label>
                  <Input id="pan" value={newPan} onChange={e => setNewPan(e.target.value)} placeholder="ABCDE1234F" className="mt-1" required />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="john@example.com" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder="Company Name" className="mt-1" required />
              </div>
              <Button type="submit" className="w-full rounded-xl mt-2">Create Director</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
        <DataTable
          data={directors}
          columns={columns}
          searchKeys={['name', 'din', 'email', 'companyName']}
          statusKey="status"
          statusOptions={['Active', 'Resigned', 'Disqualified']}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Director Details</DialogTitle>
          </DialogHeader>
          {selectedDirector && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Name</span>
                  <p className="text-sm font-medium">{selectedDirector.name}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Status</span>
                  <div className="mt-0.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {selectedDirector.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">DIN</span>
                  <p className="text-sm font-medium">{selectedDirector.din}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">PAN</span>
                  <p className="text-sm font-medium">{selectedDirector.pan}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Email</span>
                  <p className="text-sm font-medium truncate">{selectedDirector.email}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Phone</span>
                  <p className="text-sm font-medium">{selectedDirector.phone || '—'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Appointment Date</span>
                  <p className="text-sm font-medium">{formatDate(selectedDirector.appointmentDate)}</p>
                </div>
                {selectedDirector.resignationDate && (
                  <div>
                    <span className="text-xs text-muted-foreground">Resignation Date</span>
                    <p className="text-sm font-medium">{formatDate(selectedDirector.resignationDate)}</p>
                  </div>
                )}
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Company</span>
                <p className="text-sm font-medium">{selectedDirector.companyName}</p>
              </div>
              {selectedDirector.address && (
                <div>
                  <span className="text-xs text-muted-foreground">Address</span>
                  <p className="text-sm font-medium text-wrap">{selectedDirector.address}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}