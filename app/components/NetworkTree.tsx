import React from 'react';
import styles from './NetworkTree.module.css';

export type TreeNode = {
  id: string;
  name: string;
  level: number;
  isDirect: boolean;
  children: TreeNode[];
};

export type Props = {
  data: TreeNode;
  onNodeClick?: (id: string) => void;
  maxLevel?: number;
};

const OrgNode: React.FC<{ node: TreeNode; depth: number; maxLevel: number; onNodeClick?: (id: string) => void }> = ({ node, depth, maxLevel, onNodeClick }) => {
  const showChildren = depth < maxLevel && node.children && node.children.length > 0;
  
  // Determine card classes
  let cardClass = styles.nodeCard;
  if (depth === 0) cardClass += ` ${styles.leader}`;
  else if (node.isDirect) cardClass += ` ${styles.direct}`;

  return (
    <li>
      <div 
        className={cardClass}
        onClick={() => onNodeClick && onNodeClick(node.id)}
      >
        <div className={styles.avatar}>
          {depth === 0 ? '👑' : node.name.charAt(0).toUpperCase()}
        </div>
        <span className={styles.nodeName}>
          {node.name}
        </span>
        {depth > 0 && (
          <span className={styles.nodeLevel}>
            Level {depth}
          </span>
        )}
      </div>
      
      {showChildren && (
        <ul>
          {node.children.map(child => (
            <OrgNode 
              key={child.id} 
              node={child} 
              depth={depth + 1} 
              maxLevel={maxLevel} 
              onNodeClick={onNodeClick} 
            />
          ))}
        </ul>
      )}
    </li>
  );
};

/**
 * Visual Org-Chart / Binary Tree representation of the downline.
 */
const NetworkTree: React.FC<Props> = ({ data, onNodeClick, maxLevel = 10 }) => {
  return (
    <div className={styles.treeContainer}>
      <div className={styles.tree}>
        <ul>
          <OrgNode 
            node={data} 
            depth={0} 
            maxLevel={maxLevel} 
            onNodeClick={onNodeClick} 
          />
        </ul>
      </div>
    </div>
  );
};

export default NetworkTree;
export { NetworkTree };
