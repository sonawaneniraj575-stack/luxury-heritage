// AI Chatbot Service for Luxury E-commerce
import { Product, ChatMessage, ProductSuggestion, QuickReply, Order } from '../../shared/types';

export type Language = 'en' | 'hi' | 'mr';
export type ChatbotIntent = 'greeting' | 'product_inquiry' | 'recommendation' | 'order_tracking' | 'price_inquiry' | 'stock_check' | 'add_to_cart' | 'checkout_help' | 'care_guide' | 'support' | 'goodbye';

interface ChatbotResponse {
  message: string;
  quickReplies?: QuickReply[];
  productSuggestions?: ProductSuggestion[];
  actions?: ChatbotAction[];
  language: Language;
}

interface ChatbotAction {
  type: 'add_to_cart' | 'show_product' | 'track_order' | 'call_human';
  data?: any;
}

export class LuxuryChatbotService {
  private currentLanguage: Language = 'en';
  private conversationHistory: ChatMessage[] = [];
  private userPreferences: {
    preferredFragranceTypes?: string[];
    priceRange?: { min: number; max: number };
    previousOrders?: string[];
  } = {};

  // Translations for multilingual support
  private translations = {
    en: {
      greeting: "Welcome to Maison Heritage! I'm your personal luxury consultant. How may I assist you with our exquisite perfumes and timepieces today?",
      productInquiry: "I'd be delighted to help you find the perfect piece. What are you looking for today?",
      recommendation: "Based on your preferences, here are some recommendations from our exclusive collection:",
      orderTracking: "I can help you track your order. Please provide your order number.",
      priceInquiry: "Here are the current prices for our luxury collection:",
      stockCheck: "Let me check the availability for you.",
      addToCart: "I've added this exquisite piece to your cart. Would you like to continue shopping or proceed to checkout?",
      checkoutHelp: "I'm here to guide you through our seamless checkout experience.",
      careGuide: "Here's how to care for your luxury purchase to maintain its timeless elegance:",
      support: "I understand your concern. Let me connect you with our heritage specialists.",
      goodbye: "Thank you for choosing Maison Heritage. Have a wonderful day!",
      error: "I apologize, but I didn't quite understand. Could you please rephrase your question?"
    },
    hi: {
      greeting: "मैसन हेरिटेज में आपका स्वागत है! मैं आपका व्यक्तिगत लक्जरी सलाहकार हूं। आज मैं आपकी सुगंध और घड़ियों के साथ कैसे सहायता कर सकता हूं?",
      productInquiry: "मुझे आपके लिए सही उत्पाद खोजने में खुशी होगी। आज आप क्या ढूंढ रहे हैं?",
      recommendation: "आपकी पसंद के आधार पर, यहाँ हमारे विशेष संग्रह की कुछ सिफारिशें हैं:",
      orderTracking: "मैं आपके आर्डर को ट्रैक करने में आपकी मदद कर सकता हूं। कृपया अपना आर्डर नंबर बताएं।",
      priceInquiry: "यहाँ हमारे लक्जरी संग्रह की वर्तमान कीमतें हैं:",
      stockCheck: "मैं आपके लिए उपलब्धता की जांच करता हूं।",
      addToCart: "मैंने इस उत्कृष्ट वस्तु को आपकी कार्ट में जोड़ दिया है। क्या आप खरीदारी जारी रखना चाहते हैं या चेकआउट पर जाना चाहते हैं?",
      checkoutHelp: "मैं आपको हमारे सहज चेकआउट अनुभव के माध्यम से मार्गदर्शन करने के लिए यहाँ हूं।",
      careGuide: "यहाँ बताया गया है कि अपनी लक्जरी खरीदारी की देखभाल कैसे करें:",
      support: "मैं आपकी चिंता समझता हूं। मुझे आपको हमारे हेरिटेज विशेषज्ञों से जोड़ने दें।",
      goodbye: "मैसन हेरिटेज चुनने के लिए धन्यवाद। आपका दिन शुभ हो!",
      error: "क्षमा करें, मैं पूरी तरह से समझ नहीं पाया। क्या आप कृपया अपना प्रश्न दोबारा पूछ सकते हैं?"
    },
    mr: {
      greeting: "मेसन हेरिटेजमध्ये आपले स्वागत आहे! मी तुमचा वैयक्तिक लक्झरी सल्लागार आहे. आज मी तुमच्या सुगंध आणि घड्याळांसाठी कशी मदत करू शकतो?",
      productInquiry: "तुमच्यासाठी योग्य उत्पादन शोधण्यात मला आनंद होईल. आज तुम्ही काय शोधत आहात?",
      recommendation: "तुमच्या आवडीनुसार, आमच्या खास संग्रहातील काही शिफारसी:",
      orderTracking: "मी तुमचा ऑर्डर ट्रॅक करण्यात तुमची मदत करू शकतो. कृपया तुमचा ऑर्डर नंबर द्या.",
      priceInquiry: "आमच्या लक्झरी संग्रहाच्या सध्याच्या किमती येथे आहेत:",
      stockCheck: "मी तुमच्यासाठी उपलब्धता तपासतो.",
      addToCart: "मी हा उत्कृष्ट तुकडा तुमच्या कार्टमध्ये जोडला आहे. तुम्हाला खरेदी सुरू ठेवायची आहे की चेकआउटवर जायचे आहे?",
      checkoutHelp: "मी तुम्हाला आमच्या सहज चेकआउट अनुभवाद्वारे मार्गदर्शन करण्यासाठी येथे आहे.",
      careGuide: "तुमच्या लक्झरी खरेदीची काळजी कशी घ्यावी:",
      support: "मी तुमची चिंता समजतो. मला तुम्हाला आमच्या हेरिटेज तज्ञांशी जोडू द्या.",
      goodbye: "मेसन हेरिटेज निवडल्याबद्दल धन्यवाद. तुमचा दिवस चांगला जावो!",
      error: "माफ करा, मी पूर्णपणे समजू शकलो नाही. तुम्ही कृपया तुमचा प्रश्न पुन्हा विचारू शकता का?"
    }
  };

