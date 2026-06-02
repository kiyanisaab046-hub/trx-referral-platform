'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import styles from '../dashboard.module.css';

interface MatrixNode {
  id: string;
  name: string;
  numeric_id: string;
  isDirect: boolean;
  level: number;
}

export default function MobileMatrixTreePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [allReferrals, setAllReferrals] = useState<any[]>([]);
  const [userMap, setUserMap] = useState<Record<string, { name: string; numericId: string }>>({});
  const [authUserId, setAuthUserId] = useState<string>('');
  // Modal handling for node details
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const handleNodeSelect = async (id: string) => {
    setSelectedNodeId(id);
    setModalLoading(true);
    try {
      // Fetch user basic info (no 'rank' column on users table)
      const { data: user, error: userErr } = await supabase
        .from('users')
        .select('id, full_name, numeric_id, activation_date, sponsor_id')
        .eq('id', id)
        .single();
      if (userErr) throw userErr;

      // Fetch sponsor's numeric_id for display
      let sponsorNumericId: string | null = null;
      if (user.sponsor_id) {
        const { data: sponsor } = await supabase
          .from('users')
          .select('numeric_id')
          .eq('id', user.sponsor_id)
          .single();
        sponsorNumericId = sponsor?.numeric_id ?? null;
      }

      // Direct referral count
      const { count: directCount } = await supabase
        .from('referrals')
        .select('referred_id', { count: 'exact', head: true })
        .eq('sponsor_id', id);

      // Rank from user_ranks table
      const { data: rankData } = await supabase
        .from('user_ranks')
        .select('rank')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Map rank number to name
      const rankNames: Record<number, string> = {
        1: 'Starter', 2: 'Builder', 3: 'Grower', 4: 'Achiever',
        5: 'Advancer', 6: 'Progressor', 7: 'Leader', 8: 'Pioneer',
        9: 'Champion', 10: 'Legend'
      };
      const rankLabel = rankData?.rank ? (rankNames[rankData.rank] || `Rank ${rankData.rank}`) : null;

      // Community size via BFS
      let communitySize = 0;
      const visited = new Set<string>();
      const queue = [id];
      while (queue.length > 0) {
        const cur = queue.shift()!;
        const children = allReferrals.filter(r => r.sponsor_id === cur).map(r => r.referred_id);
        children.forEach(c => {
          if (!visited.has(c)) {
            visited.add(c);
            queue.push(c);
          }
        });
      }
      communitySize = visited.size;

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

  // Pan/Zoom Drag Logic
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

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    const walkX = (x - startX) * 1.5; 
    const walkY = (y - startY) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walkX;
    containerRef.current.scrollTop = scrollTop - walkY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const y = e.touches[0].pageY - containerRef.current.offsetTop;
    const walkX = (x - startX) * 1.5; 
    const walkY = (y - startY) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walkX;
    containerRef.current.scrollTop = scrollTop - walkY;
  };

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          router.push('/signin');
          return;
        }
        
        setAuthUserId(authUser.id);

        const { data: allRefs, error: refsError } = await supabase
          .from('referrals')
          .select('sponsor_id, referred_id, joined_at')
          .order('joined_at', { ascending: true });

        if (refsError) throw refsError;

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
      } catch (err: any) {
        console.error('Error fetching tree data:', err);
        setError(err.message || 'Failed to load network');
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [router, supabase]);

  // Build the strict array-based matrix up to Level 10
  const matrixArray = useMemo(() => {
    if (!authUserId || allReferrals.length === 0) return [];

    const indexMap = new Map<string, number>();
    indexMap.set(authUserId, 0);
    
    const matrixMap = new Map<number, MatrixNode>();
    matrixMap.set(0, {
      id: authUserId,
      name: userMap[authUserId]?.name || 'User',
      numeric_id: userMap[authUserId]?.numericId || 'N/A',
      isDirect: false,
      level: 0
    });
    
    // Iterate over chronologically sorted referrals
    // If the sponsor is within the local matrix, place the user under them
    for (const ref of allReferrals) {
      if (indexMap.has(ref.sponsor_id)) {
        const sponsorIndex = indexMap.get(ref.sponsor_id)!;
        
        let assignedIndex = -1;
        const queue = [sponsorIndex];
        
        // BFS to find the first strict vacant spot under this specific sponsor's leg
        while (queue.length > 0) {
          const curr = queue.shift()!;
          const left = 2 * curr + 1;
          const right = 2 * curr + 2;
          
          if (!matrixMap.has(left)) {
            assignedIndex = left;
            break;
          } else {
            queue.push(left);
          }
          
          if (!matrixMap.has(right)) {
            assignedIndex = right;
            break;
          } else {
            queue.push(right);
          }
        }
        
        if (assignedIndex !== -1) {
          const level = Math.floor(Math.log2(assignedIndex + 1));
          if (level <= 10) {
            indexMap.set(ref.referred_id, assignedIndex);
            matrixMap.set(assignedIndex, {
              id: ref.referred_id,
              name: userMap[ref.referred_id]?.name || 'User',
              numeric_id: userMap[ref.referred_id]?.numericId || 'N/A',
              isDirect: ref.sponsor_id === authUserId,
              level
            });
          }
        }
      }
    }
    
    // Convert Map back to array with nulls for empty slots to maintain strict geometry
    let maxIndex = -1;
    for (const idx of matrixMap.keys()) {
      if (idx > maxIndex) maxIndex = idx;
    }
    
    const finalArray: (MatrixNode | null)[] = [];
    for (let i = 0; i <= maxIndex; i++) {
      finalArray.push(matrixMap.get(i) || null);
    }
    
    return finalArray;
  }, [allReferrals, userMap, authUserId]);

  // Recursive function to render array index as a binary tree
  const renderMatrixTree = (index: number) => {
    if (index >= matrixArray.length) return null;
    
    const node = matrixArray[index];
    if (!node) return null;
    const leftChildIndex = 2 * index + 1;
    const rightChildIndex = 2 * index + 2;

    const hasLeft = leftChildIndex < matrixArray.length;
    const hasRight = rightChildIndex < matrixArray.length;

    let circleClasses = 'w-14 h-14 rounded-full flex items-center justify-center border-[3px] bg-gray-800 z-10 relative shrink-0';
    
    if (index === 0) {
       circleClasses += ' border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]'; // Root (YOU)
    } else if (node.isDirect) {
       circleClasses += ' border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]'; // Direct
    } else {
       circleClasses += ' border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]'; // Indirect
    }

    return (
      <li key={node.id} onClick={(e) => { e.stopPropagation(); handleNodeSelect(node.id); }} className="cursor-pointer">
        <div className="flex flex-col items-center relative z-10 w-24 mx-auto group">
          <div className={circleClasses}>
            <span className="text-xl font-bold text-white uppercase">
              {node.name ? node.name.charAt(0) : '?'}
            </span>
            {index !== 0 && (
               <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${node.isDirect ? 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]' : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]'}`} />
            )}
          </div>
          
          <div className="mt-2 text-center bg-gray-900/60 rounded px-2 py-0.5 border border-gray-700">
            <span className="text-[10px] text-gray-300 font-bold block">{index === 0 ? 'YOU' : `ID: ${node.numeric_id}`}</span>
            {/* Displaying row depth */}
            <span className="text-[8px] text-gray-500">Lv {node.level}</span>
          </div>
        </div>

        {(hasLeft || hasRight) && node.level < 10 && (
          <ul>
            {hasLeft && renderMatrixTree(leftChildIndex)}
            {hasRight && renderMatrixTree(rightChildIndex)}
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
        <div className={styles.profileHeader}>
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
        ) : matrixArray.length > 0 ? (
          <div className="w-full h-full flex flex-col flex-1 bg-gray-950/40 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden relative">
             <div className="absolute top-4 left-4 flex flex-col gap-2 z-20 pointer-events-none">
               <div className="flex gap-4 text-[10px] font-semibold bg-gray-900/80 px-3 py-1.5 rounded-lg backdrop-blur-md border border-gray-800 pointer-events-auto">
                  <div className="flex items-center gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                     <span className="text-gray-300">Direct</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                     <span className="text-gray-300">Indirect</span>
                  </div>
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
                 {renderMatrixTree(0)}
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => { setSelectedNodeId(null); setModalData(null); }}>
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
            <button className="mt-5 w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity" onClick={() => { setSelectedNodeId(null); setModalData(null); }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

