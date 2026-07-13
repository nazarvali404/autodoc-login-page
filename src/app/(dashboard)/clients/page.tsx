'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import DataTable, { Column } from '@/components/modules/DataTable';
import { Client } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ClientPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);

  // Form states for creating new Client
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const columns: Column<Client>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'company', label: 'Company', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status' }
  ];

  const handleRowClick = (client: Client) => {
    setSelectedClient(client);
    setIsDetailOpen(true);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          company: newCompany,
          email: newEmail,
          phone: newPhone,
        }),
      });

      if (res.ok) {
        fetchClients();
        setIsNewOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
    // Reset form
    setNewName('');
    setNewCompany('');
    setNewEmail('');
    setNewPhone('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage client records and contact information</p>
        </div>
        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <Button onClick={() => setIsNewOpen(true)} className="rounded-xl gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> New Client
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateClient} className="space-y-4 py-2">
              <div>
                <Label htmlFor="name">Client Name</Label>
                <Input id="name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Jane Smith" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder="Apex Ltd" className="mt-1" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="jane@apex.com" className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+91 98765 43210" className="mt-1" required />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl mt-2">Create Client</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
        <DataTable
          data={clients}
          columns={columns}
          searchKeys={['name', 'company', 'email']}
          statusKey="status"
          statusOptions={['Active', 'Inactive', 'Pending']}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Name</span>
                  <p className="text-sm font-medium">{selectedClient.name}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Status</span>
                  <div className="mt-0.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {selectedClient.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Company</span>
                  <p className="text-sm font-medium">{selectedClient.company}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Email</span>
                  <p className="text-sm font-medium truncate">{selectedClient.email}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Phone</span>
                  <p className="text-sm font-medium">{selectedClient.phone}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}