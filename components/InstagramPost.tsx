import { faCode, faGamepad, faStar, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface InstagramPostProps {
  title?: string;
  subtitle?: string;
  description?: string;
  logo?: string;
  features?: string[];
  theme?: "default" | "gaming" | "community" | "developer";
  size?: "small" | "medium" | "large";
}

export default function InstagramPost({
  title = "Croissant",
  subtitle = "Gaming Platform",
  description = "Un système d'inventaire créatif et réutilisable, open source, évolutif, API à gogo et technologie réseau au top",
  logo = "🥐",
  features = ["Gaming", "Trading", "API", "Open Source"],
  theme = "default",
  size = "medium"
}: InstagramPostProps) {
  
  
  const themeConfig = {
    default: {
      bgGradient: "from-neon-blue via-neon-purple to-neon-pink",
      accentColor: "var(--neon-blue)",
      icon: faGamepad
    },
    gaming: {
      bgGradient: "from-neon-green via-neon-blue to-neon-purple",
      accentColor: "var(--neon-green)",
      icon: faGamepad
    },
    community: {
      bgGradient: "from-neon-pink via-neon-purple to-neon-blue",
      accentColor: "var(--neon-pink)",
      icon: faUsers
    },
    developer: {
      bgGradient: "from-neon-purple via-neon-blue to-neon-green",
      accentColor: "var(--neon-purple)",
      icon: faCode
    }
  };

  
  const sizeConfig = {
    small: {
      container: "w-80 h-80",
      titleSize: "text-2xl",
      subtitleSize: "text-sm",
      descriptionSize: "text-xs",
      logoSize: "text-4xl",
      padding: "p-4",
      gap: "gap-2"
    },
    medium: {
      container: "w-96 h-96",
      titleSize: "text-3xl",
      subtitleSize: "text-base",
      descriptionSize: "text-sm",
      logoSize: "text-5xl",
      padding: "p-6",
      gap: "gap-3"
    },
    large: {
      container: "w-[500px] h-[500px]",
      titleSize: "text-4xl",
      subtitleSize: "text-lg",
      descriptionSize: "text-base",
      logoSize: "text-6xl",
      padding: "p-8",
      gap: "gap-4"
    }
  };

  const currentTheme = themeConfig[theme];
  const currentSize = sizeConfig[size];

  return (
    <div className={`${currentSize.container} relative overflow-hidden rounded-3xl bg-gradient-to-br ${currentTheme.bgGradient} p-1`}>
      
      <div className="w-full h-full rounded-[22px] glass-card relative overflow-hidden">
        
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-white/10 blur-xl"></div>
          <div className="absolute bottom-8 left-8 w-24 h-24 rounded-full bg-white/5 blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-8 h-8 rounded-full bg-white/15 blur-lg"></div>
        </div>

        
        <div className={`relative z-10 h-full flex flex-col justify-between ${currentSize.padding}`}>
          
          
          <div className={`flex items-center justify-between ${currentSize.gap}`}>
            <div className="flex items-center gap-3">
              <div className={`${currentSize.logoSize} flex items-center justify-center w-16 h-16 rounded-2xl glass-card glass-glow`}>
                {logo}
              </div>
              <div>
                <h1 className={`${currentSize.titleSize} font-bold text-glass-text`}>
                  {title}
                </h1>
                <p className={`${currentSize.subtitleSize} text-glass-text-secondary`}>
                  {subtitle}
                </p>
              </div>
            </div>
            <FontAwesomeIcon 
              icon={currentTheme.icon} 
              className="text-2xl opacity-30"
              style={{ color: currentTheme.accentColor }}
            />
          </div>

          
          <div className="flex-1 flex items-center justify-center text-center">
            <p className={`${currentSize.descriptionSize} text-glass-text leading-relaxed max-w-[80%]`}>
              {description}
            </p>
          </div>

          
          <div className="flex flex-wrap justify-center gap-2">
            {features.map((feature, index) => (
              <span
                key={index}
                className={`px-3 py-1 ${size === 'small' ? 'text-xs' : 'text-sm'} font-medium rounded-full glass-card text-glass-text border border-white/20`}
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.accentColor}20 0%, ${currentTheme.accentColor}10 100%)`
                }}
              >
                {feature}
              </span>
            ))}
          </div>

          
          <div className="flex justify-center items-center gap-2 mt-4">
            {[...Array(5)].map((_, i) => (
              <FontAwesomeIcon
                key={i}
                icon={faStar}
                className={`${size === 'small' ? 'text-xs' : 'text-sm'} opacity-60`}
                style={{ color: currentTheme.accentColor }}
              />
            ))}
          </div>
        </div>

        
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}

