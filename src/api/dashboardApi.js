let MOCK_METRICS = {
    gmv: 165000000,
    netSales: 135000000,
    profit: 55000000,
    soldItems: 1340,
    discountRate: 18,
    returnRate: 3,
};

const MOCK_CHART_DATA = [
    { name: 'Mon', sales: 4200 },
    { name: 'Tue', sales: 3100 },
    { name: 'Wed', sales: 2300 },
    { name: 'Thu', sales: 2980 },
    { name: 'Fri', sales: 2190 },
    { name: 'Sat', sales: 2590 },
    { name: 'Sun', sales: 3890 },
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
    await sleep(800);
    // Simulate a potential error
    if (Math.random() > 0.95) {
        throw new Error("Failed to fetch dashboard metrics.");
    }
    return MOCK_METRICS;
};

export const fetchSalesChartData = async () => {
    await sleep(1200);
    return MOCK_CHART_DATA;
};

export const fetchSkuData = async () => {
    await sleep(500);
    return MOCK_SKU_DATA;
};

export const updateDashboardMetrics = async (newData) => {
    await sleep(500);
    if (Math.random() > 0.98) {
        throw new Error("Failed to save metrics.");
    }
    MOCK_METRICS = { ...MOCK_METRICS, ...newData };
    return MOCK_METRICS;
};

// --- MEETING TOOLS API ---

let MOCK_MEETING_DATA = {
    date: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    attendance: [
        { role: 'Div E-Comm', present: false },
        { role: 'Div HCGA/Fin', present: false },
        { role: 'Div Live', present: false },
        { role: 'Div Sales', present: false },
        { role: 'Div Creative', present: false },
        { role: 'Div Prod', present: false },
        { role: 'Div Whs/Log', present: false },
        { role: 'Notulen', present: false },
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

export const fetchMeetingData = async () => {
    await sleep(600);
    return MOCK_MEETING_DATA;
};

export const saveMeetingData = async (data) => {
    await sleep(800);
    MOCK_MEETING_DATA = { ...data };
    return MOCK_MEETING_DATA;
};
