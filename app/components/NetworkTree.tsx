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

// Helper: max nodes allowed at a given depth (depth 0 = root, depth 1 = 2 nodes, depth 2 = 4, etc.)
const maxNodesAtDepth = (depth: number) => Math.pow(2, depth);

// Color palette per depth (Level 0 = gold for YOU, then per spec)
const levelColors: Record<number, string> = {
  0: '#ffd700', // gold
  1: '#0000ff', // blue
  2: '#00ff00', // green
  3: '#ff8800', // orange
  4: '#800080', // purple
  5: '#ff69b4', // pink
  6: '#00ffff', // light blue
  7: '#ffff00', // yellow
  8: '#90ee90', // light green
  9: '#ff0000', // red
 10: '#00008b' // dark blue
};

const OrgNode: React.FC<{ node: TreeNode; depth: number; maxLevel: number; onNodeClick?: (id: string) => void }> = ({ node, depth, maxLevel, onNodeClick }) => {
  const showChildren = depth < maxLevel && node.children && node.children.length > 0;

  // Cap children to the maximum allowed count for the next level globally.
  const cappedChildren = showChildren ? node.children.slice(0, maxNodesAtDepth(depth + 1)) : [];

  // Determine avatar background color based on depth.
  const avatarStyle = { backgroundColor: levelColors[depth] ?? '#999' };

  // Determine card class (leader / direct styling).
  let cardClass = styles.nodeCard;
  if (depth === 0) cardClass += ` ${styles.leader}`;
  else if (node.isDirect) cardClass += ` ${styles.direct}`;

  return (
    <li>
      <div className={cardClass} onClick={() => onNodeClick && onNodeClick(node.id)}>
        <div className={styles.avatar} style={avatarStyle}>{node.name.substring(0, 2).toUpperCase()}</div>
        <div className={styles.infoBox}>
          <span className={styles.nodeName}>{node.name.toLowerCase()}</span>
          <span className={depth === 0 || node.isDirect ? styles.badgeDir : styles.badgeInd}>
            {depth === 0 ? 'ME' : node.isDirect ? 'DIR' : 'IND'}
          </span>
        </div>
      </div>
      {cappedChildren.length > 0 && (
        <ul>
          {cappedChildren.map((child) => (
            <OrgNode key={child.id} node={child} depth={depth + 1} maxLevel={maxLevel} onNodeClick={onNodeClick} />
          ))}
        </ul>
      )}
    </li>
  );
};

/** Visual Org-Chart / Binary Tree representation of the downline. */
const NetworkTree: React.FC<Props> = ({ data, onNodeClick, maxLevel = 10 }) => {
  return (
    <div className={styles.treeContainer}>
      <div className={styles.tree}>
        <ul>
          <OrgNode node={data} depth={0} maxLevel={maxLevel} onNodeClick={onNodeClick} />
        </ul>
      </div>
    </div>
  );
};

export default NetworkTree;
export { NetworkTree };
