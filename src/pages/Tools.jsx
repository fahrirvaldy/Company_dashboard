import React, { useState } from 'react';
import { Calculator, Box, FileText, Download, Play, PieChart, ExternalLink } from 'lucide-react';

const Tools = () => {
    // Price Calculator State
    const [cost, setCost] = useState('');
    const [margin, setMargin] = useState('');
    const [price, setPrice] = useState(null);

    const calculatePrice = () => {
        const c = parseFloat(cost);
        const m = parseFloat(margin);
        if (!isNaN(c) && !isNaN(m)) {
            // Price = Cost / (1 - Margin%)
            // Or Price = Cost * (1 + Margin%) depending on markup vs margin. Usually Margin.
            // Let's assume User means Markup for simplicity: Cost + (Cost * Margin/100)
            const res = c + (c * (m / 100));
            setPrice(res);
        }
    };

    return (
        <div className="flex flex-col gap-md">
            <div className="flex justify-between items-center">
                <h2 className="text-xl">Company Tools</h2>
                <p className="text-sm text-muted">A collection of utilities to help your workflow.</p>
            </div>

            <div className="grid grid-cols-2 gap-md wrap-mobile-col">
                {/* Tool 1: Price Calculator */}
                <div className="card">
                    <div className="flex items-center gap-md" style={{ marginBottom: '1rem' }}>
                        <div style={{ background: '#FEF3C7', padding: '8px', borderRadius: '8px', color: '#D97706' }}>
                            <Calculator size={24} />
                        </div>
                        <h3 className="text-xl" style={{ fontSize: '1.1rem', margin: 0 }}>Price Calculator</h3>
                    </div>

                    <div className="flex flex-col gap-md">
                        <div>
                            <label className="text-sm text-muted">Cost of Goods (IDR)</label>
                            <input
                                type="number"
                                className="w-full"
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', marginTop: '4px' }}
                                placeholder="e.g. 50000"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted">Markup Percentage (%)</label>
                            <input
                                type="number"
                                className="w-full"
                                value={margin}
                                onChange={(e) => setMargin(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', marginTop: '4px' }}
                                placeholder="e.g. 20"
                            />
                        </div>
                        <button
                            className="btn"
                            onClick={calculatePrice}
                            style={{ marginTop: '0.5rem' }}
                        >
                            Calculate Price
                        </button>

                        {price !== null && (
                            <div style={{ background: '#F0FFF4', padding: '1rem', borderRadius: '8px', border: '1px solid #C6F6D5', marginTop: '1rem' }}>
                                <div className="text-sm text-muted">Recommended Selling Price:</div>
                                <div className="text-xl" style={{ color: '#2F855A' }}>
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tool 2: Stock Helper */}
                <div className="card">
                    <div className="flex items-center gap-md" style={{ marginBottom: '1rem' }}>
                        <div style={{ background: '#EBF8FF', padding: '8px', borderRadius: '8px', color: '#3182CE' }}>
                            <Box size={24} />
                        </div>
                        <h3 className="text-xl" style={{ fontSize: '1.1rem', margin: 0 }}>Stock Forecaster</h3>
                    </div>
                    <p className="text-sm text-muted">
                        Predict when you will run out of stock based on current sales velocity.
                    </p>
                    <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                        <button className="btn" style={{ background: 'var(--color-bg-main)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)' }}>
                            Open Tool <Play size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                        </button>
                    </div>
                </div>

                {/* Tool 3: Templates */}
                <div className="card">
                    <div className="flex items-center gap-md" style={{ marginBottom: '1rem' }}>
                        <div style={{ background: '#FEEBC8', padding: '8px', borderRadius: '8px', color: '#C05621' }}>
                            <FileText size={24} />
                        </div>
                        <h3 className="text-xl" style={{ fontSize: '1.1rem', margin: 0 }}>Presentation Templates</h3>
                    </div>
                    <p className="text-sm text-muted">
                        Standard company meeting templates (Weekly, Monthly, QBR).
                    </p>
                    <ul style={{ paddingLeft: '1.2rem', margin: '1rem 0', fontSize: '0.9rem' }} className="text-muted">
                        <li style={{ marginBottom: '0.5rem' }}>Weekly Standup.pptx</li>
                        <li style={{ marginBottom: '0.5rem' }}>Monthly Business Review.html</li>
                    </ul>
                    <button className="btn flex items-center justify-between" style={{ width: '100%' }}>
                        Download All <Download size={16} />
                    </button>
                </div>

                {/* Tool 4: Imported Finance Tool */}
                <div className="card">
                    <div className="flex items-center gap-md" style={{ marginBottom: '1rem' }}>
                        <div style={{ background: '#E6FFFA', padding: '8px', borderRadius: '8px', color: '#319795' }}>
                            <PieChart size={24} />
                        </div>
                        <h3 className="text-xl" style={{ fontSize: '1.1rem', margin: 0 }}>Finance Dashboard</h3>
                    </div>
                    <p className="text-sm text-muted">
                        Legacy finance tools and reports imported from external source.
                    </p>
                    <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                        <a
                            href="/finance-tool.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn flex items-center justify-center gap-sm"
                            style={{ textDecoration: 'none', background: 'var(--color-bg-main)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)' }}
                        >
                            Open Dashboard <ExternalLink size={14} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tools;
