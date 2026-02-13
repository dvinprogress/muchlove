'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Upload, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { importContactsCSV } from '@/app/[locale]/dashboard/contacts/actions';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CSVRow {
  first_name: string;
  email: string;
  company_name: string;
}

interface ParsedCSV {
  rows: CSVRow[];
  errors: { row: number; message: string }[];
}

type Step = 'upload' | 'preview' | 'result';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ROWS = 200;

export function CSVImportModal({ isOpen, onClose }: CSVImportModalProps) {
  const t = useTranslations('contacts.import');
  const router = useRouter();

  const [step, setStep] = useState<Step>('upload');
  const [isDragOver, setIsDragOver] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedCSV | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    created: number;
    errors: { row: number; message: string }[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setStep('upload');
    setParsedData(null);
    setImportResult(null);
    setIsImporting(false);
    onClose();
  };

  const detectSeparator = (line: string): ',' | ';' => {
    const commaCount = (line.match(/,/g) || []).length;
    const semicolonCount = (line.match(/;/g) || []).length;
    return semicolonCount > commaCount ? ';' : ',';
  };

  const parseCSVLine = (line: string, separator: ',' | ';'): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === separator && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  };

  const parseCSV = (text: string): ParsedCSV => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);

    if (lines.length === 0) {
      return { rows: [], errors: [{ row: 0, message: t('invalidFormat') }] };
    }

    if (lines.length > MAX_ROWS + 1) {
      return { rows: [], errors: [{ row: 0, message: t('maxRows') }] };
    }

    const separator = detectSeparator(lines[0]!);
    const headers = parseCSVLine(lines[0]!.toLowerCase(), separator);

    // Validate headers
    const requiredHeaders = ['first_name', 'email', 'company_name'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      return {
        rows: [],
        errors: [{
          row: 0,
          message: `${t('missingColumn')}: ${missingHeaders.join(', ')}`
        }]
      };
    }

    const firstNameIndex = headers.indexOf('first_name');
    const emailIndex = headers.indexOf('email');
    const companyNameIndex = headers.indexOf('company_name');

    const rows: CSVRow[] = [];
    const errors: { row: number; message: string }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const values = parseCSVLine(line, separator);
      const rowNumber = i + 1;

      const firstName = values[firstNameIndex]?.trim() || '';
      const email = values[emailIndex]?.trim() || '';
      const companyName = values[companyNameIndex]?.trim() || '';

      // Validate row
      const rowErrors: string[] = [];

      if (!firstName) {
        rowErrors.push('first_name required');
      }
      if (!email) {
        rowErrors.push('email required');
      } else if (!EMAIL_REGEX.test(email)) {
        rowErrors.push('invalid email');
      }
      if (!companyName) {
        rowErrors.push('company_name required');
      }

      if (rowErrors.length > 0) {
        errors.push({ row: rowNumber, message: rowErrors.join(', ') });
      } else {
        rows.push({ first_name: firstName, email, company_name: companyName });
      }
    }

    return { rows, errors };
  };

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error(t('invalidFormat'));
      return;
    }

    const text = await file.text();
    const parsed = parseCSV(text);
    setParsedData(parsed);
    setStep('preview');
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.rows.length === 0) return;

    setIsImporting(true);

    try {
      const result = await importContactsCSV(parsedData.rows);

      if (result.success) {
        setImportResult(result.data);
        setStep('result');

        if (result.data.errors.length === 0) {
          toast.success(`${result.data.created} ${t('success')}`);
          router.refresh();
          setTimeout(handleClose, 2000);
        }
      } else {
        toast.error(result.error);
        setIsImporting(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed');
      setIsImporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('title')} size="lg">
      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-slate-600 mb-6">{t('description')}</p>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-colors duration-200
                ${isDragOver
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-slate-300 hover:border-rose-400'
                }
              `}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-lg font-medium text-slate-700 mb-2">
                {t('selectFile')}
              </p>
              <p className="text-sm text-slate-500">{t('dragDrop')}</p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </motion.div>
        )}

        {step === 'preview' && parsedData && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t('preview', { count: parsedData.rows.length })}
              </h3>

              {parsedData.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-red-800 mb-2">
                        {parsedData.errors.length} {t('errors')}
                      </p>
                      <ul className="text-sm text-red-700 space-y-1">
                        {parsedData.errors.slice(0, 5).map((error, idx) => (
                          <li key={idx}>
                            {t('row', { row: error.row })}: {error.message}
                          </li>
                        ))}
                        {parsedData.errors.length > 5 && (
                          <li className="text-red-600">
                            {t('andMore', { count: parsedData.errors.length - 5 })}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {parsedData.rows.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-slate-700">
                          {t('headerFirstName')}
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-700">
                          {t('headerEmail')}
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-700">
                          {t('headerCompany')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.rows.slice(0, 5).map((row, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                        >
                          <td className="px-4 py-2 text-slate-900">{row.first_name}</td>
                          <td className="px-4 py-2 text-slate-600">{row.email}</td>
                          <td className="px-4 py-2 text-slate-600">{row.company_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.rows.length > 5 && (
                    <div className="px-4 py-2 bg-slate-50 text-sm text-slate-500 text-center border-t border-slate-200">
                      {t('andMore', { count: parsedData.rows.length - 5 })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Button variant="ghost" onClick={handleClose}>
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={parsedData.rows.length === 0 || isImporting}
                loading={isImporting}
              >
                {isImporting ? t('importing') : t('import')}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'result' && importResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>

            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {t('resultTitle', { count: importResult.created })}
            </h3>

            {importResult.errors.length > 0 && (
              <div className="mt-4 text-left bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="font-medium text-yellow-800 mb-2">
                  {t('rowsSkipped', { count: importResult.errors.length })}
                </p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {importResult.errors.slice(0, 3).map((error, idx) => (
                    <li key={idx}>
                      {t('row', { row: error.row })}: {error.message}
                    </li>
                  ))}
                  {importResult.errors.length > 3 && (
                    <li className="text-yellow-600">
                      {t('andMore', { count: importResult.errors.length - 3 })}
                    </li>
                  )}
                </ul>
              </div>
            )}

            <Button
              variant="primary"
              onClick={handleClose}
              className="mt-6"
            >
              {t('done')}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
