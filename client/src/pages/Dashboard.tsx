import { useState, useMemo } from "react";
import { motion } from "framer-motion";
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
  MapPin,
  ArrowRight,
  User,
  Phone,
  Sticker,
  Search,
  PieChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart as RePieChart, Pie, Cell } from "recharts";
import { Input } from "@/components/ui/input";

// Generate activity data purely for visual filler if real data isn't easily time-series mapped
const activityData = [
  { month: "Jan", snaps: 4000 },
  { month: "Feb", snaps: 3000 },
  { month: "Mar", snaps: 5500 },
  { month: "Apr", snaps: 4500 },
  { month: "May", snaps: 6000 },
  { month: "Jun", snaps: 8000 },
];

const mockChats = [
  { 
    id: 1, 
    user: "Alex D.", 
    messages: [
      { id: "m1", type: "text", content: "Did you see that?", time: "2m ago", date: "Feb 26, 2026", unsaved: false, transcript: undefined },
      { id: "m2", type: "snap", content: "Snap sent (unsaved)", time: "1m ago", date: "Feb 26, 2026", unsaved: true, transcript: undefined }
    ],
    time: "2m ago", unread: true 
  },
  { 
    id: 2, 
    user: "Sarah M.", 
    messages: [
      { id: "m3", type: "text", content: "Haha yeah exactly", time: "1h ago", date: "Feb 25, 2026", unsaved: false, transcript: undefined },
      { id: "m4", type: "image", content: "memory_01.jpg", chatSource: "Sarah M.", time: "1h ago", date: "Feb 25, 2026", transcript: "Look at this view!", unsaved: false }
    ],
    time: "1h ago", unread: false 
  },
  { 
    id: 3, 
    user: "Group: Weekend", 
    messages: [
      { id: "m5", type: "audio", content: "Audio Message (0:14)", chatSource: "Group: Weekend", time: "3h ago", date: "Feb 25, 2026", transcript: "Hey guys are we still on for tonight?", unsaved: false }
    ],
    time: "3h ago", unread: false 
  },
];

const mockMedia = [
  { id: 1, type: "image", date: "Oct 12, 2023", location: "New York, NY", fileName: "memory_2023_10_12.jpg", chatSource: "Sarah M.", transcript: "city skyline tall buildings" },
  { id: 2, type: "video", date: "Sep 28, 2023", location: "Los Angeles, CA", fileName: "video_2023_09_28.mp4", chatSource: "Alex D.", transcript: "skatepark tricks friends" },
  { id: 3, type: "audio", date: "Sep 15, 2023", location: "Chicago, IL", fileName: "voice_note_01.mp4", chatSource: "Group: Weekend", transcript: "Hey guys are we still on for tonight?" },
  { id: 4, type: "image", date: "Aug 02, 2023", location: "Miami, FL", fileName: "beach_day.jpg", chatSource: "Self", transcript: "ocean beach sand sunny" },
  { id: 5, type: "video", date: "Jul 21, 2023", location: "Austin, TX", fileName: "concert.mp4", chatSource: "Mike T.", transcript: "live music band stage lights loud" },
  { id: 6, type: "image", date: "Jul 04, 2023", location: "Denver, CO", fileName: "fireworks.jpg", chatSource: "Emma W.", transcript: "night sky fireworks bright colors" },
];

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

