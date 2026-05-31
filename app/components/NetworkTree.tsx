import React from 'react';

type TreeNode = {
  id: string;
  name: string;
  level: number;
  isDirect: boolean;
  children: TreeNode[];
};

type Props = {
  data: TreeNode;
  onNodeClick?: (id: string) => void;
};

// Simple recursive tree rendering. Each node is a button that triggers onNodeClick.
export const NetworkTree: React.FC<Props> = ({ data, onNodeClick }) => {
  const renderNode = (node: TreeNode) => (
    <div key={node.id} style={{ marginLeft: node.level * 16, marginTop: 8 }}>
      <button
        onClick={() => onNodeClick && onNodeClick(node.id)}
        style={{
          background: node.isDirect ? 'rgba(0,180,255,0.1)' : 'transparent',
          border: '1px solid rgba(0,180,255,0.2)',
          borderRadius: 8,
          padding: '4px 8px',
          cursor: 'pointer',
          color: '#fff',
          fontSize: 14,
          minWidth: 120,
          textAlign: 'left',
        }}
      >
        {node.name}
      </button>
      {node.children && node.children.map(child => renderNode(child))}
    </div>
  );

  return <div>{renderNode(data)}</div>;
};

export type { TreeNode };
