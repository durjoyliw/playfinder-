"use client"

export function LiveActivityBar() {
  return (
    <div className="px-4 py-2 bg-[#0d0d0d]">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {/* Pulsing green dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9F31D] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C9F31D]"></span>
        </span>
        
        <span>
          Active right now in Glasgow · <span className="text-white font-medium">14 players</span>
        </span>
      </div>
    </div>
  )
}
