import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { NodeData } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS, NODE_STATUSES } from '@/constants';
import { Star } from 'lucide-react';

const CustomNode = memo(({ data, id }: { data: NodeData & { isFav?: boolean; nodeStatus?: string }, id: string }) => {
    const color = CATEGORY_COLORS[data.category] || CATEGORY_COLORS.default;
    // Assuming statusMap is defined elsewhere or intended to be passed.
    // For now, we'll use data.nodeStatus as the primary source for statusKey.
    // If statusMap is meant to override, it needs to be provided.
    // The instruction snippet has a potential issue with `statusMap[id]` and `data.status`
    // which are not defined in the current context or type.
    // I will adapt the instruction to use existing `data.nodeStatus` and `isGrayed` logic.

    const isGrayed = data.nodeStatus === 'completed' || data.nodeStatus === 'notApplicable';
    const statusKey = data.nodeStatus || 'pending'; // Simplified based on available data type
    const status = NODE_STATUSES[statusKey] || NODE_STATUSES.pending;
    const isInProgress = statusKey === 'inProgress';

    return (
        <div
            className={`rounded-xl shadow-md border-2 border-transparent hover:shadow-lg transition-all w-[200px] group relative ${isGrayed ? 'opacity-40' : ''} ${isInProgress ? 'animate-gradient-bg' : ''}`}
            style={{
                borderColor: isGrayed ? '#cbd5e1' : color,
                background: isInProgress ? 'var(--hf-progress-bg)' : 'var(--hf-node-bg)',
                filter: isGrayed ? 'grayscale(1)' : undefined,
                color: 'var(--hf-text-primary)'
            }}
        >
            {/* 各方向のハンドル — 左右のハンドルは元の高さ(80px)の中心(40px)に固定してズレを防ぐ */}
            {/* Top */}<Handle type="target" position={Position.Top} id="t-top" className="!bg-slate-500 !w-2 !h-2" /><Handle type="source" position={Position.Top} id="s-top" className="!bg-slate-500 !w-2 !h-2" />
            {/* Left */}<Handle type="target" position={Position.Left} id="t-left" className="!bg-slate-500 !w-2 !h-2" style={{ top: '40px' }} /><Handle type="source" position={Position.Left} id="s-left" className="!bg-slate-500 !w-2 !h-2" style={{ top: '40px' }} />
            {/* Right */}<Handle type="target" position={Position.Right} id="t-right" className="!bg-slate-500 !w-2 !h-2" style={{ top: '40px' }} /><Handle type="source" position={Position.Right} id="s-right" className="!bg-slate-500 !w-2 !h-2" style={{ top: '40px' }} />
            {/* Bottom */}<Handle type="target" position={Position.Bottom} id="t-bottom" className="!bg-slate-500 !w-2 !h-2" /><Handle type="source" position={Position.Bottom} id="s-bottom" className="!bg-slate-500 !w-2 !h-2" />

            {/* ID + お気に入り（右上） */}
            <div className="absolute -top-3 -right-3 flex items-center gap-1">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded shadow-sm"
                    style={{ color: 'var(--hf-text-muted)', background: 'var(--hf-bg-card)', border: '1px solid var(--hf-border-light)' }}>
                    {id}
                </span>
                <div
                    className="rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-sm cursor-pointer z-10"
                    style={{ background: 'var(--hf-bg-card)', border: '1px solid var(--hf-border-light)' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        const event = new CustomEvent('toggleFav', { detail: { id } });
                        window.dispatchEvent(event);
                    }}
                >
                    <Star size={14} className={data.isFav ? "fill-amber-400 text-amber-400" : "text-slate-400"} />
                </div>
            </div>

            {/* コンテンツ */}
            <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: `${color}cc` }}>
                        {CATEGORY_LABELS[data.category] || data.category}
                    </span>
                </div>
                <div className="text-sm font-bold leading-tight"
                    style={{ color: 'var(--hf-text-primary)' }}>
                    {data.label}
                </div>
                {/* ステータスバッジ */}
                <div className="mt-2 flex items-center">
                    <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: status.bgColor, color: status.color }}
                    >
                        {status.icon} {status.label}
                    </span>
                </div>
            </div>
        </div>
    );
});

export default CustomNode;
