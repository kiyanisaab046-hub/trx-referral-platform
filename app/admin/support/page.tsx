'use client';

import React, { useState } from 'react';

export default function SupportSystem() {
  const [activeTab, setActiveTab] = useState('tickets');

  const tickets = [
    { id: '#TKT-1042', user: 'Ali Khan', subject: 'Deposit not showing', status: 'Open', priority: 'High', date: '2 hrs ago' },
    { id: '#TKT-1041', user: 'Sara Ahmed', subject: 'How to upgrade rank?', status: 'Resolved', priority: 'Low', date: '1 day ago' },
    { id: '#TKT-1040', user: 'John Doe', subject: 'Withdrawal delayed', status: 'In Progress', priority: 'Medium', date: '2 days ago' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#120D1D]/80 backdrop-blur-xl border border-primary/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div>
          <h2 className="text-xl font-bold text-white">Support System</h2>
          <p className="text-sm text-gray-400">Manage user support tickets, complaints, and live chat settings.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-2">
        <button 
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 font-bold text-sm transition-colors ${activeTab === 'tickets' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Support Tickets
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-bold text-sm transition-colors ${activeTab === 'settings' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Live Chat Settings
        </button>
      </div>

      {activeTab === 'tickets' && (
        <div className="bg-[#120D1D]/80 backdrop-blur-xl border border-primary/10 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-black/40 text-xs uppercase font-bold text-gray-400 border-b border-primary/10">
                <tr>
                  <th className="px-6 py-4">Ticket ID</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tickets.map((tkt) => (
                  <tr key={tkt.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-primary font-bold">{tkt.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-200">{tkt.user}</td>
                    <td className="px-6 py-4">{tkt.subject}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        tkt.priority === 'High' ? 'bg-red-500/10 text-red-400' :
                        tkt.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-green-500/10 text-green-400'
                      }`}>
                        {tkt.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        tkt.status === 'Open' ? 'bg-blue-500/10 text-blue-400' :
                        tkt.status === 'Resolved' ? 'bg-green-500/10 text-green-400' :
                        'bg-purple-500/10 text-purple-400'
                      }`}>
                        {tkt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{tkt.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:text-highlight transition-colors text-xs font-bold">Reply &rarr;</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-[#120D1D]/80 backdrop-blur-xl border border-primary/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] max-w-2xl">
          <h3 className="text-lg font-bold text-white border-b border-primary/10 pb-4 mb-6">Live Chat Configuration</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-200">Enable Live Chat Widget</p>
                <p className="text-xs text-gray-500">Show floating chat icon to users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Tawk.to / Crisp Chat Integration ID</label>
              <input type="text" placeholder="Enter widget ID" className="w-full bg-black/40 border border-primary/20 text-sm text-white rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors" />
            </div>

            <button className="bg-gradient-to-r from-primary to-secondary text-[#050505] px-6 py-2 rounded-xl font-bold text-sm hover:shadow-[0_0_15px_rgba(232,67,147,0.4)] transition-all">
              Save Settings
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
