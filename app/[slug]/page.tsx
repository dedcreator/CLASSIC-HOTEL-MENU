// menu/app/[slug]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  QrCodeIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { 
  usePublicMenuItems, 
  usePublicCategories, 
  usePublicTables,
  useCreateOrder,
  useOrders,
} from '../../lib/api/hooks/useMenu';
import PaymentModal from '../components/PaymentModal';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  category_name: string;
  is_available: boolean;
  is_popular: boolean;
  is_new: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  is_vegan: boolean;
  preparation_time: number;
  icon_name: string;
  dietary_tags: string[];
}

interface Category {
  id: string;
  name: string;
  icon: string;
  is_active: boolean;
}

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
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  timestamp: string;
  tableNumber: string;
  isLocal?: boolean;
}

// Icon mapping
const iconMap: Record<string, any> = {
  'HomeIcon': HomeIcon,
  'CakeIcon': CakeIcon,
  'BeakerIcon': BeakerIcon,
  'CubeIcon': CubeIcon,
};

const getIconComponent = (iconName: string, className: string = "h-8 w-8") => {
  const Icon = iconMap[iconName];
  if (Icon) {
    return <Icon className={className} />;
  }
  return <CubeIcon className={className} />;
};

// Storage keys
const getStorageKeys = (tableId: string) => ({
  cart: `menu_cart_${tableId}`,
  orders: `menu_orders_${tableId}`,
});

