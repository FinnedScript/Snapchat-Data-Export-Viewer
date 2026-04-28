import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  MessageSquare, 
  Clock, 
  Image as ImageIcon, 
  Users, 
  Flame, 
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  MapPin,
  ArrowRight,
  User,
  Phone,
  Sticker,
  Search,
  PieChart,
  Camera,
  AudioLines,
  Download,
  Eye,
  Maximize2,
  Copy,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip } from "recharts";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const color = data.payload.fill || data.color || 'white';
    return (
      <div className="bg-black/90 border border-white/10 p-3 rounded-xl shadow-xl text-sm">
        <p style={{ color }} className="font-semibold">
          {data.name}: {data.value.toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

const CustomVideoPlayer = ({ src, type }: { src: string, type: 'video' | 'audio' }) => {
  const videoRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(total);
      setProgress((current / total) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatVideoTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2000);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center group/player bg-black overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={togglePlay}
    >
      {type === 'video' ? (
        <video 
          ref={videoRef as React.RefObject<HTMLVideoElement>} 
          src={src} 
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onLoadedMetadata={handleTimeUpdate}
          autoPlay
          playsInline
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 relative">
          <audio 
            ref={videoRef as React.RefObject<HTMLAudioElement>} 
            src={src} 
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onLoadedMetadata={handleTimeUpdate}
            autoPlay
          />
          <AudioLines className="w-32 h-32 text-accent/40 mb-8" />
          
          {/* Audio Visualizer Mock */}
          <div className="flex items-center gap-1 h-16 w-3/4 max-w-md">
            {Array.from({ length: 40 }).map((_, i) => (
               <motion.div 
                 key={i}
                 className="flex-1 bg-accent/60 rounded-full origin-bottom"
                 initial={{ height: "4px" }}
                 animate={{ 
                    height: isPlaying ? `${Math.max(4, Math.random() * 100)}%` : "4px",
                    opacity: (i / 40) < (progress / 100) ? 1 : 0.3
                 }}
                 transition={{ duration: 0.1, repeat: isPlaying ? Infinity : 0, repeatType: "reverse" }}
               />
            ))}
          </div>
        </div>
      )}

      {/* Playback Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
             <div className="flex items-center gap-4 w-full">
                <span className="text-xs font-medium text-white/80 tabular-nums w-10 text-right">
                   {formatVideoTime(currentTime)}
                </span>
                
                <div className="flex-1 relative flex items-center group/slider">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={progress}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-primary rounded-full transition-all duration-100"
                        style={{ width: `${progress}%` }}
                     />
                  </div>
                  <div 
                     className="absolute h-3 w-3 bg-white rounded-full shadow z-10 pointer-events-none opacity-0 group-hover/slider:opacity-100 transition-opacity"
                     style={{ left: `calc(${progress}% - 6px)` }}
                  />
                </div>
                
                <span className="text-xs font-medium text-white/80 tabular-nums w-10">
                   {formatVideoTime(duration)}
                </span>
             </div>
             
             <div className="flex items-center justify-center relative w-full">
                <Button 
                   variant="ghost" 
                   size="icon" 
                   className="absolute left-0 text-white/80 hover:text-white hover:bg-white/10 h-8 w-8 rounded-full"
                   onClick={toggleMute}
                >
                   {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                
                <Button 
                   variant="ghost" 
                   size="icon" 
                   className="text-white hover:text-primary hover:bg-white/10 h-12 w-12 rounded-full border border-white/20 bg-black/40 backdrop-blur"
                   onClick={togglePlay}
                >
                   {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                </Button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Dashboard({ parsedData }: { parsedData?: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [selectedSnap, setSelectedSnap] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [transcribingIds, setTranscribingIds] = useState<Set<string>>(new Set());
  const [showAllMedia, setShowAllMedia] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Media filters
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("all");

  // Scroll to bottom when selected chat changes
  useEffect(() => {
    if (selectedChat && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChat]);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
     navigator.clipboard.writeText(text);
     setCopiedId(id);
     setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (media: any) => {
    console.log(`Downloading ${media.fileName}...`);
    // In a real app we'd construct a blob URL and trigger a download link
  };

  const handleTranscribe = async (id: string) => {
     setTranscribingIds(prev => new Set(prev).add(id));
     // Simulate local Whisper transcription latency
     await new Promise(resolve => setTimeout(resolve, 2500));
     
     const mediaItem = parsedData.media.find((m: any) => m.id === id);
     if (mediaItem) {
        mediaItem.transcript = "Hey, yeah I'll be there in about 10 minutes. Just finishing up here.";
     }
     
     setTranscribingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
     });
  };

  const formatTime = (seconds: number) => {
     const h = Math.floor(seconds / 3600);
     const m = Math.floor((seconds % 3600) / 60);
     if (h > 0) return `${h}h ${m}m`;
     return `${m}m ${seconds % 60}s`;
  };

  const timeSpentData = useMemo(() => {
     if (!parsedData?.timeSpent || parsedData.timeSpent.length === 0) return [];
     
     return parsedData.timeSpent.map((item: string) => {
         const [name, pctStr] = item.split(': ');
         return {
             name,
             value: parseFloat(pctStr.replace('%', ''))
         };
     }).filter((item: any) => item.value > 0);
  }, [parsedData]);

  const COLORS = ['#FFFC00', '#007AFF', '#FF0050', '#9b51e0', '#2ecc71', '#00d2ff', '#f39c12'];

  const filteredMedia = useMemo(() => {
     const dataToFilter = parsedData?.media || [];
     
     // Sort newest to oldest based on date string (Month DD, YYYY)
     const sorted = [...dataToFilter].sort((a, b) => {
         const dateA = new Date(a.date).getTime();
         const dateB = new Date(b.date).getTime();
         return dateB - dateA;
     });
     
     return sorted.filter((m: any) => {
        const typeMatch = mediaTypeFilter === "all" || m.type === mediaTypeFilter;
        return typeMatch;
     });
  }, [mediaTypeFilter, parsedData]);

  const activeChats = parsedData?.chats || [];
  const activeSnaps = parsedData?.snaps || [];

  const renderMessage = (msg: any, idx: number, arr: any[], chatUser: string) => {
      const showDate = idx === 0 || arr[idx - 1].date !== msg.date;
      const isSystem = msg.type === 'system';
      const isMe = msg.from !== chatUser;

      return (
        <div key={msg.id} className="space-y-4">
          {showDate && (
            <div className="flex justify-center">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
                {msg.date}
              </span>
            </div>
          )}
          
          {isSystem ? (
            <div className="flex justify-center">
              <span className="text-xs text-muted-foreground text-center px-4 py-1">
                 {msg.content}
              </span>
            </div>
          ) : (
            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                isMe ? 'bg-primary/20 text-white' : 'bg-white/10'
              }`}>
                {msg.type === 'media' ? (
                  <div className="space-y-3">
                    <Dialog>
                       <DialogTrigger asChild>
                          <div className="aspect-square w-48 bg-black/40 rounded-lg flex items-center justify-center border border-white/10 relative overflow-hidden cursor-pointer group/preview">
                            {/* Show actual image/video preview if we have a blob URL */}
                            {msg.url ? (
                               msg.mediaType === 'video' ? (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 overflow-hidden">
                                     <video src={msg.url} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/preview:opacity-100 transition-opacity" muted loop onMouseEnter={(e) => (e.target as HTMLVideoElement).play()} onMouseLeave={(e) => { (e.target as HTMLVideoElement).pause(); (e.target as HTMLVideoElement).currentTime = 0; }} />
                                  </div>
                               ) : msg.mediaType === 'audio' ? (
                                   <div className="flex flex-col items-center gap-2 relative z-10">
                                      <AudioLines className="w-8 h-8 text-accent/80 group-hover/preview:text-accent transition-colors" />
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-accent drop-shadow-md">AUDIO</span>
                                   </div>
                               ) : (
                                  <img src={msg.url} alt="Media" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover/preview:opacity-100 transition-opacity" />
                               )
                            ) : (
                              <ImageIcon className="w-8 h-8 text-white/20" />
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover/preview:bg-black/20 transition-colors flex items-center justify-center z-20 pointer-events-none">
                               <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover/preview:opacity-100 transition-opacity drop-shadow-lg" />
                            </div>
                          </div>
                       </DialogTrigger>
                       {msg.url && (
                          <DialogContent className="max-w-4xl bg-black/90 border-white/10 p-0 overflow-hidden">
                             <div className="w-full aspect-video flex items-center justify-center bg-black relative">
                                {msg.mediaType === 'video' ? (
                                   <CustomVideoPlayer src={msg.url} type="video" />
                                ) : msg.mediaType === 'audio' ? (
                                   <CustomVideoPlayer src={msg.url} type="audio" />
                                ) : (
                                   <img src={msg.url} alt="Media" className="max-w-full max-h-full object-contain" />
                                )}
                             </div>
                          </DialogContent>
                       )}
                    </Dialog>
                    {!msg.url && msg.content && <p className="text-xs opacity-60 break-words">Media ID: {msg.content.substring(0, 12)}...</p>}
                  </div>
                ) : (
                  <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 px-1 flex items-center gap-1">
                 <span className="font-semibold">{msg.from}</span> • {msg.time}
              </div>
            </div>
          )}
        </div>
      );
  };

  const renderSnap = (snap: any, idx: number, arr: any[], chatUser: string) => {
      const showDate = idx === 0 || arr[idx - 1].date !== snap.date;
      const isMe = snap.from !== chatUser;

      return (
        <div key={snap.id} className="space-y-4">
          {showDate && (
            <div className="flex justify-center">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
                {snap.date}
              </span>
            </div>
          )}
          
          <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 border border-dashed flex items-center gap-3 ${
              isMe ? 'border-primary/40 bg-primary/5 text-white' : 'border-white/20 bg-white/5'
            }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isMe ? 'bg-primary/20 text-primary' : 'bg-white/10'}`}>
                {snap.type === 'video' ? <Play className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              </div>
              <div>
                 <div className="text-sm font-medium">{snap.type === 'video' ? 'VIDEO' : 'IMAGE'}</div>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 px-1 flex items-center gap-1">
               <span className="font-semibold">{snap.from}</span> • {snap.time}
            </div>
          </div>
        </div>
      );
  };


  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Your Snapchat Reality</h1>
          <p className="text-muted-foreground flex items-center gap-2">
             <User className="w-4 h-4"/> 
             <span className="font-semibold text-white">{parsedData?.username || "Unknown User"}</span>
             <span className="mx-2 opacity-30">•</span>
             Data analyzed securely in browser.
          </p>
        </div>
        <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium">Local Analysis Active</span>
        </div>
      </motion.div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="glass-panel border-none bg-transparent h-auto p-1 mb-8 overflow-x-auto flex flex-nowrap w-full justify-start items-center hide-scrollbar">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-xl px-6 py-3 whitespace-nowrap">
            <Activity className="w-4 h-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="chats" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-xl px-6 py-3 whitespace-nowrap">
            <MessageSquare className="w-4 h-4 mr-2" /> Chats
          </TabsTrigger>
          <TabsTrigger value="snaps" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-xl px-6 py-3 whitespace-nowrap">
            <Camera className="w-4 h-4 mr-2" /> Snaps
          </TabsTrigger>
          <TabsTrigger value="media" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-xl px-6 py-3 whitespace-nowrap">
            <ImageIcon className="w-4 h-4 mr-2" /> Media
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* ROW 1: Key Stats */}
            <motion.div variants={itemVariants}>
              <Card className="glass-panel border-white/5 bg-white/5 h-full relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-8 flex flex-col justify-center items-center text-center h-full gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary bloom-effect">
                    <Flame className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-1">Snap Score</p>
                    <h2 className="text-5xl font-display font-bold text-white">{parsedData?.snapScore || "0"}</h2>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass-panel border-white/5 bg-white/5 h-full">
                <CardContent className="p-8 flex flex-col justify-center items-center text-center h-full gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-1">Total Friends</p>
                    <h2 className="text-5xl font-display font-bold text-white">{parsedData?.totalFriends || "0"}</h2>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass-panel border-white/5 bg-white/5 h-full">
                <CardContent className="p-8 flex flex-col justify-center items-center text-center h-full gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <Users className="w-8 h-8" />
                  </div>
                  <div className="w-full">
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-1">Top Friend</p>
                    <h2 className="text-3xl font-display font-bold text-white truncate px-2" title={parsedData?.topFriend}>{parsedData?.topFriend || "None"}</h2>
                    <p className="text-[10px] text-muted-foreground mt-1">Based on interaction volume</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card className="glass-panel border-white/5 bg-white/5 h-full">
                <CardContent className="p-6 flex flex-col justify-center h-full gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                       <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Total Call Time</p>
                      <h3 className="text-2xl font-display font-bold text-white">{formatTime(parsedData?.callTime || 0)}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                       <Sticker className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Custom Stickers</p>
                      <h3 className="text-2xl font-display font-bold text-white">{parsedData?.customStickers || 0}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
              <Card className="glass-panel border-white/5 bg-white/5 h-full">
                <CardHeader>
                  <CardTitle className="text-xl">Snaps Engagement</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-8">
                  <div className="text-center w-full">
                    <div className="text-sm text-muted-foreground mb-2">Total Snaps</div>
                    <div className="text-6xl font-bold text-primary bloom-text mb-6">
                       {((parsedData?.snapsSent || 0) + (parsedData?.snapsViewed || 0)).toLocaleString()}
                    </div>
                    <div className="flex flex-col gap-2 text-sm border-t border-white/10 pt-6 mt-2 w-full max-w-xs mx-auto">
                       <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                         <span className="text-muted-foreground">Snaps Viewed</span>
                         <span className="font-bold text-lg text-white">{(parsedData?.snapsViewed || 0).toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                         <span className="text-muted-foreground">Snaps Sent</span>
                         <span className="font-bold text-lg text-white">{(parsedData?.snapsSent || 0).toLocaleString()}</span>
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
              <Card className="glass-panel border-white/5 bg-white/5 h-full">
                <CardHeader>
                  <CardTitle className="text-xl">Chats Engagement</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-8">
                  <div className="text-center w-full">
                    <div className="text-sm text-muted-foreground mb-2">Total Chats</div>
                    <div className="text-6xl font-bold text-accent mb-6">
                       {((parsedData?.chatsSent || 0) + (parsedData?.chatsViewed || 0)).toLocaleString()}
                    </div>
                    <div className="flex flex-col gap-2 text-sm border-t border-white/10 pt-6 mt-2 w-full max-w-xs mx-auto">
                       <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                         <span className="text-muted-foreground">Chats Viewed</span>
                         <span className="font-bold text-lg text-white">{(parsedData?.chatsViewed || 0).toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                         <span className="text-muted-foreground">Chats Sent</span>
                         <span className="font-bold text-lg text-white">{(parsedData?.chatsSent || 0).toLocaleString()}</span>
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ROW 3: Charts */}
            {timeSpentData.length > 0 && (
               <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-4">
                 <Card className="glass-panel border-white/5 bg-white/5 overflow-hidden">
                   <CardHeader>
                     <CardTitle className="flex items-center text-xl">
                       <PieChart className="w-5 h-5 mr-2 text-primary" />
                       App Time Distribution
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="flex flex-col md:flex-row items-center h-auto md:h-[300px] w-full pb-8">
                      <div className="w-full md:w-1/2 h-[250px] md:h-full">
                         <ResponsiveContainer width="100%" height="100%">
                           <RePieChart>
                             <Pie
                               data={timeSpentData}
                               cx="50%"
                               cy="50%"
                               innerRadius={60}
                               outerRadius={90}
                               paddingAngle={0}
                               dataKey="value"
                               stroke="none"
                             >
                               {timeSpentData.map((item: any, i: number) => (
                                 <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                               ))}
                             </Pie>
                             <Tooltip content={<CustomTooltip />} />
                           </RePieChart>
                         </ResponsiveContainer>
                      </div>
                      <div className="w-full md:w-1/2 flex flex-col gap-3 justify-center md:pl-8 mt-4 md:mt-0">
                         {timeSpentData.map((item: any, i: number) => (
                            <div key={item.name} className="flex items-center gap-3">
                               <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                               <span className="text-sm font-medium flex-1 truncate">{item.name}</span>
                               <span className="text-sm text-muted-foreground">{item.value.toFixed(2)}%</span>
                            </div>
                         ))}
                      </div>
                   </CardContent>
                 </Card>
               </motion.div>
            )}

          </motion.div>
        </TabsContent>

        <TabsContent value="chats">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4 lg:h-[700px] flex flex-col">
              <h3 className="text-2xl font-bold mb-2 shrink-0">Recent Conversations</h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {activeChats.map((chat: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`glass-panel p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer ${selectedChat?.id === chat.id ? 'bg-white/10 ring-1 ring-primary/50' : ''}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-lg font-bold shrink-0">
                      {chat.user.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-semibold text-white truncate">{chat.user}</h4>
                      <p className="text-sm text-muted-foreground truncate w-full">
                        {chat.messages[chat.messages.length - 1]?.content || "No messages"}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-col items-end shrink-0">
                      <span>{chat.time}</span>
                    </div>
                  </motion.div>
                ))}
                {activeChats.length === 0 && (
                   <div className="text-center p-8 text-muted-foreground">No chats found.</div>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-2">
              {selectedChat ? (
                <div className="glass-panel rounded-3xl overflow-hidden flex flex-col h-[700px]">
                  <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {selectedChat.user.charAt(0).toUpperCase()}
                      </div>
                      <h4 className="font-bold text-lg">{selectedChat.user}</h4>
                    </div>
                    <div className="flex items-center gap-3">
                       <Button
                         variant="outline"
                         size="sm"
                         className="h-8 text-xs border-white/10 hover:bg-white/10 hidden sm:flex"
                         onClick={() => setShowAllMedia(!showAllMedia)}
                       >
                         <ImageIcon className="w-3 h-3 mr-1.5" />
                         {showAllMedia ? "Show Messages" : "Show All Media"}
                       </Button>
                       <div className="relative w-full sm:w-64 mt-2 sm:mt-0">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input 
                            className="pl-9 bg-white/5 border-white/10 rounded-full w-full h-8 text-xs"
                            placeholder="Search in conversation..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                          />
                       </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 bg-black/20 custom-scrollbar flex flex-col gap-2">
                    {selectedChat.messages
                      .filter((msg: any) => !searchQuery || msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
                      .filter((msg: any) => showAllMedia ? msg.type === 'media' : true)
                      .map((msg: any, idx: number, arr: any[]) => renderMessage(msg, idx, arr, selectedChat.user))}
                      <div ref={messagesEndRef} />
                  </div>
                </div>
              ) : (
                <div className="glass-panel rounded-3xl h-[700px] flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
                  <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                  <p>Select a conversation to view detailed chat history.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="snaps">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4 lg:h-[700px] flex flex-col">
              <h3 className="text-2xl font-bold mb-2 shrink-0">Snap History</h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {activeSnaps.map((snapGrp: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={snapGrp.id}
                    onClick={() => setSelectedSnap(snapGrp)}
                    className={`glass-panel p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer ${selectedSnap?.id === snapGrp.id ? 'bg-white/10 ring-1 ring-primary/50' : ''}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-lg font-bold shrink-0">
                      {snapGrp.user.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-semibold text-white truncate">{snapGrp.user}</h4>
                      <p className="text-sm text-primary truncate w-full flex items-center gap-1">
                        <Camera className="w-3 h-3"/> {snapGrp.snaps.length} Snaps
                      </p>
                    </div>
                  </motion.div>
                ))}
                {activeSnaps.length === 0 && (
                   <div className="text-center p-8 text-muted-foreground">No snaps found.</div>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-2">
              {selectedSnap ? (
                <div className="glass-panel rounded-3xl overflow-hidden flex flex-col h-[700px]">
                  <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {selectedSnap.user.charAt(0).toUpperCase()}
                      </div>
                      <h4 className="font-bold text-lg">{selectedSnap.user} - Snap History</h4>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 bg-black/20 custom-scrollbar flex flex-col gap-2">
                    {selectedSnap.snaps.map((snap: any, idx: number, arr: any[]) => renderSnap(snap, idx, arr, selectedSnap.user))}
                  </div>
                </div>
              ) : (
                <div className="glass-panel rounded-3xl h-[700px] flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
                  <Camera className="w-16 h-16 mb-4 opacity-20" />
                  <p>Select a user to view snap metadata history.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="media">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                 <h3 className="text-2xl font-bold flex items-center gap-3">
                    Media
                    <div className="text-xs font-normal text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full border border-border/50 shadow-sm flex items-center h-fit">
                       <span className="font-semibold text-foreground mr-1">{mediaFiles.length}</span> Total Assets
                    </div>
                 </h3>
                 <div className="text-sm text-muted-foreground mt-1">
                    Deduplicated & highest quality retained.
                 </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                 <div className="flex bg-white/5 p-1 rounded-lg">
                    <button 
                       className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mediaTypeFilter === 'all' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-white'}`}
                       onClick={() => setMediaTypeFilter('all')}
                    >
                       All
                    </button>
                    <button 
                       className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mediaTypeFilter === 'image' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-white'}`}
                       onClick={() => setMediaTypeFilter('image')}
                    >
                       Images
                    </button>
                    <button 
                       className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mediaTypeFilter === 'video' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-white'}`}
                       onClick={() => setMediaTypeFilter('video')}
                    >
                       Videos
                    </button>
                    <button 
                       className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mediaTypeFilter === 'audio' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-white'}`}
                       onClick={() => setMediaTypeFilter('audio')}
                    >
                       Audio
                    </button>
                 </div>
                 <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      className="pl-9 bg-white/5 border-white/10 rounded-lg w-full h-9"
                      placeholder="Search filenames..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                 </div>
              </div>
            </div>
            
            {filteredMedia.length === 0 ? (
               <div className="text-center p-12 glass-panel rounded-2xl text-muted-foreground">
                  No media matches your search.
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMedia.map((media: any, i: number) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                    key={media.id}
                    className="glass-panel rounded-2xl p-4 flex flex-col group hover:bg-white/10 transition-colors"
                  >
                    <Dialog>
                       <DialogTrigger asChild>
                          <div className="aspect-video rounded-xl bg-black/60 mb-4 flex items-center justify-center relative overflow-hidden shrink-0 cursor-pointer group/preview">
                            {media.type === 'video' ? (
                              <>
                                <video src={media.url} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/preview:opacity-100 transition-opacity" muted loop onMouseEnter={(e) => (e.target as HTMLVideoElement).play()} onMouseLeave={(e) => { (e.target as HTMLVideoElement).pause(); (e.target as HTMLVideoElement).currentTime = 0; }} />
                                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-widest drop-shadow-md z-20">VIDEO</div>
                              </>
                            ) : media.type === 'audio' ? (
                              <>
                                <div className="flex flex-col items-center gap-2 relative z-10">
                                  <AudioLines className="w-10 h-10 text-accent/80 group-hover/preview:text-accent transition-colors" />
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-accent uppercase tracking-widest drop-shadow-md z-20">AUDIO</div>
                              </>
                            ) : (
                              <>
                                <img src={media.url} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover/preview:opacity-100 transition-opacity" alt="Preview" />
                                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-widest drop-shadow-md z-20">IMAGE</div>
                              </>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover/preview:bg-black/20 transition-colors flex items-center justify-center z-20 pointer-events-none">
                               <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover/preview:opacity-100 transition-opacity drop-shadow-lg" />
                            </div>
                          </div>
                       </DialogTrigger>
                       <DialogContent className="max-w-4xl bg-black/90 border-white/10 p-0 overflow-hidden">
                          <div className="w-full aspect-video flex items-center justify-center bg-black relative">
                             {media.type === 'video' ? (
                                <CustomVideoPlayer src={media.url} type="video" />
                             ) : media.type === 'audio' ? (
                                <CustomVideoPlayer src={media.url} type="audio" />
                             ) : (
                                <img src={media.url} alt="Media" className="max-w-full max-h-full object-contain" />
                             )}
                             <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-xs text-white z-50 max-w-[80%] flex flex-col gap-1 items-end pointer-events-none">
                                {media.allFileNames ? media.allFileNames.map((name: string) => (
                                    <span key={name} className="truncate w-full text-right">{name}</span>
                                )) : media.fileName}
                             </div>
                          </div>
                       </DialogContent>
                    </Dialog>

                    <div className="space-y-3 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div className="space-y-1 w-full">
                          <div className="flex items-center text-sm font-medium w-full truncate">
                            {media.date}
                          </div>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors shrink-0"
                          onClick={() => handleDownload(media)}
                          title="Download File"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-col gap-2 w-full">
                         {media.allFileNames ? media.allFileNames.map((name: string) => (
                           <div key={name} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg w-full">
                             <div className="text-xs text-muted-foreground truncate flex-1" title={name}>
                               {name}
                             </div>
                             <Button 
                               size="icon" 
                               variant="ghost" 
                               className="h-6 w-6 rounded hover:bg-white/10 text-muted-foreground hover:text-white shrink-0"
                               onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(name, `${media.id}-${name}`);
                               }}
                               title="Copy filename"
                             >
                               {copiedId === `${media.id}-${name}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                             </Button>
                           </div>
                         )) : (
                           <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg w-full">
                             <div className="text-xs text-muted-foreground truncate flex-1" title={media.fileName}>
                               {media.fileName}
                             </div>
                             <Button 
                               size="icon" 
                               variant="ghost" 
                               className="h-6 w-6 rounded hover:bg-white/10 text-muted-foreground hover:text-white shrink-0"
                               onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(media.fileName, media.id);
                               }}
                               title="Copy filename"
                             >
                               {copiedId === media.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                             </Button>
                           </div>
                         )}
                         
                         {media.type === 'audio' && !media.transcript && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full h-8 text-xs border-white/10 hover:bg-white/10"
                              onClick={() => handleTranscribe(media.id)}
                              disabled={transcribingIds.has(media.id)}
                            >
                               {transcribingIds.has(media.id) ? "Transcribing (Local AI)..." : "Transcribe Voice Note"}
                            </Button>
                         )}
                      </div>
                      
                      <div className="mt-auto space-y-2 pt-2">
                         {media.category && (
                            <div className="flex flex-wrap gap-1">
                               {media.category.split(', ').map((c: string) => (
                                  <span key={c} className="text-[10px] uppercase bg-primary/10 text-primary px-2 py-0.5 rounded">
                                     {c}
                                  </span>
                               ))}
                            </div>
                         )}
                         {media.transcript && (
                            <div className="text-xs bg-black/30 p-2 rounded border border-white/5 text-white/80 italic line-clamp-3" title={media.transcript}>
                               "{media.transcript}"
                            </div>
                         )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}