"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGlobalLoader } from "@/hooks/useGlobalLoader";

const messages = [
  "Traitement en cours...",
  "Chargement des données...",
  "Veuillez patienter un instant...",
  "Presque prêt..."
];

export default function LoadingOverlay() {
  const { loading } = useGlobalLoader();

  const message = messages[Math.floor(Math.random() * messages.length)];

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.75)', // fond sombre
            backdropFilter: 'blur(8px)', // flou prononcé
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Spinner stylisé avec plusieurs cercles */}
            <div className="relative w-16 h-16">
              {[...Array(3)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute inset-0 border-4 rounded-full"
                  style={{ 
                    borderColor: `rgba(96, 165, 250, ${0.4 + i * 0.25})`,
                    borderTopColor: 'transparent'
                  }}
                  animate={{ 
                    scale: [0.8, 1.2, 0.8],
                    rotate: 360
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>

            {/* Texte */}
            <motion.span
              className="text-sm text-white font-semibold tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {message}
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}