'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Calendar, Layout, FolderKanban, UserSquare2 } from 'lucide-react';

const masterSections = [
  { title: 'Document Types', description: 'Configure system document categories and templates', count: 12, icon: FileText, color: 'bg-orange-500/10 text-orange-500' },
  { title: 'Compliance Calendar', description: 'Define compliance deadlines and form associations', count: 8, icon: Calendar, color: 'bg-blue-500/10 text-blue-500' },
  { title: 'Form Templates', description: 'Manage system-wide forms and ROC templates', count: 15, icon: Layout, color: 'bg-purple-500/10 text-purple-500' },
  { title: 'Company Categories', description: 'Manage company classes, types, and categories', count: 6, icon: FolderKanban, color: 'bg-emerald-500/10 text-emerald-500' },
  { title: 'Designation Types', description: 'Configure board designation codes and roles', count: 5, icon: UserSquare2, color: 'bg-pink-500/10 text-pink-500' }
];

export default function MastersPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Masters</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage master data configuration rules, codes, and static data</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {masterSections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <motion.div
              key={sec.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border border-border/85 rounded-2xl">
                <CardHeader className="flex flex-row items-center gap-4 pb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sec.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base font-semibold">{sec.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">{sec.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-semibold text-muted-foreground">Configured Items</span>
                    <span className="text-sm font-bold text-foreground">{sec.count}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
