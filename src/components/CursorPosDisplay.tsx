import { useState, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';

/**
 * フロー上のマウス座標を表示する開発用コンポーネント
 */
const CursorPosDisplay = () => {
    const { screenToFlowPosition } = useReactFlow();
    const [pos, setPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
            setPos(flowPos);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [screenToFlowPosition]);

    return (
        <div className="absolute bottom-4 right-4 glass rounded-lg px-3 py-1.5 text-[10px] font-mono pointer-events-none z-50"
            style={{ color: 'var(--hf-text-muted)' }}>
            X: {pos.x.toFixed(0)}, Y: {pos.y.toFixed(0)}
        </div>
    );
};

export default CursorPosDisplay;
