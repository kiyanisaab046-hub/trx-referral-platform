"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SparklesIcon,
  GlobeAltIcon,
  MapPinIcon,
  TicketIcon,
  HomeIcon
} from "@heroicons/react/24/outline";

import { supabase } from "@/lib/supabase";
// remove local createClient call, use imported supabase instance

const rewardsData = [
  { id: "01", rank: "Rank 4", rankNum: 4, name: "Achiever", selfId: "$24", direct: 3, biz: 5000, prize: "Smartphone", prizeValue: 100, icon: DevicePhoneMobileIcon, image: "/rewards/smartphone.png" },
  { id: "02", rank: "Rank 5", rankNum: 5, name: "Advancer", selfId: "$48", direct: 5, biz: 15000, prize: "Laptop", prizeValue: 150, icon: ComputerDesktopIcon, image: "/rewards/laptop.png" },
  { id: "03", rank: "Rank 6", rankNum: 6, name: "Progressor", selfId: "$96", direct: 8, biz: 35000, prize: "Motorcycle", prizeValue: 300, icon: SparklesIcon, image: "/rewards/motorcycle.png" },
  { id: "04", rank: "Rank 7", rankNum: 7, name: "Leader", selfId: "$192", direct: 10, biz: 150000, prize: "Luxury Vacation", prizeValue: 1000, icon: GlobeAltIcon, image: "/rewards/vacation.png" },
  { id: "05", rank: "Rank 8", rankNum: 8, name: "Pioneer", selfId: "$384", direct: 12, biz: 500000, prize: "Hajj / Umrah Trip", prizeValue: 5000, icon: MapPinIcon, image: "/rewards/mecca.png" },
  { id: "06", rank: "Rank 9", rankNum: 9, name: "Champion", selfId: "$768", direct: 15, biz: 700000, prize: "Luxury Car", prizeValue: 20000, icon: TicketIcon, image: "/rewards/car.png" },
  { id: "07", rank: "Rank 10", rankNum: 10, name: "Legend", selfId: "$1,536", direct: 20, biz: 1000000, prize: "Luxury House", prizeValue: 50000, icon: HomeIcon, image: "/rewards/house.png" },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.4, type: "spring", stiffness: 150, damping: 18 } },
} as const;

