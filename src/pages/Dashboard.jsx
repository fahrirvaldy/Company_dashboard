import React, { useState } from 'react';
import { TrendingUp, Package, DollarSign, AlertCircle, Send } from 'lucide-react';
import Card from '../components/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const INITIAL_METRICS = {
    gmv: 150000000,
    netSales: 125000000,
    profit: 45000000,
    soldItems: 1240,
    discountRate: 15, // percent
    returnRate: 2, // percent
};

const SKU_DATA = [
    { sku: 'SKU-001', name: 'Premium Coffee Beans', stock: 120, status: 'Good' },
    { sku: 'SKU-002', name: 'Ceramic Mug Set', stock: 15, status: 'Low' },
    { sku: 'SKU-003', name: 'Coffee Grinder', stock: 5, status: 'Critical' },
    { sku: 'SKU-004', name: 'Filter Paper', stock: 500, status: 'Good' },
];

const CHART_DATA = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
];

const Dashboard = () => {
    const [metrics, setMetrics] = useState(INITIAL_METRICS);
    const [reportText, setReportText] = useState('');
    const [aiProcessing, setAiProcessing] = useState(false);
    const [aiMessage, setAiMessage] = useState('');

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
    };

    const handleAiReport = () => {
        if (!reportText) return;
        setAiProcessing(true);
        setAiMessage('');

        // SIMULATED AI PARSING LOGIC
        setTimeout(() => {
            let newMetrics = { ...metrics };
            let updates = [];

            // Simple regex matching for demo purposes
            // Detects: "sales 5000000" or "penjualan 5000000"
            const salesMatch = reportText.match(/(?:sales|penjualan)\s+(?:rp\.?)?\s*(\d+)/i);
            if (salesMatch) {
                const val = parseInt(salesMatch[1]);
                newMetrics.netSales = val;
                updates.push(`Net Sales updated to ${formatCurrency(val)}`);
            }

            // Detects "profit 2000000"
            const profitMatch = reportText.match(/(?:profit|laba|untung)\s+(?:rp\.?)?\s*(\d+)/i);
            if (profitMatch) {
                const val = parseInt(profitMatch[1]);
                newMetrics.profit = val;
                updates.push(`Profit updated to ${formatCurrency(val)}`);
            }

            // Detects "items 50" (Sold items)
            const itemsMatch = reportText.match(/(?:items|barang|terjual)\s+(\d+)/i);
            if (itemsMatch) {
                const val = parseInt(itemsMatch[1]);
                newMetrics.soldItems = val;
                updates.push(`Sold Items updated to ${val}`);
            }

            setMetrics(newMetrics);
            setAiProcessing(false);
            if (updates.length > 0) {
                setAiMessage(`✅ AI Successfully updated: ${updates.join(', ')}`);
            } else {
                setAiMessage("⚠️ AI couldn't extract specific data. Try format: 'Penjualan 5000000, Laba 1000000'");
            }
        }, 1500);
    };

    return (
        <div className="flex flex-col gap-md">
            <div className="flex justify-between items-center wrap-mobile">
                <h2 className="text-xl">Dashboard Overview</h2>
                <div className="text-sm text-muted">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>

            {/* AI Report Section */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #fff 0%, #FFF8F0 100%)', border: '1px solid #FFE4C4' }}>
                <h3 className="text-sm" style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>✨</span> AI Daily Reporter
                </h3>
                <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
                    Paste your daily text report here to auto-update the dashboard.
                    <br /><i>Try: "Laporan hari ini: Penjualan 150000000, Laba 50000000, Terjual 200 barang"</i>
                </p>
                <div className="flex gap-md wrap-mobile">
                    <input
                        type="text"
                        className="w-full"
                        placeholder="Type report here..."
                        value={reportText}
                        onChange={(e) => setReportText(e.target.value)}
                        style={{
                            padding: '0.75rem',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                            outline: 'none'
                        }}
                    />
                    <button
                        className="btn flex items-center gap-md"
                        onClick={handleAiReport}
                        disabled={aiProcessing}
                    >
                        {aiProcessing ? 'Analyzing...' : <><Send size={18} /> Process</>}
                    </button>
                </div>
                {aiMessage && <div className="text-sm" style={{ marginTop: '0.5rem', color: aiMessage.startsWith('✅') ? 'green' : 'orange' }}>{aiMessage}</div>}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-md">
                <Card
                    title="Gross Merchandise Value"
                    value={formatCurrency(metrics.gmv)}
                    trend={2.5}
                    icon={<DollarSign size={20} />}
                />
                <Card
                    title="Net Sales"
                    value={formatCurrency(metrics.netSales)}
                    trend={1.8}
                />
                <Card
                    title="Profit"
                    value={formatCurrency(metrics.profit)}
                    trend={5.2}
                    icon={<TrendingUp size={20} />}
                />
                <Card
                    title="Items Sold"
                    value={metrics.soldItems}
                    subtext="units today"
                    icon={<Package size={20} />}
                />
                <Card
                    title="Avg Discount"
                    value={`${metrics.discountRate}%`}
                    subtext="Target < 20%"
                />
                <Card
                    title="Return Rate"
                    value={`${metrics.returnRate}%`}
                    subtext="Target < 2%"
                />
            </div>

            <div className="grid grid-cols-2 gap-md wrap-mobile-col">
                {/* Chart Section */}
                <div className="card">
                    <h3 className="text-sm text-muted">Sales Trend (Weekly)</h3>
                    <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={CHART_DATA}>
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
                                {SKU_DATA.map((item) => (
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
