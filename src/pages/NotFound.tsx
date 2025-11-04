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
      {/* Fond néon animé */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,0,120,0.15),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(0,120,255,0.15),transparent_70%)] animate-gradientShift"></div>

      {/* Halo central */}
      <div className="absolute w-[700px] h-[700px] bg-gradient-to-tr from-fuchsia-600/40 via-purple-500/30 to-indigo-600/40 blur-3xl rounded-full opacity-40 animate-pulseGlow"></div>

      {/* Particules lumineuses */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <span
            key={i}
            className="absolute block rounded-full bg-gradient-to-br from-fuchsia-400/70 to-purple-600/50 blur-[2px] animate-particle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 3}px`,
              height: `${Math.random() * 6 + 3}px`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          ></span>
        ))}
      </div>

      <div className="relative z-10 text-center px-6">
        {/* 404 avec effet 3D, rotation & rebond */}
        <h1 className="text-[8rem] md:text-[12rem] font-black tracking-widest bg-gradient-to-br from-fuchsia-300 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_8px_40px_rgba(255,100,200,0.6)] [text-shadow:_0_4px_12px_rgba(255,0,150,0.6),_0_8px_50px_rgba(255,100,255,0.3)] animate-rotateAndBounce select-none mb-8">
          404
        </h1>

        <h2 className="text-3xl font-bold  text-red-500 mb-3 animate-fadeIn">
          Page introuvable
        </h2>

        <p className="text-neutral-500 font-bold max-w-md mx-auto mb-10 leading-relaxed animate-fadeInDelay">
          Oups… Il semble que cette page se soit perdue dans la Nature.
        </p>

        <a
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 transition-all duration-500 shadow-lg shadow-purple-800/40 hover:shadow-purple-700/60 text-white font-medium backdrop-blur-sm animate-buttonFloat"
        >
          ⟵ Retour à l’accueil
        </a>
      </div>
    </div>
  );
};

export default NotFound;
