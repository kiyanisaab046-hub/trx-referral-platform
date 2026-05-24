'use client';

import React from 'react';

export default function Maintenance() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#120D1D]/80 backdrop-blur-xl border border-primary/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div>
          <h2 className="text-xl font-bold text-white">Backup & Maintenance</h2>
          <p className="text-sm text-gray-400">System health, backups, and maintenance mode controls.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Maintenance Mode */}
        <div className="bg-[#120D1D]/80 backdrop-blur-xl border border-primary/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <h3 className="text-lg font-bold text-white border-b border-primary/10 pb-4 mb-6">System Status</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <div>
                  <p className="text-sm font-bold text-gray-200">System Health</p>
                  <p className="text-xs text-gray-500">All systems operational</p>
                </div>
              </div>
              <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">100%</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-200">Maintenance Mode</p>
                <p className="text-xs text-gray-500">Restrict access to users during updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-200">Clear System Cache</p>
                <p className="text-xs text-gray-500">Purge Redis/Vercel cache</p>
              </div>
              <button className="text-xs font-bold text-[#050505] bg-gray-300 hover:bg-white px-4 py-2 rounded-lg transition-colors">
                Clear Cache
              </button>
            </div>
          </div>
        </div>

        {/* Database Backups */}
        <div className="bg-[#120D1D]/80 backdrop-blur-xl border border-primary/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <h3 className="text-lg font-bold text-white border-b border-primary/10 pb-4 mb-6">Database Backups</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Last Backup:</p>
              <p className="text-sm font-bold text-white">Today, 03:00 AM</p>
            </div>
            
            <button className="w-full bg-gradient-to-r from-primary to-secondary text-[#050505] py-3 rounded-xl font-bold hover:shadow-[0_0_15px_rgba(232,67,147,0.4)] transition-all">
              Generate Manual Backup
            </button>

            <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
              <p className="text-sm font-bold text-gray-300 mb-2">Recent Backups</p>
              
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                <div>
                  <p className="text-xs font-bold text-gray-200">backup_2024_05_23.sql</p>
                  <p className="text-[10px] text-gray-500">Size: 45.2 MB</p>
                </div>
                <button className="text-primary hover:text-highlight text-xs font-bold">Download</button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                <div>
                  <p className="text-xs font-bold text-gray-200">backup_2024_05_22.sql</p>
                  <p className="text-[10px] text-gray-500">Size: 44.8 MB</p>
                </div>
                <button className="text-primary hover:text-highlight text-xs font-bold">Download</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
