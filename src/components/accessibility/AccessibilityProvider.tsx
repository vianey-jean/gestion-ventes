
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  announceToScreenReader: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReaderMode: false,
    keyboardNavigation: true
  });

  const [ariaLiveRegion, setAriaLiveRegion] = useState<string>('');

  useEffect(() => {
    // Load saved preferences
    try {
      const saved = localStorage.getItem('accessibility-settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load accessibility settings:', error);
    }

    // Detect system preferences
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setSettings(prev => ({ ...prev, reducedMotion: true }));
      }

      if (window.matchMedia('(prefers-contrast: high)').matches) {
        setSettings(prev => ({ ...prev, highContrast: true }));
      }
    } catch (error) {
      console.warn('Failed to detect system preferences:', error);
    }
  }, []);

  useEffect(() => {
    // Save preferences
    try {
      localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save accessibility settings:', error);
    }

    // Apply CSS classes
    const root = document.documentElement;
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('large-text', settings.largeText);
    root.classList.toggle('reduced-motion', settings.reducedMotion);
    root.classList.toggle('screen-reader-mode', settings.screenReaderMode);
  }, [settings]);

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const announceToScreenReader = (message: string) => {
    setAriaLiveRegion(message);
    setTimeout(() => setAriaLiveRegion(''), 1000);
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, announceToScreenReader }}>
      {children}
      {/* ARIA Live region for screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {ariaLiveRegion}
      </div>
    </AccessibilityContext.Provider>
  );
};
