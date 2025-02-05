import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & 
  VariantProps<typeof alertVariants> & 
  { 
    onClose?: () => void; 
    message?: string; 
    isVisible?: boolean; 
  }
>(({ className, variant, message, isVisible = false, children, onClose, ...props }, ref) => {
  const [isClosing, setIsClosing] = React.useState(false)

  React.useEffect(() => {
    if (onClose && isVisible) {
      const timer = setTimeout(() => {
        setIsClosing(true)
        setTimeout(onClose, 300) // Match this with the transition duration
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [onClose, isVisible])

  if (!isVisible) return null

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        alertVariants({ variant }),
        isClosing ? "animate-fade-out" : "animate-fade-in",
        className
      )}
      {...props}
    >
      {message || children}
      {onClose && (
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 hover:opacity-75"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }