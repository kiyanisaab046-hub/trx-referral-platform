'use client';

import React from 'react';

export default function DesignSettings() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#120D1D]/80 backdrop-blur-xl border border-primary/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div>
          <h2 className="text-xl font-bold text-white">Website Design Settings</h2>
          <p className="text-sm text-gray-400">Customize theme colors, UI elements, and layout preferences globally.</p>
        </div>
        <button className="bg-gradient-to-r from-primary to-secondary text-[#050505] px-6 py-2 rounded-xl font-bold text-sm hover:shadow-[0_0_15px_rgba(232,67,147,0.4)] transition-all">
          Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Colors & Themes */}
        <div className="bg-[#120D1D]/80 backdrop-blur-xl border border-primary/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <h3 className="text-lg font-bold text-white border-b border-primary/10 pb-4 mb-6">Theme Colors</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Primary Color (Pink/Cyan)</label>
              <div className="flex items-center gap-4">
                <input type="color" defaultValue="#e84393" className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0" />
                <input type="text" defaultValue="#e84393" className="flex-1 bg-black/40 border border-primary/20 text-sm text-white rounded-xl px-4 py-2 outline-none focus:border-primary" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Secondary Color (Peach/Orange)</label>
              <div className="flex items-center gap-4">
                <input type="color" defaultValue="#f5c6aa" className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0" />
                <input type="text" defaultValue="#f5c6aa" className="flex-1 bg-black/40 border border-primary/20 text-sm text-white rounded-xl px-4 py-2 outline-none focus:border-primary" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Highlight/Accent Color (Rose/Gold)</label>
              <div className="flex items-center gap-4">
                <input type="color" defaultValue="#f78fb3" className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0" />
                <input type="text" defaultValue="#f78fb3" className="flex-1 bg-black/40 border border-primary/20 text-sm text-white rounded-xl px-4 py-2 outline-none focus:border-primary" />
              </div>
            </div>
            
            <div className="pt-4 flex items-center justify-between border-t border-white/5">
              <span className="text-sm font-bold text-gray-300">Dark / Light Mode Default</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="ml-3 text-sm font-medium text-gray-400">Dark</span>
              </label>
            </div>
          </div>
        </div>

        {/* Layout & UI */}
        <div className="bg-[#120D1D]/80 backdrop-blur-xl border border-primary/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <h3 className="text-lg font-bold text-white border-b border-primary/10 pb-4 mb-6">Layout & UI Components</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-300">Glassmorphism Effects</p>
                <p className="text-xs text-gray-500">Enable blur and transparency across cards</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-300">Background Animations</p>
                <p className="text-xs text-gray-500">Enable floating orbs/particles</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Button Style</label>
              <select className="w-full bg-black/40 border border-primary/20 text-sm text-white rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors">
                <option>Fully Rounded (Pill)</option>
                <option>Rounded Corners (Standard)</option>
                <option>Sharp Corners</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Global Font Family</label>
              <select className="w-full bg-black/40 border border-primary/20 text-sm text-white rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors">
                <option>Satoshi / Clash Display (Current)</option>
                <option>Inter / System</option>
                <option>Outfit / Poppins</option>
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
