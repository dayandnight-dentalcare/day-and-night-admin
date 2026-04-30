"use client";

import React, { useState } from "react";
import { Toolbar } from "@/components/shared/Toolbar";
import { DataTable, Column } from "@/components/shared/DataTable";
import { SlideOver } from "@/components/shared/SlideOver";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, Clock, FileText, UserPlus } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  phone: string;
  totalVisits: number;
  lastVisit: string;
  upcomingAppointment: string | null;
  history: { date: string; reason: string; status: string }[];
  notes: string;
}

const mockPatients: Patient[] = [
  {
    id: "PAT-1001",
    name: "Sarah Jenkins",
    phone: "+91 98765 43210",
    totalVisits: 4,
    lastVisit: "2024-04-10",
    upcomingAppointment: "2024-05-15 10:00 AM",
    history: [
      { date: "2024-04-10", reason: "Root Canal - Session 1", status: "Completed" },
      { date: "2023-11-05", reason: "General Checkup", status: "Completed" },
    ],
    notes: "Patient prefers morning appointments. Mild allergy to penicillin.",
  },
  {
    id: "PAT-1002",
    name: "Michael Chen",
    phone: "+91 98765 43211",
    totalVisits: 1,
    lastVisit: "N/A",
    upcomingAppointment: "2024-05-15 11:30 AM",
    history: [],
    notes: "First time patient.",
  },
  {
    id: "PAT-1003",
    name: "Emily Rodriguez",
    phone: "+91 98765 43212",
    totalVisits: 8,
    lastVisit: "2024-01-20",
    upcomingAppointment: null,
    history: [
      { date: "2024-01-20", reason: "Teeth Whitening", status: "Completed" },
      { date: "2023-06-15", reason: "Cavity Filling", status: "Completed" },
    ],
    notes: "Regular patient for cosmetic procedures.",
  },
];

export default function PatientsPage() {
  const [patients] = useState<Patient[]>(mockPatients);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const filteredPatients = patients.filter(
    (pat) =>
      pat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pat.phone.includes(searchQuery)
  );

  const handleRowClick = (pat: Patient) => {
    setSelectedPatient(pat);
    setIsSlideOverOpen(true);
  };

  const columns: Column<Patient>[] = [
    { header: "Name", accessorKey: "name", cell: (item) => <span className="font-medium text-slate-900">{item.name}</span> },
    { header: "Phone", accessorKey: "phone", cell: (item) => <span className="text-slate-600">{item.phone}</span> },
    { header: "Total Visits", accessorKey: "totalVisits", cell: (item) => <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{item.totalVisits}</span> },
    { header: "Last Visit", accessorKey: "lastVisit", cell: (item) => <span className="text-slate-600">{item.lastVisit}</span> },
    { 
      header: "Upcoming Appointment", 
      accessorKey: "upcomingAppointment", 
      cell: (item) => (
        <span className={item.upcomingAppointment ? "text-primary font-medium" : "text-slate-400 italic"}>
          {item.upcomingAppointment || "None scheduled"}
        </span>
      ) 
    },
  ];

  return (
    <div className="space-y-6">
      <Toolbar 
        title="Patients" 
        description="Manage your patient database and view medical histories."
        onSearch={setSearchQuery}
        searchPlaceholder="Search by name or phone..."
        actions={
          <Button className="bg-primary hover:bg-primary/90">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        }
      />

      <DataTable 
        columns={columns} 
        data={filteredPatients} 
        onRowClick={handleRowClick}
      />

      <SlideOver
        open={isSlideOverOpen}
        onOpenChange={setIsSlideOverOpen}
        title="Patient Profile"
        description={selectedPatient ? `ID: ${selectedPatient.id}` : ""}
      >
        {selectedPatient && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 pb-6 border-b">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-bold">
                {selectedPatient.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedPatient.name}</h3>
                <div className="flex items-center text-sm text-slate-500 mt-1">
                  <Phone className="w-4 h-4 mr-1.5" />
                  {selectedPatient.phone}
                </div>
              </div>
            </div>

            {selectedPatient.upcomingAppointment && (
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
                <h4 className="text-sm font-semibold text-primary flex items-center mb-2">
                  <Clock className="w-4 h-4 mr-2" /> Upcoming Visit
                </h4>
                <p className="font-medium text-slate-800">{selectedPatient.upcomingAppointment}</p>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-slate-500" /> Patient Notes
              </h4>
              <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-sm text-slate-700 leading-relaxed">
                {selectedPatient.notes}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-slate-500" /> Appointment History
              </h4>
              
              {selectedPatient.history.length > 0 ? (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {selectedPatient.history.map((hist, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-0" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-slate-100 bg-white shadow-sm ml-4 md:ml-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-500">{hist.date}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{hist.status}</span>
                        </div>
                        <p className="text-sm text-slate-900 font-medium">{hist.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No past appointments recorded.</p>
              )}
            </div>
            
            <div className="pt-6">
              <Button className="w-full bg-slate-900 text-white hover:bg-slate-800">
                Edit Patient Profile
              </Button>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
