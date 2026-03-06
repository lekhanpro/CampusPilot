import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles,
  FileSearch,
  Zap,
  BookOpen,
  ArrowRight,
  Upload,
  MessageSquare,
  Brain,
  CheckCircle2,
  Github,
  Code2,
  Database,
  Cpu,
  Server,
  FileText,
  GraduationCap,
  ExternalLink,
  Heart,
} from "lucide-react";
import { useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Feature {
  icon: typeof Upload;
  title: string;
  description: string;
  gradient: string;
}

interface Step {
  step: string;
  title: string;
  desc: string;
  icon: typeof Upload;
}

interface TechItem {
  name: string;
  category: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Upload,
    title: "Multi-PDF Upload",
    description:
      "Drag and drop lectures, textbooks, and papers. We parse and index every page so your entire library is searchable.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Brain,
    title: "RAG-Powered Search",
    description:
      "Your documents are chunked, embedded with HuggingFace models, and stored in pgvector for fast semantic retrieval.",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    icon: FileSearch,
    title: "Cited, Navigable Answers",
    description:
      "Every response includes sources with page numbers. Click a citation to preview the exact page.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Streaming Responses",
    description:
      "Answers stream token-by-token using Groq’s LLaMA 3.3 70B for fast, smooth interaction.",
    gradient: "from-amber-500 to-orange-500",
  },
];

const steps: Step[] = [
  {
    step: "01",
    title: "Sign In",
    desc: "Private workspaces with per-user storage",
    icon: GraduationCap,
  },
  {
    step: "02",
    title: "Upload",
    desc: "Drop your PDFs into ScholarSync",
    icon: FileText,
  },
  {
    step: "03",
    title: "Index",
    desc: "AI parses, chunks, and embeds every page",
    icon: Database,
  },
  {
    step: "04",
    title: "Ask",
    desc: "Get streaming, cited answers with page references",
    icon: CheckCircle2,
  },
];

const techStack: TechItem[] = [
  { name: "React 18", category: "Frontend", description: "Component-based UI" },
  { name: "TypeScript", category: "Language", description: "Type-safe codebase" },
  { name: "Tailwind CSS", category: "Styling", description: "Utility-first CSS" },
  { name: "Framer Motion", category: "Animation", description: "Smooth transitions" },
  { name: "Node.js", category: "Runtime", description: "Server runtime" },
  { name: "Express", category: "Backend", description: "API framework" },
  { name: "Groq", category: "AI / LLM", description: "LLaMA 3.3 70B inference" },
  { name: "Supabase", category: "Database", description: "pgvector + Auth" },
  { name: "HuggingFace", category: "Embeddings", description: "all-MiniLM-L6-v2" },
  { name: "LangChain", category: "Processing", description: "Text splitting" },
  { name: "PostHog", category: "Analytics", description: "Product analytics" },
  { name: "Tesseract", category: "OCR", description: "Scanned PDF fallback" },
];

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: EASE_OUT },
});

