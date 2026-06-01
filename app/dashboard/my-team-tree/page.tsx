'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import styles from '../dashboard.module.css';

interface TreeNode {
  id: string;
  name: string;
  numeric_id: string;
  level: number;
  isDirect: boolean;
  children: TreeNode[];
}

export default function MyTeamGenerationalTreePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [allReferrals, setAllReferrals] = useState<any[]>([]);
  const [userMap, setUserMap] = useState<Record<string, { name: string; numericId: string }>>({});
  const [authUserId, setAuthUserId] = useState<string>('');
  
  // The current active root node (changes when user drills down)
  const [activeRootId, setActiveRootId] = useState<string | null>(null);

  // Fetch base data
  useEffect(() => {
    const fetchTree = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          router.push('/signin');
          return;
        }
        
        setAuthUserId(authUser.id);

        // Fetch all referrals
        const { data: allRefs, error: refsError } = await supabase
          .from('referrals')
          .select('sponsor_id, referred_id');

        if (refsError) throw refsError;

        // Fetch all users to map names and IDs
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, numeric_id');
          
        if (usersError) throw usersError;

        const uMap: Record<string, { name: string; numericId: string }> = {};
        usersData?.forEach(u => { 
          uMap[u.id] = { 
            name: u.full_name || 'User',
            numericId: u.numeric_id || 'N/A'
          }; 
        });

        setAllReferrals(allRefs || []);
        setUserMap(uMap);
        setActiveRootId(authUser.id);
        
      } catch (err: any) {
        console.error('Error fetching tree data:', err);
        setError(err.message || 'Failed to load generational network');
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [router, supabase]);

  // Dynamically build the True Generational Hierarchy for the active root
  const activeTree = useMemo(() => {
    if (!activeRootId || !authUserId || Object.keys(userMap).length === 0 || allReferrals.length === 0) return null;

    const buildGenerationalTree = (nodeId: string, currentLevel: number): TreeNode => {
      // Identity Rule: is the child a true direct referral of the logged-in user?
      const isTrueDirect = allReferrals.find(r => r.referred_id === nodeId)?.sponsor_id === authUserId;
      
      const node: TreeNode = {
        id: nodeId,
        name: userMap[nodeId]?.name || 'User',
        numeric_id: userMap[nodeId]?.numericId || 'N/A',
        level: currentLevel,
        isDirect: isTrueDirect,
        children: []
      };

      // Limit to 10 generational levels deep to prevent infinite loops and UI overload
      if (currentLevel < 10) {
        // Find ALL users directly sponsored by this exact node
        const trueChildrenIds = allReferrals
            .filter(r => r.sponsor_id === nodeId)
            .map(r => r.referred_id);
            
        node.children = trueChildrenIds.map(childId => buildGenerationalTree(childId, currentLevel + 1));
      }

      return node;
    };

    return buildGenerationalTree(activeRootId, 0);
  }, [activeRootId, allReferrals, userMap, authUserId]);

  const handleNodeClick = (id: string) => {
    setActiveRootId(id);
  };

  const handleReset = () => {
    if (authUserId) setActiveRootId(authUserId);
  };

  // Render a single node and its children recursively
  const renderNode = (node: TreeNode, isRoot: boolean = false) => {
    // strict color coding rule applied to the circular profile
    let circleClasses = 'w-14 h-14 rounded-full flex items-center justify-center border-[3px] bg-gray-800 z-10 relative transition-transform duration-300 group-hover:scale-110 shrink-0';
    
    if (isRoot && node.id === authUserId) {
       circleClasses += ' border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]';
    } else if (node.isDirect) {
       circleClasses += ' border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]';
    } else {
       circleClasses += ' border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]';
    }

    return (
      <li key={node.id}>
        <div className="flex flex-col items-center cursor-pointer relative z-10 w-24 group mx-auto" onClick={() => handleNodeClick(node.id)}>
          <div className={circleClasses}>
            <span className="text-xl font-bold text-white uppercase">
              {node.name ? node.name.charAt(0) : '?'}
            </span>
            
            {/* Small status dot indicator */}
            {!isRoot && (
               <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${node.isDirect ? 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]' : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]'}`} />
            )}
          </div>
          
          <div className="mt-2 text-center">
            <span className="text-[10px] text-gray-400 font-medium">ID: {node.numeric_id}</span>
          </div>
        </div>

        {node.children && node.children.length > 0 && (
          <ul>
            {node.children.map(child => renderNode(child))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className={styles.dashboardContainer} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* SVG-based tree logic styles - optimized for extremely wide generational trees */}
      <style dangerouslySetInnerHTML={{__html: `
        .org-tree {
          display: flex;
          justify-content: center;
          padding-top: 2rem;
          overflow-x: auto;
          padding-bottom: 4rem;
        }
        .org-tree ul {
          padding-top: 20px;
          position: relative;
          transition: all 0.5s;
          display: flex;
          justify-content: center;
        }
        .org-tree li {
          float: left;
          text-align: center;
          list-style-type: none;
          position: relative;
          padding: 20px 10px 0 10px;
          transition: all 0.5s;
        }
        /* Connecting lines */
        .org-tree li::before, .org-tree li::after {
          content: '';
          position: absolute;
          top: 0;
          right: 50%;
          border-top: 2px solid #4b5563;
          width: 50%;
          height: 20px;
          z-index: 0;
        }
        .org-tree li::after {
          right: auto;
          left: 50%;
          border-left: 2px solid #4b5563;
        }
        .org-tree li:only-child::after, .org-tree li:only-child::before {
          display: none;
        }
        .org-tree li:only-child {
          padding-top: 0;
        }
        .org-tree li:first-child::before, .org-tree li:last-child::after {
          border: 0 none;
        }
        .org-tree li:last-child::before {
          border-right: 2px solid #4b5563;
          border-radius: 0 5px 0 0;
        }
        .org-tree li:first-child::after {
          border-radius: 5px 0 0 0;
        }
        .org-tree ul::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          border-left: 2px solid #4b5563;
          width: 0;
          height: 20px;
          z-index: 0;
        }
        .org-tree > ul > li::before, .org-tree > ul > li::after {
          display: none; /* root node has no top connections */
        }
        .org-tree > ul {
          padding-top: 0;
        }
        .org-tree > ul::before {
          display: none;
        }
        /* Custom scrollbar for webkit */
        .org-tree::-webkit-scrollbar {
          height: 10px;
          width: 10px;
        }
        .org-tree::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05); 
          border-radius: 6px;
        }
        .org-tree::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2); 
          border-radius: 6px;
        }
        .org-tree::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4); 
        }
      `}} />

      <header className={styles.header}>
        <div className={styles.logoArea} onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className={styles.logoBadgeContainer}>
            <span className={styles.logoBadge}>UIP</span>
          </div>
          <div className={styles.logoTitles}>
            <h2 className={styles.logoText}>My Team</h2>
            <span className={styles.logoSlogan}>True Generational Hierarchy</span>
          </div>
        </div>
        <div className={styles.profileHeader} style={{ display: 'flex', gap: '0.5rem' }}>
          {authUserId && activeRootId !== authUserId && (
            <button 
              className={styles.homeBtn} 
              onClick={handleReset}
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              🔄 Reset to My Tree
            </button>
          )}
          <button className={styles.homeBtn} onClick={() => router.push('/dashboard')}>
            🔙 Back to Dashboard
          </button>
        </div>
      </header>

      <main className={styles.mainContent} style={{ flex: 1, padding: '2rem 1rem', maxWidth: '100%' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#ff4444', padding: '2rem' }}>
            <h2>Error Loading Network Tree</h2>
            <p>{error}</p>
          </div>
        ) : activeTree ? (
          <div className="w-full h-full bg-gray-950/40 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden relative">
             <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
               <div className="flex gap-4 text-xs font-semibold bg-gray-900/80 px-4 py-2 rounded-lg backdrop-blur-md border border-gray-800">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                     <span className="text-gray-300">Direct Referral</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                     <span className="text-gray-300">Indirect Downline</span>
                  </div>
               </div>
               <div className="text-[10px] text-gray-400 bg-gray-900/60 px-3 py-1.5 rounded-lg border border-gray-800/50 backdrop-blur-md w-fit max-w-[200px]">
                 True Generational Hierarchy: Displays exactly who sponsored whom, unlimited width, 10 levels deep.
               </div>
             </div>
             
             <div className="org-tree w-full h-full min-h-[60vh] cursor-grab active:cursor-grabbing items-start pt-10">
               <ul>
                 {renderNode(activeTree, true)}
               </ul>
             </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#888', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
            <h2>No Network Found</h2>
            <p>Share your referral link to start building your generational network!</p>
          </div>
        )}
      </main>
    </div>
  );
}
