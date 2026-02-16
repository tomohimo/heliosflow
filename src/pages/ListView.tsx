import { Star } from 'lucide-react';
import { Node } from '@xyflow/react';
import { NodeData } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS, NODE_STATUSES } from '@/constants';
import { StatusMap } from '@/utils/excelStatus';

const ListView = ({ nodes, favorites, statusMap }: { nodes: Node[], favorites: string[], statusMap: StatusMap }) => {
    return (
        <div className="h-full w-full overflow-y-auto p-4 sm:p-8" style={{ background: 'var(--hf-bg-primary)' }}>
            <div className="max-w-5xl mx-auto">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--hf-text-primary)' }}>
                    <div className="w-1 h-6 rounded-full" style={{ background: 'var(--hf-accent)' }} />
                    タスク一覧
                    <span className="text-sm font-normal" style={{ color: 'var(--hf-text-muted)' }}>
                        ({nodes.filter(n => (n.data as NodeData).category !== 'junction').length} 件)
                    </span>
                </h2>

                <div
                    className="rounded-xl overflow-hidden"
                    style={{
                        background: 'var(--hf-bg-elevated)',
                        border: '1px solid var(--hf-border-light)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                    }}
                >
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--hf-border-light)' }}>
                                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--hf-text-muted)' }}>★</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--hf-text-muted)' }}>ID</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--hf-text-muted)' }}>タイトル</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--hf-text-muted)' }}>カテゴリ</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--hf-text-muted)' }}>ステータス</th>
                                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--hf-text-muted)' }}>タグ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {nodes.map(n => {
                                const data = n.data as NodeData;
                                if (data.category === 'junction') return null;
                                const catColor = CATEGORY_COLORS[data.category] || CATEGORY_COLORS.default;
                                const st = NODE_STATUSES[statusMap[n.id] || 'pending'];
                                return (
                                    <tr
                                        key={n.id}
                                        className="group transition-colors"
                                        style={{ borderBottom: '1px solid var(--hf-border)' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.04)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <td className="px-5 py-3.5 w-10">
                                            {favorites.includes(n.id) && <Star size={13} className="fill-amber-400 text-amber-400" />}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <span className="text-[11px] font-mono" style={{ color: 'var(--hf-text-muted)' }}>{n.id}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="text-sm font-semibold" style={{ color: 'var(--hf-text-primary)' }}>{data.label}</div>
                                            <div className="text-[11px] mt-0.5 line-clamp-1" style={{ color: 'var(--hf-text-muted)' }}>{data.description}</div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className="text-[10px] font-semibold px-2 py-1 rounded-md inline-flex items-center gap-1"
                                                style={{ background: `${catColor}15`, color: catColor }}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: catColor }} />
                                                {CATEGORY_LABELS[data.category] || data.category}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className="text-[10px] font-semibold px-2 py-1 rounded-md inline-flex items-center gap-1"
                                                style={{ background: st.bgColor, color: st.color }}
                                            >
                                                <span className="text-[8px]">{st.icon}</span>
                                                {st.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex gap-1">
                                                {data.tags?.slice(0, 2).map((t: string) => (
                                                    <span
                                                        key={t}
                                                        className="text-[10px] px-1.5 py-0.5 rounded"
                                                        style={{ color: 'var(--hf-text-muted)', border: '1px solid var(--hf-border-light)' }}
                                                    >
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ListView;
