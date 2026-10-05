import { Link } from "react-router-dom";
import { Arrow, PageHero, SectionTitle } from "../components/Shared";
import CareerApplicationForm from "../components/CareerApplicationForm";

const openings = [
  {
    title: "Client Acquisition & Sales Assistant",
    type: "Sales & Growth",
    copy: "Support prospect research, outreach, follow-ups, CRM updates, call coordination and the day-to-day client acquisition pipeline. Strong written communication, organisation and confidence working with digital tools are important.",
  },
  {
    title: "Junior Developer",
    type: "Engineering",
    copy: "Work with the product and engineering team across websites, web applications and mobile products. We’re looking for solid fundamentals, curiosity, attention to detail and evidence of projects you have built or contributed to.",
  },
  {
    title: "Social Media Management",
    type: "Marketing & Content",
    copy: "Plan, create, schedule and manage social content across our brand channels, engage with audiences, support campaigns and track performance. Strong communication, content judgement, consistency and confidence with social media and creative tools are important.",
  },
];

export default function Careers() {
  return (
    <>
      <PageHero eyebrow="Careers at Cactus Digital Media" title="Build useful things. Grow with us." copy="We’re building a team around thoughtful technology, practical execution and measurable business results. Explore our current openings and submit your application below." />
      <section className="wrap section compact">
        <SectionTitle eyebrow="Current openings" title="Three roles. One growing team." copy="Applications are reviewed based on the requirements of the role and the information you provide." />
        <div className="process-grid">
          {openings.map((role, i) => (
            <article key={role.title}>
              <span className="step">0{i + 1}</span>
              <span className="eyebrow">{role.type}</span>
              <h3>{role.title}</h3>
              <p>{role.copy}</p>
              <Link className="text-link" to={`/careers?role=${encodeURIComponent(role.title)}#apply`}>Apply for this role <Arrow diagonal /></Link>
            </article>
          ))}
        </div>
      </section>
      <section className="wrap section compact" id="apply">
        <SectionTitle eyebrow="Application" title="Tell us about yourself." copy="Complete the form and attach your CV. You can also upload an academic result, transcript or relevant certificate if available." />
        <CareerApplicationForm />
      </section>
    </>
  );
}
