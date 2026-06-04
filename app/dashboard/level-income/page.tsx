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

export default function LevelIncomeTreePage() {
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
        setError(err.message || 'Failed to load level income network');
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [router, supabase]);

  // Dynamically build the auto-spillover binary matrix for the active root
  const activeTree = useMemo(() => {
    if (!activeRootId || !authUserId || Object.keys(userMap).length === 0) return null;

    // 1. Find all true descendants of activeRootId to form the pool
    const descendants = new Set<string>();
    const queue = [activeRootId];
    while(queue.length > 0) {
      const cur = queue.shift()!;
      const children = allReferrals.filter(r => r.sponsor_id === cur).map(r => r.referred_id);
      children.forEach(c => {
        if (!descendants.has(c)) {
          descendants.add(c);
          queue.push(c);
        }
      });
    }

    const allDownlineIds = Array.from(descendants);
    
    // 2. Sort downline: Directs of the activeRoot first, then Indirects
    // This satisfies "first row my direct then 3 row there is required 4 users..."
    const directs = allDownlineIds.filter(id => allReferrals.find(r => r.referred_id === id)?.sponsor_id === activeRootId);
    const indirects = allDownlineIds.filter(id => allReferrals.find(r => r.referred_id === id)?.sponsor_id !== activeRootId);
    
    const pool = [...directs, ...indirects];

    // 3. Build the visual binary matrix tree
    const rootNode: TreeNode = {
      id: activeRootId,
      name: userMap[activeRootId]?.name || 'User',
      numeric_id: userMap[activeRootId]?.numericId || 'N/A',
      level: 0,
      isDirect: false, // Root doesn't need border indicator
      children: []
    };

    if (pool.length === 0) return rootNode;

    let poolIndex = 0;
    const nodeQueue: TreeNode[] = [rootNode];

    // 4. Fill left-to-right, level-by-level (2 children max per node)
    while (nodeQueue.length > 0 && poolIndex < pool.length) {
      const currentParent = nodeQueue.shift()!;
      
      // Each parent can take exactly up to 2 children
      for (let i = 0; i < 2; i++) {
        if (poolIndex < pool.length) {
          const childId = pool[poolIndex];
          
          // Identity Rule: is the child a true direct referral of the logged-in user?
          const isTrueDirect = allReferrals.find(r => r.referred_id === childId)?.sponsor_id === authUserId;
          
          const childNode: TreeNode = {
            id: childId,
            name: userMap[childId]?.name || 'User',
            numeric_id: userMap[childId]?.numericId || 'N/A',
            level: currentParent.level + 1,
            isDirect: isTrueDirect,
            children: []
          };
          
          currentParent.children.push(childNode);
          nodeQueue.push(childNode);
          poolIndex++;
        }
      }
    }

    return rootNode;
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
    let circleClasses = 'w-14 h-14 rounded-full flex items-center justify-center border-[3px] bg-gray-800 z-10 relative transition-transform duration-300 group-hover:scale-110';
    
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
      
      {/* SVG-based tree logic styles */}
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
          height: 8px;
        }
        .org-tree::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05); 
          border-radius: 4px;
        }
        .org-tree::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2); 
          border-radius: 4px;
        }
        .org-tree::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4); 
        }
      `}} />

      <header className={styles.header}>
        <div className={styles.logoArea} onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className={styles.logoBadgeContainer}>
            <img src="https://i.postimg.cc/hGhQX5YR/ZMhoi-O-modified.png" alt="Logo" className={styles.logoBadge} style={{ padding: 0, background: 'none', objectFit: 'cover', width: '40px', height: '40px', borderRadius: '50%' }} />
          </div>
          <div className={styles.logoTitles}>
            <h2 className={styles.logoText}>Level Income</h2>
            <span className={styles.logoSlogan}>Auto-Spillover Hierarchy</span>
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
        {/* 2 Directs Requirement Warning */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          color: '#f87171'
        }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 700, color: '#fff' }}>Eligibility Requirement</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
              You must have at least <strong>2 Direct Members</strong> to qualify for Level Income. If you have fewer than 2 direct members, the 30% commission from your downline upgrades will skip you and pass up to the next qualified sponsor.
            </p>
          </div>
        </div>
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
               <div className="text-[10px] text-gray-400 bg-gray-900/60 px-3 py-1.5 rounded-lg border border-gray-800/50 backdrop-blur-md w-fit">
                 Auto-Spillover Matrix: 2 × 4 × 8 × 16
               </div>
             </div>
             
             <div className="org-tree w-full h-full min-h-[60vh] cursor-grab active:cursor-grabbing">
               <ul>
                 {renderNode(activeTree, true)}
               </ul>
             </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#888', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
            <h2>No Network Found</h2>
            <p>Share your referral link to start building your network hierarchy!</p>
          </div>
        )}
      </main>
    </div>
  );
}
