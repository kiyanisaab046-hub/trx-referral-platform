import React from 'react';
import styles from './TeamList.module.css';

type Member = {
  id: string;
  name: string;
  level: number;
};

type Props = {
  members: Member[];
};

const TeamList: React.FC<Props> = ({ members }) => {
  if (!members || members.length === 0) {
    return (
      <div className={styles.container}>
        <h4 className={styles.title}>My Team</h4>
        <p className={styles.emptyMessage}>No team members found.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>My Team</h4>
      <div className={styles.list}>
        {members.map((member) => (
          <div key={member.id} className={styles.memberCard}>
            <div className={styles.memberHeader}>
              <span className={styles.memberName}>{member.name || 'Anonymous'}</span>
              <span className={styles.memberLevel}>Level {member.level}</span>
            </div>
            <div className={styles.memberBody}>
              <span className={styles.memberId}>ID: {member.id.substring(0, 8)}...</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamList;
