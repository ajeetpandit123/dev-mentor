import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-4">
      <div className="relative mb-8">
        <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-xl font-bold animate-pulse tracking-tight">Initializing DevIntel</h2>
        <p className="text-muted-foreground text-sm font-medium">Securing your mentorship session...</p>
      </div>

      <div className="mt-12 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div 
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
