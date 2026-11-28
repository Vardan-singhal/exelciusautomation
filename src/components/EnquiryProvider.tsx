"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import EnquiryForm from "./EnquiryForm";
import "./EnquiryModal.css";

const EnquiryContext = createContext<(() => void) | null>(null);

export function EnquiryButton({ children, className = "" }: { children: ReactNode; className?: string }) {
  const openEnquiry = useContext(EnquiryContext);
  if (!openEnquiry) throw new Error("EnquiryButton must be used within EnquiryProvider");
  return <button type="button" className={`enquiry-trigger ${className}`} aria-haspopup="dialog" aria-controls="enquiry-dialog" onClick={openEnquiry}>{children}</button>;
}

export default function EnquiryProvider({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [isOpen, setOpen] = useState(false);
  const pathname = usePathname();
  const openEnquiry = useCallback(() => setOpen(true), []);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const fromHash = () => {
      if (window.location.hash === "#enquiry" && !document.getElementById("enquiry")) setOpen(true);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);
  useEffect(() => {
    if (!isOpen || !dialog.current) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      if (element.open) element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <EnquiryContext.Provider value={openEnquiry}>
      {children}
      <dialog ref={dialog} id="enquiry-dialog" className="enquiry-dialog" aria-labelledby="enquiry-popup-form-heading" onClose={() => setOpen(false)}
        onClick={event => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setOpen(false);
        }}
      >
        <button className="enquiry-dialog-close" type="button" aria-label="Close enquiry form" onClick={() => setOpen(false)}><X size={22} /></button>
        <EnquiryForm id="enquiry-popup-form" />
      </dialog>
    </EnquiryContext.Provider>
  );
}
