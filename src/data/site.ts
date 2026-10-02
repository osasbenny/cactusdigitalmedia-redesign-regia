import serviceData from "./services.json" with { type: "json" };
import projectData from "./projects.json" with { type: "json" };
import postData from "./posts-summary.json" with { type: "json" };
export const services = serviceData;
export interface Project {
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string | null;
  imageWidth?: number;
  imageHeight?: number;
  icon?: string;
  imageSmall?: string;
  gallery?: { src: string; alt: string; width?: number; height?: number }[];
  sourceUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  status: string;
  technologies: string[];
  context?: string;
  features?: string[];
  credit?: string;
}

const androidAppLinks: Record<string, string> = {
  gofuel: "https://play.google.com/store/apps/details?id=com.jcobiq.gofuel",
  taskflow:
    "https://play.google.com/store/apps/details?id=com.cactusdigitalmedia.taskflow",
  habitmind: "https://play.google.com/store/apps/details?id=com.habitmind.app",
};

export const projects: Project[] = projectData.map((project) => {
  const playStoreUrl = androidAppLinks[project.slug];
  return playStoreUrl
    ? { ...project, sourceUrl: playStoreUrl, liveUrl: playStoreUrl }
    : project;
});
export const posts = postData;
export const brand = {
  name: "Cactus Digital Media",
  origin: "https://cactusdigitalmedia.ng",
  email: "info@cactusdigitalmedia.ng",
  whatsapp: "https://wa.me/message/GHSJFUNL4CLDM1",
};
export const process = [
  [
    "Discover",
    "Start with the right questions.",
    "Your audience, your goals, your constraints. We define what the work needs to achieve.",
  ],
  [
    "Design",
    "Make the direction tangible.",
    "Clear user journeys, considered interfaces, and a shared plan before development begins.",
  ],
  [
    "Build",
    "Bring the pieces together.",
    "Design, engineering, and integrations become a working product, reviewed at agreed milestones.",
  ],
  [
    "Launch & evolve",
    "Make the next step count.",
    "Test the experience, prepare for launch, and plan the support your product needs.",
  ],
];
