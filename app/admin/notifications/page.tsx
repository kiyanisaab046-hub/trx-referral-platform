'use client';

import React from 'react';

export default function Notifications() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#120D1D]/80 backdrop-blur-xl border border-primary/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div>
          <h2 className="text-xl font-bold text-white">Notification System</h2>
          <p className="text-sm text-gray-400">Manage broadcast messages, automated alerts, and announcement bars.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Send Broadcast */}
        <div className="bg-[#120D1D]/80 backdrop-blur-xl border border-primary/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <h3 className="text-lg font-bold text-white border-b border-primary/10 pb-4 mb-6">Send Broadcast Message</h3>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Target Audience</label>
              <select className="w-full bg-black/40 border border-primary/20 text-sm text-white rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors">
                <option>All Users</option>
                <option>Active Users Only</option>
                <option>Rank: VIP or higher</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Message Title</label>
              <input type="text" placeholder="e.g. System Maintenance Update" className="w-full bg-black/40 border border-primary/20 text-sm text-white rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Message Content</label>
              <textarea rows={4} placeholder="Type your message here..." className="w-full bg-black/40 border border-primary/20 text-sm text-white rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"></textarea>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded bg-black/40 border-primary/20 text-primary focus:ring-primary" defaultChecked />
                <span className="text-sm font-bold text-gray-300">In-App Alert</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded bg-black/40 border-primary/20 text-primary focus:ring-primary" />
                <span className="text-sm font-bold text-gray-300">Email Push</span>
              </label>
            </div>

            <button type="button" className="w-full mt-4 bg-gradient-to-r from-primary to-secondary text-[#050505] py-3 rounded-xl font-bold hover:shadow-[0_0_15px_rgba(232,67,147,0.4)] transition-all">
              Send Broadcast
            </button>
          </form>
        </div>

        {/* Automated Triggers */}
        <div className="bg-[#120D1D]/80 backdrop-blur-xl border border-primary/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <h3 className="text-lg font-bold text-white border-b border-primary/10 pb-4 mb-6">Automated Triggers</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <p className="text-sm font-bold text-gray-200">New Registration Welcome</p>
                <p className="text-xs text-gray-500">Sends welcome email upon signup</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <p className="text-sm font-bold text-gray-200">Deposit Success</p>
                <p className="text-xs text-gray-500">Alerts user when deposit is credited</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <p className="text-sm font-bold text-gray-200">Withdrawal Processed</p>
                <p className="text-xs text-gray-500">Alerts user when funds are sent</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-200">Rank Achievement</p>
                <p className="text-xs text-gray-500">Congratulates user on new rank</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
