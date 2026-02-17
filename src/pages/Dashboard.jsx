import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingUp, Package, DollarSign, AlertCircle, Send, Edit, Target, ListChecks, Save } from 'lucide-react';
import Card from '../components/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchDashboardMetrics, fetchSalesChartData, fetchSkuData, updateDashboardMetrics, fetchMeetingData, fetchGrowthData, saveMeetingData } from '../api/dashboardApi';

const Dashboard = () => {
    const queryClient = useQueryClient();
    const [reportText, setReportText] = useState('');
    const [aiMessage, setAiMessage] = useState('');
    const [manualInputs, setManualInputs] = useState({ gmv: '', profit: '', netSales: '', soldItems: '', discountRate: '', returnRate: '' });

    // Queries
    const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
        queryKey: ['dashboardMetrics'],
        queryFn: fetchDashboardMetrics,
    });

    const { data: chartData, isLoading: isLoadingChart } = useQuery({
        queryKey: ['salesChartData'],
        queryFn: fetchSalesChartData,
    });

    const { data: skuData, isLoading: isLoadingSku } = useQuery({
        queryKey: ['skuData'],
        queryFn: fetchSkuData,
    });

    const { data: meetingData, isLoading: isLoadingMeeting } = useQuery({
        queryKey: ['meetingData'],
        queryFn: fetchMeetingData,
    });

    const { data: growthData, isLoading: isLoadingGrowth } = useQuery({
        queryKey: ['growthData'],
        queryFn: fetchGrowthData,
    });

    // Mutations
    const updateMetricsMutation = useMutation({
        mutationFn: updateDashboardMetrics,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
            queryClient.invalidateQueries({ queryKey: ['salesChartData'] });
        },
        onError: (error) => {
            setAiMessage(`❌ Gagal menyimpan: ${error.message}`);
        }
    });

    const mutationMeeting = useMutation({
        mutationFn: saveMeetingData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meetingData'] });
        }
    });

    // Handlers
    const formatCurrency = (val) => {
        if (typeof val !== 'number') return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    const calculateProfit = (data) => {
        if (!data) return 0;
        const cust = Math.floor(data.leads * (data.conv / 100));
        return cust * data.trans * data.sale * (data.margin / 100);
    };

    const currentSimProfit = calculateProfit(growthData?.current);
    const targetSimProfit = calculateProfit(growthData?.target);
    const growthPercent = currentSimProfit > 0 ? ((targetSimProfit - currentSimProfit) / currentSimProfit) * 100 : 0;

    const handleAiReport = () => {
        if (!reportText) return;
        setAiMessage('');

        let metricsUpdates = {};
        let meetingUpdates = { ...meetingData };
        let foundSomething = false;

        const salesMatch = reportText.match(/(?:sales|penjualan)\s+(?:rp\.?)?\s*(\d+)/i);
        if (salesMatch) {
            metricsUpdates.netSales = parseInt(salesMatch[1]);
            foundSomething = true;
        }

        const profitMatch = reportText.match(/(?:profit|laba|untung)\s+(?:rp\.?)?\s*(\d+)/i);
        if (profitMatch) {
            metricsUpdates.profit = parseInt(profitMatch[1]);
            foundSomething = true;
        }

        const rockMatch = reportText.match(/(?:prioritas|rock|goal):\s*([^,.]+)/i);
        if (rockMatch) {
            meetingUpdates.rocksTable = [...(meetingUpdates.rocksTable || []), { owner: 'AI', goal: rockMatch[1].trim(), status: 'on' }];
            foundSomething = true;
        }

        const todoMatch = reportText.match(/(?:tugas|todo|task):\s*([^,.]+)/i);
        if (todoMatch) {
            meetingUpdates.todoTable = [...(meetingUpdates.todoTable || []), { task: todoMatch[1].trim(), owner: 'AI', status: 'not' }];
            foundSomething = true;
        }
        
        if (foundSomething) {
            if (Object.keys(metricsUpdates).length > 0) {
                updateMetricsMutation.mutate(metricsUpdates);
            }
            if (rockMatch || todoMatch) {
                mutationMeeting.mutate(meetingUpdates);
            }
            setAiMessage('✅ AI integrated report data!');
            setReportText('');
        } else {
            setAiMessage("⚠️ No data found. Try: 'Sales 10jt, Prioritas: Rebranding'");
        }
    };

    const handleManualUpdate = () => {
        const newMetrics = {};
        Object.keys(manualInputs).forEach(key => {
            if (manualInputs[key] !== '') {
                newMetrics[key] = parseFloat(manualInputs[key]);
            }
        });

        if (Object.keys(newMetrics).length > 0) {
            updateMetricsMutation.mutate(newMetrics, {
                onSuccess: () => setManualInputs({ gmv: '', profit: '', netSales: '', soldItems: '', discountRate: '', returnRate: '' }),
            });
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setManualInputs(prev => ({ ...prev, [name]: value }));
    };

    if (isLoadingMetrics || isLoadingChart || isLoadingSku || isLoadingMeeting || isLoadingGrowth) {
        return <div className="flex justify-center items-center h-full text-[#FF8c42] font-bold">Loading dashboard integration...</div>;
    }

    return (
        <div className="flex flex-col gap-6 pb-12">
            <header className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-extrabold text-slate-800">Company Overview</h2>
                <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card" style={{ borderLeft: '4px solid #10B981' }}>
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-emerald-700">
                        <Target size={18} /> Growth Simulator Context
                    </h3>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Current Profit</p>
                            <p className="text-xl font-extrabold text-slate-700">{formatCurrency(currentSimProfit)}</p>
                        </div>
                        <div className="text-center px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Potential</p>
                            <p className="text-2xl font-black text-emerald-600">+{growthPercent.toFixed(1)}%</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Target Profit</p>
                            <p className="text-xl font-extrabold text-emerald-600">{formatCurrency(targetSimProfit)}</p>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ borderLeft: '4px solid #FF8c42' }}>
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-orange-600">
                        <ListChecks size={18} /> Active Business Rocks
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        {meetingData?.rocksTable?.slice(0, 2).map((rock, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-sm font-bold text-slate-600">{rock.goal}</span>
                                <span className={`pill ${rock.status}`}></span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card" style={{ background: 'linear-gradient(135deg, #fff 0%, #FFF8F0 100%)', border: '1px solid #FFE4C4' }}>
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-2 text-[#FF8c42]">
                        <span className="text-lg">✨</span> AI Smart Reporter
                    </h3>
                    <p className="text-[11px] text-slate-500 mb-4 leading-relaxed font-medium">
                        Analyze natural reports to update metrics & tasks.<br/>
                        <span className="text-orange-400 italic">"Penjualan 150jt, Prioritas: Launch Web"</span>
                    </p>
                    <textarea
                        className="w-full text-sm font-medium p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-300 outline-none transition-all min-h-[80px] mb-3"
                        placeholder="Paste report text here..."
                        value={reportText}
                        onChange={(e) => setReportText(e.target.value)}
                    />
                    <button className="btn w-full flex items-center justify-center gap-2 py-3 shadow-lg shadow-orange-100" onClick={handleAiReport} disabled={updateMetricsMutation.isPending || mutationMeeting.isPending}>
                        <Send size={16} /> Process Report
                    </button>
                    {aiMessage && <div className="text-[11px] font-bold mt-3 p-2 rounded bg-white/50 text-center border border-dashed border-orange-200 text-orange-600">{aiMessage}</div>}
                </div>

                <div className="lg:col-span-2 card">
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-slate-700">
                        <Edit size={16} className="text-orange-400" /> Manual Override
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GMV (Rp)</label>
                            <input type="number" name="gmv" className="w-full p-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-lg focus:border-orange-400 outline-none" placeholder={metrics?.gmv} value={manualInputs.gmv} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Sales (Rp)</label>
                            <input type="number" name="netSales" className="w-full p-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-lg focus:border-orange-400 outline-none" placeholder={metrics?.netSales} value={manualInputs.netSales} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profit (Rp)</label>
                            <input type="number" name="profit" className="w-full p-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-lg focus:border-orange-400 outline-none" placeholder={metrics?.profit} value={manualInputs.profit} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Items Sold</label>
                            <input type="number" name="soldItems" className="w-full p-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-lg focus:border-orange-400 outline-none" placeholder={metrics?.soldItems} value={manualInputs.soldItems} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount %</label>
                            <input type="number" name="discountRate" className="w-full p-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-lg focus:border-orange-400 outline-none" placeholder={metrics?.discountRate} value={manualInputs.discountRate} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Return Rate %</label>
                            <input type="number" name="returnRate" className="w-full p-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-lg focus:border-orange-400 outline-none" placeholder={metrics?.returnRate} value={manualInputs.returnRate} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={handleManualUpdate} disabled={updateMetricsMutation.isPending} className="btn flex-1 shadow-md bg-[#2D3748] hover:bg-slate-700">
                            Apply Changes
                        </button>
                        <button 
                            onClick={() => {
                                if (window.confirm('⚠️ Reset all data?')) {
                                    localStorage.clear();
                                    window.location.reload();
                                }
                            }}
                            className="px-4 py-2 text-[11px] font-bold text-rose-500 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                        >
                            Reset System
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="GMV" value={formatCurrency(metrics?.gmv)} trend={2.5} icon={<DollarSign size={20} />} />
                <Card title="Net Sales" value={formatCurrency(metrics?.netSales)} trend={1.8} />
                <Card title="Profit" value={formatCurrency(metrics?.profit)} trend={5.2} icon={<TrendingUp size={20} />} />
                <Card title="Items Sold" value={metrics?.soldItems || 0} subtext="units sold" icon={<Package size={20} />} />
                <Card title="Avg Discount" value={`${metrics?.discountRate || 0}%`} subtext="Target < 20%" />
                <Card title="Return Rate" value={`${metrics?.returnRate || 0}%`} subtext="Target < 2%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="text-sm font-bold text-slate-500 mb-4">Sales Trend (Weekly)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF8c42" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#FF8c42" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                                <YAxis hide />
                                <Tooltip />
                                <Area type="monotone" dataKey="sales" stroke="#FF8c42" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-sm font-bold text-slate-500 mb-4">Inventory Status</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-slate-400 font-bold uppercase text-[10px] border-b border-slate-100">
                                <tr>
                                    <th className="pb-2">SKU</th>
                                    <th className="pb-2">Item</th>
                                    <th className="pb-2">Stock</th>
                                    <th className="pb-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {skuData?.map((item) => (
                                    <tr key={item.sku}>
                                        <td className="py-3 text-slate-500 font-mono">{item.sku}</td>
                                        <td className="py-3 font-bold text-slate-700">{item.name}</td>
                                        <td className="py-3 font-bold">{item.stock}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                                item.status === 'Critical' ? 'bg-rose-100 text-rose-700' : 
                                                item.status === 'Low' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
