import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Chart from 'chart.js/auto';
import { fetchGrowthData, saveGrowthData } from '../api/dashboardApi';
import './GrowthSimulator.css';

const GrowthSimulator = () => {
    const queryClient = useQueryClient();
    const [currency, setCurrency] = useState('IDR');
    const [period, setPeriod] = useState('Bulan');
    const [globalGrowth, setGlobalGrowth] = useState(10);
    
    // API Data
    const { data: growthData, isLoading } = useQuery({
        queryKey: ['growthData'],
        queryFn: fetchGrowthData,
    });

    const mutation = useMutation({
        mutationFn: saveGrowthData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['growthData'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
        }
    });

    const [current, setCurrent] = useState({
        leads: 0, conv: 0, trans: 0, sale: 0, margin: 0,
    });
    
    const [target, setTarget] = useState({
        leads: 0, conv: 0, trans: 0, sale: 0, margin: 0,
    });
    
    const [metrics, setMetrics] = useState({
        marketing: 0, fixedCost: 0,
    });

    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize local state from API data
    useEffect(() => {
        if (growthData && !isInitialized) {
            setCurrent(growthData.current);
            setTarget(growthData.target);
            setMetrics(growthData.metrics);
            setIsInitialized(true);
        }
    }, [growthData, isInitialized]);

    const handleSave = () => {
        mutation.mutate({ current, target, metrics }, {
            onSuccess: () => alert('✅ Simulasi pertumbuhan berhasil disimpan!')
        });
    };

    // Chart Refs
    const comparisonChartRef = useRef(null);
    const waterfallChartRef = useRef(null);
    const comparisonChartInstance = useRef(null);
    const waterfallChartInstance = useRef(null);

    // Computed Values
    const results = useMemo(() => {
        const currentCustomers = Math.floor(current.leads * (current.conv / 100));
        const currentRevenue = currentCustomers * current.trans * current.sale;
        const currentProfit = currentRevenue * (current.margin / 100);

        const targetCustomers = Math.floor(target.leads * (target.conv / 100));
        const targetRevenue = targetCustomers * target.trans * target.sale;
        const targetProfit = targetRevenue * (target.margin / 100);

        let growth = 0;
        if (currentProfit > 0) {
            growth = ((targetProfit - currentProfit) / currentProfit) * 100;
        }

        return {
            current: { customers: currentCustomers, revenue: currentRevenue, profit: currentProfit },
            target: { customers: targetCustomers, revenue: targetRevenue, profit: targetProfit },
            growth
        };
    }, [current, target]);

    const healthMetrics = useMemo(() => {
        const { marketing, fixedCost } = metrics;
        const { current: cur } = results;

        let cac = cur.customers > 0 ? marketing / cur.customers : 0;
        let profitPerCust = cur.customers > 0 ? cur.profit / cur.customers : 0;
        let retentionMultiplier = period === 'Bulan' ? 12 : 1;
        let ltv = profitPerCust * retentionMultiplier;

        let bepRevenue = current.margin > 0 ? fixedCost / (current.margin / 100) : 0;
        let bepProgress = bepRevenue > 0 ? (cur.revenue / bepRevenue) * 100 : 0;

        return { cac, ltv, bepRevenue, bepProgress };
    }, [metrics, results, current.margin, period]);

    // Formatters
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('id-ID').format(value);
    };

    // Handlers
    const handleInputChange = (section, field, value) => {
        const val = parseFloat(value) || 0;
        if (section === 'current') {
            setCurrent(prev => ({ ...prev, [field]: val }));
        } else if (section === 'target') {
            setTarget(prev => ({ ...prev, [field]: val }));
        } else if (section === 'metrics') {
            setMetrics(prev => ({ ...prev, [field]: val }));
        }
    };

    const applyGlobalGrowth = () => {
        const multiplier = 1 + globalGrowth / 100;
        setTarget({
            leads: Math.round(current.leads * multiplier),
            conv: parseFloat((current.conv * multiplier).toFixed(2)),
            trans: parseFloat((current.trans * multiplier).toFixed(2)),
            sale: Math.round(current.sale * multiplier),
            margin: parseFloat((current.margin * multiplier).toFixed(2)),
        });
    };

    // Charts Initialization & Update
    useEffect(() => {
        if (comparisonChartRef.current) {
            const ctx = comparisonChartRef.current.getContext('2d');
            comparisonChartInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Saat Ini', 'Target Simulasi'],
                    datasets: [{
                        label: 'Net Profit',
                        data: [results.current.profit, results.target.profit],
                        backgroundColor: ['#94A3B8', '#10B981'],
                        borderRadius: 8,
                        barPercentage: 0.6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => formatCurrency(context.raw)
                            }
                        }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { display: false } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        if (waterfallChartRef.current) {
            const ctx = waterfallChartRef.current.getContext('2d');
            waterfallChartInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Awal', '+ Leads', '+ Conv', '+ Trans', '+ Harga', '+ Margin', 'Akhir'],
                    datasets: [{
                        label: 'Kontribusi',
                        data: [], 
                        backgroundColor: (ctx) => {
                            const val = ctx.raw;
                            if (!val) return '#94A3B8';
                            const index = ctx.dataIndex;
                            if (index === 0 || index === 6) return '#64748B';
                            return (val[1] >= val[0]) ? '#10B981' : '#EF4444';
                        },
                        borderRadius: 4,
                        barPercentage: 0.8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const raw = context.raw;
                                    const diff = raw[1] - raw[0];
                                    return `Impact: ${formatCurrency(diff)}`;
                                }
                            }
                        }
                    },
                    scales: { y: { beginAtZero: true } }
                }
            });
        }

        return () => {
            if (comparisonChartInstance.current) comparisonChartInstance.current.destroy();
            if (waterfallChartInstance.current) waterfallChartInstance.current.destroy();
        };
    }, []);

    useEffect(() => {
        if (comparisonChartInstance.current) {
            comparisonChartInstance.current.data.datasets[0].data = [results.current.profit, results.target.profit];
            comparisonChartInstance.current.update();
        }

        if (waterfallChartInstance.current) {
            const base = results.current.profit;
            const calcProfit = (l, c, t, s, m) => Math.floor(l * (c / 100)) * t * s * (m / 100);

            const p_leads = calcProfit(target.leads, current.conv, current.trans, current.sale, current.margin);
            const p_conv = calcProfit(target.leads, target.conv, current.trans, current.sale, current.margin);
            const p_trans = calcProfit(target.leads, target.conv, target.trans, current.sale, current.margin);
            const p_sale = calcProfit(target.leads, target.conv, target.trans, target.sale, current.margin);
            const p_final = results.target.profit;

            const waterfallData = [
                [0, base],
                [base, p_leads],
                [p_leads, p_conv],
                [p_conv, p_trans],
                [p_trans, p_sale],
                [p_sale, p_final],
                [0, p_final]
            ];

            waterfallChartInstance.current.data.datasets[0].data = waterfallData;
            waterfallChartInstance.current.update();
        }
    }, [results, current, target]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen text-emerald-600 font-bold">Loading Simulator Data...</div>;
    }

    return (
        <div className="growth-simulator-container min-h-screen pb-12 bg-gray-50">
            <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                <span className="text-brand-500">Growth</span> Simulator
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Simulator Pertumbuhan Bisnis & Profit Framework 5 Ways</p>
                        </div>
                        <button 
                            onClick={handleSave} 
                            disabled={mutation.isPending}
                            className={`ml-4 px-4 py-2 rounded-lg text-sm font-bold transition-all ${mutation.isPending ? 'bg-gray-200 text-gray-500' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md active:scale-95'}`}
                        >
                            {mutation.isPending ? '⏳ Menyimpan...' : '💾 Simpan Simulasi'}
                        </button>
                    </div>
                    <div className="flex items-center space-x-3">
                        <select 
                            value={currency} 
                            onChange={(e) => setCurrency(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2"
                        >
                            <option value="IDR">IDR (Rp)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                        </select>
                        <select 
                            value={period} 
                            onChange={(e) => setPeriod(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2"
                        >
                            <option value="Bulan">Bulanan</option>
                            <option value="Tahun">Tahunan</option>
                            <option value="Minggu">Mingguan</option>
                        </select>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Cek Kesehatan Bisnis Anda</h2>
                    <p className="text-slate-600 max-w-3xl">
                        Gunakan simulator ini untuk melihat bagaimana perubahan kecil pada 5 kunci utama bisnis dapat melipatgandakan keuntungan Anda secara eksponensial. Masukkan data saat ini di kiri, dan mainkan simulasi target di kanan.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="card-simulator p-6 border-l-4 border-emerald-500 bg-gradient-to-r from-white to-emerald-50">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">🚀 Target Pertumbuhan Global</h3>
                                    <p className="text-sm text-slate-500">Naikkan semua metrik target secara serentak.</p>
                                </div>
                                <div className="flex items-center space-x-2 w-full sm:w-auto">
                                    <input 
                                        type="number" 
                                        value={globalGrowth} 
                                        onChange={(e) => setGlobalGrowth(parseFloat(e.target.value) || 0)}
                                        className="input-field-sim w-20 text-center font-bold text-brand-600" 
                                    />
                                    <span className="text-slate-500 font-bold">%</span>
                                    <button 
                                        onClick={applyGlobalGrowth}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-all active:scale-95 text-sm whitespace-nowrap"
                                    >
                                        Terapkan ke Semua
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="card-simulator overflow-hidden">
                            <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-100 py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <div className="col-span-5 sm:col-span-4">Metrik Bisnis</div>
                                <div className="col-span-3 sm:col-span-4 text-right pr-2">Kondisi Sekarang</div>
                                <div className="col-span-4 text-right pr-2">Target Simulasi</div>
                            </div>

                            {/* Leads */}
                            <div className="grid grid-cols-12 items-center py-4 px-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <div className="col-span-5 sm:col-span-4 pr-2">
                                    <label className="block text-sm font-semibold text-slate-700">Jumlah Prospek (Leads)</label>
                                    <p className="helper-text-sim hidden sm:block">Calon pelanggan yang menghubungi/mampir.</p>
                                </div>
                                <div className="col-span-3 sm:col-span-4 px-1">
                                    <input type="number" value={current.leads} onChange={(e) => handleInputChange('current', 'leads', e.target.value)} className="input-field-sim text-right" />
                                </div>
                                <div className="col-span-4 px-1">
                                    <input type="number" value={target.leads} onChange={(e) => handleInputChange('target', 'leads', e.target.value)} className="input-field-sim text-right border-emerald-200 bg-emerald-50 focus:bg-white text-emerald-700 font-bold" />
                                </div>
                            </div>

                            {/* Operator x */}
                            <div className="flex justify-center -my-3 relative z-10"><span className="bg-white px-2 text-xs text-slate-400 font-bold">x</span></div>

                            {/* Conv Rate */}
                            <div className="grid grid-cols-12 items-center py-4 px-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <div className="col-span-5 sm:col-span-4 pr-2">
                                    <label className="block text-sm font-semibold text-slate-700">Persentase Deal (%)</label>
                                    <p className="helper-text-sim hidden sm:block">Dari prospek, berapa % yang jadi beli?</p>
                                </div>
                                <div className="col-span-3 sm:col-span-4 px-1">
                                    <div className="relative">
                                        <input type="number" value={current.conv} onChange={(e) => handleInputChange('current', 'conv', e.target.value)} className="input-field-sim text-right pr-8" />
                                        <span className="absolute right-3 top-2.5 text-slate-400 text-sm">%</span>
                                    </div>
                                </div>
                                <div className="col-span-4 px-1">
                                    <div className="relative">
                                        <input type="number" value={target.conv} onChange={(e) => handleInputChange('target', 'conv', e.target.value)} className="input-field-sim text-right pr-8 border-emerald-200 bg-emerald-50 focus:bg-white text-emerald-700 font-bold" />
                                        <span className="absolute right-3 top-2.5 text-emerald-400 text-sm">%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customers Result */}
                            <div className="grid grid-cols-12 items-center py-3 px-4 bg-slate-50 border-y border-slate-100">
                                <div className="col-span-5 sm:col-span-4">
                                    <span className="block text-sm font-bold text-slate-800">= Pelanggan (Customers)</span>
                                </div>
                                <div className="col-span-3 sm:col-span-4 text-right px-2">
                                    <span className="text-slate-600 font-mono font-bold">{formatNumber(results.current.customers)}</span>
                                </div>
                                <div className="col-span-4 text-right px-2">
                                    <span className="text-emerald-600 font-mono font-bold">{formatNumber(results.target.customers)}</span>
                                </div>
                            </div>

                            {/* Transactions */}
                            <div className="grid grid-cols-12 items-center py-4 px-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <div className="col-span-5 sm:col-span-4 pr-2">
                                    <label className="block text-sm font-semibold text-slate-700">Frekuensi Transaksi</label>
                                    <p className="helper-text-sim hidden sm:block">Rata-rata berapa kali beli per periode?</p>
                                </div>
                                <div className="col-span-3 sm:col-span-4 px-1">
                                    <input type="number" value={current.trans} onChange={(e) => handleInputChange('current', 'trans', e.target.value)} className="input-field-sim text-right" />
                                </div>
                                <div className="col-span-4 px-1">
                                    <input type="number" value={target.trans} onChange={(e) => handleInputChange('target', 'trans', e.target.value)} className="input-field-sim text-right border-emerald-200 bg-emerald-50 focus:bg-white text-emerald-700 font-bold" />
                                </div>
                            </div>

                            <div className="flex justify-center -my-3 relative z-10"><span className="bg-white px-2 text-xs text-slate-400 font-bold">x</span></div>

                            {/* Avg Sale */}
                            <div className="grid grid-cols-12 items-center py-4 px-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <div className="col-span-5 sm:col-span-4 pr-2">
                                    <label className="block text-sm font-semibold text-slate-700">Rata-rata Penjualan</label>
                                    <p className="helper-text-sim hidden sm:block">Nilai rupiah sekali belanja.</p>
                                </div>
                                <div className="col-span-3 sm:col-span-4 px-1">
                                    <input type="number" value={current.sale} onChange={(e) => handleInputChange('current', 'sale', e.target.value)} className="input-field-sim text-right" />
                                </div>
                                <div className="col-span-4 px-1">
                                    <input type="number" value={target.sale} onChange={(e) => handleInputChange('target', 'sale', e.target.value)} className="input-field-sim text-right border-emerald-200 bg-emerald-50 focus:bg-white text-emerald-700 font-bold" />
                                </div>
                            </div>

                            {/* Revenue Result */}
                            <div className="grid grid-cols-12 items-center py-3 px-4 bg-slate-50 border-y border-slate-100">
                                <div className="col-span-5 sm:col-span-4">
                                    <span className="block text-sm font-bold text-slate-800">= Omzet (Revenue)</span>
                                </div>
                                <div className="col-span-3 sm:col-span-4 text-right px-2">
                                    <span className="text-slate-600 font-mono font-bold text-xs sm:text-sm">{formatCurrency(results.current.revenue)}</span>
                                </div>
                                <div className="col-span-4 text-right px-2">
                                    <span className="text-emerald-600 font-mono font-bold text-xs sm:text-sm">{formatCurrency(results.target.revenue)}</span>
                                </div>
                            </div>

                            {/* Margin */}
                            <div className="grid grid-cols-12 items-center py-4 px-4 hover:bg-slate-50 transition-colors">
                                <div className="col-span-5 sm:col-span-4 pr-2">
                                    <label className="block text-sm font-semibold text-slate-700">Margin Profit (%)</label>
                                    <p className="helper-text-sim hidden sm:block">Persentase keuntungan bersih.</p>
                                </div>
                                <div className="col-span-3 sm:col-span-4 px-1">
                                    <div className="relative">
                                        <input type="number" value={current.margin} onChange={(e) => handleInputChange('current', 'margin', e.target.value)} className="input-field-sim text-right pr-8" />
                                        <span className="absolute right-3 top-2.5 text-slate-400 text-sm">%</span>
                                    </div>
                                </div>
                                <div className="col-span-4 px-1">
                                    <div className="relative">
                                        <input type="number" value={target.margin} onChange={(e) => handleInputChange('target', 'margin', e.target.value)} className="input-field-sim text-right pr-8 border-emerald-200 bg-emerald-50 focus:bg-white text-emerald-700 font-bold" />
                                        <span className="absolute right-3 top-2.5 text-emerald-400 text-sm">%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Profit Result */}
                            <div className="grid grid-cols-12 items-center py-6 px-4 bg-slate-900 text-white rounded-b-xl shadow-inner">
                                <div className="col-span-12 sm:col-span-4 mb-2 sm:mb-0">
                                    <span className="block text-lg font-display font-bold text-emerald-400">= NET PROFIT</span>
                                    <span className="text-xs text-slate-400">Keuntungan Bersih Bisnis</span>
                                </div>
                                <div className="col-span-6 sm:col-span-4 text-right px-2 border-r border-slate-700 sm:border-r-0 sm:border-r border-slate-700">
                                    <p className="text-xs text-slate-400 mb-1">Saat Ini</p>
                                    <span className="block text-lg sm:text-xl font-mono font-bold">{formatCurrency(results.current.profit)}</span>
                                </div>
                                <div className="col-span-6 sm:col-span-4 text-right px-2">
                                    <p className="text-xs text-emerald-400 mb-1">Target Simulasi</p>
                                    <span className="block text-lg sm:text-xl font-mono font-bold text-emerald-400">{formatCurrency(results.target.profit)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="card-simulator p-6">
                            <h3 className="font-display font-bold text-slate-800 mb-4 flex items-center">
                                <span className="text-xl mr-2">⚙️</span> Analisis Biaya (Opsional)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Budget Marketing</label>
                                    <p className="helper-text-sim mb-2">Total biaya iklan periode ini.</p>
                                    <input type="number" value={metrics.marketing} onChange={(e) => handleInputChange('metrics', 'marketing', e.target.value)} className="input-field-sim" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Fixed Cost (Biaya Tetap)</label>
                                    <p className="helper-text-sim mb-2">Gaji, Sewa, Operasional.</p>
                                    <input type="number" value={metrics.fixedCost} onChange={(e) => handleInputChange('metrics', 'fixedCost', e.target.value)} className="input-field-sim" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <div className="card-simulator p-6">
                            <h3 className="font-display font-bold text-slate-800 mb-2">Potensi Kenaikan Profit</h3>
                            <p className="text-sm text-slate-500 mb-4">Perbandingan visual profit Saat Ini vs Target.</p>
                            <div className="chart-container-sim">
                                <canvas ref={comparisonChartRef}></canvas>
                            </div>
                            <div className="mt-4 text-center">
                                <span className="text-sm text-slate-500">Pertumbuhan: </span>
                                <span className={`text-2xl font-bold ${results.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {results.growth > 0 ? '+' : ''}{results.growth.toFixed(1)}%
                                </span>
                            </div>
                        </div>

                        <div className="card-simulator p-6">
                            <h3 className="font-display font-bold text-slate-800 mb-2">Kontribusi Kenaikan</h3>
                            <p className="text-sm text-slate-500 mb-4">Faktor apa yang paling berdampak?</p>
                            <div className="chart-container-sim">
                                <canvas ref={waterfallChartRef}></canvas>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className={`card-simulator p-5 border-l-4 ${healthMetrics.ltv > 3 * healthMetrics.cac ? 'border-emerald-500' : (healthMetrics.ltv > healthMetrics.cac ? 'border-yellow-500' : 'border-red-500')}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-700 text-sm">Efisiensi Marketing</h4>
                                    <span className={`text-xs px-2 py-1 rounded font-medium ${healthMetrics.ltv > 3 * healthMetrics.cac ? 'bg-emerald-100 text-emerald-700' : (healthMetrics.ltv > healthMetrics.cac ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')}`}>
                                        {healthMetrics.ltv > 3 * healthMetrics.cac ? 'Sehat (Efficient)' : (healthMetrics.ltv > healthMetrics.cac ? 'Waspada' : 'Berbahaya')}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                        <p className="text-xs text-slate-500">CAC (Biaya Akuisisi)</p>
                                        <p className="font-bold text-slate-800">{formatCurrency(healthMetrics.cac)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">LTV (Nilai Pelanggan)</p>
                                        <p className="font-bold text-slate-800">{formatCurrency(healthMetrics.ltv)}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 italic">*Idealnya LTV &gt; 3x CAC</p>
                            </div>

                            <div className={`card-simulator p-5 border-l-4 ${healthMetrics.bepProgress >= 100 ? 'border-emerald-500' : 'border-red-500'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-700 text-sm">Titik Impas (BEP)</h4>
                                    <span className={`text-xs px-2 py-1 rounded font-medium ${healthMetrics.bepProgress >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {healthMetrics.bepProgress >= 100 ? 'Profitable' : 'Loss'}
                                    </span>
                                </div>
                                <div className="mt-2">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-500">Omzet Saat Ini</span>
                                        <span className="text-slate-500">Target BEP</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
                                        <div 
                                            className={`h-2.5 rounded-full ${healthMetrics.bepProgress >= 100 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                                            style={{ width: `${Math.min(healthMetrics.bepProgress, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-slate-600">
                                        Butuh Omzet <span className="font-bold">{formatCurrency(healthMetrics.bepRevenue)}</span> untuk balik modal.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GrowthSimulator;
