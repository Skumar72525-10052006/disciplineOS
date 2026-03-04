'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const urlB64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export default function NotificationBanner() {
    const [isMounted, setIsMounted] = useState(false);
    const [showBanner, setShowBanner] = useState(false);
    const [subscribing, setSubscribing] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        // Check if browser supports notifications and service workers
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            return;
        }

        // Check current permission
        if (Notification.permission === 'default') {
            // Wait 2 seconds before showing to not overwhelm user immediately
            const timer = setTimeout(() => setShowBanner(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleSubscribe = async () => {
        setSubscribing(true);
        try {
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                const registration = await navigator.serviceWorker.ready;

                // VAPID public key from env
                const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                if (!vapidPublicKey) {
                    console.error('VAPID public key missing');
                    setShowBanner(false);
                    return;
                }

                const convertedVapidKey = urlB64ToUint8Array(vapidPublicKey);

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey,
                });

                // Send subscription to our backend
                await fetch('/api/notifications/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(subscription),
                });

                setShowBanner(false);
            } else {
                setShowBanner(false);
            }
        } catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
        } finally {
            setSubscribing(false);
        }
    };

    if (!isMounted) return null;

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100vw-1rem)] sm:w-auto sm:min-w-[500px] sm:max-w-2xl"
                >
                    <div className="bg-[#0f1428]/95 backdrop-blur-xl border border-indigo-500/40 shadow-2xl shadow-indigo-500/20 rounded-2xl p-5 sm:p-7 flex items-start gap-4 sm:gap-6">
                        <div className="bg-indigo-500/20 p-3 rounded-xl text-indigo-400 mt-1 flex-shrink-0">
                            <Bell className="w-7 h-7" />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg mb-2">Enable Notifications</h3>
                            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-5">
                                Get reminded to complete your habits and track your time. Keep the chain alive! 🔥
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={handleSubscribe}
                                    disabled={subscribing}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {subscribing ? 'Enabling...' : 'Enable Now'}
                                </button>
                                <button
                                    onClick={() => setShowBanner(false)}
                                    className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Not Now
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowBanner(false)}
                            className="text-slate-500 hover:text-white transition-colors p-1 flex-shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
