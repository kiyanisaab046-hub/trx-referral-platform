// TeamList.tsx - Mobile-only list of all team members
import React from 'react';
import styles from './TeamList.module.css';

interface Member {
  id: string;
  name: string;
  level?: number;
}

interface Props {
  members: Member[];
}

const TeamList: React.FC<Props> = ({ members }) => {
  if (!members || members.length === 0) {
    return <p className={styles.empty}>No team members found.</p>;
  }

  return (
    <div className={styles.teamList}>
      <h3 className={styles.title}>Team Members</h3>
      <ul className={styles.list}>
        {members.map((m) => (
          <li key={m.id} className={styles.item}>
            <span className={styles.id}>ID: {m.id}</span>
            <span className={styles.name}>Name: {m.name}</span>
            {m.level !== undefined && (
              <span className={styles.level}>Level: {m.level}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamList;
