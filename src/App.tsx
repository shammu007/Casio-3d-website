import { useEffect, useRef, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, User, ShoppingBag, X, Menu, Search, Globe, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const frameCount = 240;
const currentFrame = (index: number) =>
  `./watchhh/fast-forest-22-jun${index.toString().padStart(3, '0')}.jpg`;

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const watchState = useRef({ frame: 0 });

  // GSAP Refs
  const titleRef = useRef<HTMLHeadingElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const sectionCounterRef = useRef<HTMLDivElement>(null);

  // Drag-to-Inspect Refs
  const lenisRef = useRef<Lenis | null>(null);
  const startXRef = useRef<number>(0);
  const startFrameRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  // Navbar Visibility States
  const [navbarVisible, setNavbarVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Cart State
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [extendWarranty, setExtendWarranty] = useState(false);
  const [cart, setCart] = useState<{
    id: string;
    serial: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    strap: string;
    clasp: string;
    strapSize: string;
    limitedBadge: string;
  }[]>([]);

  const addToCart = (product: { 
    id: string; 
    name: string; 
    price: number; 
    imageIndex?: number;
    imagePath?: string;
    serial?: string;
    strap?: string;
    clasp?: string;
    limitedBadge?: string;
  }) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prevCart,
        {
          id: product.id,
          serial: product.serial || 'CH-7543.1S-BLSI',
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.imagePath || `./watchhh/fast-forest-22-jun${(product.imageIndex || 120).toString().padStart(3, '0')}.jpg`,
          strap: product.strap || 'LOUISIANA ALLIGATOR LEATHER',
          clasp: product.clasp || 'FOLDING CLASP',
          strapSize: 'M 17 - 20 CM',
          limitedBadge: product.limitedBadge || ''
        }
      ];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateStrapSize = (id: string, size: string) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id ? { ...item, strapSize: size } : item
      )
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const vatRate = 0.19;
  const vatAmount = subtotal * (vatRate / (1 + vatRate)); // VAT is already included in prices (28400 has 19% VAT = 4534.45)
  const exclVat = subtotal - vatAmount;
  const isRupee = cart.some(item => item.serial.startsWith('MTG') || item.serial.startsWith('EQB') || item.serial.startsWith('ERA') || item.serial.startsWith('MQ') || item.serial.startsWith('A') || item.serial.startsWith('AQ'));

  const renderNavbar = (isInCart: boolean) => {
    const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
    return (
      <motion.nav 
        initial={isInCart ? undefined : { y: -100 }}
        animate={isInCart ? { y: 0 } : { y: navbarVisible ? 0 : -100 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full px-12 py-6 flex items-center justify-between pointer-events-auto z-50 bg-transparent"
      >
        {/* Left: Logo & Menu */}
        <div className="flex items-center gap-6">
          <h1 
            onClick={() => {
              setCartOpen(false);
              setMenuOpen(false);
              if (lenisRef.current) {
                lenisRef.current.scrollTo(0, { immediate: false });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="text-2xl font-bold tracking-[0.15em] text-white cursor-pointer select-none"
          >
            CASIO
          </h1>
          <button 
            className="p-2 hover:bg-white/5 rounded-full transition-colors flex items-center justify-center pointer-events-auto"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="w-5 h-5 text-gray-300 hover:text-white transition-colors cursor-pointer" />
          </button>
        </div>
        
        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-10 text-[10px] font-bold tracking-[0.25em] text-gray-400 pointer-events-auto">
          <button 
            onClick={() => {
              const el = document.getElementById('edifice-collection');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors uppercase cursor-pointer bg-transparent border-none p-0 font-bold tracking-[0.25em]"
          >
            Watches
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('warranty-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors uppercase cursor-pointer bg-transparent border-none p-0 font-bold tracking-[0.25em]"
          >
            Warranty & Service
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('stores-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors uppercase cursor-pointer bg-transparent border-none p-0 font-bold tracking-[0.25em]"
          >
            Stores
          </button>
        </div>

        {/* Right: Lang pills & Icons */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-2">
            <div className="bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 rounded-full px-3.5 py-1.5 text-[10px] text-white tracking-widest flex items-center gap-1.5 cursor-pointer transition-colors">
              <span>EUR</span> <span className="text-[7px] text-gray-400">▼</span>
            </div>
            <div className="bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 rounded-full px-3.5 py-1.5 text-[10px] text-white tracking-widest flex items-center gap-1.5 cursor-pointer transition-colors">
              <span>ENG</span> <span className="text-[7px] text-gray-400">▼</span>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            {/* Wishlist */}
            <div className="hidden md:flex relative cursor-pointer flex-col items-center group pointer-events-auto">
              <Heart className="w-[18px] h-[18px] text-gray-300 group-hover:text-white transition-colors" />
              <span className="text-[8px] text-gray-400 mt-1 font-semibold border border-white/10 rounded-full w-3.5 h-3.5 flex items-center justify-center bg-white/[0.04]">3</span>
            </div>

            {/* Profile */}
            <div className="hidden md:flex w-7 h-7 rounded-full border border-white/20 items-center justify-center hover:bg-white/5 transition-colors cursor-pointer pointer-events-auto">
              <User className="w-[14px] h-[14px] text-gray-300 hover:text-white" />
            </div>

            {/* Shopping Cart */}
            <div 
              onClick={() => setCartOpen(true)}
              className="relative cursor-pointer flex flex-col items-center group pointer-events-auto"
            >
              <ShoppingBag className="w-[18px] h-[18px] text-gray-300 group-hover:text-white transition-colors" />
              <span className="text-[8px] text-[#00b2e3] mt-1 font-bold border border-white/10 rounded-full w-3.5 h-3.5 flex items-center justify-center bg-white/[0.04]">{totalQty}</span>
            </div>
          </div>
        </div>
      </motion.nav>
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) {
        setNavbarVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setNavbarVisible(false);
      } else {
        setNavbarVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Setup Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Preload images
    let loadedCount = 0;
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        setLoaded(Math.round((loadedCount / frameCount) * 100));
        if (loadedCount === frameCount) {
          resizeCanvas();
        }
      };
      img.src = currentFrame(i);
      imagesRef.current.push(img);
    }

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const images = imagesRef.current;
      if (canvas && images[0] && images[0].complete) {
        const ctx = canvas.getContext('2d');
        canvas.width = images[0].naturalWidth;
        canvas.height = images[0].naturalHeight;
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(images[0], 0, 0, canvas.width, canvas.height);
        }
      }
    };

    window.addEventListener('resize', resizeCanvas);

    // Scroll mapping
    lenis.on('scroll', (e: any) => {
      if (isDraggingRef.current) return;
      const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = maxScrollTop > 0 ? e.scroll / maxScrollTop : 0;
      
      const sequenceProgress = Math.min(scrollFraction / 0.75, 1);
      const targetFrame = Math.min(frameCount - 1, Math.max(0, sequenceProgress * (frameCount - 1)));
      
      watchState.current.frame = targetFrame;
      renderCanvas();

      // Update Scroll Progress manually without triggering re-render
      if (progressFillRef.current) {
        progressFillRef.current.style.width = `${scrollFraction * 100}%`;
      }
      if (sectionCounterRef.current) {
        const section = scrollFraction > 0.75 ? 2 : 1;
        sectionCounterRef.current.innerText = `${String(section).padStart(2, '0')} / 02`;
      }
    });

    const renderCanvas = () => {
      const canvas = canvasRef.current;
      const images = imagesRef.current;
      if (canvas && images.length > 0) {
        const ctx = canvas.getContext('2d');
        const activeImage = images[Math.floor(watchState.current.frame)];
        if (activeImage && activeImage.complete && ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(activeImage, 0, 0, canvas.width, canvas.height);
        }
      }
    };

    return () => {
      lenis.destroy();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Drag-to-Inspect Event Listeners
  useEffect(() => {
    if (loaded < 100) return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.clientX < window.innerWidth * 0.4 || scrollYProgress.get() > 0.75) return;
      
      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      startFrameRef.current = watchState.current.frame;

      if (lenisRef.current) {
        lenisRef.current.stop();
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      
      const deltaX = e.clientX - startXRef.current;
      const sensitivity = frameCount / (window.innerWidth * 0.8);
      let targetFrame = startFrameRef.current - (deltaX * sensitivity);
      
      targetFrame = Math.max(0, Math.min(frameCount - 1, targetFrame));
      watchState.current.frame = targetFrame;
      
      const canvas = canvasRef.current;
      const images = imagesRef.current;
      if (canvas && images.length > 0) {
        const ctx = canvas.getContext('2d');
        const activeImage = images[Math.floor(targetFrame)];
        if (activeImage && activeImage.complete && ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(activeImage, 0, 0, canvas.width, canvas.height);
        }
      }
    };

    const onMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      
      if (lenisRef.current) {
        lenisRef.current.start();
        const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
        const scrollFraction = (watchState.current.frame / (frameCount - 1)) * 0.75;
        lenisRef.current.scrollTo(scrollFraction * maxScrollTop, { immediate: true });
      }
    };

    // Mobile touch events
    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch && touch.clientX >= window.innerWidth * 0.4 && scrollYProgress.get() <= 0.75) {
        isDraggingRef.current = true;
        startXRef.current = touch.clientX;
        startFrameRef.current = watchState.current.frame;
        if (lenisRef.current) {
          lenisRef.current.stop();
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      
      const deltaX = touch.clientX - startXRef.current;
      const sensitivity = frameCount / (window.innerWidth * 0.8);
      let targetFrame = startFrameRef.current - (deltaX * sensitivity);
      
      targetFrame = Math.max(0, Math.min(frameCount - 1, targetFrame));
      watchState.current.frame = targetFrame;
      
      const canvas = canvasRef.current;
      const images = imagesRef.current;
      if (canvas && images.length > 0) {
        const ctx = canvas.getContext('2d');
        const activeImage = images[Math.floor(targetFrame)];
        if (activeImage && activeImage.complete && ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(activeImage, 0, 0, canvas.width, canvas.height);
        }
      }
    };

    const onTouchEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      if (lenisRef.current) {
        lenisRef.current.start();
        const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
        const scrollFraction = (watchState.current.frame / (frameCount - 1)) * 0.75;
        lenisRef.current.scrollTo(scrollFraction * maxScrollTop, { immediate: true });
      }
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [loaded]);

  // GSAP Entrance Animations
  useEffect(() => {
    if (loaded < 100) return;
    
    gsap.set([titleRef.current, scrollProgressRef.current], {
      visibility: 'visible'
    });

    const tl = gsap.timeline();

    if (titleRef.current) {
      const titleChars = titleRef.current.querySelectorAll('.title-char');
      tl.from(titleChars, {
        y: 100,
        opacity: 0,
        duration: 1.5,
        stagger: 0.05,
        ease: "power4.out"
      }, "-=0.5");
    }

    if (scrollProgressRef.current) {
      tl.from(scrollProgressRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power2.out"
      }, "-=0.5");
    }

    return () => {
      tl.kill();
    };
  }, [loaded]);

  const { scrollYProgress } = useScroll();
  
  // Theme and visibility transforms based on scroll
  const bgColor = useTransform(scrollYProgress, [0.80, 0.86], ["#050b14", "#0a0a0c"]);
  const textColor = useTransform(scrollYProgress, [0.80, 0.86], ["#ffffff", "#ffffff"]);
  const canvasOpacity = useTransform(scrollYProgress, [0.80, 0.86], [0.9, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0.80, 0.83], [1, 0]);
  const sideUIOpacity = useTransform(scrollYProgress, [0.80, 0.83], [1, 0]);

  // Fade out main hero content slightly as scroll goes down
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -50]);

  // Framer Motion transforms for the 3 glass cards
  const opacity1 = useTransform(scrollYProgress, [0.15, 0.22, 0.32, 0.39], [0, 1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0.15, 0.22, 0.32, 0.39], [30, 0, 0, -30]);

  const opacity2 = useTransform(scrollYProgress, [0.42, 0.49, 0.59, 0.66], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.42, 0.49, 0.59, 0.66], [30, 0, 0, -30]);

  const opacity3 = useTransform(scrollYProgress, [0.69, 0.73, 0.77, 0.80], [0, 1, 1, 0]);
  const y3 = useTransform(scrollYProgress, [0.69, 0.73, 0.77, 0.80], [30, 0, 0, -30]);

  const splitTitle = (text: string) => {
    return text.split('').map((char, i) => (
      <span key={i} className="title-char">
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <motion.div 
      style={{ backgroundColor: bgColor, color: textColor }}
      className="relative w-full bg-[#050b14] min-h-[850vh] transition-colors duration-500 overflow-x-hidden"
    >
      {/* Standalone Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-40">
        {renderNavbar(false)}
      </div>

      {/* Loader */}
      {loaded < 100 && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050b14]">
          <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
          <p className="mt-4 text-sm tracking-widest text-gray-400 uppercase">Loading Experience: {loaded}%</p>
        </div>
      )}

      {/* Canvas Background */}
      <motion.div 
        style={{ opacity: canvasOpacity }}
        className="fixed inset-0 w-full h-screen flex items-center justify-center overflow-hidden pointer-events-none"
      >
        <canvas 
          ref={canvasRef} 
          className="w-full h-full object-cover max-w-full max-h-full cursor-grab active:cursor-grabbing pointer-events-auto" 
        />
      </motion.div>



      {/* Scroll Progress */}
      <motion.div 
        style={{ opacity: sideUIOpacity, visibility: 'hidden' }}
        ref={scrollProgressRef} 
        className="scroll-progress" 
      >
        <div className="scroll-text">SCROLL</div>
        <div className="progress-track">
          <div ref={progressFillRef} className="progress-fill" style={{ width: '0%' }} />
        </div>
        <div ref={sectionCounterRef} className="section-counter">
          01 / 02
        </div>
      </motion.div>

      {/* Shopping Cart Full-Screen Overlay */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="fixed inset-0 bg-[#070b12] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0b1b33] via-[#070b12] to-[#030509] z-50 overflow-y-auto pointer-events-auto flex flex-col"
          >
            {/* Header inside overlay */}
            <div className="w-full">
              {renderNavbar(true)}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-8 flex flex-col justify-between">
              
              {/* Heading and back button */}
              <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-4xl md:text-5xl font-light tracking-[0.2em] text-white">SHOPPING CART</h2>
                <button 
                  onClick={() => setCartOpen(false)}
                  className="self-start md:self-auto px-6 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-full text-[10px] tracking-widest text-white/90 uppercase transition-all"
                >
                  ← BACK TO STORE
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-16">
                  <ShoppingBag className="w-16 h-16 mb-4 stroke-1" />
                  <p className="text-sm font-light uppercase tracking-widest">Your shopping cart is empty.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                  
                  {/* Left: Cart Items List */}
                  <div className="lg:col-span-8 flex flex-col md:flex-row gap-6 overflow-x-auto pb-6">
                    {cart.map(item => (
                      <div 
                        key={item.id} 
                        className="w-full md:w-[350px] bg-gradient-to-b from-[#0a1220]/70 to-[#05090f]/95 border border-white/[0.06] rounded-[2.2rem] p-7 relative flex flex-col justify-between shrink-0 shadow-xl"
                      >
                        {/* Remove button */}
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="absolute top-6 right-6 text-white/40 hover:text-white cursor-pointer transition-colors w-7 h-7 flex items-center justify-center border border-white/10 rounded-full hover:bg-white/5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <div>
                          {/* Limited piece indicator */}
                          {item.limitedBadge ? (
                            <span className="text-[9px] tracking-[0.22em] text-[#ff5a36] font-bold uppercase mb-4 block">
                              {item.limitedBadge}
                            </span>
                          ) : (
                            <span className="text-[9px] tracking-[0.22em] text-transparent uppercase mb-4 block select-none">
                              PLACEHOLDER
                            </span>
                          )}

                          {/* Watch render representation */}
                          <div className="w-full h-48 flex items-center justify-center my-4 relative group">
                            <div className="absolute inset-0 bg-[#00b2e3]/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="h-full object-contain scale-110 group-hover:scale-120 transition-all duration-700" 
                            />
                          </div>

                          {/* Watch Code Details */}
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1 font-mono">
                            {item.serial}
                          </span>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-6">
                            {item.name}
                          </h3>

                          {/* Specs Columns */}
                          <div className="grid grid-cols-2 gap-4 border-t border-white/[0.04] pt-4">
                            <div>
                              <span className="text-[8px] uppercase tracking-widest text-gray-500 block">STRAP</span>
                              <span className="text-[9px] font-bold text-white uppercase leading-tight mt-1.5 block">
                                {item.strap}
                              </span>
                            </div>
                            <div>
                              <span className="text-[8px] uppercase tracking-widest text-gray-500 block">CLASP/BUCKLE</span>
                              <span className="text-[9px] font-bold text-white uppercase leading-tight mt-1.5 block">
                                {item.clasp}
                              </span>
                            </div>
                          </div>

                          {/* Strap size custom dropdown */}
                          <div className="mt-5 relative">
                            <span className="text-[8px] uppercase tracking-widest text-gray-500 block mb-1">STRAP SIZE</span>
                            <div 
                              onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                              className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-white/90 cursor-pointer hover:bg-white/[0.08] transition-colors w-full"
                            >
                              <span>{item.strapSize}</span>
                              <span className="text-[8px] text-gray-400">▼</span>
                            </div>

                            {activeDropdown === item.id && (
                              <div className="absolute z-30 left-0 right-0 mt-1.5 bg-[#0a1220] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                                {['L 19.5 - 23.0 CM', 'M 17 - 20 CM', 'S 15.0 - 17.5 CM'].map(size => (
                                  <div 
                                    key={size}
                                    onClick={() => {
                                      updateStrapSize(item.id, size);
                                      setActiveDropdown(null);
                                    }}
                                    className="px-4 py-2.5 text-xs text-white/80 hover:bg-[#00b2e3] hover:text-black cursor-pointer transition-colors"
                                  >
                                    {size}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Price */}
                        <div className="mt-6 border-t border-white/[0.04] pt-4">
                          <span className="text-sm font-bold text-[#00b2e3] tracking-wider">
                            {item.serial.startsWith('MTG') || item.serial.startsWith('EQB') || item.serial.startsWith('ERA') || item.serial.startsWith('MQ') || item.serial.startsWith('A') || item.serial.startsWith('AQ')
                              ? `₹ ${item.price.toLocaleString('en-IN')}`
                              : `${item.price.toLocaleString('de-DE')},00 €`}
                          </span>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Right: Warranty, Invoice & Checkout */}
                  <div className="lg:col-span-4 flex flex-col justify-between self-stretch pt-4">
                    <div>
                      {/* Extend warranty button */}
                      <div 
                        onClick={() => setExtendWarranty(!extendWarranty)}
                        className="flex items-center justify-between text-xs tracking-widest text-white/60 hover:text-white cursor-pointer mb-10 border-b border-white/[0.05] pb-5 group"
                      >
                        <div className="flex items-center gap-3">
                          <svg 
                            className={`w-4 h-4 text-gray-400 group-hover:text-white transition-all duration-300 ${extendWarranty ? 'rotate-90 text-[#00b2e3]' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          <span className="text-[10px] tracking-[0.2em]">EXTEND WARRANTY</span>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${extendWarranty ? 'border-[#00b2e3] bg-[#00b2e3]' : 'border-white/20'}`}>
                          {extendWarranty && (
                            <svg className="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Pricing list */}
                      <div className="space-y-4 text-xs font-light tracking-widest text-gray-400">
                        <div className="flex justify-between">
                          <span>VAT (19%)</span>
                          <span className="text-white/80">
                            {isRupee 
                              ? `₹ ${vatAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : `${vatAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>TOTAL EXCL. VAT</span>
                          <span className="text-white/80">
                            {isRupee 
                              ? `₹ ${exclVat.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : `${exclVat.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-white/[0.05] pt-5 text-white font-bold">
                          <span className="text-[10px] uppercase tracking-[0.25em] font-light text-gray-300">TOTAL INCL. VAT</span>
                          <span className="text-2xl font-bold tracking-tight text-white">
                            {isRupee 
                              ? `₹ ${subtotal.toLocaleString('en-IN')}`
                              : `${subtotal.toLocaleString('de-DE')},00 €`}
                          </span>
                        </div>
                      </div>

                      {/* Checkout actions */}
                      <button className="w-full py-4 bg-[#00b2e3] hover:bg-[#0092c3] text-white rounded-full font-bold tracking-[0.25em] text-[10px] uppercase transition-all shadow-lg mt-8 text-center cursor-pointer">
                        CHECKOUT
                      </button>
                    </div>

                    {/* Direct Contact profiles */}
                    <div className="flex items-center justify-between border-t border-white/[0.04] pt-6 mt-12">
                      <div className="flex items-center gap-3">
                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        <span className="text-[9px] uppercase tracking-[0.25em] text-gray-500 font-bold">DIRECT CONTACT</span>
                      </div>
                      <div className="flex -space-x-2">
                        <img className="w-7 h-7 rounded-full border border-black object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&fit=crop&crop=faces&q=80" alt="Contact 1" />
                        <img className="w-7 h-7 rounded-full border border-black object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&crop=faces&q=80" alt="Contact 2" />
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* Footer info */}
              <div className="flex items-center justify-between border-t border-white/[0.04] pt-8 mt-12 text-[9px] tracking-widest text-gray-500 font-light">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#00b2e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                  <span>3-YEAR INTERNATIONAL WARRANTY</span>
                </div>
                
                {/* Scroll track indicators */}
                <div className="w-12 h-1.5 bg-white/10 rounded-full flex items-center justify-start p-0.5">
                  <div className="w-4 h-full bg-[#00b2e3] rounded-full" />
                </div>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Menu Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="fixed inset-y-0 left-0 w-full md:w-[480px] bg-[#070b12]/95 backdrop-blur-2xl border-r border-white/5 z-50 p-8 flex flex-col justify-between pointer-events-auto"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <h2 className="text-xl font-bold tracking-[0.2em] text-white">NAVIGATION</h2>
              <button 
                onClick={() => setMenuOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="my-8 relative">
              <input 
                type="text" 
                placeholder="Search watch models..." 
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00b2e3]/40 transition-colors"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            {/* Quick Links / Navigation Categories */}
            <div className="flex-1 flex flex-col gap-6">
              <span className="text-[10px] tracking-widest text-[#00b2e3] font-bold uppercase">COLLECTIONS</span>
              
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    setMenuOpen(false);
                    document.getElementById('edifice-collection')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group flex items-center justify-between py-3 text-left border-b border-white/[0.03] hover:border-[#00b2e3]/20 transition-all cursor-pointer bg-transparent text-white"
                >
                  <span className="text-base font-medium tracking-wide text-gray-300 group-hover:text-white transition-colors">EDIFICE SERIES</span>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                </button>
                
                <button 
                  onClick={() => {
                    setMenuOpen(false);
                    document.getElementById('casio-vintage-collection')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group flex items-center justify-between py-3 text-left border-b border-white/[0.03] hover:border-[#00b2e3]/20 transition-all cursor-pointer bg-transparent text-white"
                >
                  <span className="text-base font-medium tracking-wide text-gray-300 group-hover:text-white transition-colors">CASIO VINTAGE</span>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                </button>

                <button 
                  onClick={() => {
                    setMenuOpen(false);
                    document.getElementById('warranty-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group flex items-center justify-between py-3 text-left border-b border-white/[0.03] hover:border-[#00b2e3]/20 transition-all cursor-pointer bg-transparent text-white"
                >
                  <span className="text-base font-medium tracking-wide text-gray-300 group-hover:text-white transition-colors">WARRANTY & CALIBRATIONS</span>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                </button>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <span className="text-[10px] tracking-widest text-gray-500 font-bold uppercase">COMPANY</span>
                <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">Our Story & Heritage</a>
                <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">Sustainability Commitments</a>
                <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">Career Opportunities</a>
              </div>
            </div>

            {/* Footer inside Drawer */}
            <div className="border-t border-white/5 pt-6 mt-8 flex items-center justify-between text-[10px] text-gray-500 tracking-wider">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-gray-600" />
                <span>GLOBAL SITE</span>
              </div>
              <span>v1.0.0</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Overlay */}
      <motion.div 
        style={{ opacity: overlayOpacity }}
        className="fixed inset-0 pointer-events-none z-10 flex flex-col"
      >

        {/* Floating Cards (left absolute layout) */}
        <div className="absolute left-4 sm:left-12 md:left-32 top-1/2 -translate-y-1/2 w-[220px] sm:w-[280px] md:w-[420px] h-[210px] pointer-events-none">
          {/* Card 1 */}
          <motion.div 
            style={{ opacity: opacity1, y: y1 }}
            className="pointer-events-auto absolute top-0 left-0 w-full h-full flex flex-col justify-center"
          >
            <span className="text-[9px] md:text-[11px] tracking-[0.2em] text-[#00b2e3] font-bold uppercase block mb-1">01 / ARCHITECTURE</span>
            <h3 className="text-sm sm:text-lg md:text-xl font-bold tracking-wider mb-1 md:mb-2">PRECISION BEZEL</h3>
            <p className="text-[11px] sm:text-[13px] md:text-sm text-gray-400 leading-relaxed font-light">
              Crafted from aerospace-grade alloy, the modular bezel separates to reveal a double-curved sapphire crystal with anti-reflective coating.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            style={{ opacity: opacity2, y: y2 }}
            className="pointer-events-auto absolute top-[80px] md:top-[100px] left-0 w-full h-full flex flex-col justify-center"
          >
            <span className="text-[9px] md:text-[11px] tracking-[0.2em] text-[#00b2e3] font-bold uppercase block mb-1">02 / INTERIOR</span>
            <h3 className="text-sm sm:text-lg md:text-xl font-bold tracking-wider mb-1 md:mb-2">DIMENSIONAL DIAL</h3>
            <p className="text-[11px] sm:text-[13px] md:text-sm text-gray-400 leading-relaxed font-light">
              A complex multi-layered face layout featuring hand-applied dimensional indices and luminous indicators reflecting light from every angle.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            style={{ opacity: opacity3, y: y3 }}
            className="pointer-events-auto absolute top-[80px] md:top-[100px] left-0 w-full h-full flex flex-col justify-center"
          >
            <span className="text-[9px] md:text-[11px] tracking-[0.2em] text-[#00b2e3] font-bold uppercase block mb-1">03 / CORE</span>
            <h3 className="text-sm sm:text-lg md:text-xl font-bold tracking-wider mb-1 md:mb-2">TITANIUM CORE</h3>
            <p className="text-[11px] sm:text-[13px] md:text-sm text-gray-400 leading-relaxed font-light">
              Housed in a super-lightweight titanium case, treated with diamond-like carbon coating for unyielding strength and absolute comfort.
            </p>
          </motion.div>
        </div>

        {/* Hero Content */}
        <motion.div 
          style={{ opacity: heroOpacity, y: heroY }}
          className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-24 pointer-events-auto"
        >
          <div className="flex justify-between items-start w-full max-w-7xl mx-auto pl-0 sm:pl-8">
            {/* Left Content */}
            <div className="max-w-xl overflow-hidden">
               <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="bg-white/10 backdrop-blur-md rounded-full px-4 py-1 inline-block mb-4 border border-white/10 text-xs tracking-wider text-brand"
              >
                SOLID <span className="text-white font-bold">STAINLESS STEEL</span>
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-gray-400 text-xs md:text-sm tracking-widest mb-2"
              >
                EQB-1300D-2A
              </motion.p>
              
              <h2 
                ref={titleRef}
                style={{ visibility: 'hidden' }}
                className="text-xl sm:text-3xl md:text-6xl font-light leading-tight mb-5 overflow-hidden"
              >
                <div>{splitTitle('CASIO EDIFICE')}</div>
                <div>{splitTitle('SUPER SLIM')}</div>
                <div>{splitTitle('CHRONOGRAPH')}</div>
                <div>{splitTitle('EQB-1300 SERIES')}</div>
              </h2>

              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
                onClick={() => {
                  const section = document.getElementById('edifice-collection');
                  if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="glow-btn bg-[#00b2e3] text-white px-8 py-3 text-xs md:text-sm font-semibold tracking-wider hover:bg-[#0092c3] hover:scale-105 active:scale-95 transition-all duration-300 pointer-events-auto"
              >
                SHOP NOW
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Spacer to allow scrolling through the 3D watch sequence */}
      <div className="h-[650vh]" />

      {/* ---------------- NEW SECTIONS (DARK THEME SPECIFICALLY STYLED) ---------------- */}
      <div className="relative w-full z-30 flex flex-col items-center bg-[#070709] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900/40 via-neutral-950 to-black pt-16">
        
        {/* Watch Collection Grid Row layout */}
        <section id="edifice-collection" className="w-full max-w-7xl px-8 py-16 md:py-24">
          
          {/* Top Filter and Controls Bar */}
          <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8 mb-16">
            {/* Left: Indicator, Special Features */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#c68a4c] flex items-center justify-center text-black text-xs font-bold border border-white/20">
                  <span className="w-2.5 h-2.5 rounded-full bg-black/40"></span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 text-xs border border-white/5"></div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 text-xs border border-white/5"></div>
              </div>
              <div className="flex items-center gap-2 text-xs tracking-widest text-white/60 cursor-pointer hover:text-white transition-colors">
                <span>SPECIAL FEATURES</span>
                <span className="text-[8px]">▼</span>
              </div>
            </div>

            {/* Center: Sizes */}
            <div className="flex flex-wrap items-center gap-2">
              {['34', '37', '40', '41', '42', '43', '44+', '45'].map((size) => (
                <button key={size} className="w-8 h-8 rounded-full border border-dashed border-white/20 text-[10px] text-white/60 hover:border-white hover:text-white transition-colors">
                  {size}
                </button>
              ))}
            </div>

            {/* Right: Colors and Search */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                {['#c68a4c', '#9ca3af', '#3b82f6', '#111827', '#5c4d3c'].map((color, index) => (
                  <div key={index} style={{ backgroundColor: color }} className="w-4 h-4 rounded-full border border-white/20 cursor-pointer hover:scale-110 transition-transform"></div>
                ))}
              </div>
              <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/80 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
            </div>
          </div>

          {/* SPACE TIMER CATEGORY ROW */}
          <div className="mb-24">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-light uppercase tracking-[0.2em]">EDIFICE</h2>
              <div className="hidden md:flex items-center gap-1.5 text-[8px] text-white/30 tracking-[0.3em]">
                <span className="text-[#00b2e3] font-bold">01</span> | <span>02</span> | <span>03</span> | <span>04</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: MTG-B4000BD-1A */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-[#0e0e10] border border-white/5 rounded-[2.5rem] p-8 flex flex-col hover:border-white/10 hover:shadow-xl transition-all"
              >
                <div className="bg-white/[0.02] rounded-3xl h-60 overflow-hidden mb-6 flex items-center justify-center border border-white/5 relative">
                  <span className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 text-[9px] tracking-wider text-white">NEW 06/2026</span>
                  <img src="./watchhh/mtg_b4000bd_1a.png" alt="MTG-B4000BD-1A" className="w-full h-full object-contain scale-110 hover:scale-120 transition-all duration-500" />
                </div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1 font-mono">MTG-B4000BD-1A</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">MT-G MTG-B4000 Series</h3>
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#00b2e3]">₹ 1,10,000</span>
                    <span className="text-[8px] text-gray-500 font-light">incl. of all taxes</span>
                  </div>
                  <button 
                    onClick={() => addToCart({ id: 'mtg-b4000bd-1a', name: 'MT-G MTG-B4000 Series', price: 110000, imagePath: './watchhh/mtg_b4000bd_1a.png', serial: 'MTG-B4000BD-1A', limitedBadge: 'NEW 06/2026' })}
                    className="px-5 py-2 bg-[#00b2e3] text-black hover:bg-opacity-90 rounded-full text-xs font-semibold tracking-wide uppercase transition-all"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>

              {/* Card 2: EQB-1300D-2A */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="bg-[#0e0e10] border border-white/5 rounded-[2.5rem] p-8 flex flex-col hover:border-white/10 hover:shadow-xl transition-all"
              >
                <div className="bg-white/[0.02] rounded-3xl h-60 overflow-hidden mb-6 flex items-center justify-center border border-white/5 relative">
                  <span className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 text-[9px] tracking-wider text-white">NEW 05/2026</span>
                  <img src="./watchhh/eqb_1300d_2a.png" alt="EQB-1300D-2A" className="w-full h-full object-contain scale-110 hover:scale-120 transition-all duration-500" />
                </div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1 font-mono">EQB-1300D-2A</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">EDIFICE EQB-1300 Series</h3>
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#00b2e3]">₹ 24,995</span>
                    <span className="text-[8px] text-gray-500 font-light">incl. of all taxes</span>
                  </div>
                  <button 
                    onClick={() => addToCart({ id: 'eqb-1300d-2a', name: 'EDIFICE EQB-1300 Series', price: 24995, imagePath: './watchhh/eqb_1300d_2a.png', serial: 'EQB-1300D-2A', limitedBadge: 'NEW 05/2026' })}
                    className="px-5 py-2 bg-[#00b2e3] text-black hover:bg-opacity-90 rounded-full text-xs font-semibold tracking-wide uppercase transition-all"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>

              {/* Card 3: ERA-130D-3A */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="bg-[#0e0e10] border border-white/5 rounded-[2.5rem] p-8 flex flex-col hover:border-white/10 hover:shadow-xl transition-all"
              >
                <div className="bg-white/[0.02] rounded-3xl h-60 overflow-hidden mb-6 flex items-center justify-center border border-white/5 relative">
                  <span className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 text-[9px] tracking-wider text-white">NEW 06/2026</span>
                  <img src="./watchhh/era_130d_3a.png" alt="ERA-130D-3A" className="w-full h-full object-contain scale-110 hover:scale-120 transition-all duration-500" />
                </div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1 font-mono">ERA-130D-3A</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Analog-Digital</h3>
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#00b2e3]">₹ 11,995</span>
                    <span className="text-[8px] text-gray-500 font-light">incl. of all taxes</span>
                  </div>
                  <button 
                    onClick={() => addToCart({ id: 'era-130d-3a', name: 'Analog-Digital', price: 11995, imagePath: './watchhh/era_130d_3a.png', serial: 'ERA-130D-3A', limitedBadge: 'NEW 06/2026' })}
                    className="px-5 py-2 bg-[#00b2e3] text-black hover:bg-opacity-90 rounded-full text-xs font-semibold tracking-wide uppercase transition-all"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* CASIO VINTAGE CATEGORY ROW */}
          <div id="casio-vintage-collection" className="mb-24">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-light uppercase tracking-[0.2em]">Casio Vintage</h2>
              <div className="hidden md:flex items-center gap-1.5 text-[8px] text-white/30 tracking-[0.3em]">
                <span className="text-[#00b2e3] font-bold">01</span> | <span>02</span> | <span>03</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: MQ-24DA-2A */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-[#0e0e10] border border-white/5 rounded-[2.5rem] p-8 flex flex-col hover:border-white/10 hover:shadow-xl transition-all"
              >
                <div className="bg-white/[0.02] rounded-3xl h-60 overflow-hidden mb-6 flex items-center justify-center border border-white/5 relative">
                  <span className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 text-[9px] tracking-wider text-white">NEW 06/2026</span>
                  <img src="./watchhh/mq_24da_2a.png" alt="MQ-24DA-2A" className="w-full h-full object-contain scale-110 hover:scale-120 transition-all duration-500" />
                </div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1 font-mono">MQ-24DA-2A</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">CASIO MQ-24DA-2A</h3>
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#00b2e3]">₹ 2,995</span>
                    <span className="text-[8px] text-gray-500 font-light">incl. of all taxes</span>
                  </div>
                  <button 
                    onClick={() => addToCart({ id: 'mq-24da-2a', name: 'CASIO MQ-24DA-2A', price: 2995, imagePath: './watchhh/mq_24da_2a.png', serial: 'MQ-24DA-2A', limitedBadge: 'NEW 06/2026' })}
                    className="px-5 py-2 bg-[#00b2e3] text-black hover:bg-opacity-90 rounded-full text-xs font-semibold tracking-wide uppercase transition-all"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>

              {/* Card 2: A140WE-8A */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="bg-[#0e0e10] border border-white/5 rounded-[2.5rem] p-8 flex flex-col hover:border-white/10 hover:shadow-xl transition-all"
              >
                <div className="bg-white/[0.02] rounded-3xl h-60 overflow-hidden mb-6 flex items-center justify-center border border-white/5 relative">
                  <span className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 text-[9px] tracking-wider text-white">NEW 06/2026</span>
                  <img src="./watchhh/a140we_8a.png" alt="A140WE-8A" className="w-full h-full object-contain scale-110 hover:scale-120 transition-all duration-500" />
                </div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1 font-mono">A140WE-8A</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">CASIO VINTAGE A140WE-8A</h3>
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#00b2e3]">₹ 6,495</span>
                    <span className="text-[8px] text-gray-500 font-light">incl. of all taxes</span>
                  </div>
                  <button 
                    onClick={() => addToCart({ id: 'a140we-8a', name: 'CASIO VINTAGE A140WE-8A', price: 6495, imagePath: './watchhh/a140we_8a.png', serial: 'A140WE-8A', limitedBadge: 'NEW 06/2026' })}
                    className="px-5 py-2 bg-[#00b2e3] text-black hover:bg-opacity-90 rounded-full text-xs font-semibold tracking-wide uppercase transition-all"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>

              {/* Card 3: AQ-240E-2A */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="bg-[#0e0e10] border border-white/5 rounded-[2.5rem] p-8 flex flex-col hover:border-white/10 hover:shadow-xl transition-all"
              >
                <div className="bg-white/[0.02] rounded-3xl h-60 overflow-hidden mb-6 flex items-center justify-center border border-white/5 relative">
                  <span className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 text-[9px] tracking-wider text-white">NEW 05/2026</span>
                  <img src="./watchhh/aq_240e_2a.png" alt="AQ-240E-2A" className="w-full h-full object-contain scale-110 hover:scale-120 transition-all duration-500" />
                </div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1 font-mono">AQ-240E-2A</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">CASIO VINTAGE AQ-240E-2A</h3>
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#00b2e3]">₹ 4,995</span>
                    <span className="text-[8px] text-gray-500 font-light">incl. of all taxes</span>
                  </div>
                  <button 
                    onClick={() => addToCart({ id: 'aq-240e-2a', name: 'CASIO VINTAGE AQ-240E-2A', price: 4995, imagePath: './watchhh/aq_240e_2a.png', serial: 'AQ-240E-2A', limitedBadge: 'NEW 05/2026' })}
                    className="px-5 py-2 bg-[#00b2e3] text-black hover:bg-opacity-90 rounded-full text-xs font-semibold tracking-wide uppercase transition-all"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mechanical Caliber Specs Grid */}
        <section className="w-full max-w-7xl px-8 py-20 border-t border-white/5 mb-32">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
          >
            <div className="md:col-span-4 pr-0 md:pr-8">
              <span className="text-xs font-bold tracking-[0.3em] text-[#00b2e3] uppercase block mb-3">Specifications</span>
              <h2 className="text-2xl md:text-3xl font-light uppercase tracking-widest leading-snug mb-4">Mechanical Tourbillon Caliber</h2>
              <p className="text-xs text-gray-500 leading-relaxed font-light">
                Our bespoke watch movement is engineered to eliminate gravity's effect on timekeeping. Each component is finished, tuned, and assembled completely by hand.
              </p>
            </div>

            <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="glass-card rounded-2xl p-5 border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Caliber</span>
                <span className="text-sm font-bold tracking-wide uppercase text-white">CH-3123 Automatic</span>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Power Reserve</span>
                <span className="text-sm font-bold tracking-wide uppercase text-white">72 Hours</span>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Water Resistance</span>
                <span className="text-sm font-bold tracking-wide uppercase text-white">100M (10 Bar)</span>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Jewels</span>
                <span className="text-sm font-bold tracking-wide uppercase text-white">25 Rubies</span>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Frequency</span>
                <span className="text-sm font-bold tracking-wide uppercase text-white">28,800 vph</span>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Casing Diameter</span>
                <span className="text-sm font-bold tracking-wide uppercase text-white">41.5 Millimeters</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Warranty & Service Section */}
        <section id="warranty-section" className="w-full max-w-7xl px-8 py-20 border-t border-white/5 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <span className="text-xs font-bold tracking-[0.3em] text-[#00b2e3] uppercase block mb-3">Service & Guarantee</span>
              <h2 className="text-3xl font-light uppercase tracking-widest leading-snug mb-6 text-white">3-Year International Warranty</h2>
              <p className="text-sm text-gray-400 leading-relaxed font-light mb-6">
                Every Casio Edifice & Premium series wristwatch is backed by our comprehensive 3-year international warranty. We provide hand-tuned calibrations, battery replacements, and structural waterproofing assessments at any of our authorized service centers globally.
              </p>
              <div className="flex gap-4">
                <button className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs font-semibold tracking-wider hover:bg-white/10 transition-all uppercase text-white cursor-pointer">
                  REGISTER WARRANTY
                </button>
                <button className="px-6 py-2.5 bg-transparent border border-white/10 hover:border-white/20 rounded-full text-xs font-semibold tracking-wider transition-all uppercase text-gray-400 hover:text-white cursor-pointer">
                  SERVICE CENTERS
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0e0e10]/60 p-6 rounded-3xl border border-white/5">
                <h4 className="text-xs font-bold tracking-wider text-white mb-2 uppercase">Official Parts</h4>
                <p className="text-[11px] text-gray-500 font-light leading-relaxed">Genuine Japanese-manufactured quartz modules and sapphire lenses exclusively utilized.</p>
              </div>
              <div className="bg-[#0e0e10]/60 p-6 rounded-3xl border border-white/5">
                <h4 className="text-xs font-bold tracking-wider text-white mb-2 uppercase">Free Shipping</h4>
                <p className="text-[11px] text-gray-500 font-light leading-relaxed">Complementary insured express shipping is provided for all repair services.</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Stores & Contact Footer Section */}
        <section id="stores-section" className="w-full max-w-7xl px-8 py-20 border-t border-white/5 mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16 text-left"
          >
            <div>
              <h4 className="text-xs font-bold tracking-widest text-[#00b2e3] uppercase mb-4">TOKYO HQ</h4>
              <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                6-2, Hon-machi 1-chome<br />
                Shibuya-ku, Tokyo 151-8543<br />
                Japan
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-widest text-[#00b2e3] uppercase mb-4">LONDON BOUTIQUE</h4>
              <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                19 New Bond Street<br />
                Mayfair, London W1S 2PF<br />
                United Kingdom
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-widest text-[#00b2e3] uppercase mb-4">NEW YORK FLAGSHIP</h4>
              <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                420 Madison Avenue<br />
                Midtown Manhattan, NY 10017<br />
                United States
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-widest text-[#00b2e3] uppercase mb-4">CUSTOMER SUPPORT</h4>
              <p className="text-[11px] text-gray-400 font-light leading-relaxed mb-3">
                Call: +1 (800) 555-0199<br />
                Hours: Mon - Fri, 9 AM - 6 PM EST
              </p>
              <span className="text-[10px] tracking-wider text-white bg-white/5 px-3 py-1 rounded-full border border-white/10">STORES LOCATOR</span>
            </div>
          </motion.div>
          <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-8 text-[10px] tracking-widest text-gray-500 font-light">
            <span>© {new Date().getFullYear()} CASIO COMPUTER CO., LTD. ALL RIGHTS RESERVED.</span>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">PRIVACY POLICY</a>
              <a href="#" className="hover:text-white transition-colors">TERMS OF SERVICE</a>
              <a href="#" className="hover:text-white transition-colors">COOKIE SETTINGS</a>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
