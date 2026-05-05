"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { adminFetch } from "@/lib/api";
import { Toolbar } from "@/components/shared/Toolbar";
import { DataTable, Column } from "@/components/shared/DataTable";
import { SummaryCard } from "@/components/shared/SummaryCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Users, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

interface DeliveryRow {
  id: number;
  patient_name: string;
  phone: string;
  disease: string;
  status: "Pending" | "Processing" | "Sent" | "Delivered" | "Failed";
  sent_at: string | null;
}

function DeliveryStatusContent() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");

  const [rows, setRows] = useState<DeliveryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!campaignId) {
      setError("No campaign ID provided.");
      setLoading(false);
      return;
    }

    adminFetch(`/api/admin/outreach/delivery?campaignId=${campaignId}`)
      .then((data) => setRows(data.rows))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [campaignId]);

  const filtered = rows.filter(
    (r) =>
      r.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery)
  );

  // Derive counts from real data
  const delivered = rows.filter((r) => r.status === "Delivered").length;
  const failed    = rows.filter((r) => r.status === "Failed").length;
  const pending   = rows.filter(
    (r) => r.status === "Pending" || r.status === "Processing"
  ).length;

  const columns: Column<DeliveryRow>[] = [
    {
      header: "Patient Name",
      accessorKey: "patient_name",
      cell: (item) => (
        <span className="font-medium text-slate-900">{item.patient_name}</span>
      ),
    },
    {
      header: "Phone",
      accessorKey: "phone",
      cell: (item) => <span className="text-slate-600">{item.phone}</span>,
    },
    {
      header: "Disease / Concern",
      accessorKey: "disease",
      cell: (item) => <span className="text-slate-600">{item.disease}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: "Sent At",
      accessorKey: "sent_at",
      cell: (item) => (
        <span className="text-slate-500 font-mono text-sm">
          {item.sent_at
            ? new Date(item.sent_at).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              })
            : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Toolbar
        title={`Delivery Log — Campaign #${campaignId}`}
        description="Per-patient delivery status for this outreach campaign."
        onSearch={setSearchQuery}
        searchPlaceholder="Search by name or phone..."
      />

      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Total"
              value={rows.length}
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
              title="Pending / Processing"
              value={pending}
              icon={Clock}
              iconColor="text-amber-500"
            />
          </div>

          <DataTable
            columns={columns}
            data={filtered}
            mobileRenderer={(item) => (
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{item.patient_name}</h3>
                    <div className="text-sm text-slate-500 mt-0.5">
                      {item.phone}
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="pt-2 border-t border-slate-50">
                  <p className="text-xs text-slate-500 mb-0.5">Disease / Concern</p>
                  <p className="text-sm font-medium text-slate-800">{item.disease}</p>
                </div>
              </div>
            )}
          />
        </>
      )}
    </div>
  );
}

export default function DeliveryStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" />
        </div>
      }
    >
      <DeliveryStatusContent />
    </Suspense>
  );
}