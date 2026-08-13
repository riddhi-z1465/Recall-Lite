'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Brain, Sparkles, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Loader2, Lock, Mail, Zap, MessageSquare, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
    const router = useRouter();

    const setSessionCookie = async (user: any) => {
        const token = await user.getIdToken();
        const sessionData = JSON.stringify({ uid: user.uid, email: user.email, token });
        document.cookie = `firebase_session=${encodeURIComponent(sessionData)}; path=/; max-age=604800; SameSite=Lax`;
    };

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setMessage({ type: 'error', text: 'Please fill in all fields.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            if (mode === 'signin') {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                if (userCredential.user) {
                    await setSessionCookie(userCredential.user);
                    router.push('/dashboard');
                    router.refresh();
                }
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                if (userCredential.user) {
                    await setSessionCookie(userCredential.user);
                    setMessage({ type: 'success', text: 'Account created successfully! Redirecting...' });
                    router.push('/dashboard');
                    router.refresh();
                }
            }
        } catch (err: any) {
            console.error('Firebase Auth error:', err);
            const errorMessage = err?.code === 'auth/invalid-credential'
                ? 'Invalid email or password.'
                : err?.code === 'auth/email-already-in-use'
                    ? 'An account with this email already exists.'
                    : err?.message || 'Authentication failed. Please try again.';
            setMessage({ type: 'error', text: errorMessage });
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden selection:bg-indigo-500/20">
            {/* Top Right Theme Toggle */}
            <div className="absolute top-4 right-4 z-20">
                <ThemeToggle />
            </div>

            {/* Glowing Ambient Background Elements */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-500/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/15 dark:bg-purple-500/25 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="w-full max-w-md z-10 space-y-6">
                {/* Brand Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/20 shadow-lg backdrop-blur-md">
                        <div className="relative">
                            <Brain className="w-9 h-9 text-indigo-600 dark:text-indigo-400" />
                            <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-pink-500 animate-spin" style={{ animationDuration: '6s' }} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                        Recall Lite
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        Your intelligent second brain. Save web articles, extract insights, and chat with your knowledge base.
                    </p>
                </div>

                {/* Main Auth Card */}
                <Card className="border-border/60 shadow-xl backdrop-blur-xl bg-card/80 dark:bg-card/60 transition-all duration-300">
                    <CardHeader className="pb-4">
                        {/* Tab Switcher */}
                        <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-lg text-sm font-medium">
                            <button
                                type="button"
                                onClick={() => { setMode('signin'); setMessage(null); }}
                                className={`py-2 rounded-md transition-all duration-200 ${mode === 'signin'
                                        ? 'bg-background text-foreground shadow-sm font-semibold'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                onClick={() => { setMode('signup'); setMessage(null); }}
                                className={`py-2 rounded-md transition-all duration-200 ${mode === 'signup'
                                        ? 'bg-background text-foreground shadow-sm font-semibold'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Create Account
                            </button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                        <form onSubmit={handleAuthSubmit} className="space-y-4">
                            {/* Email Input */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Email Address</label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-9 h-11 bg-background/50 focus:bg-background transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Password</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pl-9 pr-10 h-11 bg-background/50 focus:bg-background transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Alert Message */}
                            {message && (
                                <div className={`p-3 rounded-lg flex items-start gap-2.5 text-xs ${message.type === 'error'
                                        ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    }`}>
                                    {message.type === 'error' ? (
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                                    )}
                                    <span>{message.text}</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                                    </>
                                ) : (
                                    <>
                                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Feature Badges */}
                        <div className="pt-4 border-t border-border/50 grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground">
                            <div className="p-2 rounded-lg bg-muted/40 flex flex-col items-center gap-1">
                                <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                                    <Zap className="w-3.5 h-3.5" /> Scraping
                                </span>
                                <span>Save links</span>
                            </div>
                            <div className="p-2 rounded-lg bg-muted/40 flex flex-col items-center gap-1">
                                <span className="flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400">
                                    <MessageSquare className="w-3.5 h-3.5" /> AI Vector
                                </span>
                                <span>RAG Chat</span>
                            </div>
                            <div className="p-2 rounded-lg bg-muted/40 flex flex-col items-center gap-1">
                                <span className="flex items-center gap-1 font-semibold text-pink-600 dark:text-pink-400">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Secure
                                </span>
                                <span>Private Data</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
