import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ShoppingCart, 
  ExternalLink, 
  Bot,
  User,
  Crown,
  Sparkles,
  Clock
} from 'lucide-react';
import { luxuryChatbot, Language } from '../lib/chatbot';
import { useCartStore } from '../stores/cart';
import { Product, ChatMessage, QuickReply, ProductSuggestion } from '../../shared/types';
import { Link } from 'react-router-dom';

interface LuxuryChatbotProps {
  products: Product[];
  className?: string;
}

export default function LuxuryChatbot({ products, className = '' }: LuxuryChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useCartStore();

  // Initialize chatbot with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        sessionId: 'current',
        sender: 'bot',
        content: getWelcomeMessage(),
        type: 'text',
        metadata: {
          quickReplies: [
            { text: "View Perfumes", action: "view_perfumes" },
            { text: "View Watches", action: "view_watches" },
            { text: "New Arrivals", action: "view_new_arrivals" },
            { text: "Help Me Choose", action: "help_choose" }
          ]
        },
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, currentLanguage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set chatbot language when changed
  useEffect(() => {
    luxuryChatbot.setLanguage(currentLanguage);
  }, [currentLanguage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getWelcomeMessage = (): string => {
    const welcomeMessages = {
      en: "Welcome to Maison Heritage! ✨ I'm your personal luxury consultant. How may I assist you with our exquisite perfumes and timepieces today?",
      hi: "मैसन हेरिटेज में आपका स्वागत है! ✨ मैं आपका व्यक्तिगत लक्जरी सलाहकार हूं। आज मैं आपकी सुगंध और घड़ियों के साथ कैसे सहायता कर सकता हूं?",
      mr: "मेसन हेरिटेजमध्ये आपले स्वागत आहे! ✨ मी तुमचा वैयक्तिक लक्झरी सल्लागार आहे. आज मी तुमच्या सुगंध आणि घड्याळांसाठी कशी मदत करू शकतो?"
    };
    return welcomeMessages[currentLanguage];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sessionId: 'current',
      sender: 'user',
      content: inputValue,
      type: 'text',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Simulate thinking time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await luxuryChatbot.processMessage(inputValue, products);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sessionId: 'current',
        sender: 'bot',
        content: response.message,
        type: 'text',
        metadata: {
          quickReplies: response.quickReplies,
          suggestions: response.productSuggestions
        },
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      // Text-to-speech for bot response
      if (isSpeechEnabled) {
        luxuryChatbot.speakMessage(response.message);
      }

      // Handle actions
      if (response.actions) {
        response.actions.forEach(action => {
          if (action.type === 'add_to_cart' && action.data) {
            handleAddToCart(action.data.productId, action.data.quantity);
          }
        });
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        sessionId: 'current',
        sender: 'bot',
        content: "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment.",
        type: 'text',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = async (quickReply: QuickReply) => {
    // Add user's quick reply as a message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sessionId: 'current',
      sender: 'user',
      content: quickReply.text,
      type: 'text',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Handle quick reply actions
    let responseMessage = '';
    let suggestions: ProductSuggestion[] = [];
    let newQuickReplies: QuickReply[] = [];

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      switch (quickReply.action) {
        case 'view_perfumes':
          const perfumes = products.filter(p => p.category === 'perfume');
          suggestions = perfumes.slice(0, 3).map(p => ({
            product: p,
            reason: 'From our perfume collection',
            confidence: 0.9
          }));
          responseMessage = `Here are our exquisite perfumes (${perfumes.length} total):`;
          newQuickReplies = [
            { text: "For Men", action: "men_perfumes" },
            { text: "For Women", action: "women_perfumes" },
            { text: "Unisex", action: "unisex_perfumes" }
          ];
          break;

        case 'view_watches':
          const watches = products.filter(p => p.category === 'watch');
          suggestions = watches.slice(0, 3).map(p => ({
            product: p,
            reason: 'From our timepiece collection',
            confidence: 0.9
          }));
          responseMessage = `Here are our Swiss timepieces (${watches.length} total):`;
          newQuickReplies = [
            { text: "Luxury Watches", action: "luxury_watches" },
            { text: "Limited Edition", action: "limited_watches" },
            { text: "Classic Collection", action: "classic_watches" }
          ];
          break;

        case 'view_new_arrivals':
          const newArrivals = products.filter(p => p.isNewArrival);
          suggestions = newArrivals.slice(0, 3).map(p => ({
            product: p,
            reason: 'Latest addition to our collection',
            confidence: 0.95
          }));
          responseMessage = `Our newest treasures (${newArrivals.length} items):`;
          break;

        case 'view_limited_editions':
          const limitedEdition = products.filter(p => p.isLimitedEdition);
          suggestions = limitedEdition.slice(0, 3).map(p => ({
            product: p,
            reason: 'Exclusive limited edition',
            confidence: 0.95
          }));
          responseMessage = `Exclusive limited editions (${limitedEdition.length} items):`;
          break;

        case 'help_choose':
          responseMessage = "I'd be delighted to help you find the perfect piece! Tell me:\n\n• What occasion is this for?\n• Do you prefer perfumes or timepieces?\n• Any specific style preferences?\n• What's your budget range?";
          newQuickReplies = [
            { text: "Gift for someone", action: "gift_guide" },
            { text: "Personal use", action: "personal_use" },
            { text: "Special occasion", action: "special_occasion" }
          ];
          break;

        default:
          // Process as regular message
          const response = await luxuryChatbot.processMessage(quickReply.text, products);
          responseMessage = response.message;
          suggestions = response.productSuggestions || [];
          newQuickReplies = response.quickReplies || [];
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sessionId: 'current',
        sender: 'bot',
        content: responseMessage,
        type: 'text',
        metadata: {
          quickReplies: newQuickReplies,
          suggestions
        },
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      if (isSpeechEnabled) {
        luxuryChatbot.speakMessage(responseMessage);
      }
    } catch (error) {
      console.error('Quick reply error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddToCart = (productId: string, quantity: number = 1) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addItem(product, quantity);
      
      // Add confirmation message
      const confirmMessage: ChatMessage = {
        id: Date.now().toString(),
        sessionId: 'current',
        sender: 'bot',
        content: `✅ "${product.name}" has been added to your cart! Would you like to continue shopping or proceed to checkout?`,
        type: 'text',
        metadata: {
          quickReplies: [
            { text: "Continue Shopping", action: "continue_shopping" },
            { text: "View Cart", action: "view_cart" },
            { text: "Checkout", action: "checkout" },
            { text: "Remove Item", action: "remove_item" }
          ]
        },
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, confirmMessage]);
    }
  };

  const startVoiceRecognition = () => {
    setIsListening(true);
    luxuryChatbot.startVoiceRecognition((transcript) => {
      setInputValue(transcript);
      setIsListening(false);
    });
  };

  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
    if (!isSpeechEnabled) {
      speechSynthesis.cancel();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="btn-luxury-primary rounded-full w-16 h-16 shadow-luxury hover:scale-105 transition-all duration-300"
        >
          <Crown size={24} />
        </Button>
        
        {/* Floating badge for new features */}
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-gold text-navy text-xs animate-pulse">
            AI
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Card className="w-96 h-[600px] shadow-luxury border-gold/20 bg-white/95 backdrop-blur-sm">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-navy to-navy-dark text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8 border-2 border-gold">
                <AvatarImage src="/images/chatbot-avatar.jpg" />
                <AvatarFallback className="bg-gold text-navy">
                  <Bot size={16} />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm font-semibold flex items-center">
                  <Crown size={14} className="mr-1 text-gold" />
                  Luxury Consultant
                </CardTitle>
                <p className="text-xs text-gold">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Language Selector */}
              <Select value={currentLanguage} onValueChange={(value: Language) => setCurrentLanguage(value)}>
                <SelectTrigger className="w-16 h-8 text-xs border-gold/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="hi">हि</SelectItem>
                  <SelectItem value="mr">मर</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Speech Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSpeech}
                className="w-8 h-8 p-0 text-white hover:bg-white/10"
              >
                {isSpeechEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </Button>
              
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 p-0 text-white hover:bg-white/10"
              >
                <X size={14} />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 h-[400px] bg-gradient-to-b from-cream/20 to-white">
          {messages.map((message) => (
            <div key={message.id} className="space-y-3">
              {/* Message Bubble */}
              <div
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className="flex items-start space-x-2 max-w-[80%]">
                  {message.sender === 'bot' && (
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarFallback className="bg-gold text-navy text-xs">
                        <Bot size={12} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-gold text-navy ml-2'
                        : 'bg-white border border-gray-200 mr-2'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  {message.sender === 'user' && (
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarFallback className="bg-navy text-white text-xs">
                        <User size={12} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>

              {/* Product Suggestions */}
              {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
                <div className="space-y-2">
                  {message.metadata.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gold/20 rounded-lg p-3 hover:border-gold/40 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <img
                          src={suggestion.product.images[0]?.url}
                          alt={suggestion.product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-sm">{suggestion.product.name}</h4>
                              <p className="text-xs text-muted-foreground">{suggestion.product.brand}</p>
                              <p className="text-xs text-gold mt-1">{suggestion.reason}</p>
                            </div>
                            <span className="text-sm font-semibold">
                              {formatPrice(suggestion.product.price)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1 mt-2">
                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(suggestion.product.id)}
                              className="btn-luxury-primary text-xs h-7 px-3"
                            >
                              <ShoppingCart size={12} className="mr-1" />
                              Add to Cart
                            </Button>
                            <Link to={`/product/${suggestion.product.slug}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 px-3"
                                onClick={() => setIsOpen(false)}
                              >
                                <ExternalLink size={12} className="mr-1" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Replies */}
              {message.metadata?.quickReplies && message.metadata.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {message.metadata.quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs h-8 px-3 border-gold/30 hover:border-gold hover:bg-gold/10 transition-all"
                    >
                      {reply.text}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-gold text-navy text-xs">
                    <Bot size={12} />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gold rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="p-4 border-t border-gold/20 bg-white">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="pr-12 border-gold/30 focus:border-gold"
                disabled={isTyping}
              />
              
              {/* Voice Input Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={startVoiceRecognition}
                disabled={isListening}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 ${
                  isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-gold'
                }`}
              >
                {isListening ? <Mic size={14} /> : <MicOff size={14} />}
              </Button>
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="btn-luxury-primary w-10 h-10 p-0"
            >
              <Send size={16} />
            </Button>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              {isListening && (
                <span className="flex items-center text-red-500">
                  <Mic size={12} className="mr-1" />
                  Listening...
                </span>
              )}
              {isSpeechEnabled && (
                <span className="flex items-center text-green-600">
                  <Volume2 size={12} className="mr-1" />
                  Speech enabled
                </span>
              )}
            </div>
            <span className="flex items-center">
              <Sparkles size={12} className="mr-1 text-gold" />
              AI-powered
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}