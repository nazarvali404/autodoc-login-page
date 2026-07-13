'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, FileText, ArrowRight, Eye, Save, Edit, RefreshCw } from 'lucide-react';
import DataTable, { Column } from '@/components/modules/DataTable';
import { Company, DocumentTemplate, TemplateField } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';

export default function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);

  // Custom template flow state
  const [createCompanyTemplate, setCreateCompanyTemplate] = useState<DocumentTemplate | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'form' | 'edit'>('form');
  const [generatedHtml, setGeneratedHtml] = useState('');

  // Default form states (if no template exists)
  const [newName, setNewName] = useState('');
  const [newCin, setNewCin] = useState('');
  const [newType, setNewType] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Editor Ref for post-editing
  const previewEditorRef = useRef<HTMLDivElement>(null);

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

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/company');
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePreviewInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const span = target.classList.contains('field-value')
      ? target
      : (target.closest('.field-value') as HTMLElement | null);

    if (span) {
      const fieldName = span.getAttribute('data-field-name');
      const newValue = span.innerHTML;
      if (fieldName && previewEditorRef.current) {
        const query = previewEditorRef.current.querySelectorAll(`.field-value[data-field-name="${fieldName}"]`);
        query.forEach(otherSpan => {
          if (otherSpan !== span && (otherSpan as HTMLElement).innerHTML !== newValue) {
            (otherSpan as HTMLElement).innerHTML = newValue;
          }
        });
      }
    }
  };

  const fetchCreateCompanyTemplate = async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data: DocumentTemplate[] = await res.json();
        const found = data.find(t => t.name.toLowerCase() === 'create company');
        if (found) {
          setCreateCompanyTemplate(found);
        } else {
          setCreateCompanyTemplate(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchCreateCompanyTemplate();
  }, []);

  const columns: Column<Company>[] = [
    { key: 'name', label: 'Company Name', sortable: true },
    { key: 'cin', label: 'CIN', sortable: true },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'incorporationDate', label: 'Incorporation Date', render: (item) => formatDate(item.incorporationDate) }
  ];

  const handleRowClick = (company: Company) => {
    setSelectedCompany(company);
    setIsDetailOpen(true);
  };

  // Default company creation
  const handleCreateCompanyDefault = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          cin: newCin,
          type: newType,
          email: newEmail,
        }),
      });

      if (res.ok) {
        fetchCompanies();
        setIsNewOpen(false);
        // Reset forms
        setNewName('');
        setNewCin('');
        setNewType('');
        setNewEmail('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Custom template flow handlers
  const handleOpenNewCompanyModal = () => {
    // Check template again to ensure we load latest
    fetchCreateCompanyTemplate();
    setStep('form');
    setFormValues({});
    setGeneratedHtml('');
    setIsNewOpen(true);
  };

  const handleTemplateFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createCompanyTemplate) return;

    // Merge placeholders in HTML
    let contentHtml = createCompanyTemplate.content || '';
    createCompanyTemplate.fields.forEach(field => {
      const value = formValues[field.name] || field.defaultValue || '';
      const spanWrapper = `<span class="field-value" data-field-name="${field.name}" style="background-color: rgba(59, 130, 246, 0.03); border-bottom: 1px dashed rgba(59, 130, 246, 0.2); font-weight: inherit; outline: none;">${value}</span>`;
      contentHtml = contentHtml.replaceAll(`{{${field.name}}}`, spanWrapper);
    });

    setGeneratedHtml(contentHtml);
    setStep('edit');
  };

  const handleSaveAndRegister = async () => {
    if (!createCompanyTemplate) return;

    // Read edited content from editor ref
    const finalHtml = previewEditorRef.current?.innerHTML || generatedHtml;

    // We extract name, cin, type, email from user entered values or default to placeholder value
    const companyName = formValues['Company Name'] || formValues['name'] || 'New Corporate Entity';
    const cin = formValues['CIN'] || formValues['cin'] || `U${Math.floor(100000 + Math.random() * 900000)}MH2026PTC${Math.floor(100000 + Math.random() * 900000)}`;
    const type = formValues['Company Type'] || formValues['type'] || 'Private Limited';
    const email = formValues['Email'] || formValues['email'] || 'info@company.com';
    const address = formValues['Address'] || formValues['address'] || 'Registered Address';

    try {
      // 1. Create the Company Record
      const companyRes = await fetch('/api/company', {
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

      if (!companyRes.ok) {
        alert('Failed to register company in compliance records');
        return;
      }

      // 2. Save the Generated Document in database
      const docRes = await fetch('/api/generated-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Incorporation Certificate - ${companyName}`,
          content: finalHtml,
          status: 'Final',
          templateId: createCompanyTemplate.id,
        }),
      });

      if (!docRes.ok) {
        alert('Failed to save generated document in archive');
      }

      // 3. Export & Download PDF
      // @ts-ignore
      if (window.html2pdf) {
        const opt = {
          margin: 10,
          filename: `Incorporation_${companyName.replace(/\s+/g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        const container = document.createElement('div');
        container.innerHTML = finalHtml;
        container.style.padding = '20px';
        container.style.fontFamily = 'Inter, sans-serif';
        // @ts-ignore
        window.html2pdf().set(opt).from(container).save();
      } else {
        alert('Document saved successfully, PDF conversion is taking longer to load. Printing fallback initialized.');
        const printWin = window.open('', '_blank');
        if (printWin) {
          printWin.document.write(`<html><head><title>Incorporation Document</title></head><body>${finalHtml}</body></html>`);
          printWin.document.close();
          printWin.print();
        }
      }

      // Close and refresh
      setIsNewOpen(false);
      fetchCompanies();
    } catch (err) {
      console.error(err);
      alert('Error during registration and PDF generation');
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
          <h1 className="text-2xl font-bold tracking-tight">Company Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Register and manage corporate profiles</p>
        </div>
        <Button onClick={handleOpenNewCompanyModal} className="rounded-xl gap-2 shadow-sm bg-primary text-primary-foreground">
          <Plus className="w-4 h-4" /> New Company
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
        <DataTable
          data={companies}
          columns={columns}
          searchKeys={['name', 'cin', 'email']}
          statusKey="status"
          statusOptions={['Active', 'Pending', 'Struck Off']}
          onRowClick={handleRowClick}
        />
      </div>

      {/* New Company / Registration Dialog */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className={step === 'edit' ? 'max-w-4xl h-[85vh] flex flex-col' : 'max-w-md'}>
          <DialogHeader>
            <DialogTitle>
              {createCompanyTemplate
                ? `Register via Custom Template: ${createCompanyTemplate.name}`
                : 'Add New Company'}
            </DialogTitle>
          </DialogHeader>

          {createCompanyTemplate ? (
            step === 'form' ? (
              <form onSubmit={handleTemplateFormSubmit} className="space-y-4 py-2">
                <p className="text-xs text-muted-foreground">
                  Fill out the template questionnaire fields to generate the incorporation PDF.
                </p>
                <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
                  {createCompanyTemplate.fields.map(field => (
                    <div key={field.id} className="space-y-1">
                      <Label htmlFor={field.id}>{field.name} {field.required && <span className="text-destructive">*</span>}</Label>
                      {field.type === 'dropdown' ? (
                        <select
                          id={field.id}
                          className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                          className="rounded-lg"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <Button type="submit" className="w-full rounded-xl mt-2">Generate Preview & Edit Document</Button>
              </form>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden min-h-0 py-2 space-y-4">
                <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl border border-border">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Post-Editing Mode:</span> Modify the merged text or tables below directly before final save.
                  </div>
                  <Button size="sm" onClick={() => setStep('form')} variant="outline" className="h-8 text-xs rounded-lg gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Re-fill Form
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto border border-border rounded-xl p-6 bg-card min-h-[300px]">
                  <div
                    ref={previewEditorRef}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onInput={handlePreviewInput}
                    className="focus:outline-none prose prose-sm max-w-none text-[15px]"
                    dangerouslySetInnerHTML={{ __html: generatedHtml }}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2 border-t border-border">
                  <Button variant="outline" onClick={() => setIsNewOpen(false)} className="rounded-xl">Cancel</Button>
                  <Button onClick={handleSaveAndRegister} className="rounded-xl gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
                    <Save className="w-4 h-4" /> Save & Generate PDF
                  </Button>
                </div>
              </div>
            )
          ) : (
            // Default creation form if template "create company" is not found
            <form onSubmit={handleCreateCompanyDefault} className="space-y-4 py-2">
              <p className="text-xs text-muted-foreground italic">
                Tip: Create a template named &ldquo;create company&rdquo; in the Template Editor to enable custom document matching and auto-generation here.
              </p>
              <div>
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="ACME Private Limited" className="mt-1" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cin">CIN (21 characters)</Label>
                  <Input id="cin" value={newCin} onChange={e => setNewCin(e.target.value)} placeholder="U72200MH2020PTC123456" className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="type">Company Type</Label>
                  <Input id="type" value={newType} onChange={e => setNewType(e.target.value)} placeholder="Private Limited" className="mt-1" required />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="info@acme.com" className="mt-1" required />
              </div>
              <Button type="submit" className="w-full rounded-xl mt-2">Create Company</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Company Details</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Name</span>
                  <p className="text-sm font-medium">{selectedCompany.name}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Status</span>
                  <div className="mt-0.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {selectedCompany.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">CIN</span>
                  <p className="text-sm font-medium">{selectedCompany.cin}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Type</span>
                  <p className="text-sm font-medium">{selectedCompany.type}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Incorporation Date</span>
                  <p className="text-sm font-medium">{formatDate(selectedCompany.incorporationDate)}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Email</span>
                  <p className="text-sm font-medium truncate">{selectedCompany.email}</p>
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Registered Office</span>
                <p className="text-sm font-medium text-wrap">{selectedCompany.registeredOffice}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}