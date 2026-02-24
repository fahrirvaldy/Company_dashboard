import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Chart from 'chart.js/auto';
import { TrendingUp, Target, Save, Zap, Info, ArrowRight, DollarSign, Activity, Percent, Loader2 } from 'lucide-react';
import { fetchGrowthData, saveGrowthData } from '../api/dashboardApi';
import './GrowthSimulator.css';

const GrowthSimulator = () => {
    const queryClient = useQueryClient();
    const [currency, setCurrency] = useState('IDR');
    const [globalGrowth, setGlobalGrowth] = useState(10);
    const [localData, setLocalData] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const comparisonChartRef = useRef(null);
    const waterfallChartRef = useRef(null);
    const comparisonChartInstance = useRef(null);
    const waterfallChartInstance = useRef(null);

    const { data: simData, isLoading } = useQuery({ queryKey: ['growthData'], queryFn: fetchGrowthData });

    const mutation = useMutation({
        mutationFn: saveGrowthData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['growthData'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
            const toast = document.createElement('div');
            toast.className = "fixed top-10 right-10 bg-slate-900 text-orange-400 px-10 py-5 rounded-[24px] shadow-float z-[100] font-black text-[10px] uppercase tracking-[0.3em] animate-in border border-white/10 backdrop-blur-xl";
            toast.innerText = "✓ HIGH-FIDELITY ANALYTICS SYNCED";
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    });

    useEffect(() => {
        if (simData && !isInitialized) {
            setLocalData(JSON.parse(JSON.stringify(simData)));
            setIsInitialized(true);
        }
    }, [simData, isInitialized]);

    const handleInputChange = (section, field, value) => {
        const val = parseFloat(value) || 0;
        const newData = { ...localData };
        newData[section][field] = val;
        setLocalData(newData);
    };

    const handleSync = async () => {
        if (!localData || isSaving) return;
        setIsSaving(true);
        try {
            await mutation.mutateAsync(localData);
            // Global Success Toast
            const toast = document.createElement('div');
            toast.className = "fixed top-10 right-10 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl z-[100] font-black text-xs uppercase animate-in border border-white/10";
            toast.innerText = "✓ DATA SYNCED TO CLOUD";
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        } catch (error) {
            console.error("Sync failed:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const applyGlobalGrowth = () => {
        const multiplier = 1 + globalGrowth / 100;
        const newData = { ...localData };
        Object.keys(newData.target).forEach(k => {
            newData.target[k] = k === 'leads' || k === 'sale' ? Math.round(newData.current[k] * multiplier) : parseFloat((newData.current[k] * multiplier).toFixed(2));
        });
        setLocalData(newData);
    };

    const results = useMemo(() => {
        if (!localData) return null;
        const calc = (d) => {
            const leads = parseFloat(d.leads) || 0;
            const conv = parseFloat(d.conv) || 0;
            const trans = parseFloat(d.trans) || 0;
            const sale = parseFloat(d.sale) || 0;
            const margin = parseFloat(d.margin) || 0;

            const cust = Math.floor(leads * (conv / 100));
            const rev = cust * trans * sale;
            const profit = rev * (margin / 100);
            return { cust, rev, profit };
        };
        const current = calc(localData.current);
        const target = calc(localData.target);
        
        // Hardened Growth Logic
        const growth = (current.profit > 0 && isFinite(current.profit)) 
            ? ((target.profit - current.profit) / current.profit) * 100 
            : 0;
            
        return { current, target, growth: isFinite(growth) ? growth : 0 };
    }, [localData]);

    const waterfallData = useMemo(() => {
        if (!localData || !results) return [];
        const { current: c, target: t } = localData;
        
        const calc = (leads, conv, trans, sale, margin) => {
            const l = parseFloat(leads) || 0;
            const co = parseFloat(conv) || 0;
            const tr = parseFloat(trans) || 0;
            const sa = parseFloat(sale) || 0;
            const ma = parseFloat(margin) || 0;
            return Math.floor(l * (co / 100)) * tr * sa * (ma / 100);
        };
        
        const base = results.current.profit || 0;
        const step1 = calc(t.leads, c.conv, c.trans, c.sale, c.margin);
        const step2 = calc(t.leads, t.conv, c.trans, c.sale, c.margin);
        const step3 = calc(t.leads, t.conv, t.trans, c.sale, c.margin);
        const step4 = calc(t.leads, t.conv, t.trans, t.sale, c.margin);
        const final = results.target.profit || 0;

        return [
            { label: 'Baseline', val: [0, base], diff: base },
            { label: 'Leads', val: [base, step1], diff: step1 - base },
            { label: 'Conv.', val: [step1, step2], diff: step2 - step1 },
            { label: 'Freq.', val: [step2, step3], diff: step3 - step2 },
            { label: 'Ticket', val: [step3, step4], diff: step4 - step3 },
            { label: 'Margin', val: [step4, final], diff: final - step4 },
            { label: 'Projected', val: [0, final], diff: final }
        ];
    }, [localData, results]);

    useEffect(() => {
        if (!results || !comparisonChartRef.current || !waterfallChartRef.current) return;
        
        if (comparisonChartInstance.current) comparisonChartInstance.current.destroy();
        if (waterfallChartInstance.current) waterfallChartInstance.current.destroy();

        comparisonChartInstance.current = new Chart(comparisonChartRef.current, {
            type: 'bar',
            data: {
                labels: ['Current', 'Projected'],
                datasets: [{
                    data: [results.current.profit, results.target.profit],
                    backgroundColor: ['#F1F5F9', '#FF8c42'],
                    borderRadius: 24, barPercentage: 0.35,
                    borderSkipped: false
                }]
            },
            options: { 
                responsive: true, maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                scales: { 
                    y: { beginAtZero: true, display: false }, 
                    x: { grid: { display: false }, ticks: { font: { weight: 900, size: 11, family: 'Plus Jakarta Sans' }, color: '#64748B' } } 
                } 
            }
        });

        waterfallChartInstance.current = new Chart(waterfallChartRef.current, {
            type: 'bar',
            data: {
                labels: waterfallData.map(d => d.label),
                datasets: [{
                    data: waterfallData.map(d => d.val),
                    backgroundColor: waterfallData.map((d, i) => i === 0 || i === 6 ? '#0F172A' : (d.diff >= 0 ? '#10B981' : '#F56565')),
                    borderRadius: 10,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    y: { display: false }, 
                    x: { grid: { display: false }, ticks: { font: { size: 9, weight: 900, family: 'Plus Jakarta Sans' }, color: '#94a3b8' } } 
                }
            }
        });

        return () => {
            if (comparisonChartInstance.current) comparisonChartInstance.current.destroy();
            if (waterfallChartInstance.current) waterfallChartInstance.current.destroy();
        };
    }, [results, waterfallData]);

    if (isLoading || !localData) return <div className="p-12 h-screen flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-orange-500" size={64} />
        <p className="label-caps">Calculating Strategic Growth Vectors...</p>
    </div>;

    const formatCurr = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Math.round(v));

    return (
        <div className="flex flex-col gap-12 pb-48 animate-in mt-12 lg:mt-20">
            <div className="max-w-[1440px] mx-auto w-full px-8 lg:px-16">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 lg:gap-16 mb-10">
                    <div>
                        <h1 className="heading-xl tracking-tighter">Growth Simulator</h1>
                        <p className="text-body-muted mt-3 opacity-60 uppercase tracking-[0.2em]">High Fidelity 5-Ways Financial Modeling</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                        <div className="flex bg-white p-1.5 rounded-[20px] border border-slate-100 shadow-soft">
                            <button onClick={() => setCurrency('IDR')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-2xl text-[10px] font-black transition-all duration-300 ${currency === 'IDR' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>IDR</button>
                            <button onClick={() => setCurrency('USD')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-2xl text-[10px] font-black transition-all duration-300 ${currency === 'USD' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>USD</button>
                        </div>
                        <button onClick={handleSync} disabled={isSaving} className="flex-1 md:flex-none btn-premium btn-primary py-3 px-4 md:py-5 md:px-10 shadow-2xl active:scale-95 transition-all disabled:opacity-50">
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {isSaving ? 'SYNCING TO CLOUD...' : 'Sync Simulator Analytics'}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    <div className="lg:col-span-8 space-y-8">
                        {/* Global Growth Control - Compact */}
                        <div className="bg-slate-900 rounded-[32px] p-6 md:p-8 lg:px-10 lg:py-8 text-white shadow-float relative overflow-hidden group border border-white/5">
                            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-125 transition-transform duration-1000"><Zap size={180} /></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-12">
                                <div className="text-center md:text-left">
                                    <h3 className="label-caps text-orange-400 mb-2 opacity-80 text-[8.5px]">Simulation Control</h3>
                                    <p className="text-2xl lg:text-3xl font-black tracking-tight leading-none uppercase italic">Scale Ecosystem</p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/5 p-3 rounded-[28px] border border-white/5 backdrop-blur-xl w-full md:w-auto">
                                    <div className="flex-1 md:flex-none flex items-center px-4 sm:px-6 border-b sm:border-b-0 sm:border-r border-white/10 pb-3 sm:pb-0">
                                        <input type="number" value={globalGrowth === 0 ? '' : globalGrowth} onChange={(e) => setGlobalGrowth(parseFloat(e.target.value))} className="w-20 bg-transparent text-center font-black text-2xl sm:text-4xl outline-none tabular-nums" />
                                        <span className="font-black text-orange-400 text-xl lg:text-2xl ml-2">%</span>
                                    </div>
                                    <button onClick={applyGlobalGrowth} className="btn-premium btn-primary py-3 px-8 shadow-2xl text-[10px]">Execute Factor</button>
                                </div>
                            </div>
                        </div>

                        {/* Simulation Matrix - Compact */}
                        <div className="card-premium p-0 overflow-hidden border-none shadow-soft bg-white rounded-[32px]">
                            <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-100 py-5 px-10 text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                                <div className="col-span-6 md:col-span-5 leading-none">Growth Driver Matrix</div>
                                <div className="hidden md:block md:col-span-2 text-right leading-none">Baseline</div>
                                <div className="col-span-6 md:col-span-5 text-right leading-none">Target</div>
                            </div>
                            {[
                                { label: 'Prospect Leads', key: 'leads', help: 'Acquisition velocity', icon: <ArrowRight size={14}/> },
                                { label: 'Conversion Factor', key: 'conv', help: 'Conversion health', suffix: '%', icon: <Percent size={14}/> },
                                { label: 'Order Frequency', key: 'trans', help: 'Purchase index', icon: <Activity size={14}/> },
                                { label: 'Average Ticket', key: 'sale', help: 'Net value per unit', icon: <DollarSign size={14}/> },
                                { label: 'Profit Margin', key: 'margin', help: 'Efficiency margin', suffix: '%', icon: <TrendingUp size={14}/> },
                            ].map((m) => (
                                <div key={m.key} className="grid grid-cols-12 items-center py-6 px-10 border-b border-slate-50 hover:bg-slate-50/50 transition-all group">
                                    <div className="col-span-6 md:col-span-5 flex items-center gap-4">
                                        <div className="hidden sm:flex w-10 h-10 rounded-[16px] bg-slate-50 border border-slate-100 items-center justify-center text-slate-300 group-hover:text-orange-500 group-hover:bg-white transition-all duration-500">{m.icon}</div>
                                        <div>
                                            <label className="text-sm font-black text-slate-800 block uppercase tracking-tight leading-none mb-1">{m.label}</label>
                                            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest opacity-60 leading-none">{m.help}</span>
                                        </div>
                                    </div>
                                    <div className="hidden md:block md:col-span-2 px-2">
                                        <input type="number" value={localData.current[m.key] === 0 ? '' : localData.current[m.key]} onChange={(e) => handleInputChange('current', m.key, e.target.value)} className="w-full bg-transparent border-none text-right font-black text-slate-300 outline-none tabular-nums text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-4" />
                                    </div>
                                    <div className="col-span-6 md:col-span-5 pl-8 border-l border-slate-100 flex justify-end">
                                        <div className="relative group flex items-center w-full max-w-[240px]">
                                            <input 
                                                type="number" 
                                                value={localData.target[m.key] === 0 ? '' : localData.target[m.key]} 
                                                onChange={(e) => handleInputChange('target', m.key, e.target.value)} 
                                                className="w-full bg-orange-50/30 border border-orange-100/30 py-4 pl-5 pr-12 rounded-[20px] text-right font-black text-slate-800 outline-none focus:ring-[8px] focus:ring-orange-50 focus:bg-white transition-all tabular-nums text-base min-h-[56px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                            />
                                            {m.suffix && (
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-orange-400 uppercase tracking-[0.3em] pointer-events-none opacity-40">
                                                    {m.suffix}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="bg-slate-900 text-white p-8 lg:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-[#FF8c42] to-emerald-500" />
                                <div className="opacity-40 hover:opacity-100 transition-opacity flex flex-col justify-end">
                                    <p className="label-caps text-slate-500 mb-3 text-[8px]">Current Baseline</p>
                                    <p className="text-xl lg:text-2xl font-black tabular-nums tracking-tighter text-slate-200 truncate leading-none">{formatCurr(results.current.profit)}</p>
                                </div>
                                <div className="text-right flex flex-col justify-end">
                                    <p className="label-caps text-orange-400 mb-3 tracking-[0.4em] text-[8px]">Projected Yield</p>
                                    <p className="text-2xl lg:text-4xl font-black text-[#FF8c42] tabular-nums tracking-tighter whitespace-nowrap leading-none">{formatCurr(results.target.profit)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <div className="card-premium h-[320px] flex flex-col rounded-[32px] p-8 bg-white">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="label-caps text-slate-400 leading-none text-[8.5px]">Yield Projections</h3>
                                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] ${results.growth >= 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                    {results.growth > 0 ? '+' : ''}{results.growth.toFixed(1)}% LIFT
                                </div>
                            </div>
                            <div className="flex-1 relative"><canvas ref={comparisonChartRef} /></div>
                        </div>

                        <div className="card-premium h-[320px] flex flex-col rounded-[32px] p-8 bg-white">
                            <h3 className="label-caps text-slate-400 mb-8 leading-none text-[8.5px]">Variable Impact</h3>
                            <div className="flex-1 relative"><canvas ref={waterfallChartRef} /></div>
                        </div>

                        <div className="card-premium bg-[#2D3748] border-none rounded-[32px] p-8 text-white relative overflow-hidden group shadow-float flex-1 min-h-[220px]">
                            <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 group-hover:scale-150 transition-transform duration-[2000ms]"><Activity size={240}/></div>
                            <div className="relative z-10 flex flex-col h-full justify-center">
                                <h4 className="label-caps text-orange-400 mb-8 opacity-80 text-[8.5px]">Integrity Health</h4>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">Score Index</span>
                                        <span className="text-3xl font-black text-white tabular-nums tracking-tighter leading-none">{(results.target.profit / 1000000).toFixed(1)}<span className="text-xs text-orange-400 ml-2 font-black uppercase tracking-widest opacity-60">pts</span></span>
                                    </div>
                                    <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5 p-1 shadow-inner">
                                        <div className="bg-[#FF8c42] h-full rounded-full transition-all duration-[1500ms]" style={{ width: '88%' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrowthSimulator;
