// app/menu/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  SparklesIcon,
  FireIcon,
  ClockIcon,
  MapPinIcon,
  HeartIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  CreditCardIcon,
  QueueListIcon,
  BoltIcon,
  HomeIcon,
  CakeIcon,
  BeakerIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// Mock Data
const MENU_DATA = {
  categories: [
    { id: 'all', name: 'All', icon: <HomeIcon className="h-4 w-4" /> },
    { id: 'starters', name: 'Starters', icon: <CubeIcon className="h-4 w-4" /> },
    { id: 'main-course', name: 'Main Course', icon: <HomeIcon className="h-4 w-4" /> },
    { id: 'pasta', name: 'Pasta', icon: <HomeIcon className="h-4 w-4" /> },
    { id: 'burgers', name: 'Burgers', icon: <BeakerIcon className="h-4 w-4" /> },
    { id: 'seafood', name: 'Seafood', icon: <BeakerIcon className="h-4 w-4" /> },
    { id: 'salads', name: 'Salads', icon: <CubeIcon className="h-4 w-4" /> },
    { id: 'desserts', name: 'Desserts', icon: <CakeIcon className="h-4 w-4" /> },
    { id: 'beverages', name: 'Beverages', icon: <BeakerIcon className="h-4 w-4" /> },
    { id: 'cocktails', name: 'Cocktails', icon: <BeakerIcon className="h-4 w-4" /> },
  ],
  items: [
    {
      id: '1',
      name: 'Truffle Mushroom Risotto',
      description: 'Creamy Arborio rice with wild mushrooms, truffle oil, and parmesan',
      price: 4500,
      category: 'main-course',
      is_available: true,
      is_popular: true,
      is_new: false,
      preparation_time: 25,
      dietary: ['Vegetarian'],
      icon: <HomeIcon className="h-8 w-8" />,
    },
    {
      id: '2',
      name: 'Lobster Thermidor',
      description: 'Fresh lobster in a creamy cognac sauce, gratinated with cheese',
      price: 8500,
      category: 'seafood',
      is_available: true,
      is_popular: true,
      is_new: false,
      preparation_time: 30,
      dietary: ['Gluten-Free'],
      icon: <BeakerIcon className="h-8 w-8" />,
    },
    {
      id: '3',
      name: 'Wagyu Beef Burger',
      description: 'Premium wagyu beef patty with truffle mayo, arugula, and brioche bun',
      price: 6800,
      category: 'burgers',
      is_available: true,
      is_popular: false,
      is_new: true,
      preparation_time: 20,
      dietary: [],
      icon: <BeakerIcon className="h-8 w-8" />,
    },
    {
      id: '4',
      name: 'Smoked Salmon & Avocado Toast',
      description: 'Artisan sourdough with avocado, smoked salmon, and poached egg',
      price: 3800,
      category: 'starters',
      is_available: true,
      is_popular: false,
      is_new: false,
      preparation_time: 15,
      dietary: ['Gluten-Free'],
      icon: <CubeIcon className="h-8 w-8" />,
    },
    {
      id: '5',
      name: 'Classic Caesar Salad',
      description: 'Crisp romaine with parmesan, garlic croutons, and house dressing',
      price: 3200,
      category: 'salads',
      is_available: true,
      is_popular: false,
      is_new: false,
      preparation_time: 10,
      dietary: ['Vegetarian'],
      icon: <CubeIcon className="h-8 w-8" />,
    },
    {
      id: '6',
      name: 'Spaghetti Carbonara',
      description: 'Traditional Roman pasta with guanciale, egg yolk, and pecorino',
      price: 4200,
      category: 'pasta',
      is_available: true,
      is_popular: true,
      is_new: false,
      preparation_time: 20,
      dietary: [],
      icon: <HomeIcon className="h-8 w-8" />,
    },
    {
      id: '7',
      name: 'Grilled Octopus',
      description: 'Tender octopus with lemon, herbs, and olive oil',
      price: 5500,
      category: 'seafood',
      is_available: true,
      is_popular: false,
      is_new: false,
      preparation_time: 25,
      dietary: ['Gluten-Free'],
      icon: <BeakerIcon className="h-8 w-8" />,
    },
    {
      id: '8',
      name: 'Tiramisu',
      description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
      price: 2800,
      category: 'desserts',
      is_available: true,
      is_popular: false,
      is_new: true,
      preparation_time: 10,
      dietary: ['Vegetarian'],
      icon: <CakeIcon className="h-8 w-8" />,
    },
    {
      id: '9',
      name: 'Chocolate Fondant',
      description: 'Warm chocolate cake with melting center, vanilla ice cream',
      price: 3200,
      category: 'desserts',
      is_available: true,
      is_popular: true,
      is_new: false,
      preparation_time: 15,
      dietary: ['Vegetarian'],
      icon: <CakeIcon className="h-8 w-8" />,
    },
    {
      id: '10',
      name: 'Signature Old Fashioned',
      description: 'Bourbon, bitters, sugar, and orange zest',
      price: 2500,
      category: 'cocktails',
      is_available: true,
      is_popular: false,
      is_new: false,
      preparation_time: 5,
      dietary: ['Gluten-Free'],
      icon: <BeakerIcon className="h-8 w-8" />,
    },
    {
      id: '11',
      name: 'Fresh Fruit Platter',
      description: 'Seasonal fruits with honey and mint',
      price: 2200,
      category: 'starters',
      is_available: true,
      is_popular: false,
      is_new: false,
      preparation_time: 10,
      dietary: ['Vegetarian', 'Gluten-Free'],
      icon: <CubeIcon className="h-8 w-8" />,
    },
    {
      id: '12',
      name: 'Grilled Ribeye Steak',
      description: 'Prime ribeye with garlic butter, served with truffle fries',
      price: 7800,
      category: 'main-course',
      is_available: true,
      is_popular: true,
      is_new: false,
      preparation_time: 30,
      dietary: ['Gluten-Free'],
      icon: <HomeIcon className="h-8 w-8" />,
    },
  ],
};

