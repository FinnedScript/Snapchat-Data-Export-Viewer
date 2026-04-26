import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileJson, ArrowRight, ShieldCheck } from "lucide-react";
import JSZip from "jszip";

export default function Home({ onUpload }: { onUpload: (parsedData: any) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    await processFile(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    await processFile(file);
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.zip')) {
      setError("Please upload a valid .zip file containing your Snapchat data export.");
      return;
    }

    setIsUploading(true);
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
      const parsedData: any = {
        username: "Unknown",
        customStickers: 0,
        callTime: 0,
        timeSpent: [],
        snapsSent: 0,
        snapsViewed: 0,
        chatsSent: 0,
        chatsViewed: 0,
        snapScore: "0",
        totalFriends: "0",
        topFriend: "None",
        chats: [],
        media: []
      };

      // 1. Username
      const accountFile = contents.file(/json\/account\.json$/i)[0];
      if (accountFile) {
        const text = await accountFile.async("text");
        try {
          const json = JSON.parse(text);
          if (json["Basic Information"] && json["Basic Information"]["Username"]) {
            parsedData.username = json["Basic Information"]["Username"];
          }
        } catch (e) {}
      }

      // 2. Custom Stickers
      const stickersFile = contents.file(/json\/custom_stickers\.json$/i)[0];
      if (stickersFile) {
        const text = await stickersFile.async("text");
        try {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            parsedData.customStickers = json.length;
          } else if (json["Custom Stickers"]) {
             parsedData.customStickers = json["Custom Stickers"].length;
          }
        } catch (e) {}
      }

      // 3. Call Time
      const talkHistoryFile = contents.file(/json\/talk_history\.json$/i)[0];
      if (talkHistoryFile) {
        const text = await talkHistoryFile.async("text");
        try {
          const json = JSON.parse(text);
          let totalSeconds = 0;
          if (json["Outgoing Calls"]) {
            json["Outgoing Calls"].forEach((call: any) => {
              if (call["Length (sec)"]) totalSeconds += parseInt(call["Length (sec)"]) || 0;
            });
          }
          if (json["Incoming Calls"]) {
            json["Incoming Calls"].forEach((call: any) => {
              if (call["Length (sec)"]) totalSeconds += parseInt(call["Length (sec)"]) || 0;
            });
          }
          parsedData.callTime = totalSeconds;
        } catch (e) {}
      }

      // 4, 5, 6. User Profile Stats
      const userProfileFile = contents.file(/json\/user_profile\.json$/i)[0];
      if (userProfileFile) {
        const text = await userProfileFile.async("text");
        try {
          const json = JSON.parse(text);
          if (json["Breakdown of Time Spent on App"]) {
             parsedData.timeSpent = json["Breakdown of Time Spent on App"];
          }
          
          if (json["Engagement"]) {
             const getCount = (event: string) => {
                const item = json["Engagement"].find((e: any) => e.Event === event);
                return item ? (parseInt(item.Occurrences) || 0) : 0;
             };
             
             parsedData.snapsSent = getCount("Snap Sends") + getCount("Direct Snaps Created");
             parsedData.snapsViewed = getCount("Snap Views") + getCount("Snaps Viewed in a Story") + getCount("Geofilter Story Snaps Viewed");
             parsedData.chatsSent = getCount("Chats Sent");
             parsedData.chatsViewed = getCount("Chats Viewed");
          }
        } catch (e) {}
      }

      // 7. Snapscore and Friends
      const rankingFile = contents.file(/json\/ranking\.json$/i)[0];
      if (rankingFile) {
        const text = await rankingFile.async("text");
        try {
           try {
              const json = JSON.parse(text);
               if (json["Statistics"]) {
                   parsedData.snapScore = json["Statistics"]["Snapscore"] || "0";
                   parsedData.totalFriends = json["Statistics"]["Your Total Friends"] || "0";
               } else {
                   const matchScore = text.match(/"Snapscore":\s*"([\d\.]+)"/);
                   if (matchScore) parsedData.snapScore = matchScore[1];
                   
                   const matchFriends = text.match(/"Your Total Friends":\s*"(\d+)"/);
                   if (matchFriends) parsedData.totalFriends = matchFriends[1];
               }
           } catch(e) {
               const matchScore = text.match(/"Snapscore":\s*"([\d\.]+)"/);
               if (matchScore) parsedData.snapScore = matchScore[1];
               
               const matchFriends = text.match(/"Your Total Friends":\s*"(\d+)"/);
               if (matchFriends) parsedData.totalFriends = matchFriends[1];
           }

        } catch (e) {}
      }
      
      // 8. Top Friend & Chats & Unsaved Snaps Placeholder & Media Deduplication
      const chatHistoryFile = contents.file(/json\/chat_history\.json$/i)[0];
      const snapHistoryFile = contents.file(/json\/snap_history\.json$/i)[0];
      
      let friendCounts: Record<string, number> = {};
      let chatHistory: any[] = [];
      let mediaItems: any[] = [];

      if (chatHistoryFile) {
        const text = await chatHistoryFile.async("text");
        try {
           const json = JSON.parse(text);
           const processChats = (arr: any[], type: 'sent' | 'received') => {
             if (!arr) return;
             arr.forEach(msg => {
               const friend = msg["To"] || msg["From"] || "Unknown";
               friendCounts[friend] = (friendCounts[friend] || 0) + 1;
               
               if (msg["Media Type"] && msg["Media Type"] !== "TEXT") {
                 let mediaType = "image";
                 let content = "Saved Media";
                 
                 // Mock transcription & categorization
                 let transcript = "";
                 
                 if (msg["Media Type"] === "VIDEO") {
                    mediaType = "video";
                    transcript = "video content detected";
                 }
                 if (msg["Media Type"] === "AUDIO") {
                    mediaType = "audio";
                    transcript = "Audio note transcribed: Hey how are you doing?"; // mock transcription
                 }
                 
                 chatHistory.push({
                   friend,
                   type: mediaType,
                   content,
                   time: msg["Created"] || "",
                   date: (msg["Created"] || "").split(" ")[0] || "Unknown Date",
                   transcript
                 });

                 mediaItems.push({
                   fileName: `media_${msg["Created"]?.replace(/[:\s]/g, '_') || 'unknown'}`,
                   chatSource: friend,
                   date: (msg["Created"] || "").split(" ")[0] || "Unknown Date",
                   type: mediaType,
                   transcript
                 });
               } else {
                 chatHistory.push({
                   friend,
                   type: "text",
                   content: msg["Text"] || "Message",
                   time: msg["Created"] || "",
                   date: (msg["Created"] || "").split(" ")[0] || "Unknown Date"
                 });
               }
             });
           };
           
           processChats(json["Saved Chat History"], 'sent');
           processChats(json["Received Saved Chat History"], 'received');
        } catch (e) {}
      }

      if (snapHistoryFile) {
        const text = await snapHistoryFile.async("text");
        try {
           const json = JSON.parse(text);
           const processSnaps = (arr: any[], type: 'sent' | 'received') => {
             if (!arr) return;
             arr.forEach(snap => {
               const friend = snap["To"] || snap["From"] || "Unknown";
               friendCounts[friend] = (friendCounts[friend] || 0) + 1;
               chatHistory.push({
                 friend,
                 type: "snap",
                 content: type === 'sent' ? "Snap sent (unsaved)" : "Snap received (unsaved)",
                 time: snap["Created"] || "",
                 date: (snap["Created"] || "").split(" ")[0] || "Unknown Date",
                 unsaved: true
               });
             });
           };
           processSnaps(json["Sent Snap History"], 'sent');
           processSnaps(json["Received Snap History"], 'received');
        } catch (e) {}
      }

      // Identify Top Friend
      let topFriend = "None";
      let maxCount = 0;
      for (const [friend, count] of Object.entries(friendCounts)) {
        if (count > maxCount) {
          maxCount = count;
          topFriend = friend;
        }
      }
      parsedData.topFriend = topFriend;

      // Group chats by friend
      const groupedChats: Record<string, any[]> = {};
      chatHistory.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()).forEach(msg => {
         if (!groupedChats[msg.friend]) groupedChats[msg.friend] = [];
         groupedChats[msg.friend].push({
           id: Math.random().toString(36).substr(2, 9),
           type: msg.type,
           content: msg.content,
           time: new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
           date: msg.date,
           unsaved: msg.unsaved,
           transcript: msg.transcript
         });
      });

      parsedData.chats = Object.entries(groupedChats).map(([user, messages], idx) => ({
         id: idx + 1,
         user,
         messages,
         time: messages[messages.length - 1]?.time || "",
         unread: false
      })).sort((a, b) => b.messages.length - a.messages.length).slice(0, 20); // Top 20 chats

      // Media Deduplication & Thumbnail filtering
      // Since we don't have real files loaded into memory, we simulate finding them in zip
      const mediaFiles = Object.keys(contents.files).filter(k => k.match(/media\/.*\.(mp4|jpg|jpeg|png)$/i));
      let processedMedia: any[] = [];
      const seenBaseNames = new Set<string>();

      // We need to group by base name to find the highest quality version if there are multiple
      const mediaGroups: Record<string, string[]> = {};
      mediaFiles.forEach(path => {
        const fileName = path.split('/').pop() || "";
        if (fileName.toLowerCase().includes('thumbnail')) return;

        const baseName = fileName.split('.')[0].replace(/(_\d+x\d+)/, ''); // Remove resolution tags if any
        if (!mediaGroups[baseName]) {
            mediaGroups[baseName] = [];
        }
        mediaGroups[baseName].push(path);
      });

      Object.entries(mediaGroups).forEach(([baseName, paths]) => {
          // Sort paths to try and get the highest quality (e.g. longest path or largest resolution tag)
          paths.sort((a, b) => b.length - a.length);
          const path = paths[0]; // Take the "highest quality" one
          const fileName = path.split('/').pop() || "";
          
          let type = fileName.endsWith('.mp4') ? 'video' : 'image';
          let transcript = "";
        
        // Mock Audio Detection (MP4 without video track)
        // In a real app we'd need to parse MP4 atoms. Here we mock it by path or randomly.
        if (path.toLowerCase().includes('audio') || path.toLowerCase().includes('voice')) {
           type = 'audio';
           fileName.replace('.mp4', '.wav'); // Mock wav conversion
           transcript = "Mock transcription: This is a voice note.";
        }

        if (type === 'image') transcript = "Mock image category: outdoor, selfie";
        if (type === 'video') transcript = "Mock video category: movement, friends";

        processedMedia.push({
           id: Math.random().toString(36).substr(2, 9),
           fileName,
           type,
           date: "From Export",
           chatSource: "Exported Media",
           transcript,
           path
        });
      });

      // Merge metadata media and file media
      parsedData.media = [...mediaItems, ...processedMedia].slice(0, 50); // Limit for mockup

      setTimeout(() => {
        setIsUploading(false);
        onUpload(parsedData);
      }, 1500);

    } catch (err) {
      console.error(err);
      setError("Failed to parse the zip file. Ensure it is a valid Snapchat data export.");
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        <div className="space-y-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-4 bloom-effect"
          >
            <ShieldCheck className="w-8 h-8" />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold text-white">
            Uncover Your <br />
            <span className="text-primary bloom-text">Snapchat Reality</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto">
            Securely visualize your Snapchat data export. We process everything locally in your browser—your data never leaves your device.
          </p>
        </div>

        <input 
          type="file" 
          accept=".zip" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileSelect}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className={`glass-panel rounded-3xl p-12 mt-12 transition-all duration-300 border-2 border-dashed ${
            isDragging ? "border-primary bg-primary/5" : error ? "border-destructive bg-destructive/5" : "border-white/10 hover:border-white/30"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Decrypting Reality...</h3>
                <p className="text-muted-foreground">Parsing your memories, chats, and metadata.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-6 cursor-pointer">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${error ? 'bg-destructive/10 text-destructive' : 'bg-white/5 text-muted-foreground group-hover:bg-primary/20'}`}>
                <UploadCloud className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">{error ? "Upload Failed" : "Drop your export .zip here"}</h3>
                <p className={`text-sm ${error ? "text-destructive" : "text-muted-foreground"}`}>
                  {error || "Or click to browse files"}
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground/60 bg-white/5 px-4 py-2 rounded-full">
                <FileJson className="w-4 h-4" />
                <span>Requires mydata_~.zip format</span>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-8 text-left bg-black/40 p-6 rounded-2xl border border-white/5 mt-8 inline-block max-w-lg mx-auto"
        >
           <h4 className="font-semibold mb-2 flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary"/> How do I get my data?</h4>
           <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
             <li>Go to <a href="https://accounts.snapchat.com/accounts/downloadmydata" target="_blank" rel="noreferrer" className="text-primary hover:underline">accounts.snapchat.com/accounts/downloadmydata</a></li>
             <li>Check <strong>every box</strong> (make sure they are all green).</li>
             <li>Set the timeframe to <strong>Off</strong> (to download all history).</li>
             <li>Submit the request and wait for the email with your .zip file.</li>
           </ol>
        </motion.div>
      </motion.div>
    </div>
  );
}

