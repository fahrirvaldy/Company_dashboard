import React from 'react';
import { Plus, Activity, Target, Flag } from 'lucide-react';

const KpiTable = ({ title, data, onUpdate, onAddRow }) => {
    return (
        <div className="card-premium p-0 overflow-hidden shadow-2xl shadow-slate-900/5 border-none rounded-[56px] bg-white animate-in">
            {/* Table Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end p-12 lg:p-16 bg-slate-50 border-b border-slate-100 gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#FF8c42] rounded-[28px] shadow-xl shadow-orange-900/10 flex items-center justify-center transition-all hover:scale-110 duration-500">
                        <Activity size={28} className="text-white" />
                    </div>
                    <div>
                        <h2 className="heading-xl tracking-tighter leading-none mb-3">{title}</h2>
                        <p className="label-caps text-orange-500 flex items-center gap-3">
                            <Target size={14} className="text-slate-900" /> Operational Performance Metrics
                        </p>
                    </div>
                </div>
                <button 
                    onClick={onAddRow} 
                    className="btn-premium btn-primary shadow-2xl active:scale-95 px-10 py-5"
                >
                    <Plus size={20} className="transition-transform group-hover:rotate-90" /> Initialize KPI Metric
                </button>
            </div>

            {/* Table Grid Rendering */}
            <div className="p-10 lg:p-16">
                <div className="grid grid-cols-12 mb-8 px-12 label-caps opacity-40">
                    <div className="col-span-5 flex items-center gap-4"><Flag size={12} /> Target Metric Objective</div>
                    <div className="col-span-3 text-center">Baseline Target</div>
                    <div className="col-span-3 text-center">Actual Realization</div>
                    <div className="col-span-1 text-right">Status</div>
                </div>

                <div className="space-y-5">
                    {data.map((row, idx) => (
                        <div key={idx} className="grid grid-cols-12 items-center p-8 bg-slate-50/50 rounded-[40px] hover:bg-white hover:shadow-float transition-all duration-500 group border border-transparent hover:border-orange-100">
                            <div className="col-span-5 pr-10">
                                <input 
                                    className="w-full bg-transparent font-black text-slate-800 text-lg tracking-tight border-none outline-none focus:text-orange-600 transition-colors uppercase leading-none mb-1"
                                    value={row.kpi} 
                                    onChange={(e) => onUpdate(idx, 'kpi', e.target.value)}
                                />
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Strategic Operational KPI</p>
                            </div>
                            <div className="col-span-3 px-6">
                                <div className="bg-white/80 p-4 rounded-[22px] border border-slate-100 shadow-sm transition-all group-hover:bg-white group-hover:shadow-md">
                                    <input 
                                        className="w-full bg-transparent text-center font-black text-slate-600 text-sm outline-none tabular-nums"
                                        value={row.target} 
                                        onChange={(e) => onUpdate(idx, 'target', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-span-3 px-6">
                                <div className="bg-white/80 p-4 rounded-[22px] border border-slate-100 shadow-sm transition-all group-hover:bg-white group-hover:shadow-md group-hover:ring-4 group-hover:ring-orange-50">
                                    <input 
                                        className="w-full bg-transparent text-center font-black text-orange-500 text-base outline-none tabular-nums"
                                        value={row.realisasi} 
                                        onChange={(e) => onUpdate(idx, 'realisasi', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-span-1 flex justify-end">
                                <div className={`pill scale-125 shadow-xl transition-all active:scale-110 ${row.status === 'on' ? 'shadow-emerald-900/10' : 'shadow-rose-900/10'}`} onClick={() => onUpdate(idx, 'status', row.status === 'on' ? 'off' : 'on')} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Empty State */}
            {data.length === 0 && (
                <div className="py-32 flex flex-col items-center justify-center text-slate-200">
                    <Activity size={100} className="opacity-5 mb-10 animate-pulse" />
                    <p className="label-caps opacity-30">Awaiting High-Fidelity Data injection</p>
                </div>
            )}
            
            <div className="bg-slate-50 p-8 flex justify-center border-t border-slate-100">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] leading-none opacity-60">Synchronized via Angkasa Business Intelligence Engine</p>
            </div>
        </div>
    );
};

export default KpiTable;
