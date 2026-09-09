/**
 * SafeImage — Image tolérante aux photos manquantes.
 *
 * Si le fichier n'existe plus sur le serveur (404 / erreur réseau), on
 * n'affiche AUCUNE erreur : on remplace simplement l'image par un
 * emplacement discret invitant à ajouter une photo.
 */
import React, { useEffect, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Contenu affiché si la photo est absente ou illisible. */
  fallback?: React.ReactNode;
  /** Classe appliquée au conteneur de repli. */
  fallbackClassName?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = '',
  className,
  fallback,
  fallbackClassName,
  ...rest
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => { setFailed(false); }, [src]);

  if (!src || failed) {
    return (
      <div
        className={cn(
          'w-full h-full flex flex-col items-center justify-center gap-1 bg-muted/40 text-muted-foreground select-none',
          fallbackClassName,
          className
        )}
        aria-label="Photo à ajouter"
      >
        {fallback ?? <ImagePlus className="h-5 w-5 opacity-60" />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      {...rest}
    />
  );
};

export default SafeImage;
