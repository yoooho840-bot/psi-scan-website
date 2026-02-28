import { useEffect } from 'react';

const useAutoFullscreen = () => {
    useEffect(() => {
        const handleUserInteraction = () => {
            const docElm = document.documentElement as any;
            if (docElm && !document.fullscreenElement) {
                if (docElm.requestFullscreen) {
                    docElm.requestFullscreen().catch((err: any) => console.log(err));
                } else if (docElm.webkitRequestFullscreen) {
                    docElm.webkitRequestFullscreen();
                }
            }
        };

        // Listen for the first user interaction to trigger fullscreen
        document.addEventListener('click', handleUserInteraction, { once: true });
        document.addEventListener('touchstart', handleUserInteraction, { once: true });

        return () => {
            // Cleanup: remove listeners if unmounted before interaction
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);

            // Automatically exit fullscreen when the component using this hook unmounts
            const doc = document as any;
            if (doc.fullscreenElement || doc.webkitFullscreenElement) {
                if (doc.exitFullscreen) {
                    doc.exitFullscreen().catch(() => { });
                } else if (doc.webkitExitFullscreen) {
                    doc.webkitExitFullscreen();
                }
            }
        };
    }, []);
};

export default useAutoFullscreen;
