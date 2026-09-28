import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { brand } from "../data/site";
import InquiryForm from "./InquiryForm";
import WhatsAppChat from "./WhatsAppChat";
import { Arrow } from "./Shared";
const nav = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Portfolio", "/portfolio"],
  ["Insights", "/blog"],
  ["Contact us", "/contact"],
];
export default function Layout() {
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setMenu(false);
    setModal(false);
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="wrap nav">
          <Link to="/" aria-label="Cactus Digital Media home">
            <img
              className="logo"
              src="/images/cactus-logo.svg"
              width="240"
              height="45"
              alt="Cactus Digital Media"
            />
          </Link>
          <nav aria-label="Main navigation" className="desktop-nav">
            {nav.map(([label, url]) => (
              <NavLink key={url} to={url} end={url === "/"}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="nav-actions">
            <Dialog.Root open={modal} onOpenChange={setModal}>
              <Dialog.Trigger className="button dark nav-cta">
                Start a project <Arrow diagonal />
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="dialog-content">
                  <Dialog.Title>Let’s build something better.</Dialog.Title>
                  <Dialog.Description>
                    Share the essentials. We’ll help you define the next step.
                  </Dialog.Description>
                  <Dialog.Close
                    className="icon-button dialog-close"
                    aria-label="Close project form"
                  >
                    <X />
                  </Dialog.Close>
                  <InquiryForm project />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <button
              className="icon-button mobile-toggle"
              aria-label={menu ? "Close navigation" : "Open navigation"}
              aria-expanded={menu}
              aria-controls="mobile-navigation"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {menu && (
          <nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label="Mobile navigation"
          >
            {[...nav, ["Start a project", "/start-project"]].map(
              ([label, url]) => (
                <NavLink key={url} to={url} end={url === "/"}>
                  {label}
                  <Arrow diagonal />
                </NavLink>
              ),
            )}
          </nav>
        )}
      </header>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer>
        <div className="wrap footer-grid">
          <div>
            <Link to="/" aria-label="Cactus Digital Media home">
              <img
                className="footer-logo"
                src="/images/cactus-logo-white.svg"
                width="260"
                height="49"
                alt="Cactus Digital Media"
              />
            </Link>
            <p>
              Design. Technology. Possibility.
              <br />
              Thoughtfully connected.
            </p>
            <a
              href={brand.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Let’s talk on WhatsApp <Arrow diagonal />
            </a>
          </div>
          <div>
            <h2>Explore</h2>
            {nav.map(([label, url]) => (
              <Link key={url} to={url}>
                {label}
              </Link>
            ))}
          </div>
          <div>
            <h2>Let’s make it happen</h2>
            <a href={`mailto:${brand.email}`}>{brand.email}</a>
            <p>
              Lagos, Nigeria.
              <br />
              Working with businesses everywhere.
            </p>
            <Link className="text-link" to="/start-project">
              Send your brief <Arrow diagonal />
            </Link>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>
            © {new Date().getFullYear()} Cactus Digital Media. All rights
            reserved.
          </span>
          <div>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <span>
              Designed and Developed By The Cactus Digital Media Team.
            </span>
          </div>
        </div>
      </footer>
      <WhatsAppChat />
    </>
  );
}
