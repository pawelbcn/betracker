"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationContextType {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearConversation: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  currentDelegationContext: string | null;
  setCurrentDelegationContext: (context: string | null) => void;
  currentDelegationId: string | null;
  setCurrentDelegationId: (id: string | null) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m your delegation assistant. I can help you add delegations, expenses, and make updates using natural language. What would you like to do?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDelegationContext, setCurrentDelegationContext] = useState<string | null>(null);
  const [currentDelegationId, setCurrentDelegationId] = useState<string | null>(null);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const clearConversation = () => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: 'Hi! I\'m your delegation assistant. I can help you add delegations, expenses, and make updates using natural language. What would you like to do?',
        timestamp: new Date()
      }
    ]);
    setCurrentDelegationContext(null);
    setCurrentDelegationId(null);
  };

  return (
    <ConversationContext.Provider value={{
      messages,
      addMessage,
      clearConversation,
      isLoading,
      setIsLoading,
      currentDelegationContext,
      setCurrentDelegationContext,
      currentDelegationId,
      setCurrentDelegationId
    }}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
}
