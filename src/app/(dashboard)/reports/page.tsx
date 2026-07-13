'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, PieChart, LineChart, TrendingUp } from 'lucide-react';

const mockReports = [
  { title: 'Compliance Status', desc: 'Breakdown of compliance filing deadlines and ROC filings status.', icon: PieChart, color: 'text-indigo-500 bg-indigo-500/10' },
  { title: 'Filing Summary', desc: 'Summary of annual filing forms submitted, pending, and overdue.', icon: BarChart3, color: 'text-blue-500 bg-blue-500/10' },
  { title: 'Director Activity', desc: 'History of director appointments, resignations, and DIN compliance updates.', icon: LineChart, color: 'text-emerald-500 bg-emerald-500/10' },
  { title: 'Document Generation', desc: 'Analytics on created resolutions, forms, and custom templates.', icon: TrendingUp, color: 'text-amber-500 bg-amber-500/10' }
];

export default function ReportsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Review organizational analytics, filing trends, and compliance metrics</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {mockReports.map((report, idx) => {
          const Icon = report.icon;
          return (
            <motion.div
              key={report.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:shadow-md transition-all duration-200 border border-border/85 rounded-2xl h-full flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center gap-4 pb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${report.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base font-semibold">{report.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">{report.desc}</p>
                  
                  {/* Mock Chart Area */}
                  <div className="h-32 bg-secondary/20 border border-border/50 rounded-xl flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Chart visual representation</span>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button variant="outline" size="sm" className="rounded-lg text-xs h-9">
                      View Report
                    </Button>
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
