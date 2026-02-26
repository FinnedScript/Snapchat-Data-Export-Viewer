import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  MessageSquare, 
  Clock, 
  Image as ImageIcon, 
  Users, 
  Flame, 
  ChevronRight,
  Play,
  MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

// Mock Data
const statsData = {
  snapScore: "142,893",
  timeOnApp: "1,240 hrs",
  snapsSent: "45k+",
  snapsReceived: "62k+",
  topFriend: "Alex D.",
  streak: "342 🔥"
};

const activityData = [
  { month: "Jan", snaps: 4000 },
  { month: "Feb", snaps: 3000 },
  { month: "Mar", snaps: 5500 },
  { month: "Apr", snaps: 4500 },
  { month: "May", snaps: 6000 },
  { month: "Jun", snaps: 8000 },
];

const mockChats = [
  { id: 1, user: "Alex D.", msg: "Sent a Snap", type: "snap", time: "2m ago", unread: true },
  { id: 2, user: "Sarah M.", msg: "Haha yeah exactly", type: "text", time: "1h ago", unread: false },
  { id: 3, user: "Group: Weekend", msg: "Audio Message (0:14)", type: "audio", time: "3h ago", unread: false },
  { id: 4, user: "Mike T.", msg: "Saved a photo", type: "saved", time: "Yesterday", unread: false },
  { id: 5, user: "Emma W.", msg: "Sent a Snap", type: "snap", time: "Yesterday", unread: false },
];

const mockMedia = [
  { id: 1, type: "image", date: "Oct 12, 2023", location: "New York, NY" },
  { id: 2, type: "video", date: "Sep 28, 2023", location: "Los Angeles, CA" },
  { id: 3, type: "image", date: "Sep 15, 2023", location: "Chicago, IL" },
  { id: 4, type: "image", date: "Aug 02, 2023", location: "Miami, FL" },
  { id: 5, type: "video", date: "Jul 21, 2023", location: "Austin, TX" },
  { id: 6, type: "image", date: "Jul 04, 2023", location: "Denver, CO" },
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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Your Snapchat Reality</h1>
          <p className="text-muted-foreground">Data analyzed successfully. Here's your digital footprint.</p>
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
            <ImageIcon className="w-4 h-4 mr-2" /> Memories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <motion.div variants={itemVariants} className="col-span-1 lg:col-span-3">
              <Card className="glass-panel border-white/5 bg-white/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Activity className="w-5 h-5 mr-2 text-primary" />
                    Activity Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="colorSnaps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} tickFormatter={(value) => `${value/1000}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: 'hsl(var(--primary))' }}
                      />
                      <Area type="monotone" dataKey="snaps" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSnaps)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass-panel border-white/5 bg-white/5 h-full relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-8 flex flex-col justify-center items-center text-center h-full gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary bloom-effect">
                    <Flame className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-1">Snap Score</p>
                    <h2 className="text-5xl font-display font-bold text-white">{statsData.snapScore}</h2>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass-panel border-white/5 bg-white/5 h-full">
                <CardContent className="p-8 flex flex-col justify-center items-center text-center h-full gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-1">Time on App</p>
                    <h2 className="text-5xl font-display font-bold text-white">{statsData.timeOnApp}</h2>
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
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-1">Top Friend</p>
                    <h2 className="text-3xl font-display font-bold text-white">{statsData.topFriend}</h2>
                    <p className="text-primary font-medium mt-2">{statsData.streak} Streak</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="chats">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-2xl font-bold mb-6">Recent Conversations</h3>
              {mockChats.map((chat, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={chat.id}
                  className="glass-panel p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-lg font-bold">
                    {chat.user.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${chat.unread ? 'text-white' : 'text-white/80'}`}>{chat.user}</h4>
                    <p className={`text-sm ${
                      chat.type === 'snap' ? 'text-primary' : 
                      chat.type === 'audio' ? 'text-accent' : 'text-muted-foreground'
                    }`}>
                      {chat.type === 'snap' && <span className="inline-block w-2 h-2 bg-primary rounded-sm mr-2 animate-pulse" />}
                      {chat.type === 'audio' && <Play className="inline-block w-3 h-3 mr-1" />}
                      {chat.msg}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-col items-end">
                    <span>{chat.time}</span>
                    <ChevronRight className="w-4 h-4 mt-1 opacity-50" />
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="space-y-6">
              <Card className="glass-panel border-white/5 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-lg">Chat Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Snaps Sent</span>
                      <span className="font-bold">{statsData.snapsSent}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Snaps Received</span>
                      <span className="font-bold">{statsData.snapsReceived}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="media">
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Saved Media & Memories</h3>
              <div className="text-sm text-muted-foreground">Showing metadata only (Privacy Protected)</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockMedia.map((media, i) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={media.id}
                  className="glass-panel rounded-2xl p-4 flex flex-col group hover:bg-white/10 transition-colors"
                >
                  <div className="aspect-video rounded-xl bg-black/40 mb-4 flex items-center justify-center relative overflow-hidden">
                    {media.type === 'video' ? (
                      <Play className="w-10 h-10 text-white/50 group-hover:text-white transition-colors" />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-white/50 group-hover:text-white transition-colors" />
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-xs backdrop-blur-md">
                      {media.type.toUpperCase()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium">
                      <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                      {media.date}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {media.location}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
