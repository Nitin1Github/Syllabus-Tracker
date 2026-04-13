'use client';

import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { Toast } from '@capacitor/toast';

export default function NativeBridge() {
    const backPressedOnce = useRef(false);

    useEffect(() => {
        const handleBackButton = async () => {
            await App.addListener('backButton', async () => {
                if (window.history.length > 2) {
                    window.history.back();
                } else {
                    if (backPressedOnce.current) {
                        App.exitApp();
                    } else {
                        backPressedOnce.current = true;
                        
                        await Toast.show({
                            text: 'Press back again to exit',
                            duration: 'short'
                        });

                        setTimeout(() => {
                            backPressedOnce.current = false;
                        }, 2500);
                    }
                }
            });
        };

        handleBackButton();

        return () => {
            App.removeAllListeners();
        };
    }, []);

    return null; // This component doesn't render anything
}