export default function Rewards() {

  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [teamBusiness, setTeamBusiness] = useState(0);
  const [purchasedRank, setPurchasedRank] = useState(0);
  const [directs, setDirects] = useState(0);
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      setUser(authUser);

      const { data: walletData } = await supabase.from('wallets').select('*').eq('user_id', authUser.id).single();
      if (walletData) setWallet(walletData);

      const { data: ranks } = await supabase.from('user_ranks').select('rank').eq('user_id', authUser.id);
      if (ranks && ranks.length > 0) setPurchasedRank(Math.max(...ranks.map(r => r.rank)));

      const { data: dir } = await supabase.from('referrals').select('id').eq('sponsor_id', authUser.id);
      if (dir) setDirects(dir.length);

      const { data: tb } = await supabase.rpc('get_team_business', { root_user_id: authUser.id });
      setTeamBusiness(tb || 0);

      const { data: txs } = await supabase.from('transactions')
        .select('description')
        .eq('user_id', authUser.id)
        .eq('type', 'commission_reward');
      if (txs) setClaimedRewards(txs.map(t => t.description));
    };
    fetchStats();
  }, []);

  const handleClaimReward = async (reward: typeof rewardsData[0]) => {
    if (!user || !wallet) return;
    setClaimingId(reward.id);
    try {
      const { error: wErr } = await supabase.from('wallets').update({
        main_balance: wallet.main_balance + reward.prizeValue,
        income_balance: wallet.income_balance + reward.prizeValue
      }).eq('user_id', user.id);
      if (wErr) throw wErr;

      const desc = `Claimed ${reward.prize} Bonus of $${reward.prizeValue}`;
      const { error: txErr } = await supabase.from('transactions').insert({
        user_id: user.id,
        amount: reward.prizeValue,
        type: 'commission_reward',
        description: desc
      });
      if (txErr) throw txErr;

      setClaimedRewards([...claimedRewards, desc]);
      setWallet({ ...wallet, main_balance: wallet.main_balance + reward.prizeValue, income_balance: wallet.income_balance + reward.prizeValue });
      alert(`🎉 Success! $${reward.prizeValue} ${reward.prize} Reward claimed and added to your wallet.`);
    } catch (error: any) {
      alert(`Failed to claim: ${error.message}`);
    } finally {
      setClaimingId(null);
    }
  };
  return (
    <section 
      className="relative py-20 bg-transparent" 
      id="rewards"
    >
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "150px 0px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/60" />
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-primary bg-primary/[0.06] px-5 py-1.5 rounded-full border border-primary/20">
              Professional Rewards
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/60" />
          </div>

          <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-soft-gray">
              Elite{" "}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-highlight">
              Milestones
            </span>
          </h2>

          <div className="flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-soft-gray mt-6">
            <span>Dream Big</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            <span>Work Smart</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            <span>Achieve Success</span>
          </div>

          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "150px 0px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-6 h-[2px] w-24 bg-gradient-to-r from-transparent via-primary to-transparent origin-center"
          />
        </motion.div>

        {/* Rewards Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "150px 0px" }}
        >
          {rewardsData.map((r, i) => (
            <motion.div
              key={r.id}
              variants={cardVariants}
              whileHover={{ y: -10 }}
              whileTap={{ scale: 0.98 }}
              className="group relative rounded-2xl overflow-hidden cursor-default"
            >
              {/* Card border glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/15 group-hover:to-secondary/10 transition-all duration-500 pointer-events-none" />

              <div className="relative p-7 h-full rounded-2xl bg-[#0c0a10]/80 border border-primary/[0.08] group-hover:border-primary/40 backdrop-blur-sm transition-all duration-500 flex flex-col justify-between">
                
                {/* Large watermark number */}
                <div className="absolute -top-4 -right-4 text-7xl font-display font-black text-primary/[0.03] select-none transition-colors group-hover:text-primary/[0.08]">
                  {r.id}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-6">
                    {/* Icon container */}
                    <div className="relative">
                      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/[0.08] to-highlight/[0.04] border border-primary/15 group-hover:border-primary/60 group-hover:shadow-[0_0_20px_rgba(255,154,134,0.15)] transition-all duration-500">
                        <r.icon className="w-6 h-6 text-primary/70 group-hover:text-secondary transition-colors duration-300" />
                      </div>
                      <div className="absolute inset-0 -z-10 rounded-2xl bg-primary/0 group-hover:bg-primary/10 blur-xl transition-all duration-500" />
                    </div>

                    <div className="text-right">
                      <div className="text-[9px] font-bold text-primary/60 uppercase tracking-widest">{r.rank}</div>
                      <div className="text-lg font-display font-black text-accent group-hover:text-white uppercase tracking-tight transition-colors">{r.name}</div>
                    </div>
                  </div>

                  {/* Visual Image Banner */}
                  <div className="relative h-36 w-full rounded-xl overflow-hidden mb-6 border border-primary/10 group-hover:border-primary/30 transition-all duration-500 bg-[#050508]">
                    <img 
                      src={r.image} 
                      alt={r.prize}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a10]/90 via-[#0c0a10]/20 to-transparent" />
                  </div>

                  {/* Conditions table list */}
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-center border-b border-primary/[0.05] pb-2">
                      <span className="text-[10px] uppercase tracking-widest text-soft-gray font-bold">Self ID</span>
                      <span className="text-xs font-bold text-accent group-hover:text-secondary transition-colors">{r.selfId}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-primary/[0.05] pb-2">
                      <span className="text-[10px] uppercase tracking-widest text-soft-gray font-bold">Min Direct</span>
                      <span className="text-xs font-bold text-accent group-hover:text-secondary transition-colors">{r.direct}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-widest text-soft-gray font-bold">Team Biz</span>
                      <span className="text-xs font-bold text-accent group-hover:text-secondary transition-colors">{r.biz}</span>
                    </div>
                  </div>
                </div>

                {/* Prize */}
                <div className="mt-4 pt-4 border-t border-primary/[0.05]">
                  <div className="text-[9px] font-bold text-primary/50 uppercase tracking-[0.25em] mb-1">Exclusive Prize</div>
                  <div className="text-base font-display font-black text-accent group-hover:text-secondary leading-tight uppercase transition-colors">
                    {r.prize}
                  </div>
                </div>

                {/* Logged In User Progress & Claim */}
                {user && (() => {
                  const progress = Math.floor((
                    Math.min(100, (teamBusiness / r.biz) * 100) + 
                    Math.min(100, (directs / r.direct) * 100) + 
                    Math.min(100, (purchasedRank / r.rankNum) * 100)
                  ) / 3);
                  const hasClaimed = claimedRewards.some(desc => desc.includes(r.prize));
                  const canClaim = progress >= 100 && !hasClaimed;

                  return (
                    <div className="mt-4">
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-[10px] text-primary/80 font-bold uppercase tracking-wider mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Claim Button */}
                      {hasClaimed ? (
                        <button disabled className="w-full py-2 rounded-lg bg-[#2ecc71]/10 text-[#2ecc71] border border-[#2ecc71]/20 font-bold text-xs uppercase tracking-widest cursor-default flex items-center justify-center gap-2">
                          ✓ Claimed
                        </button>
                      ) : canClaim ? (
                        <button 
                          onClick={() => handleClaimReward(r)}
                          disabled={claimingId === r.id}
                          className="w-full py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,154,134,0.3)] transition-all transform hover:-translate-y-0.5"
                        >
                          {claimingId === r.id ? 'Processing...' : 'Claim Reward'}
                        </button>
                      ) : null}
                    </div>
                  );
                })()}

                {/* Bottom line sweep */}
                <div className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-primary via-secondary to-transparent transition-all duration-700 ease-out" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
