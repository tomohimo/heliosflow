// 使い方ページ — Helios Flow 操作マニュアル
import { BookOpen, MousePointer, ListFilter, CalendarDays, FileSpreadsheet, Palette, AlertTriangle, Star, RotateCcw } from 'lucide-react';

// セクションカードのコンポーネント
const Section = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div
        className="p-5 rounded-xl"
        style={{
            background: 'var(--hf-bg-card)',
            border: '1px solid var(--hf-border-light)',
        }}
    >
        <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'var(--hf-accent)', color: '#fff' }}>
                {icon}
            </div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--hf-text-primary)' }}>{title}</h3>
        </div>
        <div className="text-xs leading-relaxed space-y-2" style={{ color: 'var(--hf-text-secondary)' }}>
            {children}
        </div>
    </div>
);

// 操作説明の1行コンポーネント
const Item = ({ label, desc }: { label: string, desc: string }) => (
    <div className="flex gap-2">
        <span className="font-bold shrink-0" style={{ color: 'var(--hf-text-primary)' }}>・{label}：</span>
        <span>{desc}</span>
    </div>
);

const ManualView = () => (
    <div className="h-full w-full overflow-y-auto p-6"
        style={{ background: 'var(--hf-bg-primary)' }}>
        <div className="max-w-2xl mx-auto space-y-6">

            {/* ヘッダー */}
            <div className="text-center mb-8">
                <div
                    className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-white mb-4"
                    style={{ background: 'linear-gradient(135deg, var(--hf-accent), var(--hf-accent-light))', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}
                >
                    <BookOpen size={24} />
                </div>
                <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--hf-text-primary)' }}>使い方ガイド</h1>
                <p className="text-xs" style={{ color: 'var(--hf-text-muted)' }}>Helios Flow の基本操作を説明します</p>
            </div>

            {/* 前提：データ保存について */}
            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 text-sm">
                <h3 className="font-bold flex items-center gap-2 mb-2" style={{ color: 'var(--hf-text-primary)' }}>
                    <FileSpreadsheet size={18} className="text-blue-500" />
                    重要：データの保存について
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--hf-text-secondary)' }}>
                    本アプリはデータベースを使用していません。入力したデータ（ステータス、担当者、期日など）は、お使いのブラウザに一時的に保存されますが、
                    <strong>別のパソコンで開いたり、ブラウザのキャッシュをクリアすると消えてしまいます。</strong>
                </p>
                <p className="mt-2 font-bold" style={{ color: 'var(--hf-text-primary)' }}>
                    業務の終了時や、データを共有したい場合は、必ず「エクスポート」機能を使ってExcelファイルとして保存してください。<br />
                    次回利用時は、そのExcelファイルを「インポート」して作業を再開します。
                </p>
            </div>

            {/* フロー画面 */}
            <Section icon={<MousePointer size={16} />} title="フロー画面">
                <Item label="ノードクリック" desc="ノードをクリックすると、右側に詳細モーダルが表示されます。ステータス・担当者・期日の変更が可能です。" />
                <Item label="検索" desc="左上の検索バーにキーワードを入力すると、該当するノードのみがフロー上に表示されます。" />
                <Item label="お気に入り" desc="ノードにマウスを乗せると右上に ☆ アイコンが表示されます。クリックでお気に入り登録できます。" />
                <Item label="お気に入りフィルター" desc="検索バー右の ☆ ボタンで、お気に入りに登録したノードだけを表示できます。" />
                <Item label="ズーム・パン" desc="マウスホイールでズーム、ドラッグでパン（移動）ができます。左下のコントロールボタンも利用可能です。" />
                <Item label="ミニマップ" desc="右下のミニマップで全体像を把握できます。ドラッグで表示位置を移動できます。" />
            </Section>

            {/* 一覧画面 */}
            <Section icon={<ListFilter size={16} />} title="一覧画面">
                <Item label="検索" desc="ノード名やIDで絞り込みが可能です。" />
                <Item label="フィルター" desc="カテゴリ・ステータス・担当者で絞り込みができます。複数のフィルターを組み合わせて使えます。" />
                <Item label="ソート" desc="各列のヘッダーをクリックすると、昇順⇔降順で並べ替えができます。" />
                <Item label="担当者の設定" desc="担当者列のドロップダウンから、複数の担当者を選択できます。" />
                <Item label="期日の設定" desc="期日列をクリックするとカレンダーが表示され、日付を選択できます。設定後は曜日が自動表示されます。" />
            </Section>

            {/* ステータス管理 */}
            <Section icon={<Star size={16} />} title="ステータス管理">
                <p>ノードの詳細モーダルからステータスを切り替えることができます。各ステータスの意味は以下のとおりです。</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--hf-bg-elevated)', border: '1px solid var(--hf-border)' }}>
                        <span className="font-bold" style={{ color: 'var(--hf-text-primary)' }}>⏳ 未着手</span>
                        <p className="mt-0.5">まだ作業を開始していない状態</p>
                    </div>
                    <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--hf-bg-elevated)', border: '1px solid var(--hf-border)' }}>
                        <span className="font-bold" style={{ color: 'var(--hf-text-primary)' }}>🔄 進行中</span>
                        <p className="mt-0.5">現在作業を進めている状態</p>
                    </div>
                    <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--hf-bg-elevated)', border: '1px solid var(--hf-border)' }}>
                        <span className="font-bold" style={{ color: 'var(--hf-text-primary)' }}>✅ 完了</span>
                        <p className="mt-0.5">作業が完了した状態（フロー上で薄く表示）</p>
                    </div>
                    <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--hf-bg-elevated)', border: '1px solid var(--hf-border)' }}>
                        <span className="font-bold" style={{ color: 'var(--hf-text-primary)' }}>➖ 対象外</span>
                        <p className="mt-0.5">この案件では該当しない項目（フロー上で薄く表示）</p>
                    </div>
                </div>
            </Section>

            {/* 期日管理 */}
            <Section icon={<CalendarDays size={16} />} title="期日管理と警告表示">
                <Item label="期日の設定" desc="一覧画面の期日列、またはモーダルの期日欄から設定できます。クリックでカレンダーが開きます。" />
                <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={14} className="text-red-500" />
                        <span className="font-bold" style={{ color: '#ef4444' }}>赤い警告（期限切れ）</span>
                    </div>
                    <p>期日を過ぎたノードがある場合、フロー画面の右上に赤いポップアップが常時表示されます。</p>
                </div>
                <div className="mt-2 p-3 rounded-lg" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}>
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={14} className="text-amber-400" />
                        <span className="font-bold" style={{ color: '#f59e0b' }}>黄色い警告（期限間近）</span>
                    </div>
                    <p>期日まで残り3日以内のノードがある場合、フロー画面の右上に黄色いポップアップが表示されます。</p>
                </div>
                <p className="mt-2">※ ステータスを「完了」または「対象外」にすると、警告は自動的に消えます。</p>
            </Section>

            {/* データ管理 */}
            <Section icon={<FileSpreadsheet size={16} />} title="データ管理">
                <Item label="エクスポート" desc="ヘッダー右の「エクスポート」ボタンで、現在のステータス・担当者情報をExcelファイルとしてダウンロードできます。" />
                <Item label="インポート" desc="「インポート」ボタンから、以前エクスポートしたExcelファイルを読み込み、状態を復元できます。" />
                <div className="mt-2 p-3 rounded-lg flex items-start gap-2" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <RotateCcw size={14} className="text-red-400 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold" style={{ color: '#ef4444' }}>状態をクリア</span>
                        <p className="mt-0.5">ヘッダーの 🔄 ボタンで、ステータス・担当者・期日・案件名をすべてリセットできます。この操作は取り消せません。</p>
                    </div>
                </div>
            </Section>

            {/* テーマ切替 */}
            <Section icon={<Palette size={16} />} title="テーマ切替">
                <Item label="ダーク / ライト" desc="ヘッダー右の 🌙/☀️ ボタンで、ダークモードとライトモードを切り替えできます。設定はブラウザに保存され、次回以降も維持されます。" />
            </Section>

            {/* フッター */}
            <div className="text-center py-4 text-[10px]" style={{ color: 'var(--hf-text-muted)' }}>
                Helios Flow マニュアル — 最終更新 2026/02/20
            </div>
        </div>
    </div>
);

export default ManualView;
