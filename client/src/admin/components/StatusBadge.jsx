import React from 'react';

export default function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-900 border-amber-300',
    confirmed: 'bg-blue-100 text-blue-900 border-blue-300',
    assigned: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    completed: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    cancelled: 'bg-rose-100 text-rose-900 border-rose-300'
  };

  const labels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    assigned: 'Driver Assigned',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };

  const currentStyle = styles[status] || 'bg-slate-100 text-slate-800 border-slate-300';
  const label = labels[status] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${currentStyle}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {label}
    </span>
  );
}
