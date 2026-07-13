'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import DataTable, { Column } from '@/components/modules/DataTable';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useEffect } from 'react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isNewOpen, setIsNewOpen] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Staff');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns: Column<UserItem>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' }
  ];

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          role: newRole,
          password: 'user123',
        }),
      });

      if (res.ok) {
        fetchUsers();
        setIsNewOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
    setNewName('');
    setNewEmail('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage team members, clients, and role assignments</p>
        </div>
        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <Button onClick={() => setIsNewOpen(true)} className="rounded-xl gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Add User
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 py-2">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Amit Patel" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="amit@myworkspace.com" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Staff" className="mt-1" required />
              </div>
              <Button type="submit" className="w-full rounded-xl mt-2">Add User</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
        <DataTable
          data={users}
          columns={columns}
          searchKeys={['name', 'email', 'role']}
          statusKey="status"
          statusOptions={['Active', 'Pending']}
        />
      </div>
    </motion.div>
  );
}
