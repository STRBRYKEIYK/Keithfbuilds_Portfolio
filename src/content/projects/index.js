import aether from "./aether.js";
import toolbox from "./toolbox.js";
import financialWorkflow from "./financial-workflow.js";
import procurementSupplyChain from "./procurement-supply-chain.js";
import docAutomation from "./doc-automation.js";

const projects = [
  aether,
  toolbox,
  financialWorkflow,
  procurementSupplyChain,
  docAutomation,
];

export default projects;

export const getProjectBySlug = (slug) =>
  projects.find((project) => project.slug === slug) ?? null;

export const getNextProject = (slug) => {
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) return null;
  return projects[(index + 1) % projects.length];
};
