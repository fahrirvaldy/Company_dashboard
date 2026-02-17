// Helper for LocalStorage Persistence
const STORAGE_KEY_PREFIX = 'Angkasa_Dashboard_';

const getStoredData = (key, defaultValue) => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (saved) return JSON.parse(saved);
    return defaultValue;
};

const setStoredData = (key, data) => {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
};

// Initial MOCK Data
const DEFAULT_METRICS = {
    gmv: 165000000,
    netSales: 135000000,
    profit: 55000000,
    soldItems: 1340,
    discountRate: 18,
    returnRate: 3,
};

const DEFAULT_MEETING_DATA = {
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
    ecommTable: [
        { kpi: 'Total Omset (5 Brand)', target: 'Rp 285 Jt', realisasi: '...', status: 'on' },
        { kpi: 'Rata-rata ROAS', target: '> 10x', realisasi: '...', status: 'on' },
    ],
    hcgaTable: [
        { kpi: 'Kesehatan Keuangan', target: 'Positif', realisasi: '...', status: 'on' },
        { kpi: 'Pemenuhan Manpower', target: '100%', realisasi: '...', status: 'on' },
    ],
    liveTable: [
        { kpi: 'Total Omset Live', target: 'Rp 30 Jt', realisasi: '...', status: 'on' },
        { kpi: 'Durasi Live', target: '100 Jam', realisasi: '...', status: 'on' },
    ],
    salesTable: [
        { kpi: 'Sales WAB', target: 'Rp 8 Jt', realisasi: '...', status: 'on' },
        { kpi: 'Respon Chat', target: '> 80%', realisasi: '...', status: 'on' },
    ],
    creativeTable: [
        { kpi: 'Konsistensi Posting', target: '100/mgg', realisasi: '...', status: 'on' },
        { kpi: 'Produksi Aset Baru', target: '10 SKU', realisasi: '...', status: 'on' },
    ],
    prodTable: [
        { kpi: 'Total Produksi', target: '1000 Set', realisasi: '...', status: 'on' },
        { kpi: 'Kualitas (Reject)', target: '< 0.5%', realisasi: '...', status: 'on' },
    ],
    warehouseTable: [
        { kpi: 'Akurasi Inventory', target: '100%', realisasi: '...', status: 'on' },
        { kpi: 'SL Pengiriman', target: '100%', realisasi: '...', status: 'on' },
    ],
    rocksTable: [
        { owner: 'CEO', goal: 'Launch Produk Baru', status: 'on' },
    ],
    todoTable: [
        { task: 'Follow up Vendor A', owner: 'Div Prod', status: 'not' },
    ],
    idtIssues: [],
    discussionNotes: '',
    actionItems: '',
    customerHeadlines: '',
    internalHeadlines: '',
    ratings: {
        ecomm: 0,
        hcga: 0,
        live: 0,
        sales: 0,
        creative: 0,
        prod: 0,
        warehouse: 0
    }
};

const DEFAULT_GROWTH_DATA = {
    current: {
        leads: 1000,
        conv: 10,
        trans: 2,
        sale: 100000,
        margin: 25,
    },
    target: {
        leads: 1100,
        conv: 11,
        trans: 2.2,
        sale: 110000,
        margin: 27.5,
    },
    metrics: {
        marketing: 5000000,
        fixedCost: 15000000,
    }
};

const MOCK_CHART_DATA = [
    { name: 'Mon', sales: 120000000 },
    { name: 'Tue', sales: 110000000 },
    { name: 'Wed', sales: 135000000 },
    { name: 'Thu', sales: 125000000 },
    { name: 'Fri', sales: 140000000 },
    { name: 'Sat', sales: 155000000 },
    { name: 'Sun', sales: 135000000 },
];

const MOCK_SKU_DATA = [
    { sku: 'SKU-001', name: 'Premium Coffee Beans', stock: 120, status: 'Good' },
    { sku: 'SKU-002', name: 'Ceramic Mug Set', stock: 15, status: 'Low' },
    { sku: 'SKU-003', name: 'Coffee Grinder', stock: 5, status: 'Critical' },
    { sku: 'SKU-004', name: 'Filter Paper', stock: 500, status: 'Good' },
];

// Simulate API delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchDashboardMetrics = async () => {
    await sleep(400);
    return getStoredData('metrics', DEFAULT_METRICS);
};

export const fetchSalesChartData = async () => {
    await sleep(500);
    return getStoredData('chartData', MOCK_CHART_DATA);
};

export const fetchSkuData = async () => {
    await sleep(300);
    return getStoredData('skuData', MOCK_SKU_DATA);
};

export const updateDashboardMetrics = async (newData) => {
    await sleep(300);
    const current = getStoredData('metrics', DEFAULT_METRICS);
    const merged = { ...current, ...newData };
    setStoredData('metrics', merged);
    
    // Update chart data if netSales changed (simulating real-time update)
    if (newData.netSales) {
        const chart = getStoredData('chartData', MOCK_CHART_DATA);
        // Update the last day's value
        chart[chart.length - 1].sales = newData.netSales;
        setStoredData('chartData', chart);
    }
    
    return merged;
};

export const fetchMeetingData = async () => {
    await sleep(400);
    return getStoredData('meeting', DEFAULT_MEETING_DATA);
};

export const saveMeetingData = async (data) => {
    await sleep(400);
    setStoredData('meeting', data);
    return data;
};

export const fetchGrowthData = async () => {
    await sleep(400);
    return getStoredData('growth', DEFAULT_GROWTH_DATA);
};

export const saveGrowthData = async (data) => {
    await sleep(400);
    setStoredData('growth', data);
    
    // Auto-sync dashboard profit
    const currentProfit = (data.current.leads * (data.current.conv / 100)) * data.current.trans * data.current.sale * (data.current.margin / 100);
    const metrics = getStoredData('metrics', DEFAULT_METRICS);
    metrics.profit = currentProfit;
    setStoredData('metrics', metrics);
    
    return data;
};
