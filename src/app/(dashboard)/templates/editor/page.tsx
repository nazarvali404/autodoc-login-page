'use client';

import React, { Suspense } from 'react';
import { motion } from 'motion/react';
import DocumentEditor from '@/components/templates/DocumentEditor';

export default function TemplateEditorPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-8.5rem)] flex flex-col -m-4 md:-m-6 lg:-m-8 overflow-hidden bg-background"
    >
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading editor...</div>}>
        <DocumentEditor />
      </Suspense>
    </motion.div>
  );
}
