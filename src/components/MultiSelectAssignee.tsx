import { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { ASSIGNEES } from '@/constants';

type MultiSelectAssigneeProps = {
    selected: string;   // カンマ区切りの文字列
    onChange: (val: string) => void;
};

/**
 * 複数選択可能な担当者ドロップダウンコンポーネント
 */
const MultiSelectAssignee = ({ selected, onChange }: MultiSelectAssigneeProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedList = selected ? selected.split(',').filter(Boolean) : [];

    // クリック外で閉じる
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as globalThis.Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleAssignee = (name: string) => {
        let newList;
        if (selectedList.includes(name)) {
            newList = selectedList.filter(s => s !== name);
        } else {
            newList = [...selectedList, name];
        }
        onChange(newList.join(','));
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between px-3 py-2 text-sm bg-transparent border rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                style={{
                    color: 'var(--hf-text-primary)',
                    borderColor: 'var(--hf-border)'
                }}
            >
                <div className="truncate mr-2">
                    {selectedList.length > 0 ? selectedList.join(', ') : <span className="text-gray-500">担当者を選択...</span>}
                </div>
                <ChevronDown size={14} className="opacity-50" />
            </div>

            {isOpen && (
                <div
                    className="absolute top-full left-0 z-50 w-full mt-1 rounded-lg shadow-lg overflow-hidden py-1"
                    style={{
                        background: 'var(--hf-bg-elevated)',
                        border: '1px solid var(--hf-border)'
                    }}
                >
                    {ASSIGNEES.map(name => {
                        const isSelected = selectedList.includes(name);
                        return (
                            <div
                                key={name}
                                onClick={() => toggleAssignee(name)}
                                className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-white/10"
                                style={{ color: 'var(--hf-text-primary)' }}
                            >
                                <div className={`w-4 h-4 border rounded mr-2.5 flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-500'}`}>
                                    {isSelected && <Check size={12} className="text-white" />}
                                </div>
                                {name}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MultiSelectAssignee;
