import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"

export default function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // "danger" | "warning" | "info"
  icon: CustomIcon,
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!isOpen) return null

  const IconComponent = CustomIcon || AlertTriangle

  const typeStyles = {
    danger: {
      iconBg: "bg-red-50 text-[#842029]",
      confirmBtn: "bg-[#842029] hover:bg-[#640515] text-white",
    },
    warning: {
      iconBg: "bg-amber-50 text-amber-600",
      confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    info: {
      iconBg: "bg-rose-50 text-[#AE2539]",
      confirmBtn: "bg-[#AE2539] hover:bg-[#842029] text-white",
    },
  }

  const currentStyle = typeStyles[type] || typeStyles.danger

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-pink-100 relative"
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            disabled={loading}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-2xl ${currentStyle.iconBg} flex items-center justify-center mb-4`}>
              <IconComponent size={28} />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif">
              {title}
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {message}
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 ${currentStyle.confirmBtn}`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
