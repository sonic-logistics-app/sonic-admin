"use client";

import { useState } from "react";

interface BusinessHoursInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export default function BusinessHoursInput({
  value,
  onChange,
  placeholder = "Select hours",
  label,
}: BusinessHoursInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [isClosed, setIsClosed] = useState(false);

  // Parse existing value to populate picker
  const parseValue = (val: string) => {
    if (!val || val.toLowerCase() === "closed") {
      setIsClosed(true);
      return;
    }

    setIsClosed(false);
    // Try to parse "HH:MM AM/PM - HH:MM AM/PM" format
    const match = val.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let startHour = parseInt(match[1]);
      const startMin = match[2];
      const startPeriod = match[3]?.toUpperCase() || "AM";
      let endHour = parseInt(match[4]);
      const endMin = match[5];
      const endPeriod = match[6]?.toUpperCase() || "PM";

      // Convert to 24-hour format
      if (startPeriod === "PM" && startHour !== 12) startHour += 12;
      if (startPeriod === "AM" && startHour === 12) startHour = 0;
      if (endPeriod === "PM" && endHour !== 12) endHour += 12;
      if (endPeriod === "AM" && endHour === 12) endHour = 0;

      setStartTime(`${String(startHour).padStart(2, "0")}:${startMin}`);
      setEndTime(`${String(endHour).padStart(2, "0")}:${endMin}`);
    }
  };

  const handleOpenPicker = () => {
    parseValue(value);
    setShowPicker(true);
  };

  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(":");
    let hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minutes} ${period}`;
  };

  const handleApply = () => {
    if (isClosed) {
      onChange("Closed");
    } else {
      const formatted = `${formatTime12Hour(startTime)} - ${formatTime12Hour(endTime)}`;
      onChange(formatted);
    }
    setShowPicker(false);
  };

  const handleReset = () => {
    setIsClosed(false);
    setStartTime("09:00");
    setEndTime("18:00");
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
          {label}
        </label>
      )}

      <div
        onClick={handleOpenPicker}
        className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] bg-white cursor-pointer hover:border-[#2563EB] transition-colors flex items-center justify-between"
      >
        <span>{value || placeholder}</span>
        <i className="pi pi-clock text-[#525866]" />
      </div>

      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowPicker(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl border border-[#E1E4EA] w-full max-w-sm shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E1E4EA]">
              <h3 className="text-[16px] font-semibold text-[#111827]">
                Set Business Hours
              </h3>
              <button
                onClick={() => setShowPicker(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <i className="pi pi-times text-[#525866]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Closed Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="closed"
                  checked={isClosed}
                  onChange={(e) => setIsClosed(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E1E4EA] text-[#2563EB] cursor-pointer"
                />
                <label
                  htmlFor="closed"
                  className="text-[13px] font-medium text-[#111827] cursor-pointer"
                >
                  Closed on this day
                </label>
              </div>

              {!isClosed && (
                <>
                  {/* Start Time */}
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  {/* Preview */}
                  <div className="bg-[#F3F4F6] rounded-lg p-3">
                    <p className="text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">
                      Preview
                    </p>
                    <p className="text-[13px] font-semibold text-[#111827]">
                      {formatTime12Hour(startTime)} - {formatTime12Hour(endTime)}
                    </p>
                  </div>
                </>
              )}

              {isClosed && (
                <div className="bg-[#FEE2E2] rounded-lg p-3">
                  <p className="text-[13px] font-semibold text-[#DC2626]">
                    Closed
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 p-6 border-t border-[#E1E4EA]">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-semibold text-[#525866] hover:bg-[#F9FAFB] transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setShowPicker(false)}
                className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-semibold text-[#525866] hover:bg-[#F9FAFB] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
