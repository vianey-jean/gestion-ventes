import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFound = () => {
  const location = useLocation();
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    // Changer la clé pour relancer l’animation à chaque navigation
    setAnimationKey(Math.random());
  }, [location.pathname]);

  return (
    <div
      key={animationKey}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-black via-neutral-900 to-black text-white"
    >
      {/* Fond néon animé ultra-luxe */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,0,180,0.2),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(0,180,255,0.15),transparent_60%),radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_80%)] animate-gradientShift"></div>

      {/* Halo central premium */}
      <div className="absolute w-[800px] h-[800px] bg-gradient-to-tr from-fuchsia-600/50 via-purple-500/40 to-indigo-600/50 blur-4xl rounded-full opacity-50 animate-pulseGlow shadow-[0_0_200px_rgba(255,100,200,0.5)]"></div>

      {/* Particules lumineuses dynamiques */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <span
            key={i}
            className="absolute block rounded-full bg-gradient-to-br from-fuchsia-400/70 via-pink-500/60 to-purple-600/50 blur-[2px] animate-particle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 12}s`,
            }}
          ></span>
        ))}
      </div>

      <div className="relative z-10 text-center px-6">
        {/* 404 avec effet 3D, rotation & rebond ultra-luxe */}
        <h1 className="text-[8rem] md:text-[12rem] font-black tracking-widest bg-gradient-to-br from-fuchsia-300 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_12px_60px_rgba(255,80,200,0.8)] [text-shadow:_0_6px_18px_rgba(255,0,150,0.7),_0_12px_70px_rgba(255,100,255,0.4)] animate-rotateAndBounce select-none mb-8">
          404
        </h1>

        <h2 className="text-3xl md:text-4xl font-extrabold text-red-400 mb-3 animate-fadeIn drop-shadow-lg">
          Page introuvable
        </h2>

        <p className="text-neutral-400 font-bold max-w-md mx-auto mb-10 leading-relaxed animate-fadeInDelay drop-shadow-sm">
          Oups… Il semble que cette page se soit perdue dans la Nature.
        </p>

        <a
          href="/"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-purple-600 hover:from-fuchsia-400 hover:via-pink-400 hover:to-purple-500 transition-all duration-500 shadow-xl shadow-purple-800/50 hover:shadow-purple-700/70 text-white font-semibold backdrop-blur-md animate-buttonFloat hover:scale-105"
        >
          ⟵ Retour à l’accueil
        </a>
      </div>
    </div>
  );
};

export default NotFound;
