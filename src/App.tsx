import { useState, useEffect, useMemo, useRef } from 'react';
import { useNodesState, useEdgesState, ReactFlowProvider, Node, Edge, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Search, List, LayoutDashboard, Info, Star, X, ExternalLink, Filter, Download, Upload, Loader2, Moon, Sun, RotateCcw } from 'lucide-react';

import { AppData, NodeData } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS, NODE_STATUSES } from '@/constants';
import { loadStatusFromStorage, saveStatusToStorage, exportStatusToExcel, importStatusFromExcel, StatusMap } from '@/utils/excelStatus';
import FlowView from '@/components/FlowView';
import CategoryPill from '@/components/CategoryPill';
import ListView from '@/pages/ListView';
import AboutView from '@/pages/AboutView';

// 座標表示（開発用）
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

// --- メインアプリ ---
const App = () => {
    const [nodes, setNodes] = useNodesState<Node>([]);
    const [edges, setEdges] = useEdgesState<Edge>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [favorites, setFavorites] = useState<string[]>(() => {
        const saved = localStorage.getItem('helios_favorites');
        return saved ? JSON.parse(saved) : [];
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    // テーマ管理
    const [theme, setTheme] = useState(() => localStorage.getItem('helios_theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('helios_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // ステータス管理
    const [statusMap, setStatusMap] = useState<StatusMap>(loadStatusFromStorage);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 案件名管理
    const [projectName, setProjectName] = useState(() => {
        return localStorage.getItem('heliosflow_project') || '';
    });
    const handleProjectNameChange = (name: string) => {
        setProjectName(name);
        localStorage.setItem('heliosflow_project', name);
    };

    // 更新日管理
    const [lastUpdated, setLastUpdated] = useState(() => {
        return localStorage.getItem('heliosflow_updated') || '';
    });
    const updateTimestamp = () => {
        const now = new Date();
        const ts = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setLastUpdated(ts);
        localStorage.setItem('heliosflow_updated', ts);
    };

    // ステータス変更ハンドラ
    const handleStatusChange = (nodeId: string, status: string) => {
        setStatusMap(prev => {
            const next = { ...prev, [nodeId]: status };
            saveStatusToStorage(next);
            return next;
        });
        updateTimestamp();
    };

    // Excelエクスポート
    const handleExport = () => {
        exportStatusToExcel(
            nodes.map(n => ({ id: n.id, data: n.data as any })),
            statusMap,
            projectName
        );
    };

    // Excelインポート
    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const { statusMap: imported, projectName: importedName } = await importStatusFromExcel(file);
            setStatusMap(imported);
            saveStatusToStorage(imported);
            if (importedName) {
                handleProjectNameChange(importedName);
            }
            alert(`${Object.keys(imported).length} 件のステータスをインポートしました。`);
        } catch (err: any) {
            alert(err.message || 'インポートに失敗しました。');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // データ読み込み
    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}data.json`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to load data.json");
                return res.json();
            })
            .then((data: AppData) => {
                const nodeIds = new Set(data.nodes.map(n => n.id));
                if (nodeIds.size !== data.nodes.length) throw new Error("Duplicate Node IDs found.");

                const rfNodes = data.nodes.map(n => ({
                    id: n.id,
                    position: n.position,
                    data: {
                        label: n.title,
                        description: n.description,
                        category: n.category,
                        tags: n.tags,
                        links: n.links || [],
                        inputs: n.inputs || [],
                        outputs: n.outputs || [],
                        next: n.next || []
                    },
                    type: 'custom',
                    // ミニマップ表示に必要なサイズ情報
                    width: n.category === 'junction' ? 12 : 200,
                    height: n.category === 'junction' ? 12 : 80,
                }));

                const rfEdges = data.edges.map(e => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    sourceHandle: e.sourceHandle,
                    targetHandle: e.targetHandle,
                    label: e.label,
                    type: 'smoothstep',
                    animated: e.animated
                }));

                setNodes(rfNodes as Node[]);
                setEdges(rfEdges as Edge[]);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // フィルターロジック
    const filteredNodes = useMemo(() => {
        return nodes.filter(n => {
            const data = n.data as NodeData;
            const matchesSearch = data.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                n.id.toLowerCase().includes(searchTerm.toLowerCase());

            // カテゴリまたはお気に入りでのフィルタリング
            let matchesCat = true;
            if (activeCategory === 'favorites') {
                matchesCat = favorites.includes(n.id);
            } else if (activeCategory !== 'all') {
                matchesCat = data.category === activeCategory;
            }

            return matchesSearch && matchesCat;
        });
    }, [nodes, searchTerm, activeCategory, favorites]);

    // お気に入りロジック
    useEffect(() => {
        const handleFav = (e: any) => {
            const id = e.detail.id;
            setFavorites(prev => {
                const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
                localStorage.setItem('helios_favorites', JSON.stringify(next));
                return next;
            });
        };
        window.addEventListener('toggleFav', handleFav);
        return () => window.removeEventListener('toggleFav', handleFav);
    }, []);

    // ローディング画面
    if (loading) return (
        <div className="h-screen w-screen flex flex-col items-center justify-center gap-4"
            style={{ background: 'var(--hf-bg-primary)' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--hf-accent)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--hf-text-secondary)' }}>
                フローデータを読み込み中...
            </span>
        </div>
    );

    // エラー画面
    if (error) return (
        <div className="h-screen w-screen flex flex-col items-center justify-center gap-4"
            style={{ background: 'var(--hf-bg-primary)' }}>
            <div className="text-red-400 font-bold text-lg">エラーが発生しました</div>
            <div className="text-sm font-mono p-4 rounded-lg max-w-lg" style={{ color: 'var(--hf-text-secondary)', background: 'var(--hf-bg-elevated)', border: '1px solid rgba(239,68,68,0.3)' }}>
                {error}
            </div>
        </div>
    );

    const selectedNodeData = selectedNode?.data as NodeData | undefined;
    const selectedColor = selectedNodeData ? (CATEGORY_COLORS[selectedNodeData.category] || CATEGORY_COLORS.default) : '#6366f1';

    return (
        <HashRouter>
            <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ background: 'var(--hf-bg-primary)' }}>

                {/* ========== ヘッダー ========== */}
                <header
                    className="h-14 flex items-center px-4 justify-between shrink-0 z-20 relative transition-colors duration-300"
                    style={{
                        background: 'rgba(var(--hf-bg-elevated), 0.85)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderBottom: '1px solid var(--hf-border-light)',
                    }}
                >
                    {/* ロゴ + 案件名 */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
                            HF
                        </div>
                        <span className="hidden sm:inline text-sm font-bold tracking-tight" style={{ color: 'var(--hf-text-primary)' }}>
                            Helios Flow
                        </span>
                        <div className="hidden sm:block w-px h-5 mx-1" style={{ background: 'var(--hf-border-light)' }} />
                        <input
                            type="text"
                            value={projectName}
                            onChange={e => handleProjectNameChange(e.target.value)}
                            placeholder="案件名を入力"
                            className="text-sm font-medium px-2.5 py-1 rounded-md w-36 sm:w-52 outline-none transition-all duration-200 focus:ring-2"
                            style={{
                                background: 'var(--hf-bg-elevated)',
                                color: 'var(--hf-text-primary)',
                                border: '1px solid var(--hf-border-light)',
                            }}
                        />
                        {lastUpdated && (
                            <span className="text-[10px] hidden sm:inline whitespace-nowrap" style={{ color: 'var(--hf-text-muted)' }}>
                                更新: {lastUpdated}
                            </span>
                        )}
                    </div>

                    {/* ナビゲーション */}
                    <nav className="flex p-1 rounded-lg gap-0.5" style={{ background: 'var(--hf-bg-elevated)' }}>
                        <HeaderLink to="/" icon={<LayoutDashboard size={14} />} label="フロー" />
                        <HeaderLink to="/list" icon={<List size={14} />} label="一覧" />
                        <HeaderLink to="/about" icon={<Info size={14} />} label="情報" />
                    </nav>

                    {/* インポート / エクスポート / テーマ切り替え */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={toggleTheme}
                            className="flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 hover:bg-slate-100/10"
                            style={{ color: 'var(--hf-text-secondary)' }}
                            title={theme === 'dark' ? 'ライトモードへ' : 'ダークモードへ'}
                        >
                            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                        </button>
                        <div className="w-px h-4 mx-1" style={{ background: 'var(--hf-border-light)' }} />
                        <button
                            onClick={() => {
                                if (window.confirm('現在の状態と案件名をすべてクリアしますか？')) {
                                    setStatusMap({});
                                    saveStatusToStorage({});
                                    handleProjectNameChange('');
                                    setLastUpdated('');
                                    localStorage.removeItem('heliosflow_updated');
                                }
                            }}
                            className="flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 hover:bg-red-500/10 hover:text-red-500"
                            style={{ color: 'var(--hf-text-secondary)' }}
                            title="状態をクリア"
                        >
                            <span className="sr-only">クリア</span>
                            <RotateCcw size={15} />
                        </button>
                        <div className="w-px h-4 mx-1" style={{ background: 'var(--hf-border-light)' }} />
                        <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 hover:brightness-125"
                            style={{ color: 'var(--hf-text-secondary)', border: '1px solid var(--hf-border-light)' }}
                            title="Excelインポート"
                        >
                            <Upload size={13} />
                            <span className="hidden sm:inline">インポート</span>
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
                            style={{
                                background: 'var(--hf-accent)',
                                color: '#fff',
                            }}
                            title="Excelエクスポート"
                        >
                            <Download size={13} />
                            <span className="hidden sm:inline">エクスポート</span>
                        </button>
                    </div>
                </header>

                {/* カテゴリフィルター（一時的に無効化） */}
                <div className="h-10 flex items-center px-4 gap-2 overflow-x-auto shrink-0 scrollbar-hide hidden"
                    style={{ background: 'var(--hf-bg-secondary)', borderBottom: '1px solid var(--hf-border)' }}>
                    <Filter size={14} style={{ color: 'var(--hf-text-muted)' }} />
                    <CategoryPill label="すべて" color="#64748b" active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} />
                    {Object.keys(CATEGORY_COLORS).filter(k => k !== 'default').map(cat => (
                        <CategoryPill key={cat} label={CATEGORY_LABELS[cat] || cat} color={CATEGORY_COLORS[cat]} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
                    ))}
                </div>

                {/* ========== メインコンテンツ ========== */}
                <div className="flex-1 relative overflow-hidden">
                    <Routes>
                        <Route path="/" element={
                            <div className="h-full w-full relative">
                                <ReactFlowProvider>
                                    <FlowView
                                        nodes={filteredNodes}
                                        edges={edges}
                                        statusMap={statusMap}
                                        onNodeClick={(n) => setSelectedNode(prev => prev?.id === n.id ? null : n)}
                                        onInit={() => { }}
                                        favorites={favorites}
                                    />
                                    <CursorPosDisplay />
                                </ReactFlowProvider>

                                {/* 検索＆フィルターオーバーレイ */}
                                <div className="absolute top-4 left-4 z-10 flex gap-2">
                                    <div className="glass rounded-xl flex items-center px-3 py-2.5 gap-2.5 w-64"
                                        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                                        <Search size={15} style={{ color: 'var(--hf-accent-light)', flexShrink: 0 }} />
                                        <input
                                            className="w-full text-sm outline-none bg-transparent"
                                            style={{ color: 'var(--hf-text-primary)' }}
                                            placeholder="ノードを検索..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    {/* お気に入りフィルター */}
                                    <button
                                        onClick={() => setActiveCategory(prev => prev === 'favorites' ? 'all' : 'favorites')}
                                        className={`glass rounded-xl w-10 flex items-center justify-center transition-all duration-200 ${activeCategory === 'favorites' ? 'ring-2 ring-amber-400' : ''}`}
                                        style={{
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                            background: activeCategory === 'favorites' ? 'rgba(251, 191, 36, 0.2)' : undefined
                                        }}
                                        title="お気に入りのみ表示"
                                    >
                                        <Star size={16} className={activeCategory === 'favorites' ? "fill-amber-400 text-amber-400" : "text-slate-400"} />
                                    </button>
                                </div>
                            </div>
                        } />
                        <Route path="/list" element={<ListView nodes={nodes} favorites={favorites} statusMap={statusMap} />} />
                        <Route path="/about" element={<AboutView />} />
                    </Routes>

                    {/* ========== 詳細モーダル ========== */}
                    {selectedNode && selectedNodeData && (
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
                                    onClick={() => setSelectedNode(null)}
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
                                                    onClick={() => handleStatusChange(selectedNode.id, key)}
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
                                    onClick={() => {
                                        const event = new CustomEvent('toggleFav', { detail: { id: selectedNode.id } });
                                        window.dispatchEvent(event);
                                    }}
                                    className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200"
                                    style={{
                                        background: favorites.includes(selectedNode.id) ? 'rgba(251, 191, 36, 0.1)' : 'var(--hf-bg-card)',
                                        border: favorites.includes(selectedNode.id) ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid var(--hf-border-light)',
                                        color: favorites.includes(selectedNode.id) ? 'var(--hf-accent)' : 'var(--hf-text-secondary)', // 黄色だとライトテーマで見にくい場合があるので調整
                                    }}
                                >
                                    <Star size={12} className={favorites.includes(selectedNode.id) ? "fill-amber-400 text-amber-400" : ""} />
                                    {favorites.includes(selectedNode.id) ? "お気に入り済み" : "お気に入りに追加"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </HashRouter>
    );
};

// --- ヘッダーリンク ---
const HeaderLink = ({ to, icon, label }: { to: string, icon: any, label: string }) => {
    const loc = useLocation();
    const active = loc.pathname === to;
    return (
        <Link
            to={to}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-200"
            style={{
                background: active ? 'var(--hf-accent)' : 'transparent',
                color: active ? '#fff' : 'var(--hf-text-secondary)',
            }}
        >
            {icon}
            {label}
        </Link>
    );
};

export default App;
