import React from 'react';
import { Magnet } from 'lucide-react';

const IdtSection = ({ issues, discussionNotes, actionItems, onPullIssues, onAddIssue, onDiscussionChange, onActionChange }) => {
    return (
        <div className="performance-meeting-tool">
            <div className="header-bar">
                <div>
                    <h1 className="page-title">Sesi IDT</h1>
                    <p className="page-subtitle">Identifikasi, Diskusi, Tuntas (60 Menit)</p>
                </div>
                <button 
                    onClick={onPullIssues} 
                    style={{
                        background:'var(--danger-bg)', 
                        color:'var(--danger-text)', 
                        border:'none', 
                        padding:'8px 15px', 
                        borderRadius:'6px', 
                        fontWeight:700, 
                        cursor:'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Magnet size={16} /> Tarik Off-Track
                </button>
            </div>
            <div className="grid-3">
                <div className="ids-col">
                    <div className="ids-header">1. Identifikasi (Daftar)</div>
                    <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                        {issues.map((issue, index) => (
                            <div key={index} className="ids-item">
                                <input type="checkbox" style={{ marginTop: '4px' }} />
                                <span style={{ fontSize: '13px', lineHeight: '1.4' }}>{issue}</span>
                            </div>
                        ))}
                    </div>
                    <button className="btn-add" onClick={onAddIssue}>+ Isu Manual</button>
                </div>
                <div className="ids-col">
                    <div className="ids-header">2. Diskusi (Catatan)</div>
                    <textarea
                        value={discussionNotes}
                        onChange={onDiscussionChange}
                        className="input-bare"
                        style={{ flexGrow: 1, outline: 'none', resize: 'none', border: 'none' }}
                        placeholder="Catat poin diskusi..."
                    />
                </div>
                <div className="ids-col">
                    <div className="ids-header">3. Tuntas (Tindakan)</div>
                    <textarea
                        value={actionItems}
                        onChange={onActionChange}
                        className="input-bare"
                        style={{ flexGrow: 1, outline: 'none', resize: 'none', border: 'none' }}
                        placeholder="- Solusi A (Owner/Date)&#10;- Solusi B"
                    />
                </div>
            </div>
        </div>
    );
};

export default IdtSection;

