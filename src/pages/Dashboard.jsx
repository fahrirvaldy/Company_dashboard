import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingUp, Package, DollarSign, AlertCircle, Send, Edit } from 'lucide-react';
import Card from '../components/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchDashboardMetrics, fetchSalesChartData, fetchSkuData, updateDashboardMetrics } from '../api/dashboardApi';

const Dashboard = () => {
    const queryClient = useQueryClient();
    const [reportText, setReportText] = useState('');
    const [aiMessage, setAiMessage] = useState('');
    const [manualInputs, setManualInputs] = useState({ gmv: '', profit: '' });

    const { data: metrics, isLoading: isLoadingMetrics, isError: isErrorMetrics } = useQuery({
        queryKey: ['dashboardMetrics'],
        queryFn: fetchDashboardMetrics,
    });

    const { data: chartData, isLoading: isLoadingChart, isError: isErrorChart } = useQuery({
        queryKey: ['salesChartData'],
        queryFn: fetchSalesChartData,
    });

    const { data: skuData, isLoading: isLoadingSku, isError: isErrorSku } = useQuery({
        queryKey: ['skuData'],
        queryFn: fetchSkuData,
    });
    
    const updateMetricsMutation = useMutation({
        mutationFn: updateDashboardMetrics,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
        },
        onError: (error) => {
            setAiMessage(`❌ Gagal menyimpan: ${error.message}`);
        }
    });

    const formatCurrency = (val) => {
        if (typeof val !== 'number') return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
    };

    const handleAiReport = () => {
        if (!reportText) return;
        setAiMessage('');

        let updates = {};
        const salesMatch = reportText.match(/(?:sales|penjualan)\s+(?:rp\.?)?\s*(\d+)/i);
        if (salesMatch) updates.netSales = parseInt(salesMatch[1]);

        const profitMatch = reportText.match(/(?:profit|laba|untung)\s+(?:rp\.?)?\s*(\d+)/i);
        if (profitMatch) updates.profit = parseInt(profitMatch[1]);
        
        if (Object.keys(updates).length > 0) {
            updateMetricsMutation.mutate(updates, {
                onSuccess: () => setAiMessage('✅ AI successfully updated metrics!'),
            });
        } else {
            setAiMessage("⚠️ AI couldn't extract specific data.");
        }
    };

    const handleManualUpdate = () => {
        const newMetrics = {};
        if (manualInputs.gmv) newMetrics.gmv = parseFloat(manualInputs.gmv);
        if (manualInputs.profit) newMetrics.profit = parseFloat(manualInputs.profit);

        if (Object.keys(newMetrics).length > 0) {
            updateMetricsMutation.mutate(newMetrics, {
                onSuccess: () => setManualInputs({ gmv: '', profit: '' }),
            });
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setManualInputs(prev => ({ ...prev, [name]: value }));
    };

    if (isLoadingMetrics || isLoadingChart || isLoadingSku) {
        return <div className="flex justify-center items-center h-full">Loading dashboard...</div>;
    }

    if (isErrorMetrics || isErrorChart || isErrorSku) {
        return <div className="flex justify-center items-center h-full text-red-500">Error fetching dashboard data.</div>;
    }

    return (
        <div className="flex flex-col gap-md">
            <div className="flex justify-between items-center wrap-mobile">
                <h2 className="text-xl">Dashboard Overview</h2>
                <div className="text-sm text-muted">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-md wrap-mobile-col">
                {/* AI Report Section */}
                <div className="card" style={{ background: 'linear-gradient(135deg, #fff 0%, #FFF8F0 100%)', border: '1px solid #FFE4C4' }}>
                    <h3 className="text-sm" style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>✨</span> AI Daily Reporter
                    </h3>
                    <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
                        Try: "Laporan hari ini: Penjualan 150jt, Laba 50jt"
                    </p>
                    <div className="flex gap-md wrap-mobile">
                        <input
                            type="text"
                            className="w-full"
                            placeholder="Paste report to auto-update..."
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                            style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                        />
                        <button className="btn flex items-center gap-md" onClick={handleAiReport} disabled={updateMetricsMutation.isPending}>
                            {updateMetricsMutation.isPending ? 'Analyzing...' : <><Send size={18} /> Process</>}
                        </button>
                    </div>
                    {aiMessage && <div className="text-sm" style={{ marginTop: '0.5rem', color: aiMessage.startsWith('✅') ? 'green' : aiMessage.startsWith('❌') ? 'red' : 'orange' }}>{aiMessage}</div>}
                </div>

                {/* Manual Update Section */}
                <div className="card">
                     <h3 className="text-sm flex items-center gap-sm" style={{ color: 'var(--color-primary)'}}>
                        <Edit size={16} /> Manual Data Input
                    </h3>
                    <div className="grid grid-cols-2 gap-md" style={{ marginTop: '1rem' }}>
                         <div>
                            <label className="text-sm text-muted">New GMV</label>
                            <input
                                type="number"
                                name="gmv"
                                className="w-full"
                                placeholder={formatCurrency(metrics?.gmv)}
                                value={manualInputs.gmv}
                                onChange={handleInputChange}
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', marginTop: '4px' }}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted">New Profit</label>
                            <input
                                type="number"
                                name="profit"
                                className="w-full"
                                placeholder={formatCurrency(metrics?.profit)}
                                value={manualInputs.profit}
                                onChange={handleInputChange}
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', marginTop: '4px' }}
                            />
                        </div>
                    </div>
                    <button onClick={handleManualUpdate} disabled={updateMetricsMutation.isPending} className="btn w-full" style={{marginTop: '1rem'}}>
                        {updateMetricsMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                    {updateMetricsMutation.isError && <div className="text-sm text-red-500" style={{marginTop: '0.5rem'}}>Error: {updateMetricsMutation.error.message}</div>}
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-md">
                <Card title="Gross Merchandise Value" value={formatCurrency(metrics?.gmv)} trend={2.5} icon={<DollarSign size={20} />} />
                <Card title="Net Sales" value={formatCurrency(metrics?.netSales)} trend={1.8} />
                <Card title="Profit" value={formatCurrency(metrics?.profit)} trend={5.2} icon={<TrendingUp size={20} />} />
                <Card title="Items Sold" value={metrics?.soldItems || 0} subtext="units today" icon={<Package size={20} />} />
                <Card title="Avg Discount" value={`${metrics?.discountRate || 0}%`} subtext="Target < 20%" />
                <Card title="Return Rate" value={`${metrics?.returnRate || 0}%`} subtext="Target < 2%" />
            </div>

            <div className="grid grid-cols-2 gap-md wrap-mobile-col">
                {/* Chart Section */}
                <div className="card">
                    <h3 className="text-sm text-muted">Sales Trend (Weekly)</h3>
                    <div style={{ height: '400px', width: '100%', marginTop: '1rem' }}>
                        {chartData && chartData.length > 0 && (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Stock Monitor */}
                <div className="card">
                    <h3 className="text-sm text-muted">Low Stock Alert</h3>
                    <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <th style={{ padding: '0.5rem' }}>SKU</th>
                                    <th style={{ padding: '0.5rem' }}>Item</th>
                                    <th style={{ padding: '0.5rem' }}>Stock</th>
                                    <th style={{ padding: '0.5rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {skuData?.map((item) => (
                                    <tr key={item.sku} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.875rem' }}>{item.sku}</td>
                                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{item.name}</td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>{item.stock}</td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '99px',
                                                fontSize: '0.75rem',
                                                background: item.status === 'Critical' ? '#FED7D7' : item.status === 'Low' ? '#FEEBC8' : '#C6F6D5',
                                                color: item.status === 'Critical' ? '#9B2C2C' : item.status === 'Low' ? '#9C4221' : '#276749'
                                            }}>
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
