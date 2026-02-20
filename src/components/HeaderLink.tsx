import { Link, useLocation } from 'react-router-dom';

type HeaderLinkProps = {
    to: string;
    icon: any;
    label: string;
};

/**
 * ヘッダーナビゲーションのリンクコンポーネント
 */
const HeaderLink = ({ to, icon, label }: HeaderLinkProps) => {
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

export default HeaderLink;
