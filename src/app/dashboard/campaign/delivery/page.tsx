"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Toolbar } from "@/components/shared/Toolbar";
import { DataTable, Column } from "@/components/shared/DataTable";
import { SummaryCard } from "@/components/shared/SummaryCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Users, CheckCircle, XCircle, Clock } from "lucide-react";

type DeliveryStatus = "Delivered" | "Failed" | "Pending";

interface DeliveryLog {
  id: string;
  patientName: string;
  phone: string;
  disease: string;
  status: DeliveryStatus;
  timestamp: string;
}

const mockLogs: DeliveryLog[] = [
  { id: "LOG-001", patientName: "Sarah Jenkins", phone: "+91 98765 43210", disease: "Root Canal", status: "Delivered", timestamp: "2024-05-15 10:05:12" },
  { id: "LOG-002", patientName: "Michael Chen", phone: "+91 98765 43211", disease: "Checkup", status: "Failed", timestamp: "2024-05-15 10:05:13" },
  { id: "LOG-003", patientName: "Emily Rodriguez", phone: "+91 98765 43212", disease: "Teeth Whitening", status: "Delivered", timestamp: "2024-05-15 10:05:14" },
  { id: "LOG-004", patientName: "David Kim", phone: "+91 98765 43213", disease: "Extraction", status: "Pending", timestamp: "2024-05-15 10:05:15" },
  { id: "LOG-005", patientName: "Alice Brown", phone: "+91 91234 56789", disease: "Implants", status: "Delivered", timestamp: "2024-05-15 10:05:16" },
];

function DeliveryStatusContent() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId") || "CMP-LATEST";
  
  const [logs] = useState<DeliveryLog[]>(mockLogs);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = logs.filter(
    (log) => 
      log.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.phone.includes(searchQuery)
  );

  const total = logs.length;
  const delivered = logs.filter(l => l.status === "Delivered").length;
  const failed = logs.filter(l => l.status === "Failed").length;
  const pending = logs.filter(l => l.status === "Pending").length;

  const columns: Column<DeliveryLog>[] = [
    { header: "Patient Name", accessorKey: "patientName", cell: (item) => <span className="font-medium text-slate-900">{item.patientName}</span> },
    { header: "Phone", accessorKey: "phone", cell: (item) => <span className="text-slate-600">{item.phone}</span> },
    { header: "Disease", accessorKey: "disease", cell: (item) => <span className="text-slate-600">{item.disease}</span> },
    { header: "Status", accessorKey: "status", cell: (item) => <StatusBadge status={item.status} /> },
    { header: "Sent Timestamp", accessorKey: "timestamp", cell: (item) => <span className="text-slate-500 font-mono text-sm">{item.timestamp}</span> },
  ];

  return (
    <div className="space-y-6">
      <Toolbar 
        title={`Delivery Log: ${campaignId}`} 
        description="Detailed view of message delivery statuses for this campaign."
        onSearch={setSearchQuery}
        searchPlaceholder="Search by name or phone..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Total Sent" 
          value={total} 
          icon={Users} 
          iconColor="text-blue-500"
        />
        <SummaryCard 
          title="Delivered" 
          value={delivered} 
          icon={CheckCircle} 
          iconColor="text-emerald-500"
        />
        <SummaryCard 
          title="Failed" 
          value={failed} 
          icon={XCircle} 
          iconColor="text-rose-500"
        />
        <SummaryCard 
          title="Pending" 
          value={pending} 
          icon={Clock} 
          iconColor="text-amber-500"
        />
      </div>

      <div className="pt-4">
        <DataTable 
          columns={columns} 
          data={filteredLogs} 
        />
      </div>
    </div>
  );
}

export default function DeliveryStatusPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 animate-pulse">Loading delivery data...</div>}>
      <DeliveryStatusContent />
    </Suspense>
  );
}