const fadeUpView = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, delay, ease: EASE_OUT },
});

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function HeroMockup(): JSX.Element {
  return (
    <motion.div
      {...fadeUp(0.5)}
      className="max-w-4xl mx-auto mt-20"
    >
      <div
        className="rounded-3xl p-[1px] shadow-2xl shadow-violet-500/10"
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <div className="rounded-[22px] bg-[#0a0a1a]/90 p-6 sm:p-8">
          {/* Window chrome */}
          <div className="flex items-center gap-2 mb-6" aria-hidden="true">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-amber-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
            <span className="ml-4 text-xs text-white/20 font-mono">
              scholarsync / dashboard
            </span>
          </div>

          {/* Conversation preview */}
          <div className="space-y-4">
            <div className="flex justify-end">
              <div className="bg-violet-600/40 border border-violet-500/30 rounded-2xl px-5 py-3 max-w-md">
                <p className="text-sm text-white/80">
                  Compare the definition of &quot;pointers&quot; in
                  lecture_notes.pdf vs textbook.pdf
                </p>
              </div>
            </div>
            <div className="flex justify-start">
              <div
                className="rounded-2xl px-5 py-4 max-w-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <p className="text-sm text-white/70 leading-relaxed">
                  Based on your documents, here is the comparison:
                </p>
                <p className="text-sm text-white/50 mt-2">
                  <strong className="text-white/80">
                    lecture_notes.pdf (p.12):
                  </strong>{" "}
                  Defines pointers as &quot;variables that store memory
                  addresses&quot;...
                </p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="text-[10px] px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300">
                    lecture_notes.pdf p.12
                  </span>
                  <span className="text-[10px] px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300">
                    textbook.pdf p.45
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }): JSX.Element {
  return (
    <motion.div
      {...fadeUpView(index * 0.1)}
      className="rounded-2xl p-8 group transition-colors"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.background = "rgba(255, 255, 255, 0.06)";
        el.style.borderColor = "rgba(255, 255, 255, 0.12)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.background = "rgba(255, 255, 255, 0.03)";
        el.style.borderColor = "rgba(255, 255, 255, 0.06)";
      }}
    >
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}
      >
        <feature.icon className="w-6 h-6 text-white" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  );
}

function StepCard({ step, index }: { step: Step; index: number }): JSX.Element {
  return (
    <motion.div
      {...fadeUpView(index * 0.1)}
      className="rounded-2xl p-6 text-center group transition-colors"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.background = "rgba(255, 255, 255, 0.06)";
        el.style.borderColor = "rgba(255, 255, 255, 0.12)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.background = "rgba(255, 255, 255, 0.03)";
        el.style.borderColor = "rgba(255, 255, 255, 0.06)";
      }}
    >
      <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <step.icon className="w-5 h-5 text-white" aria-hidden="true" />
      </div>
      <div className="text-4xl font-black text-white/5 group-hover:text-violet-500/20 transition-colors mb-3">
        {step.step}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
      <p className="text-sm text-white/40">{step.desc}</p>
    </motion.div>
  );
}

function TechBadge({ tech, index }: { tech: TechItem; index: number }): JSX.Element {
  return (
    <motion.div
      {...fadeUpView(index * 0.05)}
      className="rounded-xl px-4 py-3 flex flex-col items-center gap-1 text-center min-w-[120px] transition-colors"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.background = "rgba(255, 255, 255, 0.06)";
        el.style.borderColor = "rgba(255, 255, 255, 0.12)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.background = "rgba(255, 255, 255, 0.03)";
        el.style.borderColor = "rgba(255, 255, 255, 0.06)";
      }}
    >
      <span className="text-sm font-semibold text-white">{tech.name}</span>
      <span className="text-[10px] text-violet-400 font-medium uppercase tracking-wider">
        {tech.category}
      </span>
      <span className="text-[11px] text-white/30">{tech.description}</span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Icon helper for tech stack section                                 */
/* ------------------------------------------------------------------ */

