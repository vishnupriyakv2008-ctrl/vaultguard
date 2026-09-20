import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Bell,
  Plus,
  Key,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Fingerprint,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Headphones,
  Copy,
  Check,
  Zap,
  Package,
  Clock,
  Sliders,
  BarChart3,
  Building2,
  Database,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { UserSession, RegisteredAccount, SubscriptionState, VaultItem } from '../types.js';

interface LoginPageProps {
  onLoginSuccess: (user: UserSession) => void;
  subscription: SubscriptionState;
  onOpenPaywall?: () => void;
  onInspectDraft?: () => void;
}

const INITIAL_REGISTERED_USERS: RegisteredAccount[] = [
  {
    id: 'usr-1',
    name: 'Devin Vance',
    email: 'devin@custody.io',
    phone: '+1 (555) 234-8901',
    password: 'password123',
    role: 'admin',
    createdAt: '2024-01-15',
  },
  {
    id: 'usr-2',
    name: 'Sarah Linwood',
    email: 'sarah@custody.io',
    phone: '+1 (555) 892-3401',
    password: 'password123',
    role: 'member',
    createdAt: '2024-02-10',
  },
  {
    id: 'usr-3',
    name: 'Auditor Morgan',
    email: 'auditor@custody.io',
    phone: '+1 (555) 771-9023',
    password: 'password123',
    role: 'auditor',
    createdAt: '2024-02-28',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  subscription,
  onOpenPaywall,
  onInspectDraft,
}) => {
  // Auth state: 'login' | 'signup' | 'otp_verify'
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'otp_verify'>('login');

  // Registered users in state/localStorage
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredAccount[]>(() => {
    try {
      const saved = localStorage.getItem('vaultguard_registered_users');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Ignore
    }
    return INITIAL_REGISTERED_USERS;
  });

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('devin@custody.io');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberBrowser, setRememberBrowser] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Sign up form state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  // OTP Verification state
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [phoneOtpCode, setPhoneOtpCode] = useState('');
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState('849201');
  const [generatedPhoneOtp, setGeneratedPhoneOtp] = useState('395104');
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(45);
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  // Save registered users when updated
  useEffect(() => {
    try {
      localStorage.setItem('vaultguard_registered_users', JSON.stringify(registeredUsers));
    } catch (e) {
      // Ignore
    }
  }, [registeredUsers]);

  // Resend countdown timer
  useEffect(() => {
    if (authMode !== 'otp_verify' || resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [authMode, resendCountdown]);

  // Normalize phone number for matching
  const normalizePhone = (p?: string | null) => {
    return (p || '').replace(/[^0-9]/g, '');
  };

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const trimmedId = loginIdentifier.trim().toLowerCase();
    const normalizedInputPhone = normalizePhone(trimmedId);

    // Find matching user by email OR phone in local state
    let foundUser = registeredUsers.find((user) => {
      const emailMatch = (user.email || '').toLowerCase() === trimmedId;
      const cleanUserPhone = normalizePhone(user.phone);
      const phoneMatch =
        normalizedInputPhone.length >= 7 &&
        cleanUserPhone.length >= 7 &&
        (cleanUserPhone === normalizedInputPhone ||
          cleanUserPhone.endsWith(normalizedInputPhone) ||
          normalizedInputPhone.endsWith(cleanUserPhone));
      return emailMatch || phoneMatch;
    });

    // If not found in local state, try backend /api/auth/login
    if (!foundUser) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: trimmedId, password: loginPassword }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            foundUser = {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              phone: data.user.phone || '',
              password: loginPassword,
              role: data.user.role || 'member',
              createdAt: new Date().toISOString().split('T')[0],
            };
            setRegisteredUsers((prev) => [foundUser!, ...prev]);
          }
        }
      } catch (err) {
        // Fallback to local error handling
      }
    }

    if (!foundUser) {
      setLoginError(
        'Custodian identifier not found. Please register or sign in with devin@custody.io or +1 (555) 234-8901.'
      );
      setLoginLoading(false);
      return;
    }

    // Validate password (allow demo passwords or match)
    if (foundUser.password && loginPassword && loginPassword !== foundUser.password) {
      setLoginError('Invalid Vault Master Key / Password for this account.');
      setLoginLoading(false);
      return;
    }

    // Successful login
    setLoginLoading(false);
    onLoginSuccess({
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      phone: foundUser.phone,
      role: foundUser.role,
      token: `vault-jwt-${foundUser.id}-${Date.now()}`,
    });
  };

  // Handle Sign Up form submission -> Triggers Dual OTP Verification
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

    if (!signUpName.trim()) {
      setSignUpError('Please enter your full legal name.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setSignUpError('Please enter a valid custodian email address.');
      return;
    }
    const cleanPhone = normalizePhone(signUpPhone);
    if (!signUpPhone.trim() || cleanPhone.length < 7) {
      setSignUpError('Please enter a valid mobile phone number for OTP.');
      return;
    }
    if (!signUpPassword.trim() || signUpPassword.length < 6) {
      setSignUpError('Master key password must be at least 6 characters.');
      return;
    }

    // Check if email or phone is already taken
    const existing = registeredUsers.find(
      (u) =>
        u.email.toLowerCase() === signUpEmail.trim().toLowerCase() ||
        normalizePhone(u.phone) === cleanPhone
    );
    if (existing) {
      setSignUpError(
        'An account with this email or phone number is already registered. Please log in.'
      );
      return;
    }

    // Generate simulated 6-digit OTPs
    const newEmailCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newPhoneCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedEmailOtp(newEmailCode);
    setGeneratedPhoneOtp(newPhoneCode);
    setEmailOtpCode('');
    setPhoneOtpCode('');
    setEmailOtpVerified(false);
    setPhoneOtpVerified(false);
    setResendCountdown(45);
    setOtpError(null);

    // Switch to Dual OTP Verification screen
    setAuthMode('otp_verify');
  };

  // Handle Dual OTP Verification submission
  const handleVerifyDualOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const isEmailValid =
      emailOtpVerified || emailOtpCode.trim() === generatedEmailOtp || emailOtpCode.trim() === '849201';
    const isPhoneValid =
      phoneOtpVerified || phoneOtpCode.trim() === generatedPhoneOtp || phoneOtpCode.trim() === '395104';

    if (!isEmailValid) {
      setOtpError('Invalid email verification code. Please check the 6-digit code or click Auto-fill.');
      return;
    }
    if (!isPhoneValid) {
      setOtpError('Invalid mobile SMS verification code. Please check the 6-digit code or click Auto-fill.');
      return;
    }

    // Both verified! Create and register new user
    const newUser: RegisteredAccount = {
      id: `usr-${Date.now()}`,
      name: signUpName.trim(),
      email: signUpEmail.trim(),
      phone: signUpPhone.trim(),
      password: signUpPassword,
      role: 'member',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setRegisteredUsers((prev) => [newUser, ...prev]);

    // Asynchronously notify backend database
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        password: newUser.password,
        role: newUser.role,
      }),
    }).catch(() => {});

    // Log the user in and enter the vault
    onLoginSuccess({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      token: `vault-jwt-${newUser.id}-${Date.now()}`,
    });
  };

  // Instant Demo Login as Devin Vance
  const handleOneClickDemo = () => {
    const devin = registeredUsers.find((u) => u.email === 'devin@custody.io') || INITIAL_REGISTERED_USERS[0];
    onLoginSuccess({
      id: devin.id,
      name: devin.name,
      email: devin.email,
      phone: devin.phone,
      role: devin.role,
      token: `vault-jwt-${devin.id}-${Date.now()}`,
    });
  };

  // Simulate Passkey
  const handlePasskeyLogin = () => {
    setPasskeyLoading(true);
    setTimeout(() => {
      setPasskeyLoading(false);
      handleOneClickDemo();
    }, 600);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText('test_OAHnTjVUPYvUSapPhEoSLMDbGwR');
    setCopiedApiKey(true);
    setTimeout(() => setCopiedApiKey(false), 2000);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      {/* 1. Narrow Left Ribbon Navigation (Matching image.png exactly) */}
      <aside className="w-16 bg-[#0F172A] text-slate-400 flex flex-col items-center py-4 justify-between h-full border-r border-slate-800 shrink-0 select-none z-20">
        {/* Top Brand Mark */}
        <div className="flex flex-col items-center gap-6">
          <div
            id="brand-logo-icon"
            className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm cursor-pointer hover:border-emerald-400 transition-all"
            title="VaultGuard Sovereign Engine"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>

          {/* Navigation Icons matching screenshot */}
          <nav className="flex flex-col items-center gap-4">
            <button
              onClick={() => setAuthMode('login')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                authMode === 'login'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Vault Items"
            >
              <Package className="w-5 h-5" />
            </button>

            <button
              onClick={() => setAuthMode('login')}
              className="w-10 h-10 rounded-lg flex items-center justify-center relative hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Expiring Warranties (2 Urgent)"
            >
              <Clock className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-[#0F172A]">
                2
              </span>
            </button>

            <button
              onClick={() => setAuthMode('login')}
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="AI Return Claims"
            >
              <Mail className="w-5 h-5" />
            </button>

            <button
              onClick={() => setAuthMode('login')}
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Financial Analytics"
            >
              <BarChart3 className="w-5 h-5" />
            </button>

            <button
              onClick={() => setAuthMode('login')}
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Vault Settings"
            >
              <Sliders className="w-5 h-5" />
            </button>
          </nav>
        </div>

        {/* Bottom Icons: Mint lightning circle + user avatar */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => onOpenPaywall?.()}
            className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200 flex items-center justify-center shadow-xs transition-transform active:scale-95"
            title="RevenueCat Pro Paywall Trigger"
          >
            <Zap className="w-4 h-4 fill-emerald-700 text-emerald-700" />
          </button>

          <div
            onClick={handleOneClickDemo}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-500/50 cursor-pointer shadow-xs hover:ring-2 hover:ring-emerald-400 transition-all bg-indigo-900 flex items-center justify-center text-white text-xs font-bold"
            title="One-Click Devin Vance"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Custodian Avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initial
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="select-none">DV</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Viewport Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar matching image.png */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-10">
          {/* Global Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              readOnly
              placeholder="Search receipts, warranties, serials, vendors... (T..."
              onClick={() => handleOneClickDemo()}
              className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-slate-200/70 text-slate-500 px-1.5 py-0.5 rounded border border-slate-300 font-mono">
              ⌘K
            </kbd>
          </div>

          {/* Middle/Right Status Badges matching image.png */}
          <div className="flex items-center gap-3">
            {/* RevenueCat Sandbox Pill Group */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1 text-[11px] text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-800">RevenueCat Sandbox</span>
              <span className="text-slate-300">|</span>
              <button
                onClick={copyApiKey}
                className="font-mono text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded"
                title="Copy API Key"
              >
                <span>test_OAHn...GwR</span>
                {copiedApiKey ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-emerald-600 font-bold">200 OK</span>
              <span className="text-slate-300">|</span>
              <span className="bg-rose-50 text-rose-700 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-200/80 flex items-center gap-1">
                <Mail className="w-3 h-3 text-rose-500" />
                <span>pro_access: false</span>
              </span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => handleOneClickDemo()}
              className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 relative transition-colors"
              title="Warranty Expiration Alerts"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            {/* Scan New Receipt / Box Button */}
            <button
              id="btn-login-scan"
              onClick={handleOneClickDemo}
              className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Scan New Receipt / Box</span>
            </button>
          </div>
        </header>

        {/* Sub-header Navigation Ribbon matching image.png */}
        <div className="bg-white border-b border-slate-200/80 px-6 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6 text-[11px]">
            <span className="font-bold text-slate-400 tracking-wider">JUMP TO:</span>
            <button
              onClick={handleOneClickDemo}
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Overview
            </button>
            <button
              onClick={handleOneClickDemo}
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Active Items (3)
            </button>
            <button
              onClick={handleOneClickDemo}
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              AI Telemetry
            </button>
            <button
              onClick={() => onOpenPaywall?.()}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>Paywall Trigger</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-emerald-700 font-semibold">
            SDK Status: Purchases 8.x Live
          </div>
        </div>

        {/* 3. Main Center Content: Dual Column Hero + Login / Sign Up with Dual OTP */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
            {/* LEFT COLUMN: Sovereign Custody Engine Presentation (matching image.png) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-7 lg:p-9 shadow-xs space-y-6">
              {/* Header Title & SDK Pill */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-emerald-400 shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                      VaultGuard
                    </h2>
                    <p className="text-[10px] font-mono font-medium text-slate-400 tracking-wider uppercase mt-0.5">
                      SOVEREIGN CUSTODY ENGINE
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 bg-slate-100/90 border border-slate-200 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Purchases 8.x</span>
                  <span className="text-slate-300">•</span>
                  <span>test_OAHn...GwR</span>
                </div>
              </div>

              {/* Tag: AUTOMATED STATUTORY WARRANTY PROTECTION */}
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-md border border-emerald-200/90">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>AUTOMATED STATUTORY WARRANTY PROTECTION</span>
              </div>

              {/* Big Headline & Subtext */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  Never let another $400 warranty expire in silence.
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  Turn faded thermal receipts, obscured serial barcodes, and ticking manufacturer
                  terms into legally verified claim recovery assets.
                </p>
              </div>

              {/* Active Custody Reserve Card */}
              <div className="bg-[#F0FDF9] border border-emerald-200/90 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                      <Building2 className="w-4 h-4 text-emerald-700" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      Active Custody Reserve
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold bg-emerald-100/90 text-emerald-800 px-2.5 py-0.5 rounded border border-emerald-200">
                    3 Active Claims Protected
                  </span>
                </div>

                {/* 3 Metric Columns */}
                <div className="grid grid-cols-3 gap-4 pt-1 border-t border-emerald-200/60">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
                      CUSTODY TOTAL
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                      $3,420.<span className="text-emerald-700">00</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>100% Validated</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
                      VISION LLM ACCURACY
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                      99.8%
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      OCR + Serial Barcode
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
                      RECOVERY LATENCY
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                      4m
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>Auto-Dispute Draft</span>
                    </div>
                  </div>
                </div>

                {/* Sony WH-1000XM5 Sample Item */}
                <div className="bg-white rounded-lg border border-slate-200/90 p-3 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                      <Headphones className="w-4 h-4 text-slate-700" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        Sony WH-1000XM5 Wireless
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        SN: #SN-902384-B • Best Buy
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      Decays in 3 Days
                    </span>
                    <button
                      onClick={() => handleOneClickDemo()}
                      className="text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 transition-colors"
                    >
                      Inspect Draft
                    </button>
                  </div>
                </div>
              </div>

              {/* Sarah Linwood Quote */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl font-black text-emerald-600 leading-none select-none">
                  “
                </span>
                <div className="space-y-1.5 flex-1 text-xs">
                  <p className="text-slate-700 italic font-medium leading-relaxed">
                    “Recovered $350 on my Sony headphones 3 days before standard warranty ended with
                    a single AI dispute draft. VaultGuard paid for itself instantly.”
                  </p>
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-200/60">
                    <span className="text-slate-600 font-semibold">
                      Sarah Linwood <span className="text-slate-400 font-normal">• Enterprise Custodian #482</span>
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                      Recovered $1,180
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Feature Badges matching image.png */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>256-Bit AES Storage</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-slate-400" />
                  <span>Passkey & FIDO2</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-slate-400" />
                  <span>Local-First Metadata</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: The Auth & Registration Card (matching image.png) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-7 shadow-xs space-y-5">
              {/* One-Click Sandbox Demo Banner */}
              <div className="bg-[#F0FDFA] border border-teal-200/90 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-2xs">
                    <Zap className="w-3.5 h-3.5 fill-white text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      One-Click Sandbox Demo
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      Devin Vance • Free Tier (3/3 Items)
                    </p>
                  </div>
                </div>

                <button
                  id="btn-enter-vault-demo"
                  onClick={handleOneClickDemo}
                  className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 transition-all active:scale-95 shadow-xs"
                >
                  <span>Enter Vault</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* ============================================================= */}
              {/* AUTH VIEW 1: LOG IN (Accepts Email OR Phone Number!)           */}
              {/* ============================================================= */}
              {authMode === 'login' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Title & Subtitle */}
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      Access Your Vault
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Sign in to monitor active asset protections and pending claim drafts.
                    </p>
                  </div>

                  {/* Social Login Buttons matching image.png */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleOneClickDemo}
                      className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.12.64-2.79 1.43-.57.66-1.07 1.73-1.02 2.76 1.07.08 2.19-.57 2.8-1.32z" />
                      </svg>
                      <span>Apple</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOneClickDemo}
                      className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                      <span>Google</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      OR CUSTODIAN EMAIL OR PHONE NUMBER
                    </span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                    {loginError && (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    {/* Email or Phone Input (as explicitly requested!) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Custodian Identifier (Email or Phone)
                        </label>
                        <span className="text-[10px] text-slate-400">Registered contact</span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          {loginIdentifier.includes('@') ? (
                            <Mail className="w-4 h-4" />
                          ) : (
                            <Phone className="w-4 h-4" />
                          )}
                        </div>
                        <input
                          id="input-login-identifier"
                          type="text"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="devin@custody.io or +1 (555) 234-8901"
                          required
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Accepts either the email or phone number used during registration.
                      </p>
                    </div>

                    {/* Vault Master Key / Password Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Vault Master Key / Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setLoginPassword('password123');
                            setLoginError(null);
                          }}
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                        >
                          Forgot key?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          id="input-login-password"
                          type={showPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••••••••••••••"
                          required
                          className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Browser & Use Passkey row matching image.png */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberBrowser}
                          onChange={(e) => setRememberBrowser(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <span className="text-xs text-slate-600 font-medium">
                          Remember browser (30d)
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={handlePasskeyLogin}
                        disabled={passkeyLoading}
                        className="text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200/90 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{passkeyLoading ? 'Authenticating...' : 'Use Passkey'}</span>
                      </button>
                    </div>

                    {/* Sign In to Vault Button */}
                    <button
                      id="btn-submit-signin"
                      type="submit"
                      disabled={loginLoading}
                      className="w-full bg-slate-950 hover:bg-slate-850 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] disabled:opacity-60"
                    >
                      {loginLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      ) : (
                        <Key className="w-4 h-4 text-emerald-400" />
                      )}
                      <span>{loginLoading ? 'Opening Encrypted Vault...' : 'Sign In to Vault'}</span>
                    </button>
                  </form>

                  {/* Switch to Sign Up */}
                  <div className="pt-2 text-center space-y-2">
                    <p className="text-xs text-slate-600">
                      New custodian?{' '}
                      <button
                        id="btn-switch-to-signup"
                        type="button"
                        onClick={() => {
                          setAuthMode('signup');
                          setSignUpError(null);
                        }}
                        className="font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
                      >
                        Start free protection
                      </button>
                    </p>

                    {/* Green Check Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-semibold px-3 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Track up to 3 items free • Zero credit card required</span>
                    </div>

                    {/* Quick registered accounts pill suggestions */}
                    <div className="pt-2 border-t border-slate-100 text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Sample Registered Custodians (Click to fill):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {registeredUsers.slice(0, 3).map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              // Alternate between email and phone to showcase both work!
                              setLoginIdentifier(u.email);
                              setLoginPassword(u.password || 'password123');
                              setLoginError(null);
                            }}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono border border-slate-200 transition-colors"
                          >
                            {u.name.split(' ')[0]}: {u.email}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Terms */}
                  <div className="pt-2 text-center text-[10px] text-slate-400 leading-normal border-t border-slate-100">
                    Protected by Sovereign Vault Protocols. Zero-Knowledge Document Ingestion.
                    <br />
                    <span className="underline cursor-pointer hover:text-slate-600">Terms of Custody</span> &{' '}
                    <span className="underline cursor-pointer hover:text-slate-600">Privacy Hash Policy</span>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* AUTH VIEW 2: SIGN UP (Requires Name, Email, Phone, Password)    */}
              {/* ============================================================= */}
              {authMode === 'signup' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      Start Free Protection
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Register with dual verification to secure zero-knowledge warranty custody.
                    </p>
                  </div>

                  <form onSubmit={handleSignUpSubmit} className="space-y-3">
                    {signUpError && (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                        <span>{signUpError}</span>
                      </div>
                    )}

                    {/* Legal Name */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Full Legal Name
                      </label>
                      <input
                        id="input-signup-name"
                        type="text"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="Sarah Linwood"
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Custodian Email Address
                        </label>
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> OTP Verified
                        </span>
                      </div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="input-signup-email"
                          type="email"
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          placeholder="sarah@vaultguard.io"
                          required
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Mobile Phone Number
                        </label>
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> SMS OTP Verified
                        </span>
                      </div>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="input-signup-phone"
                          type="tel"
                          value={signUpPhone}
                          onChange={(e) => setSignUpPhone(e.target.value)}
                          placeholder="+1 (555) 492-8172"
                          required
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        You can later log in using either this phone number or your email.
                      </p>
                    </div>

                    {/* Vault Master Key / Password */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Create Master Key / Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="input-signup-password"
                          type={showSignUpPassword ? 'text' : 'password'}
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          required
                          className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      id="btn-proceed-to-otp"
                      type="submit"
                      className="w-full bg-slate-950 hover:bg-slate-850 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] mt-2"
                    >
                      <span>Proceed to Dual OTP Verification</span>
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                    </button>
                  </form>

                  <div className="pt-2 text-center">
                    <p className="text-xs text-slate-600">
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          setSignUpError(null);
                        }}
                        className="font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
                      >
                        Sign In to Vault
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* AUTH VIEW 3: DUAL OTP VERIFICATION (Email & Phone OTP!)        */}
              {/* ============================================================= */}
              {authMode === 'otp_verify' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to details</span>
                    </button>
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      Step 2 of 2: Dual Verification
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span>Dual Security OTP Verification</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      To enforce zero-knowledge custody and recovery alerts, verify the 6-digit codes
                      dispatched to both your email and phone number.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyDualOtp} className="space-y-4">
                    {otpError && (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                        <span>{otpError}</span>
                      </div>
                    )}

                    {/* SECTION 1: EMAIL OTP VERIFICATION */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800">1. Email OTP Code</span>
                            <p className="text-[10px] text-slate-500 font-mono">{signUpEmail}</p>
                          </div>
                        </div>

                        {emailOtpCode === generatedEmailOtp ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEmailOtpCode(generatedEmailOtp);
                              setEmailOtpVerified(true);
                            }}
                            className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded transition-colors"
                          >
                            Auto-fill Demo Code
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          id="input-email-otp"
                          type="text"
                          maxLength={6}
                          value={emailOtpCode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setEmailOtpCode(val);
                            if (val === generatedEmailOtp) setEmailOtpVerified(true);
                          }}
                          placeholder="e.g. 849201"
                          className="w-full text-center tracking-[0.3em] font-mono text-base font-bold py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>
                          Simulated Inbox Code:{' '}
                          <strong className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {generatedEmailOtp}
                          </strong>
                        </span>
                        <span>Expires in 10m</span>
                      </div>
                    </div>

                    {/* SECTION 2: PHONE SMS OTP VERIFICATION */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800">2. SMS Mobile OTP Code</span>
                            <p className="text-[10px] text-slate-500 font-mono">{signUpPhone}</p>
                          </div>
                        </div>

                        {phoneOtpCode === generatedPhoneOtp ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setPhoneOtpCode(generatedPhoneOtp);
                              setPhoneOtpVerified(true);
                            }}
                            className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded transition-colors"
                          >
                            Auto-fill Demo Code
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          id="input-phone-otp"
                          type="text"
                          maxLength={6}
                          value={phoneOtpCode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setPhoneOtpCode(val);
                            if (val === generatedPhoneOtp) setPhoneOtpVerified(true);
                          }}
                          placeholder="e.g. 395104"
                          className="w-full text-center tracking-[0.3em] font-mono text-base font-bold py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>
                          Simulated SMS Code:{' '}
                          <strong className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {generatedPhoneOtp}
                          </strong>
                        </span>
                        <button
                          type="button"
                          disabled={resendCountdown > 0}
                          onClick={() => {
                            const newP = Math.floor(100000 + Math.random() * 900000).toString();
                            setGeneratedPhoneOtp(newP);
                            setResendCountdown(45);
                          }}
                          className="font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40"
                        >
                          {resendCountdown > 0 ? `Resend SMS (${resendCountdown}s)` : 'Resend SMS'}
                        </button>
                      </div>
                    </div>

                    {/* Verification Action Button */}
                    <button
                      id="btn-verify-both-otp"
                      type="submit"
                      className="w-full bg-slate-950 hover:bg-slate-850 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Verify Both Channels & Open Vault</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
