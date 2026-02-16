// カテゴリフィルターピル — ダークテーマ対応
const CategoryPill = ({ label, color, active, onClick }: { label: string, color: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap"
        style={{
            background: active ? color : 'transparent',
            color: active ? '#fff' : 'var(--hf-text-secondary)',
            border: `1px solid ${active ? color : 'var(--hf-border-light)'}`,
        }}
    >
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: active ? '#fff' : color }} />
        {label}
    </button>
);

export default CategoryPill;