  constructor() {
    this.initializeVoiceSupport();
  }

  setLanguage(language: Language): void {
    this.currentLanguage = language;
  }

  async processMessage(userMessage: string, products: Product[]): Promise<ChatbotResponse> {
    const intent = this.detectIntent(userMessage);
    const normalizedMessage = userMessage.toLowerCase();

    // Add user message to conversation history
    this.conversationHistory.push({
      id: Date.now().toString(),
      sessionId: 'current',
      sender: 'user',
      content: userMessage,
      type: 'text',
      timestamp: new Date()
    });

    let response: ChatbotResponse;

    switch (intent) {
      case 'greeting':
        response = this.handleGreeting();
        break;
      case 'product_inquiry':
        response = this.handleProductInquiry(normalizedMessage, products);
        break;
      case 'recommendation':
        response = this.handleRecommendation(normalizedMessage, products);
        break;
      case 'price_inquiry':
        response = this.handlePriceInquiry(normalizedMessage, products);
        break;
      case 'stock_check':
        response = this.handleStockCheck(normalizedMessage, products);
        break;
      case 'order_tracking':
        response = this.handleOrderTracking(normalizedMessage);
        break;
      case 'care_guide':
        response = this.handleCareGuide(normalizedMessage);
        break;
      case 'checkout_help':
        response = this.handleCheckoutHelp();
        break;
      case 'support':
        response = this.handleSupport();
        break;
      case 'goodbye':
        response = this.handleGoodbye();
        break;
      default:
        response = this.handleDefault(normalizedMessage, products);
    }

    // Add bot response to conversation history
    this.conversationHistory.push({
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
    });

    return response;
  }

