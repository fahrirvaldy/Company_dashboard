import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const MeetingTimer = () => {
    const [timeLeft, setTimeLeft] = useState(90 * 60);
    const [isPaused, setIsPaused] = useState(true);

    useEffect(() => {
        if (isPaused) {
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev > 0) {
                    return prev - 1;
                }
                clearInterval(interval);
                return 0;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isPaused]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const startTimer = () => setIsPaused(false);
    const pauseTimer = () => setIsPaused(true);
    const resetTimer = () => {
        setIsPaused(true);
        setTimeLeft(90 * 60);
    };

    return (
        <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '15px',
            borderRadius: '12px',
            marginBottom: '30px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff'
        }}>
            <div style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'monospace', marginBottom: '8px' }}>
                {formatTime(timeLeft)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <Play size={18} cursor="pointer" onClick={startTimer} />
                <Pause size={18} cursor="pointer" onClick={pauseTimer} />
                <RotateCcw size={18} cursor="pointer" onClick={resetTimer} />
            </div>
        </div>
    );
};

export default MeetingTimer;
