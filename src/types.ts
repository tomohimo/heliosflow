export type NodeData = {
    label: string;
    description: string;
    category: string;
    role?: string;
    status: string;
    tags: string[];
    links: { label: string; url: string }[];
    inputs: string[];
    outputs: string[];
    next?: string[];
    // For UI state
    isFav?: boolean;
};

export type AppData = {
    meta: any;
    nodes: any[];
    edges: any[];
};
