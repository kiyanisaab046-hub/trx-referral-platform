"use client";

import React, { useState } from "react";
import CryptoPayButton from "./CryptoPayButton";

export default function WalletModal({ type, open, onClose }) {
  const [amount, setAmount] = useState(10);
  const [address, setAddress] = useState("");
  const [crypto, setCrypto] = useState("btc");

  if (!open) return null;

  const handleSubmit = async () => {
    if (type === "deposit") {
      // Use CryptoPayButton for deposit – it will handle payment flow
      // Here we just call the button's click programmatically if needed, but we render the button directly.
    } else {
      // Withdraw flow – call API directly
      try {
        const res = await fetch("/api/withdraw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, address, currency: crypto }),
        });
        const data = await res.json();
        alert(data.message || "Withdraw request sent");
        onClose();
      } catch (e) {
        alert("Network error");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0b111e] rounded-xl p-6 w-11/12 max-w-md border border-primary/30 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-primary">{type === "deposit" ? "Deposit Funds" : "Withdraw Funds"}</h2>
        <div className="mb-4">
          <label className="block text-sm mb-1 text-soft-gray">Amount (USD)</label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={e => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-[#030816] border border-primary/20 rounded focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        {type === "withdraw" && (
          <div className="mb-4">
            <label className="block text-sm mb-1 text-soft-gray">Crypto Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-[#030816] border border-primary/20 rounded focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm mb-1 text-soft-gray">Currency</label>
          <select
            value={crypto}
            onChange={e => setCrypto(e.target.value)}
            className="w-full px-3 py-2 bg-[#030816] border border-primary/20 rounded focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="btc">BTC</option>
            <option value="eth">ETH</option>
            <option value="bnb">BNB</option>
          </select>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#030816] text-soft-gray hover:bg-[#050c1a] transition"
          >
            Cancel
          </button>
          {type === "deposit" ? (
            <CryptoPayButton
              amount={amount}
              description={`Deposit ${amount} USD via ${crypto.toUpperCase()}`}
              onSuccess={onClose}
            />
          ) : (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded bg-primary text-black font-semibold hover:bg-primary-light transition"
            >
              Withdraw
            </button>
          )}
        </div>
        {/* Demo placeholder options */}
        <div className="mt-4 text-sm text-soft-gray">
          <p className="mb-2">Demo options (replace with real integrations):</p>
          <button className="mr-2 px-3 py-1 bg-primary/20 rounded hover:bg-primary/30 transition">PayPal Demo</button>
          <button className="px-3 py-1 bg-primary/20 rounded hover:bg-primary/30 transition">Bank Transfer Demo</button>
        </div>
      </div>
    </div>
  );
}
