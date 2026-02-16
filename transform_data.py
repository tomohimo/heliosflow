import json
import math

def transform_nodes_to_graph_data(source_path, output_path):
    print(f"Loading {source_path}...")
    try:
        with open(source_path, 'r', encoding='utf-8-sig') as f:
            source_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: {source_path} not found.")
        return

    # Canvas settings
    CANVAS_WIDTH = 5000
    CANVAS_HEIGHT = 2000
    PADDING = 200

    nodes = source_data.get('nodes', [])
    if not nodes:
        print("No nodes found.")
        return

    # Calculate min/max for normalization
    # Illustrator coordinates: y is usually "up positive", but JSON might be exported as is.
    # We will assume:
    # 1. Read x, y as is.
    # 2. Normalize to 0..1
    # 3. Scale to canvas size
    # 4. Flip Y if necessary (Illustrator Y is up, Canvas Y is down. Usually Illustrator export needs flip)

    x_values = [n['position']['x'] for n in nodes]
    y_values = [n['position']['y'] for n in nodes]

    min_x, max_x = min(x_values), max(x_values)
    min_y, max_y = min(y_values), max(y_values)

    print(f"Original Bounds: X[{min_x}, {max_x}], Y[{min_y}, {max_y}]")

    web_nodes = []
    web_edges = []
    existing_edge_ids = set()

    # Pre-process nodes map for easy lookup
    node_map = {n['id']: n for n in nodes}

    for n in nodes:
        # Normalize
        # Avoid division by zero if all points are same
        range_x = (max_x - min_x) if (max_x - min_x) != 0 else 1
        range_y = (max_y - min_y) if (max_y - min_y) != 0 else 1

        norm_x = (n['position']['x'] - min_x) / range_x
        
        # Invert Y for Web (Canvas Y goes down, Illustrator Y goes up)
        # So: (max_y - y) / range
        norm_y = (max_y - n['position']['y']) / range_y

        # Scale
        # Adjust aspect ratio if needed, but simple scaling is safer for now
        web_x = norm_x * (CANVAS_WIDTH - PADDING * 2) + PADDING
        web_y = norm_y * (CANVAS_HEIGHT - PADDING * 2) + PADDING

        # Determine Category ID from phase or type
        # Simple mapping
        category_map = {
            "契約": "contract",
            "契約/土地": "contract",
            "法令/許認可": "legal",
            "法令/保安": "legal",
            "工事準備": "procurement",
            "工事": "construction",
            "工事/契約金": "milestone",
            "工事/調達": "procurement",
            "工事/品質": "inspection",
            "工事/設備": "equipment",
            "付帯設備": "equipment",
            "監視/通信": "communication",
            "試験/完工": "inspection",
            "運開": "power",
            "引渡": "handover",
            "登記/書類": "registration",
            "登記/法務": "registration",
            "工事/産廃": "waste",
            "電力/名義": "power",
            "電力/運開": "power"
        }
        
        raw_phase = n.get('phase', '')
        cat = category_map.get(raw_phase, 'default')
        if cat == 'default':
             # Try type
             t = n.get('type', '')
             if '契約' in t: cat = 'contract'
             elif '手配' in t: cat = 'equipment'
             elif '検査' in t: cat = 'inspection'
             elif '届出' in t: cat = 'legal'
             else: cat = 'default'

        web_node = {
            "id": n['id'],
            "title": n['title'] or "Untitled",
            "description": n.get('notes', ''),
            "role": "", # To be filled if available
            "category": cat,
            "status": "active",
            "tags": [n.get('type', ''), n.get('phase', '')],
            "links": [], # No links in source currently
            "inputs": [],
            "outputs": [],
            "position": {
                "x": round(web_x),
                "y": round(web_y)
            },
            "next": [] # Will populate for UX hints based on edges
        }
        
        # Generate Edges based on 'nextMain'
        next_id = n.get('nextMain')
        if next_id and next_id in node_map:
             edge_id = f"e-{n['id']}-{next_id}"
             if edge_id not in existing_edge_ids:
                 web_edges.append({
                     "id": edge_id,
                     "source": n['id'],
                     "target": next_id,
                     "label": "",
                     "condition": "",
                     "animated": False
                 })
                 existing_edge_ids.add(edge_id)
                 # Add UX hint
                 web_node['next'].append(next_id)

        web_nodes.append(web_node)

    output_data = {
        "meta": {
             "version": "1.0.0",
             "lastUpdated": "2026-02-16T11:00:00Z",
             "coordinateSystem": "normalized_scaled"
        },
        "nodes": web_nodes,
        "edges": web_edges,
        "groups": [] # Optional
    }

    print(f"Generated {len(web_nodes)} nodes and {len(web_edges)} edges.")

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    print(f"Saved to {output_path}")

# Run
transform_nodes_to_graph_data('node_definition_table.json', 'public/data.json')
