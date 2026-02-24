// Hardened Ecosystem API with Validation and Sync
const STORAGE_KEY = 'Aksana_Ecosystem_Data';

const getStoredData = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.error("Critical: Storage Parse Failure", e);
        return null;
    }
};

const setStoredData = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        // Trigger a custom event for cross-tab or cross-component sync
        window.dispatchEvent(new Event('ecosystem_sync'));
    } catch (e) {
        console.error("Critical: Storage Save Failure", e);
    }
};

const DEFAULT_ECOSYSTEM_STATE = {
    metrics: {
        gmv: 165000000,
        netSales: 135000000,
        profit: 55000000,
        soldItems: 1340,
        discountRate: 18,
        returnRate: 3,
    },
    meeting: {
        date: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        attendance: [
            { role: 'Div E-Comm', present: true },
            { role: 'Div HCGA/Fin', present: true },
            { role: 'Div Live', present: true },
            { role: 'Div Sales', present: true },
            { role: 'Div Creative', present: true },
            { role: 'Div Prod', present: true },
            { role: 'Div Whs/Log', present: true },
            { role: 'Notulen', present: true },
        ],
        goodNewsBusiness: '',
        goodNewsPersonal: '',
        ecommTable: [{ kpi: 'Total Omset', target: 'Rp 285 Jt', realisasi: '...', status: 'on' }],
        hcgaTable: [{ kpi: 'Kesehatan Keuangan', target: 'Positif', realisasi: '...', status: 'on' }],
        liveTable: [{ kpi: 'Total Omset Live', target: 'Rp 30 Jt', realisasi: '...', status: 'on' }],
        salesTable: [{ kpi: 'Respon Chat', target: '> 80%', realisasi: '...', status: 'on' }],
        creativeTable: [{ kpi: 'Konsistensi Posting', target: '100/mgg', realisasi: '...', status: 'on' }],
        prodTable: [{ kpi: 'Kualitas (Reject)', target: '< 0.5%', realisasi: '...', status: 'on' }],
        warehouseTable: [{ kpi: 'SL Pengiriman', target: '100%', realisasi: '...', status: 'on' }],
        rocksTable: [{ owner: 'CEO', goal: 'Launch Dashboard Ecosystem', status: 'on' }],
        todoTable: [{ task: 'Final UI/UX Fidelity Check', owner: 'Dev', status: 'not' }],
        idtIssues: [],
        discussionNotes: '',
        actionItems: '',
        customerHeadlines: '',
        internalHeadlines: '',
        ratings: { ecomm: 0, hcga: 0, live: 0, sales: 0, creative: 0, prod: 0, warehouse: 0 }
    },
    simulator: {
        current: { leads: 1000, conv: 10, trans: 2, sale: 100000, margin: 25 },
        target: { leads: 1100, conv: 11, trans: 2.2, sale: 110000, margin: 27.5 },
        costs: { marketing: 5000000, fixedCost: 15000000 }
    },
    chartData: [
        { name: 'Mon', sales: 120000000 },
        { name: 'Tue', sales: 110000000 },
        { name: 'Wed', sales: 135000000 },
        { name: 'Thu', sales: 125000000 },
        { name: 'Fri', sales: 140000000 },
        { name: 'Sat', sales: 155000000 },
        { name: 'Sun', sales: 135000000 },
    ],
    skuData: [
        { sku: 'SKU-001', name: 'Premium Coffee Bean 500g', stock: 120, status: 'Good' },
        { sku: 'SKU-002', name: 'Ceramic Mug Set (4pcs)', stock: 15, status: 'Low' },
        { sku: 'SKU-003', name: 'Electric Coffee Grinder', stock: 5, status: 'Critical' },
        { sku: 'SKU-004', name: 'Paper Filter V60 (100pcs)', stock: 500, status: 'Good' },
    ]
};

// Initialize if empty
if (!getStoredData()) setStoredData(DEFAULT_ECOSYSTEM_STATE);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchDashboardMetrics = async () => {
    await sleep(150);
    return getStoredData().metrics;
};

export const updateDashboardMetrics = async (newMetrics) => {
    await sleep(150);
    const data = getStoredData();
    // Sanitize and Merge
    Object.keys(newMetrics).forEach(key => {
        const val = parseFloat(newMetrics[key]);
        if (!isNaN(val)) data.metrics[key] = val;
    });
    
    // Auto-update chart if netSales changes
    if (newMetrics.netSales) {
        data.chartData[data.chartData.length - 1].sales = parseFloat(newMetrics.netSales);
    }
    
    setStoredData(data);
    return data.metrics;
};

export const fetchSalesChartData = async () => {
    await sleep(200);
    return getStoredData().chartData;
};

export const fetchSkuData = async () => {
    await sleep(100);
    return getStoredData().skuData;
};

export const fetchMeetingData = async () => {
    await sleep(150);
    return getStoredData().meeting;
};

export const saveMeetingData = async (newMeetingData) => {
    await sleep(300);
    const data = getStoredData();
    data.meeting = newMeetingData;
    setStoredData(data);
    return data.meeting;
};

export const fetchGrowthData = async () => {
    await sleep(150);
    return getStoredData().simulator;
};

export const saveGrowthData = async (newSimData) => {
    await sleep(300);
    const data = getStoredData();
    data.simulator = newSimData;
    
    // Structural Sync: Simulator results impact Dashboard Profit
    const c = newSimData.current;
    const calculatedProfit = Math.round(Math.floor(c.leads * (c.conv / 100)) * c.trans * c.sale * (c.margin / 100));
    data.metrics.profit = calculatedProfit;
    
    setStoredData(data);
    return data.simulator;
};

export const resetSystem = async () => {
    if (window.confirm("This will permanently reset all business data to factory defaults. Continue?")) {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
    }
};
