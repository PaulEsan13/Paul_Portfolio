import CaseStudy from "../../components/CaseStudy";
import { project, sections } from "./content";

export const metadata = {
  title: "Ashcorp Group — Brand Identity · Paul Esan",
  description: "One Source, Many Worlds. Brand identity for Ashcorp Group, the creative holding company behind Ashluxe, Zentaii, Zafira and more.",
};

export default function Page() {
  return <CaseStudy project={project} sections={sections} />;
}
