import { Node } from '@xyflow/react';
import { X, ExternalLink, Star } from 'lucide-react';
import { NodeData } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS, NODE_STATUSES } from '@/constants';
import { StatusMap, AssigneeMap, DueDateMap, MemoMap } from '@/utils/excelStatus';
import MultiSelectAssignee from '@/components/MultiSelectAssignee';

type NodeDetailModalProps = {
    selectedNode: Node;
    onClose: () => void;
    statusMap: StatusMap;
    assigneeMap: AssigneeMap;
    dueDateMap: DueDateMap;
    memoMap: MemoMap;
    favorites: string[];
    onStatusChange: (nodeId: string, status: string) => void;
    onAssigneeChange: (nodeId: string, assignee: string) => void;
    onDueDateChange: (nodeId: string, date: string) => void;
    onMemoChange: (nodeId: string, memo: string) => void;
    onToggleFav: (nodeId: string) => void;
};

/**
 * ノード詳細モーダルコンポーネント
 * フロー画面でノードをクリックした際に表示されるサイドパネル
 */
const NodeDetailModal = ({
    selectedNode,
    onClose,
    statusMap,
    assigneeMap,
    dueDateMap,
    memoMap,
    favorites,
    onStatusChange,
    onAssigneeChange,
    onDueDateChange,
    onMemoChange,
    onToggleFav,
}: NodeDetailModalProps) => {
    const selectedNodeData = selectedNode.data as NodeData;
    const selectedColor = CATEGORY_COLORS[selectedNodeData.category] || CATEGORY_COLORS.default;
    const isFavorite = favorites.includes(selectedNode.id);

    return (
        <div
            className="absolute top-4 right-4 z-50 w-[340px] rounded-2xl flex flex-col overflow-hidden max-h-[calc(100vh-100px)] animate-slide-in-right"
            style={{
                background: 'linear-gradient(180deg, var(--hf-bg-elevated), var(--hf-bg-secondary))',
                border: '1px solid var(--hf-border-light)',
                boxShadow: '0 16px 64px var(--hf-shadow), 0 0 0 1px var(--hf-border)',
            }}
        >
            {/* カテゴリカラーライン */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${selectedColor}, ${selectedColor}40)` }} />

            {/* ヘッダー */}
            <div className="p-5 flex justify-between items-start" style={{ borderBottom: '1px solid var(--hf-border)' }}>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
                            style={{ background: `${selectedColor}15`, color: selectedColor }}>
                            {CATEGORY_LABELS[selectedNodeData.category] || selectedNodeData.category}
                        </span>
                        <span className="text-[10px] font-mono" style={{ color: 'var(--hf-text-muted)' }}>
                            {selectedNode.id}
                        </span>
                    </div>
                    <h2 className="text-lg font-bold leading-tight" style={{ color: 'var(--hf-text-primary)' }}>
                        {selectedNodeData.label}
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ml-3"
                    style={{ color: 'var(--hf-text-muted)', background: 'var(--hf-bg-card)' }}
                >
                    <X size={14} />
                </button>
            </div>

            {/* スクロールコンテンツ */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5">

                {/* ステータス選択 */}
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--hf-text-muted)' }}>ステータス</div>
                    <div className="flex flex-wrap gap-1.5">
                        {Object.entries(NODE_STATUSES).map(([key, s]) => {
                            const isActive = (statusMap[selectedNode.id] || 'pending') === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => onStatusChange(selectedNode.id, key)}
                                    className="text-[11px] px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5"
                                    style={{
                                        border: `1px solid ${isActive ? s.color : 'var(--hf-border-light)'}`,
                                        background: isActive ? s.bgColor : 'transparent',
                                        color: isActive ? s.color : 'var(--hf-text-secondary)',
                                        fontWeight: isActive ? 600 : 400,
                                    }}
                                >
                                    <span className="text-[9px]">{s.icon}</span> {s.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 担当者 */}
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--hf-text-muted)' }}>担当者</div>
                    <MultiSelectAssignee
                        selected={assigneeMap[selectedNode.id] || ''}
                        onChange={(val) => onAssigneeChange(selectedNode.id, val)}
                    />
                </div>

                {/* 期日 */}
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--hf-text-muted)' }}>期日</div>
                    <div className="relative group">
                        <div
                            className="w-full px-3 py-2 text-sm rounded-lg border transition-colors flex items-center min-h-[38px]"
                            style={{
                                background: 'var(--hf-bg-elevated)',
                                color: dueDateMap[selectedNode.id] ? 'var(--hf-text-primary)' : 'var(--hf-text-muted)',
                                border: '1px solid var(--hf-border)',
                            }}
                        >
                            {(() => {
                                const dateStr = dueDateMap[selectedNode.id];
                                if (!dateStr) return '未設定';
                                try {
                                    const [y, m, d] = dateStr.split('-').map(Number);
                                    const date = new Date(y, m - 1, d);
                                    const days = ['日', '月', '火', '水', '木', '金', '土'];
                                    return `${y}/${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')} (${days[date.getDay()]})`;
                                } catch {
                                    return dateStr;
                                }
                            })()}
                        </div>
                        <input
                            type="date"
                            value={dueDateMap[selectedNode.id] || ''}
                            onChange={(e) => onDueDateChange(selectedNode.id, e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onClick={(e) => {
                                try {
                                    (e.currentTarget as HTMLInputElement).showPicker();
                                } catch { }
                            }}
                        />
                    </div>
                </div>

                {/* メモ */}
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--hf-text-muted)' }}>メモ</div>
                    <textarea
                        value={memoMap[selectedNode.id] || ''}
                        onChange={(e) => onMemoChange(selectedNode.id, e.target.value)}
                        placeholder="メモを入力..."
                        className="w-full px-3 py-2 text-sm rounded-lg border transition-colors min-h-[80px] outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y"
                        style={{
                            background: 'var(--hf-bg-elevated)',
                            color: 'var(--hf-text-primary)',
                            border: '1px solid var(--hf-border)',
                        }}
                    />
                </div>

                {/* 説明 */}
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--hf-text-muted)' }}>説明</div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--hf-text-secondary)' }}>
                        {selectedNodeData.description || "説明はありません。"}
                    </div>
                </div>

                {/* タグ */}
                {selectedNodeData.tags?.length > 0 && (
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--hf-text-muted)' }}>タグ</div>
                        <div className="flex flex-wrap gap-1.5">
                            {selectedNodeData.tags.map((t: string) => (
                                <span key={t} className="text-[11px] px-2 py-0.5 rounded-md"
                                    style={{ color: 'var(--hf-text-secondary)', background: 'var(--hf-bg-card)', border: '1px solid var(--hf-border)' }}>
                                    #{t}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* リンク */}
                {selectedNodeData.links?.length > 0 && (
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--hf-text-muted)' }}>リンク</div>
                        <div className="flex flex-col gap-1.5">
                            {selectedNodeData.links.map((l: any, i: number) => (
                                <a key={i} href={l.url} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-all duration-200"
                                    style={{
                                        color: 'var(--hf-accent-light)',
                                        background: 'var(--hf-bg-card)',
                                        border: '1px solid var(--hf-border)',
                                    }}>
                                    <ExternalLink size={13} />
                                    {l.label}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* フッター */}
            <div className="px-5 py-3 flex justify-end" style={{ borderTop: '1px solid var(--hf-border)' }}>
                <button
                    onClick={() => onToggleFav(selectedNode.id)}
                    className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200"
                    style={{
                        background: isFavorite ? 'rgba(251, 191, 36, 0.1)' : 'var(--hf-bg-card)',
                        border: isFavorite ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid var(--hf-border-light)',
                        color: isFavorite ? 'var(--hf-accent)' : 'var(--hf-text-secondary)',
                    }}
                >
                    <Star size={12} className={isFavorite ? "fill-amber-400 text-amber-400" : ""} />
                    {isFavorite ? "お気に入り済み" : "お気に入りに追加"}
                </button>
            </div>
        </div>
    );
};

export default NodeDetailModal;
