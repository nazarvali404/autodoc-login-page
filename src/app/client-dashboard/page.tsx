'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
  FileText, Shield, CheckCircle2, ChevronDown, LogOut, Star, FileCheck, ArrowRight, Download, X,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Undo2, Redo2, Strikethrough, Subscript, Superscript, List, ListOrdered, Eraser, Table
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

import type { DocumentTemplate } from '@/lib/types';

export default function ClientDashboardPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [successDoc, setSuccessDoc] = useState<{ title: string; html: string } | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const clientEditorRef = useRef<HTMLDivElement>(null);
  const [clientEditorHtml, setClientEditorHtml] = useState<string>('');

  const executeClientCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (clientEditorRef.current) {
      setClientEditorHtml(clientEditorRef.current.innerHTML);
    }
  };

  const [showTableMenu, setShowTableMenu] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const insertClientTable = () => {
    let tableHtml = '<table style="width:100%; border-collapse:collapse; border:1px solid #cbd5e1; margin:1rem 0;">';
    for (let r = 0; r < tableRows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < tableCols; c++) {
        tableHtml += '<td style="border:1px solid #cbd5e1; padding:10px 14px; min-width:80px; min-height:24px;">Cell</td>';
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</table>';
    executeClientCommand('insertHTML', tableHtml);
    setShowTableMenu(false);
  };

  const getSelectedClientTableCell = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node: Node | null = sel.getRangeAt(0).startContainer;
    while (node && node !== clientEditorRef.current) {
      if (node.nodeName === 'TD') return node as HTMLTableCellElement;
      node = node.parentNode;
    }
    return null;
  };

  const getSelectedClientTableRow = () => {
    const cell = getSelectedClientTableCell();
    return cell ? (cell.parentNode as HTMLTableRowElement) : null;
  };

  const getSelectedClientTable = () => {
    const row = getSelectedClientTableRow();
    return row ? (row.parentNode as HTMLTableElement) : null;
  };

  const insertClientRow = (below = true) => {
    const row = getSelectedClientTableRow();
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
    if (clientEditorRef.current) setClientEditorHtml(clientEditorRef.current.innerHTML);
  };

  const insertClientColumn = (after = true) => {
    const cell = getSelectedClientTableCell();
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
    if (clientEditorRef.current) setClientEditorHtml(clientEditorRef.current.innerHTML);
  };

  const deleteClientRow = () => {
    const row = getSelectedClientTableRow();
    if (!row) return;
    const table = row.closest('table');
    if (!table) return;
    table.deleteRow(row.rowIndex);
    if (clientEditorRef.current) setClientEditorHtml(clientEditorRef.current.innerHTML);
  };

  const deleteClientColumn = () => {
    const cell = getSelectedClientTableCell();
    if (!cell) return;
    const table = cell.closest('table');
    if (!table) return;
    const colIndex = cell.cellIndex;
    const rows = table.rows;
    for (let i = 0; i < rows.length; i++) {
      rows[i].deleteCell(colIndex);
    }
    if (clientEditorRef.current) setClientEditorHtml(clientEditorRef.current.innerHTML);
  };

  const deleteClientTable = () => {
    const table = getSelectedClientTable();
    if (table) {
      table.remove();
      if (clientEditorRef.current) setClientEditorHtml(clientEditorRef.current.innerHTML);
    }
  };

  // Synchronize form checklist values to the editable text editor content live
  useEffect(() => {
    if (selectedTemplate && isFormOpen) {
      const compiled = getLiveClientHtml();
      setClientEditorHtml(compiled);
      const timer = setTimeout(() => {
        if (clientEditorRef.current) {
          clientEditorRef.current.innerHTML = compiled;
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [formValues, selectedTemplate, isFormOpen]);

  // Load html2pdf script
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

  const handleDownloadSuccessPdf = () => {
    if (!successDoc) return;
    // @ts-ignore
    if (window.html2pdf) {
      const opt = {
        margin: 10,
        filename: `${successDoc.title.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      const container = document.createElement('div');
      container.id = 'pdf-temp-container-client';
      container.innerHTML = successDoc.html;
      container.style.padding = '24px';
      container.style.fontFamily = 'Inter, sans-serif';
      
      const style = document.createElement('style');
      style.innerHTML = `
        #pdf-temp-container-client { background-color: #ffffff !important; color: #0f172a !important; }
        #pdf-temp-container-client, #pdf-temp-container-client * { color: #0f172a !important; background-color: transparent !important; }
      `;
      container.appendChild(style);
      // @ts-ignore
      window.html2pdf().set(opt).from(container).save();
    }
  };

  // Load html2pdf script
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

  // Fetch templates from API
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
    }
  };

  const handleTemplateClick = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setFormValues({});
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setGenerating(true);

    // Save the current contents of the live text editor (including manual edits)
    const mergedHtml = clientEditorHtml || getLiveClientHtml();

    const docTitle = `${selectedTemplate.name} - Generated`;

    try {
      // 1. Post to GeneratedDocument table
      const res = await fetch('/api/generated-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: docTitle,
          content: mergedHtml,
          status: 'Final',
          templateId: selectedTemplate.id,
        }),
      });

      if (res.ok) {
        // 2. Trigger auto registration of Company if the template name is 'create company'
        if (selectedTemplate.name.toLowerCase() === 'create company') {
          const companyName = formValues['Company Name'] || formValues['name'] || 'New Company';
          const cin = formValues['CIN'] || formValues['cin'] || `U${Math.floor(100000 + Math.random() * 900000)}MH2026PTC${Math.floor(100000 + Math.random() * 900000)}`;
          const type = formValues['Company Type'] || formValues['type'] || 'Private Limited';
          const email = formValues['Email'] || formValues['email'] || 'info@company.com';
          const address = formValues['Address'] || formValues['address'] || 'Registered Address';

          await fetch('/api/company', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: companyName,
              cin: cin,
              type: type,
              email: email,
              registeredOffice: address,
            }),
          });
        }

        // Save generated html locally to preview & trigger pdf
        setSuccessDoc({ title: docTitle, html: mergedHtml });
        setIsFormOpen(false);
        setIsSuccessOpen(true);
      } else {
        alert('Error saving document');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to compliance server');
    } finally {
      setGenerating(false);
    }
  };

  // Helper to generate live synchronizing HTML inside user filing workspace
  const getLiveClientHtml = () => {
    if (!selectedTemplate) return '';
    let html = selectedTemplate.content || '';
    
    const hasPlaceholders = selectedTemplate.fields.some(field => {
      const relaxedNamePattern = field.name
        .split('')
        .map(char => char.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
        .join('(?:<[^>]*>)*');
      const pattern = new RegExp(
        '\\{\\s*(?:<[^>]*>)*\\s*(?:\\{\\s*(?:<[^>]*>)*\\s*)?' +
        relaxedNamePattern +
        '\\s*(?:<[^>]*>)*\\s*\\}' +
        '(?:\\s*(?:<[^>]*>)*\\s*\\})?',
        'gi'
      );
      return pattern.test(html);
    });

    if (!html.trim() || !hasPlaceholders) {
      let tableRows = '';
      selectedTemplate.fields.forEach(field => {
        let val = formValues[field.name] || '';
        if (!val) {
          val = `<span style="color: #94a3b8; font-style: italic; font-weight: normal;">[${field.name}]</span>`;
        }
        tableRows += `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px; font-weight: 600; color: #475569; width: 40%; font-size: 13px;">${field.name}</td>
            <td style="padding: 12px; color: #0f172a; font-size: 13px;"><span class="field-value" data-field-name="${field.name}">${val}</span></td>
          </tr>
        `;
      });

      return `
        <div style="font-family: 'Inter', system-ui, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="font-size: 20px; font-weight: 800; text-align: center; color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 15px; text-transform: uppercase;">
            ${selectedTemplate.name}
          </h1>
          <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 700; color: #334155; width: 40%;">FIELD KEY</th>
                <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 700; color: #334155;">SUBMITTED VALUE</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      `;
    }

    selectedTemplate.fields.forEach(field => {
      let val = formValues[field.name] || '';
      if (!val) {
        val = `[${field.name}]`;
      }
      const spanWrapper = `<span class="field-value" data-field-name="${field.name}">${val}</span>`;
      
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
      html = html.replace(pattern, spanWrapper);
    });

    return html;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* 1. Header (EasyTax Layout) */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-1.5 cursor-pointer">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              e
            </div>
            <span className="text-xl font-extrabold text-slate-800 tracking-tight">
              easy<span className="text-blue-600 font-bold">tax</span>
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
              Products <ChevronDown className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
              Resources <ChevronDown className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
              Company <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600 gap-1.5 hover:bg-slate-100 rounded-lg">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
          <Button className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-sm px-4 py-2 rounded-xl border border-blue-200">
            Start Filing
          </Button>
        </div>
      </header>

      {/* 2. Hero Section (EasyTax Visual Style) */}
      <section className="relative bg-white pt-10 pb-16 px-6 md:px-12 lg:px-24 overflow-hidden border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Text */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
              <span>8 M+ Users</span>
              <span className="text-slate-300">|</span>
              <div className="flex items-center text-amber-500 gap-0.5">
                <Star className="w-3 h-3 fill-amber-500" />
                <Star className="w-3 h-3 fill-amber-500" />
                <Star className="w-3 h-3 fill-amber-500" />
                <Star className="w-3 h-3 fill-amber-500" />
                <Star className="w-3 h-3 fill-amber-500" />
                <span className="text-[11px] font-bold text-slate-700 ml-1">4.6</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="underline cursor-pointer">See reviews</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
              File corporate compliance in minutes with <span className="text-blue-600">100% Accuracy</span>
            </h1>

            <p className="text-lg text-slate-600 font-medium">
              Maximum Compliance & Instant Verification, Guaranteed
            </p>

            {/* Alert / Notice box */}
            <div className="inline-flex items-start md:items-center gap-3 bg-blue-50/50 border border-blue-100 p-3 rounded-2xl max-w-lg">
              <div className="bg-blue-600 text-white rounded-lg p-1.5 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[11px] font-bold text-blue-600 block uppercase tracking-wider">easytax notice protect</span>
                <span className="text-xs text-slate-600 block mt-0.5">
                  Received a registry query? We handle it free. Formatting or spelling error? 100% refund.
                </span>
              </div>
            </div>
          </div>

          {/* Right Image & Floating Cards */}
          <div className="relative flex justify-center items-center">
            <div className="absolute w-[400px] h-[400px] rounded-full border border-blue-100/60 flex items-center justify-center rotate-12 scale-110">
              <div className="text-[10px] text-blue-300/40 uppercase tracking-widest font-mono">
                accuracy · 100% accuracy · verification · compliance
              </div>
            </div>

            <div className="relative w-80 h-[380px] bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-[40px] overflow-hidden shadow-lg border border-slate-100">
              <img
                src="/hero_user_portrait.png"
                alt="Happy corporate user filing compliance documents"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Floating Overlay Card */}
            <Card className="absolute top-10 left-[-20px] shadow-xl border border-slate-100 rounded-2xl p-4 w-64 bg-white/95 backdrop-blur-xs">
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Auto-applying corporate details to maximize efficiency
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 font-medium">Standard incorporation</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      Ready <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-100 text-emerald-600" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 font-medium">Format Compliance</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      100% <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-100 text-emerald-600" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 font-medium">System verification</span>
                    <span className="font-bold text-blue-600">Active</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. Main Templates Cards Grid Section */}
      <section className="flex-1 py-16 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800">Select a document template to get started</h2>
          <p className="text-slate-500 text-sm mt-1.5">Enter details to instantly auto-generate and submit your corporate filings.</p>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed rounded-3xl p-8 max-w-md mx-auto shadow-xs">
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700">No active templates found</h3>
            <p className="text-xs text-slate-500 mt-1">Please log in as Administrator and toggle template status to "Active" to enable client filing.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
            {templates.filter(t => t.status === 'Active').map((temp, index) => (
              <motion.div
                key={temp.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border border-slate-100 rounded-3xl p-6 bg-white flex flex-col justify-between h-full group">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-600 text-[10px] rounded-full uppercase tracking-wider mb-2 font-bold">
                        {temp.category}
                      </Badge>
                      <CardTitle className="text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {temp.name}
                      </CardTitle>
                      <p className="text-xs text-slate-500 mt-2 font-medium">
                        File and generate document in 3 simple steps
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Fields to enter: {temp.fields.length}</span>
                    <Button
                      onClick={() => handleTemplateClick(temp)}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-bold text-sm px-5 py-2.5 shadow-sm"
                    >
                      Start Filing Now <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Bottom Info Strip */}
      <footer className="bg-white border-t border-slate-100 py-6 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-slate-400 text-xs font-semibold">
            © 2026 AutoDoc easytax Compliance. All rights reserved.
          </div>
          <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center">
            <div className="text-left">
              <span className="text-lg md:text-xl font-black text-slate-800">₹ 5346 Cr+</span>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mt-0.5">ITR Refund Delivered</span>
            </div>
            <div className="text-left">
              <span className="text-lg md:text-xl font-black text-slate-800">8 M+</span>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mt-0.5">Users Trust Us</span>
            </div>
          </div>
        </div>
      </footer>


        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent showCloseButton={false} className="sm:max-w-none max-w-7xl w-[96vw] h-[92vh] flex flex-col rounded-3xl p-0 overflow-hidden bg-white border border-slate-200">
            {/* Premium Header: E-Learning Style Navigation Path */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                <span>Compliance Filing</span>
                <span>/</span>
                <span className="text-slate-800 font-bold">Workspace</span>
                <span>/</span>
                <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">{selectedTemplate?.category}</span>
                <span className="hidden md:inline-flex items-center ml-4 text-slate-600 text-sm font-extrabold gap-1.5 border-l border-slate-200 pl-4">
                  Filing Workspace <span className="text-slate-300 font-light">&gt;</span> <span className="text-slate-800">{selectedTemplate?.name}</span>
                </span>
              </div>
              <Button size="icon" variant="ghost" className="rounded-full w-8 h-8 hover:bg-slate-100" onClick={() => setIsFormOpen(false)}>
                <X className="w-4.5 h-4.5 text-slate-500" />
              </Button>
            </div>

            <div className="flex-1 flex overflow-hidden min-h-0 bg-slate-50/50">
              {/* Left Side: Step-by-Step input checklist form (35% screen width) */}
              <div className="w-[35%] min-w-[340px] max-w-[430px] border-r border-slate-100 bg-white flex flex-col h-full shadow-xs">
                {selectedTemplate && (
                  <form onSubmit={handleFormSubmit} className="flex flex-col h-full">
                    {/* Module title with toggle indicator */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Filing Checklist</span>
                        <span className="text-sm font-extrabold text-slate-800 truncate max-w-[240px]">{selectedTemplate.name}</span>
                      </div>
                      <Badge className="bg-blue-600 hover:bg-blue-600 text-white rounded-full text-[10px] font-bold px-2 py-0.5">
                        {selectedTemplate.fields.filter(f => formValues[f.name]).length} / {selectedTemplate.fields.length} Done
                      </Badge>
                    </div>

                    {/* Scrollable list of fields formatted as interactive steps */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                      {selectedTemplate.fields.map((field, idx) => {
                        const isFilled = !!formValues[field.name];
                        return (
                          <div key={field.id} className="space-y-2 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50/80 transition-colors">
                            <div className="flex items-center justify-between">
                              <Label htmlFor={field.id} className="text-[13px] font-bold text-slate-800 flex items-center gap-2 cursor-pointer">
                                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black">
                                  {idx + 1}
                                </span>
                                {field.name} {field.required && <span className="text-destructive">*</span>}
                              </Label>
                              {isFilled ? (
                                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center" title="Field filled">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <span className="w-5 h-5 rounded-full border border-dashed border-slate-300 bg-white flex items-center justify-center" title="Field pending" />
                              )}
                            </div>

                            {field.type === 'dropdown' ? (
                              <select
                                id={field.id}
                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus:border-blue-500 cursor-pointer hover:border-slate-300"
                                value={formValues[field.name] || ''}
                                onChange={e => setFormValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                                required={field.required}
                              >
                                <option value="">Select option</option>
                                {field.options?.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <Input
                                id={field.id}
                                type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                                value={formValues[field.name] || ''}
                                onChange={e => setFormValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                                placeholder={field.defaultValue || `Enter ${field.name.toLowerCase()}`}
                                required={field.required}
                                className="rounded-xl text-sm h-11 px-4 border-slate-200 bg-white focus:border-blue-500"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                      <Button type="submit" disabled={generating} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 text-sm font-bold shadow-sm">
                        {generating ? 'Processing filing...' : 'Generate & Submit Document'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Right Side: Document Preview with bottom button ribbon */}
              <div className="flex-1 flex flex-col h-full bg-slate-100/50 overflow-hidden">
                {/* MS Word Format Edit Toolbar Ribbon (exactly where the red box is!) */}
                <div className="flex flex-wrap items-center gap-2 px-6 py-2.5 border-b border-slate-200 bg-white">
                  {/* Undo/Redo */}
                  <div className="flex items-center gap-0.5">
                    <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Undo" onClick={() => executeClientCommand('undo')}>
                      <Undo2 className="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Redo" onClick={() => executeClientCommand('redo')}>
                      <Redo2 className="w-4 h-4 text-slate-600" />
                    </Button>
                  </div>
                  
                  <Separator orientation="vertical" className="mx-1 h-6 bg-slate-200" />

                  {/* Heading Select */}
                  <select
                    onChange={(e) => executeClientCommand('formatBlock', e.target.value)}
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
                    onChange={(e) => executeClientCommand('fontName', e.target.value)}
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
                    onChange={(e) => executeClientCommand('fontSize', e.target.value)}
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
                    <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Bold" onClick={() => executeClientCommand('bold')}>
                      <Bold className="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Italic" onClick={() => executeClientCommand('italic')}>
                      <Italic className="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Underline" onClick={() => executeClientCommand('underline')}>
                      <Underline className="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Strikethrough" onClick={() => executeClientCommand('strikeThrough')}>
                      <Strikethrough className="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Subscript" onClick={() => executeClientCommand('subscript')}>
                      <Subscript className="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Superscript" onClick={() => executeClientCommand('superscript')}>
                      <Superscript className="w-4 h-4 text-slate-600" />
                    </Button>
                  </div>

                  <Separator orientation="vertical" className="mx-1 h-6 bg-slate-200" />

                  {/* Colors */}
                  <select
                    onChange={(e) => executeClientCommand('foreColor', e.target.value)}
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
                    onChange={(e) => executeClientCommand('hiliteColor', e.target.value)}
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
                    <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Align Left" onClick={() => executeClientCommand('justifyLeft')}>
                      <AlignLeft className="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Align Center" onClick={() => executeClientCommand('justifyCenter')}>
                      <AlignCenter className="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Align Right" onClick={() => executeClientCommand('justifyRight')}>
                      <AlignRight className="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Justify" onClick={() => executeClientCommand('justifyFull')}>
                      <AlignJustify className="w-4 h-4 text-slate-600" />
                    </Button>
                  </div>

                  <Separator orientation="vertical" className="mx-1 h-6 bg-slate-200" />

                  {/* Lists */}
                  <div className="flex items-center gap-0.5">
                    <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Bullet List" onClick={() => executeClientCommand('insertUnorderedList')}>
                      <List className="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded" title="Numbered List" onClick={() => executeClientCommand('insertOrderedList')}>
                      <ListOrdered className="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="w-8 h-8 rounded text-amber-600 hover:text-amber-800" title="Clear Formatting" onClick={() => executeClientCommand('removeFormat')}>
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
                        <Button type="button" size="sm" className="w-full text-xs h-7" onClick={insertClientTable}>Insert Table</Button>
                      </Card>
                    )}
                  </div>

                  {/* Table quick adjustments */}
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="sm" className="h-8 text-xs rounded border border-slate-200 bg-white hover:border-slate-300 font-semibold text-slate-700 px-2" onClick={() => insertClientRow(true)}>+ Row</Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 text-xs rounded border border-slate-200 bg-white hover:border-slate-300 font-semibold text-slate-700 px-2" onClick={() => insertClientColumn(true)}>+ Col</Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 text-xs text-destructive border border-slate-200 bg-white hover:bg-destructive/5 hover:border-destructive/30 px-2 rounded" onClick={deleteClientRow}>- Row</Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 text-xs text-destructive border border-slate-200 bg-white hover:bg-destructive/5 hover:border-destructive/30 px-2 rounded" onClick={deleteClientColumn}>- Col</Button>
                  </div>
                </div>

                {/* Scrollable White A4 Editor Page Workspace */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto flex justify-center items-start bg-slate-100/40">
                  {selectedTemplate ? (
                    <div
                      ref={clientEditorRef}
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onInput={() => {
                        if (clientEditorRef.current) {
                          setClientEditorHtml(clientEditorRef.current.innerHTML);
                        }
                      }}
                      className="editor-page prose prose-slate max-w-none text-[15px] focus:outline-none"
                      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    />
                  ) : (
                    <div className="text-slate-400 text-sm font-medium self-center">Select a template to view preview</div>
                  )}
                </div>

                {/* Ribbon Action Bar matching the e-learning submit layout */}
                <div className="bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (confirm('Reset all fields?')) setFormValues({});
                    }}
                    className="rounded-xl h-10 text-xs font-bold border-blue-600 text-blue-600 hover:bg-blue-50 px-5"
                  >
                    RESET FIELDS
                  </Button>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsFormOpen(false)}
                      className="rounded-xl h-10 text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-50 px-5"
                    >
                      CANCEL
                    </Button>
                    <Button
                      onClick={handleFormSubmit}
                      disabled={generating}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 text-xs font-bold px-6 shadow-sm"
                    >
                      {generating ? 'SUBMITTING...' : 'SUBMIT FILING'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      {/* Success Modal */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-none max-w-4xl w-[90vw] h-[85vh] flex flex-col rounded-3xl p-0 overflow-hidden bg-background">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Filing Generated & Submitted
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleDownloadSuccessPdf} className="rounded-xl gap-1.5 h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4">
                <Download className="w-4 h-4" /> Download PDF
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsSuccessOpen(false)} className="rounded-xl h-9 text-xs font-bold px-4">
                Close
              </Button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden min-h-0 bg-slate-50">
            {/* PDF Preview Frame on the Left */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center relative">
              {successDoc ? (
                <iframe
                  srcDoc={`
                    <html>
                      <head>
                        <style>
                          body {
                            font-family: 'Inter', system-ui, sans-serif;
                            padding: 24px;
                            color: #0f172a;
                            background-color: #ffffff;
                          }
                          table { border-collapse: collapse; width: 100%; margin: 16px 0; }
                          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
                          th { background-color: #f8fafc; }
                          p { margin-top: 0; margin-bottom: 12px; line-height: 1.6; }
                        </style>
                      </head>
                      <body>
                        ${successDoc.html}
                      </body>
                    </html>
                  `}
                  className="w-full h-full border border-slate-200/80 shadow-md rounded-2xl bg-white"
                  title="Your Generated Document"
                ></iframe>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                  <span className="text-xs font-medium">Waiting for document...</span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}