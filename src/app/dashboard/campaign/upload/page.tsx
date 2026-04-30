"use client";

import React, { useState } from "react";
import { Toolbar } from "@/components/shared/Toolbar";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Play, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

interface ParsedRow {
  id: number;
  name: string;
  phone: string;
  disease: string;
  isValid: boolean;
  errors: string[];
}

export default function UploadCampaignPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileAccepted = (acceptedFile: File) => {
    setFile(acceptedFile);
    
    // Mock parsing the file
    setIsUploading(true);
    setTimeout(() => {
      const mockParsedData: ParsedRow[] = [
        { id: 1, name: "John Doe", phone: "+91 9876543210", disease: "Root Canal", isValid: true, errors: [] },
        { id: 2, name: "Jane Smith", phone: "98765432", disease: "Teeth Whitening", isValid: false, errors: ["Malformed phone (needs 10 digits)"] },
        { id: 3, name: "Robert Wilson", phone: "+91 9988776655", disease: "Extraction", isValid: true, errors: [] },
        { id: 4, name: "", phone: "+91 9876500000", disease: "Checkup", isValid: false, errors: ["Missing name"] },
        { id: 5, name: "Alice Brown", phone: "+91 9123456789", disease: "", isValid: false, errors: ["Missing disease/concern"] },
        { id: 6, name: "Charlie Davis", phone: "+91 9999988888", disease: "Implants", isValid: true, errors: [] },
      ];
      setParsedData(mockParsedData);
      setIsUploading(false);
    }, 1500);
  };

  const handleConfirmQueue = () => {
    // Mock queuing the campaign
    alert(`Queued ${validCount} valid contacts for campaign!`);
    router.push("/dashboard/campaign/history");
  };

  const validCount = parsedData.filter(d => d.isValid).length;
  const invalidCount = parsedData.length - validCount;

  const columns: Column<ParsedRow>[] = [
    { 
      header: "Status", 
      accessorKey: "isValid", 
      cell: (item) => (
        item.isValid ? 
          <CheckCircle2 className="text-emerald-500 w-5 h-5" /> : 
          <AlertCircle className="text-rose-500 w-5 h-5" />
      )
    },
    { header: "Name", accessorKey: "name", cell: (item) => <span className={!item.name ? "text-rose-500 italic" : "text-slate-900"}>{item.name || "Missing"}</span> },
    { header: "Phone", accessorKey: "phone", cell: (item) => <span className={item.errors.some(e => e.includes("phone")) ? "text-rose-500 font-medium" : "text-slate-600"}>{item.phone}</span> },
    { header: "Disease / Concern", accessorKey: "disease", cell: (item) => <span className={!item.disease ? "text-rose-500 italic" : "text-slate-600"}>{item.disease || "Missing"}</span> },
    { 
      header: "Issues", 
      accessorKey: "errors", 
      cell: (item) => (
        <span className="text-rose-600 text-xs">
          {item.errors.join(", ")}
        </span>
      ) 
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      <Toolbar 
        title="Upload Outreach Campaign" 
        description="Upload a CSV or XLSX file to queue an SMS/WhatsApp campaign."
      />

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b p-4 px-6">
          <h3 className="font-semibold text-slate-800 flex items-center">
            <Upload className="w-4 h-4 mr-2 text-primary" />
            File Upload
          </h3>
        </div>
        <CardContent className="p-6">
          <FileDropzone onFileAccepted={handleFileAccepted} />
        </CardContent>
      </Card>

      {isUploading && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
          <p>Parsing dataset...</p>
        </div>
      )}

      {!isUploading && parsedData.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-center items-center">
              <span className="text-sm font-medium text-slate-500 mb-1">Total Rows</span>
              <span className="text-3xl font-bold text-slate-900">{parsedData.length}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 shadow-sm flex flex-col justify-center items-center">
              <span className="text-sm font-medium text-emerald-700 mb-1">Valid Records</span>
              <span className="text-3xl font-bold text-emerald-700">{validCount}</span>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 shadow-sm flex flex-col justify-center items-center">
              <span className="text-sm font-medium text-rose-700 mb-1">Invalid Records</span>
              <span className="text-3xl font-bold text-rose-700">{invalidCount}</span>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col justify-center items-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/10 w-0 group-hover:w-full transition-all duration-300 ease-out" />
              <button onClick={handleConfirmQueue} disabled={validCount === 0} className="relative z-10 flex flex-col items-center disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="text-sm font-medium text-primary mb-1">Action</span>
                <span className="text-lg font-bold text-primary flex items-center">
                  <Play className="w-5 h-5 mr-1" fill="currentColor" />
                  Queue Campaign
                </span>
              </button>
            </div>
          </div>

          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b p-4 px-6 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Data Preview</h3>
              <span className="text-xs text-slate-500">Showing {parsedData.length} rows</span>
            </div>
            <DataTable 
              columns={columns} 
              data={parsedData} 
            />
          </Card>
          
          <div className="flex justify-end pt-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-medium" onClick={handleConfirmQueue} disabled={validCount === 0}>
              Confirm & Queue Campaign
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