const TABLE_INFO = {
  id: 't1',
  number: '5',
  name: 'Garden Terrace',
};

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid';
  timestamp: string;
  tableNumber: string;
}

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('menu');

  const filteredItems = MENU_DATA.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.is_available;
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Mock order status updates
  useEffect(() => {
    if (orders.length > 0) {
      const interval = setInterval(() => {
        setOrders(prev => prev.map(order => {
          if (order.status === 'pending') {
            return { ...order, status: 'preparing' };
          }
          if (order.status === 'preparing') {
            return { ...order, status: 'ready' };
          }
          if (order.status === 'ready') {
            return { ...order, status: 'served' };
          }
          return order;
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [orders]);

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;
      const newQty = item.quantity + change;
      if (newQty <= 0) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, quantity: newQty } : i);
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
    toast.success('Item removed');
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared');
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsPlacingOrder(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const newOrderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    setOrderNumber(newOrderNumber);
    
    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber: newOrderNumber,
      items: [...cart],
      total: cartTotal,
      status: 'pending',
      timestamp: new Date().toISOString(),
      tableNumber: TABLE_INFO.number,
    };
    
    setOrders(prev => [...prev, newOrder]);
    setShowOrderSuccess(true);
    setIsPlacingOrder(false);
    setCart([]);
    
    toast.success(`Order ${newOrderNumber} placed!`);
  };

  const handleOrderComplete = () => {
    setShowOrderSuccess(false);
    setShowCart(false);
    setActiveTab('orders');
  };

  const handlePayOrder = (order: Order) => {
    setSelectedOrderForPayment(order);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    if (selectedOrderForPayment) {
      setOrders(prev => prev.map(order => 
        order.id === selectedOrderForPayment.id 
          ? { ...order, status: 'paid' }
          : order
      ));
      toast.success(`Order ${selectedOrderForPayment.orderNumber} paid!`);
    }
    setShowPaymentModal(false);
    setSelectedOrderForPayment(null);
  };

  const getOrderStatusDisplay = (status: Order['status']) => {
    const statusMap = {
      pending: { label: 'Pending', color: 'bg-[#FFF3E0] text-[#E65100]', icon: <ClockIcon className="h-4 w-4" /> },
      preparing: { label: 'Preparing', color: 'bg-[#DBEAFE] text-[#1E40AF]', icon: <BoltIcon className="h-4 w-4" /> },
      ready: { label: 'Ready', color: 'bg-[#E8F5E9] text-[#2E7D32]', icon: <CheckCircleIcon className="h-4 w-4" /> },
      served: { label: 'Served', color: 'bg-[#E8F5E9] text-[#2E7D32]', icon: <CheckCircleIcon className="h-4 w-4" /> },
      paid: { label: 'Paid', color: 'bg-[#E8F5E9] text-[#2E7D32]', icon: <CheckCircleIcon className="h-4 w-4" /> },
    };
    return statusMap[status] || statusMap.pending;
  };

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-[#DDD5C4] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#16302B] to-[#1D3B34] rounded-xl flex items-center justify-center shadow-lg">
                  <HomeIcon className="h-6 w-6 text-[#F7F1E4]" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-medium text-[#2A2622] tracking-tight">
                    Classic Hotel Menu
                  </h1>
                  <p className="font-body text-xs text-[#8A8377] flex items-center gap-1">
                    <MapPinIcon className="h-3 w-3" />
                    Table {TABLE_INFO.number} • {TABLE_INFO.name}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab(activeTab === 'orders' ? 'menu' : 'orders')}
                className={`relative p-2.5 rounded-xl transition-all ${
                  activeTab === 'orders'
                    ? 'bg-[#C9A468] text-[#F7F1E4]'
                    : 'bg-[#F7F1E4] text-[#5B564B] hover:bg-[#DDD5C4]'
                }`}
              >
                <QueueListIcon className="h-5 w-5" />
                {orders.length > 0 && orders.some(o => o.status !== 'paid') && (
                  <span className="absolute -top-1 -right-1 bg-[#C62828] text-[#F7F1E4] text-xs w-5 h-5 rounded-full flex items-center justify-center font-body font-medium shadow-lg">
                    {orders.filter(o => o.status !== 'paid').length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2.5 bg-gradient-to-br from-[#16302B] to-[#1D3B34] text-[#F7F1E4] rounded-xl hover:shadow-lg transition-all group"
              >
                <ShoppingCartIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C9A468] text-[#F7F1E4] text-xs w-6 h-6 rounded-full flex items-center justify-center font-body font-medium shadow-lg">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Table Info Bar */}
      <div className="bg-gradient-to-r from-[#16302B] to-[#1D3B34] text-[#F7F1E4] py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-body">Table {TABLE_INFO.number}</span>
            <span className="w-px h-4 bg-[#B9C4B9]/30" />
            <span className="font-body text-[#B9C4B9]">{TABLE_INFO.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#B9C4B9]">✨ Live ordering</span>
            <div className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
          </div>
        </div>
      </div>

      {/* Orders View */}
      {activeTab === 'orders' ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="font-display text-2xl font-medium text-[#2A2622] mb-6">Your Orders</h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-[#DDD5C4]">
              <QueueListIcon className="h-16 w-16 mx-auto text-[#DDD5C4] mb-4" />
              <p className="font-body text-[#8A8377]">No orders yet</p>
              <button
                onClick={() => setActiveTab('menu')}
                className="font-body mt-4 px-6 py-2 bg-[#16302B] text-[#F7F1E4] rounded-xl hover:bg-[#1D3B34] transition-colors"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = getOrderStatusDisplay(order.status);
                const canPay = order.status !== 'paid' && (order.status === 'served' || order.status === 'ready');
                
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-[#DDD5C4] overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-display text-lg font-medium text-[#2A2622]">
                            {order.orderNumber}
                          </p>
                          <p className="font-body text-sm text-[#8A8377]">
                            {new Date(order.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.color}`}>
                          {status.icon}
                          <span className="font-body text-sm font-medium">{status.label}</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-[#F7F1E4] pt-4">
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="font-body text-[#5B564B]">{item.name} x{item.quantity}</span>
                              <span className="font-body font-medium text-[#16302B]">
                                ₦{(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#DDD5C4]">
                        <div>
                          <p className="font-body text-sm text-[#8A8377]">Total</p>
                          <p className="font-display text-xl font-medium text-[#16302B]">
                            ₦{order.total.toLocaleString()}
                          </p>
                        </div>
                        {canPay ? (
                          <button
                            onClick={() => handlePayOrder(order)}
                            className="font-body px-6 py-2 bg-[#C9A468] text-[#F7F1E4] rounded-xl hover:bg-[#B8924F] transition-all flex items-center gap-2"
                          >
                            <CreditCardIcon className="h-5 w-5" />
                            Pay Now
                          </button>
                        ) : order.status === 'paid' ? (
                          <span className="font-body px-6 py-2 bg-[#E8F5E9] text-[#2E7D32] rounded-xl flex items-center gap-2">
                            <CheckCircleIcon className="h-5 w-5" />
                            Paid
                          </span>
                        ) : (
                          <span className="font-body px-6 py-2 bg-[#F7F1E4] text-[#8A8377] rounded-xl flex items-center gap-2">
                            <ClockIcon className="h-5 w-5" />
                            {status.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Menu View
        <>
          {/* Search & Categories */}
          <div className="sticky top-[73px] z-40 bg-[#FAF6EF] py-4 px-4 shadow-sm">
            <div className="max-w-7xl mx-auto space-y-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A8377]" />
                <input
                  type="text"
                  placeholder="Search our menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="font-body w-full pl-12 pr-4 py-3 border-2 border-[#DDD5C4] rounded-xl bg-white/80 backdrop-blur-sm text-[#2A2622] outline-none transition-all focus:border-[#C9A468] focus:ring-2 focus:ring-[#C9A468]/20 placeholder:text-[#8A8377] shadow-sm"
                />
              </div>

              <div className="overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex gap-2 min-w-max">
                  {MENU_DATA.categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`
                        font-body px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                        flex items-center gap-2
                        ${selectedCategory === category.id
                          ? 'bg-gradient-to-r from-[#16302B] to-[#1D3B34] text-[#F7F1E4] shadow-md scale-105'
                          : 'bg-white/80 backdrop-blur-sm text-[#5B564B] hover:bg-[#F7F1E4] border border-[#DDD5C4] hover:border-[#C9A468]'
                        }
                      `}
                    >
                      {category.icon}
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Grid */}
          <main className="max-w-7xl mx-auto px-4 py-8 pb-32">
            {filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <HomeIcon className="h-16 w-16 mx-auto text-[#DDD5C4] mb-4" />
                <p className="font-display text-xl text-[#2A2622]">No items found</p>
                <p className="font-body text-[#8A8377] mt-2">Try adjusting your search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white rounded-2xl border border-[#DDD5C4] overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-[#F7F1E4] to-[#E8E0D5] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {item.is_popular && (
                          <span className="font-body text-xs bg-[#C9A468] text-[#F7F1E4] px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                            <FireIcon className="h-3 w-3" /> Popular
                          </span>
                        )}
                        {item.is_new && (
                          <span className="font-body text-xs bg-[#16302B] text-[#F7F1E4] px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                            <SparklesIcon className="h-3 w-3" /> New
                          </span>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                          {favorites.includes(item.id) ? (
                            <HeartSolidIcon className="h-5 w-5 text-[#C62828]" />
                          ) : (
                            <HeartIcon className="h-5 w-5 text-[#8A8377]" />
                          )}
                        </button>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="font-body text-xs bg-white/90 backdrop-blur-sm text-[#2A2622] px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          {item.preparation_time} min
                        </span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center text-[#8A8377]/30 group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-medium text-[#2A2622] group-hover:text-[#16302B] transition-colors">
                            {item.name}
                          </h3>
                          <p className="font-body text-sm text-[#8A8377] mt-1 line-clamp-2">
                            {item.description}
                          </p>
                          {item.dietary && item.dietary.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {item.dietary.map(diet => (
                                <span key={diet} className="font-body text-[10px] bg-[#F7F1E4] text-[#5B564B] px-2 py-0.5 rounded-full">
                                  {diet}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F7F1E4]">
                        <div>
                          <span className="font-display text-xl font-medium text-[#16302B]">
                            ₦{item.price.toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          className="font-body px-4 py-2 bg-gradient-to-r from-[#16302B] to-[#1D3B34] text-[#F7F1E4] rounded-xl hover:shadow-lg transition-all flex items-center gap-2 group-hover:scale-105"
                        >
                          <PlusIcon className="h-4 w-4" />
                          Add
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* Floating Order Button - Mobile */}
      {cartCount > 0 && activeTab === 'menu' && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowCart(true)}
          className="md:hidden fixed bottom-6 right-6 bg-gradient-to-r from-[#16302B] to-[#1D3B34] text-[#F7F1E4] p-4 rounded-full shadow-2xl z-30 flex items-center gap-2"
        >
          <ShoppingCartIcon className="h-6 w-6" />
          <span className="font-body font-medium">{cartCount}</span>
        </motion.button>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm z-50"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col"
            >
              <div className="p-4 border-b border-[#DDD5C4] flex justify-between items-center bg-gradient-to-r from-[#16302B] to-[#1D3B34] text-[#F7F1E4]">
                <div>
                  <h2 className="font-display text-lg font-medium">Your Order</h2>
                  <p className="font-body text-sm text-[#B9C4B9]">{cart.length} items</p>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-[#1D3B34] rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCartIcon className="h-16 w-16 mx-auto text-[#DDD5C4] mb-4" />
                    <p className="font-body text-[#8A8377]">Your cart is empty</p>
                    <p className="font-body text-sm text-[#8A8377]">Add delicious items from the menu</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-[#F7F1E4] rounded-xl p-4 border border-[#DDD5C4]"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-body font-medium text-[#2A2622]">{item.name}</p>
                          <p className="font-body text-sm text-[#16302B]">₦{item.price.toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-[#8A8377] hover:text-[#C62828] transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded-lg border border-[#DDD5C4] hover:bg-[#DDD5C4] transition-colors flex items-center justify-center bg-white"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="font-body font-medium text-[#2A2622] min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-lg border border-[#DDD5C4] hover:bg-[#DDD5C4] transition-colors flex items-center justify-center bg-white"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                        <span className="ml-auto font-display font-medium text-[#16302B]">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-[#DDD5C4] p-4 space-y-4 bg-[#FAF6EF]">
                  <div className="flex justify-between font-display text-xl font-medium text-[#16302B]">
                    <span>Total</span>
                    <span>₦{cartTotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="bg-[#DBEAFE] rounded-lg p-3 border border-[#93C5FD]">
                    <div className="flex items-center gap-2">
                      <ClipboardDocumentCheckIcon className="h-5 w-5 text-[#1E40AF]" />
                      <p className="font-body text-sm text-[#1E40AF]">
                        Order will be sent to the kitchen. Pay after dining.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={clearCart}
                      className="flex-1 font-body py-3 text-sm font-medium text-[#8A8377] hover:text-[#C62828] transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={placeOrder}
                      disabled={isPlacingOrder || cart.length === 0}
                      className="flex-1 font-body py-3 text-sm font-medium text-[#F7F1E4] bg-gradient-to-r from-[#16302B] to-[#1D3B34] rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isPlacingOrder ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#F7F1E4] border-t-transparent rounded-full animate-spin" />
                          Placing...
                        </>
                      ) : (
                        <>
                          <DocumentTextIcon className="h-5 w-5" />
                          Place Order
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Success Modal */}
      <AnimatePresence>
        {showOrderSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-20 h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="h-10 w-10 text-[#2E7D32]" />
                </div>
                
                <h2 className="font-display text-2xl font-medium text-[#2A2622]">Order Placed! 🎉</h2>
                <p className="font-body text-[#8A8377] mt-2">
                  Your order has been sent to the kitchen.
                </p>
                
                <div className="mt-4 p-4 bg-[#F7F1E4] rounded-xl border border-[#DDD5C4]">
                  <p className="font-body text-sm text-[#8A8377]">Order Number</p>
                  <p className="font-display text-2xl font-medium text-[#16302B]">{orderNumber}</p>
                </div>

                <div className="mt-4 space-y-2 text-sm text-[#8A8377]">
                  <p className="flex items-center justify-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-[#2E7D32]" />
                    Your food will be prepared shortly
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <HomeIcon className="h-4 w-4 text-[#C9A468]" />
                    Please enjoy your meal
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <CreditCardIcon className="h-4 w-4 text-[#C9A468]" />
                    Pay after dining via the Orders tab
                  </p>
                </div>

                <button
                  onClick={handleOrderComplete}
                  className="w-full mt-6 font-body py-3 text-sm font-medium text-[#F7F1E4] bg-gradient-to-r from-[#16302B] to-[#1D3B34] rounded-xl hover:shadow-lg transition-all"
                >
                  View My Orders
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedOrderForPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <h2 className="font-display text-2xl font-medium text-[#2A2622] text-center">Pay for Order</h2>
                <p className="font-body text-[#8A8377] text-center">{selectedOrderForPayment.orderNumber}</p>
                
                <div className="mt-6 space-y-4">
                  <div className="bg-[#F7F1E4] rounded-xl p-4">
                    <div className="space-y-2">
                      {selectedOrderForPayment.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="font-body text-[#5B564B]">{item.name} x{item.quantity}</span>
                          <span className="font-body font-medium text-[#16302B]">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#DDD5C4] flex justify-between">
                      <span className="font-body font-medium text-[#2A2622]">Total</span>
                      <span className="font-display text-xl font-medium text-[#16302B]">
                        ₦{selectedOrderForPayment.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#DBEAFE] rounded-lg p-3 border border-[#93C5FD]">
                    <div className="flex items-center gap-2">
                      <CreditCardIcon className="h-5 w-5 text-[#1E40AF]" />
                      <p className="font-body text-sm text-[#1E40AF]">
                        Payment will be processed securely via Korapay
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowPaymentModal(false);
                        setSelectedOrderForPayment(null);
                      }}
                      className="flex-1 font-body py-3 text-sm font-medium text-[#5B564B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-xl hover:bg-[#DDD5C4] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePaymentComplete}
                      className="flex-1 font-body py-3 text-sm font-medium text-[#F7F1E4] bg-gradient-to-r from-[#16302B] to-[#1D3B34] rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CreditCardIcon className="h-5 w-5" />
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}