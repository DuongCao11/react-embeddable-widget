import { useState, useEffect } from 'react';
import { WidgetContext } from '../lib/context';
import ChatWidget from './widget';

interface WidgetContainerProps {
  clientKey: string;
}

export function WidgetContainer({ clientKey }: WidgetContainerProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <WidgetContext.Provider value={{ isOpen, setIsOpen, clientKey }}>
      <ChatWidget />
    </WidgetContext.Provider>
  );
}