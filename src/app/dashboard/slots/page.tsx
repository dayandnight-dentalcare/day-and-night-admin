"use client";

import React, { useState } from "react";
import { Toolbar } from "@/components/shared/Toolbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Settings, PowerOff } from "lucide-react";
import { cn } from "@/lib/utils";

type SlotState = "Available" | "Booked" | "Blocked";

interface Slot {
  id: string;
  time: string;
  state: SlotState;
}

export default function SlotManagerPage() {
  const [date, setDate] = useState("2024-05-15");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [interval, setInterval] = useState("30");
  
  const [slots, setSlots] = useState<Slot[]>([
    { id: "1", time: "09:00 AM", state: "Available" },
    { id: "2", time: "09:30 AM", state: "Available" },
    { id: "3", time: "10:00 AM", state: "Booked" },
    { id: "4", time: "10:30 AM", state: "Available" },
    { id: "5", time: "11:00 AM", state: "Available" },
    { id: "6", time: "11:30 AM", state: "Booked" },
    { id: "7", time: "12:00 PM", state: "Available" },
    { id: "8", time: "12:30 PM", state: "Blocked" },
    { id: "9", time: "01:00 PM", state: "Blocked" },
    { id: "10", time: "01:30 PM", state: "Available" },
    { id: "11", time: "02:00 PM", state: "Available" },
    { id: "12", time: "02:30 PM", state: "Booked" },
  ]);

  const handleGenerateSlots = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock slot generation
    alert("Slots generated for " + date);
  };

  const handleMarkDayOff = () => {
    setSlots(slots.map(slot => ({ ...slot, state: "Blocked" })));
  };

  const toggleSlotState = (index: number) => {
    const newSlots = [...slots];
    const currentState = newSlots[index].state;
    
    if (currentState === "Available") newSlots[index].state = "Blocked";
    else if (currentState === "Blocked") newSlots[index].state = "Available";
    // Booked slots shouldn't be toggleable directly from here without unbooking
    
    setSlots(newSlots);
  };

  return (
    <div className="space-y-6">
      <Toolbar 
        title="Slot Manager" 
        description="Configure clinic availability and working hours."
        actions={
          <Button variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100 hover:text-rose-700" onClick={handleMarkDayOff}>
            <PowerOff className="mr-2 h-4 w-4" />
            Mark Day Off
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Settings className="w-5 h-5 mr-2 text-primary" />
                Generator Settings
              </CardTitle>
              <CardDescription>Generate new time slots for a specific date.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateSlots} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                      id="date" 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start">Start Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input 
                        id="start" 
                        type="time" 
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">End Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input 
                        id="end" 
                        type="time" 
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interval">Interval (Minutes)</Label>
                  <Select value={interval} onValueChange={(value) => value && setInterval(value)}>
                    <SelectTrigger id="interval">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 mins</SelectItem>
                      <SelectItem value="30">30 mins</SelectItem>
                      <SelectItem value="45">45 mins</SelectItem>
                      <SelectItem value="60">60 mins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full bg-slate-900 text-white mt-4">
                  Generate Slots
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-slate-200 shadow-sm h-full">
            <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Generated Slots</CardTitle>
                <CardDescription>Visual preview for {date}</CardDescription>
              </div>
              <div className="flex space-x-4 text-sm">
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-300 mr-1.5" /> Available</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300 mr-1.5" /> Blocked</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-amber-100 border border-amber-300 mr-1.5" /> Booked</div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {slots.map((slot, index) => (
                  <div
                    key={slot.id}
                    onClick={() => toggleSlotState(index)}
                    className={cn(
                      "flex items-center justify-center p-4 rounded-xl border text-sm font-medium transition-all cursor-pointer",
                      slot.state === "Available" ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100" : "",
                      slot.state === "Blocked" ? "bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200" : "",
                      slot.state === "Booked" ? "bg-amber-50 border-amber-200 text-amber-800 cursor-not-allowed opacity-80" : ""
                    )}
                    title={slot.state === "Booked" ? "Cannot modify booked slot here" : "Click to toggle availability"}
                  >
                    {slot.time}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
