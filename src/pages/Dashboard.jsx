import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingUp, Package, DollarSign, Send, Edit, Target, ListChecks, Zap, AlertTriangle } from 'lucide-react';
import Card from '../components/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchDashboardMetrics, fetchSalesChartData, fetchSkuData, updateDashboardMetrics, fetchMeetingData, fetchGrowthData, resetSystem } from '../api/dashboardApi';

const Dashboard = () => {
    const queryClient = useQueryClient();
    const [reportText, setReportText] = useState('');
    const [aiMessage, setAiMessage] = useState('');
    const [manualInputs, setManualInputs] = useState({ gmv: '', profit: '', netSales: '', soldItems: '', discountRate: '', returnRate: '' });

    const { data: metrics, isLoading: isLoadingMetrics } = useQuery({ queryKey: ['dashboardMetrics'], queryFn: fetchDashboardMetrics });
    const { data: chartData, isLoading: isLoadingChart } = useQuery({ queryKey: ['salesChartData'], queryFn: fetchSalesChartData });
    const { data: skuData, isLoading: isLoadingSku } = useQuery({ queryKey: ['skuData'], queryFn: fetchSkuData });
    const { data: meetingData } = useQuery({ queryKey: ['meetingData'], queryFn: fetchMeetingData });
    const { data: growthData } = useQuery({ queryKey: ['growthData'], queryFn: fetchGrowthData });

    const updateMetricsMutation = useMutation({
        mutationFn: updateDashboardMetrics,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
            queryClient.invalidateQueries({ queryKey: ['salesChartData'] });
        }
    });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    const handleManualUpdate = () => {
        const newMetrics = {};
        Object.keys(manualInputs).forEach(key => {
            if (manualInputs[key] !== '') newMetrics[key] = parseFloat(manualInputs[key]);
        });
        if (Object.keys(newMetrics).length > 0) {
            updateMetricsMutation.mutate(newMetrics, {
                onSuccess: () => setManualInputs({ gmv: '', profit: '', netSales: '', soldItems: '', discountRate: '', returnRate: '' }),
            });
        }
    };

    const handleAiReport = () => {
        if (!reportText) return;
        setAiMessage('');
        let updates = {};
        const salesMatch = reportText.match(/(?:sales|penjualan)\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*(jt|juta)?/i);
        if (salesMatch) {
            let val = parseFloat(salesMatch[1].replace(',', '.'));
            if (salesMatch[2]) val *= 1000000;
            updates.netSales = val;
        }
        if (Object.keys(updates).length > 0) {
            updateMetricsMutation.mutate(updates, {
                onSuccess: () => {
                    setAiMessage('✅ Ecosystem Synced via AI');
                    setReportText('');
                    setTimeout(() => setAiMessage(''), 3000);
                },
            });
        }
    };

    if (isLoadingMetrics || isLoadingChart || isLoadingSku) return <div className="p-12 text-center animate-pulse"><p className="label-caps">Initializing ecosystem...</p></div>;

    return (
        <div className="flex flex-col gap-6 animate-in mt-2 lg:mt-6 px-6 lg:px-0">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                        <span className="label-caps text-orange-500">Live Enterprise Overview</span>
                    </div>
                    <h2 className="heading-lg tracking-tighter">Executive Dashboard</h2>
                    <p className="text-body-muted mt-1 opacity-70">Aggregated performance intelligence across Aksana ecosystem</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-3 rounded-[24px] border border-slate-100 shadow-soft">
                    <div className="px-6 py-1">
                        <p className="label-caps mb-1">Fiscal Date</p>
                        <p className="text-sm font-black text-slate-800 tabular-nums">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <button onClick={resetSystem} className="w-12 h-12 flex items-center justify-center bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all duration-500 shadow-sm">
                        <AlertTriangle size={20} />
                    </button>
                </div>
            </header>

            {/* Ecosystem Impact Row - Balanced Proportions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                <div className="lg:col-span-7 bg-slate-900 rounded-[32px] p-6 lg:p-8 text-white relative overflow-hidden group shadow-float border border-white/5 flex flex-col justify-center min-h-[240px]">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
                        <Target size={180} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                                <TrendingUp size={16} className="text-emerald-400" />
                            </div>
                            <span className="label-caps text-emerald-400 tracking-[0.4em]">Strategic Logic</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-center">
                            <div>
                                <p className="label-caps text-slate-500 mb-2">Growth Delta</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl lg:text-[56px] font-black tracking-tighter tabular-nums text-white leading-none">
                                        +{(((growthData?.target.leads || 0) / (growthData?.current.leads || 1) - 1) * 100).toFixed(1)}
                                    </span>
                                    <span className="text-xl lg:text-2xl font-black text-emerald-400 tracking-tighter">%</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white/5 p-5 rounded-[24px] border border-white/10 backdrop-blur-xl shadow-2xl">
                                    <p className="label-caps text-slate-400 mb-1.5">Target Yield</p>
                                    <p className="text-xl lg:text-2xl font-black text-[#FF8c42] tracking-tight tabular-nums truncate leading-none">
                                        {formatCurrency(Math.round(Math.floor((growthData?.target.leads || 0) * ((growthData?.target.conv || 0) / 100)) * (growthData?.target.trans || 0) * (growthData?.target.sale || 0) * ((growthData?.target.margin || 0) / 100)))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 card-premium flex flex-col justify-between rounded-[32px] p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="label-caps text-orange-500 flex items-center gap-3">
                            <ListChecks size={16} className="text-slate-900" /> Key Rocks
                        </h3>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                            <span className="text-[7.5px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
                        </div>
                    </div>
                    <div className="space-y-2.5">
                        {meetingData?.rocksTable?.slice(0, 3).map((rock, i) => (
                            <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-[18px] hover:bg-white hover:shadow-soft border border-transparent hover:border-slate-100 transition-all duration-500 group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full shadow-lg ${rock.status === 'on' ? 'bg-emerald-400 shadow-emerald-200' : 'bg-rose-400 shadow-rose-200'}`} />
                                    <span className="text-[10px] font-black text-slate-700 tracking-tight leading-tight uppercase">{rock.goal}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Metrics Grid - Moderately Compact & Safe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                <Card title="Gross Merchandise Value" value={formatCurrency(metrics?.gmv || 0)} trend={2.5} icon={<DollarSign size={18} />} />
                <Card title="Net Ecosystem Sales" value={formatCurrency(metrics?.netSales || 0)} trend={1.8} />
                <Card title="Realized Net Profit" value={formatCurrency(metrics?.profit || 0)} trend={5.2} icon={<TrendingUp size={18} />} />
                <Card title="Inventory Distribution" value={(metrics?.soldItems || 0).toLocaleString()} subtext="Units Sold" icon={<Package size={18} />} />
                <Card title="Average Market Discount" value={`${metrics?.discountRate || 0}%`} subtext="Pricing Efficiency" />
                <Card title="Operational Return Rate" value={`${metrics?.returnRate || 0}%`} subtext="Customer Satisfaction" />
            </div>

            {/* Main Interactive Grid - Precision Balanced & Safe */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8">
                    {/* AI Smart Reporter */}
                    <div className="card-premium bg-gradient-to-br from-white to-orange-50/30 rounded-[32px] flex-1 p-6 lg:p-8">
                        <h3 className="heading-md mb-4 flex items-center gap-3">
                            <span className="text-xl">✨</span> AI Smart Sync
                        </h3>
                        <textarea
                            className="input-premium min-h-[110px] resize-none mb-4 text-xs"
                            placeholder="Input performance report summary..."
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                        />
                        <button className="btn-premium btn-primary w-full shadow-xl py-3 text-[9px]" onClick={handleAiReport}>
                            <Send size={12} /> Execute Sync
                        </button>
                        {aiMessage && <div className="mt-3 p-3 rounded-[16px] bg-white border border-dashed border-emerald-200 text-center label-caps text-emerald-600 animate-in text-[8px]">{aiMessage}</div>}
                    </div>

                    {/* Quick SKU View - Compact High Fidelity Safe */}
                    <div className="card-premium rounded-[32px] shrink-0 p-6 lg:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="label-caps text-[9px]">Stock Integrity Monitor</h3>
                            <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md tracking-widest">LIVE</span>
                        </div>
                        <div className="space-y-5">
                            {(skuData || []).slice(0, 4).map((item) => (
                                <div key={item?.sku} className="flex items-start justify-between group cursor-default border-b border-slate-50 pb-4 last:border-none last:pb-0 gap-4">
                                    <div className="min-w-0 flex-1">
                                        <p className="label-caps text-[7.5px] mb-1 group-hover:text-orange-500 transition-colors tracking-[0.4em]">{item?.sku || 'N/A'}</p>
                                        <p className="text-sm font-black text-slate-800 tracking-tight uppercase leading-snug whitespace-normal break-words">{item?.name || 'Unknown Item'}</p>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0 pt-1">
                                        <span className="text-xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">{item?.stock || 0}</span>
                                        <div className={`w-2 h-2 rounded-full shadow-lg ${item?.status === 'Critical' ? 'bg-rose-500 shadow-rose-200' : item?.status === 'Low' ? 'bg-amber-400 shadow-amber-200' : 'bg-emerald-400 shadow-emerald-200'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sales Velocity Chart - Hero Proportions Compact Safe */}
                <div className="lg:col-span-8 card-premium flex flex-col min-h-[320px] rounded-[32px] p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="label-caps text-[8px]">Ecosystem Sales Velocity (Weekly)</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-xl shadow-orange-900/20"></div>
                                <span className="label-caps opacity-60 text-[7px]">Gross Sales</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData || []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF8c42" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FF8c42" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 8, fontWeight: 900, fill: '#94a3b8', textTransform: 'uppercase'}} dy={10} />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '16px'}}
                                    itemStyle={{fontWeight: 900, color: '#0F172A', textTransform: 'uppercase', fontSize: '9px', letterSpacing: '0.1em'}}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#FF8c42" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" dot={{r: 5, fill: '#fff', stroke: '#FF8c42', strokeWidth: 3}} activeDot={{r: 8, strokeWidth: 0, shadowBlur: 15, shadowColor: 'rgba(255,140,66,0.4)'}} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Manual Override - High Fidelity Compact Scaling */}
            <div className="card-premium bg-slate-50/50 border-dashed border-slate-200 rounded-[32px] p-8 lg:p-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-soft border border-slate-100">
                        <Edit size={20} className="text-orange-500" />
                    </div>
                    <div>
                        <h3 className="heading-md tracking-tight uppercase leading-none text-slate-900">Manual Intelligence Override</h3>
                        <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest mt-1.5 opacity-60">Direct ecosystem state modification</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    {Object.keys(manualInputs).map((key) => (
                        <div key={key} className="space-y-3">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">
                                {key.replace(/([A-Z])/g, ' $1')}
                            </label>
                            <input 
                                type="number" 
                                name={key} 
                                className="w-full px-5 py-4 lg:py-5 bg-white border border-slate-100 rounded-[16px] text-lg font-black text-slate-800 tabular-nums shadow-soft focus:ring-[10px] focus:ring-orange-50 focus:border-orange-400 outline-none transition-all placeholder:text-slate-200 min-h-[60px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                placeholder={metrics?.[key]?.toString() || '0'} 
                                value={manualInputs[key]} 
                                onChange={(e) => setManualInputs(p => ({...p, [e.target.name]: e.target.value}))} 
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end mt-10">
                    <button onClick={handleManualUpdate} className="btn-premium btn-primary shadow-lg px-10 py-4 text-[9px]">
                        Apply Structural Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
