'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Type, Calendar, Hash, ChevronDown, Mail, Phone,
  Trash2, Copy, Highlighter, Save, FileDown, Eye, Edit2, Upload,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Table, CornerDownRight, ArrowLeft, Check, X,
  Undo2, Redo2, Strikethrough, Subscript, Superscript, List, ListOrdered, Eraser, Baseline
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import mammoth from 'mammoth';

import type { TemplateField } from '@/lib/types';

// Icons Record
const fieldTypeIcons: Record<string, React.ElementType> = {
  text: Type,
  date: Calendar,
  number: Hash,
  dropdown: ChevronDown,
  email: Mail,
  phone: Phone,
};

// Colors Record
const fieldTypeColors: Record<string, string> = {
  text: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  date: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  number: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  dropdown: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  email: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  phone: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};

export default function DocumentEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('id');

  const [templateName, setTemplateName] = useState('');
  const [category, setCategory] = useState('General');
  const [status, setStatus] = useState<'Active' | 'Draft'>('Active');
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [editorContent, setEditorContent] = useState('');
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);

  // UI state
  const [showFieldPopup, setShowFieldPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<string>('text');
  const [showCreateField, setShowCreateField] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editFieldNameValue, setEditFieldNameValue] = useState('');
  const [openAddFieldDialog, setOpenAddFieldDialog] = useState(false);
  const [popupBelow, setPopupBelow] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Table insert modal/options
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [showTableMenu, setShowTableMenu] = useState(false);

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing template if editing
  useEffect(() => {
    if (templateId) {
      const loadTemplate = async () => {
        try {
          const res = await fetch(`/api/templates/${templateId}`);
          if (res.ok) {
            const data = await res.json();
            setTemplateName(data.name || '');
            setCategory(data.category || 'General');
            setStatus(data.status || 'Draft');
            setEditorContent(data.content || '');
            setFields(data.fields || []);
            setPdfBase64(data.pdfData || null);
          }
        } catch (err) {
          console.error('Error loading template:', err);
        }
      };
      loadTemplate();
    }
  }, [templateId]);

  // Sync editor innerHTML on initial load
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== editorContent) {
      editorRef.current.innerHTML = editorContent;
    }
  }, [editorContent]);

  // Command Helper
  const executeCommand = (command: string, value = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
    }
  };

  // Insert Table
  const insertTable = () => {
    let tableHtml = '<table style="width:100%; border-collapse:collapse; border:1px solid #e2e8f0; margin:1rem 0;">';
    for (let r = 0; r < tableRows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < tableCols; c++) {
        tableHtml += '<td style="border:1px solid #cbd5e1; padding:8px; min-width:80px; min-height:24px;">Cell</td>';
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</table>';
    executeCommand('insertHTML', tableHtml);
    setShowTableMenu(false);
  };

  // Table Helpers
  const getSelectedTableCell = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node: Node | null = sel.getRangeAt(0).startContainer;
    while (node && node !== editorRef.current) {
      if (node.nodeName === 'TD') return node as HTMLTableCellElement;
      node = node.parentNode;
    }
    return null;
  };

  const getSelectedTableRow = () => {
    const cell = getSelectedTableCell();
    return cell ? (cell.parentNode as HTMLTableRowElement) : null;
  };

  const getSelectedTable = () => {
    const row = getSelectedTableRow();
    return row ? (row.parentNode as HTMLTableElement) : null;
  };

  const insertRow = (below = true) => {
    const row = getSelectedTableRow();
    if (!row) return;
    const table = row.closest('table');
    if (!table) return;
    const newRow = table.insertRow(below ? row.rowIndex + 1 : row.rowIndex);
    const colsCount = row.cells.length;
    for (let i = 0; i < colsCount; i++) {
      const cell = newRow.insertCell();
      cell.innerHTML = 'New Cell';
      cell.setAttribute('style', 'border:1px solid #cbd5e1; padding:8px; min-width:80px;');
    }
    if (editorRef.current) setEditorContent(editorRef.current.innerHTML);
  };

  const insertColumn = (after = true) => {
    const cell = getSelectedTableCell();
    if (!cell) return;
    const table = cell.closest('table');
    if (!table) return;
    const colIndex = cell.cellIndex;
    const rows = table.rows;
    for (let i = 0; i < rows.length; i++) {
      const newCell = rows[i].insertCell(after ? colIndex + 1 : colIndex);
      newCell.innerHTML = 'New Cell';
      newCell.setAttribute('style', 'border:1px solid #cbd5e1; padding:8px; min-width:80px;');
    }
    if (editorRef.current) setEditorContent(editorRef.current.innerHTML);
  };

  const deleteRow = () => {
    const row = getSelectedTableRow();
    if (!row) return;
    const table = row.closest('table');
    if (!table) return;
    table.deleteRow(row.rowIndex);
    if (editorRef.current) setEditorContent(editorRef.current.innerHTML);
  };

  const deleteColumn = () => {
    const cell = getSelectedTableCell();
    if (!cell) return;
    const table = cell.closest('table');
    if (!table) return;
    const colIndex = cell.cellIndex;
    const rows = table.rows;
    for (let i = 0; i < rows.length; i++) {
      rows[i].deleteCell(colIndex);
    }
    if (editorRef.current) setEditorContent(editorRef.current.innerHTML);
  };

  const deleteTable = () => {
    const table = getSelectedTable();
    if (table) {
      table.remove();
      if (editorRef.current) setEditorContent(editorRef.current.innerHTML);
    }
  };

  // Selection Check to show Placeholders wrapping popup
  const handleSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      // Check if mouse click/up happened inside editor
      const range = selection.getRangeAt(0);
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        const rect = range.getBoundingClientRect();
        const editorRect = editorRef.current.getBoundingClientRect();

        const relativeTop = rect.top - editorRect.top;
        const isBelow = relativeTop < 140;
        setPopupBelow(isBelow);
        setDragOffset({ x: 0, y: 0 }); // Reset position on new selection

        setPopupPosition({
          top: isBelow
            ? rect.bottom - editorRect.top + (editorRef.current?.scrollTop || 0)
            : rect.top - editorRect.top - 55 + (editorRef.current?.scrollTop || 0),
          left: rect.left - editorRect.left + rect.width / 2,
        });
        setSelectedText(selection.toString().trim());
        setShowFieldPopup(true);
        return;
      }
    }
  };

  // Dragging handlers for popup
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, select')) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setDragOffset({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Close popup if click is outside popup & editor
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Do not close if clicking inside a select dropdown options list or portal elements
      if (target.closest('[role="listbox"], [role="option"], [data-slot="select-content"], [data-portal]')) {
        return;
      }

      if (
        popupRef.current && !popupRef.current.contains(e.target as Node) &&
        editorRef.current && !editorRef.current.contains(e.target as Node)
      ) {
        setShowFieldPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add field
  const handleCreateField = () => {
    if (!newFieldName.trim()) return;

    // Check duplicate
    if (fields.some(f => f.name.toLowerCase() === newFieldName.trim().toLowerCase())) {
      alert('Field name already exists');
      return;
    }

    const fieldId = `f_${Date.now()}`;
    const newField: TemplateField = {
      id: fieldId,
      name: newFieldName.trim(),
      type: newFieldType as TemplateField['type'],
      required: true,
    };

    setFields(prev => [...prev, newField]);

    // Replace selected text with placeholder (only if selection exists and is inside editor)
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !pdfBase64) {
      const range = selection.getRangeAt(0);
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        const node = document.createTextNode(`{{${newFieldName.trim()}}}`);
        range.insertNode(node);
        selection.removeAllRanges();
      }
    }

    // Reset popup
    setNewFieldName('');
    setNewFieldType('text');
    setShowCreateField(false);
    setShowFieldPopup(false);
    setOpenAddFieldDialog(false);

    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
    }
  };

  // Link selected text to an existing field
  const handleLinkField = (field: TemplateField) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const node = document.createTextNode(`{{${field.name}}}`);
      range.insertNode(node);
      selection.removeAllRanges();
    }
    setShowFieldPopup(false);
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
    }
  };

  // Delete field
  const handleDeleteField = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    setFields(prev => prev.filter(f => f.id !== fieldId));
    if (activeFieldId === fieldId) setActiveFieldId(null);

    // Optionally remove placeholders from template
    if (editorRef.current) {
      let html = editorRef.current.innerHTML;
      const placeholder = `{{${field.name}}}`;
      html = html.replaceAll(placeholder, '');
      editorRef.current.innerHTML = html;
      setEditorContent(html);
    }
  };

  // Rename Field
  const startRenameField = (field: TemplateField) => {
    setEditingFieldId(field.id);
    setEditFieldNameValue(field.name);
  };

  const saveRenameField = (fieldId: string) => {
    if (!editFieldNameValue.trim()) return;

    const oldField = fields.find(f => f.id === fieldId);
    if (!oldField) return;

    const oldName = oldField.name;
    const newName = editFieldNameValue.trim();

    // Check duplicate
    if (fields.some(f => f.id !== fieldId && f.name.toLowerCase() === newName.toLowerCase())) {
      alert('Field name already exists');
      return;
    }

    // Update in fields list
    setFields(prev => prev.map(f => f.id === fieldId ? { ...f, name: newName } : f));
    setEditingFieldId(null);

    // Replace in document content
    if (editorRef.current) {
      let html = editorRef.current.innerHTML;
      const oldPlaceholder = `{{${oldName}}}`;
      const newPlaceholder = `{{${newName}}}`;
      html = html.replaceAll(oldPlaceholder, newPlaceholder);
      editorRef.current.innerHTML = html;
      setEditorContent(html);
    }
  };

  // Toggle required
  const toggleRequired = (fieldId: string) => {
    setFields(prev => prev.map(f => f.id === fieldId ? { ...f, required: !f.required } : f));
  };

  // Save template to database
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template title/name.');
      return;
    }

    const payload = {
      name: templateName,
      category,
      status,
      content: editorRef.current?.innerHTML || '',
      pdfData: pdfBase64,
      fields: fields.map(f => ({
        name: f.name,
        type: f.type,
        required: f.required,
        defaultValue: f.defaultValue || null,
        optionsJson: f.options ? JSON.stringify(f.options) : null
      }))
    };

    try {
      const url = templateId ? `/api/templates/${templateId}` : '/api/templates';
      const method = templateId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Template saved successfully!');
        router.push('/templates');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save template');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving template');
    }
  };

  // File Upload handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      reader.onload = () => {
        const base64 = reader.result as string;
        setPdfBase64(base64);

        // Pre-fill editor with high-quality simulated template layout since pure client-side PDF text extraction can be messy
        const mockPdfTemplateText = `<h1>PDF IMPORT: ${file.name.replace('.pdf', '')}</h1>
<p>This document template is linked to the uploaded PDF file: <strong>${file.name}</strong>.</p>
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
      <td style="border: 1px solid #cbd5e1; padding: 10px;">\x7b\x7bCompany Name\x7d\x7d</td>
    </tr>
    <tr>
      <td style="border: 1px solid #cbd5e1; padding: 10px;">Corporate ID (CIN)</td>
      <td style="border: 1px solid #cbd5e1; padding: 10px;">\x7b\x7bCIN\x7d\x7d</td>
    </tr>
    <tr>
      <td style="border: 1px solid #cbd5e1; padding: 10px;">Registered Address</td>
      <td style="border: 1px solid #cbd5e1; padding: 10px;">\x7b\x7bAddress\x7d\x7d</td>
    </tr>
  </tbody>
</table>
<p>Please edit the table or text, highlight selections, and click <strong>"Create New Field"</strong> to mark variables.</p>`;

        if (editorRef.current) {
          editorRef.current.innerHTML = mockPdfTemplateText;
          setEditorContent(mockPdfTemplateText);
        }

        alert('PDF document linked successfully!');
      };
      reader.readAsDataURL(file);
    } else if (file.name.toLowerCase().endsWith('.docx')) {
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        try {
          const result = await mammoth.convertToHtml({ arrayBuffer }, { ignoreEmptyParagraphs: false });
          let html = result.value;
          // Hydrate empty paragraphs to prevent browser collapsing them to 0 height
          html = html.replace(/<p>\s*<\/p>/gi, '<p>&nbsp;</p>');
          setPdfBase64(null); // Switch off PDF mode back to HTML text editor
          if (editorRef.current) {
            editorRef.current.innerHTML = html;
            setEditorContent(html);
          }
          alert('Word document imported successfully! You can now edit it.');
        } catch (err) {
          console.error('Error parsing DOCX:', err);
          alert('Failed to parse Word document.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Try text reading
      reader.onload = () => {
        const text = reader.result as string;
        const html = `<div>${text.replace(/\n/g, '<br/>')}</div>`;
        setPdfBase64(null); // Switch off PDF mode back to HTML text editor
        if (editorRef.current) {
          editorRef.current.innerHTML = html;
          setEditorContent(html);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex gap-0 h-full">
      {/* Document Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/templates')} className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="flex items-center gap-2">
              <Input
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder="Template Title (e.g. Create Company)"
                className="font-semibold text-base h-9 w-60 rounded-xl"
              />
              <Select value={category} onValueChange={v => setCategory(v || 'General')}>
                <SelectTrigger className="h-9 w-36 rounded-xl">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Board Resolution">Board Resolution</SelectItem>
                  <SelectItem value="Share Transfer">Share Transfer</SelectItem>
                  <SelectItem value="MOA/AOA">MOA/AOA</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" /> Link PDF/Docx
            </Button>

            <Select value={status} onValueChange={(v) => setStatus(v as 'Active' | 'Draft')}>
              <SelectTrigger className="h-9 w-28 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleSaveTemplate} size="sm" className="rounded-xl gap-2 bg-primary text-primary-foreground shadow-sm">
              <Save className="w-4 h-4" /> Save Template
            </Button>
          </div>
        </div>

        {/* Text Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-2.5 border-b border-border bg-muted/20">
          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded" title="Undo" onClick={() => executeCommand('undo')}>
              <Undo2 className="w-4.5 h-4.5" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded" title="Redo" onClick={() => executeCommand('redo')}>
              <Redo2 className="w-4.5 h-4.5" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Heading Format */}
          <select
            onChange={(e) => executeCommand('formatBlock', e.target.value)}
            className="h-8 rounded-lg border border-border bg-card px-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:border-slate-300"
            title="Text Style"
            defaultValue="<p>"
          >
            <option value="<p>">Normal Text</option>
            <option value="<h1>">Heading 1</option>
            <option value="<h2>">Heading 2</option>
            <option value="<h3>">Heading 3</option>
          </select>

          {/* Font Family */}
          <select
            onChange={(e) => executeCommand('fontName', e.target.value)}
            className="h-8 rounded-lg border border-border bg-card px-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:border-slate-300 w-28"
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

          {/* Font Size */}
          <select
            onChange={(e) => executeCommand('fontSize', e.target.value)}
            className="h-8 rounded-lg border border-border bg-card px-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:border-slate-300"
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

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Character Styles */}
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded" title="Bold" onClick={() => executeCommand('bold')}>
              <Bold className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded" title="Italic" onClick={() => executeCommand('italic')}>
              <Italic className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded" title="Underline" onClick={() => executeCommand('underline')}>
              <Underline className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded" title="Strikethrough" onClick={() => executeCommand('strikeThrough')}>
              <Strikethrough className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded" title="Subscript" onClick={() => executeCommand('subscript')}>
              <Subscript className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded" title="Superscript" onClick={() => executeCommand('superscript')}>
              <Superscript className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Color pickers */}
          <select
            onChange={(e) => executeCommand('foreColor', e.target.value)}
            className="h-8 rounded-lg border border-border bg-card px-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:border-slate-300"
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
            onChange={(e) => executeCommand('hiliteColor', e.target.value)}
            className="h-8 rounded-lg border border-border bg-card px-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:border-slate-300"
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

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Alignment */}
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded" title="Align Left" onClick={() => executeCommand('justifyLeft')}>
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded" title="Align Center" onClick={() => executeCommand('justifyCenter')}>
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded" title="Align Right" onClick={() => executeCommand('justifyRight')}>
              <AlignRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded" title="Justify" onClick={() => executeCommand('justifyFull')}>
              <AlignJustify className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Lists & Format Clears */}
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded" title="Bullet List" onClick={() => executeCommand('insertUnorderedList')}>
              <List className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded" title="Numbered List" onClick={() => executeCommand('insertOrderedList')}>
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded text-amber-600 hover:text-amber-800" title="Clear Formatting" onClick={() => executeCommand('removeFormat')}>
              <Eraser className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Table menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg gap-1.5 border border-border bg-card px-2 hover:border-slate-300"
              onClick={() => setShowTableMenu(!showTableMenu)}
            >
              <Table className="w-4 h-4 text-slate-600" /> <span className="text-xs font-semibold text-slate-700">Table</span> <ChevronDown className="w-3 h-3 text-slate-400" />
            </Button>
            {showTableMenu && (
              <Card className="absolute z-50 mt-1 p-3 w-48 shadow-lg border border-border flex flex-col gap-2">
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
                <Button size="sm" className="w-full text-xs h-7" onClick={insertTable}>Insert Table</Button>
              </Card>
            )}
          </div>

          {/* Table editing quick buttons */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 text-xs rounded border border-border bg-card hover:border-slate-300 font-semibold text-slate-700 px-2" onClick={() => insertRow(true)}>+ Row</Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs rounded border border-border bg-card hover:border-slate-300 font-semibold text-slate-700 px-2" onClick={() => insertColumn(true)}>+ Col</Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive border border-border bg-card hover:bg-destructive/5 hover:border-destructive/30 px-2 rounded" onClick={deleteRow}>- Row</Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive border border-border bg-card hover:bg-destructive/5 hover:border-destructive/30 px-2 rounded" onClick={deleteColumn}>- Col</Button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto bg-secondary/15">
          <div className="max-w-4xl px-4 mx-auto py-8">
            {pdfBase64 ? (
              /* PDF Preview Mode (No text editor) */
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center px-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Template Document Preview
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    PDF Attached
                  </Badge>
                </div>
                <iframe
                  src={pdfBase64 || undefined}
                  className="w-full h-[800px] border border-border shadow-md rounded-2xl bg-white"
                  title="PDF Template Preview"
                ></iframe>
              </div>
            ) : (
              /* HTML Text Editor Mode - Premium A4 Page Layout */
              <div className="relative bg-slate-100/80 p-8 min-h-[850px] flex justify-center items-start rounded-2xl border border-border">
                <div
                  ref={editorRef}
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  onMouseUp={handleSelection}
                  onKeyUp={handleSelection}
                  onInput={() => {
                    if (editorRef.current) setEditorContent(editorRef.current.innerHTML);
                  }}
                  className="editor-page focus:outline-none prose prose-slate max-w-none prose-sm dark:prose-invert text-[15px]"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                />

                {/* Selection floating popup */}
                <AnimatePresence>
                  {showFieldPopup && (
                    <div
                      ref={popupRef}
                      onMouseDown={handleMouseDown}
                      className={`absolute z-50 -translate-x-1/2 select-none cursor-grab active:cursor-grabbing ${popupBelow ? 'translate-y-0 pt-3' : '-translate-y-full pb-3'}`}
                      style={{ top: popupPosition.top + dragOffset.y, left: popupPosition.left + dragOffset.x }}
                    >
                      <Card className="shadow-xl border border-border/80 p-3 bg-card overflow-hidden">
                        {!showCreateField ? (
                          <div className="w-56 space-y-2">
                            <div className="flex justify-between items-center pb-1.5 border-b border-border/50">
                              <span className="text-xs text-muted-foreground">Link or Create Field</span>
                              <Button variant="ghost" size="icon" className="w-5 h-5 rounded-full" onClick={() => setShowFieldPopup(false)}>
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                            <p className="text-xs font-semibold text-foreground truncate">
                              Selected: <span className="text-primary italic">"{selectedText}"</span>
                            </p>
                            <Button
                              size="sm"
                              className="w-full h-8 rounded-lg text-xs gap-1"
                              onClick={() => {
                                setNewFieldName('');
                                setShowCreateField(true);
                              }}
                            >
                              <Plus className="w-4 h-4" /> Create New Field
                            </Button>

                            {fields.length > 0 && (
                              <>
                                <Separator className="my-1.5" />
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Link to existing field:</p>
                                <div className="max-h-[120px] overflow-y-auto pr-1">
                                  <div className="space-y-1">
                                    {fields.map(f => (
                                      <button
                                        key={f.id}
                                        onClick={() => handleLinkField(f)}
                                        className="w-full text-left text-xs px-2 py-1.5 rounded-md hover:bg-muted/80 flex items-center justify-between group transition-colors"
                                      >
                                        <span className="truncate max-w-[120px]">{f.name}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase group-hover:text-primary">{f.type}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="w-56 space-y-3">
                            <div className="space-y-1.5">
                              <Label className="text-[11px]">Field Name</Label>
                              <Input
                                placeholder="Field name"
                                className="h-8 rounded-lg text-xs"
                                value={newFieldName}
                                onChange={e => setNewFieldName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[11px]">Field Type</Label>
                              <Select value={newFieldType} onValueChange={v => setNewFieldType(v || 'text')}>
                                <SelectTrigger className="h-8 rounded-lg text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="date">Date</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="dropdown">Dropdown</SelectItem>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="phone">Phone</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2 pt-1">
                              <Button size="sm" className="flex-1 h-8 rounded-lg text-xs" onClick={handleCreateField}>
                                Create Field
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={() => setShowCreateField(false)}>
                                Back
                              </Button>
                            </div>
                          </div>
                        )}
                      </Card>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar — Fields Panel */}
      <div className="w-80 border-l border-border bg-card flex flex-col hidden lg:flex">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">Template Fields</h3>
              <Badge variant="secondary" className="text-xs rounded-full">{fields.length}</Badge>
            </div>
            <Dialog open={openAddFieldDialog} onOpenChange={setOpenAddFieldDialog}>
              <DialogTrigger
                render={
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 rounded-lg px-2">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Field</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div>
                    <Label className="text-xs">Field Name</Label>
                    <Input 
                      placeholder="e.g. Client Name" 
                      className="mt-1.5 h-9 rounded-lg" 
                      value={newFieldName}
                      onChange={e => setNewFieldName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Field Type</Label>
                    <Select value={newFieldType} onValueChange={v => setNewFieldType(v || 'text')}>
                      <SelectTrigger className="mt-1.5 h-9 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="dropdown">Dropdown</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full mt-2 h-9 rounded-lg" onClick={handleCreateField}>
                    Create Field
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">Fields defined inside double curly braces (e.g. {"{{FieldName}}"})</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-1.5">
            {fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No custom fields defined yet.<br />Highlight text to create some!
              </div>
            ) : (
              <AnimatePresence>
                {fields.map((field, idx) => {
                  const Icon = fieldTypeIcons[field.type] || Type;
                  const isActive = activeFieldId === field.id;
                  const isEditing = editingFieldId === field.id;

                  return (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.02 }}
                    >
                      <div
                        className={`group rounded-xl p-3 border transition-all duration-200 ${isActive
                          ? 'bg-primary/5 border-primary/20 shadow-xs'
                          : 'hover:bg-accent border-transparent'
                          }`}
                        onClick={() => setActiveFieldId(isActive ? null : field.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${fieldTypeColors[field.type]}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                <Input
                                  value={editFieldNameValue}
                                  onChange={e => setEditFieldNameValue(e.target.value)}
                                  className="h-7 text-xs rounded-md px-1.5 w-full"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveRenameField(field.id);
                                    if (e.key === 'Escape') setEditingFieldId(null);
                                  }}
                                />
                                <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-950/20 text-emerald-600" onClick={() => saveRenameField(field.id)}>
                                  <Check className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full hover:bg-destructive/10 text-destructive" onClick={() => setEditingFieldId(null)}>
                                  <X className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium truncate">{field.name}</span>
                                {field.required && (
                                  <span className="text-destructive text-xs">*</span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground capitalize">{field.type}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          {!isEditing && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Tooltip>
                                <TooltipTrigger
                                  className="p-1 rounded hover:bg-muted"
                                  onClick={(e) => { e.stopPropagation(); startRenameField(field); }}
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>Rename</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger
                                  className="p-1 rounded hover:bg-destructive/10"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteField(field.id); }}
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                              </Tooltip>
                            </div>
                          )}
                        </div>

                        {/* Config dropdown for fields */}
                        <AnimatePresence>
                          {isActive && !isEditing && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                              onClick={e => e.stopPropagation()}
                            >
                              <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">Required</span>
                                  <Checkbox
                                    checked={field.required}
                                    onCheckedChange={() => toggleRequired(field.id)}
                                  />
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground">Default Value</span>
                                  <Input
                                    value={field.defaultValue || ''}
                                    onChange={e => {
                                      const val = e.target.value;
                                      setFields(prev => prev.map(f => f.id === field.id ? { ...f, defaultValue: val } : f));
                                    }}
                                    className="h-7 text-xs mt-1 rounded-lg"
                                    placeholder="No default"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
);
}