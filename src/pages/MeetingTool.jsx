import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Home, Users, ShoppingCart, Banknote, Video, Headset, 
    PenTool, Factory, Warehouse, MountainSnow, Newspaper, 
    ListCheck, MessageSquare, Star, FileText, TrendingUp, Save, Trash2, CheckCircle2,
    ChevronLeft, ChevronRight, Share2, Printer, Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import MeetingTimer from '../components/MeetingTimer';
import KpiTable from '../components/KpiTable';
import IdtSection from '../components/IdtSection';
import './MeetingTool.css';
import { fetchMeetingData, saveMeetingData, fetchGrowthData } from '../api/dashboardApi';

const MeetingTool = () => {
    const queryClient = useQueryClient();
    const [activeSection, setActiveSection] = useState(0);
    const [localData, setLocalData] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const pdfRef = useRef(null);
    
    const { data: meetingData, isLoading } = useQuery({ queryKey: ['meetingData'], queryFn: fetchMeetingData });
    const { data: growthData } = useQuery({ queryKey: ['growthData'], queryFn: fetchGrowthData });

    // Performance Optimization: Prevent state resets while user is typing
    useEffect(() => {
        if (meetingData && !isInitialized) {
            setLocalData(JSON.parse(JSON.stringify(meetingData)));
            setIsInitialized(true);
        }
    }, [meetingData, isInitialized]);

    const mutation = useMutation({
        mutationFn: saveMeetingData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meetingData'] });
            // Alert system
            const notification = document.createElement('div');
            notification.className = "fixed top-10 right-10 bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl z-[100] font-black text-xs uppercase animate-in";
            notification.innerText = "✓ Ecosystem Synchronized Successfully";
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        }
    });

    const handleSave = () => { if (localData) mutation.mutate(localData); };

    const targetProfit = useMemo(() => {
        if (!growthData?.target) return 0;
        const t = growthData.target;
        return Math.floor(t.leads * (t.conv / 100)) * t.trans * t.sale * (t.margin / 100);
    }, [growthData]);

    const navItems = [
        { icon: <Home size={16} />, label: 'Cover' },
        { icon: <Users size={16} />, label: 'Segmen Awal' },
        { icon: <ShoppingCart size={16} />, label: 'Div. E-Comm' },
        { icon: <Banknote size={16} />, label: 'Div. HCGA' },
        { icon: <Video size={16} />, label: 'Div. Live' },
        { icon: <Headset size={16} />, label: 'Div. Sales' },
        { icon: <PenTool size={16} />, label: 'Div. Creative' },
        { icon: <Factory size={16} />, label: 'Div. Prod' },
        { icon: <Warehouse size={16} />, label: 'Div. Whs' },
        { icon: <MountainSnow size={16} />, label: 'Prioritas' },
        { icon: <Newspaper size={16} />, label: 'Headlines' },
        { icon: <ListCheck size={16} />, label: 'To-Do List' },
        { icon: <MessageSquare size={16} />, label: 'Sesi IDT' },
        { icon: <Star size={16} />, label: 'Rating' },
    ];

    const updateNested = (path, value) => {
        const newData = { ...localData };
        let current = newData;
        const parts = path.split('.');
        for (let i = 0; i < parts.length - 1; i++) current = current[parts[i]];
        current[parts[parts.length - 1]] = value;
        setLocalData(newData);
    };

    const handleUpdateKpi = (table, idx, field, val) => {
        const newData = { ...localData };
        newData[table][idx][field] = val;
        setLocalData(newData);
    };

    const handleAddKpiRow = (table) => {
        const newData = { ...localData };
        newData[table].push({ kpi: 'New KPI', target: '...', realisasi: '...', status: 'on' });
        setLocalData(newData);
    };

    const handleRatingChange = (div, val) => {
        const v = parseFloat(val);
        if (v >= 0 && v <= 10) {
            const newData = { ...localData };
            newData.ratings[div] = v;
            setLocalData(newData);
        }
    };

    const averageRating = useMemo(() => {
        if (!localData?.ratings) return 0;
        const vals = Object.values(localData.ratings).filter(v => v > 0);
        return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0;
    }, [localData?.ratings]);

    const exportToPDF = async () => {
        const element = pdfRef.current;
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#FDFBF7' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Angkasa_Report_${localData.date.replace(/\s/g, '_')}.pdf`);
    };

    if (isLoading || !localData) return <div className="p-12 h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-orange-500" size={48} />
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Synchronizing Meeting Workspace...</p>
    </div>;

    const kpiTables = [
        { key: 'ecommTable', label: 'E-Commerce & Retail' },
        { key: 'hcgaTable', label: 'HCGA & Finance' },
        { key: 'liveTable', label: 'Live, KOL, Affiliate' },
        { key: 'salesTable', label: 'Sales Admin' },
        { key: 'creativeTable', label: 'Creative & Sosmed' },
        { key: 'prodTable', label: 'Production & Purchase' },
        { key: 'warehouseTable', label: 'Warehouse & Logistik' }
    ];

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#FDFBF7] relative overflow-x-hidden">
            {/* Optimized Sub-Sidebar */}
            <aside className="w-full lg:w-[280px] bg-[#2D3748] text-white flex flex-col shrink-0 z-30 lg:h-screen lg:sticky lg:top-0">
                <div className="hidden lg:block p-8 border-b border-white/5">
                    <MeetingTimer />
                    <div className="mt-8 bg-white/5 p-5 rounded-[24px] border border-white/5">
                        <p className="text-[9px] font-black text-orange-400 uppercase tracking-[0.2em] mb-2 leading-none">Potential Target Profit</p>
                        <p className="text-2xl font-black text-emerald-400 tabular-nums">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(targetProfit)}
                        </p>
                    </div>
                </div>

                <nav className="hidden lg:flex flex-1 overflow-y-auto custom-scrollbar flex-col p-6">
                    <ul className="flex lg:flex-col gap-1.5 w-max lg:w-full">
                        {navItems.map((item, index) => (
                            <li 
                                key={index} 
                                onClick={() => setActiveSection(index)}
                                className={`flex items-center gap-4 px-5 py-3.5 rounded-[18px] cursor-pointer text-xs lg:text-sm whitespace-nowrap transition-all duration-300 group ${
                                    activeSection === index 
                                    ? 'bg-[#FF8c42] font-black shadow-xl shadow-orange-900/30' 
                                    : 'hover:bg-white/5 opacity-50 hover:opacity-100'
                                }`}
                            >
                                <span className={activeSection === index ? 'text-white' : 'text-orange-400'}>{item.icon}</span>
                                <span>{item.label}</span>
                            </li>
                        ))}
                    </ul>
                </nav>
                
                <div className="hidden lg:flex p-8 border-t border-white/5 gap-3 flex-col">
                    <button onClick={handleSave} disabled={mutation.isPending} className="btn-premium btn-primary w-full py-4 flex items-center justify-center gap-3 active:scale-95 transition-transform">
                        {mutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {mutation.isPending ? 'Syncing...' : 'Save Workspace'}
                    </button>
                    <button onClick={exportToPDF} className="w-full px-6 py-4 bg-white/5 rounded-[20px] font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                        <Printer size={16} /> Export to PDF
                    </button>
                </div>

                {/* Mobile Floating Action Controller - High Fidelity Floating */}
                <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-slate-900 border-t border-white/5 fixed bottom-8 left-6 right-6 z-[60] rounded-[28px] shadow-float border border-white/10 backdrop-blur-xl">
                    <button onClick={() => setActiveSection(s => Math.max(0, s-1))} className="p-2 text-white/40 active:scale-90 transition-transform"><ChevronLeft size={24}/></button>
                    <div className="text-center flex-1">
                        <p className="text-[10px] font-black uppercase text-white tracking-[0.2em] opacity-80">{navItems[activeSection].label}</p>
                    </div>
                    <button onClick={() => setActiveSection(s => Math.min(navItems.length-1, s+1))} className="p-2 text-white/40 active:scale-90 transition-transform"><ChevronRight size={24}/></button>
                    <button onClick={handleSave} className="ml-4 p-3 bg-[#FF8c42] rounded-2xl text-white shadow-xl active:scale-90 transition-transform"><Save size={20}/></button>
                </div>
            </aside>

            {/* Content Area Rendering - Lifted for Floating Controller */}
            <main ref={pdfRef} className="flex-1 p-10 lg:p-20 min-w-0 pb-64 lg:pb-20 bg-[#FDFBF7] animate-in overflow-x-hidden">
                {activeSection === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-5xl mx-auto py-20 lg:py-0">
                         <div className="mb-10 lg:mb-16">
                            <h1 className="text-5xl lg:text-[120px] font-black text-slate-900 tracking-tighter uppercase leading-[0.8] italic mb-6">ANGKASA</h1>
                            <h2 className="text-2xl lg:text-4xl font-black text-[#FF8c42] uppercase tracking-[0.2em]">WEEKLY REVIEW</h2>
                         </div>
                         <div className="w-full max-w-2xl bg-white p-2 rounded-[40px] shadow-float ring-1 ring-slate-100">
                            <input 
                                className="w-full text-xl lg:text-3xl text-center font-black text-slate-800 py-6 px-10 rounded-[32px] border-none outline-none focus:ring-8 focus:ring-orange-50 transition-all"
                                value={localData.date}
                                onChange={(e) => updateNested('date', e.target.value)}
                            />
                         </div>
                    </div>
                )}

                {activeSection === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
                        <div className="card-premium flex flex-col rounded-[48px] p-10 bg-white">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500 mb-10 flex items-center gap-4">
                                <Users size={20} className="text-slate-900" /> Attendance Ledger
                            </h3>
                            <div className="space-y-3 overflow-y-auto pr-4 custom-scrollbar flex-1 max-h-[500px]">
                                {localData.attendance.map((p, i) => (
                                    <div key={i} className={`flex items-center justify-between p-5 rounded-[24px] transition-all cursor-pointer border ${
                                        p.present ? 'bg-orange-50/50 border-orange-100' : 'bg-slate-50 border-transparent opacity-40 grayscale'
                                    }`} onClick={() => {
                                        const att = [...localData.attendance];
                                        att[i].present = !att[i].present;
                                        updateNested('attendance', att);
                                    }}>
                                        <span className="text-sm font-black tracking-tight text-slate-800">{p.role}</span>
                                        {p.present ? <CheckCircle2 size={24} className="text-orange-500" /> : <div className="w-6 h-6 border-2 border-slate-200 rounded-full" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="card-premium flex flex-col rounded-[48px] p-10 bg-white">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500 mb-10 flex items-center gap-4">
                                <Star size={20} className="text-slate-900" /> Victory Highlights
                            </h3>
                            <div className="space-y-8 flex-1">
                                <div className="flex flex-col h-1/2 min-h-[180px]">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Business Good News</label>
                                    <textarea className="flex-1 input-premium p-6 resize-none bg-slate-50 border-none rounded-[28px] font-bold text-slate-700" value={localData.goodNewsBusiness} onChange={(e) => updateNested('goodNewsBusiness', e.target.value)} />
                                </div>
                                <div className="flex flex-col h-1/2 min-h-[180px]">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Personal Good News</label>
                                    <textarea className="flex-1 input-premium p-6 resize-none bg-slate-50 border-none rounded-[28px] font-bold text-slate-700" value={localData.goodNewsPersonal} onChange={(e) => updateNested('goodNewsPersonal', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection >= 2 && activeSection <= 8 && (
                    <div className="max-w-7xl mx-auto">
                        <KpiTable 
                            title={kpiTables[activeSection-2].label}
                            data={localData[kpiTables[activeSection-2].key]}
                            onUpdate={(idx, f, v) => handleUpdateKpi(kpiTables[activeSection-2].key, idx, f, v)}
                            onAddRow={() => handleAddKpiRow(kpiTables[activeSection-2].key)}
                        />
                    </div>
                )}

                {activeSection === 9 && (
                    <div className="card-premium max-w-6xl mx-auto flex flex-col rounded-[48px] p-12 bg-white">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500 mb-12">Quarterly Rocks Review</h3>
                        <div className="space-y-4 overflow-y-auto pr-4 custom-scrollbar flex-1 max-h-[600px]">
                            {localData.rocksTable.map((rock, i) => (
                                <div key={i} className="flex flex-col md:flex-row gap-6 items-center p-8 bg-slate-50 rounded-[32px] group border border-transparent hover:border-orange-100 hover:bg-white hover:shadow-xl transition-all duration-500">
                                    <div className="w-full md:w-32 shrink-0">
                                        <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Owner</p>
                                        <input className="w-full bg-transparent font-black text-slate-800 text-xs uppercase outline-none" value={rock.owner} onChange={(e) => {
                                            const r = [...localData.rocksTable]; r[i].owner = e.target.value; updateNested('rocksTable', r);
                                        }} />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Business Goal</p>
                                        <input className="w-full bg-transparent font-black text-slate-700 text-lg outline-none" value={rock.goal} onChange={(e) => {
                                            const r = [...localData.rocksTable]; r[i].goal = e.target.value; updateNested('rocksTable', r);
                                        }} />
                                    </div>
                                    <div className={`pill scale-110 shadow-lg ${rock.status}`} onClick={() => {
                                        const r = [...localData.rocksTable]; r[i].status = r[i].status === 'on' ? 'off' : 'on'; updateNested('rocksTable', r);
                                    }} />
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-5 border-2 border-dashed border-slate-200 rounded-[32px] text-xs font-black uppercase text-slate-400 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-all" onClick={() => {
                            const r = [...localData.rocksTable, { owner: 'CEO', goal: 'Define new objective...', status: 'on' }]; updateNested('rocksTable', r);
                        }}>+ Initialize New Rock</button>
                    </div>
                )}

                {activeSection === 10 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto h-full">
                        <div className="card-premium flex flex-col rounded-[48px] p-10 bg-white h-[600px]">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-400" /> Customer Headlines
                            </h3>
                            <textarea className="flex-1 input-premium p-8 bg-slate-50 border-none rounded-[32px] font-bold text-slate-700 resize-none focus:bg-white" value={localData.customerHeadlines} onChange={(e) => updateNested('customerHeadlines', e.target.value)} placeholder="Voice of Customer..." />
                        </div>
                        <div className="card-premium flex flex-col rounded-[48px] p-10 bg-white h-[600px]">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-orange-400" /> Internal Headlines
                            </h3>
                            <textarea className="flex-1 input-premium p-8 bg-slate-50 border-none rounded-[32px] font-bold text-slate-700 resize-none focus:bg-white" value={localData.internalHeadlines} onChange={(e) => updateNested('internalHeadlines', e.target.value)} placeholder="Company updates..." />
                        </div>
                    </div>
                )}

                {activeSection === 11 && (
                    <div className="card-premium max-w-4xl mx-auto flex flex-col rounded-[48px] p-12 bg-white">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#FF8c42] mb-12">7-Day Task Execution</h3>
                        <div className="space-y-3 overflow-y-auto pr-4 custom-scrollbar flex-1 max-h-[600px]">
                            {localData.todoTable.map((todo, i) => (
                                <div key={i} className="flex items-center gap-5 p-5 bg-white border border-slate-100 rounded-[24px] hover:border-orange-200 hover:shadow-lg transition-all group">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all ${todo.status === 'done' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-300'}`} onClick={() => {
                                        const t = [...localData.todoTable]; t[i].status = t[i].status === 'done' ? 'not' : 'done'; updateNested('todoTable', t);
                                    }}>
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <input className={`w-full bg-transparent border-none outline-none text-base font-bold ${todo.status === 'done' ? 'text-slate-300 line-through' : 'text-slate-800'}`} value={todo.task} onChange={(e) => {
                                            const t = [...localData.todoTable]; t[i].task = e.target.value; updateNested('todoTable', t);
                                        }} />
                                        <input className="text-[10px] font-black uppercase text-orange-400 bg-transparent border-none outline-none" value={todo.owner} onChange={(e) => {
                                            const t = [...localData.todoTable]; t[i].owner = e.target.value; updateNested('todoTable', t);
                                        }} />
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 p-3 text-slate-200 hover:text-rose-500 transition-all" onClick={() => {
                                        const t = localData.todoTable.filter((_, idx) => idx !== i); updateNested('todoTable', t);
                                    }}><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>
                        <button className="mt-10 btn-premium btn-primary w-full py-5" onClick={() => {
                            const t = [...localData.todoTable, { task: 'Tulis tugas baru...', owner: 'Owner', status: 'not' }]; updateNested('todoTable', t);
                        }}>+ Add To-Do Item</button>
                    </div>
                )}

                {activeSection === 12 && (
                    <div className="max-w-[1400px] mx-auto">
                        <IdtSection 
                            issues={localData.idtIssues}
                            discussionNotes={localData.discussionNotes}
                            actionItems={localData.actionItems}
                            onPullIssues={() => {
                                const issues = [];
                                ['ecommTable','hcgaTable','liveTable','salesTable','creativeTable','prodTable','warehouseTable'].forEach(t => {
                                    localData[t].forEach(row => { if (row.status === 'off') issues.push(`[${t.replace('Table','')}] ${row.kpi}`); });
                                });
                                localData.rocksTable.forEach(r => { if (r.status === 'off') issues.push(`[ROCK] ${r.goal}`); });
                                updateNested('idtIssues', [...new Set([...localData.idtIssues, ...issues])]);
                            }}
                            onAddIssue={() => updateNested('idtIssues', [...localData.idtIssues, 'Isu baru...'])}
                            onRemoveIssue={(idx) => updateNested('idtIssues', localData.idtIssues.filter((_, i) => i !== idx))}
                            onDiscussionChange={(e) => updateNested('discussionNotes', e.target.value)}
                            onActionChange={(e) => updateNested('actionItems', e.target.value)}
                        />
                    </div>
                )}

                {activeSection === 13 && (
                    <div className="h-full flex flex-col items-center justify-center max-w-6xl mx-auto">
                        <div className="bg-white p-20 rounded-[80px] shadow-float border border-white flex flex-col items-center w-full">
                            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-slate-400 mb-20 opacity-40">Section 14: Final Rating</h2>
                            <div className="flex flex-wrap justify-center gap-10">
                                {Object.keys(localData.ratings).map((div) => (
                                    <div key={div} className="flex flex-col items-center group">
                                        <span className="text-[10px] font-black uppercase text-slate-400 mb-5 tracking-widest group-hover:text-orange-500 transition-colors">{div}</span>
                                        <input 
                                            type="number" min="0" max="10" step="0.5"
                                            className="w-28 h-28 text-5xl font-black text-center bg-slate-50 border-none rounded-[40px] shadow-inner focus:ring-[12px] focus:ring-orange-50 focus:text-orange-500 outline-none transition-all tabular-nums"
                                            value={localData.ratings[div]}
                                            onChange={(e) => handleRatingChange(div, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-32 text-center group">
                                <p className="text-xs font-black uppercase tracking-[0.5em] text-slate-300 mb-4 transition-colors group-hover:text-orange-400">Average Performance Pulse</p>
                                <div className="text-[18rem] font-black text-[#FF8c42] tracking-tighter leading-none drop-shadow-2xl">{averageRating}</div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MeetingTool;
