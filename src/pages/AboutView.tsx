// 情報ページ — ダークテーマ対応
const AboutView = () => (
    <div className="h-full w-full overflow-y-auto flex items-center justify-center p-8"
        style={{ background: 'var(--hf-bg-primary)' }}>
        <div
            className="max-w-md w-full p-8 rounded-2xl text-center"
            style={{
                background: 'var(--hf-bg-elevated)',
                border: '1px solid var(--hf-border-light)',
                boxShadow: '0 16px 64px var(--hf-shadow)',
            }}
        >
            <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-bold mb-6"
                style={{ background: 'linear-gradient(135deg, var(--hf-accent), var(--hf-accent-light))', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}
            >
                HF
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--hf-text-primary)' }}>Helios Flow</h1>
            <p className="mb-8 leading-relaxed text-sm" style={{ color: 'var(--hf-text-secondary)' }}>
                建設システムフロー可視化ツール。<br />
                複雑な建設マイルストーンをナビゲートし、<br />
                「次は何？」と迷わないように設計されています。
            </p>

            <div className="text-xs pt-6" style={{ color: 'var(--hf-text-muted)', borderTop: '1px solid var(--hf-border)' }}>
                <p>バージョン 1.0.0</p>
                <p className="mt-1">React Flow & Vite で構築</p>
            </div>
        </div>
    </div>
);

export default AboutView;
