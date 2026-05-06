'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/ToastProvider';

interface Sequence {
  id: number;
  name: string;
  description: string;
  is_active: number;
  created_at: string;
}

export default function AutomationsPage() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetch('/api/sequences')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSequences(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load sequences');
        setLoading(false);
      });
  }, [toast]);

  const handleToggle = async (e: React.MouseEvent, seq: Sequence) => {
    e.preventDefault();
    const newStatus = seq.is_active === 1 ? 0 : 1;
    setSequences(prev => prev.map(s => s.id === seq.id ? { ...s, is_active: newStatus } : s));
    
    try {
      await fetch(`/api/sequences/${seq.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus })
      });
    } catch {
      setSequences(prev => prev.map(s => s.id === seq.id ? { ...s, is_active: seq.is_active } : s));
      toast.error('Failed to toggle sequence');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this automation?')) return;
    
    try {
      await fetch(`/api/sequences/${id}`, { method: 'DELETE' });
      setSequences(prev => prev.filter(s => s.id !== id));
      toast.success('Automation deleted');
    } catch {
      toast.error('Failed to delete automation');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="headline-font text-3xl font-bold text-on-surface">Automations</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Visual rule-based workflows</p>
        </div>
        <Link 
          href="/automations/new"
          className="flex items-center gap-2 px-4 py-2.5 ethereal-gradient text-[#0b0e14] font-bold text-sm rounded-lg shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Create Workflow
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-panel rounded-2xl h-40 animate-pulse border border-outline-variant/15" />
          ))}
        </div>
      ) : sequences.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-outline-variant/15">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">account_tree</span>
          <h3 className="text-xl font-bold text-on-surface mb-2">No automations found</h3>
          <p className="text-on-surface-variant text-sm max-w-md mx-auto mb-6">
            Create your first workflow to automate your smart home devices based on sensor readings and schedules.
          </p>
          <Link 
            href="/automations/new"
            className="inline-block px-6 py-3 border border-outline-variant/20 rounded-lg text-on-surface hover:bg-surface-container font-medium transition-colors"
          >
            Create Workflow
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative">
          {sequences.map(seq => (
            <Link
              key={seq.id}
              href={`/automations/${seq.id}`}
              className="group glass-panel rounded-2xl p-6 border border-outline-variant/15 flex flex-col gap-4 hover:border-primary/30 transition-all cursor-pointer relative"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">account_tree</span>
                </div>
                <button
                  onClick={(e) => handleToggle(e, seq)}
                  className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                    seq.is_active === 1 ? 'bg-primary' : 'bg-surface-container-highest'
                  }`}
                >
                  <span className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${
                    seq.is_active === 1 ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>
              
              <div>
                <h3 className="font-bold text-on-surface headline-font text-lg">{seq.name}</h3>
                <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 min-h-[32px]">
                  {seq.description || 'No description provided'}
                </p>
              </div>

              <div className="mt-auto border-t border-outline-variant/10 pt-4 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  {new Date(seq.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={(e) => handleDelete(e, seq.id)}
                  className="material-symbols-outlined text-on-surface-variant hover:text-error text-lg transition-colors"
                >
                  delete
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
