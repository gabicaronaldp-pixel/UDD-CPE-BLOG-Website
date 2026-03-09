import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Rss,
  Bookmark,
  TrendingUp,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  MessageSquare,
  Share2,
  Heart,
  Eye,
  Plus,
  BarChart3,
  Edit3,
  Trash2,
  Image as ImageIcon,
  Tag,
  Calendar,
  Globe,
  Lock,
  CheckCircle2,
  Send,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { cn, Post, Comment, Stats } from './types';
import { ref, onValue, set, push, remove, serverTimestamp, increment, update } from "firebase/database";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { db, auth } from "./firebase";

// --- Auth ---

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err: any) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/50 border border-slate-800 rounded-3xl p-10 space-y-8"
      >
        <div className="text-center">
          <div className="bg-primary p-3 rounded-2xl w-fit mx-auto mb-6">
            <Lock className="text-white size-6" />
          </div>
          <h1 className="text-3xl font-bold">Admin Login</h1>
          <p className="text-slate-400 text-sm mt-2">Enter your credentials to access the dashboard.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs p-4 rounded-xl text-center font-bold">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background-dark border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="admin@udd-cpe.edu"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background-dark border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- Components ---

const Navbar = ({ onSearch, onAuthClick }: { onSearch: (query: string) => void, onAuthClick: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    const unsubscribe = onAuthStateChanged(auth, (user) => setUser(user));
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
      isScrolled ? "bg-background-dark/80 backdrop-blur-md border-slate-800 py-3" : "bg-transparent border-transparent py-5"
    )}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-primary p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
            <Rss className="text-white size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">UDD-CPE Blog</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-slate-300 hover:text-primary transition-colors">Home</Link>
          <Link to="/feed" className="text-sm font-medium text-slate-300 hover:text-primary transition-colors">Discovery</Link>
          <Link to="/admin" className="text-sm font-medium text-slate-300 hover:text-primary transition-colors">Admin</Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 size-4" />
            <input
              type="text"
              placeholder="Search insights..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="bg-slate-800/50 border border-slate-700 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-48 lg:w-64"
            />
          </div>
          <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
            <Bell className="size-5" />
            <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-background-dark"></span>
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-white leading-none">{user.displayName || user.email?.split('@')[0]}</p>
                <button onClick={handleLogout} className="text-[10px] text-slate-500 hover:text-rose-500 font-bold uppercase transition-colors">Sign Out</button>
              </div>
              <div className="size-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center overflow-hidden">
                <img src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="text-sm font-bold bg-primary px-5 py-2 rounded-xl text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Join the Lab
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

const AuthModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // Save user role to DB if needed
        await set(ref(db, `users/${userCredential.user.uid}`), {
          name,
          email,
          role: 'Subscriber',
          joined: new Date().toISOString()
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message.includes('auth/invalid-credential') ? 'Invalid credentials' : err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
          <X className="size-6" />
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {isLogin ? 'Sign in to access your insights.' : 'Join our engineering community today.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs p-4 rounded-xl font-bold text-center">{error}</div>}

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background-dark border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Alex Rivers"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background-dark border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="you@udd-cpe.edu.ph"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background-dark border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 mt-4"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Join the Lab')}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          {isLogin ? "Don't have an account?" : "Already a member?"}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold hover:underline">
            {isLogin ? 'Create one' : 'Log in instead'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

const Sidebar = () => {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setUser(user));
    return () => unsubscribe();
  }, []);

  const navItems = [
    { icon: Rss, label: 'Feed', path: '/feed' },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: TrendingUp, label: 'Trending', path: '/trending' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-64 hidden lg:flex flex-col gap-8 border-r border-slate-800 p-6 sticky top-24 h-[calc(100vh-6rem)]">
      <div className="flex items-center gap-3 p-2">
        <div className="size-10 rounded-full border-2 border-primary overflow-hidden bg-slate-800 flex items-center justify-center">
          {user ? (
            <img src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <Users className="size-5 text-slate-500" />
          )}
        </div>
        <div className="overflow-hidden">
          <h3 className="text-sm font-bold truncate">{user ? (user.displayName || user.email?.split('@')[0]) : 'Guest Student'}</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user ? 'Subscriber' : 'Not Signed In'}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
              location.pathname === item.path ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            )}
          >
            <item.icon className="size-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Learning Progress</span>
            <span className="text-xs font-bold text-primary">75%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Embedded Systems path</p>
        </div>
      </div>
    </aside>
  );
};

