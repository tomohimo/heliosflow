import * as XLSX from 'xlsx';
import { NODE_STATUSES, CATEGORY_LABELS } from '@/constants';

// ステータスマップの型: { [nodeId]: statusKey }
export type StatusMap = Record<string, string>;

// ローカルストレージのキー
const LS_KEY = 'heliosflow_status';

/**
 * ローカルストレージからステータスを読み込む
 */
export const loadStatusFromStorage = (): StatusMap => {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

/**
 * ローカルストレージにステータスを保存する
 */
export const saveStatusToStorage = (statusMap: StatusMap): void => {
    localStorage.setItem(LS_KEY, JSON.stringify(statusMap));
};

/**
 * ステータスラベル → ステータスキーへの逆引き
 */
const labelToKey = (label: string): string => {
    const entry = Object.entries(NODE_STATUSES).find(([, v]) => v.label === label);
    return entry ? entry[0] : 'pending';
};

/**
 * ノードデータをExcelファイルとしてエクスポートする
 */
export const exportStatusToExcel = (
    nodes: Array<{ id: string; data: { label: string; category: string } }>,
    statusMap: StatusMap,
    projectName: string
): void => {
    // 案件名行
    const titleRow = ['案件名', projectName, '', ''];
    // 更新日行
    const dateRow = ['更新日', formatDateDisplay(), '', ''];
    // 空行
    const emptyRow = ['', '', '', ''];
    // ヘッダー行
    const header = ['ID', 'タイトル', 'カテゴリ', 'ステータス'];

    // データ行（junction以外のノードのみ）
    const rows = nodes
        .filter(n => n.data.category !== 'junction')
        .map(n => [
            n.id,
            n.data.label,
            CATEGORY_LABELS[n.data.category] || n.data.category,
            NODE_STATUSES[statusMap[n.id] || 'pending']?.label || '未着手'
        ]);

    // ワークシート作成
    const ws = XLSX.utils.aoa_to_sheet([titleRow, dateRow, emptyRow, header, ...rows]);

    // 列幅の設定
    ws['!cols'] = [
        { wch: 10 },  // ID
        { wch: 30 },  // タイトル
        { wch: 15 },  // カテゴリ
        { wch: 12 },  // ステータス
    ];

    // ワークブック作成・ダウンロード
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ステータス管理');
    XLSX.writeFile(wb, `heliosflow_status_${formatDate()}.xlsx`);
};

/**
 * Excelファイルからステータスをインポートする
 */
export const importStatusFromExcel = (file: File): Promise<{ statusMap: StatusMap; projectName: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: 'array' });

                // 最初のシートを取得
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

                // 案件名を取得（1行目のB列）
                let projectName = '';
                if (rows[0] && rows[0][0] === '案件名' && rows[0][1]) {
                    projectName = String(rows[0][1]).trim();
                }

                // ヘッダー行（3行目）をスキップしてデータ行（4行目以降）を処理
                const statusMap: StatusMap = {};
                const dataStartRow = rows.findIndex((row, i) => i > 0 && row && row[0] === 'ID');
                const startIdx = dataStartRow >= 0 ? dataStartRow + 1 : 3;

                for (let i = startIdx; i < rows.length; i++) {
                    const row = rows[i];
                    if (row && row[0] && row[3]) {
                        const nodeId = String(row[0]).trim();
                        const statusLabel = String(row[3]).trim();
                        statusMap[nodeId] = labelToKey(statusLabel);
                    }
                }

                resolve({ statusMap, projectName });
            } catch (err) {
                reject(new Error('Excelファイルの読み込みに失敗しました。'));
            }
        };
        reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました。'));
        reader.readAsArrayBuffer(file);
    });
};

/**
 * 日付フォーマット（ファイル名用）
 */
const formatDate = (): string => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * 日付フォーマット（表示用）
 */
const formatDateDisplay = (): string => {
    const d = new Date();
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
};
