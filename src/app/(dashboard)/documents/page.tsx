'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Download, Eye, FileText, CheckCircle2, Save, Trash2, Edit, X,
  Undo2, Redo2, Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Eraser, Table, ChevronDown
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';
import type { GeneratedDocument } from '@/lib/types';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<GeneratedDocument | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Real-time fields synchronization state
  const [docFields, setDocFields] = useState<Record<string, string>>({});

  const adminEditorRef = useRef<HTMLDivElement>(null);
  const [adminEditorHtml, setAdminEditorHtml] = useState<string>('');

  const executeAdminCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (adminEditorRef.current) {
      setAdminEditorHtml(adminEditorRef.current.innerHTML);
    }
  };

  const [showTableMenu, setShowTableMenu] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const insertAdminTable = () => {
    let tableHtml = '<table style="width:100%; border-collapse:collapse; border:1px solid #cbd5e1; margin:1rem 0;">';
    for (let r = 0; r < tableRows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < tableCols; c++) {
        tableHtml += '<td style="border:1px solid #cbd5e1; padding:10px 14px; min-width:80px; min-height:24px;">Cell</td>';
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</table>';
    executeAdminCommand('insertHTML', tableHtml);
    setShowTableMenu(false);
  };

  const getSelectedAdminTableCell = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node: Node | null = sel.getRangeAt(0).startContainer;
    while (node && node !== adminEditorRef.current) {
      if (node.nodeName === 'TD') return node as HTMLTableCellElement;
      node = node.parentNode;
    }
    return null;
  };

  const getSelectedAdminTableRow = () => {
    const cell = getSelectedAdminTableCell();
    return cell ? (cell.parentNode as HTMLTableRowElement) : null;
  };

  const getSelectedAdminTable = () => {
    const row = getSelectedAdminTableRow();
    return row ? (row.parentNode as HTMLTableElement) : null;
  };

  const insertAdminRow = (below = true) => {
    const row = getSelectedAdminTableRow();
    if (!row) return;
    const table = row.closest('table');
    if (!table) return;
    const newRow = table.insertRow(below ? row.rowIndex + 1 : row.rowIndex);
    const colsCount = row.cells.length;
    for (let i = 0; i < colsCount; i++) {
      const cell = newRow.insertCell();
      cell.innerHTML = 'New Cell';
      cell.setAttribute('style', 'border:1px solid #cbd5e1; padding:10px 14px; min-width:80px;');
    }
    if (adminEditorRef.current) setAdminEditorHtml(adminEditorRef.current.innerHTML);
  };

  const insertAdminColumn = (after = true) => {
    const cell = getSelectedAdminTableCell();
    if (!cell) return;
    const table = cell.closest('table');
    if (!table) return;
    const colIndex = cell.cellIndex;
    const rows = table.rows;
    for (let i = 0; i < rows.length; i++) {
      const newCell = rows[i].insertCell(after ? colIndex + 1 : colIndex);
      newCell.innerHTML = 'New Cell';
      newCell.setAttribute('style', 'border:1px solid #cbd5e1; padding:10px 14px; min-width:80px;');
    }
    if (adminEditorRef.current) setAdminEditorHtml(adminEditorRef.current.innerHTML);
  };

  const deleteAdminRow = () => {
    const row = getSelectedAdminTableRow();
    if (!row) return;
    const table = row.closest('table');
    if (!table) return;
    table.deleteRow(row.rowIndex);
    if (adminEditorRef.current) setAdminEditorHtml(adminEditorRef.current.innerHTML);
  };

  const deleteAdminColumn = () => {
    const cell = getSelectedAdminTableCell();
    if (!cell) return;
    const table = cell.closest('table');
    if (!table) return;
    const colIndex = cell.cellIndex;
    const rows = table.rows;
    for (let i = 0; i < rows.length; i++) {
      rows[i].deleteCell(colIndex);
    }
    if (adminEditorRef.current) setAdminEditorHtml(adminEditorRef.current.innerHTML);
  };

  const deleteAdminTable = () => {
    const table = getSelectedAdminTable();
    if (table) {
      table.remove();
      if (adminEditorRef.current) setAdminEditorHtml(adminEditorRef.current.innerHTML);
    }
  };

  // Sync variables changes into text page HTML in real-time
  useEffect(() => {
    if (selectedDoc && isPreviewOpen) {
      const compiled = getUpdatedHtml();
      setAdminEditorHtml(compiled);
      const timer = setTimeout(() => {
        if (adminEditorRef.current) {
          adminEditorRef.current.innerHTML = compiled;
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [docFields, selectedDoc, isPreviewOpen]);

  // Dynamic script loader for html2pdf
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/generated-documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Parse document HTML to find all unique fields and values
  const getFieldsFromHtml = (html: string): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const spans = doc.querySelectorAll('.field-value');
    const fieldsMap: Record<string, string> = {};
    spans.forEach(span => {
      const name = span.getAttribute('data-field-name');
      if (name) {
        let val = span.textContent || '';
        if (val === null || val === 'null' || val === undefined) {
          val = '';
        }
        fieldsMap[name] = val;
      }
    });
    return fieldsMap;
  };

  // Re-generate document HTML using current docFields state
  const getUpdatedHtml = () => {
    if (!selectedDoc) return '';
    if (typeof window === 'undefined') return selectedDoc.content;
    const parser = new DOMParser();
    const doc = parser.parseFromString(selectedDoc.content, 'text/html');
    const spans = doc.querySelectorAll('.field-value');
    spans.forEach(span => {
      const name = span.getAttribute('data-field-name');
      if (name && docFields[name] !== undefined) {
        let val = docFields[name];
        if (val === null || val === 'null' || val === undefined) {
          val = '';
        }
        span.textContent = val;
      }
    });
    return doc.body.innerHTML;
  };

  const handleOpenPreview = (doc: GeneratedDocument) => {
    let migratedContent = doc.content;
    const templateFields = doc.template?.fields || [];
    const fieldsMap: Record<string, string> = {};

    // 1. Extract already-replaced field values
    if (typeof window !== 'undefined') {
      const parser = new DOMParser();
      const tempDoc = parser.parseFromString(doc.content, 'text/html');
      const spans = tempDoc.querySelectorAll('.field-value');
      spans.forEach(span => {
        const name = span.getAttribute('data-field-name');
        if (name) {
          let val = span.textContent || '';
          if (val === null || val === 'null' || val === undefined) {
            val = '';
          }
          fieldsMap[name] = val;
        }
      });
    }

    // 2. Identify missing fields that are still raw brackets in the template, and convert on-the-fly
    templateFields.forEach(field => {
      if (fieldsMap[field.name] === undefined) {
        let val = field.defaultValue || '';
        if (val === null || val === 'null' || val === undefined) {
          val = '';
        }
        fieldsMap[field.name] = val;

        const spanWrapper = `<span class="field-value" data-field-name="${field.name}" style="background-color: rgba(59, 130, 246, 0.03); border-bottom: 1px dashed rgba(59, 130, 246, 0.2); font-weight: inherit; outline: none;">${val}</span>`;

        const relaxedNamePattern = field.name
          .split('')
          .map(char => char.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
          .join('(?:<[^>]*>)*');

        const pattern = new RegExp(
          '\\{\\s*(?:<[^>]*>)*\\s*(?:\\{\\s*(?:<[^>]*>)*\\s*)?' +
          relaxedNamePattern +
          '\\s*(?:<[^>]*>)*\\s*\\}' +
          '(?:\\s*(?:<[^>]*>)*\\s*\\})?' +
          '(?:\\s*(?:<[^>]*>)*\\s*&lt;[^&]*&gt;)?',
          'gi'
        );
        migratedContent = migratedContent.replace(pattern, spanWrapper);
      }
    });

    const migratedDoc = {
      ...doc,
      content: migratedContent
    };

    setSelectedDoc(migratedDoc);
    setDocFields(fieldsMap);
    setIsPreviewOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await fetch(`/api/generated-documents/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveDocFields = async () => {
    if (!selectedDoc) return;
    const finalHtml = adminEditorHtml || getUpdatedHtml();

    try {
      const res = await fetch(`/api/generated-documents/${selectedDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: finalHtml,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedDoc(updated);
        fetchDocuments();
        alert('Document updated successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPdf = () => {
    if (!selectedDoc) return;
    const finalHtml = adminEditorHtml || getUpdatedHtml();
    // @ts-ignore
    if (window.html2pdf) {
      const opt = {
        margin: 10,
        filename: `${selectedDoc.title.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      const container = document.createElement('div');
      container.innerHTML = finalHtml;
      container.style.padding = '20px';
      container.style.fontFamily = 'Inter, sans-serif';
      // @ts-ignore
      window.html2pdf().set(opt).from(container).save();
    } else {
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(`<html><head><title>${selectedDoc.title}</title></head><body>${finalHtml}</body></html>`);
        printWin.document.close();
        printWin.print();
      }
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
          <h1 className="text-2xl font-bold tracking-tight">Documents Archive</h1>
          <p className="text-sm text-muted-foreground mt-1">Generated compliance documents, certificates, and forms filled by users</p>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-20 bg-white border border-border rounded-2xl p-6 shadow-xs max-w-md mx-auto">
          <FileText className="w-12 h-12 text-muted-foreground/60 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">No documents generated yet</h3>
          <p className="text-xs text-muted-foreground mt-1.5">When users log in and complete questionnaire card forms, their generated files will appear here for your review.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Card className="hover:shadow-md transition-all duration-200 border border-border/85 rounded-2xl flex flex-col h-full">
                <CardHeader className="flex flex-row items-center gap-4 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base font-semibold truncate">{doc.title}</CardTitle>
                    <Badge variant="outline" className="mt-1 text-xs uppercase bg-blue-50/50 border-blue-200 text-blue-700">
                      {doc.template?.category || 'Compliance'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Source Template</span>
                      <span className="font-semibold text-foreground truncate max-w-[150px]">{doc.template?.name || 'Manual'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Generated Date</span>
                      <span className="font-semibold text-foreground">{formatDate(doc.createdAt)}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg gap-1.5 text-xs h-9"
                      onClick={() => handleOpenPreview(doc)}
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-lg p-2.5 h-9 text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDelete(doc.id, e)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Admin Split-Screen Preview & Variables Sidebar Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent showCloseButton={false} className="max-w-6xl w-[95vw] h-[90vh] sm:max-w-6xl sm:w-[95vw] sm:h-[90vh] flex flex-col rounded-3xl p-0 overflow-hidden bg-background">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">{selectedDoc?.title}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Use the right side panel to update variables in real-time</p>
            </div>
            <div className="flex items-center gap-2 mr-6">
              <Button size="sm" onClick={handleSaveDocFields} className="rounded-xl gap-1.5 h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4">
                <Save className="w-4 h-4" /> Save Changes
              </Button>
              <Button size="sm" onClick={handleDownloadPdf} className="rounded-xl gap-1.5 h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4">
                <Download className="w-4 h-4" /> Download PDF
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full w-8 h-8 hover:bg-slate-100" onClick={() => setIsPreviewOpen(false)}>
                <X className="w-4 h-4 text-slate-500" />
              </Button>
            </div>
          </div>

          {/* Split Content Area */}
          <div className="flex-1 flex overflow-hidden min-h-0 bg-slate-50/50">
            {/* Left Side: Document Preview (70%) with MS Word editor ribbon */}
            <div className="flex-1 flex flex-col h-full bg-slate-100/50 overflow-hidden border-r border-border">
              {/* MS Word Format Edit Toolbar Ribbon (exactly where the HEAR red box is!) */}
              <div className="flex flex-wrap items-center gap-2 px-6 py-2.5 border-b border-border bg-white flex-shrink-0">
                {/* Undo/Redo */}
                <div className="flex items-center gap-0.5">
                  <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Undo" onClick={() => executeAdminCommand('undo')}>
                    <Undo2 className="w-4 h-4 text-slate-600" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Redo" onClick={() => executeAdminCommand('redo')}>
                    <Redo2 className="w-4 h-4 text-slate-600" />
                  </Button>
                </div>
                
                <Separator orientation="vertical" className="mx-1 h-6 bg-slate-200" />

                {/* Heading Select */}
                <select
                  onChange={(e) => executeAdminCommand('formatBlock', e.target.value)}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer hover:border-slate-300"
                  title="Text Style"
                  defaultValue="<p>"
                >
                  <option value="<p>">Normal Text</option>
                  <option value="<h1>">Heading 1</option>
                  <option value="<h2>">Heading 2</option>
                  <option value="<h3>">Heading 3</option>
                </select>

                {/* Font Family Select */}
                <select
                  onChange={(e) => executeAdminCommand('fontName', e.target.value)}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer hover:border-slate-300 w-28"
                  title="Font Family"
                  defaultValue="Inter"
                >
                  <option value="Inter">Default (Inter)</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Trebuchet MS">Trebuchet MS</option>
                </select>

                {/* Font Size Select */}
                <select
                  onChange={(e) => executeAdminCommand('fontSize', e.target.value)}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer hover:border-slate-300"
                  title="Font Size"
                  defaultValue="3"
                >
                  <option value="1">10px</option>
                  <option value="2">13px</option>
                  <option value="3">16px</option>
                  <option value="4">18px</option>
                  <option value="5">24px</option>
                  <option value="6">32px</option>
                  <option value="7">48px</option>
                </select>

                <Separator orientation="vertical" className="mx-1 h-6 bg-slate-200" />

                {/* Character Styles */}
                <div className="flex items-center gap-0.5">
                  <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Bold" onClick={() => executeAdminCommand('bold')}>
                    <Bold className="w-4 h-4 text-slate-600" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Italic" onClick={() => executeAdminCommand('italic')}>
                    <Italic className="w-4 h-4 text-slate-600" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Underline" onClick={() => executeAdminCommand('underline')}>
                    <Underline className="w-4 h-4 text-slate-600" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Strikethrough" onClick={() => executeAdminCommand('strikeThrough')}>
                    <Strikethrough className="w-4 h-4 text-slate-600" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Subscript" onClick={() => executeAdminCommand('subscript')}>
                    <Subscript className="w-4 h-4 text-slate-600" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Superscript" onClick={() => executeAdminCommand('superscript')}>
                    <Superscript className="w-4 h-4 text-slate-600" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="mx-1 h-6 bg-slate-200" />

                {/* Colors */}
                <select
                  onChange={(e) => executeAdminCommand('foreColor', e.target.value)}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer hover:border-slate-300"
                  title="Text Color"
                  defaultValue="#0f172a"
                >
                  <option value="#0f172a">✒️ Black</option>
                  <option value="#3b82f6">✒️ Blue</option>
                  <option value="#ef4444">✒️ Red</option>
                  <option value="#22c55e">✒️ Green</option>
                  <option value="#eab308">✒️ Gold</option>
                  <option value="#a855f7">✒️ Purple</option>
                  <option value="#64748b">✒️ Slate</option>
                </select>

                <select
                  onChange={(e) => executeAdminCommand('hiliteColor', e.target.value)}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer hover:border-slate-300"
                  title="Highlight Color"
                  defaultValue="transparent"
                >
                  <option value="transparent">💡 No Highlight</option>
                  <option value="#fef08a">💡 Yellow</option>
                  <option value="#bbf7d0">💡 Green</option>
                  <option value="#bfdbfe">💡 Blue</option>
                  <option value="#fecaca">💡 Red</option>
                  <option value="#e9d5ff">💡 Purple</option>
                </select>

                <Separator orientation="vertical" className="mx-1 h-6 bg-slate-200" />

                {/* Alignments */}
                <div className="flex items-center gap-0.5">
                  <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Align Left" onClick={() => executeAdminCommand('justifyLeft')}>
                    <AlignLeft className="w-4 h-4 text-slate-600" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Align Center" onClick={() => executeAdminCommand('justifyCenter')}>
                    <AlignCenter className="w-4 h-4 text-slate-600" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Align Right" onClick={() => executeAdminCommand('justifyRight')}>
                    <AlignRight className="w-4 h-4 text-slate-600" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Justify" onClick={() => executeAdminCommand('justifyFull')}>
                    <AlignJustify className="w-4 h-4 text-slate-600" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="mx-1 h-6 bg-slate-200" />

                {/* Lists */}
                <div className="flex items-center gap-0.5">
                  <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Bullet List" onClick={() => executeAdminCommand('insertUnorderedList')}>
                    <List className="w-4 h-4 text-slate-600" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Numbered List" onClick={() => executeAdminCommand('insertOrderedList')}>
                    <ListOrdered className="w-4 h-4 text-slate-600" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded text-amber-600 hover:text-amber-800" title="Clear Formatting" onClick={() => executeAdminCommand('removeFormat')}>
                    <Eraser className="w-4 h-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="mx-1 h-6 bg-slate-200" />

                {/* Table Menu */}
                <div className="relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg gap-1.5 border border-slate-200 bg-white px-2 hover:border-slate-300"
                    onClick={() => setShowTableMenu(!showTableMenu)}
                  >
                    <Table className="w-4 h-4 text-slate-600" /> <span className="text-xs font-semibold text-slate-700">Table</span> <ChevronDown className="w-3 h-3 text-slate-400" />
                  </Button>
                  {showTableMenu && (
                    <Card className="absolute z-50 mt-1 p-3 w-48 shadow-lg border border-slate-200 bg-white flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span>Rows:</span>
                        <input
                          type="number"
                          value={tableRows}
                          onChange={e => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-12 h-6 border rounded px-1 text-center"
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span>Cols:</span>
                        <input
                          type="number"
                          value={tableCols}
                          onChange={e => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-12 h-6 border rounded px-1 text-center"
                        />
                      </div>
                      <Button type="button" size="sm" className="w-full text-xs h-7" onClick={insertAdminTable}>Insert Table</Button>
                    </Card>
                  )}
                </div>

                {/* Table quick adjustments */}
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="sm" className="h-8 text-xs rounded border border-slate-200 bg-white hover:border-slate-300 font-semibold text-slate-700 px-2" onClick={() => insertAdminRow(true)}>+ Row</Button>
                  <Button type="button" variant="ghost" size="sm" className="h-8 text-xs rounded border border-slate-200 bg-white hover:border-slate-300 font-semibold text-slate-700 px-2" onClick={() => insertAdminColumn(true)}>+ Col</Button>
                  <Button type="button" variant="ghost" size="sm" className="h-8 text-xs text-destructive border border-slate-200 bg-white hover:bg-destructive/5 hover:border-destructive/30 px-2 rounded" onClick={deleteAdminRow}>- Row</Button>
                  <Button type="button" variant="ghost" size="sm" className="h-8 text-xs text-destructive border border-slate-200 bg-white hover:bg-destructive/5 hover:border-destructive/30 px-2 rounded" onClick={deleteAdminColumn}>- Col</Button>
                </div>
              </div>

              {/* Scrollable White A4 Editor Page Workspace */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto flex justify-center items-start bg-slate-100/40">
                {selectedDoc ? (
                  <div
                    ref={adminEditorRef}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onInput={() => {
                      if (adminEditorRef.current) {
                        setAdminEditorHtml(adminEditorRef.current.innerHTML);
                      }
                    }}
                    className="editor-page prose prose-slate max-w-none text-[15px] focus:outline-none"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                  />
                ) : (
                  <div className="text-slate-400 text-sm font-medium self-center">Loading document preview...</div>
                )}
              </div>
            </div>

            {/* Right Side: Fields Sidebar Panel (30%) */}
            <div className="w-80 border-l border-border bg-card flex flex-col h-full">
              <div className="p-4 border-b border-border bg-muted/10">
                <h3 className="font-bold text-sm text-slate-800">Document Fields</h3>
                <p className="text-xs text-muted-foreground mt-1">Edit field inputs to dynamically modify the preview text.</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {Object.keys(docFields).length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted-foreground">
                    No custom placeholders detected in this document.
                  </div>
                ) : (
                  Object.keys(docFields).map(fieldName => (
                    <div key={fieldName} className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">{fieldName}</Label>
                      <Input
                        value={docFields[fieldName]}
                        onChange={e => {
                          const val = e.target.value;
                          setDocFields(prev => ({ ...prev, [fieldName]: val }));
                        }}
                        className="rounded-lg h-9 border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-blue-600/30"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}