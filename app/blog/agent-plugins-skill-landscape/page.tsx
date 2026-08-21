import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import novaAuthor from "@/content/authors/nova.json";
import PostShareBar from "@/components/PostShareBar";
import { agentPluginsSkillLandscapeThumbnail } from "@/data/blog";
import postMd from "@/content/blog/agent-plugins-skill-landscape/post.md";

export const dynamic = "force-static";
export const revalidate = false;

const siteUrl = "https://research.gaiaskilltree.com";
const articlePath = "/blog/agent-plugins-skill-landscape";
const articleUrl = `${siteUrl}${articlePath}`;
const thumbnailUrl = `${siteUrl}${agentPluginsSkillLandscapeThumbnail.src.src}`;
const articleDescription =
  "A package format for portable agent capabilities: skills, MCP servers, and client permissions all traveling together.";

export const metadata = {
  title: "Agent Plugins: The Skill Landscape Just Got a Package Format",
  description: articleDescription,
  alternates: { canonical: articlePath },
  openGraph: {
    type: "article",
    url: articlePath,
    title: "Agent Plugins: The Skill Landscape Just Got a Package Format",
    description: articleDescription,
    publishedTime: "2026-08-19T00:00:00+08:00",
    authors: [novaAuthor.display_name],
    images: [{ url: agentPluginsSkillLandscapeThumbnail.src.src, width: 1600, height: 900, alt: agentPluginsSkillLandscapeThumbnail.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Plugins: The Skill Landscape Just Got a Package Format",
    description: articleDescription,
    images: [agentPluginsSkillLandscapeThumbnail.src.src],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Agent Plugins: The Skill Landscape Just Got a Package Format",
  description: articleDescription,
  image: thumbnailUrl,
  url: articleUrl,
  datePublished: "2026-08-19T00:00:00+08:00",
  author: {
    "@type": "Person",
    name: novaAuthor.display_name,
    url: novaAuthor.links.github,
  },
  publisher: {
    "@type": "Organization",
    name: "Gaia Research",
    url: siteUrl,
  },
};

function loadPost() {
  // Strip H1 title & subtitle since header renders them
  return postMd.split("\n").slice(4).join("\n").trim();
}

export default function BlogPostPage() {
  const body = loadPost();
  return (
    <>
      <SiteHeader />
      <main id="main" className="blog-post-page">
        <PostShareBar />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData).replace(/</g, "\\u003c") }}
        />
        <header className="blog-post-head">
          <p className="blog-post-meta">
            <time dateTime="2026-08-19">August 19, 2026</time> · {" "}
            <a href={novaAuthor.links.github} target="_blank" rel="noreferrer">
              {novaAuthor.display_name}
            </a>{" "}
            · Head Researcher, Gaia Research
          </p>
          <h1>Agent Plugins: The Skill Landscape Just Got a Package Format</h1>
          <p className="blog-post-summary">
            A package format for portable agent capabilities: skills, MCP servers, and client permissions all traveling together.
          </p>
        </header>

        <figure className="blog-post-illustration">
          <img
            src={agentPluginsSkillLandscapeThumbnail.src.src}
            width={agentPluginsSkillLandscapeThumbnail.src.width}
            height={agentPluginsSkillLandscapeThumbnail.src.height}
            alt={agentPluginsSkillLandscapeThumbnail.alt}
          />
        </figure>

        <article className="blog-post-body report-body">
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              p: ({ children, ...props }) => {
                const childArray = Array.isArray(children) ? children : [children];
                const text = childArray.length === 1 && typeof childArray[0] === "string" ? childArray[0] : null;

                if (text === "[[SVG_1_LAYER_CAKE]]") {
                  return (
                    <svg viewBox="0 0 960 560" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc" style={{width: "100%", height: "auto", margin: "20px 0"}}>
                      <title id="title">Agent Plugin architecture</title>
                      <desc id="desc">Agent Plugins package Agent Skills and MCP server declarations, while the client owns runtime, permissions, and user experience.</desc>
                      <rect width="960" height="560" rx="24" fill="#05060a"/><text x="480" y="54" textAnchor="middle" fill="#f4f1ea" fontSize="28" fontWeight="700">The new portable boundary</text><rect x="150" y="92" width="660" height="92" rx="14" fill="#0b0e14" stroke="#334155"/><text x="480" y="128" textAnchor="middle" fill="#38bdf8" fontSize="18" fontWeight="700">AGENT CLIENT</text><text x="480" y="158" textAnchor="middle" fill="#94a3b8" fontSize="15">runtime · permissions · UX · policy</text><path d="M480 184V224" stroke="#334155" strokeWidth="2"/><path d="M472 216L480 224L488 216" fill="none" stroke="#334155" strokeWidth="2"/><rect x="150" y="224" width="660" height="232" rx="18" fill="#0b0c13" stroke="#fbbf24" strokeWidth="2"/><text x="480" y="264" textAnchor="middle" fill="#fbbf24" fontSize="21" fontWeight="700">AGENT PLUGIN</text><text x="480" y="290" textAnchor="middle" fill="#94a3b8" fontSize="14">portable distribution boundary</text><rect x="202" y="324" width="248" height="92" rx="12" fill="#05060a" stroke="#38bdf8"/><text x="326" y="360" textAnchor="middle" fill="#38bdf8" fontSize="18" fontWeight="700">Agent Skills</text><text x="326" y="388" textAnchor="middle" fill="#cbd5e1" fontSize="14">how to perform</text><rect x="510" y="324" width="248" height="92" rx="12" fill="#05060a" stroke="#ec4899"/><text x="634" y="360" textAnchor="middle" fill="#ec4899" fontSize="18" fontWeight="700">MCP Servers</text><text x="634" y="388" textAnchor="middle" fill="#cbd5e1" fontSize="14">what can be reached</text><text x="480" y="510" textAnchor="middle" fill="#64748b" fontSize="13">plugin.json + skills/ + mcp.json</text>
                    </svg>
                  );
                }

                if (text === "[[SVG_2_MCP_CHANGE]]") {
                  return (
                    <svg viewBox="0 0 1100 620" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc" style={{width: "100%", height: "auto", margin: "20px 0"}}>
                      <title id="title">MCP before and after Agent Plugins</title>
                      <desc id="desc">Before Agent Plugins, one MCP server may require multiple client-specific configurations. Agent Plugins introduces one portable mcp.json which clients translate into their native runtime configuration.</desc>
                      <rect width="1100" height="620" rx="24" fill="#05060a"/><text x="550" y="52" textAnchor="middle" fill="#f4f1ea" fontSize="28" fontWeight="700">MCP keeps the protocol. Plugins standardize the suitcase.</text><text x="275" y="108" textAnchor="middle" fill="#94a3b8" fontSize="18" fontWeight="700">BEFORE</text><rect x="150" y="138" width="250" height="72" rx="12" fill="#0b0e14" stroke="#ec4899"/><text x="275" y="181" textAnchor="middle" fill="#f4f1ea" fontSize="16">MCP Server</text><path d="M275 210V250" stroke="#64748b" strokeWidth="2"/><path d="M275 250L125 312" stroke="#64748b" strokeWidth="2"/><path d="M275 250L275 312" stroke="#64748b" strokeWidth="2"/><path d="M275 250L425 312" stroke="#64748b" strokeWidth="2"/><rect x="55" y="312" width="140" height="70" rx="10" fill="#0b0e14" stroke="#334155"/><text x="125" y="341" textAnchor="middle" fill="#cbd5e1" fontSize="13">Client A</text><text x="125" y="362" textAnchor="middle" fill="#64748b" fontSize="11">config shape A</text><rect x="205" y="312" width="140" height="70" rx="10" fill="#0b0e14" stroke="#334155"/><text x="275" y="341" textAnchor="middle" fill="#cbd5e1" fontSize="13">Client B</text><text x="275" y="362" textAnchor="middle" fill="#64748b" fontSize="11">config shape B</text><rect x="355" y="312" width="140" height="70" rx="10" fill="#0b0e14" stroke="#334155"/><text x="425" y="341" textAnchor="middle" fill="#cbd5e1" fontSize="13">Client C</text><text x="425" y="362" textAnchor="middle" fill="#64748b" fontSize="11">config shape C</text><text x="275" y="432" textAnchor="middle" fill="#ec4899" fontSize="14">same server · repeated packaging work</text><line x1="550" y1="110" x2="550" y2="540" stroke="#334155" strokeDasharray="5 8"/><text x="825" y="108" textAnchor="middle" fill="#fbbf24" fontSize="18" fontWeight="700">AGENT PLUGINS</text><rect x="680" y="138" width="290" height="74" rx="12" fill="#0b0e14" stroke="#fbbf24"/><text x="825" y="169" textAnchor="middle" fill="#fbbf24" fontSize="16" fontWeight="700">portable mcp.json</text><text x="825" y="191" textAnchor="middle" fill="#94a3b8" fontSize="12">stdio · streamable-http · sse</text><path d="M825 212V260" stroke="#fbbf24" strokeWidth="2"/><rect x="710" y="260" width="230" height="74" rx="12" fill="#0b0e14" stroke="#38bdf8"/><text x="825" y="290" textAnchor="middle" fill="#38bdf8" fontSize="15" fontWeight="700">Client Adapter</text><text x="825" y="312" textAnchor="middle" fill="#94a3b8" fontSize="12">maps portable → native</text><path d="M825 334V380" stroke="#64748b" strokeWidth="2"/><rect x="660" y="380" width="330" height="78" rx="12" fill="#0b0e14" stroke="#334155"/><text x="825" y="410" textAnchor="middle" fill="#f4f1ea" fontSize="15">Native agent runtime</text><text x="825" y="435" textAnchor="middle" fill="#64748b" fontSize="12">client still owns connection + permissions</text><text x="825" y="506" textAnchor="middle" fill="#fbbf24" fontSize="14">one portable declaration</text><text x="550" y="580" textAnchor="middle" fill="#64748b" fontSize="12">Architecture diagram · not benchmark data</text>
                    </svg>
                  );
                }

                if (text === "[[SVG_3_PORTABILITY_TRUST]]") {
                  return (
                    <svg viewBox="0 0 980 430" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc" style={{width: "100%", height: "auto", margin: "20px 0"}}>
                      <title id="title">Portability is ahead of trust</title>
                      <desc id="desc">An illustrative comparison showing that Agent Plugins v1 standardizes packaging while permissions, trust, sandboxing, and authorization remain mostly client-controlled.</desc>
                      <rect width="980" height="430" rx="24" fill="#05060a"/><text x="70" y="66" fill="#f4f1ea" fontSize="27" fontWeight="700">Portability is ahead of trust.</text><text x="70" y="102" fill="#94a3b8" fontSize="14">Illustrative · not measured data</text><text x="70" y="176" fill="#cbd5e1" fontSize="16">Packaging interoperability</text><rect x="310" y="151" width="570" height="34" rx="7" fill="#0b0e14"/><rect x="310" y="151" width="520" height="34" rx="7" fill="#fbbf24"/><text x="70" y="248" fill="#cbd5e1" fontSize="16">Trust interoperability</text><rect x="310" y="223" width="570" height="34" rx="7" fill="#0b0e14"/><rect x="310" y="223" width="132" height="34" rx="7" fill="#ec4899"/><line x1="70" y1="300" x2="880" y2="300" stroke="#334155"/><text x="70" y="340" fill="#38bdf8" fontSize="14">v1 portable:</text><text x="190" y="340" fill="#cbd5e1" fontSize="14">skills · MCP configuration · package manifest</text><text x="70" y="374" fill="#ec4899" fontSize="14">client-owned:</text><text x="190" y="374" fill="#cbd5e1" fontSize="14">permissions · sandboxing · OAuth · approval UX</text>
                    </svg>
                  );
                }

                if (text === "[[YOUTUBE_EMBED_AGENT_PLUGINS]]") {
                  return (
                    <figure className="blog-video" style={{margin: "20px 0"}}>
                      <iframe
                        src="https://www.youtube-nocookie.com/embed/UaeWJK_vv-Y"
                        title="Agent Plugins — Technical Overview"
                        width="960"
                        height="540"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ width: "100%", aspectRatio: "16 / 9", height: "auto" }}
                      />
                    </figure>
                  );
                }

                return <p {...props}>{children}</p>;
              },
            }}
          >
            {body}
          </Markdown>
        </article>

        <footer className="blog-post-foot">
          <Link href="/blog">Back to Blog <span aria-hidden="true">→</span></Link>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
