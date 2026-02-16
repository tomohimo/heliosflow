import { useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Panel, Node, Edge } from '@xyflow/react';
import { MIN_ZOOM, CATEGORY_COLORS } from '@/constants';
import { StatusMap } from '@/utils/excelStatus';
import CustomNode from '@/components/CustomNode';
import JunctionNode from '@/components/JunctionNode';

const FlowView = ({
    nodes, edges, statusMap, onNodeClick, onInit, favorites
}: {
    nodes: Node[], edges: Edge[], statusMap: StatusMap, onNodeClick: (n: Node) => void, onInit: any, favorites: string[]
}) => {
    // ノードタイプ定義
    const nodeTypes = useMemo(() => ({ custom: CustomNode, junction: JunctionNode }), []);

    // ノードにお気に入り・ステータス情報を付与
    const nodesWithState = useMemo(() => {
        return nodes.map(n => ({
            ...n,
            type: (n.data as any).category === 'junction' ? 'junction' : 'custom',
            data: {
                ...n.data,
                isFav: favorites.includes(n.id),
                nodeStatus: statusMap[n.id] || 'pending'
            }
        }));
    }, [nodes, favorites, statusMap]);

    return (
        <div className="h-full w-full relative" style={{ background: 'var(--hf-bg-primary)' }}>
            <ReactFlow
                nodes={nodesWithState}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodeClick={(_, node) => {
                    if (node.type !== 'junction') onNodeClick(node);
                }}
                onInit={onInit}
                fitView
                minZoom={MIN_ZOOM}
                maxZoom={2}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: false,
                    style: { stroke: 'var(--hf-border-light)', strokeWidth: 2 }
                }}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="var(--hf-border-light)" gap={24} size={1} />
                <Controls showInteractive={false} />
                <MiniMap
                    nodeColor={n => {
                        const cat = (n.data as any)?.category;
                        return cat ? (CATEGORY_COLORS[cat] || '#94a3b8') : '#94a3b8';
                    }}
                    nodeStrokeWidth={3}
                    maskColor="var(--hf-minimap-mask)"
                    zoomable
                    pannable
                />
                <Panel
                    position="top-right"
                    className="glass rounded-lg px-3 py-1.5 text-xs font-medium"
                    style={{ color: 'var(--hf-text-secondary)' }}
                >
                    <span style={{ color: 'var(--hf-accent-light)' }}>{nodes.length}</span> ノード
                    <span className="mx-1.5 opacity-30">·</span>
                    <span style={{ color: 'var(--hf-accent-light)' }}>{edges.length}</span> エッジ
                </Panel>
            </ReactFlow>
        </div>
    );
};

export default FlowView;
