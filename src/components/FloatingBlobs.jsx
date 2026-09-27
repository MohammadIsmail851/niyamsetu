export const FloatingBlobs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {/* Floating light blob 1 - Top Left Blue */}
    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-400/15 dark:bg-blue-600/25 blur-[100px] animate-blob-1 transition-colors duration-500" />
    
    {/* Floating light blob 2 - Center Right Royal Indigo */}
    <div className="absolute top-1/4 -right-24 w-88 h-88 rounded-full bg-sky-400/15 dark:bg-indigo-500/20 blur-[90px] animate-blob-2 transition-colors duration-500" />
    
    {/* Floating light blob 3 - Bottom Left Cyan Azure */}
    <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-blue-300/15 dark:bg-cyan-500/20 blur-[100px] animate-blob-3 transition-colors duration-500" />
    
    {/* Floating light blob 4 - Bottom Right Navy/Blue Accent */}
    <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-indigo-300/10 dark:bg-blue-400/15 blur-[90px] animate-blob-1 transition-colors duration-500" />
  </div>
);

export default FloatingBlobs;
