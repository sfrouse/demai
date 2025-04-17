import tokens from "@contentful/f36-tokens";
import { useEffect, useState } from "react";

type StopwatchProps = {
    startTime?: number;
    finalTime?: number; // total duration in ms
};

const Stopwatch = ({ startTime, finalTime }: StopwatchProps) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!startTime) {
            setElapsed(0);
            return;
        }

        if (finalTime !== undefined) {
            setElapsed(finalTime);
            return;
        }

        const update = () => setElapsed(Date.now() - startTime);
        update(); // show immediately

        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [startTime, finalTime]);

    const renderTime = (elapsed: number) => {
        const totalSeconds = Math.floor(elapsed / 1000);
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
        const seconds = String(totalSeconds % 60).padStart(2, "0");
        return `${minutes}:${seconds}s`;
    };

    return (
        <span style={{ fontSize: 12, color: tokens.gray600 }}>
            {renderTime(elapsed)}
        </span>
    );
};

export default Stopwatch;
