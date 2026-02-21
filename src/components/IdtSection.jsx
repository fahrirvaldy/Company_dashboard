import React from 'react';
import { Magnet, Trash2, CheckCircle2, MessageCircle, ClipboardCheck } from 'lucide-react';

const IdtSection = ({ issues, discussionNotes, actionItems, onPullIssues, onAddIssue, onRemoveIssue, onDiscussionChange, onActionChange }) => {
    return (
        <div className="flex flex-col h-full gap-6">
            {/* Header with Glassmorphism effect */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter uppercase leading-none">Sesi IDT</h1>
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] mt-3 ml-1">Identifikasi • Diskusi • Tuntas</p>
                </div>
                <button 
                    onClick={onPullIssues} 
                    className="flex items-center gap-3 px-8 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95 shadow-lg shadow-rose-900/10 border border-rose-100 group"
                >
                    <Magnet size={16} className="group-hover:rotate-12 transition-transform" /> Tarik Isu Off-Track
                </button>
            </div>

            {/* Grid with improved spacing and hierarchy */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
                {/* 1. Identification */}
                <div className="card flex flex-col p-0 overflow-hidden shadow-2xl shadow-slate-900/5 border-none rounded-[2rem] bg-white">
                    <div className="bg-slate-50 p-6 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-lg shadow-orange-200" />
                            1. Identifikasi
                        </div>
                        <span className="bg-white px-2 py-1 rounded-md text-slate-300 ring-1 ring-slate-200">{issues.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                        {issues.map((issue, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 bg-white border border-slate-50 rounded-2xl shadow-sm group hover:border-orange-200 hover:shadow-orange-900/5 transition-all relative">
                                <div className="mt-1 w-5 h-5 rounded-lg border-2 border-slate-100 flex items-center justify-center bg-slate-50 group-hover:border-orange-200 group-hover:bg-orange-50 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-orange-400" />
                                </div>
                                <span className="text-xs font-bold text-slate-600 flex-1 leading-relaxed pr-6">{issue}</span>
                                <button 
                                    onClick={() => onRemoveIssue(index)} 
                                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1 text-slate-200 hover:text-rose-500 transition-all hover:scale-110"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        {issues.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-200 gap-4 py-20">
                                <MessageCircle size={48} className="opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Daftar Isu Bersih</p>
                            </div>
                        )}
                    </div>
                    <div className="p-6 bg-slate-50/50 mt-auto">
                        <button className="w-full py-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-orange-500 hover:border-orange-200 transition-all shadow-sm active:scale-[0.98]" onClick={onAddIssue}>
                            + Tambah Isu Manual
                        </button>
                    </div>
                </div>

                {/* 2. Discussion */}
                <div className="card flex flex-col p-0 overflow-hidden shadow-2xl shadow-slate-900/5 border-none rounded-[2rem] bg-white">
                    <div className="bg-slate-50 p-6 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-lg shadow-blue-200" />
                        2. Diskusi
                    </div>
                    <textarea
                        value={discussionNotes}
                        onChange={onDiscussionChange}
                        className="flex-1 p-8 text-sm font-bold text-slate-600 leading-relaxed outline-none resize-none bg-transparent placeholder:text-slate-200 placeholder:italic focus:ring-0"
                        placeholder="Catat poin penting dari diskusi tim di sini..."
                    />
                </div>

                {/* 3. Tuntas */}
                <div className="card flex flex-col p-0 overflow-hidden shadow-2xl shadow-slate-900/5 border-none rounded-[2rem] bg-white">
                    <div className="bg-slate-50 p-6 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-200" />
                        3. Tuntas
                    </div>
                    <div className="flex-1 flex flex-col relative">
                        <textarea
                            value={actionItems}
                            onChange={onActionChange}
                            className="flex-1 p-8 text-sm font-black text-slate-800 leading-relaxed outline-none resize-none bg-transparent placeholder:text-slate-200 focus:ring-0"
                            placeholder="Definisikan tindakan konkrit...&#10;- Siapa melakukan apa&#10;- Tenggat waktu"
                        />
                        <div className="absolute bottom-6 right-6 p-3 bg-emerald-50 text-emerald-600 rounded-2xl opacity-20 group-hover:opacity-100 transition-opacity">
                            <ClipboardCheck size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdtSection;
