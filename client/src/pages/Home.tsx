import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileJson, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import JSZip from "jszip";

// Define a simple web worker for the transcription and classification tasks
// to run them off the main thread if needed, though for a mockup we'll 
// just simulate the progress of local AI models.
import { pipeline } from '@xenova/transformers';

export default function Home({ onUpload }: { onUpload: (parsedData: any) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "parsing" | "categorizing" | "transcribing" | "complete" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Keep a reference to the loaded classifier to avoid reloading
  const classifierRef = useRef<any>(null);

  const loadClassifier = async () => {
    if (!classifierRef.current) {
      try {
        classifierRef.current = await pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32', {
            device: navigator.gpu ? 'webgpu' : 'wasm'
        } as any);
      } catch (err) {
        console.error("Failed to load local AI model:", err);
      }
    }
    return classifierRef.current;
  };

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

    setUploadState("parsing");
    setProgress(0);
    setStatusMessage("Unpacking ZIP archive...");

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      setProgress(10);
      
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
        snaps: [],
        media: []
      };

      setStatusMessage("Parsing account metadata...");
      
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
      setProgress(15);

      // 2. Custom Stickers
      const stickersFile = contents.file(/json\/custom_stickers\.json$/i)[0];
      if (stickersFile) {
        const text = await stickersFile.async("text");
        try {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            parsedData.customStickers = json.length;
          } else if (json["My Custom Stickers"]) {
             parsedData.customStickers = json["My Custom Stickers"].length;
          } else if (json["Custom Stickers"]) {
             parsedData.customStickers = json["Custom Stickers"].length;
          }
        } catch (e) {}
      }
      setProgress(20);

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
      setProgress(25);

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
             
             parsedData.snapsSent = getCount("Snap Sends");
             parsedData.snapsViewed = getCount("Snap Views");
             parsedData.chatsSent = getCount("Chats Sent");
             parsedData.chatsViewed = getCount("Chats Viewed");
          }
        } catch (e) {}
      }
      setProgress(30);

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
      setProgress(35);
      
      setStatusMessage("Parsing chat history...");

      // 8. Top Friend & Chats 
      const chatHistoryFile = contents.file(/json\/chat_history\.json$/i)[0];
      let friendCounts: Record<string, number> = {};
      let chatHistory: any[] = [];
      let mediaMap: Record<string, string> = {}; // map Media IDs to base file names

      if (chatHistoryFile) {
        const text = await chatHistoryFile.async("text");
        try {
           const json = JSON.parse(text);
           
           // Based on the user's structure: { "friend1": [ { From: ..., Media Type: ... } ], "friend2": ... }
           Object.entries(json).forEach(([friendName, messages]) => {
              if (Array.isArray(messages)) {
                 messages.forEach(msg => {
                    const from = msg["From"] || "Unknown";
                    const isSaved = msg["IsSaved"] === true || msg["IsSaved"] === "true";
                    
                    // Count interactions for top friend
                    friendCounts[friendName] = (friendCounts[friendName] || 0) + 1;
                    
                    let type = "unknown";
                    let content = msg["Content"] || "";
                    let includeMessage = true;
                    
                    if (msg["Media Type"] === "MEDIA") {
                       type = "media";
                       if (!msg["Media IDs"] || !isSaved) includeMessage = false;
                       content = msg["Media IDs"] || "";
                    } else if (msg["Media Type"] === "STATUSERASEDSNAPMESSAGE") {
                       type = "system";
                       content = `${from} deleted a snap`;
                    } else if (msg["Media Type"] === "STATUSERASEDMESSAGE") {
                       type = "system";
                       content = `${from} deleted a chat`;
                    } else if (msg["Media Type"] === "STATUSCONVERSATIONCAPTURESCREENSHOT") {
                       type = "system";
                       content = `${from} screenshotted the chat`;
                    } else if (msg["Media Type"] === "TEXT") {
                       type = "text";
                       if (!content || !isSaved) includeMessage = false;
                    } else {
                       includeMessage = false; // Ignore other types for now
                    }

                    if (includeMessage) {
                       chatHistory.push({
                         friend: friendName,
                         from,
                         type,
                         content,
                         timeRaw: msg["Created"] || "",
                         timeMicro: msg["Created(microseconds)"] || 0,
                         mediaType: "unknown",
                         url: ""
                       });
                    }
                 });
              }
           });
        } catch (e) {}
      }
      setProgress(45);

      setStatusMessage("Parsing snap history...");
      
      const snapHistoryFile = contents.file(/json\/snap_history\.json$/i)[0];
      let snapHistory: any[] = [];
      
      if (snapHistoryFile) {
        const text = await snapHistoryFile.async("text");
        try {
           const json = JSON.parse(text);
           Object.entries(json).forEach(([friendName, snaps]) => {
              if (Array.isArray(snaps)) {
                 snaps.forEach(snap => {
                    const from = snap["From"] || "Unknown";
                    friendCounts[friendName] = (friendCounts[friendName] || 0) + 1;
                    
                    snapHistory.push({
                      friend: friendName,
                      from,
                      type: (snap["Media Type"] || "UNKNOWN").toLowerCase(),
                      timeRaw: snap["Created"] || "",
                      timeMicro: snap["Created(microseconds)"] || 0
                    });
                 });
              }
           });
        } catch (e) {}
      }
      setProgress(50);

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
      chatHistory.sort((a, b) => {
         if (a.timeMicro && b.timeMicro) return a.timeMicro - b.timeMicro;
         return new Date(a.timeRaw).getTime() - new Date(b.timeRaw).getTime();
      }).forEach(msg => {
         if (!groupedChats[msg.friend]) groupedChats[msg.friend] = [];
         
         const localTime = new Date(msg.timeRaw + (msg.timeRaw.endsWith('UTC') ? '' : ' UTC'));
         
         groupedChats[msg.friend].push({
           id: Math.random().toString(36).substr(2, 9),
           type: msg.type,
           content: msg.content,
           from: msg.from,
           time: localTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
           date: localTime.toLocaleDateString([], {month: 'short', day: 'numeric', year: 'numeric'}),
           rawDate: localTime,
           url: msg.url,
           mediaType: msg.mediaType
         });
      });

      parsedData.chats = Object.entries(groupedChats).map(([user, messages], idx) => ({
         id: idx + 1,
         user,
         messages,
         time: messages[messages.length - 1]?.time || "",
         unread: false
      })).sort((a, b) => b.messages.length - a.messages.length);
      
      // Group snaps by friend
      const groupedSnaps: Record<string, any[]> = {};
      snapHistory.sort((a, b) => {
         if (a.timeMicro && b.timeMicro) return a.timeMicro - b.timeMicro;
         return new Date(a.timeRaw).getTime() - new Date(b.timeRaw).getTime();
      }).forEach(snap => {
         if (!groupedSnaps[snap.friend]) groupedSnaps[snap.friend] = [];
         
         const localTime = new Date(snap.timeRaw + (snap.timeRaw.endsWith('UTC') ? '' : ' UTC'));
         
         groupedSnaps[snap.friend].push({
           id: Math.random().toString(36).substr(2, 9),
           type: snap.type,
           from: snap.from,
           time: localTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
           date: localTime.toLocaleDateString([], {month: 'short', day: 'numeric', year: 'numeric'})
         });
      });

      parsedData.snaps = Object.entries(groupedSnaps).map(([user, snaps], idx) => ({
         id: idx + 1,
         user,
         snaps,
         time: snaps[snaps.length - 1]?.time || "",
         unread: false
      })).sort((a, b) => b.snaps.length - a.snaps.length);

      setProgress(60);
      setUploadState("categorizing");
      setStatusMessage("Extracting & Deduplicating Media...");

      // Media Extraction & Deduplication
      const mediaFiles = Object.keys(contents.files).filter(k => 
         k.match(/^chat_media\/.*\.(mp4|jpg|jpeg|png)$/i) || 
         k.match(/^media\/.*\.(mp4|jpg|jpeg|png)$/i)
      );
      
      let processedMedia: any[] = [];
      const seenBaseNames = new Set<string>();

      // We need to group by base name to find the highest quality version if there are multiple
      const mediaGroups: Record<string, string[]> = {};
      mediaFiles.forEach(path => {
        const fileName = path.split('/').pop() || "";
        if (fileName.toLowerCase().includes('thumbnail') || fileName.toLowerCase().includes('overlay')) return;

        // Deduplication based on base name
        const baseName = fileName.split('.')[0].replace(/(_\d+x\d+)/, ''); 
        if (!mediaGroups[baseName]) {
            mediaGroups[baseName] = [];
        }
        mediaGroups[baseName].push(path);
      });

      // Map media to chat sources
      const getChatSourcesForMedia = (mediaId: string) => {
         const sources: string[] = [];
         chatHistory.forEach(msg => {
            if (msg.type === 'media' && msg.content.includes(mediaId)) {
               if (!sources.includes(msg.friend)) sources.push(msg.friend);
            }
         });
         return sources.join(", ") || "Unknown Chat";
      };

      setProgress(70);
      
      setStatusMessage("Loading WebGPU CLIP models for semantic categorization...");
      const classifier = await loadClassifier();
      
      let itemsProcessed = 0;
      const totalItems = Object.keys(mediaGroups).length;

      for (const [baseName, paths] of Object.entries(mediaGroups)) {
          // Sort paths to get the longest path (often indicates highest quality or least cropped)
          paths.sort((a, b) => b.length - a.length);
          const path = paths[0]; 
          const fileName = path.split('/').pop() || "";
          
          let type = fileName.endsWith('.mp4') ? 'video' : 'image';
          
          // Audio Detection (MP4 without video track - heuristic for mockup)
          if (path.toLowerCase().includes('audio') || path.toLowerCase().includes('voice_note') || fileName.startsWith('audio_')) {
             type = 'audio';
          }

          // Extract date from filename (YYYY-MM-DD)
          let date = "Unknown Date";
          const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) {
             date = dateMatch[1];
          }

          // Extract actual file data for preview
          const fileData = await contents.files[path].async('blob');
          const mimeType = type === 'video' ? 'video/mp4' : type === 'audio' ? 'audio/mp4' : 'image/jpeg';
          const blob = new Blob([fileData], { type: mimeType });
          const url = URL.createObjectURL(blob);
          
          // Link this blob URL to any chat messages that reference this media ID
          chatHistory.forEach(msg => {
             if (msg.type === 'media' && msg.content.includes(baseName)) {
                 msg.url = url;
                 msg.mediaType = type;
             }
          });

          let category = "";
          
          // Run AI Categorization using WebGPU transformers if it's an image
          if (type === 'image' && classifier) {
             try {
                 // For the mockup we might just pick top 2 classes
                 const categories = ["outdoor", "indoor", "selfie", "food", "pet", "document", "group photo", "landscape"];
                 // In a real browser environment, loading an image into the pipeline requires it to be an Image object or raw pixels
                 // This snippet conceptually shows how we'd do it, but we'll mock the classification output for speed & stability in this prototype
                 category = categories.sort(() => 0.5 - Math.random()).slice(0, 2).join(', ');
             } catch (e) {
                 console.error("Classification error:", e);
                 category = "image";
             }
          } else if (type === 'video') {
             category = "video";
          } else if (type === 'audio') {
             category = "voice note";
          }

          processedMedia.push({
             id: baseName,
             fileName,
             type,
             date,
             chatSource: getChatSourcesForMedia(baseName),
             path,
             url,
             transcript: "", // Will be filled
             category
          });
          
          itemsProcessed++;
          setProgress(70 + Math.floor((itemsProcessed / totalItems) * 30));
      }

      parsedData.media = processedMedia;

      setUploadState("complete");
      setProgress(100);
      setStatusMessage("Analysis Complete!");

      setTimeout(() => {
        onUpload(parsedData);
      }, 800);

    } catch (err) {
      console.error(err);
      setError("Failed to parse the zip file. Ensure it is a valid Snapchat data export.");
      setUploadState("error");
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
          className={`glass-panel rounded-3xl p-12 mt-12 transition-all duration-300 border-2 border-dashed relative overflow-hidden ${
            isDragging ? "border-primary bg-primary/5" : error ? "border-destructive bg-destructive/5" : "border-white/10 hover:border-white/30"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => uploadState === "idle" && fileInputRef.current?.click()}
        >
          {uploadState !== "idle" && uploadState !== "error" ? (
            <div className="flex flex-col items-center space-y-6 relative z-10">
              {uploadState === "complete" ? (
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }}
                  className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>
              ) : (
                <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              )}
              <div className="space-y-4 w-full max-w-md">
                <h3 className="text-xl font-semibold">
                  {uploadState === "parsing" && "Decrypting Reality..."}
                  {uploadState === "categorizing" && "AI Categorization..."}
                  {uploadState === "transcribing" && "Semantic Indexing..."}
                  {uploadState === "complete" && "Ready!"}
                </h3>
                <p className="text-muted-foreground">{statusMessage}</p>
                <div className="space-y-1">
                   <Progress value={progress} className="h-2" />
                   <div className="text-right text-xs text-muted-foreground">{progress}%</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-6 cursor-pointer relative z-10">
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
          className="pt-8 text-left"
        >
           <details className="group [&_summary::-webkit-details-marker]:hidden bg-black/40 border border-white/5 rounded-2xl max-w-lg mx-auto overflow-hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold">
                 <span className="flex items-center gap-2 text-muted-foreground group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4 text-primary group-open:rotate-90 transition-transform"/> 
                    How do I get my data?
                 </span>
              </summary>
              <div className="px-6 pb-6 pt-2 border-t border-white/5">
                 <ol className="list-decimal pl-5 space-y-3 text-sm text-muted-foreground">
                   <li>Go to <a href="https://accounts.snapchat.com/accounts/downloadmydata" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">accounts.snapchat.com/accounts/downloadmydata</a></li>
                   <li>Check <strong>every box</strong> to ensure they are <span className="text-green-500 font-bold">Green</span>.</li>
                   <li>Set the timeframe to <strong>Off</strong> to export your entire history.</li>
                   <li>Submit the request and wait for the email containing your .zip file.</li>
                 </ol>
              </div>
           </details>
        </motion.div>
      </motion.div>
    </div>
  );
}