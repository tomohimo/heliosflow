import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

// 分岐点ノード — ダークテーマ対応
const JunctionNode = memo((_props: { data: any }) => {
    return (
        <div className="relative w-1 h-1 flex items-center justify-center">
            {/* ビジュアルドット */}
            <div className="absolute w-2.5 h-2.5 rounded-full z-10"
                style={{ background: 'rgba(99, 102, 241, 0.6)', boxShadow: '0 0 8px rgba(99, 102, 241, 0.3)' }} />

            {/* ハンドル（透明・位置合わせ用） */}
            <Handle type="target" position={Position.Top} id="t-top" style={{ top: '50%', left: '50%', width: 0, height: 0, border: 0, background: 'transparent' }} />
            <Handle type="source" position={Position.Top} id="s-top" style={{ top: '50%', left: '50%', width: 0, height: 0, border: 0, background: 'transparent' }} />
            <Handle type="target" position={Position.Right} id="t-right" style={{ top: '50%', left: '50%', width: 0, height: 0, border: 0, background: 'transparent' }} />
            <Handle type="source" position={Position.Right} id="s-right" style={{ top: '50%', left: '50%', width: 0, height: 0, border: 0, background: 'transparent' }} />
            <Handle type="target" position={Position.Bottom} id="t-bottom" style={{ top: '50%', left: '50%', width: 0, height: 0, border: 0, background: 'transparent' }} />
            <Handle type="source" position={Position.Bottom} id="s-bottom" style={{ top: '50%', left: '50%', width: 0, height: 0, border: 0, background: 'transparent' }} />
            <Handle type="target" position={Position.Left} id="t-left" style={{ top: '50%', left: '50%', width: 0, height: 0, border: 0, background: 'transparent' }} />
            <Handle type="source" position={Position.Left} id="s-left" style={{ top: '50%', left: '50%', width: 0, height: 0, border: 0, background: 'transparent' }} />
        </div>
    );
});

export default JunctionNode;
