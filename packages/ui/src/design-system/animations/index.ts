import { Variants } from "framer-motion";

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

export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: transitions.default },
  exit: { opacity: 0, x: 15, transition: transitions.fast },
};

export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: "-100%" },
  visible: { opacity: 1, x: 0, transition: { type: "tween", ease: "easeOut", duration: 0.25 } },
  exit: { opacity: 0, x: "-100%", transition: { type: "tween", ease: "easeIn", duration: 0.2 } },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: transitions.fast },
  exit: { opacity: 0, scale: 0.95, transition: transitions.fast },
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.12, ease: "easeIn" } },
};

export const drawerVariants: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "tween", duration: 0.22, ease: "easeInOut" } },
  exit: { x: "100%", transition: { type: "tween", duration: 0.18, ease: "easeInOut" } },
};

export const accordionVariants: Variants = {
  collapsed: { height: 0, opacity: 0, transition: transitions.smooth },
  expanded: { height: "auto", opacity: 1, transition: transitions.smooth },
};

export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};

export const hoverLift = {
  whileHover: { y: -2, transition: { duration: 0.15, ease: "easeOut" } },
  whileTap: { y: 0 },
};

export const loadingRotate = {
  animate: { rotate: 360 },
  transition: { repeat: Infinity, duration: 1, ease: "linear" },
};
export default {
  transitions,
  fadeVariants,
  slideUpVariants,
  slideRightVariants,
  slideLeftVariants,
  scaleInVariants,
  modalVariants,
  drawerVariants,
  accordionVariants,
  hoverScale,
  hoverLift,
  loadingRotate,
};
