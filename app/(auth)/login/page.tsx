'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Bookmark, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Loader2, Lock, Mail, FileText, Search, ShieldCheck } from 'lucide-react';
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
            setMessage({ type: 'error', text: 'Please enter your email and password.' });
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
                    setMessage({ type: 'success', text: 'Account created. Opening your dashboard...' });
                    router.push('/dashboard');
                    router.refresh();
                }
            }
        } catch (err: any) {
            console.error('Firebase Auth error:', err);
            const errorMessage = err?.code === 'auth/invalid-credential'
                ? 'Incorrect email or password.'
                : err?.code === 'auth/email-already-in-use'
                    ? 'An account with this email already exists.'
                    : err?.code === 'auth/weak-password'
                        ? 'Password should be at least 6 characters.'
                        : err?.message || 'Authentication failed. Please try again.';
            setMessage({ type: 'error', text: errorMessage });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-6">
            {/* Top Right Controls */}
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-sm space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-2.5 rounded-lg border border-border bg-card shadow-xs">
                        <Bookmark className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Recall Lite
                        </h1>
                        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
                            Personal reading archive with local vector search and document chat.
                        </p>
                    </div>
                </div>

                {/* Auth Card */}
                <Card className="border-border bg-card shadow-xs">
                    <div className="p-4 border-b border-border">
                        {/* Tab Switcher */}
                        <div className="grid grid-cols-2 p-1 bg-muted rounded-md text-xs font-medium">
                            <button
                                type="button"
                                onClick={() => { setMode('signin'); setMessage(null); }}
                                className={`py-1.5 rounded transition-all ${mode === 'signin'
                                        ? 'bg-background text-foreground shadow-xs font-semibold'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                onClick={() => { setMode('signup'); setMessage(null); }}
                                className={`py-1.5 rounded transition-all ${mode === 'signup'
                                        ? 'bg-background text-foreground shadow-xs font-semibold'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Create Account
                            </button>
                        </div>
                    </div>

                    <CardContent className="p-5 space-y-4">
                        <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">Email</label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="name@domain.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-9 h-9.5 text-sm bg-background border-border"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">Password</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pl-9 pr-9 h-9.5 text-sm bg-background border-border font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Feedback message */}
                            {message && (
                                <div className={`p-2.5 rounded-md flex items-start gap-2 text-xs ${message.type === 'error'
                                        ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
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
                                className="w-full h-9.5 text-sm font-medium mt-1"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                                    </>
                                ) : (
                                    <>
                                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-4 h-4 ml-1.5" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Practical feature notes */}
                        <div className="pt-3 border-t border-border/80 space-y-2 text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>Cleans articles, strips ads & boilerplate</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Search className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>Vector search & answers strictly from source text</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>User-isolated storage in Firebase Firestore</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
