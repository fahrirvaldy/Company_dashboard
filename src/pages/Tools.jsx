import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Home, Users, ShoppingCart, Banknote, Video, Headset, PenTool, Factory, Warehouse, MountainSnow, Newspaper, ListCheck, MessageSquare, Star, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import MeetingTimer from '../components/MeetingTimer';
import KpiTable from '../components/KpiTable';
import IdtSection from '../components/IdtSection';
import './Tools.css';
import { fetchMeetingData, saveMeetingData } from '../api/dashboardApi';

const Tools = () => {
    const queryClient = useQueryClient();
    const [activeSection, setActiveSection] = useState(0);
    const pdfRef = useRef(null);
    
    const { data: meetingData, isLoading } = useQuery({
        queryKey: ['meetingData'],
        queryFn: fetchMeetingData,
    });

    const mutation = useMutation({
        mutationFn: saveMeetingData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meetingData'] });
        },
    });
    
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
        const newData = { ...meetingData };
        newData[table] = [...newData[table]];
        newData[table][rowIndex] = { ...newData[table][rowIndex], [field]: value };
        mutation.mutate(newData);
    };

    const handleAddKpiRow = (table) => {
        const newData = { ...meetingData };
        newData[table] = [...newData[table], { kpi: '...', target: '...', realisasi: '...', status: 'on' }];
        mutation.mutate(newData);
    };

    const handleGenericChange = (field, value) => {
        const newData = { ...meetingData, [field]: value };
        mutation.mutate(newData);
    };
    
    const handlePullIssues = () => {
        const issues = [];
        const tablesToScan = [
            'ecommTable', 'hcgaTable', 'liveTable', 'salesTable', 
            'creativeTable', 'prodTable', 'warehouseTable', 'rocksTable'
        ];

        tablesToScan.forEach(tableName => {
            if (Array.isArray(meetingData[tableName])) {
                meetingData[tableName].forEach(row => {
                    if (row.status === 'off') {
                        issues.push(`[${tableName.replace('Table', '')}] ${row.kpi || row.goal}`);
                    }
                });
            }
        });

        const newData = { ...meetingData, idtIssues: [...meetingData.idtIssues, ...issues] };
        mutation.mutate(newData);
    };
    
    const handleAddIssue = () => {
        const newData = { ...meetingData, idtIssues: [...meetingData.idtIssues, 'Isu Baru...'] };
        mutation.mutate(newData);
    };

    const handleDiscussionChange = (e) => {
        const newData = { ...meetingData, discussionNotes: e.target.value };
        mutation.mutate(newData);
    };

    const handleActionChange = (e) => {
        const newData = { ...meetingData, actionItems: e.target.value };
        mutation.mutate(newData);
    };

    const handleRatingChange = (div, value) => {
        const val = parseFloat(value) || 0;
        const newData = { 
            ...meetingData, 
            ratings: { ...meetingData.ratings, [div]: val } 
        };
        mutation.mutate(newData);
    };

    const averageRating = useMemo(() => {
        if (!meetingData?.ratings) return 0;
        const vals = Object.values(meetingData.ratings);
        const sum = vals.reduce((a, b) => a + b, 0);
        return (sum / vals.length).toFixed(1);
    }, [meetingData?.ratings]);

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
            pdf.save(`Rapat-Kinerja-${meetingData.date}.pdf`);
        } catch (error) {
            alert("Gagal mengunduh PDF: " + error.message);
        }
    };

    if (isLoading) {
        return <div>Loading Meeting Dashboard...</div>;
    }

    return (
        <div className="performance-meeting-tool" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', height: '100vh', backgroundColor: 'var(--main-bg)' }}>
            {/* Sidebar */}
            <div style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-text)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <MeetingTimer />
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
                <button onClick={saveAsPDF} className="btn-action" style={{ marginTop: '20px' }}>
                    <FileText size={16} /> Download Laporan
                </button>
            </div>

            {/* Main Content */}
            <main ref={pdfRef} style={{ padding: '30px', overflowY: 'auto' }}>
                {activeSection === 0 && (
                    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'radial-gradient(circle at center, #fff, #F5F1EE)' }}>
                         <h1 style={{ fontSize: '42px', margin: 0 }}>RAPAT KINERJA PEKANAN</h1>
                         <input 
                            className="input-bare" 
                            style={{ fontSize: '24px', textAlign: 'center', fontWeight: 600, color: 'var(--secondary)' }}
                            value={meetingData.date}
                            onChange={(e) => handleGenericChange('date', e.target.value)}
                         />
                    </div>
                )}

                {activeSection === 2 && (
                    <KpiTable 
                        title="Div. E-Commerce & Retail"
                        data={meetingData.ecommTable}
                        onUpdate={(rowIndex, field, value) => handleUpdateKpi('ecommTable', rowIndex, field, value)}
                        onAddRow={() => handleAddKpiRow('ecommTable')}
                    />
                )}
                {activeSection === 3 && (
                     <KpiTable 
                        title="Div. HCGA & Finance"
                        data={meetingData.hcgaTable}
                        onUpdate={(rowIndex, field, value) => handleUpdateKpi('hcgaTable', rowIndex, field, value)}
                        onAddRow={() => handleAddKpiRow('hcgaTable')}
                    />
                )}
                {activeSection === 4 && (
                     <KpiTable 
                        title="Div. Live, KOL, Affiliate"
                        data={meetingData.liveTable}
                        onUpdate={(rowIndex, field, value) => handleUpdateKpi('liveTable', rowIndex, field, value)}
                        onAddRow={() => handleAddKpiRow('liveTable')}
                    />
                )}
                {activeSection === 5 && (
                     <KpiTable 
                        title="Div. Sales Admin"
                        data={meetingData.salesTable}
                        onUpdate={(rowIndex, field, value) => handleUpdateKpi('salesTable', rowIndex, field, value)}
                        onAddRow={() => handleAddKpiRow('salesTable')}
                    />
                )}
                {activeSection === 6 && (
                     <KpiTable 
                        title="Div. Creative & Sosmed"
                        data={meetingData.creativeTable}
                        onUpdate={(rowIndex, field, value) => handleUpdateKpi('creativeTable', rowIndex, field, value)}
                        onAddRow={() => handleAddKpiRow('creativeTable')}
                    />
                )}
                {activeSection === 7 && (
                     <KpiTable 
                        title="Div. Prod & Purch"
                        data={meetingData.prodTable}
                        onUpdate={(rowIndex, field, value) => handleUpdateKpi('prodTable', rowIndex, field, value)}
                        onAddRow={() => handleAddKpiRow('prodTable')}
                    />
                )}
                {activeSection === 8 && (
                     <KpiTable 
                        title="Div. Warehouse & Log"
                        data={meetingData.warehouseTable}
                        onUpdate={(rowIndex, field, value) => handleUpdateKpi('warehouseTable', rowIndex, field, value)}
                        onAddRow={() => handleAddKpiRow('warehouseTable')}
                    />
                )}

                {activeSection === 10 && (
                    <div className="grid-2">
                        <div className="card">
                            <h3 style={{ margin: 0, color: 'var(--secondary)' }}>Customer Headlines</h3>
                            <textarea 
                                className="input-bare" 
                                style={{ flexGrow: 1, marginTop: '10px', minHeight: '150px' }}
                                value={meetingData.customerHeadlines}
                                onChange={(e) => handleGenericChange('customerHeadlines', e.target.value)}
                                placeholder="Tulis berita penting dari customer..."
                            />
                        </div>
                        <div className="card">
                            <h3 style={{ margin: 0, color: 'var(--secondary)' }}>Internal Headlines</h3>
                            <textarea 
                                className="input-bare" 
                                style={{ flexGrow: 1, marginTop: '10px', minHeight: '150px' }}
                                value={meetingData.internalHeadlines}
                                onChange={(e) => handleGenericChange('internalHeadlines', e.target.value)}
                                placeholder="Tulis berita penting internal..."
                            />
                        </div>
                    </div>
                )}

                {activeSection === 12 && (
                    <IdtSection 
                        issues={meetingData.idtIssues}
                        discussionNotes={meetingData.discussionNotes}
                        actionItems={meetingData.actionItems}
                        onPullIssues={handlePullIssues}
                        onAddIssue={handleAddIssue}
                        onDiscussionChange={handleDiscussionChange}
                        onActionChange={handleActionChange}
                    />
                )}

                {activeSection === 13 && (
                    <div className="card" style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {meetingData.ratings && Object.keys(meetingData.ratings).map((div) => (
                                <div key={div} style={{ textAlign: 'center' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--secondary)', textTransform: 'capitalize' }}>{div}</label>
                                    <input 
                                        type="number" 
                                        className="input-bare"
                                        style={{ width: '60px', height: '60px', fontSize: '24px', textAlign: 'center', border: '1px solid var(--border)', borderRadius: '8px', background: '#fff' }}
                                        value={meetingData.ratings[div]}
                                        onChange={(e) => handleRatingChange(div, e.target.value)}
                                        min="0" max="10"
                                    />
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '40px', textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', color: '#aaa' }}>RATA-RATA RATING</div>
                            <div style={{ fontSize: '64px', fontWeight: 700, color: 'var(--primary)' }}>{averageRating}</div>
                        </div>
                    </div>
                )}
                
                {activeSection !== 0 && activeSection !== 2 && activeSection !== 3 && activeSection !== 4 && activeSection !== 5 && activeSection !== 6 && activeSection !== 7 && activeSection !== 8 && activeSection !== 10 && activeSection !== 12 && activeSection !== 13 && (
                    <div className="card">
                        <h1 className="page-title">{navItems[activeSection].label}</h1>
                        <p>Bagian ini siap untuk diisi data spesifik.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Tools;

