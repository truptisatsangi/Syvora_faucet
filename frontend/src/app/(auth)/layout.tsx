'use client';
import { useTheme } from 'next-themes';
import { FC, ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    
    return (
        <div className={`fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-opacity-80 ${isDarkMode ? 'bg-black' : 'bg-white'
            } backdrop-blur-md border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'
            } shadow-md`}>
            {children}
        </div>
    );
};

export default AuthLayout;
