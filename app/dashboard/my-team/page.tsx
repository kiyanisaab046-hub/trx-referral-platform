'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import styles from '../dashboard.module.css';

interface TeamMember {
  id: string;
  name: string;
  numericId: string;
  sponsorId: string;
  sponsorNumericId: string;
  phoneNumber: string;
  activationDate?: string;
  currentLevel: number;
  directTeam: number;
}

export default function MyTeamPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stores the array of team members for each level
  const [levelData, setLevelData] = useState<Record<number, TeamMember[]>>({});
  
  // Tab state management
  const [activeTab, setActiveTab] = useState(1);
  const [maxLevel, setMaxLevel] = useState(1);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          router.push('/signin');
          return;
        }

        // 1. Fetch all referrals
        const { data: allRefs, error: refsError } = await supabase
          .from('referrals')
          .select('sponsor_id, referred_id');

        if (refsError) throw refsError;

        const allRefsSafe = allRefs || [];

        // 2. Map direct counts (for "Direct Team" column)
        const directCounts: Record<string, number> = {};
        allRefsSafe.forEach(ref => {
          directCounts[ref.sponsor_id] = (directCounts[ref.sponsor_id] || 0) + 1;
        });

        // 3. Generation Logic (Strict Referral Loop via BFS)
        const resultLevels: Record<number, TeamMember[]> = {};
        
        let currentLevelUsers = [authUser.id];
        let currentLevel = 1;
        
        // Track visited to prevent infinite loops (though referrals should be a tree)
        const visited = new Set<string>();
        visited.add(authUser.id);
        
        // We need to know who sponsored who for mapping later
        const sponsorMap: Record<string, string> = {}; // referred_id -> sponsor_id

        while (currentLevelUsers.length > 0 && currentLevel <= 20) { // Safety cap at 20 levels
           const nextLevelUsers: string[] = [];
           
           allRefsSafe.forEach(ref => {
              if (currentLevelUsers.includes(ref.sponsor_id) && !visited.has(ref.referred_id)) {
                 visited.add(ref.referred_id);
                 nextLevelUsers.push(ref.referred_id);
                 sponsorMap[ref.referred_id] = ref.sponsor_id;
              }
           });
           
           if (nextLevelUsers.length > 0) {
              // Initialize empty array for this level (will be populated after we fetch user details)
              resultLevels[currentLevel] = nextLevelUsers.map(id => ({ id } as any));
           } else {
              break; // No more downline
           }
           
           currentLevelUsers = nextLevelUsers;
           currentLevel++;
        }

        if (Object.keys(resultLevels).length === 0) {
          setLoading(false);
          return; // No downline
        }

        // Collect all IDs needed for data fetching
        const allDownlineIds = Array.from(visited).filter(id => id !== authUser.id);
        // We also need sponsor IDs to get their numeric_ids
        const allSponsorIds = [...new Set(Object.values(sponsorMap))];
        const allNeededIds = [...new Set([...allDownlineIds, ...allSponsorIds])];

        // 4. Fetch User details (including phone number and numeric ID)
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, numeric_id, phone_number')
          .in('id', allNeededIds);
          
        if (usersError) throw usersError;

        const userMap: Record<string, any> = {};
        usersData?.forEach(u => { userMap[u.id] = u; });

        // 5. Fetch user ranks for Activation Date and Current Level
        const { data: ranksData, error: ranksError } = await supabase
          .from('user_ranks')
          .select('user_id, rank, created_at')
          .in('user_id', allDownlineIds);

        if (ranksError) throw ranksError;

        // Map max rank and earliest activation date
        const userRankInfo: Record<string, { maxRank: number, earliestDate: string | null }> = {};
        ranksData?.forEach(r => {
          if (!userRankInfo[r.user_id]) {
            userRankInfo[r.user_id] = { maxRank: r.rank, earliestDate: r.created_at };
          } else {
            if (r.rank > userRankInfo[r.user_id].maxRank) userRankInfo[r.user_id].maxRank = r.rank;
            if (new Date(r.created_at) < new Date(userRankInfo[r.user_id].earliestDate!)) {
              userRankInfo[r.user_id].earliestDate = r.created_at;
            }
          }
        });

        // 6. Populate the final Level Data structure
        const finalLevels: Record<number, TeamMember[]> = {};
        let highestLevel = 1;

        Object.keys(resultLevels).forEach((levelStr) => {
           const levelNum = parseInt(levelStr);
           highestLevel = Math.max(highestLevel, levelNum);
           
           finalLevels[levelNum] = resultLevels[levelNum].map(placeholder => {
              const uId = placeholder.id;
              const sponsorId = sponsorMap[uId];
              return {
                 id: uId,
                 name: userMap[uId]?.full_name || 'Unknown',
                 numericId: userMap[uId]?.numeric_id || 'N/A',
                 sponsorId: sponsorId,
                 sponsorNumericId: userMap[sponsorId]?.numeric_id || 'N/A',
                 phoneNumber: userMap[uId]?.phone_number || 'N/A',
                 activationDate: userRankInfo[uId]?.earliestDate || undefined,
                 currentLevel: userRankInfo[uId]?.maxRank || 0,
                 directTeam: directCounts[uId] || 0
              };
           });
        });

        setLevelData(finalLevels);
        setMaxLevel(highestLevel);

      } catch (err: any) {
        console.error('Error building team tree:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [router, supabase]);

  // Generate an array of available levels for the tabs (always 1 to 10)
  const availableLevels = Array.from({ length: 10 }, (_, i) => i + 1);
  const displayedMembers = levelData[activeTab] || [];

  return (
    <div className={styles.dashboardContainer} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className={styles.header}>
        <div className={styles.logoArea} onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className={styles.logoBadgeContainer}>
            <img src="https://i.postimg.cc/hGhQX5YR/ZMhoi-O-modified.png" alt="Logo" className={styles.logoBadge} style={{ padding: 0, background: 'none', objectFit: 'cover', width: '40px', height: '40px', borderRadius: '50%' }} />
          </div>
          <div className={styles.logoTitles}>
            <h2 className={styles.logoText}>My Team</h2>
            <span className={styles.logoSlogan}>Level Generation Directory</span>
          </div>
        </div>
        <div className={styles.profileHeader}>
          <button className={styles.homeBtn} onClick={() => router.push('/dashboard')}>
            🔙 Back to Dashboard
          </button>
        </div>
      </header>

      <main className={styles.mainContent} style={{ flex: 1, padding: '2rem 1rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <LoadingSpinner size="large" />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#ff4444', padding: '2rem' }}>
            <h2>Error</h2>
            <p>{error}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
             
            {/* Level Tabs Header Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar items-center">
               {availableLevels.length > 0 ? availableLevels.map(level => (
                  <button
                     key={level}
                     onClick={() => setActiveTab(level)}
                     className={`flex-shrink-0 min-w-[50px] px-4 py-2 text-sm font-bold rounded ${activeTab === level ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.6)]' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} transition-all duration-200 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400`}
                  >
                     {level}
                  </button>
               )) : (
                  <span className="text-gray-400 text-sm">No levels available</span>
               )}
            </div>

            <div style={{ background: 'rgba(10,15,30,0.6)', borderRadius: '12px', border: '1px solid rgba(0,210,255,0.15)', overflow: 'hidden', boxShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
              
              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px', whiteSpace: 'nowrap' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,210,255,0.1)', color: '#00d2ff', fontWeight: 'bold' }}>
                      <th style={{ padding: '1rem', borderBottom: '1px solid rgba(0,210,255,0.2)' }}>S.No</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid rgba(0,210,255,0.2)' }}>ID</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid rgba(0,210,255,0.2)' }}>Sponsor ID</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid rgba(0,210,255,0.2)' }}>Phone Number</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid rgba(0,210,255,0.2)' }}>Current Rank</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid rgba(0,210,255,0.2)' }}>Direct Rank</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid rgba(0,210,255,0.2)' }}>Activation Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedMembers.length > 0 ? (
                      displayedMembers.map((member, index) => (
                        <tr key={member.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '1rem' }}>{index + 1}</td>
                          <td style={{ padding: '1rem', color: '#fff', fontWeight: '600' }}>{member.numericId}</td>
                          <td style={{ padding: '1rem', color: '#8892b0' }}>{member.sponsorNumericId}</td>
                          <td style={{ padding: '1rem' }}>{member.phoneNumber}</td>
                          <td style={{ padding: '1rem', color: '#00d2ff', fontWeight: 'bold' }}>{member.currentLevel}</td>
                          <td style={{ padding: '1rem', color: '#2ecc71', fontWeight: 'bold' }}>{member.directTeam}</td>
                          <td style={{ padding: '1rem' }}>
                            {member.activationDate 
                              ? new Date(member.activationDate).toLocaleDateString()
                              : '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#8892b0' }}>
                          No members found in Level {activeTab}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        )}
      </main>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05); 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2); 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4); 
        }
      `}} />
    </div>
  );
}