function TechIcon({ className }: { className?: string }): JSX.Element {
  return <Code2 className={className} aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function Landing(): JSX.Element {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <div className="min-h-screen">
      {/* ============================================================ */}
      {/*  Hero Section                                                 */}
      {/* ============================================================ */}
      <section ref={heroRef} className="relative pt-32 pb-20 px-6" aria-label="Hero">
        <motion.div style={{ opacity: heroOpacity, y: heroY }}>
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              {...fadeUp(0)}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <Sparkles className="w-4 h-4 text-violet-400" aria-hidden="true" />
              <span className="text-sm text-white/60">
                Powered by Groq LLaMA 3.3 70B
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...fadeUp(0.1)}
              className="text-5xl sm:text-7xl font-black leading-[1.05] tracking-tight mb-6"
            >
              Your PDFs.
              <br />
              <span className="gradient-text">One Brilliant Mind.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              {...fadeUp(0.2)}
              className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
            >
              Upload your lecture notes, textbooks, and papers. Ask questions
              across all of them. Get{" "}
              <span className="text-white/70 font-medium">cited answers</span>{" "}
              with page numbers in seconds.
            </motion.p>

            {/* CTAs */}
            <motion.div
              {...fadeUp(0.3)}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/auth"
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg hover:from-violet-500 hover:to-indigo-500 transition-all shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#030014]"
                aria-label="Start studying with ScholarSync"
              >
                <BookOpen className="w-5 h-5" aria-hidden="true" />
                Start Studying
                <ArrowRight
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 px-6 py-4 rounded-2xl text-white/60 font-medium hover:text-white/80 hover:bg-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#030014]"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <MessageSquare className="w-5 h-5" aria-hidden="true" />
                See How It Works
              </a>
            </motion.div>

            {/* Mockup */}
            <HeroMockup />
          </div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*  How It Works Section                                         */}
      {/* ============================================================ */}
      <section
        id="how-it-works"
        className="py-24 px-6"
        aria-labelledby="how-it-works-heading"
      >
        <div className="max-w-5xl mx-auto">
          <motion.h2
            {...fadeUpView(0)}
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl font-bold text-center mb-4"
          >
            How it <span className="gradient-text">works</span>
          </motion.h2>
          <motion.p
            {...fadeUpView(0.05)}
            className="text-center text-white/40 mb-16 max-w-xl mx-auto"
          >
            From upload to insight in four simple steps.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <StepCard key={step.step} step={step} index={i} />
            ))}
          </div>

          {/* Connecting line (desktop only) */}
          <div className="hidden lg:flex items-center justify-center mt-8 px-12">
            <motion.div
              {...fadeUpView(0.3)}
              className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Features Section                                             */}
      {/* ============================================================ */}
      <section
        id="features"
        className="py-24 px-6"
        aria-labelledby="features-heading"
      >
        <div className="max-w-5xl mx-auto">
          <motion.h2
            {...fadeUpView(0)}
            id="features-heading"
            className="text-3xl sm:text-4xl font-bold text-center mb-4"
          >
            Built for <span className="gradient-text">serious students</span>
          </motion.h2>
          <motion.p
            {...fadeUpView(0.05)}
            className="text-center text-white/40 mb-16 max-w-xl mx-auto"
          >
            Every feature designed to help you study smarter, not harder.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Tech Stack Section                                           */}
      {/* ============================================================ */}
      <section
        className="py-24 px-6"
        aria-labelledby="tech-stack-heading"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUpView(0)} className="text-center mb-4">
            <div className="inline-flex items-center gap-2 mb-4">
              <TechIcon className="w-5 h-5 text-violet-400" />
              <span className="text-sm text-violet-400 font-semibold uppercase tracking-wider">
                Technology
              </span>
            </div>
            <h2
              id="tech-stack-heading"
              className="text-3xl sm:text-4xl font-bold"
            >
              Modern <span className="gradient-text">tech stack</span>
            </h2>
          </motion.div>
          <motion.p
            {...fadeUpView(0.05)}
            className="text-center text-white/40 mb-16 max-w-xl mx-auto"
          >
            Built with the best open-source tools for performance, developer
            experience, and reliability.
          </motion.p>

          <div className="flex flex-wrap justify-center gap-4">
            {techStack.map((tech, i) => (
              <TechBadge key={tech.name} tech={tech} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Architecture Overview                                        */}
      {/* ============================================================ */}
      <section className="py-24 px-6" aria-labelledby="architecture-heading">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            {...fadeUpView(0)}
            id="architecture-heading"
            className="text-3xl sm:text-4xl font-bold text-center mb-4"
          >
            How it all <span className="gradient-text">connects</span>
          </motion.h2>
          <motion.p
            {...fadeUpView(0.05)}
            className="text-center text-white/40 mb-16 max-w-xl mx-auto"
          >
            A Retrieval-Augmented Generation pipeline that turns your PDFs into
            an intelligent knowledge base.
          </motion.p>

          <motion.div
            {...fadeUpView(0.1)}
            className="rounded-3xl p-8 sm:p-10"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {/* Upload column */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Upload className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-white">Ingest</h3>
                <p className="text-xs text-white/40 leading-relaxed max-w-[200px]">
                  PDFs are parsed with pdf-parse and split into overlapping
                  chunks via LangChain.
                </p>
              </div>

              {/* Arrow (desktop) */}
              <div className="hidden md:flex items-center justify-center" aria-hidden="true">
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg">
                    <Database className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Embed and Store</h3>
                  <p className="text-xs text-white/40 leading-relaxed max-w-[200px]">
                    HuggingFace embeds each chunk into 384-dim vectors stored
                    in Supabase pgvector.
                  </p>
                </div>
              </div>

              {/* Mobile middle step */}
              <div className="flex md:hidden flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg">
                  <Database className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-white">Embed and Store</h3>
                <p className="text-xs text-white/40 leading-relaxed max-w-[200px]">
                  HuggingFace embeds each chunk into 384-dim vectors stored in
                  Supabase pgvector.
                </p>
              </div>

              {/* Retrieve column */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Cpu className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-white">Retrieve and Answer</h3>
                <p className="text-xs text-white/40 leading-relaxed max-w-[200px]">
                  Queries are embedded, matched against your docs, and answered
                  by Groq LLaMA 3.3 70B with citations.
                </p>
              </div>
            </div>

            {/* Flow arrows */}
            <div className="hidden md:flex items-center justify-between px-16 mt-6" aria-hidden="true">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-violet-500/40 to-indigo-500/40" />
              <ArrowRight className="w-4 h-4 text-indigo-400 mx-2" />
              <div className="flex-1 h-[1px] bg-gradient-to-r from-indigo-500/40 to-amber-500/40" />
              <ArrowRight className="w-4 h-4 text-amber-400 mx-2" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA Section                                                  */}
      {/* ============================================================ */}
      <section className="py-24 px-6" aria-label="Call to action">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="rounded-3xl p-12"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to study <span className="gradient-text">smarter</span>?
            </h2>
            <p className="text-white/40 mb-8 max-w-md mx-auto">
              Upload your first PDF and experience AI-powered studying.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg hover:from-violet-500 hover:to-indigo-500 transition-all shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#030014]"
              aria-label="Launch ScholarSync application"
            >
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              Launch ScholarSync
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Footer                                                       */}
      {/* ============================================================ */}
      <footer
        className="py-12 px-6 border-t border-white/5"
        role="contentinfo"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                Scholar<span className="text-violet-400">Sync</span>
              </span>
            </div>

            {/* Links */}
            <nav aria-label="Footer navigation">
              <ul className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
                <li>
                  <a
                    href="https://github.com/lekhanpro/scholarsync"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-white/70 transition-colors focus:outline-none focus:text-white/70"
                  >
                    <Github className="w-4 h-4" aria-hidden="true" />
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/lekhanpro/scholarsync/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white/70 transition-colors focus:outline-none focus:text-white/70"
                  >
                    Report Issue
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/lekhanpro/scholarsync/blob/main/CONTRIBUTING.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white/70 transition-colors focus:outline-none focus:text-white/70"
                  >
                    Contribute
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/lekhanpro/scholarsync/blob/main/LICENSE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white/70 transition-colors focus:outline-none focus:text-white/70"
                  >
                    MIT License
                  </a>
                </li>
              </ul>
            </nav>

            {/* Version */}
            <div className="flex items-center gap-3 text-sm text-white/20">
              <span>
                Made with{" "}
                <Heart
                  className="inline w-3.5 h-3.5 text-red-400/60"
                  aria-label="love"
                />{" "}
                by{" "}
                <a
                  href="https://github.com/lekhanpro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white/60 transition-colors"
                >
                  lekhanpro
                </a>
              </span>
              <span className="font-mono">v1.0.0</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-white/15">
            Copyright 2025 ScholarSync. Released under the MIT License.
          </div>
        </div>
      </footer>
    </div>
  );
}
