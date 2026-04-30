"use client";

import React, { useState } from "react";
import { Toolbar } from "@/components/shared/Toolbar";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SlideOver } from "@/components/shared/SlideOver";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar, Phone, Clock, FileText, CheckCircle, XCircle } from "lucide-react";

type AppointmentStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

interface Appointment {
  id: string;
  patientName: string;
  phone: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  notes: string;
  timestamp: string;
}

const mockAppointments: Appointment[] = [
  {
    id: "APT-2039",
    patientName: "Sarah Jenkins",
    phone: "+91 98765 43210",
    date: "2024-05-15",
    time: "10:00 AM",
    reason: "Root Canal Follow-up",
    status: "Confirmed",
    notes: "Patient experiences slight pain when chewing. Needs x-ray before procedure.",
    timestamp: "2024-05-10T09:30:00Z",
  },
  {
    id: "APT-2040",
    patientName: "Michael Chen",
    phone: "+91 98765 43211",
    date: "2024-05-15",
    time: "11:30 AM",
    reason: "General Cleaning",
    status: "Pending",
    notes: "First time visit. Mentioned sensitivity to cold.",
    timestamp: "2024-05-12T14:15:00Z",
  },
  {
    id: "APT-2041",
    patientName: "Emily Rodriguez",
    phone: "+91 98765 43212",
    date: "2024-05-15",
    time: "02:00 PM",
    reason: "Teeth Whitening",
    status: "Completed",
    notes: "Procedure successful. Advised to avoid coffee for 48 hours.",
    timestamp: "2024-05-08T11:00:00Z",
  },
  {
    id: "APT-2042",
    patientName: "David Kim",
    phone: "+91 98765 43213",
    date: "2024-05-16",
    time: "09:00 AM",
    reason: "Tooth Extraction",
    status: "Cancelled",
    notes: "Patient cancelled due to fever. Will reschedule next week.",
    timestamp: "2024-05-13T16:45:00Z",
  },
];

export default function BookingsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          apt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "All" || apt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleRowClick = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setIsSlideOverOpen(true);
  };

  const updateAppointmentStatus = (id: string, newStatus: AppointmentStatus) => {
    setAppointments(prev => 
      prev.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt)
    );
    if (selectedAppointment && selectedAppointment.id === id) {
      setSelectedAppointment({ ...selectedAppointment, status: newStatus });
    }
  };

  const columns: Column<Appointment>[] = [
    { header: "ID", accessorKey: "id", cell: (item) => <span className="font-mono text-sm text-slate-500">{item.id}</span> },
    { header: "Patient", accessorKey: "patientName", cell: (item) => <span className="font-medium text-slate-900">{item.patientName}</span> },
    { header: "Phone", accessorKey: "phone", cell: (item) => <span className="text-slate-600">{item.phone}</span> },
    { header: "Date", accessorKey: "date", cell: (item) => <span className="text-slate-600">{item.date}</span> },
    { header: "Time", accessorKey: "time", cell: (item) => <span className="text-slate-600">{item.time}</span> },
    { header: "Reason", accessorKey: "reason", cell: (item) => <span className="text-slate-600 truncate max-w-[150px] block">{item.reason}</span> },
    { header: "Status", accessorKey: "status", cell: (item) => <StatusBadge status={item.status} /> },
  ];

  return (
    <div className="space-y-6">
      <Toolbar 
        title="Bookings" 
        description="Manage patient appointments and daily schedules."
        onSearch={setSearchQuery}
        searchPlaceholder="Search patients or ID..."
        filters={
          <Select value={statusFilter} onValueChange={(value) => value && setStatusFilter(value)}>
            <SelectTrigger className="w-[150px] bg-white">
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
        actions={
          <Button className="bg-primary hover:bg-primary/90">
            <Calendar className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        }
      />

      <DataTable 
        columns={columns} 
        data={filteredAppointments} 
        onRowClick={handleRowClick}
      />

      <SlideOver
        open={isSlideOverOpen}
        onOpenChange={setIsSlideOverOpen}
        title="Appointment Details"
        description={selectedAppointment ? `ID: ${selectedAppointment.id}` : ""}
      >
        {selectedAppointment && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedAppointment.patientName}</h3>
                <div className="flex items-center text-sm text-slate-500 mt-1">
                  <Phone className="w-3.5 h-3.5 mr-1.5" />
                  {selectedAppointment.phone}
                </div>
              </div>
              <StatusBadge status={selectedAppointment.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="text-xs text-slate-500 mb-1 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" /> Date
                </div>
                <div className="font-medium text-slate-900">{selectedAppointment.date}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="text-xs text-slate-500 mb-1 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" /> Time
                </div>
                <div className="font-medium text-slate-900">{selectedAppointment.time}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-primary" /> Reason for Visit
                </h4>
                <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm text-sm text-slate-700">
                  {selectedAppointment.reason}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-primary" /> Notes
                </h4>
                <div className="p-3 bg-slate-100 rounded-xl text-sm text-slate-700">
                  {selectedAppointment.notes || "No notes available."}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t space-y-3">
              <h4 className="text-sm font-medium text-slate-900 mb-2">Actions</h4>
              
              {selectedAppointment.status === "Pending" && (
                <Button 
                  className="w-full justify-start bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200 border"
                  variant="outline"
                  onClick={() => updateAppointmentStatus(selectedAppointment.id, "Confirmed")}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Appointment
                </Button>
              )}
              
              {(selectedAppointment.status === "Pending" || selectedAppointment.status === "Confirmed") && (
                <Button 
                  className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border-blue-200 border"
                  variant="outline"
                  onClick={() => updateAppointmentStatus(selectedAppointment.id, "Completed")}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Completed
                </Button>
              )}

              {selectedAppointment.status !== "Cancelled" && selectedAppointment.status !== "Completed" && (
                <Button 
                  className="w-full justify-start bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border-rose-200 border"
                  variant="outline"
                  onClick={() => updateAppointmentStatus(selectedAppointment.id, "Cancelled")}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Appointment
                </Button>
              )}
              
              <div className="text-xs text-center text-slate-400 mt-4 pt-4">
                Booked on {new Date(selectedAppointment.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
