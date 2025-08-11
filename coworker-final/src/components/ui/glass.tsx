import { cn } from '../../lib/utils'
import { useAppearance } from '../../contexts/AppearanceContext'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'subtle' | 'elevated' | 'minimal'
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  glow?: boolean
}

export function GlassCard({ 
  children, 
  className, 
  variant = 'default',
  blur = 'lg',
  border = true,
  shadow = 'md',
  glow = false
}: GlassCardProps) {
  const { getCurrentTheme } = useAppearance()
  const isDark = getCurrentTheme() === 'dark'
  
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  }

  const shadowClasses = {
    none: '',
    sm: isDark ? 'shadow-sm shadow-black/[0.02]' : 'shadow-sm shadow-black/[0.05]',
    md: isDark ? 'shadow-lg shadow-black/[0.04]' : 'shadow-lg shadow-black/[0.08]',
    lg: isDark ? 'shadow-xl shadow-black/[0.06]' : 'shadow-xl shadow-black/[0.12]',
    xl: isDark ? 'shadow-2xl shadow-black/[0.08]' : 'shadow-2xl shadow-black/[0.15]'
  }

  const variantClasses = {
    default: 'bg-[var(--glass-bg-primary)] border-[var(--glass-border-primary)]',
    subtle: 'bg-[var(--glass-bg-secondary)] border-[var(--glass-border-secondary)]',
    elevated: 'bg-[var(--glass-bg-elevated)] border-[var(--glass-border-elevated)]',
    minimal: 'bg-transparent border-[var(--glass-border-secondary)]'
  }

  return (
    <div
      className={cn(
        'rounded-2xl',
        blurClasses[blur],
        shadowClasses[shadow],
        variantClasses[variant],
        border && 'border',
        glow && (isDark ? 'ring-1 ring-white/[0.02]' : 'ring-1 ring-black/[0.05]'),
        'relative overflow-hidden',
        'transition-all duration-300 ease-out',
        isDark 
          ? 'hover:bg-white/[0.03] hover:border-white/[0.06] hover:shadow-xl hover:shadow-black/[0.05]'
          : 'hover:bg-white/[0.85] hover:border-black/[0.12] hover:shadow-xl hover:shadow-black/[0.1]',
        className
      )}
    >
      {/* Liquid glass effect with subtle gradients */}
      <div className={cn(
        "absolute inset-0 pointer-events-none",
        isDark 
          ? "bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01]"
          : "bg-gradient-to-br from-white/[0.8] via-white/[0.6] to-white/[0.9]"
      )} />
      <div className={cn(
        "absolute inset-0 pointer-events-none",
        isDark 
          ? "bg-gradient-to-t from-black/[0.01] via-transparent to-transparent"
          : "bg-gradient-to-t from-black/[0.02] via-transparent to-transparent"
      )} />
      
      {/* Subtle noise texture for premium feel */}
      <div className={cn(
        "absolute inset-0 pointer-events-none",
        isDark 
          ? "opacity-[0.015] bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"
          : "opacity-[0.03] bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1),transparent_50%)]"
      )} />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

interface GlassButtonProps {
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function GlassButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button'
}: GlassButtonProps) {
  const { getAccentColors, getAnimationClass, getCurrentTheme } = useAppearance()
  const accentColors = getAccentColors()
  const isDark = getCurrentTheme() === 'dark'
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const getVariantClasses = () => {
    if (isDark) {
      return {
        primary: `bg-white/[0.06] border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-white/[0.12] active:bg-white/[0.04]`,
        secondary: 'bg-white/[0.02] border-white/[0.04] text-gray-300 hover:bg-white/[0.04] hover:border-white/[0.06] hover:text-white active:bg-white/[0.01]',
        ghost: 'bg-transparent border-transparent text-gray-400 hover:bg-white/[0.02] hover:text-gray-300 active:bg-white/[0.01]',
        minimal: 'bg-transparent border-white/[0.02] text-gray-300 hover:bg-white/[0.01] hover:border-white/[0.04] hover:text-white'
      }
    } else {
      return {
        primary: `bg-black/[0.06] border-black/[0.08] text-white hover:bg-black/[0.08] hover:border-black/[0.12] active:bg-black/[0.04]`,
        secondary: 'bg-black/[0.02] border-black/[0.08] text-gray-700 hover:bg-black/[0.04] hover:border-black/[0.12] hover:text-gray-900 active:bg-black/[0.01]',
        ghost: 'bg-transparent border-transparent text-gray-600 hover:bg-black/[0.02] hover:text-gray-900 active:bg-black/[0.01]',
        minimal: 'bg-transparent border-black/[0.08] text-gray-700 hover:bg-black/[0.02] hover:border-black/[0.12] hover:text-gray-900'
      }
    }
  }

  const variantClasses = getVariantClasses()

  const primaryStyle = variant === 'primary' ? {
    background: `linear-gradient(135deg, ${accentColors.light}, ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'})`,
    borderColor: accentColors.border,
    boxShadow: `0 0 20px ${accentColors.light}`
  } : {}

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={primaryStyle}
      className={cn(
        'rounded-xl border backdrop-blur-lg font-medium',
        getAnimationClass() || 'transition-all duration-200 ease-out',
        isDark 
          ? 'shadow-lg shadow-black/[0.02] hover:shadow-xl hover:shadow-black/[0.04]'
          : 'shadow-lg shadow-black/[0.08] hover:shadow-xl hover:shadow-black/[0.12]',
        'transform hover:scale-[1.01] active:scale-[0.99]',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none',
        'relative overflow-hidden',
        sizeClasses[size],
        variant === 'primary' ? 'text-white hover:opacity-90' : variantClasses[variant],
        variant !== 'primary' && variantClasses[variant],
        className
      )}
    >
      {/* Subtle shimmer effect on hover */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r from-transparent to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 ease-out pointer-events-none",
        isDark ? "via-white/[0.02]" : "via-black/[0.02]"
      )} />
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  )
}

interface FloatingElementProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function FloatingElement({ children, className, delay = 0 }: FloatingElementProps) {
  return (
    <div
      className={cn(
        'animate-float-subtle',
        className
      )}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: '8s'
      }}
    >
      {children}
    </div>
  )
}

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  gradient?: 'subtle' | 'minimal' | 'accent'
}

export function GradientText({ children, className, gradient = 'subtle' }: GradientTextProps) {
  const gradientClasses = {
    subtle: 'bg-gradient-to-r from-gray-200 to-white',
    minimal: 'bg-gradient-to-r from-gray-100 to-gray-300',
    accent: 'bg-gradient-to-r from-white to-gray-200'
  }

  return (
    <span
      className={cn(
        'bg-clip-text text-transparent font-medium',
        gradientClasses[gradient],
        className
      )}
    >
      {children}
    </span>
  )
}

// Refined animations for premium feel
export const glassAnimations = `
@keyframes float-subtle {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-3px) rotate(0.5deg); }
  50% { transform: translateY(-2px) rotate(0deg); }
  75% { transform: translateY(-4px) rotate(-0.5deg); }
}

@keyframes glow-subtle {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.02); }
  50% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.04); }
}

@keyframes shimmer-minimal {
  0% { transform: translateX(-100%) skewX(-45deg); }
  100% { transform: translateX(200%) skewX(-45deg); }
}

.animate-float-subtle {
  animation: float-subtle 8s ease-in-out infinite;
}

.animate-glow-subtle {
  animation: glow-subtle 3s ease-in-out infinite;
}

.shimmer-minimal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.03) 50%,
    transparent 100%
  );
  animation: shimmer-minimal 3s ease-in-out infinite;
  pointer-events: none;
}
`
