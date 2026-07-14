"use client";

import { useState, useEffect } from "react";
import { Button } from "@digital-astrology/ui";

export function ReferralCard() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const res = await fetch("/api/referral");
        if (res.ok) {
          const data = await res.json();
          setReferralCode(data.referralCode);
        }
      } catch (error) {
        console.error("Failed to fetch referral code", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCode();
  }, []);

  if (loading) return null;

  if (!referralCode) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = `${origin}/ref/${referralCode}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Discover your future with Jyotishya Astrology! Generate your free Kundli and accurate predictions. Use my invite link: ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-900/20 via-emerald-900/10 to-transparent p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
           <p className="text-green-400 text-sm font-semibold tracking-wide mb-1">🎁 Share & Earn</p>
           <h2 className="text-2xl font-bold text-white mb-2">Invite Friends on WhatsApp</h2>
           <p className="text-slate-400 max-w-md text-sm">
             Share your unique link and unlock premium features for both of you when they sign up!
           </p>
        </div>
        <div className="flex flex-col gap-3 w-full md:w-auto">
           <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg p-2">
             <code className="text-sm text-green-300 px-2 truncate w-full md:w-48">{referralLink}</code>
             <button onClick={handleCopy} className="text-slate-400 hover:text-white px-2 text-sm shrink-0 font-medium">
               {copied ? "Copied!" : "Copy"}
             </button>
           </div>
           <Button onClick={handleWhatsAppShare} className="bg-[#25D366] hover:bg-[#128C7E] text-white border-none gap-2 w-full">
             <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
               <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
             </svg>
             Share via WhatsApp
           </Button>
        </div>
      </div>
    </div>
  );
}
