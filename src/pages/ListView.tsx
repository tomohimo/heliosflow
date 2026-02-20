import { useState, useMemo } from 'react';
import { Star, ArrowUpDown, Search } from 'lucide-react';
import { Node } from '@xyflow/react';
import { NodeData } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS, NODE_STATUSES } from '@/constants';
import { StatusMap } from '@/utils/excelStatus';

const ListView = ({ nodes, favorites, statusMap }: { nodes: Node[], favorites: string[], statusMap: StatusMap }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    const filteredAndSortedNodes = useMemo(() => {
        let result = nodes.filter(n => {
            const data = n.data as NodeData;
            if (data.category === 'junction') return false;

            const matchesSearch = data.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                n.id.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = categoryFilter === 'all' || data.category === categoryFilter;

            const statusKey = statusMap[n.id] || 'pending';
            const matchesStatus = statusFilter === 'all' || statusKey === statusFilter;

            return matchesSearch && matchesCategory && matchesStatus;
        });

        if (sortConfig) {
            result.sort((a, b) => {
                const dataA = a.data as NodeData;
                const dataB = b.data as NodeData;

                let valA: any = '';
                let valB: any = '';

                switch (sortConfig.key) {
                    case 'id':
                        valA = a.id;
                        valB = b.id;
                        break;
                    case 'title':
                        valA = dataA.label;
                        valB = dataB.label;
                        break;
                    case 'category':
                        valA = CATEGORY_LABELS[dataA.category] || dataA.category;
                        valB = CATEGORY_LABELS[dataB.category] || dataB.category;
                        break;
                    case 'status':
                        const labelA = NODE_STATUSES[statusMap[a.id] || 'pending'].label;
                        const labelB = NODE_STATUSES[statusMap[b.id] || 'pending'].label;
                        valA = labelA;
                        valB = labelB;
                        break;
                    case 'fav':
                        valA = favorites.includes(a.id) ? 1 : 0;
                        valB = favorites.includes(b.id) ? 1 : 0;
                        break;
                    default:
                        return 0;
                }

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [nodes, searchTerm, categoryFilter, statusFilter, sortConfig, statusMap, favorites]);

    const handleSort = (key: string) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const SortIcon = ({ colKey }: { colKey: string }) => {
        if (sortConfig?.key !== colKey) return <ArrowUpDown size={12} className="opacity-30" />;
        return <ArrowUpDown size={12} className={sortConfig.direction === 'asc' ? 'opacity-100' : 'opacity-100 rotate-180'} />;
    };

    return (
        <div className="h-full w-full overflow-y-auto p-4 sm:p-8" style={{ background: 'var(--hf-bg-primary)' }}>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-3" style={{ color: 'var(--hf-text-primary)' }}>
                        <div className="w-1 h-6 rounded-full" style={{ background: 'var(--hf-accent)' }} />
                        タスク一覧
                        <span className="text-sm font-normal" style={{ color: 'var(--hf-text-muted)' }}>
                            ({filteredAndSortedNodes.length} / {nodes.filter(n => (n.data as NodeData).category !== 'junction').length} 件)
                        </span>
                    </h2>

                    <div className="flex flex-wrap gap-2">
                        {/* 検索 */}
                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="検索..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-8 pr-3 py-1.5 rounded-lg text-xs w-40 outline-none border transition-all"
                                style={{
                                    background: 'var(--hf-bg-elevated)',
                                    color: 'var(--hf-text-primary)',
                                    borderColor: 'var(--hf-border-light)'
                                }}
                            />
                        </div>

                        {/* カテゴリフィルター */}
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg text-xs outline-none border cursor-pointer"
                            style={{
                                background: 'var(--hf-bg-elevated)',
                                color: 'var(--hf-text-primary)',
                                borderColor: 'var(--hf-border-light)'
                            }}
                        >
                            <option value="all">カテゴリ: すべて</option>
                            {Object.keys(CATEGORY_COLORS).filter(k => k !== 'default').map(cat => (
                                <option key={cat} value={cat}>{CATEGORY_LABELS[cat] || cat}</option>
                            ))}
                        </select>

                        {/* ステータスフィルター */}
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg text-xs outline-none border cursor-pointer"
                            style={{
                                background: 'var(--hf-bg-elevated)',
                                color: 'var(--hf-text-primary)',
                                borderColor: 'var(--hf-border-light)'
                            }}
                        >
                            <option value="all">ステータス: すべて</option>
                            {Object.entries(NODE_STATUSES).map(([key, st]) => (
                                <option key={key} value={key}>{st.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

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
                                <th onClick={() => handleSort('fav')} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors" style={{ color: 'var(--hf-text-muted)' }}>
                                    <div className="flex items-center gap-1">★ <SortIcon colKey="fav" /></div>
                                </th>
                                <th onClick={() => handleSort('id')} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors" style={{ color: 'var(--hf-text-muted)' }}>
                                    <div className="flex items-center gap-1">ID <SortIcon colKey="id" /></div>
                                </th>
                                <th onClick={() => handleSort('title')} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors" style={{ color: 'var(--hf-text-muted)' }}>
                                    <div className="flex items-center gap-1">タイトル <SortIcon colKey="title" /></div>
                                </th>
                                <th onClick={() => handleSort('category')} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors" style={{ color: 'var(--hf-text-muted)' }}>
                                    <div className="flex items-center gap-1">カテゴリ <SortIcon colKey="category" /></div>
                                </th>
                                <th onClick={() => handleSort('status')} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors" style={{ color: 'var(--hf-text-muted)' }}>
                                    <div className="flex items-center gap-1">ステータス <SortIcon colKey="status" /></div>
                                </th>
                                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--hf-text-muted)' }}>タグ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedNodes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--hf-text-secondary)' }}>
                                        該当するタスクはありません。
                                    </td>
                                </tr>
                            ) : (
                                filteredAndSortedNodes.map(n => {
                                    const data = n.data as NodeData;
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
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ListView;
