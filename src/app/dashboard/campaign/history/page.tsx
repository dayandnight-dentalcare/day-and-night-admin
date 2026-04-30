"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Toolbar } from "@/components/shared/Toolbar";
import { DataTable, Column } from "@/components/shared/DataTable";
import { FileSpreadsheet } from "lucide-react";

interface CampaignHistory {
  id: string;
  fileName: string;
  uploadDate: string;
  totalTarget: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
}

const mockHistory: CampaignHistory[] = [
  {
    id: "CMP-001",
    fileName: "implant_leads_may_2024.csv",
    uploadDate: "2024-05-10 14:30",
    totalTarget: 150,
    sentCount: 150,
    deliveredCount: 142,
    failedCount: 8,
  },
  {
    id: "CMP-002",
    fileName: "general_checkup_reminders.xlsx",
    uploadDate: "2024-04-28 09:15",
    totalTarget: 420,
    sentCount: 420,
    deliveredCount: 405,
    failedCount: 15,
  },
  {
    id: "CMP-003",
    fileName: "whitening_promo_q2.csv",
    uploadDate: "2024-04-15 11:00",
    totalTarget: 85,
    sentCount: 85,
    deliveredCount: 80,
    failedCount: 5,
  },
];

export default function CampaignHistoryPage() {
  const router = useRouter();
  const [history] = useState<CampaignHistory[]>(mockHistory);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = history.filter(
    (h) => h.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRowClick = (campaign: CampaignHistory) => {
    // Navigate to delivery status with some query params or state (mocked)
    router.push(`/dashboard/campaign/delivery?campaignId=${campaign.id}`);
  };

  const columns: Column<CampaignHistory>[] = [
    { 
      header: "File Name", 
      accessorKey: "fileName", 
      cell: (item) => (
        <div className="flex items-center">
          <FileSpreadsheet className="w-4 h-4 mr-2 text-slate-400" />
          <span className="font-medium text-slate-900">{item.fileName}</span>
        </div>
      ) 
    },
    { header: "Upload Date", accessorKey: "uploadDate", cell: (item) => <span className="text-slate-600">{item.uploadDate}</span> },
    { header: "Total Target", accessorKey: "totalTarget", cell: (item) => <span className="font-mono text-slate-600">{item.totalTarget}</span> },
    { header: "Sent", accessorKey: "sentCount", cell: (item) => <span className="font-mono text-blue-600 font-medium">{item.sentCount}</span> },
    { header: "Delivered", accessorKey: "deliveredCount", cell: (item) => <span className="font-mono text-emerald-600 font-medium">{item.deliveredCount}</span> },
    { header: "Failed", accessorKey: "failedCount", cell: (item) => <span className="font-mono text-rose-600 font-medium">{item.failedCount}</span> },
  ];

  return (
    <div className="space-y-6">
      <Toolbar 
        title="Campaign History" 
        description="View past SMS/WhatsApp outreach campaigns."
        onSearch={setSearchQuery}
        searchPlaceholder="Search file name..."
      />

      <DataTable 
        columns={columns} 
        data={filteredHistory} 
        onRowClick={handleRowClick}
      />
    </div>
  );
}
