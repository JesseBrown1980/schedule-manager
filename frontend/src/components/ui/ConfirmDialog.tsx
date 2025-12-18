/**
 * Reusable confirmation dialog component.
 * Replaces native window.confirm with a styled dialog.
 */
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { AlertTriangleIcon, XIcon } from "./icons";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  const headerStyles = {
    danger: "bg-gradient-to-b from-red-500 to-red-600",
    warning: "bg-gradient-to-b from-amber-500 to-amber-600",
    default: "bg-gradient-to-b from-[#667EEA] to-[#764BA2]",
  };

  const iconColors = {
    danger: "bg-white/20",
    warning: "bg-white/20",
    default: "bg-white/20",
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in z-50" />
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-[calc(100%-2rem)] max-w-md",
            "bg-white rounded-2xl shadow-dialog",
            "animate-slide-up z-50",
            "overflow-hidden"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "px-5 py-4 text-white flex items-center gap-3",
              headerStyles[variant]
            )}
          >
            <div className={cn("p-2 rounded-full", iconColors[variant])}>
              <AlertTriangleIcon size={20} />
            </div>
            <div className="flex-1">
              <Dialog.Title className="text-lg font-semibold">
                {title}
              </Dialog.Title>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close"
            >
              <XIcon size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            <Dialog.Description className="text-content-secondary">
              {description}
            </Dialog.Description>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end p-4 border-t border-slate-100 bg-slate-50">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={variant === "danger" ? "danger" : "primary"}
              onClick={handleConfirm}
              isLoading={isLoading}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

