"use client"

import { ArrowLeft, Share2, Heart, MapPin, Clock, Users, Star, Calendar, MessageCircle, ChevronRight } from "lucide-react"

interface EventDetailsProps {
  onBack?: () => void
}

export function EventDetails({ onBack }: EventDetailsProps) {
  const playerSlots = [
    { filled: true, name: "Marcus R.", avatar: "MR" },
    { filled: true, name: "Jamie K.", avatar: "JK" },
    { filled: true, name: "Alex M.", avatar: "AM" },
    { filled: true, name: "Chris T.", avatar: "CT" },
    { filled: false, name: "Open Spot", avatar: null },
  ]
  
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0d0d0d]/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-[#1f1f1f] rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          <h1 className="font-semibold text-white">Event Details</h1>
          
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-[#1f1f1f] rounded-full transition-colors">
              <Heart className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-[#1f1f1f] rounded-full transition-colors">
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>
      
      <div className="pb-32">
        {/* Hero Section */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] relative overflow-hidden">
            {/* Football field pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 border-2 border-white/20 m-4 rounded" />
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 -translate-x-1/2" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white/20 rounded-full" />
            </div>
            
            {/* Sport icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl opacity-30">⚽</span>
            </div>
          </div>
          
          {/* Status badge */}
          <div className="absolute bottom-4 left-4">
            <span className="bg-[#C9F31D] text-black text-xs font-bold px-3 py-1 rounded-full">
              FILLING FAST
            </span>
          </div>
          
          {/* Expiry timer */}
          <div className="absolute bottom-4 right-4">
            <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#C9F31D]" />
              <span className="text-white text-xs font-medium">3h 25m left</span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-4 pt-4">
          {/* Title & Host */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              MR
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">5 a Side Football</h2>
              <p className="text-muted-foreground text-sm">
                Hosted by <span className="text-white">Marcus Reid</span>
              </p>
            </div>
          </div>
          
          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-[#1a1a1a] rounded-xl p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide">When</span>
              </div>
              <p className="text-white font-semibold">Tonight</p>
              <p className="text-muted-foreground text-sm">7:00 PM</p>
            </div>
            
            <div className="bg-[#1a1a1a] rounded-xl p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide">Where</span>
              </div>
              <p className="text-white font-semibold">Glasgow Green</p>
              <p className="text-muted-foreground text-sm">Football Centre</p>
            </div>
            
            <div className="bg-[#1a1a1a] rounded-xl p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide">Spots</span>
              </div>
              <p className="text-white font-semibold">1 of 5</p>
              <p className="text-[#C9F31D] text-sm">1 spot left</p>
            </div>
            
            <div className="bg-[#1a1a1a] rounded-xl p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Star className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide">Level</span>
              </div>
              <p className="text-white font-semibold">All Levels</p>
              <p className="text-muted-foreground text-sm">Casual game</p>
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-2">About this game</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Need 1 more for 5 a side tonight at 7 PM. Glasgow Green Football Centre. 
              All levels welcome, just bring good vibes. We usually play for about an hour, 
              nice and relaxed. Bring water and wear astro boots if you have them.
            </p>
          </div>
          
          {/* Player Slots */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Players ({playerSlots.filter(s => s.filled).length}/{playerSlots.length})</h3>
              <button className="text-[#C9F31D] text-sm font-medium flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {playerSlots.map((slot, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold transition-all
                      ${slot.filled 
                        ? "bg-[#2a2a2a] text-white border-2 border-[#C9F31D]" 
                        : "bg-transparent border-2 border-dashed border-muted-foreground"
                      }
                    `}
                  >
                    {slot.filled ? slot.avatar : (
                      <span className="text-2xl text-muted-foreground">+</span>
                    )}
                  </div>
                  <span className={`text-xs ${slot.filled ? "text-white" : "text-muted-foreground"}`}>
                    {slot.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Location Map Placeholder */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Location</h3>
            <div className="bg-[#1a1a1a] rounded-xl overflow-hidden">
              <div className="h-32 bg-[#1f1f1f] relative flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-[#C9F31D] mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Glasgow Green Football Centre</p>
                </div>
              </div>
              <button className="w-full py-3 text-[#C9F31D] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#1f1f1f] transition-colors">
                <MapPin className="w-4 h-4" />
                Get Directions
              </button>
            </div>
          </div>
          
          {/* Host Info */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">About the host</h3>
            <div className="bg-[#1a1a1a] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white font-bold">
                  MR
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">Marcus Reid</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>⚽ 24 games hosted</span>
                    <span>⭐ 4.8 rating</span>
                  </div>
                </div>
                <button className="p-2 hover:bg-[#2a2a2a] rounded-full transition-colors">
                  <MessageCircle className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-border p-4 pb-8">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-white font-semibold">1 spot left</p>
            <p className="text-muted-foreground text-sm">Expires in 3h 25m</p>
          </div>
          <button className="bg-[#C9F31D] text-black px-8 py-3 rounded-full font-bold text-base hover:bg-[#d4f73a] active:scale-95 transition-all">
            👋 {"I'm In"}
          </button>
        </div>
      </div>
    </div>
  )
}
