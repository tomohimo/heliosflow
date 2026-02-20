import { useState } from 'react';
import {
    StatusMap, AssigneeMap, DueDateMap, MemoMap,
    loadStatusFromStorage, saveStatusToStorage,
    loadAssigneeFromStorage, saveAssigneeToStorage,
    loadDueDateFromStorage, saveDueDateToStorage,
    loadMemoFromStorage, saveMemoToStorage,
} from '@/utils/excelStatus';

/**
 * ノードに紐づくデータ（ステータス・担当者・期日・メモ）の
 * 状態管理を一括で行うカスタムフック
 */
export const useNodeData = () => {
    // ステータス管理
    const [statusMap, setStatusMap] = useState<StatusMap>(loadStatusFromStorage);

    // 担当者管理
    const [assigneeMap, setAssigneeMap] = useState<AssigneeMap>(loadAssigneeFromStorage);

    // 期日管理
    const [dueDateMap, setDueDateMap] = useState<DueDateMap>(loadDueDateFromStorage);

    // メモ管理
    const [memoMap, setMemoMap] = useState<MemoMap>(loadMemoFromStorage);

    // 案件名管理
    const [projectName, setProjectName] = useState(() => {
        return localStorage.getItem('heliosflow_project') || '';
    });

    // 更新日管理
    const [lastUpdated, setLastUpdated] = useState(() => {
        return localStorage.getItem('heliosflow_updated') || '';
    });

    // 更新日タイムスタンプを更新する
    const updateTimestamp = () => {
        const now = new Date();
        const ts = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setLastUpdated(ts);
        localStorage.setItem('heliosflow_updated', ts);
    };

    // --- ハンドラ ---

    const handleStatusChange = (nodeId: string, status: string) => {
        setStatusMap(prev => {
            const next = { ...prev, [nodeId]: status };
            saveStatusToStorage(next);
            return next;
        });
        updateTimestamp();
    };

    const handleAssigneeChange = (nodeId: string, assignee: string) => {
        setAssigneeMap(prev => {
            const next = { ...prev, [nodeId]: assignee };
            saveAssigneeToStorage(next);
            return next;
        });
        updateTimestamp();
    };

    const handleDueDateChange = (nodeId: string, date: string) => {
        setDueDateMap(prev => {
            const next = { ...prev, [nodeId]: date };
            saveDueDateToStorage(next);
            return next;
        });
        updateTimestamp();
    };

    const handleMemoChange = (nodeId: string, memo: string) => {
        setMemoMap(prev => {
            const next = { ...prev, [nodeId]: memo };
            saveMemoToStorage(next);
            return next;
        });
        updateTimestamp();
    };

    const handleProjectNameChange = (name: string) => {
        setProjectName(name);
        localStorage.setItem('heliosflow_project', name);
    };

    // すべての状態をクリアする
    const clearAllData = () => {
        setStatusMap({});
        saveStatusToStorage({});
        setAssigneeMap({});
        saveAssigneeToStorage({});
        setDueDateMap({});
        saveDueDateToStorage({});
        setMemoMap({});
        saveMemoToStorage({});
        handleProjectNameChange('');
        setLastUpdated('');
        localStorage.removeItem('heliosflow_updated');
    };

    return {
        // 状態
        statusMap, setStatusMap,
        assigneeMap, setAssigneeMap,
        dueDateMap, setDueDateMap,
        memoMap, setMemoMap,
        projectName,
        lastUpdated,

        // ハンドラ
        handleStatusChange,
        handleAssigneeChange,
        handleDueDateChange,
        handleMemoChange,
        handleProjectNameChange,
        updateTimestamp,
        clearAllData,
    };
};
