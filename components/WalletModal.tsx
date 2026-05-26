"use client";

import React, { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import CryptoPayButton from "./CryptoPayButton";

interface WalletModalProps {
  type: 'deposit' | 'withdraw';
  open: boolean;
  onClose: () => void;
}

type PayMethod = 'crypto' | 'easypaisa' | 'jazzcash' | 'sadapay';

const PAYMENT_ACCOUNTS: Record<Exclude<PayMethod, 'crypto'>, { label: string; number: string; name: string; color: string }> = {
  easypaisa: { label: 'Easypaisa', number: '03499197936', name: 'Muhammad Banaras', color: '#2ecc71' },
  jazzcash:  { label: 'JazzCash',  number: '03165870442', name: 'Muhammad Banaras', color: '#e74c3c' },
  sadapay:   { label: 'SadaPay',   number: '03345872858', name: 'Muhammad Banaras', color: '#8e44ad' },
};

const WITHDRAW_METHODS = [
  { id: 'easypaisa', label: 'Easypaisa', accountLabel: 'Easypaisa Number', placeholder: '03XX XXXXXXX' },
  { id: 'jazzcash', label: 'JazzCash', accountLabel: 'JazzCash Number', placeholder: '03XX XXXXXXX' },
  { id: 'sadapay', label: 'SadaPay', accountLabel: 'SadaPay Number', placeholder: '03XX XXXXXXX' },
  { id: 'nayapay', label: 'NayaPay', accountLabel: 'NayaPay Number', placeholder: '03XX XXXXXXX' },
  { id: 'meezan', label: 'Meezan Bank', accountLabel: 'IBAN / Account Number', placeholder: 'PKXX MEZN XXXXX...' },
  { id: 'hbl', label: 'HBL', accountLabel: 'IBAN / Account Number', placeholder: 'PKXX HABB XXXXX...' },
  { id: 'ubl', label: 'UBL', accountLabel: 'IBAN / Account Number', placeholder: 'PKXX UNIL XXXXX...' },
  { id: 'mcb', label: 'MCB Bank', accountLabel: 'IBAN / Account Number', placeholder: 'PKXX MUCB XXXXX...' },
  { id: 'allied', label: 'Allied Bank', accountLabel: 'IBAN / Account Number', placeholder: 'PKXX ABPA XXXXX...' },
  { id: 'crypto', label: 'Crypto Wallet (USDT/BTC/TRX)', accountLabel: 'Wallet Address', placeholder: 'e.g. TRC20 Address' },
];

export default function WalletModal({ type, open, onClose }: WalletModalProps) {
  const [method, setMethod] = useState<PayMethod>('crypto');
  const [withdrawMethod, setWithdrawMethod] = useState<string>('easypaisa');
  const [amount, setAmount] = useState(10);
  
  // Manual fields
  const [manualName, setManualName] = useState("");
  const [manualNumber, setManualNumber] = useState("");
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [successColor, setSuccessColor] = useState<string>('#2ecc71');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [supabase]);

  // Reset fields when type changes
  useEffect(() => {
    setAmount(10);
    setManualName("");
    setManualNumber("");
    setError(null);
  }, [type]);

  if (!open) return null;

  const isManual = method !== 'crypto';
  const acct = isManual ? PAYMENT_ACCOUNTS[method as Exclude<PayMethod, 'crypto'>] : null;
  const activeWithdrawMethod = WITHDRAW_METHODS.find(m => m.id === withdrawMethod);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setScreenshotPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDepositSubmit = async () => {
    if (!manualName || !manualNumber || !screenshotPreview || amount <= 0) {
      setError("Please fill all fields and upload a screenshot.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let receiptUrl = null;
      if (screenshotFile) {
        const fileExt = screenshotFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('receipts').upload(filePath, screenshotFile);
        if (uploadError) throw new Error("Failed to upload screenshot: " + uploadError.message);

        const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(filePath);
        receiptUrl = publicUrlData.publicUrl;
      }

      const { error: dbError } = await supabase.from('payments').insert({
        user_id: userId,
        amount,
        currency: 'USD',
        status: 'pending',
        payment_method: method,
        description: `${acct?.label} Deposit from ${manualName} (${manualNumber})`,
        receipt_url: receiptUrl,
      });
      if (dbError) throw dbError;

      // Send admin notification
      await supabase.from('admin_notifications').insert({
        type: 'deposit',
        title: `New Deposit Request`,
        message: `${manualName} submitted a $${amount.toFixed(2)} deposit via ${acct?.label}.`,
        user_id: userId,
        amount,
        is_read: false,
      });

      // Send Email Notification
      fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'deposit',
          title: 'New Deposit Request',
          message: `${manualName} submitted a deposit via ${acct?.label}.`,
          amount: amount,
          manualName: manualName,
          receiptUrl: receiptUrl,
          timestamp: new Date().toLocaleString(),
        }),
      }).catch(err => console.error('Failed to send email notification:', err));

      const clr = acct?.color || '#2ecc71';
      setSuccessColor(clr);
      setSuccessMsg(`${acct?.label} deposit request submitted!\nWaiting for admin approval.`);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Failed to submit deposit.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawSubmit = async () => {
    if (amount <= 0 || !manualNumber) {
      setError("Please enter a valid amount and account details.");
      return;
    }
    
    // Require name for non-crypto
    if (withdrawMethod !== 'crypto' && !manualName) {
      setError("Please enter the Receiver Name.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: wallet, error: walletErr } = await supabase.from('wallets').select('main_balance').eq('user_id', userId).single();
      if (walletErr || !wallet) throw new Error("Could not fetch wallet balance.");
      if (wallet.main_balance < amount) throw new Error("Insufficient balance.");

      // Deduct balance immediately
      const { error: deductErr } = await supabase.from('wallets').update({ main_balance: wallet.main_balance - amount }).eq('user_id', userId);
      if (deductErr) throw deductErr;

      const methodLabel = activeWithdrawMethod?.label || 'Withdrawal';
      // Format address field depending on whether it's crypto or bank/wallet
      const formattedAddress = withdrawMethod === 'crypto' 
        ? `${methodLabel}: ${manualNumber}`
        : `${methodLabel}: ${manualNumber} (Name: ${manualName})`;

      const { error: withdrawErr } = await supabase.from('withdrawals').insert({
        user_id: userId,
        amount,
        address: formattedAddress,
        status: 'pending',
        currency: 'USD'
      });

      if (withdrawErr) {
        // Rollback balance deduction
        await supabase.from('wallets').update({ main_balance: wallet.main_balance }).eq('user_id', userId);
        throw withdrawErr;
      }

      // Send admin notification
      await supabase.from('admin_notifications').insert({
        type: 'withdrawal',
        title: `New Withdrawal Request`,
        message: `${manualName || 'User'} requested a $${amount.toFixed(2)} withdrawal via ${methodLabel}.`,
        user_id: userId,
        amount,
        is_read: false,
      });

      // Send Email Notification
      fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'withdrawal',
          title: 'New Withdrawal Request',
          message: `${manualName || 'User'} requested a withdrawal via ${methodLabel}.`,
          amount: amount,
          manualName: manualName || 'N/A',
          receiptUrl: null,
          timestamp: new Date().toLocaleString(),
        }),
      }).catch(err => console.error('Failed to send email notification:', err));

      setSuccessColor('#00d2ff');
      setSuccessMsg('Your withdrawal has been sent for verification.\nYou will receive it within 24 hours.');
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2500);
      
    } catch (err: any) {
      setError(err.message || "Failed to submit withdraw request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const methodBtns: { key: PayMethod; label: string; activeColor: string }[] = [
    { key: 'crypto',    label: 'Crypto',    activeColor: 'bg-primary text-black' },
    { key: 'easypaisa', label: 'Easypaisa', activeColor: 'bg-[#2ecc71] text-black' },
    { key: 'jazzcash',  label: 'JazzCash',  activeColor: 'bg-[#e74c3c] text-white' },
    { key: 'sadapay',   label: 'SadaPay',   activeColor: 'bg-[#8e44ad] text-white' },
  ];

  // Success screen
  if (successMsg) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
        <div className="bg-gradient-to-br from-[#120d1d] to-[#0a0710] rounded-2xl p-10 w-11/12 max-w-sm border text-center" style={{ borderColor: `${successColor}40`, boxShadow: `0 0 60px ${successColor}25` }}>
          <div className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: `${successColor}20`, border: `2px solid ${successColor}` }}>
            ✓
          </div>
          {successMsg.split('\n').map((line, i) => (
            <p key={i} className="text-lg font-bold mb-1" style={{ color: i === 0 ? successColor : 'rgba(255,255,255,0.6)' }}>{line}</p>
          ))}
          <div className="mt-6 w-full h-1 rounded-full overflow-hidden" style={{ background: `${successColor}20` }}>
            <div className="h-full rounded-full" style={{ background: successColor, animation: 'shrink 2.5s linear forwards' }} />
          </div>
          <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-gradient-to-br from-[#120d1d] to-[#0a0710] rounded-2xl p-8 w-11/12 max-w-md border border-primary/20 shadow-[0_0_40px_rgba(232,67,147,0.15)] relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition">✕</button>

        <h2 className="text-2xl font-black mb-5 bg-gradient-to-r from-primary to-highlight bg-clip-text text-transparent uppercase tracking-wider">
          {type === "deposit" ? "Deposit Funds" : "Request Withdraw"}
        </h2>

        {/* --- DEPOSIT UI Toggle --- */}
        {type === "deposit" && (
          <div className="grid grid-cols-4 bg-[#00000040] rounded-xl p-1 mb-6 border border-primary/20 gap-1">
            {methodBtns.map(btn => (
              <button
                key={btn.key}
                onClick={() => setMethod(btn.key)}
                className={`py-2 text-[11px] font-bold rounded-lg transition-all ${method === btn.key ? btn.activeColor : 'text-soft-gray hover:text-white'}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {error && <p className="text-red-400 text-sm mb-4 bg-red-900/20 p-3 rounded-lg border border-red-900/50">{error}</p>}

        <div className="mb-4">
          <label className="block text-xs font-bold mb-1.5 text-soft-gray uppercase tracking-widest">Amount (USD)</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={e => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-[#00000040] border border-primary/20 rounded-xl focus:outline-none focus:border-primary/60 text-white transition-all"
          />
        </div>

        {/* --- DEPOSIT: Crypto --- */}
        {type === "deposit" && method === "crypto" && (
          <div className="mt-8 flex justify-end gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-transparent border border-white/10 text-soft-gray font-bold hover:bg-white/5 transition">Cancel</button>
            <div className="flex-1">
              <CryptoPayButton amount={amount} description={`Deposit ${amount} USD via Crypto`} onSuccess={onClose} />
            </div>
          </div>
        )}

        {/* --- DEPOSIT: Manual (Easypaisa / JazzCash / SadaPay) --- */}
        {type === "deposit" && isManual && acct && (
          <>
            <div className="mb-4 p-4 rounded-xl text-center" style={{ background: `${acct.color}15`, border: `1px solid ${acct.color}50` }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: acct.color }}>Send {acct.label} payment to:</p>
              <p className="text-2xl font-black text-white tracking-widest mb-0.5">{acct.number}</p>
              <p className="text-xs font-semibold" style={{ color: acct.color }}>{acct.name}</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold mb-1.5 text-soft-gray uppercase tracking-widest">Sender Name</label>
              <input type="text" placeholder="Full Name on Account" value={manualName} onChange={e => setManualName(e.target.value)}
                className="w-full px-4 py-3 bg-[#00000040] border border-primary/20 rounded-xl focus:outline-none focus:border-primary/60 text-white transition-all" />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold mb-1.5 text-soft-gray uppercase tracking-widest">Sender Account Number</label>
              <input type="text" placeholder="03XXXXXXXXX" value={manualNumber} onChange={e => setManualNumber(e.target.value)}
                className="w-full px-4 py-3 bg-[#00000040] border border-primary/20 rounded-xl focus:outline-none focus:border-primary/60 text-white transition-all" />
            </div>
            <div className="mb-6">
              <label className="block text-xs font-bold mb-1.5 text-soft-gray uppercase tracking-widest">Transaction Screenshot</label>
              <input type="file" accept="image/*" onChange={handleFileChange}
                className="w-full px-4 py-3 bg-[#00000040] border border-primary/20 rounded-xl text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold transition-all cursor-pointer"
                style={{ ['--file-bg' as any]: `${acct.color}33`, ['--file-color' as any]: acct.color }} />
              {screenshotPreview && (
                <div className="mt-3 rounded-xl overflow-hidden max-h-32" style={{ border: `1px solid ${acct.color}40` }}>
                  <img src={screenshotPreview} alt="Receipt preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={onClose} disabled={loading} className="flex-1 py-3 rounded-xl bg-transparent border border-white/10 text-soft-gray font-bold hover:bg-white/5 transition">Cancel</button>
              <button onClick={handleDepositSubmit} disabled={loading}
                className="flex-1 py-3 rounded-xl text-white font-black transition-all disabled:opacity-50"
                style={{ background: acct.color, boxShadow: loading ? 'none' : `0 4px 20px ${acct.color}66` }}>
                {loading ? "Processing..." : "Submit Deposit"}
              </button>
            </div>
          </>
        )}

        {/* --- WITHDRAW UI (Unified Form) --- */}
        {type === "withdraw" && (
          <>
            <div className="mb-4">
              <label className="block text-xs font-bold mb-1.5 text-soft-gray uppercase tracking-widest">Withdrawal Method</label>
              <select 
                value={withdrawMethod} 
                onChange={e => setWithdrawMethod(e.target.value)}
                className="w-full px-4 py-3 bg-[#00000040] border border-primary/20 rounded-xl focus:outline-none focus:border-primary/60 text-white transition-all appearance-none"
              >
                {WITHDRAW_METHODS.map(m => (
                  <option key={m.id} value={m.id} className="bg-[#120d1d] text-white">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold mb-1.5 text-soft-gray uppercase tracking-widest">
                {activeWithdrawMethod?.accountLabel}
              </label>
              <input type="text"
                placeholder={activeWithdrawMethod?.placeholder}
                value={manualNumber} 
                onChange={e => setManualNumber(e.target.value)}
                className="w-full px-4 py-3 bg-[#00000040] border border-primary/20 rounded-xl focus:outline-none focus:border-primary/60 text-white transition-all" 
              />
            </div>

            {withdrawMethod !== 'crypto' && (
              <div className="mb-6">
                <label className="block text-xs font-bold mb-1.5 text-soft-gray uppercase tracking-widest">Receiver Name</label>
                <input type="text" placeholder="Account Title / Full Name" value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#00000040] border border-primary/20 rounded-xl focus:outline-none focus:border-primary/60 text-white transition-all" 
                />
              </div>
            )}

            <div className="mt-2 mb-6 p-4 rounded-xl bg-[#00d2ff15] border border-[#00d2ff30]">
              <p className="text-xs text-[#00d2ff] font-semibold text-center m-0 leading-relaxed">
                ⚠️ <strong className="text-white">Note:</strong> All withdrawal requests are processed manually and may take up to <strong className="text-white">24 hours</strong> to be completed.
              </p>
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={onClose} disabled={loading} className="flex-1 py-3 rounded-xl bg-transparent border border-white/10 text-soft-gray font-bold hover:bg-white/5 transition">Cancel</button>
              <button onClick={handleWithdrawSubmit} disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-highlight text-black font-black hover:shadow-[0_4px_20px_rgba(232,67,147,0.4)] transition-all disabled:opacity-50"
              >
                {loading ? "Processing..." : "Confirm Withdraw"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
