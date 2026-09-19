import ContentBlocks from "../components/ContentBlocks";
import ProjectLogo from "../components/ProjectLogo";
import ProjectPreview from "../components/ProjectPreview";
import Barcode from "../components/Barcode";
import Link from "../components/Link";
import { getNextProject, isInProgress, projectPath } from "../data/projects";
import { sheetStyle } from "../lib/paper";
import { SITE_HOST } from "../lib/seo";
import "../styles/paper.css";
import "./ProjectPage.css";

function ProjectPage({ project }) {
  const { slug, year, role, stack, links, blocks, receipt } =
    project;

  const next = getNextProject(slug);
  // Scheme-less: it is what prints under the bars, and every module the payload
  // sheds is a module of width the bars get back on a 400px slip.
  const url = `${SITE_HOST}${projectPath(slug)}`;

  return (
    <article className="project">
      {/* The same card the home page shows beside the receipt, now as the
          page's head: the title types in as the <h1> over the summary. The
          project's details print on a small receipt beside it. No poster here
          -- the writeup below has its own figures. */}
      <header className="project__head">
        <ProjectPreview project={project} heading />

        <aside className="paper project-slip__paper" aria-label="Project details">
          <div
            className="sheet project-slip"
            style={sheetStyle(`${slug}-details`, 560)}
          >
            <ProjectLogo slug={slug} className="slip-mark project-slip__logo" />

            <div className="rule rule--double" aria-hidden="true" />

            <dl className="project-slip__fields">
              {isInProgress(project) && (
                <div className="slip-row">
                  <dt>Status</dt>
                  <dd>In progress</dd>
                </div>
              )}
              <div className="slip-row">
                <dt>Year</dt>
                <dd>{year}</dd>
              </div>
              <div className="slip-row">
                <dt>Impact</dt>
                <dd>{receipt.impact}</dd>
              </div>
              <div className="slip-row">
                <dt>Role</dt>
                <dd>{role}</dd>
              </div>
              <div className="slip-row">
                <dt>Stack</dt>
                {/* Non-breaking space before each separator, so a wrapped
                    stack breaks after a dot and never starts a line on one. */}
                <dd>{stack.join("\u00a0\u00b7 ")}</dd>
              </div>
            </dl>

            {links.length > 0 && (
              <>
                <div className="rule" aria-hidden="true" />
                <ul className="slip-list">
                  {links.map((link) => {
                    const host = new URL(link.href).host.replace(/^www\./, "");
                    return (
                      <li key={link.href}>
                        <a
                          className="slip-link project-slip__link"
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          /* The sheet prints in caps via text-transform, and
                             Chrome folds that into a link's computed name, so
                             the name is spelled out here. */
                          aria-label={`${link.label}: ${host}, opens in a new tab`}
                        >
                          <span className="slip-link__value">{link.label}</span>{" "}
                          <span aria-hidden="true">↗</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </aside>
      </header>

      <section className="project__attachment" aria-label="Project writeup">
        <ContentBlocks blocks={blocks} />
      </section>

      {/* Paper, last: the item tag the back office prints once the item is
          closed. Bars, code — and the only sheet left on the page. */}
      <footer className="paper project-footer__paper">
        <div
          className="sheet project-footer"
          style={sheetStyle(`${slug}-footer`, 400)}
        >
          <Barcode
            className="slip-barcode project-footer__barcode"
            value={url}
          />
          <p className="slip-code project-footer__code">{url}</p>

          <div className="rule rule--double" aria-hidden="true" />

          <p className="slip-thanks project-footer__thanks">
            Thank you for reading
          </p>
          <Link
            className="slip-row slip-link project-footer__next"
            to={projectPath(next.slug)}
            aria-label={`Next project: ${next.title}`}
          >
            <span className="slip-label">Next</span>
            <span className="slip-link__value">
              {next.title} <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>
      </footer>
    </article>
  );
}

export default ProjectPage;
