'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import styles from '../dashboard.module.css';

interface BinaryNode {
  id: string;
  name: string;
  numeric_id: string;
  isDirect: boolean;
  level: number;
  left: BinaryNode | null;
  right: BinaryNode | null;
}

export default function MobileMatrixTreePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tree, setTree] = useState<BinaryNode | null>(null);
  const [authUserId, setAuthUserId] = useState<string>('');
  
  // Active root for drill-down navigation
  const [activeRootId, setActiveRootId] = useState<string | null>(null);

  // Modal handling for node details
  const [modalData, setModalData] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // All users map (for building the tree)
  const [allUsers, setAllUsers] = useState<Record<string, {
    id: string;
    name: string;
    numericId: string;
    left_child_id: string | null;
    right_child_id: string | null;
    sponsor_id: string | null;
  }>>({});

  // Direct referral set (for blue/red coloring)
  const [directReferralIds, setDirectReferralIds] = useState<Set<string>>(new Set());

  const handleNodeSelect = async (id: string) => {
    setModalLoading(true);
    try {
      const { data: user, error: userErr } = await supabase
        .from('users')
        .select('id, full_name, numeric_id, activation_date, sponsor_id')
        .eq('id', id)
        .single();
      if (userErr) throw userErr;

      let sponsorNumericId: string | null = null;
      if (user.sponsor_id) {
        const { data: sponsor } = await supabase
          .from('users')
          .select('numeric_id')
          .eq('id', user.sponsor_id)
          .single();
        sponsorNumericId = sponsor?.numeric_id ?? null;
      }

      const { count: directCount } = await supabase
        .from('referrals')
        .select('referred_id', { count: 'exact', head: true })
        .eq('sponsor_id', id);

      const { data: rankData } = await supabase
        .from('user_ranks')
        .select('rank')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const rankNames: Record<number, string> = {
        0: 'Unranked', 1: 'Starter', 2: 'Builder', 3: 'Grower', 4: 'Achiever',
        5: 'Advancer', 6: 'Progressor', 7: 'Leader', 8: 'Pioneer',
        9: 'Champion', 10: 'Legend'
      };
      const rankLabel = rankData?.rank ? (rankNames[rankData.rank] || `Rank ${rankData.rank}`) : null;

      // Count community size via binary tree BFS
      let communitySize = 0;
      const visited = new Set<string>();
      const queue = [id];
      while (queue.length > 0) {
        const cur = queue.shift()!;
        const userData = allUsers[cur];
        if (userData) {
          if (userData.left_child_id && !visited.has(userData.left_child_id)) {
            visited.add(userData.left_child_id);
            communitySize++;
            queue.push(userData.left_child_id);
          }
          if (userData.right_child_id && !visited.has(userData.right_child_id)) {
            visited.add(userData.right_child_id);
            communitySize++;
            queue.push(userData.right_child_id);
          }
        }
      }

      setModalData({
        name: user.full_name,
        numeric_id: user.numeric_id,
        sponsor_numeric_id: sponsorNumericId,
        activation_date: user.activation_date,
        rank: rankLabel,
        directCount: directCount ?? 0,
        communitySize,
      });
    } catch (e: any) {
      console.error('Error loading node details', e);
      setModalData(null);
    } finally {
      setModalLoading(false);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setStartY(e.pageY - containerRef.current.offsetTop);
    setScrollLeft(containerRef.current.scrollLeft);
    setScrollTop(containerRef.current.scrollTop);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
    setStartY(e.touches[0].pageY - containerRef.current.offsetTop);
    setScrollLeft(containerRef.current.scrollLeft);
    setScrollTop(containerRef.current.scrollTop);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    containerRef.current.scrollLeft = scrollLeft - (x - startX) * 1.5;
    containerRef.current.scrollTop = scrollTop - (y - startY) * 1.5;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const y = e.touches[0].pageY - containerRef.current.offsetTop;
    containerRef.current.scrollLeft = scrollLeft - (x - startX) * 1.5;
    containerRef.current.scrollTop = scrollTop - (y - startY) * 1.5;
  };

  // Fetch all users with their binary tree pointers
  useEffect(() => {
    const fetchTree = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          router.push('/signin');
          return;
        }
        
        setAuthUserId(authUser.id);
        setActiveRootId(authUser.id);

        // Fetch all users with binary tree columns
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, numeric_id, left_child_id, right_child_id, sponsor_id');
          
        if (usersError) throw usersError;

        const uMap: Record<string, {
          id: string;
          name: string;
          numericId: string;
          left_child_id: string | null;
          right_child_id: string | null;
          sponsor_id: string | null;
        }> = {};
        
        usersData?.forEach(u => { 
          uMap[u.id] = { 
            id: u.id,
            name: u.full_name || 'User',
            numericId: u.numeric_id || 'N/A',
            left_child_id: u.left_child_id,
            right_child_id: u.right_child_id,
            sponsor_id: u.sponsor_id
          }; 
        });

        setAllUsers(uMap);

        // Get direct referrals for the logged-in user (for blue coloring)
        const { data: directRefs } = await supabase
          .from('referrals')
          .select('referred_id')
          .eq('sponsor_id', authUser.id);

        const directSet = new Set<string>();
        directRefs?.forEach(r => directSet.add(r.referred_id));
        setDirectReferralIds(directSet);

      } catch (err: any) {
        console.error('Error fetching tree data:', err);
        setError(err.message || 'Failed to load network');
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [router, supabase]);

  // Build the REAL binary tree from left_child_id / right_child_id columns
  // This is the actual physical placement — top-to-bottom, left-to-right
  useEffect(() => {
    if (!activeRootId || Object.keys(allUsers).length === 0) return;

    // Prevent duplicate nodes (cycles) by tracking visited IDs
    const visited = new Set<string>();
    const buildBinaryTree = (nodeId: string, depth: number): BinaryNode | null => {
      if (visited.has(nodeId)) return null;
      visited.add(nodeId);
      const userData = allUsers[nodeId];
      if (!userData) return null;
      if (depth > 10) return null; // Limit to 10 levels

      const node: BinaryNode = {
        id: nodeId,
        name: userData.name,
        numeric_id: userData.numericId,
        isDirect: directReferralIds.has(nodeId),
        level: depth,
        left: null,
        right: null,
      };

      if (userData.left_child_id && !visited.has(userData.left_child_id)) {
        node.left = buildBinaryTree(userData.left_child_id, depth + 1);
      }
      if (userData.right_child_id && !visited.has(userData.right_child_id)) {
        node.right = buildBinaryTree(userData.right_child_id, depth + 1);
      }
      return node;
    };

    const builtTree = buildBinaryTree(activeRootId, 0);
    setTree(builtTree);
  }, [activeRootId, allUsers, directReferralIds]);

  const handleReset = () => {
    if (authUserId) setActiveRootId(authUserId);
  };

  // Render a binary node recursively (always exactly 2 branches: left & right)
  const renderBinaryNode = (node: BinaryNode | null, isRoot: boolean = false): React.ReactNode => {
    if (!node) return null;

    let circleClasses = 'w-14 h-14 rounded-full flex items-center justify-center border-[3px] bg-gray-800 z-10 relative shrink-0';
    
    if (isRoot && node.id === authUserId) {
       circleClasses += ' border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]';
    } else if (node.isDirect) {
       circleClasses += ' border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]';
    } else {
       circleClasses += ' border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]';
    }

    const hasChildren = node.left !== null || node.right !== null;

    return (
      <li key={node.id}>
        <div 
          className="flex flex-col items-center cursor-pointer relative z-10 w-24 mx-auto group"
          onClick={(e) => { e.stopPropagation(); handleNodeSelect(node.id); }}
        >
          <div className={circleClasses}>
            <span className="text-xl font-bold text-white uppercase">
              {node.name ? node.name.charAt(0) : '?'}
            </span>
            {!isRoot && (
               <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${node.isDirect ? 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]' : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]'}`} />
            )}
          </div>
          
          <div className="mt-2 text-center bg-gray-900/60 rounded px-2 py-0.5 border border-gray-700">
            <span className="text-[10px] text-gray-300 font-bold block">
              {isRoot && node.id === authUserId ? 'YOU' : `ID: ${node.numeric_id}`}
            </span>
            <span className="text-[8px] text-gray-500">Lv {node.level}</span>
          </div>

          {/* Drill-down button */}
          {hasChildren && (
            <button 
              className="mt-1 text-[9px] text-cyan-400 hover:text-cyan-300 font-semibold"
              onClick={(e) => { e.stopPropagation(); setActiveRootId(node.id); }}
            >
              ▼ Drill Down
            </button>
          )}
        </div>

        {hasChildren && node.level < 10 && (
          <ul className="flex justify-center">
            {(() => {
              const left = node.left;
              const right = node.right;
              // If this is the root (YOU) and the left child is the special ID 57795,
              // render it on the right side instead of left.
              if (node.id === authUserId && left && left.id === "57795" && !right) {
                return (
                  <>
                    {/* placeholder for missing left child */}
                    <li style={{ width: '2rem', height: '2rem' }} />
                    {/* render the special node on the right */}
                    {renderBinaryNode(left)}
                  </>
                );
              }

              // Normal rendering (with placeholders for missing children)
              return (
                <>
                  {left ? renderBinaryNode(left) : <li style={{ width: '2rem', height: '2rem' }} />}
                  {right ? renderBinaryNode(right) : <li style={{ width: '2rem', height: '2rem' }} />}
                </>
              );
            })()}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className={styles.dashboardContainer} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Tree connector styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .org-tree {
          display: flex;
          justify-content: center;
          padding-top: 1rem;
        }
        .org-tree ul {
          padding-top: 20px;
          position: relative;
          display: flex;
          justify-content: center;
        }
        .org-tree li {
          float: left;
          text-align: center;
          list-style-type: none;
          position: relative;
          padding: 20px 5px 0 5px;
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
          display: none;
        }
        .org-tree > ul {
          padding-top: 0;
        }
        .org-tree > ul::before {
          display: none;
        }
      `}} />

      <header className={styles.header}>
        <div className={styles.logoArea} onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className={styles.logoBadgeContainer}>
            <img src="https://i.postimg.cc/hGhQX5YR/ZMhoi-O-modified.png" alt="Logo" className={styles.logoBadge} style={{ padding: 0, background: 'none', objectFit: 'cover', width: '40px', height: '40px', borderRadius: '50%' }} />
          </div>
          <div className={styles.logoTitles}>
            <h2 className={styles.logoText}>Matrix Tree</h2>
            <span className={styles.logoSlogan}>Auto-Spillover Forced Matrix</span>
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
            🔙 Back
          </button>
        </div>
      </header>

      <main className={styles.mainContent} style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#ff4444', padding: '2rem' }}>
            <h2>Error Loading Matrix</h2>
            <p>{error}</p>
          </div>
        ) : tree ? (
          <div className="w-full h-full flex flex-col flex-1 bg-gray-950/40 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden relative">
             <div className="absolute top-4 left-4 flex flex-col gap-2 z-20 pointer-events-none">
               <div className="flex gap-4 text-[10px] font-semibold bg-gray-900/80 px-3 py-1.5 rounded-lg backdrop-blur-md border border-gray-800 pointer-events-auto">
                  <div className="flex items-center gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                     <span className="text-gray-300">You (Root)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                     <span className="text-gray-300">Direct</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                     <span className="text-gray-300">Spillover</span>
                  </div>
               </div>
               <div className="text-[10px] text-gray-400 bg-gray-900/60 px-3 py-1.5 rounded-lg border border-gray-800/50 backdrop-blur-md w-fit pointer-events-auto">
                 Perfect Binary Matrix: Left → Right, Top → Bottom
               </div>
             </div>
             
             {/* Draggable Viewport */}
             <div 
                ref={containerRef}
                className={`org-tree w-full flex-1 min-h-[70vh] pb-[200px] overflow-auto select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} custom-scrollbar`}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleMouseUp}
                onTouchMove={handleTouchMove}
             >
               <ul style={{ minWidth: 'max-content', padding: '40px' }}>
                 {renderBinaryNode(tree, true)}
               </ul>
             </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#888', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
            <h2>No Network Found</h2>
            <p>Start building your matrix!</p>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
      `}} />

      {/* Loading modal */}
      {modalLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg animate-pulse">
            <div className="text-white text-center">Loading...</div>
          </div>
        </div>
      )}

      {/* Detail popup modal */}
      {modalData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => { setModalData(null); }}>
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl w-[320px] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xl font-bold uppercase">
                {modalData.name ? modalData.name.charAt(0) : '?'}
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">{modalData.name}</h3>
                <span className="text-gray-400 text-xs">ID: {modalData.numeric_id}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-gray-800">
                <span className="text-gray-400">Referred By</span>
                <span className="text-white font-semibold">{modalData.sponsor_numeric_id || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-800">
                <span className="text-gray-400">Direct Members</span>
                <span className="text-white font-semibold">{modalData.directCount}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-800">
                <span className="text-gray-400">Community</span>
                <span className="text-white font-semibold">{modalData.communitySize}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-800">
                <span className="text-gray-400">Current Rank</span>
                <span className="text-white font-semibold">{modalData.rank ?? '—'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-400">Activation</span>
                <span className="text-white font-semibold">{modalData.activation_date ? new Date(modalData.activation_date).toLocaleDateString() : '—'}</span>
              </div>
            </div>
            <button className="mt-5 w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity" onClick={() => { setModalData(null); }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
