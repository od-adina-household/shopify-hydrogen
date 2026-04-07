import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Register GSAP plugins
gsap.registerPlugin(useGSAP);

// Set project-wide defaults
gsap.defaults({
  duration: 0.6,
  ease: "power2.out",
});

export { gsap, useGSAP };
