import { motion } from "framer-motion";

export function DynamicBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-background pointer-events-none">
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-background/80 z-10 mix-blend-multiply"></div>
      
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: ["-20%", "20%", "-20%"],
          y: ["-20%", "10%", "-20%"],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 left-0 w-[80vw] h-[80vh] rounded-full bg-primary/20 blur-[120px] mix-blend-screen"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.4, 0.2],
          x: ["20%", "-20%", "20%"],
          y: ["20%", "-10%", "20%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-0 right-0 w-[70vw] h-[70vh] rounded-full bg-accent/20 blur-[120px] mix-blend-screen"
      />

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 z-10 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
}
