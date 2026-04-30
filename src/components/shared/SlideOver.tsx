import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface SlideOverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SlideOver({
  open,
  onOpenChange,
  title,
  description,
  children,
}: SlideOverProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto bg-slate-50">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold text-slate-900">{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex flex-col space-y-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
