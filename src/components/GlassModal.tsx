import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function GlassModal({ isOpen, onClose, children, className = '' }: GlassModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl ${className}`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 rounded-full flex items-center justify-center text-white transition-colors duration-200 z-10"
        >
          <X size={16} />
        </button>
        
        {children}
      </div>
    </div>
  );
}