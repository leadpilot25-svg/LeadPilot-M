import React, { useState } from 'react';
import { X, Loader2, Award, UserPlus } from 'lucide-react';
import { Lead, LeadStatus, DoneReason, AppointmentType } from '../types';
import { format } from 'date-fns';
import { PROPERTIES } from '../constants';
import { cn } from '../lib/utils';

interface UpdateCallModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (leadId: string, updates: Partial<Lead>) => Promise<void>;
  onSchedule?: (data: any) => Promise<void>;
  teamMembers: string[];
}

export function UpdateCallModal({ lead, isOpen, onClose, onUpdate, onSchedule, teamMembers }: UpdateCallModalProps) {
  const [loading, setLoading] = useState(false);
  const [createApp, setCreateApp] = useState(false);
  const [formData, setFormData] = useState({
    followUpDate: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
    budget: '',
    location: '',
    propertyType: '',
    appTime: '10:00',
    appType: AppointmentType.FOLLOW_UP as string
  });

  // Reset/sync form when lead changes
  React.useEffect(() => {
    if (lead) {
      setFormData({
        followUpDate: lead.followUpDate ? format(new Date(lead.followUpDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        notes: lead.notes || '',
        budget: lead.budget || '',
        location: lead.location || '',
        propertyType: lead.property || '',
        appTime: '10:00',
        appType: AppointmentType.FOLLOW_UP
      });
      setCreateApp(false);
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const updates: Partial<Lead> = {
      followUpDate: new Date(formData.followUpDate).toISOString(),
      notes: formData.notes,
      budget: formData.budget,
      location: formData.location,
      property: formData.propertyType
    };

    await onUpdate(lead.id, updates);
    
    if (createApp && onSchedule) {
      const appDateTime = new Date(`${formData.followUpDate}T${formData.appTime}`);
      await onSchedule({
        leadId: lead.id,
        leadName: lead.firstName || lead.name,
        date: appDateTime.toISOString(),
        title: `${formData.appType}: ${lead.firstName || lead.name}`,
        type: formData.appType,
        notes: formData.notes,
        assignedTo: lead.assignedTo || 'admin'
      });
    }
    
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full duration-300">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Update After Call</h3>
          <button onClick={onClose} className="p-1 text-gray-400"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Next Follow-up *</label>
            <input 
              type="date" 
              required
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 font-medium text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Call Notes</label>
             <textarea 
               rows={3}
               value={formData.notes}
               onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
               placeholder="What did the client say?"
               className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 font-medium text-sm focus:outline-none focus:border-emerald-500 resize-none"
             />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div>
               <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Budget</label>
               <input 
                 type="text" 
                 value={formData.budget}
                 onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                 placeholder="e.g. 50L"
                 className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 font-medium text-sm focus:outline-none focus:border-emerald-500"
               />
             </div>
             <div>
               <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Location</label>
               <input 
                 type="text" 
                 value={formData.location}
                 onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                 placeholder="e.g. Kochi"
                 className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 font-medium text-sm focus:outline-none focus:border-emerald-500"
               />
             </div>
          </div>

          <div>
             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Property Interest</label>
             <select 
               value={formData.propertyType}
               onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
               className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 font-medium text-sm focus:outline-none focus:border-emerald-500"
             >
               <option value="">Select Category...</option>
               <option value="Apartment">Apartment</option>
               <option value="Villa">Villa</option>
               <option value="Plot">Plot / Land</option>
               <option value="Commercial">Commercial</option>
             </select>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setCreateApp(!createApp)}
              className={cn(
                "w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all",
                createApp ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-gray-50 border-gray-100 text-gray-400"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all", createApp ? "bg-emerald-500 border-emerald-500" : "border-gray-200 bg-white")}>
                  {createApp && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className="text-xs font-black uppercase tracking-widest">Schedule Appointment</span>
              </div>
            </button>
          </div>

          {createApp && (
            <div className="space-y-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 animate-in zoom-in duration-200">
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Time</label>
                    <input 
                      type="time" 
                      value={formData.appTime}
                      onChange={(e) => setFormData({ ...formData, appTime: e.target.value })}
                      className="w-full p-3 rounded-xl bg-white border border-emerald-100 text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Type</label>
                    <select 
                      value={formData.appType}
                      onChange={(e) => setFormData({ ...formData, appType: e.target.value })}
                      className="w-full p-3 rounded-xl bg-white border border-emerald-100 text-xs font-bold focus:outline-none"
                    >
                      <option value={AppointmentType.FOLLOW_UP}>Follow-up</option>
                      <option value={AppointmentType.SITE_VISIT}>Site Visit</option>
                      <option value={AppointmentType.MEETING}>Meeting</option>
                      <option value={AppointmentType.CALL}>Call Back</option>
                    </select>
                  </div>
               </div>
            </div>
          )}

          <button
            disabled={loading}
            className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-50 active:scale-95 transition-all"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Save Status Update
          </button>
        </form>
      </div>
    </div>
  );
}

interface MarkDoneModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (leadId: string, reason: DoneReason) => Promise<void>;
}

export function MarkDoneModal({ lead, isOpen, onClose, onConfirm }: MarkDoneModalProps) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState<DoneReason | ''>('');

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    setLoading(true);
    await onConfirm(lead.id, reason as DoneReason);
    setLoading(false);
    onClose();
    setReason('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Follow-up Complete</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-900 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Closure Reason Required</p>
          <select 
            required
            value={reason}
            onChange={(e) => setReason(e.target.value as DoneReason)}
            className="w-full p-4 rounded-2xl border-2 border-slate-50 mb-8 bg-slate-50 font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all appearance-none"
          >
            <option value="">Why is this finished?</option>
            <option value={DoneReason.CLOSED_DEAL}>Closed Deal 💰</option>
            <option value={DoneReason.NOT_INTERESTED}>Not Interested 🛑</option>
            <option value={DoneReason.NO_RESPONSE}>No Response ⏳</option>
          </select>
          <button
            disabled={loading || !reason}
            className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Confirm Completion
          </button>
        </form>
      </div>
    </div>
  );
}

interface ReassignModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onReassign: (leadId: string, agentId: string) => Promise<void>;
  teamMembers: string[];
}

export function ReassignModal({ isOpen, lead, onClose, onReassign, teamMembers }: ReassignModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !lead) return null;

  const handleSelect = async (agentId: string) => {
    setLoading(true);
    await onReassign(lead.id, agentId);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom-full duration-500 shadow-2xl">
        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 mb-4 shadow-inner">
              <UserPlus size={32} strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Assign Agent</h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              For {lead.firstName || lead.name}
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <button
              disabled={loading}
              onClick={() => handleSelect('admin')}
              className={cn(
                "w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all active:scale-[0.98] group",
                lead.assignedTo === 'admin' 
                  ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200" 
                  : "bg-white border-slate-50 hover:border-slate-100 hover:bg-slate-50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0",
                lead.assignedTo === 'admin' ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              )}>
                MA
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Master Admin</p>
                <p className={cn(
                  "text-[9px] font-black uppercase tracking-widest leading-none mt-0.5",
                  lead.assignedTo === 'admin' ? "text-white/60" : "text-slate-400"
                )}>Full Access</p>
              </div>
              {lead.assignedTo === 'admin' && <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />}
            </button>

            {(teamMembers || []).map(email => {
              const initial = email.charAt(0).toUpperCase();
              const name = email.split('@')[0];
              const isSelected = lead.assignedTo === email;
              
              return (
                <button
                  key={email}
                  disabled={loading}
                  onClick={() => handleSelect(email)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all active:scale-[0.98] group",
                    isSelected 
                      ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200" 
                      : "bg-white border-slate-50 hover:border-slate-100 hover:bg-slate-50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0",
                    isSelected ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600"
                  )}>
                    {initial}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold capitalize">{name}</p>
                    <p className={cn(
                      "text-[9px] font-black uppercase tracking-widest leading-none mt-0.5",
                      isSelected ? "text-white/60" : "text-slate-400"
                    )}>{email}</p>
                  </div>
                  {isSelected && <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />}
                </button>
              );
            })}
          </div>
          
          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
