import React from 'react';

const KpiTable = ({ title, data, onUpdate, onAddRow }) => {
    
    const handlePillClick = (rowIndex) => {
        const newStatus = data[rowIndex].status === 'on' ? 'off' : 'on';
        onUpdate(rowIndex, 'status', newStatus);
    };

    return (
        <div className="card">
            <h3 style={{ marginTop: 0, color: 'var(--secondary)' }}>{title}</h3>
            <table>
                <thead>
                    <tr>
                        <th>KPI / Indikator</th>
                        <th>Target</th>
                        <th>Realisasi</th>
                        <th align="center">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td>
                                <input
                                    className="input-bare"
                                    value={row.kpi}
                                    onChange={(e) => onUpdate(rowIndex, 'kpi', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    className="input-bare"
                                    value={row.target}
                                    onChange={(e) => onUpdate(rowIndex, 'target', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    className="input-bare"
                                    value={row.realisasi}
                                    onChange={(e) => onUpdate(rowIndex, 'realisasi', e.target.value)}
                                />
                            </td>
                            <td align="center">
                                <div
                                    className={`pill ${row.status}`}
                                    onClick={() => handlePillClick(rowIndex)}
                                ></div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className="btn-add" onClick={onAddRow}>+ Tambah Baris</button>
        </div>
    );
};

export default KpiTable;
