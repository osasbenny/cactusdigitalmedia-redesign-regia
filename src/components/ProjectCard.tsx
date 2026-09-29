import { Link } from "react-router-dom";
import { projects } from "../data/site";
import { Arrow } from "./Shared";
export default function ProjectCard({
  project,
}: {
  project: (typeof projects)[number];
}) {
  return (
    <article className="project-card">
      <Link
        to={`/portfolio/${project.slug}`}
        className={`project-picture ${project.category === "Mobile Applications" ? "mobile-project" : ""}`}
        aria-label={`View ${project.title}`}
      >
        {project.category === "Mobile Applications" && project.gallery ? (
          <div className="mobile-preview">
            {project.gallery.slice(0, 3).map((img) => (
              <img
                key={img.src}
                src={img.src}
                alt={img.alt}
                loading="lazy"
                width={img.width}
                height={img.height}
              />
            ))}
          </div>
        ) : project.image ? (
          <img
            src={project.image}
            alt={`${project.title} project design`}
            srcSet={
              project.imageSmall
                ? `${project.imageSmall} 640w, ${project.image} 1000w`
                : undefined
            }
            sizes="(max-width: 600px) 90vw, 44vw"
            loading="lazy"
            width="1024"
            height="1024"
          />
        ) : (
          <div className="project-typographic">
            <span>Website design</span>
            <strong>{project.title}</strong>
          </div>
        )}
        <span className="project-open">
          <Arrow diagonal />
        </span>
      </Link>
      <div className="project-info">
        <div>
          <span className="eyebrow">{project.category}</span>
          <h3>
            <Link to={`/portfolio/${project.slug}`}>{project.title}</Link>
          </h3>
        </div>
        <span className="project-index">
          {project.status === "Recent work" ? "Case study" : "Website design"}
        </span>
      </div>
    </article>
  );
}
