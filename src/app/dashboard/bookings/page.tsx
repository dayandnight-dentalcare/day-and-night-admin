"use client";

import React, { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/api";
import { Toolbar } from "@/components/shared/Toolbar";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SlideOver } from "@/components/shared/SlideOver";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Phone,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface Booking {
  appointment_id: number;
  reason: string | null;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  created_at: string;
  patient_id: number;
  patient_name: string;
  patient_phone: string;
  patient_email: string | null;
  slot_id: number | null;
  slot_date: string | null;
  slot_time: string | null;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qs = statusFilter !== "All" ? `?status=${statusFilter}` : "";
      const data = await adminFetch(`/api/admin/bookings${qs}`);
      setBookings(data.bookings);
    } catch (err: any) {
      setError("Failed to load bookings. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Client-side search on top of server-side status filter
  const filtered = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.patient_name.toLowerCase().includes(q) ||
      b.patient_phone.includes(q) ||
      String(b.appointment_id).includes(q)
    );
  });

  const handleRowClick = (b: Booking) => {
    setSelectedBooking(b);
    setIsSlideOverOpen(true);
  };

  const handleStatusUpdate = async (
    id: number,
    status: "Confirmed" | "Completed" | "Cancelled"
  ) => {
    setIsUpdating(true);
    try {
      await adminFetch("/api/admin/bookings", {
        method: "PATCH",
        body: JSON.stringify({ id, status }),
      });
      // Update both the list and the open slideover instantly
      setBookings((prev) =>
        prev.map((b) =>
          b.appointment_id === id ? { ...b, status } : b
        )
      );
      setSelectedBooking((prev) =>
        prev && prev.appointment_id === id ? { ...prev, status } : prev
      );
    } catch (err: any) {
      alert(err.message ?? "Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const columns: Column<Booking>[] = [
    {
      header: "ID",
      accessorKey: "appointment_id",
      cell: (item) => (
        <span className="font-mono text-sm text-slate-500">
          #{item.appointment_id}
        </span>
      ),
    },
    {
      header: "Patient",
      accessorKey: "patient_name",
      cell: (item) => (
        <span className="font-medium text-slate-900">{item.patient_name}</span>
      ),
    },
    {
      header: "Phone",
      accessorKey: "patient_phone",
      cell: (item) => (
        <span className="text-slate-600">{item.patient_phone}</span>
      ),
    },
    {
      header: "Date",
      accessorKey: "slot_date",
      cell: (item) =>
        item.slot_date ? (
          <span className="text-slate-600">
            {new Date(item.slot_date).toLocaleDateString("en-IN", {
              timeZone: "Asia/Kolkata",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        ) : (
          <span className="text-slate-400 italic text-sm">TBD</span>
        ),
    },
    {
      header: "Time",
      accessorKey: "slot_time",
      cell: (item) =>
        item.slot_time ? (
          <span className="text-slate-600">{item.slot_time}</span>
        ) : (
          <span className="text-slate-400 italic text-sm">Pending</span>
        ),
    },
    {
      header: "Reason",
      accessorKey: "reason",
      cell: (item) => (
        <span className="text-slate-600 truncate max-w-40 block">
          {item.reason ?? "—"}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <Toolbar
        title="Bookings"
        description="Live appointment feed from WhatsApp."
        onSearch={setSearchQuery}
        searchPlaceholder="Search by patient name, phone, or ID..."
        filters={
          <Select
            value={statusFilter}
            onValueChange={(v) => v && setStatusFilter(v)}
          >
            <SelectTrigger className="w-full md:w-[150px] bg-white text-base md:text-sm h-12 md:h-10">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        }
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
          data={filtered}
          onRowClick={handleRowClick}
          mobileRenderer={(item) => (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900">{item.patient_name}</h3>
                  <div className="flex items-center text-sm text-slate-500 mt-1">
                    <Phone className="w-3.5 h-3.5 mr-1.5" />
                    {item.patient_phone}
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                  {item.slot_date
                    ? new Date(item.slot_date).toLocaleDateString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "TBD"}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Clock className="w-4 h-4 mr-2 text-slate-400" />
                  {item.slot_time ?? "Pending"}
                </div>
              </div>
              <div className="text-sm text-slate-600 pt-2 border-t border-slate-50 flex items-start">
                <FileText className="w-4 h-4 mr-2 text-slate-400 shrink-0 mt-0.5" />
                <span className="truncate">{item.reason ?? "No reason provided"}</span>
              </div>
            </div>
          )}
        />
      )}

      <SlideOver
        open={isSlideOverOpen}
        onOpenChange={setIsSlideOverOpen}
        title="Appointment Details"
        description={
          selectedBooking
            ? `Appointment #${selectedBooking.appointment_id}`
            : ""
        }
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Patient header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-slate-900 truncate">
                  {selectedBooking.patient_name}
                </h3>
                <div className="flex items-center text-sm text-slate-500 mt-1">
                  <Phone className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span className="truncate">{selectedBooking.patient_phone}</span>
                </div>
                {selectedBooking.patient_email && (
                  <p className="text-sm text-slate-400 mt-0.5 truncate">
                    {selectedBooking.patient_email}
                  </p>
                )}
              </div>
              <div className="shrink-0 mt-1">
                <StatusBadge status={selectedBooking.status} />
              </div>
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="text-xs text-slate-500 mb-1 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" /> Date
                </div>
                <div className="font-medium text-slate-900">
                  {selectedBooking.slot_date
                    ? new Date(selectedBooking.slot_date).toLocaleDateString(
                        "en-IN",
                        {
                          timeZone: "Asia/Kolkata",
                          weekday: "short",
                          day: "numeric",
                          month: "long",
                        }
                      )
                    : "Not selected yet"}
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="text-xs text-slate-500 mb-1 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" /> Time
                </div>
                <div className="font-medium text-slate-900">
                  {selectedBooking.slot_time ?? "Not selected yet"}
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-primary" />
                Reason for Visit
              </h4>
              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm text-sm text-slate-700">
                {selectedBooking.reason ?? "No reason provided."}
              </div>
            </div>

            {/* Booked at */}
            <p className="text-xs text-center text-slate-400">
              Booked on{" "}
              {new Date(selectedBooking.created_at).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}
            </p>

            {/* Action buttons */}
            <div className="pt-4 border-t space-y-3">
              <h4 className="text-sm font-medium text-slate-900">Actions</h4>

              {selectedBooking.status === "Pending" && (
                <Button
                  className="w-full justify-start bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 border h-12 md:h-10 text-base md:text-sm"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() =>
                    handleStatusUpdate(
                      selectedBooking.appointment_id,
                      "Confirmed"
                    )
                  }
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Confirm Appointment
                </Button>
              )}

              {(selectedBooking.status === "Pending" ||
                selectedBooking.status === "Confirmed") && (
                <Button
                  className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 border h-12 md:h-10 text-base md:text-sm"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() =>
                    handleStatusUpdate(
                      selectedBooking.appointment_id,
                      "Completed"
                    )
                  }
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Mark as Completed
                </Button>
              )}

              {selectedBooking.status !== "Cancelled" &&
                selectedBooking.status !== "Completed" && (
                  <Button
                    className="w-full justify-start bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200 border h-12 md:h-10 text-base md:text-sm"
                    variant="outline"
                    disabled={isUpdating}
                    onClick={() =>
                      handleStatusUpdate(
                        selectedBooking.appointment_id,
                        "Cancelled"
                      )
                    }
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Cancel Appointment
                  </Button>
                )}
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}