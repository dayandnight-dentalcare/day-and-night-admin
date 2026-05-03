"use client";

import React, { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/api";
import { Toolbar } from "@/components/shared/Toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Plus, Ban, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Slot {
  id: number;
  time: string;
  is_booked: boolean;
  booked_by_name: string | null;
  booked_by_phone: string | null;
}

export default function SlotManagerPage() {
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
  );
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Add Slot State
  const [newTime, setNewTime] = useState("09:00");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // Block Day State
  const [isDateBlocked, setIsDateBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockId, setBlockId] = useState<number | null>(null);
  const [isTogglingBlock, setIsTogglingBlock] = useState(false);

  const fetchDayData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch Slots and Block Status simultaneously
      const [slotsData, blockData] = await Promise.all([
        adminFetch(`/api/admin/slots?date=${date}`),
        adminFetch(`/api/admin/block?date=${date}`)
      ]);
      
      setSlots(slotsData.slots || []);

      if (blockData.date_blocked) {
        setIsDateBlocked(true);
        setBlockId(blockData.date_blocked.id);
        setBlockReason(blockData.date_blocked.reason || "");
      } else {
        setIsDateBlocked(false);
        setBlockId(null);
        setBlockReason("");
      }
    } catch (err: any) {
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchDayData();
  }, [fetchDayData]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setAddError("");
    try {
      await adminFetch("/api/admin/slots", {
        method: "POST",
        body: JSON.stringify({ date, time: newTime }),
      });
      await fetchDayData();
    } catch (err: any) {
      setAddError(err.message ?? "Failed to add slot.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this slot?")) return;
    try {
      await adminFetch("/api/admin/slots", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      setSlots((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message ?? "Failed to delete slot.");
    }
  };

  const toggleBlockDay = async () => {
    setIsTogglingBlock(true);
    try {
      if (isDateBlocked && blockId) {
        // UNBLOCK THE DAY
        await adminFetch("/api/admin/block", {
          method: "DELETE",
          body: JSON.stringify({ type: "date", id: blockId }),
        });
      } else {
        // BLOCK THE DAY
        await adminFetch("/api/admin/block", {
          method: "POST",
          body: JSON.stringify({ type: "date", date, reason: blockReason }),
        });
      }
      await fetchDayData();
    } catch (err: any) {
      alert(err.message ?? "Failed to toggle block status.");
    } finally {
      setIsTogglingBlock(false);
    }
  };

  const availableCount = slots.filter((s) => !s.is_booked).length;
  const bookedCount = slots.filter((s) => s.is_booked).length;

  return (
    <div className="space-y-6">
      <Toolbar
        title="Slot Manager"
        description="Manage daily appointment availability and clinic closures."
      />

      {/* ── Block Day Banner ── */}
      <Card className={cn(
        "border transition-colors",
        isDateBlocked ? "bg-rose-50 border-rose-200" : "bg-white border-slate-200"
      )}>
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className={cn("text-lg font-bold flex items-center gap-2", isDateBlocked ? "text-rose-800" : "text-slate-900")}>
              {isDateBlocked ? <Ban size={20} /> : <CheckCircle size={20} className="text-emerald-500" />}
              {isDateBlocked ? "Clinic is Closed on this Date" : "Clinic is Open for Bookings"}
            </h3>
            <p className={cn("text-sm mt-1", isDateBlocked ? "text-rose-600" : "text-slate-500")}>
              {isDateBlocked 
                ? `Reason: ${blockReason || "None provided"}` 
                : "Patients can view and book available slots for this day."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {!isDateBlocked && (
              <Input 
                placeholder="Reason (e.g. Holiday)" 
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full sm:w-48 bg-white"
              />
            )}
            <Button
              onClick={toggleBlockDay}
              disabled={isTogglingBlock}
              className={cn(
                "font-medium whitespace-nowrap",
                isDateBlocked 
                  ? "bg-white text-rose-700 hover:bg-rose-100 border border-rose-200" 
                  : "bg-rose-600 text-white hover:bg-rose-700"
              )}
            >
              {isTogglingBlock ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isDateBlocked ? "Unblock Day" : "Block Entire Day"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: Add slot form ── */}
        <Card className={cn("border-slate-200 shadow-sm h-fit transition-opacity", isDateBlocked && "opacity-50 pointer-events-none grayscale")}>
          <CardHeader>
            <CardTitle className="text-base">Add a Slot</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSlot} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  min={new Date().toLocaleDateString("en-CA", {
                    timeZone: "Asia/Kolkata",
                  })}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>

              {addError && (
                <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  {addError}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-slate-900 text-white hover:bg-slate-800"
                disabled={isAdding || isDateBlocked}
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {isAdding ? "Adding..." : "Add Slot"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Right: Slots grid ── */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Slots for{" "}
                {new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </CardTitle>
              {slots.length > 0 && (
                <div className="flex gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    {availableCount} open
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    {bookedCount} booked
                  </span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : slots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <p className="font-medium">No slots for this date.</p>
                <p className="text-sm mt-1">
                  Use the form to add time slots.
                </p>
              </div>
            ) : (
              <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 transition-opacity", isDateBlocked && "opacity-40 grayscale pointer-events-none")}>
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={cn(
                      "p-3 rounded-xl border flex flex-col items-center relative group",
                      slot.is_booked
                        ? "bg-amber-50 border-amber-200"
                        : "bg-emerald-50 border-emerald-200"
                    )}
                  >
                    <span
                      className={cn(
                        "font-bold text-sm",
                        slot.is_booked
                          ? "text-amber-800"
                          : "text-emerald-800"
                      )}
                    >
                      {slot.time}
                    </span>

                    {slot.is_booked ? (
                      <>
                        <span className="text-[10px] uppercase font-semibold text-amber-600 mt-0.5">
                          Booked
                        </span>
                        {slot.booked_by_name && (
                          <span className="text-[10px] text-amber-700 mt-1 text-center leading-tight">
                            {slot.booked_by_name}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] uppercase font-semibold text-emerald-600 mt-0.5">
                          Open
                        </span>
                        {/* Delete button — only on available slots, appears on hover */}
                        <button
                          onClick={() => handleDelete(slot.id)}
                          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete slot"
                        >
                          <Trash2 className="w-3 h-3 text-rose-500" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}