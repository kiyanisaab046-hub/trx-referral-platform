import React from 'react';
import styles from './NetworkTree.module.css';

export interface TreeNode {
  id: string;
  name: string;
  level: number; // 0 for root, 1 for direct, 2+ for indirect
  children: TreeNode[];
}

interface NetworkTreeProps {
  data: TreeNode;
}

const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const TreeNodeComponent: React.FC<{ node: TreeNode; isRoot?: boolean }> = ({ node, isRoot = false }) => {
  const badgeClass = isRoot 
    ? styles.badgeMe 
    : (node.level === 1 ? styles.badgeDir : styles.badgeInd);
    
  const badgeText = isRoot ? 'YOU' : (node.level === 1 ? 'DIR' : 'IND');

  return (
    <li>
      <div className={styles.nodeWrapper}>
        <div className={styles.avatar}>
          {getInitials(node.name)}
        </div>
        <div className={styles.nodeInfo}>
          <p className={styles.nodeName} title={node.name}>{node.name}</p>
          <span className={`${styles.badge} ${badgeClass}`}>
            {badgeText}
          </span>
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <TreeNodeComponent key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
};

export const NetworkTree: React.FC<NetworkTreeProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className={styles.treeContainer}>
      <ul className={styles.tree}>
        <TreeNodeComponent node={data} isRoot={true} />
      </ul>
    </div>
  );
};
