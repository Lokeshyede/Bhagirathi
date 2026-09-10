import React from "react";
import { motion, HTMLMotionProps, Variants } from "framer-motion";

export const transitions = {
  default: { type: "spring", stiffness: 300, damping: 30 },
  smooth: { type: "tween", ease: "easeInOut", duration: 0.25 },
  fast: { type: "tween", ease: "easeOut", duration: 0.15 },
  slow: { type: "tween", ease: "easeInOut", duration: 0.4 },
} as const;

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.fast },
  exit: { opacity: 0, transition: transitions.fast },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: transitions.default },
  exit: { opacity: 0, y: 10, transition: transitions.fast },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: transitions.fast },
  exit: { opacity: 0, scale: 0.95, transition: transitions.fast },
};

export const accordionVariants: Variants = {
  collapsed: { height: 0, opacity: 0, transition: transitions.smooth },
  expanded: { height: "auto", opacity: 1, transition: transitions.smooth },
};

export const Fade: React.FC<HTMLMotionProps<"div">> = ({ children, ...props }) => (
  <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" {...props}>
    {children}
  </motion.div>
);

export const Scale: React.FC<HTMLMotionProps<"div">> = ({ children, ...props }) => (
  <motion.div variants={scaleInVariants} initial="hidden" animate="visible" exit="exit" {...props}>
    {children}
  </motion.div>
);

export const SlideUp: React.FC<HTMLMotionProps<"div">> = ({ children, ...props }) => (
  <motion.div variants={slideUpVariants} initial="hidden" animate="visible" exit="exit" {...props}>
    {children}
  </motion.div>
);

export const AnimateHeight: React.FC<HTMLMotionProps<"div"> & { isOpen: boolean }> = ({ isOpen, children, ...props }) => (
  <motion.div
    variants={accordionVariants}
    initial="collapsed"
    animate={isOpen ? "expanded" : "collapsed"}
    exit="collapsed"
    className="overflow-hidden"
    {...props}
  >
    {children}
  </motion.div>
);
