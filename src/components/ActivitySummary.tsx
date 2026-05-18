import React from 'react';
import { MapPin, Video, Calendar, Phone } from 'lucide-react';
import { cn } from '../lib/utils';
import { AppointmentType } from '../types';

interface SummaryItemProps {
  type: AppointmentType;
  count: number;
  label: string;
  color: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const SummaryItem = ({ type, count, label, color, icon, isActive, onClick }: SummaryItemProps) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex-1 flex items-center gap-2 p-2.5 rounded-2xl border transition-all active:scale-95",
      isActive 
        ? `${color.split(' ')[0]} border-current ring-1 ring-current` 
        : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
    )}
  >
    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", color)}>
      {icon}
    </div>
    <div className="text-left leading-none">
      <p className="text-sm font-black text-slate-900">{count}</p>
      <p className="text-[8px] font-black uppercase tracking-tighter opacity-60 mt-0.5">{label}</p>
    </div>
  </button>
);

interface ActivitySummaryProps {
  counts: Record<AppointmentType, number>;
  activeFilter: AppointmentType | null;
  onFilterChange: (type: AppointmentType | null) => void;
}

export function ActivitySummary({ counts, activeFilter, onFilterChange }: ActivitySummaryProps) {
  const items = [
    { 
      type: AppointmentType.SITE_VISIT, 
      label: 'Site Visits', 
      color: 'bg-blue-500 text-white', 
      icon: <MapPin size={14} />,
      count: counts[AppointmentType.SITE_VISIT] || 0
    },
    { 
      type: AppointmentType.MEETING, 
      label: 'Meetings', 
      color: 'bg-emerald-500 text-white', 
      icon: <Video size={14} />,
      count: counts[AppointmentType.MEETING] || 0
    },
    { 
      type: AppointmentType.FOLLOW_UP, 
      label: 'Follow-ups', 
      color: 'bg-slate-400 text-white', 
      icon: <Calendar size={14} />,
      count: counts[AppointmentType.FOLLOW_UP] || 0
    },
    { 
      type: AppointmentType.CALL, 
      label: 'Call Backs', 
      color: 'bg-orange-500 text-white', 
      icon: <Phone size={14} />,
      count: counts[AppointmentType.CALL] || 0
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-2 w-full animate-in fade-in slide-in-from-top-2 duration-500">
      {items.map((item) => {
        const isActive = activeFilter === item.type;
        return (
          <button 
            key={item.type}
            onClick={() => onFilterChange(isActive ? null : item.type)}
            className={cn(
              "flex-1 flex items-center gap-2 p-2.5 rounded-2xl border transition-all active:scale-95",
              isActive 
                ? `${item.color.split(' ')[0]} border-current ring-1 ring-current` 
                : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
            )}
          >
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", item.color)}>
              {item.icon}
            </div>
            <div className="text-left leading-none">
              <p className="text-sm font-black text-slate-900">{item.count}</p>
              <p className="text-[8px] font-black uppercase tracking-tighter opacity-60 mt-0.5">{item.label}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