// --- Pages ---

const HomePage = ({ searchQuery, onAuthClick }: { searchQuery: string, onAuthClick: () => void }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => setUser(user));
    const postsRef = ref(db, 'posts');
    const unsubscribePosts = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsList = Object.entries(data).map(([id, post]: [string, any]) => ({
          ...post,
          id: id
        })).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        setPosts(postsList);
      }
    });
    return () => {
      unsubscribeAuth();
      unsubscribePosts();
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredPosts(posts.filter(post =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.content.toLowerCase().includes(lowerQuery) ||
        post.category.toLowerCase().includes(lowerQuery)
      ));
    } else {
      setFilteredPosts(posts);
    }
  }, [searchQuery, posts]);

  const featuredPost = filteredPosts[0];
  const recentPosts = filteredPosts.slice(1);

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        {featuredPost && (
          <section className="mb-20">
            <div className="relative rounded-3xl overflow-hidden aspect-[21/9] group">
              <img
                src={`https://images.weserv.nl/?url=${encodeURIComponent(featuredPost.image_url)}`}
                alt={featuredPost.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Featured Insight</span>
                  <span className="text-slate-300 text-xs">12 min read</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{featuredPost.title}</h1>
                <p className="text-slate-300 text-lg mb-8 line-clamp-2">{featuredPost.content}</p>
                <Link
                  to={`/post/${featuredPost.id}`}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                >
                  Read Full Story <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Recent Articles */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Recent Articles</h2>
              <Link to="/feed" className="text-primary text-sm font-bold hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentPosts.map(post => (
                <motion.div
                  key={post.id}
                  whileHover={{ y: -5 }}
                  className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden group"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={`https://images.weserv.nl/?url=${encodeURIComponent(post.image_url)}`}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-primary text-[10px] font-bold uppercase tracking-widest mb-2 block">{post.category}</span>
                    <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-4">{post.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs">{post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy') : 'Recently'}</span>
                      <Link to={`/post/${post.id}`} className="text-primary text-sm font-bold flex items-center gap-1">
                        Read <ChevronRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-12">
            {/* Student POV */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
              <h2 className="text-xl font-bold mb-6">Student POV</h2>
              <div className="space-y-6">
                {[
                  { name: "Marcus Chen", quote: "The internship at the robotics lab changed my perspective on hardware-software co-design.", avatar: "https://picsum.photos/seed/marcus/50/50" },
                  { name: "Sarah Jenkins", quote: "Quantum computing isn't just theory anymore; we're seeing real-world CPE applications.", avatar: "https://picsum.photos/seed/sarah/50/50" }
                ].map((pov, i) => (
                  <div key={i} className="flex gap-4">
                    <img src={pov.avatar} alt={pov.name} className="size-10 rounded-full border border-primary/20" referrerPolicy="no-referrer" />
                    <div>
                      <p className="text-slate-300 text-sm italic mb-2">"{pov.quote}"</p>
                      <p className="text-xs font-bold text-primary">{pov.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Newsletter */}
            {!user && (
              <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/10 border border-primary/20 rounded-3xl p-8"
              >
                <h2 className="text-xl font-bold mb-2">Join the Lab</h2>
                <p className="text-slate-400 text-sm mb-6">Get the latest technical insights delivered to your inbox.</p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full bg-background-dark border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button onClick={onAuthClick} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all">
                    Subscribe
                  </button>
                </div>
              </motion.section>
            )}
            {user && (
              <section className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 text-center">
                <div className="bg-emerald-500/20 size-12 rounded-2xl mx-auto flex items-center justify-center text-emerald-500 mb-4">
                  <CheckCircle2 className="size-6" />
                </div>
                <h3 className="font-bold text-white">Joined the Lab</h3>
                <p className="text-slate-400 text-xs mt-2">You're subscribed to our latest insights!</p>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

const DiscoveryFeed = ({ searchQuery }: { searchQuery: string }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState('For You');

  useEffect(() => {
    const postsRef = ref(db, 'posts');
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsList = Object.entries(data).map(([id, post]: [string, any]) => ({
          ...post,
          id: id
        })).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        setPosts(postsList);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = posts;
    if (activeTab !== 'For You') {
      result = result.filter(post => post.category === activeTab);
    }
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(post =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.content.toLowerCase().includes(lowerQuery)
      );
    }
    setFilteredPosts(result);
  }, [searchQuery, posts, activeTab]);

  const tabs = ['For You', 'AI & ML', 'Robotics', 'Web3 & Crypto', 'Hardware'];

  return (
    <div className="pt-24 pb-20 flex max-w-7xl mx-auto px-6 gap-12">
      <Sidebar />

      <main className="flex-1">
        <div className="mb-10 overflow-x-auto">
          <div className="flex gap-8 border-b border-slate-800">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-4 text-sm font-bold transition-all relative",
                  activeTab === tab ? "text-primary" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-primary size-5" />
            <h2 className="text-xl font-bold">Recommended for You</h2>
          </div>

          {filteredPosts.length > 0 && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden flex flex-col md:flex-row group">
              <div className="md:w-1/2 aspect-video md:aspect-auto overflow-hidden">
                <img
                  src={`https://images.weserv.nl/?url=${encodeURIComponent(filteredPosts[0].image_url)}`}
                  alt={filteredPosts[0].title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              <div className="md:w-1/2 p-8 flex flex-col justify-center">
                <span className="text-primary text-[10px] font-bold uppercase tracking-widest mb-3 block">Featured</span>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{filteredPosts[0].title}</h3>
                <p className="text-slate-400 text-sm mb-6 line-clamp-3">{filteredPosts[0].content}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-slate-800 overflow-hidden">
                      <img src={`https://picsum.photos/seed/${filteredPosts[0].author}/50/50`} alt={filteredPosts[0].author} referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-xs text-slate-500">By {filteredPosts[0].author}</span>
                  </div>
                  <Link
                    to={`/post/${filteredPosts[0].id}`}
                    className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all"
                  >
                    Read Story
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Tailored Engineering Insights</h2>
            <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
              Refine interests <Settings className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <motion.div
                key={post.id}
                whileHover={{ y: -5 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden group flex flex-col"
              >
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={`https://images.weserv.nl/?url=${encodeURIComponent(post.image_url)}`}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <button className="absolute top-4 right-4 p-2 bg-background-dark/50 backdrop-blur-md rounded-full text-white hover:text-primary transition-colors">
                    <Bookmark className="size-4" />
                  </button>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <span className="text-primary text-[10px] font-bold uppercase tracking-widest mb-2 block">{post.category}</span>
                  <h4 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">{post.title}</h4>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-6">{post.content}</p>
                  <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{post.created_at ? format(new Date(post.created_at), 'MMM d') : 'Recently'} • 10 min read</span>
                    <ArrowRight className="size-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Feedback Widget */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-lg font-bold mb-1">Help us improve your feed</h4>
            <p className="text-sm text-slate-400">Are these articles relevant to your current projects?</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-primary transition-all text-sm font-bold">
              <CheckCircle2 className="size-4 text-emerald-500" /> Yes
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-primary transition-all text-sm font-bold">
              <X className="size-4 text-rose-500" /> Not quite
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

const PostView = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const postRef = ref(db, `posts/${id}`);
    const commentsRef = ref(db, `comments/${id}`);

    const unsubscribePost = onValue(postRef, (snapshot) => {
      setPost(snapshot.val());
    });

    const unsubscribeComments = onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setComments(Object.values(data));
      } else {
        setComments([]);
      }
    });

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((window.scrollY / totalHeight) * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      unsubscribePost();
      unsubscribeComments();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [id]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    const commentsRef = ref(db, `comments/${id}`);
    const newCommentRef = push(commentsRef);
    await set(newCommentRef, {
      author: 'Alex Rivers',
      designation: 'CPE Junior Member',
      content: newComment,
      created_at: new Date().toISOString()
    });
    setNewComment('');
    // Increment comment count
    await set(ref(db, 'stats/comments'), increment(1));
  };

  const handleLike = async () => {
    const postRef = ref(db, `posts/${id}/likes`);
    await set(postRef, increment(1));
    // Update total views/stats if needed
  };

  if (!post) return null;

  return (
    <div className="pt-24 pb-20">
      {/* Reading Progress Bar */}
      <div className="fixed top-[72px] left-0 right-0 z-50 h-1 bg-slate-800">
        <motion.div
          className="h-full bg-primary"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <article className="max-w-3xl mx-auto px-6">
        <header className="mb-12">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4">
            <Tag className="size-3" />
            <span>{post.category}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-6 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="size-4 text-primary" />
              </div>
              <span className="font-medium text-slate-200">{post.author}</span>
            </div>
            <span>•</span>
            <span>8 min read</span>
            <span>•</span>
            <span>{post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy') : 'Recently'}</span>
          </div>
        </header>

        <div className="rounded-3xl overflow-hidden mb-12 aspect-video border border-slate-800">
          <img src={`https://images.weserv.nl/?url=${encodeURIComponent(post.image_url)}`} alt={post.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
        </div>

        {post.image_gallery && post.image_gallery.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {post.image_gallery.map((img, idx) => (
              <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-800 hover:border-primary/50 transition-colors cursor-pointer group">
                <img src={`https://images.weserv.nl/?url=${encodeURIComponent(img)}`} alt={`Gallery ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" loading="lazy" />
              </div>
            ))}
          </div>
        )}

        <div className="markdown-body">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <div className="flex items-center justify-between py-8 border-y border-slate-800 my-16">
          <div className="flex gap-6">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <Heart className={cn("size-5", post.likes && "fill-rose-500 text-rose-500")} />
              <span className="font-bold">{post.likes || 0}</span>
            </button>
            <button className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors">
              <MessageSquare className="size-5" />
              <span className="font-bold">{comments.length} Comments</span>
            </button>
          </div>
          <div className="flex gap-3">
            <button className="p-2 rounded-full text-slate-400 hover:bg-primary/10 hover:text-primary transition-all">
              <Share2 className="size-5" />
            </button>
            <button className="p-2 rounded-full text-slate-400 hover:bg-primary/10 hover:text-primary transition-all">
              <Bookmark className="size-5" />
            </button>
          </div>
        </div>

        {/* Feedback Section */}
        <section className="space-y-10">
          <div>
            <h3 className="text-2xl font-bold mb-2">Student Feedback</h3>
            <p className="text-slate-400 text-sm">Share your thoughts on the quantum leap with your peers.</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex gap-4">
            <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
              <Edit3 className="size-5" />
            </div>
            <div className="flex-1 space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add your insight or ask a question..."
                className="w-full bg-background-dark border border-slate-700 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 italic">Posting as Computer Engineering Student</span>
                <button
                  onClick={handleSubmitComment}
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-xl font-bold transition-all"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-4">
                <div className="size-10 rounded-full bg-slate-800 overflow-hidden shrink-0">
                  <img src={`https://picsum.photos/seed/${comment.author}/50/50`} alt={comment.author} referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-sm">{comment.author} <span className="text-xs font-normal text-slate-500 ml-2">{comment.designation}</span></h4>
                    <span className="text-xs text-slate-500">{comment.created_at ? format(new Date(comment.created_at), 'h:mm a') : 'Just now'}</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{comment.content}</p>
                  <div className="flex gap-4 mt-3">
                    <button className="text-xs font-bold text-primary hover:underline">Reply</button>
                    <button className="text-xs font-bold text-primary hover:underline">Helpful</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentView, setCurrentView] = useState('Dashboard');
  const [imgbbKey, setImgbbKey] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const postsRef = ref(db, 'posts');
    const statsRef = ref(db, 'stats');

    const unsubscribePosts = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPosts(Object.entries(data).map(([id, post]: [string, any]) => ({ ...post, id }))
          .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
      }
    });

    const unsubscribeStats = onValue(statsRef, (snapshot) => {
      setStats(snapshot.val());
    });

    const imgbbRef = ref(db, 'settings/imgbb_api_key');
    const unsubscribeImgbb = onValue(imgbbRef, (snapshot) => {
      if (snapshot.exists()) {
        setImgbbKey(snapshot.val());
      }
    });

    return () => {
      unsubscribePosts();
      unsubscribeStats();
      unsubscribeImgbb();
    };
  }, []);

  const handleDelete = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await remove(ref(db, `posts/${postId}`));
        // Decrement post count
        await set(ref(db, 'stats/posts'), increment(-1));
        alert('Post deleted successfully');
      } catch (err) {
        console.error("Delete failed:", err);
        alert('Failed to delete post. Check permissions or network.');
      }
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await set(ref(db, 'settings/imgbb_api_key'), imgbbKey);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error("Save failed:", err);
      alert('Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-6 flex gap-12">
      <aside className="w-64 hidden lg:flex flex-col gap-2 border-r border-slate-800 p-6 sticky top-24 h-[calc(100vh-6rem)]">
        {[
          { icon: LayoutDashboard, label: 'Dashboard' },
          { icon: FileText, label: 'Posts' },
          { icon: Users, label: 'Authors' },
          { icon: BarChart3, label: 'Analytics' },
          { icon: Settings, label: 'Settings' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => setCurrentView(item.label)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              currentView === item.label ? "bg-primary text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            )}
          >
            <item.icon className="size-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </aside>

      <main className="flex-1 space-y-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin {currentView}</h1>
            <p className="text-slate-400 text-sm">
              {currentView === 'Dashboard' && "Welcome back, Admin. Here's what's happening today."}
              {currentView === 'Posts' && "Manage and organize your blog publications."}
              {currentView === 'Authors' && "Directory of contributors and members."}
              {currentView === 'Analytics' && "Detailed performance metrics and insights."}
              {currentView === 'Settings' && "Configure your profile and site preferences."}
            </p>
          </div>
          {(currentView === 'Dashboard' || currentView === 'Posts') && (
            <button
              onClick={() => navigate('/admin/editor')}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="size-5" /> New Post
            </button>
          )}
        </div>

        {currentView === 'Dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { label: 'Total Posts', value: stats?.posts, icon: FileText, color: 'text-blue-500' },
                { label: 'Total Views', value: stats?.views, icon: Eye, color: 'text-emerald-500' },
                { label: 'Comments', value: stats?.comments, icon: MessageSquare, color: 'text-amber-500' },
                { label: 'Subscribers', value: stats?.subscribers, icon: Users, color: 'text-purple-500' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-2 rounded-xl bg-slate-800", stat.color)}>
                      <stat.icon className="size-5" />
                    </div>
                    <span className="text-xs font-bold text-emerald-500">+12%</span>
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-bold">{stat.value?.toLocaleString() || '0'}</h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Recent Posts Table */}
              <div className="xl:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold">Recent Blog Posts</h3>
                  <button onClick={() => setCurrentView('Posts')} className="text-primary text-xs font-bold hover:underline">View all</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                        <th className="px-6 py-4">Title</th>
                        <th className="px-6 py-4">Author</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Views</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {posts.slice(0, 5).map(post => (
                        <tr key={post.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold truncate max-w-[200px]">{post.title}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">{post.author}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                              post.status === 'Published' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                            )}>
                              {post.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">{post.views}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => navigate(`/admin/editor/${post.id}`)}
                                className="p-2 text-slate-400 hover:text-primary transition-colors"
                              >
                                <Edit3 className="size-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(post.id)}
                                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Draft */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                <h3 className="font-bold mb-6">Quick Draft</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Post Title"
                    className="w-full bg-background-dark border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <textarea
                    placeholder="What's on your mind?"
                    className="w-full bg-background-dark border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px]"
                  />
                  <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all">
                    Save Draft
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {currentView === 'Posts' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Views</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {posts.map(post => (
                    <tr key={post.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold truncate max-w-[300px]">{post.title}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{post.author}</td>
                      <td className="px-6 py-4 text-sm text-primary font-bold">{post.category}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          post.status === 'Published' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                        )}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{post.views}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/editor/${post.id}`)}
                            className="p-2 text-slate-400 hover:text-primary transition-colors"
                          >
                            <Edit3 className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === 'Analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 h-80 flex items-center justify-center text-slate-500 italic">
              View Analytics Charts...
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 h-80 flex items-center justify-center text-slate-500 italic">
              Visitor Demographics...
            </div>
          </div>
        )}

        {currentView === 'Settings' && (
          <div className="max-w-2xl bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">System Configuration</h3>
                <a
                  href="https://api.imgbb.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
                >
                  <ExternalLink className="size-3" /> Get Free ImgBB Key
                </a>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                <p className="text-xs text-amber-500 leading-relaxed font-medium">
                  <span className="font-bold uppercase">Important:</span> To upload images to your blog, you need a free API key from ImgBB. Click the link above to get one instantly (no credit card required).
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  ImgBB API Key
                  <span className="lowercase font-normal text-slate-600">(Required for image uploads)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={imgbbKey}
                    onChange={(e) => setImgbbKey(e.target.value)}
                    placeholder="Enter your ImgBB API Key here..."
                    className="w-full bg-background-dark border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 opacity-50">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Blog Name</label>
                  <input type="text" disabled defaultValue="UDD-CPE Blog" className="w-full bg-background-dark border border-slate-800 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed" />
                </div>
                <div className="space-y-2 opacity-50">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest text-nowrap">Support Email</label>
                  <input type="email" disabled defaultValue="cpe-lab@udd.edu.ph" className="w-full bg-background-dark border border-slate-800 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed" />
                </div>
              </div>
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              {savingSettings ? "Saving..." : "Save Config"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

const AdminEditor = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('AI & ML');
  const [status, setStatus] = useState('Draft');
  const [imageUrl, setImageUrl] = useState('https://picsum.photos/seed/newpost/1200/600');
  const [imageGallery, setImageGallery] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imgbbApiKey, setImgbbApiKey] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const postRef = ref(db, `posts/${id}`);
      onValue(postRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setTitle(data.title);
          setContent(data.content);
          setCategory(data.category);
          setStatus(data.status);
          setImageUrl(data.image_url);
          setImageGallery(data.image_gallery || []);
        }
      }, { onlyOnce: true });
    }

    // Fetch ImgBB handleAPI key
    const imgbbRef = ref(db, 'settings/imgbb_api_key');
    const unsubscribe = onValue(imgbbRef, (snapshot) => {
      if (snapshot.exists()) {
        setImgbbApiKey(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, [id]);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      console.log("[Debug] Starting compression for:", file.name);
      // If it's not an image, just resolve with the original file
      if (!file.type.startsWith('image/')) {
        console.log("[Debug] Not an image, skipping compression");
        return resolve(file);
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          try {
            console.log("[Debug] Image loaded into memory, creating canvas");
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              console.log("[Debug] Could not get canvas context, skipping compression");
              return resolve(file);
            }
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              console.log("[Debug] Canvas to blob complete");
              resolve(blob || file);
            }, 'image/jpeg', 0.8);
          } catch (e) {
            console.error("[Debug] Compression error:", e);
            resolve(file);
          }
        };

        img.onerror = () => {
          console.error("[Debug] Image loading error");
          resolve(file); // Fallback to original file
        };
      };
      reader.onerror = () => {
        console.error("[Debug] FileReader error");
        resolve(file); // Fallback to original file
      };

      // Safety timeout: resolve after 10 seconds if nothing happens
      setTimeout(() => {
        console.warn("[Debug] Compression timed out, using original file");
        resolve(file);
      }, 10000);
    });
  };
  const uploadToImgBB = async (blob: Blob, name: string): Promise<string> => {
    if (!imgbbApiKey) {
      alert("No ImgBB API Key found! Please go to Admin Settings to set your free API key.");
      throw new Error("Missing ImgBB API Key");
    }
    const formData = new FormData();
    formData.append('image', blob, name);
    formData.append('key', imgbbApiKey);

    try {
      console.log(`[Debug] Sending to ImgBB: ${name}`);
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'ImgBB upload failed');
      }

      const data = await response.json();
      console.log(`[Debug] ImgBB Upload success: ${data.data.display_url}`);
      return data.data.display_url;
    } catch (error) {
      console.error('[Debug] ImgBB Error:', error);
      throw error;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    console.log("[Debug] handleImageUpload (ImgBB) started with", files.length, "files");
    setUploading(true);
    setUploadProgress(10);

    try {
      const fileArray = Array.from(files);
      const uploadPromises = fileArray.map(async (file, index) => {
        try {
          console.log(`[Debug] Processing file ${index + 1}: ${file.name}`);
          setUploadProgress(Math.round(10 + (index / fileArray.length) * 40));

          const compressedBlob = await compressImage(file);
          const url = await uploadToImgBB(compressedBlob, file.name);

          setUploadProgress(Math.round(50 + ((index + 1) / fileArray.length) * 50));
          return url;
        } catch (fileErr: any) {
          console.error(`[Debug] File processing failed for ${file.name}:`, fileErr);
          throw fileErr;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUrls = results.filter((url): url is string => url !== null);

      if (isGallery) {
        setImageGallery(prev => [...prev, ...successfulUrls]);
      } else {
        setImageUrl(successfulUrls[0]);
      }

      setUploadProgress(100);
    } catch (err: any) {
      console.error("[Debug] Final upload error:", err);
      alert(`Image upload failed: ${err.message || "Please check your internet connection and try again."}`);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const removeGalleryImage = (index: number) => {
    setImageGallery(prev => prev.filter((_, i) => i !== index));
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selection = text.substring(start, end);

    const newContent = before + prefix + selection + suffix + after;
    setContent(newContent);

    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handlePublish = async () => {
    const postData = {
      title,
      content,
      author: 'Admin',
      category,
      status: 'Published',
      image_url: imageUrl,
      // created_at is handled below
    };

    if (id) {
      const postUpdates: any = {};
      postUpdates[`/posts/${id}/title`] = title;
      postUpdates[`/posts/${id}/content`] = content;
      postUpdates[`/posts/${id}/category`] = category;
      postUpdates[`/posts/${id}/image_url`] = imageUrl;
      postUpdates[`/posts/${id}/image_gallery`] = imageGallery;
      postUpdates[`/posts/${id}/status`] = 'Published';

      await update(ref(db), postUpdates);
    } else {
      const postsRef = ref(db, 'posts');
      const newPostRef = push(postsRef);
      await set(newPostRef, {
        ...postData,
        image_gallery: imageGallery,
        created_at: new Date().toISOString(),
        views: 0
      });

      // Update stats
      const statsRef = ref(db, 'stats/posts');
      await set(statsRef, increment(1));
    }

    navigate('/admin');
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-6">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Edit3 className="size-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Post Management</span>
          </div>
          <h1 className="text-3xl font-bold">Manage Post</h1>
          <p className="text-slate-400 text-sm mt-1">Compose and configure your technical blog post.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-all">
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
          >
            Publish Post
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Post Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                placeholder="e.g., Implementing Neural Networks in C++"
                className="w-full bg-background-dark border border-slate-800 rounded-xl px-6 py-4 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Post Content</label>
                <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg">
                  <button onClick={() => insertMarkdown('**', '**')} className="p-1 px-2 text-[10px] font-bold hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white">B</button>
                  <button onClick={() => insertMarkdown('*', '*')} className="p-1 px-2 text-[10px] italic hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white">I</button>
                  <button onClick={() => insertMarkdown('# ')} className="p-1 px-2 text-[10px] font-bold hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white">H1</button>
                  <button onClick={() => insertMarkdown('## ')} className="p-1 px-2 text-[10px] font-bold hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white">H2</button>
                  <button onClick={() => insertMarkdown('[', '](url)')} className="p-1 px-2 text-[10px] hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white">Link</button>
                  <button onClick={() => insertMarkdown('```\n', '\n```')} className="p-1 px-2 text-[10px] hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white">Code</button>
                </div>
              </div>
              <textarea
                id="content-editor"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your technical breakdown here..."
                className="w-full bg-background-dark border border-slate-800 rounded-2xl p-6 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[500px] leading-relaxed resize-none text-slate-300"
              />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="font-bold">Post Media</h3>

            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Featured Image</label>
              <div className="aspect-video rounded-2xl overflow-hidden bg-slate-800 relative group border border-slate-700">
                <img src={imageUrl} alt="Featured" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                  <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all">
                    Change Image
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, false)} />
                  </label>
                </div>
                {uploading && uploadProgress === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Image Gallery</label>
                <label className="cursor-pointer text-primary text-xs font-bold hover:underline">
                  Add Images
                  <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => handleImageUpload(e, true)} />
                </label>
              </div>

              {uploading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase text-center">Uploading... {uploadProgress}%</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                {imageGallery.map((url, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-slate-800 relative group ring-1 ring-slate-700">
                    <img src={url} alt="Gallery" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-1 right-1 size-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {imageGallery.length === 0 && !uploading && (
                  <div className="col-span-3 py-6 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600">
                    <ImageIcon className="size-5 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Empty Gallery</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-8">
            <h3 className="font-bold flex items-center gap-2 border-b border-slate-800 pb-4">
              <Settings className="size-4 text-primary" /> Post Settings
            </h3>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Visibility</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setStatus('Published')}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                    status === 'Published' ? "bg-primary text-white" : "bg-slate-800 text-slate-400"
                  )}
                >
                  <Globe className="size-3" /> Public
                </button>
                <button
                  onClick={() => setStatus('Draft')}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                    status === 'Draft' ? "bg-primary text-white" : "bg-slate-800 text-slate-400"
                  )}
                >
                  <Lock className="size-3" /> Draft
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background-dark border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option>AI & ML</option>
                <option>Robotics</option>
                <option>Web3 & Crypto</option>
                <option>Hardware</option>
                <option>Quantum Computing</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Schedule</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 size-4" />
                <input
                  type="datetime-local"
                  className="w-full bg-background-dark border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="font-bold flex items-center gap-2 border-b border-slate-800 pb-4">
              <Tag className="size-4 text-primary" /> Tags
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Add a tag..."
                className="w-full bg-background-dark border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex flex-wrap gap-2">
                {['PyTorch', 'NVIDIA Jetson', 'C++'].map(tag => (
                  <span key={tag} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-2">
                    {tag} <X className="size-3 cursor-pointer" />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 rounded-3xl p-8 text-center space-y-4">
            <div className="size-12 bg-primary/20 rounded-2xl mx-auto flex items-center justify-center text-primary">
              <Eye className="size-6" />
            </div>
            <div>
              <h4 className="font-bold">Preview Post</h4>
              <p className="text-slate-400 text-xs mt-1">See how your post looks to the public.</p>
            </div>
            <button className="w-full py-2.5 rounded-xl border border-primary/40 text-primary font-bold hover:bg-primary hover:text-white transition-all">
              Open Preview
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="bg-slate-900 border-t border-slate-800 py-16">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary p-1.5 rounded-lg">
            <Rss className="text-white size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">UDD-CPE Blog</span>
        </div>
        <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
          The official engineering blog for the Computer Engineering department at Universidad de Dagupan. Empowering students through technical excellence.
        </p>
      </div>
      <div>
        <h4 className="font-bold mb-6">Resources</h4>
        <ul className="space-y-4 text-sm text-slate-400">
          <li><Link to="/courses" className="hover:text-primary transition-colors">Courses</Link></li>
          <li><Link to="/research" className="hover:text-primary transition-colors">Research</Link></li>
          <li><Link to="/faculty" className="hover:text-primary transition-colors">Faculty</Link></li>
          <li><Link to="/guidelines" className="hover:text-primary transition-colors">Guidelines</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-6">Support</h4>
        <ul className="space-y-4 text-sm text-slate-400">
          <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
          <li><Link to="/api" className="hover:text-primary transition-colors">API Docs</Link></li>
          <li><Link to="/status" className="hover:text-primary transition-colors">System Status</Link></li>
          <li><Link to="/feedback" className="hover:text-primary transition-colors">Feedback</Link></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-slate-500 text-xs">© 2024 UDD Computer Engineering Department. All rights reserved.</p>
      <div className="flex gap-6 text-slate-500 text-xs">
        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar onSearch={setSearchQuery} onAuthClick={() => setIsAuthModalOpen(true)} />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage searchQuery={searchQuery} onAuthClick={() => setIsAuthModalOpen(true)} />} />
            <Route path="/feed" element={<DiscoveryFeed searchQuery={searchQuery} />} />
            <Route path="/post/:id" element={<PostView />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/editor" element={
              <ProtectedRoute>
                <AdminEditor />
              </ProtectedRoute>
            } />
            <Route path="/admin/editor/:id" element={
              <ProtectedRoute>
                <AdminEditor />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
        <Footer />
        <AnimatePresence>
          {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />}
        </AnimatePresence>
      </div>
    </Router>
  );
}
