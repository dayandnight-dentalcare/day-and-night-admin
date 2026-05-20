"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { adminFetch } from "@/lib/api";
import { Toolbar } from "@/components/shared/Toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, UploadCloud, MonitorPlay } from "lucide-react";

interface HeroSlide {
  id: number;
  image_url: string;
  title: string;
  description: string;
}

export default function HeroManagerPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSlides = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch("/api/admin/hero");
      setSlides(data.slides || []);
    } catch (err: any) {
      setError("Failed to load hero slides.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSlides(); }, [loadSlides]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError("Please select a background image.");
    if (!title || !description) return setError("Title and description are required.");

    setIsSubmitting(true);
    setError("");

    try {
      // 1. Upload to Vercel Blob
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "hero");

      const token = sessionStorage.getItem("adminSecret") ?? "";
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload image.");
      const uploadData = await uploadRes.json();

      // 2. Save to Database
      await adminFetch("/api/admin/hero", {
        method: "POST",
        body: JSON.stringify({ 
          image_url: uploadData.url, 
          title, 
          description 
        }),
      });

      // 3. Reset form
      setTitle("");
      setDescription("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadSlides();
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, imageUrl: string) => {
    if (!confirm("Delete this slide? This cannot be undone.")) return;
    try {
      await adminFetch("/api/admin/hero", {
        method: "DELETE",
        body: JSON.stringify({ id, image_url: imageUrl }),
      });
      setSlides((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Failed to delete slide.");
    }
  };

  return (
    <div className="space-y-6">
      <Toolbar title="Hero Carousel Manager" description="Manage the main slideshow on the homepage." />

      {error && (
        <div className="p-3 bg-rose-50 text-rose-600 rounded-lg border border-rose-200 text-sm">
          {error}
        </div>
      )}

      {/* Add New Slide Form */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Slide Title</Label>
                  <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Advanced Dental Implants" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short supporting text..." />
                </div>
              </div>

              <div className="space-y-2 flex flex-col">
                <Label>Background Image (High Quality, Horizontal)</Label>
                <div 
                  className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {file ? (
                    <p className="text-sm font-medium text-emerald-600 truncate max-w-xs">{file.name}</p>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm text-slate-500">Click to select image</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting} className="bg-primary text-white">
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Add Slide"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Slides List */}
      <div className="pt-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
          <MonitorPlay className="w-5 h-5 mr-2 text-slate-400" />
          Active Slides ({slides.length})
        </h3>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
        ) : slides.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl text-slate-500">
            No slides configured. Your website will show the default fallback slides.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {slides.map((slide) => (
              <Card key={slide.id} className="overflow-hidden border-slate-200 shadow-sm relative group">
                <div className="aspect-[21/9] relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 p-6 flex flex-col justify-end">
                    <h4 className="text-white font-bold text-xl mb-1">{slide.title}</h4>
                    <p className="text-gray-300 text-sm">{slide.description}</p>
                  </div>
                  
                  {/* Delete Button Hover Overlay */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDelete(slide.id, slide.image_url)}
                      className="bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-full shadow-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}