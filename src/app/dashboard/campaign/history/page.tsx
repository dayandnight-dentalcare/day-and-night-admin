"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/api";
import { Toolbar } from "@/components/shared/Toolbar";
import { DataTable, Column } from "@/components/shared/DataTable";
import { FileSpreadsheet, Loader2 } from "lucide-react";

interface Campaign {
  id: number;
  filename: string;
  total_count: number;
  created_at: string;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  pending_count: number;
}

export default function CampaignHistoryPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    adminFetch("/api/admin/stats")
      .then((data) => setCampaigns(data.campaigns))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = campaigns.filter((c) =>
    c.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRowClick = (campaign: Campaign) => {
    router.push(`/dashboard/campaign/delivery?campaignId=${campaign.id}`);
  };

  const columns: Column<Campaign>[] = [
    {
      header: "File Name",
      accessorKey: "filename",
      cell: (item) => (
        <div className="flex items-center">
          <FileSpreadsheet className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
          <span className="font-medium text-slate-900">{item.filename}</span>
        </div>
      ),
    },
    {
      header: "Upload Date",
      accessorKey: "created_at",
      cell: (item) => (
        <span className="text-slate-600">
          {new Date(item.created_at).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      header: "Total",
      accessorKey: "total_count",
      cell: (item) => (
        <span className="font-mono text-slate-600">{item.total_count}</span>
      ),
    },
    {
      header: "Sent",
      accessorKey: "sent_count",
      cell: (item) => (
        <span className="font-mono text-blue-600 font-medium">
          {item.sent_count}
        </span>
      ),
    },
    {
      header: "Delivered",
      accessorKey: "delivered_count",
      cell: (item) => (
        <span className="font-mono text-emerald-600 font-medium">
          {item.delivered_count}
        </span>
      ),
    },
    {
      header: "Failed",
      accessorKey: "failed_count",
      cell: (item) => (
        <span className="font-mono text-rose-600 font-medium">
          {item.failed_count}
        </span>
      ),
    },
    {
      header: "Pending",
      accessorKey: "pending_count",
      cell: (item) => (
        <span className="font-mono text-amber-600 font-medium">
          {item.pending_count}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Toolbar
        title="Campaign History"
        description="View past WhatsApp outreach campaigns."
        onSearch={setSearchQuery}
        searchPlaceholder="Search file name..."
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={handleRowClick}
          mobileRenderer={(item) => (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div>
                <div className="flex items-center text-slate-900 font-medium mb-1">
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-primary" />
                  {item.filename}
                </div>
                <p className="text-xs text-slate-500">
                  {new Date(item.created_at).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-50 text-center">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Total</p>
                  <p className="font-mono text-sm text-slate-700">{item.total_count}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-blue-500">Sent</p>
                  <p className="font-mono text-sm text-blue-700">{item.sent_count}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-emerald-500">Delivered</p>
                  <p className="font-mono text-sm text-emerald-700">{item.delivered_count}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-rose-500">Failed</p>
                  <p className="font-mono text-sm text-rose-700">{item.failed_count}</p>
                </div>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}