import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const Card = ({ title, value, trend, subtext, icon }) => {
    return (
        <div className="card-premium flex flex-col justify-between group cursor-default min-h-[220px] rounded-[32px] p-8 lg:p-10">
            <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-2">
                    <p className="label-caps group-hover:text-orange-500 transition-colors">{title}</p>
                    {subtext && <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{subtext}</p>}
                </div>
                <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center transition-all duration-500 ${
                    icon ? 'bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 group-hover:scale-110 shadow-sm border border-slate-100' : 'bg-slate-50 text-slate-300 border border-slate-100'
                }`}>
                    {icon ? React.cloneElement(icon, { size: 20 }) : <Activity size={20} />}
                </div>
            </div>
            
            <div className="flex items-end justify-between min-w-0 mt-auto">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <h3 className="data-value-lg tracking-tighter group-hover:translate-x-1 transition-transform duration-500 truncate">{value}</h3>
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-2 px-5 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                        trend >= 0 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-float' 
                        : 'bg-rose-50 text-rose-600 border border-rose-100 group-hover:bg-rose-500 group-hover:text-white group-hover:shadow-float'
                    }`}>
                        {trend >= 0 ? <ArrowUpRight size={16} strokeWidth={3} /> : <ArrowDownRight size={16} strokeWidth={3} />}
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Card;
