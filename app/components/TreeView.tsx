"use client";
import React, { useMemo } from 'react';
import NetworkTree, { TreeNode } from './NetworkTree';
import styles from './TreeView.module.css';

/**
 * TreeView – a visual wrapper around NetworkTree with a fresh blue/gray theme.
 * It receives a flat list of members (from Supabase) and converts it
 * into a nested `TreeNode` structure expected by NetworkTree.
 */
interface Member {
  id: string;
  name: string;
  parent_id?: string; // parent/referrer id
  wallet?: string;
  // Additional fields can be added later and used on hover.
}

interface TreeViewProps {
  members: Member[];
}

// Build a hierarchical tree from a flat member list.
const buildTree = (members: Member[]): TreeNode[] => {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];
  // First, create a node for every member.
  members.forEach((m) => {
    const node: TreeNode = { id: m.id, name: m.name, level: 0, isDirect: false, children: [] };
    map.set(m.id, node);
  });
  // Then link children to their parents.
  members.forEach((m) => {
    const node = map.get(m.id)!;
    if (m.parent_id && map.has(m.parent_id)) {
      const parent = map.get(m.parent_id)!;
      node.level = (parent.level ?? 0) + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
};

const TreeView: React.FC<TreeViewProps> = ({ members }) => {
  const treeData = useMemo(() => buildTree(members), [members]);

  const handleNodeClick = (id: string) => {
    // Placeholder for future modal/details.
    console.log('Tree node clicked id:', id);
  };

  return (
    <div className={styles.container}>
      {treeData.map((root) => (
        <NetworkTree key={root.id} data={root} onNodeClick={handleNodeClick} />
      ))}
    </div>
  );
};

export default TreeView;
