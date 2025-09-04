// hooks/useCountdown.js
import { useEffect, useState } from "react";

export default function useCountdown(targetTime, onExpire) {
    const [remaining, setRemaining] = useState(
        targetTime ? Math.max(0, targetTime - Date.now()) : 0
    );

    useEffect(() => {
        if (!targetTime) return;

        const interval = setInterval(() => {
            const timeLeft = Math.max(0, targetTime - Date.now());
            setRemaining(timeLeft);

            if (timeLeft <= 0) {
                clearInterval(interval);
                if (onExpire) onExpire();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetTime, onExpire]);

    const seconds = Math.floor(remaining / 1000);
    return seconds;
}
