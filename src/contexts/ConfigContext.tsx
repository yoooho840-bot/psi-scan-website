import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define the two available modes
export type AppMode = 'KOREA' | 'GLOBAL';

interface ConfigContextProps {
    mode: AppMode;
    toggleMode: () => void;
}

const ConfigContext = createContext<ConfigContextProps | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initial mode detection based on domain or localStorage
    const [mode, setMode] = useState<AppMode>(() => {
        const saved = localStorage.getItem('appMode');
        if (saved && (saved === 'KOREA' || saved === 'GLOBAL')) return saved as AppMode;

        // Auto-detect based on hostname
        const hostname = window.location.hostname;
        if (hostname.includes('.kr') || hostname.includes('kr.')) {
            return 'KOREA';
        }

        // Default to Global
        return 'GLOBAL';
    });

    useEffect(() => {
        localStorage.setItem('appMode', mode);
        // Dispatch a custom event so non-React components or other parts can listen if needed
        window.dispatchEvent(new CustomEvent('appModeChanged', { detail: { mode } }));
    }, [mode]);

    const toggleMode = () => {
        setMode(prev => prev === 'KOREA' ? 'GLOBAL' : 'KOREA');
    };

    return (
        <ConfigContext.Provider value={{ mode, toggleMode }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};
