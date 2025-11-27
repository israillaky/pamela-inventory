import React, { useEffect } from "react";
import { motion, useDragControls } from "framer-motion";

export default function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-2xl",
}) {
  const dragControls = useDragControls();

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* draggable modal */}
      <motion.div
        className={`relative w-full ${width} mx-4 rounded-2xl bg-white dark:bg-gpt-900
          border border-gray-100 dark:border-gpt-700 shadow-xl`}
        drag
        dragControls={dragControls}
        dragListener={false} // only drag via header
        dragMomentum={false}
        dragElastic={0.12}
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header: drag handle */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-gray-100
            dark:border-gpt-700 cursor-move select-none"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <h3 className="text-lg font-semibold text-gpt-900 dark:text-gpt-100">
            {title}
          </h3>

          <button
            onClick={onClose}
            className="text-gpt-500 hover:text-gpt-900 dark:hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* body */}
        <div className="px-5 py-4">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
