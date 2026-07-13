'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import DataTable, { Column } from '@/components/modules/DataTable';
import { mockResolutions } from '@/lib/mock-data';
import { Resolution } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';

import { useEffect } from 'react';

export default function ResolutionsPage() {
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [selectedResolution, setSelectedResolution] = useState<Resolution | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchResolutions = async () => {
    try {
      const res = await fetch('/api/resolutions');
      if (res.ok) {
        const data = await res.json();
        setResolutions(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchResolutions();
  }, []);

  const columns: Column<Resolution>[] = [
    { key: 'title', label: 'Resolution Title', sortable: true },
    { key: 'type', label: 'Type' },
    { key: 'companyName', label: 'Company', sortable: true },
    { key: 'date', label: 'Date', render: (item) => formatDate(item.date) },
    { key: 'status', label: 'Status' }
  ];

  const handleRowClick = (res: Resolution) => {
    setSelectedResolution(res);
    setIsDetailOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resolutions</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage, draft, and track board and member resolutions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl">Upload Template</Button>
          <Button className="rounded-xl gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Create Resolution
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
        <DataTable
          data={resolutions}
          columns={columns}
          searchKeys={['title', 'companyName']}
          statusKey="status"
          statusOptions={['Draft', 'Approved', 'Filed']}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Resolution Details</DialogTitle>
          </DialogHeader>
          {selectedResolution && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground">Title</span>
                  <p className="text-sm font-semibold">{selectedResolution.title}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Type</span>
                  <p className="text-sm font-medium">{selectedResolution.type}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Status</span>
                  <div className="mt-0.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {selectedResolution.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Date</span>
                  <p className="text-sm font-medium">{formatDate(selectedResolution.date)}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Company</span>
                  <p className="text-sm font-medium">{selectedResolution.companyName}</p>
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Content Preview</span>
                <p className="text-xs text-muted-foreground mt-1 bg-secondary/30 p-3 rounded-lg border border-border leading-relaxed font-mono whitespace-pre-wrap">
                  {selectedResolution.description || 'No preview available.'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
