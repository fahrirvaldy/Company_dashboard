import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Home, Users, ShoppingCart, Banknote, Video, Headset, PenTool, Factory, Warehouse, MountainSnow, Newspaper, ListCheck, MessageSquare, Star, FileText, TrendingUp, Save } from 'lucide-react';
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
    
    const { data: meetingData, isLoading } = useQuery({
        queryKey: ['meetingData'],
        queryFn: fetchMeetingData,
    });

    // Initialize local data when fetched
    useEffect(() => {
        if (meetingData && !isInitialized) {
            setLocalData(meetingData);
            setIsInitialized(true);
        }
    }, [meetingData, isInitialized]);

    // Fetch growth data for potential profit display
    const { data: growthData } = useQuery({
        queryKey: ['growthData'],
        queryFn: fetchGrowthData,
    });

    const mutation = useMutation({
        mutationFn: saveMeetingData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meetingData'] });
            alert('✅ Semua data rapat berhasil disimpan!');
        },
        onError: (error) => {
            alert(`⚠️ Sinkronisasi gagal: ${error.message}`);
        }
    });

    const handleRemoveIssue = (index) => {
        if (!localData) return;
        const newData = { ...localData };
        newData.idtIssues = newData.idtIssues.filter((_, i) => i !== index);
        setLocalData(newData);
    };

    const handleSave = () => {
        if (localData) {
            mutation.mutate(localData);
        }
    };

    const calculateProfit = (data) => {
        if (!data) return 0;
        const cust = Math.floor(data.leads * (data.conv / 100));
        return cust * data.trans * data.sale * (data.margin / 100);
    };

    const simProfit = useMemo(() => calculateProfit(growthData?.current), [growthData]);
    const targetProfit = useMemo(() => calculateProfit(growthData?.target), [growthData]);
    
    const navItems = [
        { icon: <Home size={16} />, label: '1. Cover & Title' },
        { icon: <Users size={16} />, label: '2. Segmen Awal' },
        { icon: <ShoppingCart size={16} />, label: '3. Div. E-Comm & Retail' },
        { icon: <Banknote size={16} />, label: '4. Div. HCGA & Finance' },
        { icon: <Video size={16} />, label: '5. Div. Live, KOL, Affil' },
        { icon: <Headset size={16} />, label: '6. Div. Sales Admin' },
        { icon: <PenTool size={16} />, label: '7. Div. Creative & Sosmed' },
        { icon: <Factory size={16} />, label: '8. Div. Prod & Purch' },
        { icon: <Warehouse size={16} />, label: '9. Div. Warehouse & Log' },
        { icon: <MountainSnow size={16} />, label: '10. Prioritas Utama' },
        { icon: <Newspaper size={16} />, label: '11. Headlines' },
        { icon: <ListCheck size={16} />, label: '12. To-Do List' },
        { icon: <MessageSquare size={16} />, label: '13. Sesi IDT' },
        { icon: <Star size={16} />, label: '14. Rating' },
    ];
    
    const handleUpdateKpi = (table, rowIndex, field, value) => {
        if (!localData) return;
        const newData = { ...localData };
        newData[table] = [...(newData[table] || [])];
        if (newData[table][rowIndex]) {
            newData[table][rowIndex] = { ...newData[table][rowIndex], [field]: value };
            setLocalData(newData);
        }
    };

    const handleAddKpiRow = (table) => {
        if (!localData) return;
        const newData = { ...localData };
        newData[table] = [...(newData[table] || []), { kpi: '...', target: '...', realisasi: '...', status: 'on' }];
        setLocalData(newData);
    };

    const handleGenericChange = (field, value) => {
        if (!localData) return;
        const newData = { ...localData, [field]: value };
        setLocalData(newData);
    };
    
    const handlePullIssues = () => {
        if (!localData) return;
        const issues = [];
        const tablesToScan = [
            'ecommTable', 'hcgaTable', 'liveTable', 'salesTable', 
            'creativeTable', 'prodTable', 'warehouseTable', 'rocksTable'
        ];

        tablesToScan.forEach(tableName => {
            if (Array.isArray(localData[tableName])) {
                localData[tableName].forEach(row => {
                    if (row.status === 'off') {
                        issues.push(`[${tableName.replace('Table', '')}] ${row.kpi || row.goal}`);
                    }
                });
            }
        });

        const newData = { ...localData, idtIssues: [...(localData.idtIssues || []), ...issues] };
        setLocalData(newData);
    };
    
    const handleAddIssue = () => {
        if (!localData) return;
        const newData = { ...localData, idtIssues: [...(localData.idtIssues || []), 'Isu Baru...'] };
        setLocalData(newData);
    };

    const handleDiscussionChange = (e) => {
        if (!localData) return;
        const newData = { ...localData, discussionNotes: e.target.value };
        setLocalData(newData);
    };

    const handleActionChange = (e) => {
        if (!localData) return;
        const newData = { ...localData, actionItems: e.target.value };
        setLocalData(newData);
    };

    const handleRatingChange = (div, value) => {
        if (!localData) return;
        const val = parseFloat(value) || 0;
        const newData = { 
            ...localData, 
            ratings: { ...(localData.ratings || {}), [div]: val } 
        };
        setLocalData(newData);
    };

    const handleAttendanceChange = (index) => {
        if (!localData || !localData.attendance) return;
        const newData = { ...localData };
        newData.attendance = [...newData.attendance];
        if (newData.attendance[index]) {
            newData.attendance[index] = { ...newData.attendance[index], present: !newData.attendance[index].present };
            setLocalData(newData);
        }
    };

    const handleRockUpdate = (rowIndex, field, value) => {
        if (!localData || !localData.rocksTable) return;
        const newData = { ...localData };
        newData.rocksTable = [...newData.rocksTable];
        if (newData.rocksTable[rowIndex]) {
            newData.rocksTable[rowIndex] = { ...newData.rocksTable[rowIndex], [field]: value };
            setLocalData(newData);
        }
    };

    const handleAddRockRow = () => {
        if (!localData) return;
        const newData = { ...localData };
        newData.rocksTable = [...(newData.rocksTable || []), { owner: '...', goal: '...', status: 'on' }];
        setLocalData(newData);
    };

    const handleTodoUpdate = (rowIndex, field, value) => {
        if (!localData || !localData.todoTable) return;
        const newData = { ...localData };
        newData.todoTable = [...newData.todoTable];
        if (newData.todoTable[rowIndex]) {
            newData.todoTable[rowIndex] = { ...newData.todoTable[rowIndex], [field]: value };
            setLocalData(newData);
        }
    };

    const handleAddTodoRow = () => {
        if (!localData) return;
        const newData = { ...localData };
        newData.todoTable = [...(newData.todoTable || []), { task: '...', owner: '...', status: 'not' }];
        setLocalData(newData);
    };

    const averageRating = useMemo(() => {
        if (!localData?.ratings) return 0;
        const vals = Object.values(localData.ratings);
        if (vals.length === 0) return 0;
        const sum = vals.reduce((a, b) => a + b, 0);
        return (sum / vals.length).toFixed(1);
    }, [localData?.ratings]);

    const saveAsPDF = async () => {
        try {
            const element = pdfRef.current;
            if (!element) throw new Error("PDF content element not found");
            
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Rapat-Kinerja-${localData?.date || 'Download'}.pdf`);
        } catch (error) {
            alert("Gagal mengunduh PDF: " + error.message);
        }
    };

    if (isLoading || !localData) {
        return <div className="flex justify-center items-center h-screen">Loading Meeting Dashboard...</div>;
    }

    return (
        <div className="performance-meeting-tool" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', height: '100vh', backgroundColor: 'var(--main-bg)' }}>
            <aside style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-text)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <MeetingTimer />
                
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '15px', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '4px', opacity: 0.8 }}>
                        <TrendingUp size={14} /> Potential Profit
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#10B981' }}>
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(targetProfit)}
                    </div>
                    <div style={{ fontSize: '10px', opacity: 0.6 }}>Berdasarkan Growth Simulator</div>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, flexGrow: 1, overflowY: 'auto' }}>
                    {navItems.map((item, index) => (
                        <li 
                            key={index} 
                            onClick={() => setActiveSection(index)}
                            style={{ 
                                padding: '10px 15px', 
                                marginBottom: '4px', 
                                borderRadius: '8px', 
                                cursor: 'pointer', 
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '14px',
                                background: activeSection === index ? 'var(--sidebar-active)' : 'transparent'
                            }}
                        >
                            {item.icon} {item.label}
                        </li>
                    ))}
                </ul>
                
                <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                    <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '5px', textAlign: 'center' }}>
                        {mutation.isPending ? '⏳ Menyimpan...' : '✅ Data Siap Disimpan'}
                    </div>
                    <button onClick={handleSave} className="btn w-full flex items-center justify-center gap-2" style={{ marginBottom: '8px', background: '#FF8c42', color: 'white' }}>
                        <Save size={16} /> Simpan Data
                    </button>
                    <button onClick={saveAsPDF} className="btn w-full flex items-center justify-center gap-2" style={{ background: '#718096' }}>
                        <FileText size={16} /> Download PDF
                    </button>
                </div>
            </aside>

            <main ref={pdfRef} style={{ padding: '30px', overflowY: 'auto' }}>
                {activeSection === 0 && (
                    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'radial-gradient(circle at center, #fff, #F5F1EE)' }}>
                         <h1 style={{ fontSize: '42px', margin: 0 }}>RAPAT KINERJA PEKANAN</h1>
                         <input 
                            className="input-bare" 
                            style={{ fontSize: '24px', textAlign: 'center', fontWeight: 600, color: 'var(--secondary)' }}
                            value={localData?.date || ''}
                            onChange={(e) => handleGenericChange('date', e.target.value)}
                         />
                    </div>
                )}

                {activeSection === 1 && (
                    <div className="grid grid-cols-2 gap-6">
                        <div className="card">
                            <h3 style={{ margin: 0, color: 'var(--secondary)' }}>Daftar Hadir</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                                {localData?.attendance?.map((person, index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fafafa', padding: '8px 12px', borderRadius: '6px' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={person.present} 
                                            onChange={() => handleAttendanceChange(index)}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{person.role}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="card">
                            <h3 style={{ margin: 0, color: 'var(--secondary)' }}>Kabar Baik (Good News)</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px', height: '100%' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <strong style={{ fontSize: '13px', marginBottom: '5px' }}>Bisnis/Profesional:</strong>
                                    <textarea 
                                        className="input-bare w-full flex-1 bg-[#fafafa] p-2 rounded-md border-none"
                                        value={localData?.goodNewsBusiness || ''}
                                        onChange={(e) => handleGenericChange('goodNewsBusiness', e.target.value)}
                                        placeholder="..."
                                    />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <strong style={{ fontSize: '13px', marginBottom: '5px' }}>Personal:</strong>
                                    <textarea 
                                        className="input-bare w-full flex-1 bg-[#fafafa] p-2 rounded-md border-none"
                                        value={localData?.goodNewsPersonal || ''}
                                        onChange={(e) => handleGenericChange('goodNewsPersonal', e.target.value)}
                                        placeholder="..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 2 && (
                    <KpiTable 
                        title="Div. E-Commerce & Retail"
                        data={localData?.ecommTable || []}
                        onUpdate={(rowIndex, field, value) => handleUpdateKpi('ecommTable', rowIndex, field, value)}
                        onAddRow={() => handleAddKpiRow('ecommTable')}
                    />
                )}
                {activeSection === 3 && (
                     <KpiTable 
                        title="Div. HCGA & Finance"
                        data={localData?.hcgaTable || []}
                        onUpdate={(rowIndex, field, value) => handleUpdateKpi('hcgaTable', rowIndex, field, value)}
                        onAddRow={() => handleAddKpiRow('hcgaTable')}
                    />
                )}
                {activeSection === 4 && (
                     <KpiTable 
                        title="Div. Live, KOL, Affiliate"
                        data={localData?.liveTable || []}
                        onUpdate={(rowIndex, field, value) => handleUpdateKpi('liveTable', rowIndex, field, value)}
                        onAddRow={() => handleAddKpiRow('liveTable')}
                    />
                )}
                {activeSection === 5 && (
                     <KpiTable 
                        title="Div. Sales Admin"
                        data={localData?.salesTable || []}
                        onUpdate={(rowIndex, field, value) => handleUpdateKpi('salesTable', rowIndex, field, value)}
                        onAddRow={() => handleAddKpiRow('salesTable')}
                    />
                )}
                {activeSection === 6 && (
                     <KpiTable 
                        title="Div. Creative & Sosmed"
                        data={localData?.creativeTable || []}
                        onUpdate={(rowIndex, field, value) => handleUpdateKpi('creativeTable', rowIndex, field, value)}
                        onAddRow={() => handleAddKpiRow('creativeTable')}
                    />
                )}
                {activeSection === 7 && (
                     <KpiTable 
                        title="Div. Prod & Purch"
                        data={localData?.prodTable || []}
                        onUpdate={(rowIndex, field, value) => handleUpdateKpi('prodTable', rowIndex, field, value)}
                        onAddRow={() => handleAddKpiRow('prodTable')}
                    />
                )}
                {activeSection === 8 && (
                     <KpiTable 
                        title="Div. Warehouse & Log"
                        data={localData?.warehouseTable || []}
                        onUpdate={(rowIndex, field, value) => handleUpdateKpi('warehouseTable', rowIndex, field, value)}
                        onAddRow={() => handleAddKpiRow('warehouseTable')}
                    />
                )}

                {activeSection === 9 && (
                    <div className="card">
                        <h3 style={{ marginTop: 0, color: 'var(--secondary)' }}>Tinjauan Prioritas Utama (Rocks)</h3>
                        <table className="w-full text-left border-collapse mt-4">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-3 font-bold text-xs uppercase" width="20%">Owner</th>
                                    <th className="p-3 font-bold text-xs uppercase" width="60%">Prioritas Utama (Goal)</th>
                                    <th className="p-3 font-bold text-xs uppercase text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {localData?.rocksTable?.map((rock, index) => (
                                    <tr key={index} className="border-b border-slate-100">
                                        <td className="p-3">
                                            <input 
                                                className="input-bare w-full" 
                                                value={rock.owner} 
                                                onChange={(e) => handleRockUpdate(index, 'owner', e.target.value)} 
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input 
                                                className="input-bare w-full" 
                                                value={rock.goal} 
                                                onChange={(e) => handleRockUpdate(index, 'goal', e.target.value)} 
                                            />
                                        </td>
                                        <td className="p-3 text-center">
                                            <div 
                                                className={`pill ${rock.status}`} 
                                                onClick={() => handleRockUpdate(index, 'status', rock.status === 'on' ? 'off' : 'on')}
                                            ></div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="btn-add" onClick={handleAddRockRow}>+ Tambah Prioritas</button>
                    </div>
                )}

                {activeSection === 11 && (
                    <div className="card">
                        <h3 style={{ marginTop: 0, color: 'var(--secondary)' }}>To-Do List (7 Hari)</h3>
                        <table className="w-full text-left border-collapse mt-4">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-3 font-bold text-xs uppercase" width="5%">#</th>
                                    <th className="p-3 font-bold text-xs uppercase" width="55%">Tugas</th>
                                    <th className="p-3 font-bold text-xs uppercase" width="20%">Owner</th>
                                    <th className="p-3 font-bold text-xs uppercase text-center">Selesai?</th>
                                </tr>
                            </thead>
                            <tbody>
                                {localData?.todoTable?.map((todo, index) => (
                                    <tr key={index} className="border-b border-slate-100">
                                        <td className="p-3">{index + 1}</td>
                                        <td className="p-3">
                                            <input 
                                                className="input-bare w-full" 
                                                value={todo.task} 
                                                onChange={(e) => handleTodoUpdate(index, 'task', e.target.value)} 
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input 
                                                className="input-bare w-full" 
                                                value={todo.owner} 
                                                onChange={(e) => handleTodoUpdate(index, 'owner', e.target.value)} 
                                            />
                                        </td>
                                        <td className="p-3 text-center">
                                            <div 
                                                className={`pill ${todo.status === 'done' ? 'done' : 'not'}`} 
                                                onClick={() => handleTodoUpdate(index, 'status', todo.status === 'done' ? 'not' : 'done')}
                                            ></div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="btn-add" onClick={handleAddTodoRow}>+ Tambah To-Do</button>
                    </div>
                )}

                {activeSection === 10 && (
                    <div className="grid grid-cols-2 gap-6">
                        <div className="card">
                            <h3 style={{ margin: 0, color: 'var(--secondary)' }}>Customer Headlines</h3>
                            <textarea 
                                className="input-bare w-full mt-4 min-h-[200px] bg-slate-50 p-3 rounded-lg"
                                value={localData?.customerHeadlines || ''}
                                onChange={(e) => handleGenericChange('customerHeadlines', e.target.value)}
                                placeholder="Tulis berita penting dari customer..."
                            />
                        </div>
                        <div className="card">
                            <h3 style={{ margin: 0, color: 'var(--secondary)' }}>Internal Headlines</h3>
                            <textarea 
                                className="input-bare w-full mt-4 min-h-[200px] bg-slate-50 p-3 rounded-lg"
                                value={localData?.internalHeadlines || ''}
                                onChange={(e) => handleGenericChange('internalHeadlines', e.target.value)}
                                placeholder="Tulis berita penting internal..."
                            />
                        </div>
                    </div>
                )}

                {activeSection === 12 && (
                    <IdtSection 
                        issues={localData?.idtIssues || []}
                        discussionNotes={localData?.discussionNotes || ''}
                        actionItems={localData?.actionItems || ''}
                        onPullIssues={handlePullIssues}
                        onAddIssue={handleAddIssue}
                        onRemoveIssue={handleRemoveIssue}
                        onDiscussionChange={handleDiscussionChange}
                        onActionChange={handleActionChange}
                    />
                )}

                {activeSection === 13 && (
                    <div className="card flex flex-col items-center justify-center">
                        <div className="flex flex-wrap gap-6 justify-center">
                            {localData?.ratings && Object.keys(localData.ratings).map((div) => (
                                <div key={div} className="text-center">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{div}</label>
                                    <input 
                                        type="number" 
                                        className="w-16 h-16 text-2xl text-center border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                                        value={localData.ratings[div]}
                                        onChange={(e) => handleRatingChange(div, e.target.value)}
                                        min="0" max="10"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 text-center">
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">RATA-RATA RATING</div>
                            <div className="text-7xl font-extrabold text-[#FF8c42] mt-2">{averageRating}</div>
                        </div>
                    </div>
                )}
                
                {activeSection > 13 && (
                    <div className="card">
                        <h1 className="text-2xl font-bold text-slate-800">{navItems[activeSection]?.label}</h1>
                        <p className="text-slate-500 mt-2">Bagian ini siap untuk diisi data spesifik.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MeetingTool;
