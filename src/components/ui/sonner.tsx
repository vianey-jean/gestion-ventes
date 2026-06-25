
import { useTheme } from "@/contexts/ThemeContext"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: [
            "group toast relative overflow-hidden",
            "!rounded-2xl !border !p-4 !pr-10",
            "!bg-gradient-to-br !from-white/95 !via-white/90 !to-violet-50/90",
            "dark:!from-[#0b0420]/95 dark:!via-[#0a0030]/90 dark:!to-[#1a0040]/90",
            "!text-foreground !border-violet-200/40 dark:!border-violet-700/40",
            "!shadow-[0_20px_60px_-15px_rgba(139,92,246,0.35)] dark:!shadow-[0_20px_60px_-15px_rgba(139,92,246,0.5)]",
            "backdrop-blur-2xl",
            "before:absolute before:inset-x-0 before:top-0 before:h-[2px]",
            "before:bg-gradient-to-r before:from-violet-500 before:via-fuchsia-500 before:to-cyan-400",
            "after:absolute after:inset-0 after:rounded-2xl after:pointer-events-none",
            "after:bg-[radial-gradient(120%_60%_at_0%_0%,rgba(255,255,255,0.5),transparent_60%)]",
            "dark:after:bg-[radial-gradient(120%_60%_at_0%_0%,rgba(255,255,255,0.08),transparent_60%)]",
          ].join(" "),
          title: "!font-bold !text-[0.95rem] !bg-gradient-to-r !from-violet-700 !to-fuchsia-600 dark:!from-violet-300 dark:!to-fuchsia-300 !bg-clip-text !text-transparent",
          description: "!text-muted-foreground !text-sm",
          actionButton:
            "!bg-gradient-to-r !from-violet-500 !to-fuchsia-500 !text-white !rounded-xl !shadow-lg !shadow-violet-500/30",
          cancelButton:
            "!bg-muted !text-muted-foreground !rounded-xl",
          closeButton:
            "!bg-white/90 dark:!bg-[#1a0040]/90 !border-violet-200/60 dark:!border-violet-700/60 !text-violet-700 dark:!text-violet-200 !rounded-full !shadow-md hover:!scale-110 !transition-transform",
          success: "!border-emerald-300/60 dark:!border-emerald-700/60 before:!from-emerald-400 before:!via-teal-400 before:!to-cyan-400",
          error: "!border-rose-300/60 dark:!border-rose-700/60 before:!from-rose-500 before:!via-pink-500 before:!to-orange-400",
          warning: "!border-amber-300/60 dark:!border-amber-700/60 before:!from-amber-400 before:!via-orange-400 before:!to-rose-400",
          info: "!border-sky-300/60 dark:!border-sky-700/60 before:!from-sky-400 before:!via-cyan-400 before:!to-violet-400",
        },
      }}
      closeButton
      richColors={false}
      {...props}
    />
  )
}

export { Toaster }
