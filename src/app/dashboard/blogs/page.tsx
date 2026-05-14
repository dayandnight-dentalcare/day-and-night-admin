"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { adminFetch } from "@/lib/api";
import { Toolbar } from "@/components/shared/Toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlideOver } from "@/components/shared/SlideOver";
import { Loader2, Trash2, Plus, UploadCloud, FileText } from "lucide-react";

export default function BlogsManagerPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch("/api/admin/blogs");
      setBlogs(data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBlogs(); }, [loadBlogs]);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a cover image.");
    setIsSubmitting(true);

    try {
      // 1. Upload Image to Vercel Blob
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "blogs");

      const token = sessionStorage.getItem("adminSecret") ?? "";
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Image upload failed.");
      const uploadData = await uploadRes.json();

      // 2. Save Blog Post to Database
      await adminFetch("/api/admin/blogs", {
        method: "POST",
        body: JSON.stringify({
          title, slug, category, excerpt, content_html: contentHtml, image_url: uploadData.url
        }),
      });

      // 3. Reset and Close
      setTitle(""); setSlug(""); setCategory(""); setExcerpt(""); setContentHtml(""); setFile(null);
      setIsSlideOverOpen(false);
      await loadBlogs();
    } catch (err: any) {
      alert(err.message || "Failed to create blog post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, imageUrl: string) => {
    if (!confirm("Delete this blog post forever?")) return;
    try {
      await adminFetch("/api/admin/blogs", {
        method: "DELETE",
        body: JSON.stringify({ id, image_url: imageUrl }),
      });
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert("Failed to delete blog.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Toolbar title="Blog Manager" description="Publish and manage your clinic's articles." />
        <Button onClick={() => setIsSlideOverOpen(true)} className="bg-primary text-white">
          <Plus className="w-4 h-4 mr-2" /> New Post
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((post) => (
            <Card key={post.id} className="overflow-hidden flex flex-col">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover" />
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="text-xs text-primary font-bold mb-2 uppercase tracking-wider">{post.category}</div>
                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">{post.excerpt}</p>
                <div className="flex justify-between items-center border-t pt-4 mt-auto">
                  <span className="text-xs text-slate-400">/{post.slug}</span>
                  <button onClick={() => handleDelete(post.id, post.image_url)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-full transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SlideOver open={isSlideOverOpen} onOpenChange={setIsSlideOverOpen} title="Write a New Blog Post" description="Add content, images, and SEO details.">
        <form onSubmit={handleSubmit} className="space-y-5 pb-20">
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {file ? <p className="text-sm font-medium text-emerald-600">{file.name}</p> : <><UploadCloud className="mx-auto h-6 w-6 text-slate-400 mb-2" /><span className="text-sm text-slate-500">Click to upload cover image</span></>}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
          </div>

          <div className="space-y-2"><Label>Title</Label><Input required value={title} onChange={handleTitleChange} placeholder="e.g. Painless Root Canals" /></div>
          <div className="space-y-2"><Label>URL Slug</Label><Input required value={slug} onChange={(e) => setSlug(e.target.value)} className="bg-slate-50 font-mono text-sm" /></div>
          <div className="space-y-2"><Label>Category</Label><Input required value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Treatments, Guide" /></div>
          <div className="space-y-2"><Label>Short Excerpt</Label><textarea required value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className="w-full rounded-md border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="A brief summary for the blog card..." /></div>
          
          <div className="space-y-2">
            <Label>Content (HTML format)</Label>
            <p className="text-xs text-slate-500 mb-2">Paste your HTML formatted content here (like &lt;h2&gt; and &lt;p&gt; tags).</p>
            <textarea required value={contentHtml} onChange={(e) => setContentHtml(e.target.value)} rows={15} className="w-full rounded-md border border-slate-200 p-3 text-sm font-mono bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-primary text-white">
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</> : "Publish Blog Post"}
          </Button>
        </form>
      </SlideOver>
    </div>
  );
}