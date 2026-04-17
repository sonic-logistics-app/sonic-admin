"use client";

interface HeaderCardProps {
  title: string;
  description: string;
  greeting?: boolean;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning!";
  if (hour < 18) return "Good afternoon!";
  return "Good evening!";
}

export default function HeaderCard({ title, description, greeting = false }: HeaderCardProps) {
  return (
    <div className="w-full rounded-2xl border border-[#E1E4EA] bg-white p-4 md:p-6 flex-shrink-0">
      {greeting && (
        <p className="text-[#525866] text-[11px] mb-2">{getGreeting()}</p>
      )}
      <h1 className="text-[#111827] text-[18px] font-bold mb-2">{title}</h1>
      <p className="text-[#525866] text-[13px]">{description}</p>
    </div>
  );
}
