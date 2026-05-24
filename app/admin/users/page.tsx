'use client';

import React, { useState } from 'react';

export default function UserManagement() {
  const [search, setSearch] = useState('');

  // Mock data for demonstration
  const users = [
    { id: '1', name: 'Ali Khan', email: 'ali@example.com', role: 'user', status: 'active', joined: '2024-03-10', balance: '$450.00' },
    { id: '2', name: 'Zohaib Kiyani', email: 'zkiyani770@gmail.com', role: 'admin', status: 'active', joined: '2024-01-01', balance: '$15,000.00' },
    { id: '3', name: 'Sara Ahmed', email: 'sara@example.com', role: 'user', status: 'suspended', joined: '2024-04-12', balance: '$0.00' },
    { id: '4', name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', joined: '2024-05-02', balance: '$120.50' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#120D1D]/80 backdrop-blur-xl border border-primary/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div>
          <h2 className="text-xl font-bold text-white">User Management</h2>
          <p className="text-sm text-gray-400">Manage all registered users, wallets, and ranks.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-primary/20 text-sm text-white rounded-xl pl-9 pr-4 py-2 outline-none focus:border-primary transition-colors"
            />
          </div>
          <button className="bg-gradient-to-r from-primary to-secondary text-[#050505] px-4 py-2 rounded-xl font-bold text-sm hover:shadow-[0_0_15px_rgba(232,67,147,0.4)] transition-all">
            + Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#120D1D]/80 backdrop-blur-xl border border-primary/10 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-black/40 text-xs uppercase font-bold text-gray-400 border-b border-primary/10">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-200">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-bold ${
                      user.status === 'active' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-200">
                    {user.balance}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {user.joined}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="text-gray-400 hover:text-primary transition-colors text-xs font-bold border border-white/10 hover:border-primary/30 px-3 py-1.5 rounded-lg bg-black/20">Edit</button>
                    <button className="text-gray-400 hover:text-red-400 transition-colors text-xs font-bold border border-white/10 hover:border-red-400/30 px-3 py-1.5 rounded-lg bg-black/20">Ban</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-primary/10 flex items-center justify-between text-xs text-gray-500 bg-black/20">
          <p>Showing 1 to 4 of 12,450 entries</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-md border border-white/10 hover:bg-white/5 disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 rounded-md border border-primary/30 bg-primary/10 text-primary">1</button>
            <button className="px-3 py-1 rounded-md border border-white/10 hover:bg-white/5">2</button>
            <button className="px-3 py-1 rounded-md border border-white/10 hover:bg-white/5">3</button>
            <button className="px-3 py-1 rounded-md border border-white/10 hover:bg-white/5">Next</button>
          </div>
        </div>
      </div>

    </div>
  );
}