export default function Dashboard({ parsedData }: { parsedData?: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedChat, setSelectedChat] = useState<typeof mockChats[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDownload = (fileName: string) => {
    console.log(`Downloading ${fileName}...`);
  };

  // Format Call Time
  const formatTime = (seconds: number) => {
     const h = Math.floor(seconds / 3600);
     const m = Math.floor((seconds % 3600) / 60);
     if (h > 0) return `${h}h ${m}m`;
     return `${m}m ${seconds % 60}s`;
  };

  // Process App Time spent for Pie Chart
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
     const dataToFilter = parsedData?.media?.length > 0 ? parsedData.media : mockMedia;
     if (!searchQuery) return dataToFilter;
     const q = searchQuery.toLowerCase();
     return dataToFilter.filter((m: any) => 
        m.fileName.toLowerCase().includes(q) || 
        m.chatSource.toLowerCase().includes(q) ||
        (m.transcript && m.transcript.toLowerCase().includes(q))
     );
  }, [searchQuery, parsedData]);

  const activeChats = parsedData?.chats?.length > 0 ? parsedData.chats : mockChats;

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
             {parsedData?.username || "Unknown User"} 
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
        <TabsList className="glass-panel border-none bg-transparent h-auto p-1 mb-8">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-xl px-6 py-3">
            <Activity className="w-4 h-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="chats" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-xl px-6 py-3">
            <MessageSquare className="w-4 h-4 mr-2" /> Chats & Audio
          </TabsTrigger>
          <TabsTrigger value="media" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-xl px-6 py-3">
            <ImageIcon className="w-4 h-4 mr-2" /> Memories & Search
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
                  <div>
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-1">Top Friend</p>
                    <h2 className="text-3xl font-display font-bold text-white truncate max-w-full px-2" title={parsedData?.topFriend}>{parsedData?.topFriend || "None"}</h2>
                    <p className="text-xs text-muted-foreground mt-1">Based on interaction volume</p>
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
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Total Call Time</p>
                      <h3 className="text-2xl font-display font-bold text-white">{formatTime(parsedData?.callTime || 0)}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                       <Sticker className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Custom Stickers</p>
                      <h3 className="text-2xl font-display font-bold text-white">{parsedData?.customStickers || 0}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ROW 2: Engagement Stats */}
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
                   <CardContent className="h-[300px] w-full flex items-center">
                      <div className="w-1/2 h-full">
                         <ResponsiveContainer width="100%" height="100%">
                           <RePieChart>
                             <Pie
                               data={timeSpentData}
                               cx="50%"
                               cy="50%"
                               innerRadius={80}
                               outerRadius={110}
                               paddingAngle={5}
                               dataKey="value"
                               stroke="none"
                             >
                               {timeSpentData.map((entry: any, index: number) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                               ))}
                             </Pie>
                             <Tooltip 
                               formatter={(value: number) => `${value.toFixed(2)}%`}
                               contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                             />
                           </RePieChart>
                         </ResponsiveContainer>
                      </div>
                      <div className="w-1/2 flex flex-col gap-3 justify-center pl-8">
                         {timeSpentData.map((item: any, i: number) => (
                            <div key={item.name} className="flex items-center gap-3">
                               <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                               <span className="text-sm font-medium flex-1">{item.name}</span>
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
            <div className="space-y-4">
              <h3 className="text-2xl font-bold mb-6">Recent Conversations</h3>
              {activeChats.map((chat: any, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`glass-panel p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer ${selectedChat?.id === chat.id ? 'bg-white/10 ring-1 ring-primary/50' : ''}`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-lg font-bold shrink-0">
                    {chat.user.charAt(0)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className={`font-semibold ${chat.unread ? 'text-white' : 'text-white/80'} truncate`}>{chat.user}</h4>
                    <p className="text-sm text-muted-foreground truncate w-full">
                      {chat.messages[chat.messages.length - 1]?.content || "No messages"}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-col items-end shrink-0">
                    <span>{chat.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="lg:col-span-2">
              {selectedChat ? (
                <div className="glass-panel rounded-3xl overflow-hidden flex flex-col h-[600px]">
                  <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {selectedChat.user.charAt(0)}
                      </div>
                      <h4 className="font-bold">{selectedChat.user}</h4>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/20">
                    {selectedChat.messages.map((msg, idx) => {
                      const showDate = idx === 0 || selectedChat.messages[idx - 1].date !== msg.date;
                      return (
                        <div key={msg.id} className="space-y-4">
                          {showDate && (
                            <div className="flex justify-center">
                              <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
                                {msg.date}
                              </span>
                            </div>
                          )}
                          <div className={`flex flex-col ${idx % 2 === 0 ? 'items-start' : 'items-end'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 ${
                              msg.unsaved ? 'border border-dashed border-white/20 bg-transparent opacity-60' :
                              idx % 2 === 0 ? 'bg-white/10' : 'bg-primary/20 text-white'
                            }`}>
                              {msg.type === 'snap' ? (
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                    <ImageIcon className="w-4 h-4 text-primary" />
                                  </div>
                                  <div className="text-sm italic">Unsaved Snap</div>
                                </div>
                              ) : msg.type === 'audio' ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                                      <Play className="w-4 h-4 text-accent" />
                                    </div>
                                    <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden flex-shrink-0">
                                      <div className="h-full bg-accent w-1/2" />
                                    </div>
                                    <span className="text-xs shrink-0">0:14</span>
                                  </div>
                                  {msg.transcript && (
                                     <div className="mt-2 text-xs italic opacity-70 bg-black/20 p-2 rounded">
                                        "{msg.transcript}"
                                     </div>
                                  )}
                                </div>
                              ) : msg.type === 'image' ? (
                                <div className="space-y-3">
                                  <div className="aspect-square w-48 bg-black/40 rounded-lg flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-white/20" />
                                  </div>
                                  <p className="text-xs opacity-60 italic break-words">{msg.content}</p>
                                  {msg.transcript && (
                                     <div className="text-xs italic opacity-70 border-t border-white/10 pt-2">
                                        Semantic: {msg.transcript}
                                     </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm break-words">{msg.content}</p>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1 px-1">{msg.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="glass-panel rounded-3xl h-[600px] flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
                  <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                  <p>Select a conversation to view chat history and saved media.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="media">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                 <h3 className="text-2xl font-bold">Saved Media & Memories</h3>
                 <div className="text-sm text-muted-foreground mt-1">
                    Deduplicated & highest quality retained. Showing metadata & transcripts.
                 </div>
              </div>
              <div className="relative w-full md:w-72">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                 <Input 
                   className="pl-9 bg-white/5 border-white/10 rounded-full w-full"
                   placeholder="Search transcripts, filenames..."
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                 />
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
                    <div className="aspect-video rounded-xl bg-black/40 mb-4 flex items-center justify-center relative overflow-hidden shrink-0">
                      {media.type === 'video' ? (
                        <div className="flex flex-col items-center gap-2">
                          <Play className="w-10 h-10 text-white/50 group-hover:text-white transition-colors" />
                          <span className="text-[10px] uppercase tracking-widest opacity-40">MP4 VIDEO</span>
                        </div>
                      ) : media.type === 'audio' ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex gap-1 items-end h-6">
                            {[1,2,3,4,5].map(j => (
                              <motion.div 
                                key={j}
                                animate={{ height: [8, 20, 8] }}
                                transition={{ duration: 1, repeat: Infinity, delay: j * 0.1 }}
                                className="w-1 bg-accent/60 rounded-full"
                              />
                            ))}
                          </div>
                          <span className="text-[10px] uppercase tracking-widest text-accent">MP4 AUDIO (WAV CONV)</span>
                        </div>
                      ) : (
                        <ImageIcon className="w-10 h-10 text-white/50 group-hover:text-white transition-colors" />
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-xs backdrop-blur-md">
                        {media.type.toUpperCase()}
                      </div>
                    </div>
                    <div className="space-y-3 flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm font-medium">
                            <Clock className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
                            {media.date}
                          </div>
                          <div className="flex items-center text-xs text-primary/80">
                            <MessageSquare className="w-3 h-3 mr-2 shrink-0" />
                            Chat: {media.chatSource}
                          </div>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors shrink-0"
                          onClick={() => handleDownload(media.fileName)}
                        >
                          <ArrowRight className="w-4 h-4 rotate-45" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center text-xs text-muted-foreground bg-white/5 p-2 rounded-lg">
                        <span className="truncate flex-1" title={media.fileName}>{media.fileName}</span>
                      </div>
                      
                      {media.transcript && (
                         <div className="mt-auto text-xs bg-black/20 p-2 rounded-lg text-white/70 italic line-clamp-2" title={media.transcript}>
                            "{media.transcript}"
                         </div>
                      )}
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
