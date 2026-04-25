import React from 'react';
import { motion } from 'motion/react';
import { Play, MessageCircle, ExternalLink, Mail, Calendar, Youtube, Search, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ActionCardProps {
  type: 'youtube' | 'whatsapp' | 'email' | 'calendar' | 'search';
  data: any;
  onAction?: (action: string, payload?: any) => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ type, data, onAction }) => {
  if (type === 'youtube') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 border border-red-900/30 rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-xl max-w-[280px] sm:max-w-sm w-full mt-2 sm:mt-3"
      >
        <div className="relative aspect-video group">
          <img src={data.thumbnail} alt={data.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="icon" 
              variant="destructive" 
              className="rounded-full w-10 h-10 sm:w-12 sm:h-12 shadow-lg shadow-red-600/20"
              onClick={() => onAction?.('play', data)}
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </Button>
          </div>
          {data.duration && (
            <span className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-black/80 px-1 py-0.5 rounded text-[8px] sm:text-[10px] font-mono text-white">
              {data.duration}
            </span>
          )}
        </div>
        <div className="p-2 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-xs sm:text-sm text-slate-100 line-clamp-1">{data.title}</h4>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 line-clamp-1">{data.channel}</p>
            </div>
            <Youtube className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 shrink-0" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (type === 'whatsapp') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-950/20 border border-green-500/30 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4 max-w-[280px] sm:max-w-sm w-full backdrop-blur-sm mt-2 sm:mt-3"
      >
        <div className="bg-green-500/20 p-2 sm:p-3 rounded-lg sm:rounded-xl">
          <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] sm:text-xs text-green-300 font-medium uppercase tracking-wider">WhatsApp</p>
          <h4 className="text-xs sm:text-sm text-white font-medium mt-0.5 truncate">{data.title || 'Message'}</h4>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 sm:h-9 text-[10px] sm:text-xs border-green-500/30 text-green-400 hover:bg-green-500/10"
          onClick={() => onAction?.('open', data)}
        >
          Open
        </Button>
      </motion.div>
    );
  }

  if (type === 'email') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-blue-950/20 border border-blue-500/30 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4 max-w-[280px] sm:max-w-sm w-full backdrop-blur-sm mt-2 sm:mt-3"
      >
        <div className="bg-blue-500/20 p-2 sm:p-3 rounded-lg sm:rounded-xl">
          <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] sm:text-xs text-blue-300 font-medium uppercase tracking-wider">Email</p>
          <h4 className="text-xs sm:text-sm text-white font-medium mt-0.5 truncate">{data.subject || 'Draft'}</h4>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 sm:h-9 text-[10px] sm:text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          onClick={() => onAction?.('open', data)}
        >
          Draft
        </Button>
      </motion.div>
    );
  }

  if (type === 'search') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-slate-900/40 border border-slate-700/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl max-w-md w-full backdrop-blur-xl mt-2 sm:mt-3 hover:border-cyan-500/30 transition-colors"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="bg-cyan-500/10 p-2 sm:p-2.5 rounded-lg sm:rounded-xl mt-0.5">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">{data.title}</h4>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{data.snippet}</p>
            <button 
              onClick={() => onAction?.('open', data)}
              className="text-[9px] sm:text-[10px] text-cyan-500 font-mono mt-2 uppercase tracking-widest flex items-center gap-1 hover:text-cyan-400"
            >
              Link Established <ExternalLink className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};
