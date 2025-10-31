"use client";
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, MessageCircle, Minimize2, Maximize2, RotateCcw } from 'lucide-react';
import { useConversation } from '@/contexts/ConversationContext';

interface AIResponse {
  action: 'add_delegation' | 'add_expense' | 'add_both' | 'ask_questions' | 'update_expense' | 'add_expense_to_delegation';
  delegation?: {
    title: string;
    destination_country: string;
    destination_city: string;
    start_date: string;
    end_date: string;
    purpose: string;
    exchange_rate: number;
    daily_allowance: number;
    notes?: string;
  };
  expenses?: Array<{
    date: string;
    category: string;
    amount: number;
    currency: string;
    description: string;
  }>;
  delegation_id?: string;
  missing_fields?: string[];
  response_message: string;
  questions?: string[];
}

interface PersistentAIAssistantProps {
  onAddDelegation: (delegation: any, expenses?: any[]) => void;
  onAddExpense: (expense: any, delegationId?: string) => void;
  onUpdateExpense: (expenseId: string, expense: any) => void;
  currentDelegationId?: string;
  allowNewDelegations?: boolean; // Only allow new delegations on main page
  onNavigateToDelegation?: (delegationId: string) => void; // For automatic navigation
}

export default function PersistentAIAssistant({ 
  onAddDelegation, 
  onAddExpense, 
  onUpdateExpense,
  currentDelegationId: propDelegationId,
  allowNewDelegations = true,
  onNavigateToDelegation
}: PersistentAIAssistantProps) {
  const { messages, addMessage, clearConversation, isLoading, setIsLoading, currentDelegationContext, setCurrentDelegationContext, currentDelegationId: contextDelegationId, setCurrentDelegationId } = useConversation();
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingVerification, setPendingVerification] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    addMessage({
      type: 'user',
      content: userMessage
    });
    setInput('');
    setIsLoading(true);

    try {
      // Check if this is a confirmation response
      let confirm = false;
      if (pendingVerification) {
        if (userMessage.toLowerCase() === 'yes' || userMessage.toLowerCase() === 'y') {
          confirm = true;
        } else if (userMessage.toLowerCase() === 'no' || userMessage.toLowerCase() === 'n') {
          setPendingVerification(null);
          addMessage({
            type: 'assistant',
            content: '❌ Delegation creation cancelled. You can try again with different details.'
          });
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: messages.slice(-6).map(m => `${m.type}: ${m.content}`).join('\n'),
          current_delegation_id: contextDelegationId || propDelegationId,
          current_delegation_context: currentDelegationContext,
          confirm: confirm
        }),
      });

      // Check for error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = 'Sorry, I encountered an error. Please try again.';
        
        if (response.status === 503) {
          errorMessage = '⚠️ AI Assistant is not configured. The OPENAI_API_KEY environment variable is not set. Please contact the administrator or configure the API key to use this feature.';
        } else if (errorData.error) {
          errorMessage = `Error: ${errorData.error}`;
        } else {
          errorMessage = `Error: Server returned ${response.status} ${response.statusText}`;
        }
        
        addMessage({
          type: 'assistant',
          content: errorMessage
        });
        setIsLoading(false);
        return;
      }

      const aiResponse: AIResponse = await response.json();

      // Add AI response message
      addMessage({
        type: 'assistant',
        content: aiResponse.response_message || 'I received your message, but there was no response content.'
      });

      // Handle the AI response based on action
      if (aiResponse.action === 'add_delegation' && aiResponse.delegation && allowNewDelegations) {
        // Check if delegation was automatically created (has delegation_id)
        if (aiResponse.delegation_id && aiResponse.delegation) {
          // Delegation was automatically created, navigate to it
          setPendingVerification(null);
          const contextString = `${aiResponse.delegation.destination_city}, ${aiResponse.delegation.destination_country} (${aiResponse.delegation.start_date})`;
          setCurrentDelegationContext(contextString);
          setCurrentDelegationId(aiResponse.delegation_id);
          addFeedbackMessage('Delegation created successfully! Redirecting to delegation details...');
          
          // Navigate to the delegation detail page
          if (onNavigateToDelegation) {
            setTimeout(() => {
              onNavigateToDelegation(aiResponse.delegation_id!);
            }, 1500); // Small delay to show the success message
          }
        } else {
          // Fallback to manual form (shouldn't happen with new logic)
          onAddDelegation(aiResponse.delegation);
          const contextString = `${aiResponse.delegation.destination_city}, ${aiResponse.delegation.destination_country} (${aiResponse.delegation.start_date})`;
          setCurrentDelegationContext(contextString);
          addFeedbackMessage('I\'ve opened the delegation form with your details pre-filled. Please review and submit to create the delegation.');
        }
      } else if (aiResponse.action === 'add_delegation' && !allowNewDelegations) {
        addFeedbackMessage('I can help you add expenses to this business travel, but to create a new business travel, please go to the main Business Travel page.');
      } else if (aiResponse.action === 'add_expense' && aiResponse.expenses?.[0]) {
        onAddExpense(aiResponse.expenses[0], contextDelegationId || propDelegationId);
        addFeedbackMessage(`I've added the expense "${aiResponse.expenses[0].description}" for ${aiResponse.expenses[0].amount} ${aiResponse.expenses[0].currency}.`);
      } else if (aiResponse.action === 'add_both' && allowNewDelegations) {
        // Check if delegation was automatically created (has delegation_id)
        if (aiResponse.delegation_id && aiResponse.delegation) {
          // Delegation was automatically created, navigate to it
          setPendingVerification(null);
          const contextString = `${aiResponse.delegation.destination_city}, ${aiResponse.delegation.destination_country} (${aiResponse.delegation.start_date})`;
          setCurrentDelegationContext(contextString);
          setCurrentDelegationId(aiResponse.delegation_id);
          addFeedbackMessage('Delegation and expenses created successfully! Redirecting to delegation details...');
          
          // Navigate to the delegation detail page
          if (onNavigateToDelegation) {
            setTimeout(() => {
              onNavigateToDelegation(aiResponse.delegation_id!);
            }, 1500); // Small delay to show the success message
          }
        } else {
          // Fallback to manual form (shouldn't happen with new logic)
          if (aiResponse.delegation) {
            onAddDelegation(aiResponse.delegation, aiResponse.expenses);
            const contextString = `${aiResponse.delegation.destination_city}, ${aiResponse.delegation.destination_country} (${aiResponse.delegation.start_date})`;
            setCurrentDelegationContext(contextString);
            addFeedbackMessage('I\'ve opened the delegation form with your details pre-filled. The expenses will be automatically added when you submit the delegation.');
          }
        }
      } else if (aiResponse.action === 'add_both' && !allowNewDelegations) {
        addFeedbackMessage('I can help you add expenses to this business travel, but to create a new business travel, please go to the main Business Travel page.');
      } else if (aiResponse.action === 'add_expense_to_delegation' && aiResponse.expenses?.[0]) {
        onAddExpense(aiResponse.expenses[0], aiResponse.delegation_id);
        addFeedbackMessage(`I've added the expense "${aiResponse.expenses[0].description}" for ${aiResponse.expenses[0].amount} ${aiResponse.expenses[0].currency} to the delegation.`);
      }

    } catch (error) {
      console.error('Error calling AI assistant:', error);
      addMessage({
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addFeedbackMessage = (message: string) => {
    addMessage({
      type: 'assistant',
      content: message
    });
  };

  const handleNewConversation = () => {
    clearConversation();
    addMessage({
      type: 'assistant',
      content: 'Great! I\'ve started a fresh conversation. I\'m ready to help you with a new delegation or any other requests. What would you like to do?'
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Widget */}
      {isOpen && (
        <div className={`bg-white shadow-lg border border-neutral-200 transition-all duration-300 ${
          isMinimized ? 'w-80 h-12' : 'w-96 h-[500px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-neutral-200 bg-blue-50">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-neutral-900">AI Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleNewConversation}
                className="p-1 hover:bg-neutral-100 transition-colors"
                title="New Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={toggleMinimize}
                className="p-1 hover:bg-neutral-100 transition-colors"
                title={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleOpen}
                className="p-1 hover:bg-neutral-100 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 h-[380px]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[85%] ${
                        message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 flex items-center justify-center flex-shrink-0 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {message.type === 'user' ? (
                          <User className="w-3 h-3" />
                        ) : (
                          <Bot className="w-3 h-3" />
                        )}
                      </div>
                      <div
                        className={`px-3 py-2 text-sm ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-neutral-100 text-neutral-900'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 flex items-center justify-center bg-neutral-100 text-neutral-600">
                        <Bot className="w-3 h-3" />
                      </div>
                      <div className="bg-neutral-100 px-3 py-2">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Confirmation buttons */}
                {pendingVerification && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 flex items-center justify-center bg-neutral-100 text-neutral-600">
                        <Bot className="w-3 h-3" />
                      </div>
                      <div className="px-3 py-2 bg-neutral-100 text-neutral-900">
                        <p className="text-sm mb-2">Please confirm:</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              // Clear pending verification immediately to hide buttons
                              setPendingVerification(null);
                              
                              // Directly handle confirmation without going through input
                              if (pendingVerification) {
                                addMessage({
                                  type: 'user',
                                  content: 'yes'
                                });
                                setIsLoading(true);
                                
                                // Send confirmation request
                                fetch('/api/assistant', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    message: 'yes',
                                    context: messages.slice(-6).map(m => `${m.type}: ${m.content}`).join('\n'),
                                    current_delegation_id: contextDelegationId || propDelegationId,
                                    current_delegation_context: currentDelegationContext,
                                    confirm: true
                                  }),
                                })
                                .then(async response => {
                                  // Check for error responses (same as main handleSend)
                                  if (!response.ok) {
                                    const errorData = await response.json().catch(() => ({}));
                                    let errorMessage = 'Sorry, I encountered an error. Please try again.';
                                    
                                    if (response.status === 503) {
                                      errorMessage = '⚠️ AI Assistant is not configured. The OPENAI_API_KEY environment variable is not set. Please contact the administrator or configure the API key to use this feature.';
                                    } else if (errorData.error) {
                                      errorMessage = `Error: ${errorData.error}`;
                                    } else {
                                      errorMessage = `Error: Server returned ${response.status} ${response.statusText}`;
                                    }
                                    
                                    addMessage({
                                      type: 'assistant',
                                      content: errorMessage
                                    });
                                    setIsLoading(false);
                                    return null;
                                  }
                                  
                                  return response.json();
                                })
                                .then(aiResponse => {
                                  if (!aiResponse) return; // Error was already handled
                                  
                                  // Add AI response message
                                  addMessage({
                                    type: 'assistant',
                                    content: aiResponse.response_message || 'I received your message, but there was no response content.'
                                  });

                                  // Handle the AI response based on action
                                  if (aiResponse.action === 'add_delegation' && aiResponse.delegation && allowNewDelegations) {
                                    // Check if delegation was automatically created (has delegation_id)
                                    if (aiResponse.delegation_id) {
                                      // Delegation was automatically created, navigate to it
                                      setPendingVerification(null);
                                      const contextString = `${aiResponse.delegation.destination_city}, ${aiResponse.delegation.destination_country} (${aiResponse.delegation.start_date})`;
                                      setCurrentDelegationContext(contextString);
                                      setCurrentDelegationId(aiResponse.delegation_id);
                                      addFeedbackMessage('Delegation created successfully! Redirecting to delegation details...');
                                      
                                      // Navigate to the delegation detail page
                                      if (onNavigateToDelegation) {
                                        setTimeout(() => {
                                          onNavigateToDelegation(aiResponse.delegation_id);
                                        }, 1500); // Small delay to show the success message
                                      }
                                    }
                                  } else if (aiResponse.action === 'add_both' && allowNewDelegations) {
                                    // Check if delegation was automatically created (has delegation_id)
                                    if (aiResponse.delegation_id) {
                                      // Delegation was automatically created, navigate to it
                                      setPendingVerification(null);
                                      const contextString = `${aiResponse.delegation.destination_city}, ${aiResponse.delegation.destination_country} (${aiResponse.delegation.start_date})`;
                                      setCurrentDelegationContext(contextString);
                                      setCurrentDelegationId(aiResponse.delegation_id);
                                      addFeedbackMessage('Delegation and expenses created successfully! Redirecting to delegation details...');
                                      
                                      // Navigate to the delegation detail page
                                      if (onNavigateToDelegation) {
                                        setTimeout(() => {
                                          onNavigateToDelegation(aiResponse.delegation_id);
                                        }, 1500); // Small delay to show the success message
                                      }
                                    }
                                  }
                                  
                                  setIsLoading(false);
                                })
                                .catch(error => {
                                  console.error('Error calling AI assistant:', error);
                                  addMessage({
                                    type: 'assistant',
                                    content: 'Sorry, I encountered an error. Please try again.'
                                  });
                                  setIsLoading(false);
                                });
                              }
                            }}
                            className="px-3 py-1 bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
                          >
                            ✅ Yes, Create
                          </button>
                          <button
                            onClick={() => {
                              // Clear pending verification immediately to hide buttons
                              setPendingVerification(null);
                              
                              // Directly handle cancellation
                              addMessage({
                                type: 'user',
                                content: 'no'
                              });
                              addMessage({
                                type: 'assistant',
                                content: '❌ Delegation creation cancelled. You can try again with different details.'
                              });
                            }}
                            className="px-3 py-1 bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
                          >
                            ❌ No, Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-neutral-200">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your request..."
                    className="flex-1 px-3 py-2 text-sm border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="w-14 h-14 bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center"
          title="Open AI Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
