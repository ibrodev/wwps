"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface ModalProps {
  isModalOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  size?: "md" | "xl" | "2xl" | "4xl"
}

export default function Modal({
  isModalOpen,
  onClose,
  title,
  children,
  size = "md"
}: ModalProps) {


    

    

   


  useEffect(() => {

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose && onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    // Prevent background scrolling
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isModalOpen, onClose]);

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-700/60 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative z-10 w-full ${size === "md" && 'max-w-md'} ${size === "xl" && 'max-w-xl'} ${size === "2xl" && 'max-w-2xl'} ${size === "4xl" && 'max-w-4xl'} rounded bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-b-eiar-dark/15 px-3 py-3">
          <div className="flex flex-col">
            {title && (
                <h2
                id="modal-title"
                className="font-semibold text-gray-900 capitalize"
                >
                {title}
                </h2>
            )}
            </div>

          {onClose && 
          
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 "
            aria-label="Close modal"
          >
            <X />
          </button>

          }
        </div>

        <div className="p-3">
            {children}
        </div>
      </div>
    </div>
  );
}