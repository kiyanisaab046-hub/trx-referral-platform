'use client';

import React from 'react';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total Users', value: '12,450', growth: '+15%', isPositive: true },
    { title: 'Active Packages', value: '8,210', growth: '+22%', isPositive: true },
    { title: 'Total Deposits', value: '$450,210.00', growth: '+12%', isPositive: true },
    { title: 'Total Withdrawals', value: '$120,400.00', growth: '-5%', isPositive: false },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-[#120D1D]/80 backdrop-blur-xl border border-primary/20 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-primary/50 hover:bg-[#120D1D] transition-all group">
            <h3 className="text-soft-gray text-sm font-bold tracking-wider uppercase mb-2">{stat.title}</h3>
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 group-hover:from-primary group-hover:to-secondary transition-all">
              {stat.value}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.isPositive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {stat.growth}
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="lg:col-span-2 bg-[#120D1D]/80 backdrop-blur-xl border border-primary/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Revenue Overview</h3>
            <select className="bg-black/40 border border-primary/20 text-sm text-gray-300 rounded-lg px-3 py-1 outline-none focus:border-primary">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-black/20">
            <p className="text-soft-gray font-bold tracking-widest text-sm uppercase">Interactive Chart Area</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#120D1D]/80 backdrop-blur-xl border border-primary/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm">
                  ⚡
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-200">New Deposit</p>
                  <p className="text-xs text-gray-500">User #104{i} deposited $500</p>
                </div>
                <span className="ml-auto text-xs text-gray-600">2m ago</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
