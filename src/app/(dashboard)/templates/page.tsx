'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Plus, FileText, ArrowRight, Trash2, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import { DocumentTemplate } from '@/lib/types';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the template "${name}"?`)) return;

    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert('Failed to delete template');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting template');
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    setIsCreating(true);

    try {
      let content = '<p>Start typing your template here...</p>';
      let pdfData: string | null = null;
      let fields: Array<{ name: string; type: string; required: boolean }> = [];

      if (uploadFile) {
        if (uploadFile.type === 'application/pdf' || uploadFile.name.toLowerCase().endsWith('.pdf')) {
          pdfData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(uploadFile);
          });
          content = `<h1>PDF IMPORT: ${uploadFile.name.replace('.pdf', '')}</h1>
<p>This document template is linked to the uploaded PDF file: <strong>${uploadFile.name}</strong>.</p>
<table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; margin: 15px 0;">
  <thead>
    <tr style="background-color: #f8fafc;">
      <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left;">Field Key</th>
      <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left;">Description / Placeholder</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #cbd5e1; padding: 10px;">Company Name</td>
      <td style="border: 1px solid #cbd5e1; padding: 10px;">{{Company Name}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #cbd5e1; padding: 10px;">Corporate ID (CIN)</td>
      <td style="border: 1px solid #cbd5e1; padding: 10px;">{{CIN}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #cbd5e1; padding: 10px;">Registered Address</td>
      <td style="border: 1px solid #cbd5e1; padding: 10px;">{{Address}}</td>
    </tr>
  </tbody>
</table>
<p>Please edit the table or text, highlight selections, and click <strong>"Create New Field"</strong> to mark variables.</p>`;
        } else if (uploadFile.name.endsWith('.docx')) {
          const arrayBuffer = await uploadFile.arrayBuffer();
          const mammoth = await import('mammoth');
          const result = await mammoth.convertToHtml({ arrayBuffer });
          content = result.value;
        } else {
          const text = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsText(uploadFile);
          });
          content = `<div>${text.replace(/\n/g, '<br/>')}</div>`;
        }
      }


      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTemplateName,
          category: newCategory,
          status: 'Active',
          content,
          pdfData,
          fields,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setOpenDialog(false);
        setNewTemplateName('');
        setNewCategory('General');
        setUploadFile(null);
        router.push(`/templates/editor?id=${created.id}`);
      } else {
        alert('Failed to create template');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating template');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Document Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Design and manage reusable document templates with placeholders</p>
        </div>

        <Button onClick={() => setOpenDialog(true)} className="rounded-xl gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> New Template
        </Button>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Document Template</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTemplate} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g. Board Resolution"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newCategory} onValueChange={(v) => setNewCategory(v || 'General')}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Board Resolution">Board Resolution</SelectItem>
                    <SelectItem value="Share Transfer">Share Transfer</SelectItem>
                    <SelectItem value="MOA/AOA">MOA/AOA</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload File (Optional)</Label>
                <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition cursor-pointer relative">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground text-center">
                    {uploadFile ? uploadFile.name : 'Drag & drop or click to upload (.docx, .pdf, .txt)'}
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".docx,.pdf,.txt"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                {uploadFile && (
                  <div className="flex justify-between items-center bg-muted p-2 rounded text-xs">
                    <span className="truncate">{uploadFile.name}</span>
                    <button type="button" onClick={() => setUploadFile(null)} className="text-destructive font-semibold">Remove</button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create & Open Editor'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((temp, idx) => (
          <motion.div
            key={temp.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="relative group"
          >
            <Card className="hover:shadow-md transition-all duration-200 border border-border/85 rounded-2xl flex flex-col h-full">
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(temp.id, temp.name); }}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive hover:text-white z-10"
                title="Delete Template"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <CardHeader className="flex flex-row items-center gap-4 pb-3 pr-10">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base font-semibold truncate">{temp.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1 text-xs">{temp.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Fields Count</span>
                    <span className="font-semibold text-foreground">{temp.fields?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created Date</span>
                    <span className="font-semibold text-foreground">{formatDate(temp.createdAt)}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <Badge className="capitalize rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 border-none">
                    {temp.status}
                  </Badge>
                  <Link href={`/templates/editor?id=${temp.id}`} className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                    Edit Template <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}