export default function MenuPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

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
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);

  // Fetch data from API
  const { data: categories, isLoading: categoriesLoading } = usePublicCategories();
  const { data: menuItems, isLoading: itemsLoading } = usePublicMenuItems(
    selectedCategory !== 'all' ? { category: selectedCategory } : {}
  );
  const { data: tables, isLoading: tablesLoading } = usePublicTables();

  // Create order mutation
  const createOrder = useCreateOrder();

  // Fetch orders with polling - every 4 seconds
  const { data: serverOrders, refetch: refetchOrders } = useOrders(
    tableInfo?.id ? { table: tableInfo.id } : undefined,
    { refetchInterval: 4000 }
  );

  // Find table by slug
  useEffect(() => {
    if (tables && slug) {
      setIsTableLoading(true);
      const table = tables.find((t: any) => t.slug === slug || t.id === slug);
      if (table) {
        setTableInfo(table);
        const keys = getStorageKeys(table.id);
        const savedCart = localStorage.getItem(keys.cart);
        if (savedCart) {
          try {
            setCart(JSON.parse(savedCart));
          } catch (e) {
            console.error('Failed to parse cart', e);
          }
        }
        const savedOrders = localStorage.getItem(keys.orders);
        if (savedOrders) {
          try {
            setOrders(JSON.parse(savedOrders));
          } catch (e) {
            console.error('Failed to parse orders', e);
          }
        }
      } else {
        router.push('/404');
      }
      setIsTableLoading(false);
    }
  }, [tables, slug, router]);

  // Save data when it changes
  useEffect(() => {
    if (tableInfo && isLoaded) {
      const keys = getStorageKeys(tableInfo.id);
      localStorage.setItem(keys.cart, JSON.stringify(cart));
      localStorage.setItem(keys.orders, JSON.stringify(orders));
    }
  }, [cart, orders, tableInfo, isLoaded]);

  // Load favorites
  useEffect(() => {
    const savedFavorites = localStorage.getItem('menu_favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to parse favorites', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save favorites
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('menu_favorites', JSON.stringify(favorites));
    }
  }, [favorites, isLoaded]);

  // Handle server orders - detect new orders and status changes
  useEffect(() => {
    // Check if serverOrders is an array before processing
    if (!serverOrders || !Array.isArray(serverOrders) || !tableInfo) return;

    const serverOrderMap = new Map();
    serverOrders.forEach((order: any) => {
      serverOrderMap.set(order.id, order);
    });

    // Check for new orders and status changes
    const currentOrderMap = new Map();
    orders.forEach(order => {
      currentOrderMap.set(order.id, order);
    });

    // Check for new orders
    serverOrders.forEach((serverOrder: any) => {
      const localOrder = currentOrderMap.get(serverOrder.id);
      if (!localOrder) {
        // New order
        const newOrder: Order = {
          id: serverOrder.id,
          orderNumber: serverOrder.order_number,
          items: serverOrder.items?.map((item: any) => ({
            id: item.menu_item,
            name: item.item_name,
            price: item.unit_price,
            quantity: item.quantity,
          })) || [],
          total: serverOrder.total_amount || 0,
          status: serverOrder.status || 'pending',
          timestamp: serverOrder.placed_at || new Date().toISOString(),
          tableNumber: tableInfo.table_number,
          isLocal: false,
        };
        setOrders(prev => [newOrder, ...prev]);
        toast.success(`New order ${serverOrder.order_number} placed!`);
      } else if (localOrder.status !== serverOrder.status) {
        // Status changed
        setOrders(prev => prev.map(order => 
          order.id === serverOrder.id 
            ? { ...order, status: serverOrder.status }
            : order
        ));
        
        // Show status update toast
        const statusMessages: Record<string, string> = {
          'preparing': `Order ${serverOrder.order_number} is being prepared`,
          'ready': `Order ${serverOrder.order_number} is ready!`,
          'served': `Order ${serverOrder.order_number} has been served`,
          'paid': `Order ${serverOrder.order_number} has been paid`,
        };
        if (statusMessages[serverOrder.status]) {
          toast.success(statusMessages[serverOrder.status]);
        }
      }
    });

    // Check for removed orders (paid/cancelled)
    orders.forEach(localOrder => {
      if (!serverOrderMap.has(localOrder.id) && !localOrder.isLocal) {
        setOrders(prev => prev.filter(order => order.id !== localOrder.id));
      }
    });

  }, [serverOrders, tableInfo, orders]);

  const filteredItems = menuItems?.filter((item: MenuItem) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && item.is_available;
  }) || [];

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const activeOrders = orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled');

  // ============ CART FUNCTIONS ============

  const addToCart = (item: MenuItem) => {
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

  // ============ PLACE ORDER ============

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!tableInfo) {
      toast.error('Table information not found');
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderData = {
        table: tableInfo.id,
        customer_name: `Table ${tableInfo.table_number}`,
        items: cart.map(item => ({
          menu_item_id: String(item.id),
          quantity: Number(item.quantity),
        })),
        notes: `Order from Table ${tableInfo.table_number}`,
      };

      const result = await createOrder.mutateAsync(orderData);
      
      const newOrderNumber = result.order_number || `ORD-${Date.now().toString().slice(-6)}`;
      setOrderNumber(newOrderNumber);
      
      // Add to local orders immediately
      const newOrder: Order = {
        id: result.id || `local-${Date.now()}`,
        orderNumber: newOrderNumber,
        items: [...cart],
        total: cartTotal,
        status: 'pending',
        timestamp: new Date().toISOString(),
        tableNumber: tableInfo.table_number,
        isLocal: false,
      };
      
      setOrders(prev => [newOrder, ...prev]);
      setShowOrderSuccess(true);
      setIsPlacingOrder(false);
      setCart([]);
      
      // Refetch orders to sync with server
      setTimeout(() => {
        refetchOrders();
      }, 1000);
      
      toast.success(`Order ${newOrderNumber} placed!`);
    } catch (error: any) {
      console.error('Order placement failed:', error);
      
      // Create a local order as fallback
      const newOrderNumber = `ORD-${Date.now().toString().slice(-6)}`;
      setOrderNumber(newOrderNumber);
      
      const newOrder: Order = {
        id: `local-${Date.now()}`,
        orderNumber: newOrderNumber,
        items: [...cart],
        total: cartTotal,
        status: 'pending',
        timestamp: new Date().toISOString(),
        tableNumber: tableInfo.table_number,
        isLocal: true,
      };
      
      setOrders(prev => [newOrder, ...prev]);
      setShowOrderSuccess(true);
      setCart([]);
      
      toast(`Order ${newOrderNumber} placed locally.`, {
        icon: '⚠️',
        style: {
          background: '#FFF3E0',
          color: '#E65100',
        }
      });
      
      setIsPlacingOrder(false);
    }
  };

  // ============ ORDER FUNCTIONS ============

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
      cancelled: { label: 'Cancelled', color: 'bg-[#FCE4EC] text-[#C62828]', icon: <XMarkIcon className="h-4 w-4" /> },
    };
    return statusMap[status] || statusMap.pending;
  };

  // ============ LOADING STATE ============

  if (tablesLoading || isTableLoading || itemsLoading || categoriesLoading || !isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#16302B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-body text-[#8A8377]">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!tableInfo) {
    return null;
  }

  // ============ RENDER ============

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-[#DDD5C4] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#16302B] to-[#1D3B34] rounded-xl flex items-center justify-center shadow-lg">
                  <QrCodeIcon className="h-6 w-6 text-[#F7F1E4]" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-medium text-[#2A2622] tracking-tight">
                    Classic Hotel Menu
                  </h1>
                  <p className="font-body text-xs text-[#8A8377] flex items-center gap-1">
                    <MapPinIcon className="h-3 w-3" />
                    Table {tableInfo.table_number} • {tableInfo.name}
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
                {activeOrders.filter(o => o.status !== 'paid' && o.status !== 'cancelled').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C62828] text-[#F7F1E4] text-xs w-5 h-5 rounded-full flex items-center justify-center font-body font-medium shadow-lg">
                    {activeOrders.filter(o => o.status !== 'paid' && o.status !== 'cancelled').length}
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
            <span className="font-body">Table {tableInfo.table_number}</span>
            <span className="w-px h-4 bg-[#B9C4B9]/30" />
            <span className="font-body text-[#B9C4B9]">{tableInfo.name}</span>
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
          
          {activeOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-[#DDD5C4]">
              <QueueListIcon className="h-16 w-16 mx-auto text-[#DDD5C4] mb-4" />
              <p className="font-body text-[#8A8377]">No active orders</p>
              <button
                onClick={() => setActiveTab('menu')}
                className="font-body mt-4 px-6 py-2 bg-[#16302B] text-[#F7F1E4] rounded-xl hover:bg-[#1D3B34] transition-colors"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => {
                const status = getOrderStatusDisplay(order.status);
                const canPay = order.status === 'served' || order.status === 'ready';
                
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
                          {order.isLocal && (
                            <span className="font-body text-xs text-[#C9A468]">(Local order)</span>
                          )}
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
        <div>
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
                  <button
                    key="all"
                    onClick={() => setSelectedCategory('all')}
                    className={`
                      font-body px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                      flex items-center gap-2
                      ${selectedCategory === 'all'
                        ? 'bg-gradient-to-r from-[#16302B] to-[#1D3B34] text-[#F7F1E4] shadow-md scale-105'
                        : 'bg-white/80 backdrop-blur-sm text-[#5B564B] hover:bg-[#F7F1E4] border border-[#DDD5C4] hover:border-[#C9A468]'
                      }
                    `}
                  >
                    <HomeIcon className="h-4 w-4" />
                    All
                  </button>
                  {categories?.map((category: Category) => (
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
                      <span className="text-base">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 py-8 pb-32">
            {filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <HomeIcon className="h-16 w-16 mx-auto text-[#DDD5C4] mb-4" />
                <p className="font-display text-xl text-[#2A2622]">No items found</p>
                <p className="font-body text-[#8A8377] mt-2">Try adjusting your search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item: MenuItem, index: number) => (
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
                        {item.icon_name ? getIconComponent(item.icon_name, "h-8 w-8") : <CubeIcon className="h-8 w-8" />}
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
                          {item.dietary_tags && item.dietary_tags.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {item.dietary_tags.map((diet: string) => (
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
        </div>
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
      {showPaymentModal && selectedOrderForPayment && (
        <PaymentModal
          orderId={selectedOrderForPayment.id}
          total={selectedOrderForPayment.total}
          orderNumber={selectedOrderForPayment.orderNumber}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedOrderForPayment(null);
          }}
          onComplete={handlePaymentComplete}
        />
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
    </div>
  );
}