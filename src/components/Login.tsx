import React, { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { ShieldCheck, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved
        }
      });
    }
  }, []);

  const onSendOTP = async () => {
    if (!phoneNumber) return setError('Please enter a phone number');
    setLoading(true);
    setError('');
    try {
      // Robust normalization of phone number
      const cleanPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
      const fullPhone = `${countryCode.trim()}${cleanPhone}`;
      
      console.log("Attempting OTP for:", fullPhone);
      
      const result = await signInWithPhoneNumber(auth, fullPhone, (window as any).recaptchaVerifier);
      setConfirmationResult(result);
    } catch (err: any) {
      console.error("OTP Error:", err);
      let errorMsg = 'Failed to send OTP. Please try again later.';
      
      if (err.code === 'auth/captcha-check-failed') {
        errorMsg = 'reCAPTCHA failed. Please refresh and try again.';
      } else if (err.code === 'auth/invalid-phone-number') {
        errorMsg = 'Invalid phone number format.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Too many requests. Please wait a few minutes.';
      } else if (err.message?.includes('auth/unauthorized-domain')) {
        errorMsg = 'SECURITY ERROR: This domain is not authorized in your Firebase Console. See instructions below.';
      }
      
      setError(errorMsg);
      
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.render().then((widgetId: any) => {
          if ((window as any).grecaptcha) (window as any).grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOTP = async () => {
    if (!otp) return setError('Please enter the OTP');
    setLoading(true);
    setError('');
    try {
      await confirmationResult?.confirm(otp);
    } catch (err: any) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 space-y-8">
      <div id="recaptcha-container"></div>
      
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-brand-pink rounded-3xl shadow-xl shadow-brand-pink/30 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="text-white" size={40} />
        </div>
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">SafeGuard</h1>
        <p className="text-gray-500 font-medium tracking-wide text-sm">Secure Entry to your Squad</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-sm border border-brand-bg space-y-6"
      >
        {!confirmationResult ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Mobile Number</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="+91"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-20 px-3 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 font-bold text-center"
                />
                <div className="relative flex-1">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="tel"
                    placeholder="12345 67890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 font-bold"
                  />
                </div>
              </div>
            </div>
            
            <button 
              onClick={onSendOTP}
              disabled={loading}
              className="w-full py-4 bg-brand-pink text-white rounded-2xl font-black shadow-lg shadow-brand-pink/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
              <ArrowRight size={20} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Enter 6-Digit OTP</label>
              <input 
                type="text"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 font-black tracking-[0.5em] text-center text-xl"
              />
            </div>
            
            <button 
              onClick={onVerifyOTP}
              disabled={loading}
              className="w-full py-4 bg-brand-violet text-white rounded-2xl font-black shadow-lg shadow-brand-violet/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
              <CheckCircle2 size={20} />
            </button>
            <button onClick={() => setConfirmationResult(null)} className="w-full text-xs font-bold text-gray-400 py-2">Change Number</button>
          </div>
        )}

        {error && <p className="text-xs text-red-500 font-bold text-center leading-tight">{error}</p>}
        
        {/* Actionable items for Real OTP */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-4">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Fix Real OTP Issues</h4>
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-5 h-5 bg-brand-pink/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-brand-pink">1</span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium leading-tight pt-0.5">
                Go to <span className="font-bold text-gray-700 dark:text-gray-300">Firebase Console &gt; Authentication &gt; Settings</span>.
              </p>
            </div>
            
            <div className="flex gap-3">
              <div className="w-5 h-5 bg-brand-pink/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-brand-pink">2</span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium leading-tight pt-0.5">
                Add <span className="font-bold text-brand-pink underline break-all">{window.location.hostname}</span> to <span className="font-bold text-gray-700 dark:text-gray-300">Authorized Domains</span>.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-orange-600">!</span>
              </div>
              <p className="text-[10px] text-orange-600 font-bold leading-tight pt-0.5">
                Firebase Spark (Free) has a daily limit for real SMS. Upgrade to Blaze for high volume.
              </p>
            </div>
          </div>
        </div>

        {/* Notice about Firebase Spark Plan limitations */}
        <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 space-y-2 mt-4">
          <p className="text-[10px] text-orange-800 font-bold leading-tight flex gap-2">
            ⚠️ Real SMS (OTP) might not arrive unless Firebase Billing is enabled.
          </p>
          <p className="text-[10px] text-orange-700 font-medium leading-tight">
            For testing, use: <br/>
            <span className="font-bold underline decoration-orange-300">+91 94515 93683</span> with <span className="font-bold underline decoration-orange-300">123456</span>
          </p>
        </div>
      </motion.div>

      <p className="text-[10px] text-gray-400 text-center px-8 font-medium">
        By continuing, you verify you are of legal age and will receive an SMS for authentication.
      </p>
    </div>
  );
};
