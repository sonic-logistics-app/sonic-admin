"use client";

import { useState } from "react";
import Button from "@/components/shared/Button";

interface DocumentViewerProps {
  title: string;
  documents: {
    front_image?: string;
    back_image?: string;
    document_image?: string;
    verified: boolean;
    uploaded_at?: string;
  } | undefined;
  onVerify: () => void;
  onReject: () => void;
  status: "PENDING" | "VERIFIED" | "REJECTED";
}

export default function DocumentViewer({
  title,
  documents,
  onVerify,
  onReject,
  status,
}: DocumentViewerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!documents) {
    return (
      <div className="border border-[#E1E4EA] rounded-lg p-4">
        <h4 className="text-[13px] font-semibold text-[#111827] mb-2">{title}</h4>
        <p className="text-[11px] text-[#525866]">No documents uploaded</p>
      </div>
    );
  }

  const images = [
    { label: "Front", url: documents.front_image },
    { label: "Back", url: documents.back_image },
    { label: "Document", url: documents.document_image },
  ].filter(img => img.url);

  return (
    <>
      <div className="border border-[#E1E4EA] rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[13px] font-semibold text-[#111827]">{title}</h4>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
              status === "VERIFIED" ? "bg-[#D1FAE5] text-[#059669]" :
              status === "REJECTED" ? "bg-[#FEE2E2] text-[#DC2626]" :
              "bg-[#FEF3C7] text-[#D97706]"
            }`}>
              {status}
            </span>
          </div>
        </div>

        {documents.uploaded_at && (
          <p className="text-[10px] text-[#525866] mb-3">
            Uploaded: {new Date(documents.uploaded_at).toLocaleDateString()}
          </p>
        )}

        {images.length > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image.url}
                    alt={`${title} - ${image.label}`}
                    className="w-full h-24 object-cover rounded border border-[#E1E4EA] cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedImage(image.url!)}
                  />
                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded">
                    {image.label}
                  </span>
                </div>
              ))}
            </div>

            {status === "PENDING" && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="success"
                  size="sm"
                  onClick={onVerify}
                  className="flex-1"
                >
                  <i className="pi pi-check mr-1" />
                  Verify
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={onReject}
                  className="flex-1"
                >
                  <i className="pi pi-times mr-1" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-[#525866]">No images available</p>
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
              alt="Document"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}