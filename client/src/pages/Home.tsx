import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileJson, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home({ onUpload }: { onUpload: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processUpload();
  };

  const processUpload = () => {
    setIsUploading(true);
    // Simulate parsing the zip file
    setTimeout(() => {
      setIsUploading(false);
      onUpload();
    }, 2000);
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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className={`glass-panel rounded-3xl p-12 mt-12 transition-all duration-300 border-2 border-dashed ${
            isDragging ? "border-primary bg-primary/5" : "border-white/10"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
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
            <div className="flex flex-col items-center space-y-6 cursor-pointer" onClick={processUpload}>
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <UploadCloud className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Drop your export .zip here</h3>
                <p className="text-muted-foreground">Or click to browse files</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground/60 bg-white/5 px-4 py-2 rounded-full">
                <FileJson className="w-4 h-4" />
                <span>mydata_~12345.zip</span>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-8"
        >
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-white"
            onClick={() => window.open('https://accounts.snapchat.com/accounts/downloadmydata', '_blank')}
          >
            How do I get my data? <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