  private detectIntent(message: string): ChatbotIntent {
    const normalizedMessage = message.toLowerCase();
    
    // Greeting patterns
    if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste|namaskar)/.test(normalizedMessage)) {
      return 'greeting';
    }

    // Product inquiry patterns
    if (/(show|find|search|look|want|need).*(perfume|fragrance|scent|watch|timepiece|limited|collection)/.test(normalizedMessage) ||
        /(perfume|fragrance|scent|watch|timepiece).*for/.test(normalizedMessage)) {
      return 'product_inquiry';
    }

    // Recommendation patterns
    if (/(recommend|suggest|best|popular|trending|what.*should|help.*choose)/.test(normalizedMessage)) {
      return 'recommendation';
    }

    // Price inquiry patterns
    if (/(price|cost|how.*much|expensive|cheap|budget)/.test(normalizedMessage)) {
      return 'price_inquiry';
    }

    // Stock check patterns
    if (/(stock|available|in.*stock|out.*stock|inventory)/.test(normalizedMessage)) {
      return 'stock_check';
    }

    // Order tracking patterns
    if (/(track|order|delivery|shipping|where.*order|order.*status)/.test(normalizedMessage)) {
      return 'order_tracking';
    }

    // Care guide patterns
    if (/(care|maintain|clean|store|how.*to.*care|preservation)/.test(normalizedMessage)) {
      return 'care_guide';
    }

    // Checkout help patterns
    if (/(checkout|payment|buy|purchase|cart|proceed)/.test(normalizedMessage)) {
      return 'checkout_help';
    }

    // Support patterns
    if (/(help|support|problem|issue|complaint|speak.*human|agent)/.test(normalizedMessage)) {
      return 'support';
    }

    // Goodbye patterns
    if (/(bye|goodbye|thank|thanks|see.*you|have.*good)/.test(normalizedMessage)) {
      return 'goodbye';
    }

    return 'product_inquiry'; // Default fallback
  }

  private handleGreeting(): ChatbotResponse {
    return {
      message: this.translations[this.currentLanguage].greeting,
      quickReplies: [
        { text: "View Perfumes", action: "view_perfumes" },
        { text: "View Watches", action: "view_watches" },
        { text: "New Arrivals", action: "view_new_arrivals" },
        { text: "Limited Editions", action: "view_limited_editions" }
      ],
      language: this.currentLanguage
    };
  }

  private handleProductInquiry(message: string, products: Product[]): ChatbotResponse {
    let filteredProducts = products;

    // Filter by category
    if (/perfume|fragrance|scent/.test(message)) {
      filteredProducts = products.filter(p => p.category === 'perfume');
    } else if (/watch|timepiece|chronograph/.test(message)) {
      filteredProducts = products.filter(p => p.category === 'watch');
    } else if (/limited|exclusive|special/.test(message)) {
      filteredProducts = products.filter(p => p.isLimitedEdition);
    }

    // Filter by gender
    if (/men|male|masculine|him/.test(message)) {
      filteredProducts = filteredProducts.filter(p => 
        p.tags?.includes('men') || p.tags?.includes('masculine') || p.tags?.includes('unisex')
      );
    } else if (/women|female|feminine|her/.test(message)) {
      filteredProducts = filteredProducts.filter(p => 
        p.tags?.includes('women') || p.tags?.includes('feminine') || p.tags?.includes('unisex')
      );
    }

    // Filter by price range
    if (/budget|cheap|affordable|under/.test(message)) {
      filteredProducts = filteredProducts.filter(p => p.price < 500);
    } else if (/luxury|premium|expensive|high.end/.test(message)) {
      filteredProducts = filteredProducts.filter(p => p.price > 1000);
    }

    const suggestions = filteredProducts.slice(0, 3).map(product => ({
      product,
      reason: this.getRecommendationReason(product, message),
      confidence: 0.9
    }));

    return {
      message: `${this.translations[this.currentLanguage].productInquiry} I found ${filteredProducts.length} items that match your search.`,
      productSuggestions: suggestions,
      quickReplies: [
        { text: "Add to Cart", action: "add_to_cart" },
        { text: "View Details", action: "view_details" },
        { text: "More Options", action: "more_options" },
        { text: "Ask Questions", action: "ask_questions" }
      ],
      language: this.currentLanguage
    };
  }

  private handleRecommendation(message: string, products: Product[]): ChatbotResponse {
    // Smart recommendations based on bestsellers, ratings, and user preferences
    const recommendedProducts = products
      .filter(p => p.isBestseller || p.rating >= 4.5 || p.isNewArrival)
      .sort((a, b) => {
        // Prioritize by bestseller status, then rating, then newness
        if (a.isBestseller && !b.isBestseller) return -1;
        if (!a.isBestseller && b.isBestseller) return 1;
        if (a.rating !== b.rating) return b.rating - a.rating;
        return b.createdAt.getTime() - a.createdAt.getTime();
      })
      .slice(0, 4);

    const suggestions = recommendedProducts.map(product => ({
      product,
      reason: this.getRecommendationReason(product, 'recommendation'),
      confidence: 0.95
    }));

    return {
      message: this.translations[this.currentLanguage].recommendation,
      productSuggestions: suggestions,
      quickReplies: [
        { text: "Tell me more", action: "more_details" },
        { text: "Add to Cart", action: "add_to_cart" },
        { text: "Different style", action: "different_style" },
        { text: "Price range", action: "price_range" }
      ],
      language: this.currentLanguage
    };
  }

  private handlePriceInquiry(message: string, products: Product[]): ChatbotResponse {
    // Extract product name if mentioned
    const productName = this.extractProductName(message, products);
    let relevantProducts = products;

    if (productName) {
      relevantProducts = products.filter(p => 
        p.name.toLowerCase().includes(productName.toLowerCase())
      );
    }

    const priceRanges = this.categorizeByPrice(relevantProducts);
    
    return {
      message: `${this.translations[this.currentLanguage].priceInquiry}\n\n${priceRanges}`,
      quickReplies: [
        { text: "Under $500", action: "filter_under_500" },
        { text: "$500 - $1000", action: "filter_500_1000" },
        { text: "Above $1000", action: "filter_above_1000" },
        { text: "View All", action: "view_all" }
      ],
      language: this.currentLanguage
    };
  }

  private handleStockCheck(message: string, products: Product[]): ChatbotResponse {
    const productName = this.extractProductName(message, products);
    let stockInfo = "";

    if (productName) {
      const product = products.find(p => 
        p.name.toLowerCase().includes(productName.toLowerCase())
      );
      
      if (product) {
        if (product.stockCount > 5) {
          stockInfo = `✅ ${product.name} is in stock (${product.stockCount} available)`;
        } else if (product.stockCount > 0) {
          stockInfo = `⚠️ ${product.name} - Only ${product.stockCount} left in stock!`;
        } else {
          stockInfo = `❌ ${product.name} is currently out of stock`;
        }
      } else {
        stockInfo = "I couldn't find that specific product. Let me show you similar items.";
      }
    } else {
      const inStock = products.filter(p => p.stockCount > 0);
      const lowStock = products.filter(p => p.stockCount <= 5 && p.stockCount > 0);
      
      stockInfo = `📊 Stock Summary:\n✅ ${inStock.length} items in stock\n⚠️ ${lowStock.length} items with limited stock`;
    }

    return {
      message: `${this.translations[this.currentLanguage].stockCheck}\n\n${stockInfo}`,
      quickReplies: [
        { text: "Notify when available", action: "notify_stock" },
        { text: "Similar products", action: "similar_products" },
        { text: "Pre-order", action: "pre_order" }
      ],
      language: this.currentLanguage
    };
  }

  private handleOrderTracking(message: string): ChatbotResponse {
    const orderNumber = this.extractOrderNumber(message);
    
    if (orderNumber) {
      // In a real implementation, this would query the order database
      return {
        message: `📦 Order ${orderNumber} Status:\n\n🏭 Processing → ✅ Shipped → 🚚 In Transit → 📍 Delivered\n\nYour order is currently being processed. Expected delivery: 3-5 business days.\n\nTracking ID: MH${orderNumber}TRACK`,
        quickReplies: [
          { text: "Update delivery address", action: "update_address" },
          { text: "Contact delivery partner", action: "contact_delivery" },
          { text: "Order details", action: "order_details" }
        ],
        language: this.currentLanguage
      };
    } else {
      return {
        message: `${this.translations[this.currentLanguage].orderTracking}\n\nPlease provide your order number (format: MH-XXXXXXXXX)`,
        quickReplies: [
          { text: "I don't have order number", action: "find_order" },
          { text: "Email order details", action: "email_order" }
        ],
        language: this.currentLanguage
      };
    }
  }

  private handleCareGuide(message: string): ChatbotResponse {
    let careAdvice = "";

    if (/perfume|fragrance/.test(message)) {
      careAdvice = `🌸 Perfume Care Guide:\n\n• Store in cool, dark places away from sunlight\n• Keep bottles upright to prevent leakage\n• Avoid temperature fluctuations\n• Apply to pulse points for best projection\n• Layer with matching body lotions for longevity`;
    } else if (/watch|timepiece/.test(message)) {
      careAdvice = `⌚ Watch Care Guide:\n\n• Regular servicing every 3-5 years\n• Avoid exposure to extreme temperatures\n• Clean with soft, dry cloth\n• Store in original box or watch roll\n• Wind mechanical watches regularly`;
    } else {
      careAdvice = `💎 Luxury Care Guidelines:\n\n• Store products in original packaging\n• Keep away from direct sunlight and heat\n• Handle with clean, dry hands\n• Regular professional maintenance\n• Follow specific care instructions for each item`;
    }

    return {
      message: `${this.translations[this.currentLanguage].careGuide}\n\n${careAdvice}`,
      quickReplies: [
        { text: "Professional cleaning", action: "professional_cleaning" },
        { text: "Warranty info", action: "warranty_info" },
        { text: "Repair services", action: "repair_services" }
      ],
      language: this.currentLanguage
    };
  }

  private handleCheckoutHelp(): ChatbotResponse {
    return {
      message: `${this.translations[this.currentLanguage].checkoutHelp}\n\n🛒 Checkout Process:\n1. Review your cart items\n2. Enter shipping information\n3. Select payment method\n4. Complete secure payment\n5. Receive order confirmation\n\n💳 We accept all major cards, UPI, wallets, and net banking.`,
      quickReplies: [
        { text: "Payment options", action: "payment_options" },
        { text: "Shipping info", action: "shipping_info" },
        { text: "Apply coupon", action: "apply_coupon" },
        { text: "Guest checkout", action: "guest_checkout" }
      ],
      language: this.currentLanguage
    };
  }

  private handleSupport(): ChatbotResponse {
    return {
      message: `${this.translations[this.currentLanguage].support}\n\n📞 Contact Options:\n• Live Chat: Available 24/7\n• Phone: +1-800-HERITAGE\n• Email: support@maisonheritage.com\n• WhatsApp: +1-555-LUXURY\n\nResponse time: Usually within 2 hours`,
      quickReplies: [
        { text: "Connect to human agent", action: "human_agent" },
        { text: "Schedule callback", action: "schedule_callback" },
        { text: "Email support", action: "email_support" }
      ],
      actions: [{ type: 'call_human' }],
      language: this.currentLanguage
    };
  }

  private handleGoodbye(): ChatbotResponse {
    return {
      message: this.translations[this.currentLanguage].goodbye,
      language: this.currentLanguage
    };
  }

  private handleDefault(message: string, products: Product[]): ChatbotResponse {
    // Try to find products that match any keywords in the message
    const keywords = message.split(' ').filter(word => word.length > 2);
    const matchingProducts = products.filter(product => 
      keywords.some(keyword => 
        product.name.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword) ||
        product.tags?.some(tag => tag.toLowerCase().includes(keyword))
      )
    );

    if (matchingProducts.length > 0) {
      const suggestions = matchingProducts.slice(0, 2).map(product => ({
        product,
        reason: "Based on your message",
        confidence: 0.7
      }));

      return {
        message: "I found some products that might interest you based on your message:",
        productSuggestions: suggestions,
        quickReplies: [
          { text: "Tell me more", action: "more_details" },
          { text: "Different options", action: "different_options" },
          { text: "Speak to expert", action: "speak_expert" }
        ],
        language: this.currentLanguage
      };
    }

    return {
      message: this.translations[this.currentLanguage].error,
      quickReplies: [
        { text: "View all products", action: "view_all_products" },
        { text: "Popular items", action: "popular_items" },
        { text: "Help", action: "help" },
        { text: "Speak to human", action: "human_support" }
      ],
      language: this.currentLanguage
    };
  }

  // Helper methods
  private getRecommendationReason(product: Product, context: string): string {
    if (product.isBestseller) return "Bestseller - loved by customers";
    if (product.isLimitedEdition) return "Exclusive limited edition";
    if (product.isNewArrival) return "Latest addition to our collection";
    if (product.rating >= 4.8) return `Highly rated (${product.rating}/5)`;
    if (product.originalPrice && product.price < product.originalPrice) return "Special offer";
    return "Handpicked for you";
  }

  private extractProductName(message: string, products: Product[]): string | null {
    const words = message.toLowerCase().split(' ');
    
    for (const product of products) {
      const productWords = product.name.toLowerCase().split(' ');
      const matchingWords = productWords.filter(word => words.includes(word));
      
      if (matchingWords.length >= 2 || 
          (matchingWords.length === 1 && productWords.length === 1)) {
        return product.name;
      }
    }
    
    return null;
  }

  private extractOrderNumber(message: string): string | null {
    const orderPattern = /MH-?\d{8,}/i;
    const match = message.match(orderPattern);
    return match ? match[0] : null;
  }

  private categorizeByPrice(products: Product[]): string {
    const under500 = products.filter(p => p.price < 500);
    const mid500to1000 = products.filter(p => p.price >= 500 && p.price <= 1000);
    const above1000 = products.filter(p => p.price > 1000);

    return `💰 Price Categories:
• Under $500: ${under500.length} items
• $500 - $1000: ${mid500to1000.length} items  
• Above $1000: ${above1000.length} items`;
  }

  // Voice support methods
  private initializeVoiceSupport(): void {
    if ('speechSynthesis' in window && 'webkitSpeechRecognition' in window) {
      console.log('Voice support initialized');
    }
  }

  speakMessage(message: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = this.currentLanguage === 'hi' ? 'hi-IN' : 
                      this.currentLanguage === 'mr' ? 'mr-IN' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  }

  startVoiceRecognition(callback: (text: string) => void): void {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = this.currentLanguage === 'hi' ? 'hi-IN' : 
                        this.currentLanguage === 'mr' ? 'mr-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        callback(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.start();
    }
  }

  // Add to cart functionality
  createAddToCartAction(productId: string, quantity: number = 1): ChatbotAction {
    return {
      type: 'add_to_cart',
      data: { productId, quantity }
    };
  }

  // Get conversation history
  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  // Clear conversation
  clearConversation(): void {
    this.conversationHistory = [];
  }
}

// Create singleton instance
export const luxuryChatbot = new LuxuryChatbotService();