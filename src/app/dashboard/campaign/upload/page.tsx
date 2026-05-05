"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/api";
import { Toolbar } from "@/components/shared/Toolbar";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, CheckCircle2, Send } from "lucide-react";

type UploadState = "idle" | "uploading" | "done" | "error";

interface UploadResult {
  campaign_id: number;
  total_queued: number;
  skipped: number;
}

export default function UploadCampaignPage() {
  const router = useRouter();
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [result, setResult] = useState<UploadResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileAccepted = async (file: File) => {
    setUploadState("uploading");
    setResult(null);
    setErrorMsg("");

    try {
      // Send file directly to backend — backend does all parsing and validation
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const secret =
        typeof window !== "undefined"
          ? sessionStorage.getItem("adminSecret") ?? ""
          : "";

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${BACKEND_URL}/api/admin/outreach/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${secret}` },
          // Do NOT set Content-Type — browser sets it automatically with boundary for FormData
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Upload failed.");

      setResult(data);
      setUploadState("done");
    } catch (err: any) {
      setErrorMsg(err.message ?? "Something went wrong.");
      setUploadState("error");
    }
  };

  const handleReset = () => {
    setUploadState("idle");
    setResult(null);
    setErrorMsg("");
  };

  return (
    <div className="space-y-6 pb-20">
      <Toolbar
        title="Upload Outreach Campaign"
        description="Upload an XLSX or XLS file to queue a WhatsApp outreach campaign."
      />

      {/* File format instructions */}
      <Card className="border-slate-200 shadow-sm">
        <div className="bg-slate-50 border-b p-4 px-6">
          <h3 className="font-semibold text-slate-800 text-sm">
            Required Excel Format
          </h3>
        </div>
        <CardContent className="p-4 px-6">
          <p className="text-sm text-slate-600">
            Your file must contain exactly these three column headers (case-insensitive):
          </p>
          <div className="flex gap-3 mt-3">
            {["Name", "Mobile", "Disease"].map((col) => (
              <span
                key={col}
                className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-mono rounded-md border border-slate-200"
              >
                {col}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Maximum 500 rows per upload. Mobile must be a valid 10-digit Indian number.
          </p>
        </CardContent>
      </Card>

      {/* Upload zone — only show when idle or error */}
      {(uploadState === "idle" || uploadState === "error") && (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b p-4 px-6">
            <h3 className="font-semibold text-slate-800 flex items-center">
              <Upload className="w-4 h-4 mr-2 text-primary" />
              File Upload
            </h3>
          </div>
          <CardContent className="p-6">
            <FileDropzone onFileAccepted={handleFileAccepted} />
            {uploadState === "error" && (
              <p className="mt-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3">
                {errorMsg}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Uploading spinner */}
      {uploadState === "uploading" && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="font-medium">Uploading and processing your file...</p>
          <p className="text-sm text-slate-400 mt-1">
            The server is validating numbers and queuing messages.
          </p>
        </div>
      )}

      {/* Success state */}
      {uploadState === "done" && result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
              <span className="text-sm font-medium text-emerald-700 mb-1">
                Queued for Sending
              </span>
              <span className="text-4xl font-bold text-emerald-700">
                {result.total_queued}
              </span>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 flex flex-col items-center">
              <span className="text-sm font-medium text-amber-700 mb-1">
                Skipped
              </span>
              <span className="text-4xl font-bold text-amber-700">
                {result.skipped}
              </span>
              <span className="text-xs text-amber-600 mt-1 text-center">
                Invalid numbers, duplicates, or opted-out patients
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center">
              <Send className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-sm font-medium text-slate-600 mb-1">
                Messages will send over the next few minutes via the cron job.
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end mt-4">
            <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto h-12 md:h-10 text-base md:text-sm">
              Upload Another File
            </Button>
            <Button
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white h-12 md:h-10 text-base md:text-sm"
              onClick={() => router.push("/dashboard/campaign/history")}
            >
              View Campaign History
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}