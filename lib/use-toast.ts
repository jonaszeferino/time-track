import { toaster } from "@/components/ui/toaster"

export const useToast = () => {
  const showToast = (title: string, description?: string, status: "success" | "error" | "warning" | "info" = "success") => {
    toaster.create({
      title,
      description,
      type: status,
      duration: 3000,
    })
  }

  return { showToast }
}
