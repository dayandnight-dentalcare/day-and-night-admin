"use client";

import React, { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/api";
import { Toolbar } from "@/components/shared/Toolbar";
import { DataTable, Column } from "@/components/shared/DataTable";
import { SlideOver } from "@/components/shared/SlideOver";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Phone, History, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Patient {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  created_at: string;
  do_not_contact: boolean;
  total_bookings: number;
  last_appointment_date: string | null;
}


// This matches what your backend actually sends
type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

// This is what the StatusBadge component demands
type BadgeStatus = "Pending" | "Confirmed" | "Cancelled" | "Completed";

interface PatientHistory {
  appointment_id: number;
  reason: string | null;
  status: BookingStatus; // Tell TypeScript this will be lowercase
  created_at: string;
  slot_date: string | null;
  slot_time: string | null;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<PatientHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // ── Load patient list ────────────────────────────────────────────────────────
  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qs = searchQuery
        ? `?search=${encodeURIComponent(searchQuery)}`
        : "";
      const data = await adminFetch(`/api/admin/patients${qs}`);
      setPatients(data.patients);
    } catch (err: any) {
      setError("Failed to load patients. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    // Debounce search so we don't fire on every keystroke
    const timer = setTimeout(() => {
      loadPatients();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadPatients]);

  // ── Open patient detail + fetch history ─────────────────────────────────────
  const handleRowClick = async (patient: Patient) => {
    setSelectedPatient(patient);
    setHistory([]);
    setIsSlideOverOpen(true);
    setHistoryLoading(true);
    try {
      const data = await adminFetch(`/api/admin/patients?id=${patient.id}`);
      setHistory(data.history);
    } catch {
      // History failing shouldn't close the slideover
    } finally {
      setHistoryLoading(false);
    }
  };

  // ── Toggle do not contact ────────────────────────────────────────────────────
  const handleToggleDNC = async () => {
    if (!selectedPatient) return;
    setIsToggling(true);
    try {
      const newValue = !selectedPatient.do_not_contact;
      await adminFetch("/api/admin/patients", {
        method: "PATCH",
        body: JSON.stringify({
          id: selectedPatient.id,
          do_not_contact: newValue,
        }),
      });
      // Update both the list row and the open slideover
      const updated = { ...selectedPatient, do_not_contact: newValue };
      setSelectedPatient(updated);
      setPatients((prev) =>
        prev.map((p) => (p.id === selectedPatient.id ? updated : p))
      );
    } catch (err: any) {
      alert(err.message ?? "Failed to update. Please try again.");
    } finally {
      setIsToggling(false);
    }
  };

  const columns: Column<Patient>[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">{item.name}</span>
          {item.do_not_contact && (
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-rose-100 text-rose-600 rounded">
              DNC
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Phone",
      accessorKey: "phone",
      cell: (item) => (
        <span className="text-slate-600">{item.phone}</span>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: (item) => (
        <span className="text-slate-500 text-sm">
          {item.email ?? "—"}
        </span>
      ),
    },
    {
      header: "Total Bookings",
      accessorKey: "total_bookings",
      cell: (item) => (
        <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded-md text-sm">
          {item.total_bookings}
        </span>
      ),
    },
    {
      header: "Last Appointment",
      accessorKey: "last_appointment_date",
      cell: (item) =>
        item.last_appointment_date ? (
          <span className="text-slate-600">
            {new Date(item.last_appointment_date).toLocaleDateString("en-IN", {
              timeZone: "Asia/Kolkata",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        ) : (
          <span className="text-slate-400 italic text-sm">No visits yet</span>
        ),
    },
    {
      header: "Member Since",
      accessorKey: "created_at",
      cell: (item) => (
        <span className="text-slate-500 text-sm">
          {new Date(item.created_at).toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Toolbar
        title="Patients"
        description="All registered patients from the booking system."
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
        <DataTable
          columns={columns}
          data={patients}
          onRowClick={handleRowClick}
        />
      )}

      {/* ── Patient detail slideover ── */}
      <SlideOver
        open={isSlideOverOpen}
        onOpenChange={setIsSlideOverOpen}
        title="Patient Profile"
        description={selectedPatient ? `ID: ${selectedPatient.id}` : ""}
      >
        {selectedPatient && (
          <div className="space-y-6">

            {/* DNC warning banner */}
            {selectedPatient.do_not_contact && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-lg">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                This patient has opted out of outreach campaigns.
              </div>
            )}

            {/* Patient header */}
            <div className="flex items-center gap-4 pb-6 border-b">
              <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-bold shrink-0">
                {selectedPatient.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedPatient.name}
                </h3>
                <div className="flex items-center text-sm text-slate-500 mt-0.5">
                  <Phone className="w-3.5 h-3.5 mr-1.5" />
                  {selectedPatient.phone}
                </div>
                {selectedPatient.email && (
                  <p className="text-sm text-slate-400 mt-0.5">
                    {selectedPatient.email}
                  </p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <p className="text-xs text-slate-500 mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-slate-900">
                  {selectedPatient.total_bookings}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <p className="text-xs text-slate-500 mb-1">Member Since</p>
                <p className="text-sm font-semibold text-slate-900">
                  {new Date(selectedPatient.created_at).toLocaleDateString(
                    "en-IN",
                    {
                      timeZone: "Asia/Kolkata",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>

            {/* Appointment history */}
            <div className="space-y-3 pt-2">
              <h5 className="text-sm font-semibold text-slate-900 flex items-center">
                <History className="w-4 h-4 mr-2 text-slate-500" />
                Appointment History
              </h5>

              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-primary w-5 h-5" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-4 text-center">
                  No appointments recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {history.map((h) => (
                    <div
                      key={h.appointment_id}
                      className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">
                          {h.slot_date
                            ? new Date(h.slot_date).toLocaleDateString(
                                "en-IN",
                                {
                                  timeZone: "Asia/Kolkata",
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : new Date(h.created_at).toLocaleDateString(
                                "en-IN",
                                { timeZone: "Asia/Kolkata" }
                              )}
                          {h.slot_time && (
                            <span className="ml-1 text-slate-300">
                              · {h.slot_time}
                            </span>
                          )}
                        </span>
                      <StatusBadge 
  status={(h.status.charAt(0).toUpperCase() + h.status.slice(1)) as BadgeStatus} 
/>
                      </div>
                      <p className="text-sm font-medium text-slate-800">
                        {h.reason ?? "No reason recorded"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Do Not Contact toggle */}
            <div className="pt-4 border-t">
              <Button
                className={cn(
                  "w-full justify-start border font-medium",
                  selectedPatient.do_not_contact
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
                )}
                variant="outline"
                disabled={isToggling}
                onClick={handleToggleDNC}
              >
                {isToggling ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mr-2" />
                )}
                {selectedPatient.do_not_contact
                  ? "Remove Do Not Contact flag"
                  : "Mark as Do Not Contact"}
              </Button>
              <p className="text-xs text-slate-400 mt-2 text-center">
                DNC patients are automatically skipped in all outreach campaigns.
              </p>
            </div>

          </div>
        )}
      </SlideOver>
    </div>
  );
}