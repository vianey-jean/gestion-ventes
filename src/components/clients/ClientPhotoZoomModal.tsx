import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientPhotoZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  clientName: string;
}

const ClientPhotoZoomModal: React.FC<ClientPhotoZoomModalProps> = ({
  isOpen, onClose, photoUrl, clientName
}) => {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl p-0 bg-black/95 border-white/10 rounded-2xl overflow-hidden">
        <div className="relative flex flex-col items-center">
          {/* Header */}
          <div className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white truncate">{clientName}</h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleZoomOut} className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs text-white/50 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="sm" onClick={handleZoomIn} className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="w-full overflow-auto max-h-[70vh] flex items-center justify-center p-4" style={{ cursor: zoom > 1 ? 'grab' : 'default' }}>
            <img
              src={photoUrl}
              alt={clientName}
              className="rounded-xl transition-transform duration-300 max-w-full"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
              draggable={false}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientPhotoZoomModal;
