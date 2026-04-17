"use client";

import { useState } from "react";
import Button from "@/components/shared/Button";

interface VehicleViewerProps {
  vehicle: {
    make?: string;
    model?: string;
    year?: string;
    color?: string;
    plate_number?: string;
    registration_document?: string;
    insurance_document?: string;
    verified: boolean;
  } | undefined;
  onVerify: () => void;
  onReject: () => void;
  status: "PENDING" | "VERIFIED" | "REJECTED";
}

export default function VehicleViewer({
  vehicle,
  onVerify,
  onReject,
  status,
}: VehicleViewerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!vehicle) {
    return (
      <div className="border border-[#E1E4EA] rounded-lg p-4">
        <h4 className="text-[13px] font-semibold text-[#111827] mb-2">Vehicle Information</h4>
        <p className="text-[11px] text-[#525866]">No vehicle information provided</p>
      </div>
    );
  }

  const documents = [
    { label: "Registration", url: vehicle.registration_document },
    { label: "Insurance", url: vehicle.insurance_document },
  ].filter(doc => doc.url);

  return (
    <>
      <div className="border border-[#E1E4EA] rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[13px] font-semibold text-[#111827]">Vehicle Information</h4>
          <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
            status === "VERIFIED" ? "bg-[#D1FAE5] text-[#059669]" :
            status === "REJECTED" ? "bg-[#FEE2E2] text-[#DC2626]" :
            "bg-[#FEF3C7] text-[#D97706]"
          }`}>
            {status}
          </span>
        </div>

        {/* Vehicle Details */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[10px] font-medium text-[#525866] uppercase tracking-wider mb-1">
              Make & Model
            </label>
            <p className="text-[12px] text-[#111827]">
              {vehicle.make && vehicle.model ? `${vehicle.make} ${vehicle.model}` : "N/A"}
            </p>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#525866] uppercase tracking-wider mb-1">
              Year
            </label>
            <p className="text-[12px] text-[#111827]">
              {vehicle.year || "N/A"}
            </p>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#525866] uppercase tracking-wider mb-1">
              Color
            </label>
            <p className="text-[12px] text-[#111827]">
              {vehicle.color || "N/A"}
            </p>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#525866] uppercase tracking-wider mb-1">
              Plate Number
            </label>
            <p className="text-[12px] text-[#111827] font-mono">
              {vehicle.plate_number || "N/A"}
            </p>
          </div>
        </div>

        {/* Vehicle Documents */}
        {documents.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-[11px] font-semibold text-[#111827]">Documents</h5>
            <div className="grid grid-cols-2 gap-2">
              {documents.map((doc, index) => (
                <div key={index} className="relative">
                  <img
                    src={doc.url}
                    alt={`Vehicle ${doc.label}`}
                    className="w-full h-24 object-cover rounded border border-[#E1E4EA] cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedImage(doc.url!)}
                  />
                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded">
                    {doc.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === "PENDING" && (
          <div className="flex gap-2 pt-3 mt-3 border-t border-[#E1E4EA]">
            <Button
              variant="success"
              size="sm"
              onClick={onVerify}
              className="flex-1"
            >
              <i className="pi pi-check mr-1" />
              Verify Vehicle
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onReject}
              className="flex-1"
            >
              <i className="pi pi-times mr-1" />
              Reject Vehicle
            </Button>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors z-10"
            >
              <i className="pi pi-times text-lg" />
            </button>
            <img
              src={selectedImage}
              alt="Vehicle Document"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}