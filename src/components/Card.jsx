import React from 'react';

const Card = ({ title, value, subtext, icon, trend }) => {
    return (
        <div className="card">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-sm text-muted" style={{ margin: '0 0 0.5rem 0' }}>{title}</h3>
                    <div className="text-xl">{value}</div>
                </div>
                {icon && <div style={{ color: 'var(--color-primary)' }}>{icon}</div>}
            </div>
            {(subtext || trend) && (
                <div className="flex items-center gap-md" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
                    {trend && (
                        <span style={{
                            color: trend > 0 ? 'var(--color-success)' : 'var(--color-danger)',
                            fontWeight: 500
                        }}>
                            {trend > 0 ? '+' : ''}{trend}%
                        </span>
                    )}
                    {subtext && <span className="text-muted">{subtext}</span>}
                </div>
            )}
        </div>
    );
};

export default Card;
