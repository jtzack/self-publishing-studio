import './index.css'
import { useState, useEffect, useRef } from 'react'
import * as Fathom from 'fathom-client'

const DEFAULT_CTA_URL = 'https://ship.samcart.com/products/self-publishing-studio-live'

// Cart closes at midnight ET the night before Session 1 (June 1, 2026)
const CART_CLOSE_DATE = new Date('2026-06-01T03:59:00Z')

const trackCTA = (location: string) => Fathom.trackEvent(`CTA: ${location}`)

/* ─── Fade-up on scroll ─── */
function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className={className} style={{
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      opacity: visible ? 1 : 0,
      transition: `transform 420ms cubic-bezier(0.16, 0.84, 0.36, 1) ${delay}ms, opacity 420ms ease ${delay}ms`,
    }}>{children}</div>
  )
}

/* ─── Eyebrow ─── */
function Eyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-sans text-[12px] font-bold uppercase tracking-caps text-butter-500 ${className}`}>
      {children}
    </p>
  )
}

/* ─── Display headline (Barlow Semi Condensed Black, all-caps, tight) ─── */
function Display({
  children,
  size = 'l',
  className = '',
  style,
  as: Tag = 'h2',
}: {
  children: React.ReactNode
  size?: 'xl' | 'l' | 'm' | 's'
  className?: string
  style?: React.CSSProperties
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div'
}) {
  const sizeClass = {
    xl: 'text-[clamp(64px,11vw,168px)]',
    l: 'text-[clamp(48px,8vw,112px)]',
    m: 'text-[clamp(40px,6vw,80px)]',
    s: 'text-[clamp(28px,4vw,48px)]',
  }[size]
  return (
    <Tag className={`font-display font-black uppercase leading-display tracking-display ${sizeClass} ${className}`} style={style}>
      {children}
    </Tag>
  )
}

/* ─── Primary CTA (butter, hard cast shadow) ─── */
function PrimaryCTA({
  children,
  href = DEFAULT_CTA_URL,
  big,
  className = '',
  onRef,
  track,
}: {
  children: React.ReactNode
  href?: string
  big?: boolean
  className?: string
  onRef?: React.Ref<HTMLAnchorElement>
  track?: string
}) {
  return (
    <a
      ref={onRef}
      href={href}
      onClick={() => track && trackCTA(track)}
      className={`inline-block font-sans font-bold uppercase bg-butter-500 text-ink-900 rounded-[3px] transition-colors duration-150 hover:bg-butter-400 active:bg-butter-600 ${
        big
          ? 'px-9 py-5 text-[16px] tracking-[0.08em] shadow-hard'
          : 'px-6 py-3.5 text-[13px] tracking-[0.08em] shadow-hard-sm'
      } ${className}`}
    >
      {children}
    </a>
  )
}

/* ─── Countdown Timer ─── */
function CountdownTimer({ targetDate, compact, onLight }: { targetDate: Date; compact?: boolean; onLight?: boolean }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    function calc() {
      const diff = targetDate.getTime() - new Date().getTime()
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      }
    }
    setTimeLeft(calc())
    const id = setInterval(() => setTimeLeft(calc()), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  if (compact) {
    return (
      <span className="font-mono text-[13px] text-ink-300 tabular-nums">
        {String(timeLeft.days).padStart(2, '0')}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    )
  }

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hrs', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Sec', value: timeLeft.seconds },
  ]

  return (
    <div className="inline-flex gap-3">
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center">
          <span className="font-display font-black text-[28px] leading-none rounded-[2px] px-3 py-2 min-w-[52px] text-center tabular-nums bg-butter-500 text-ink-900">
            {String(u.value).padStart(2, '0')}
          </span>
          <span className={`font-sans text-[10px] font-bold uppercase tracking-caps mt-1.5 ${onLight ? 'text-ink-900/60' : 'text-ink-300'}`}>{u.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   HERO — Two-tone headline left, overlapping captain circles right
   Designed to fit within one viewport at 1366×768, 1440×900, 1920×1080.
   ═══════════════════════════════════════════════════════════ */
function Hero({ ctaRef }: { ctaRef: React.RefObject<HTMLAnchorElement | null> }) {
  return (
    <section id="top" className="relative bg-ink-900 overflow-hidden flex flex-col min-h-screen">
      {/* Book-pattern texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/images/sps/book-pattern.svg')",
          backgroundSize: '600px',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
          opacity: 0.35,
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 100%)',
        }}
      />

      {/* Top announcement pill */}
      <div className="relative flex justify-center pt-5 md:pt-6 pb-1 px-3 flex-shrink-0 z-10">
        <div className="inline-flex items-center gap-2 border border-ink-600 rounded-full px-4 md:px-5 py-1.5 bg-ink-900/60">
          <span className="w-2 h-2 rounded-full bg-butter-500 animate-pulse flex-shrink-0" />
          <span className="font-sans text-[10px] md:text-[11px] text-paper-200 uppercase tracking-caps whitespace-nowrap">
            Live Bootcamp Begins Monday, June 1, 2026
          </span>
        </div>
      </div>

      {/* Main content — fills remaining viewport */}
      <div className="relative flex-1 flex items-center w-full z-10">
        <div className="max-w-container mx-auto w-full px-5 md:px-8 py-6 md:py-8 grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-14 items-center">
          {/* Left — eyebrow + headline + subhead + CTA + countdown */}
          <div className="max-w-[680px] mx-auto lg:mx-0 text-center lg:text-left">
            <p className="font-sans font-bold uppercase tracking-caps text-butter-500 mb-4 md:mb-5" style={{ fontSize: 'clamp(11px, 0.95vw, 14px)' }}>
              Self-Publishing Studio LIVE
            </p>
            <h1
              className="font-display font-black uppercase text-paper-100 tracking-display mb-5"
              style={{ fontSize: 'clamp(40px, 4.8vw, 72px)', lineHeight: 0.98 }}
            >
              How To Write Your<br />
              First (Or Next)<br />
              <span className="text-butter-500">Non-Fiction Book</span><br />
              In 14 Days
            </h1>
            <p
              className="font-serif text-paper-200 mb-6 max-w-[560px] mx-auto lg:mx-0"
              style={{ fontSize: 'clamp(15px, 1.3vw, 19px)', lineHeight: 1.5 }}
            >
              Write, publish, and market a book that builds your business and finally position yourself
              as an authority in your niche.
            </p>
            <a
              ref={ctaRef}
              href={DEFAULT_CTA_URL}
              onClick={() => trackCTA('Hero')}
              className="block w-full sm:max-w-[520px] text-center mx-auto lg:mx-0 bg-butter-500 text-ink-900 font-sans font-bold uppercase tracking-[0.08em] rounded-[3px] shadow-hard hover:bg-butter-400 active:bg-butter-600 transition-colors"
              style={{ padding: '20px 28px', fontSize: 'clamp(13px, 1.1vw, 16px)' }}
            >
              Join Self-Publishing Studio LIVE
            </a>
            <p className="font-sans text-[10px] uppercase tracking-caps text-ink-300 mt-5 mb-2.5">Cart closes in</p>
            <CountdownTimer targetDate={CART_CLOSE_DATE} />
          </div>

          {/* Right — overlapping captain circles + small book-icon accent */}
          <div className="hidden md:flex justify-center lg:justify-end items-center">
            <div className="relative w-[320px] h-[380px] lg:w-[420px] lg:h-[440px]">
              {/* Small book-icon decoration — upper area, butter background */}
              <div className="absolute left-[70px] top-0 z-30 lg:left-[100px]">
                <div
                  className="w-[72px] h-[72px] lg:w-[88px] lg:h-[88px] rounded-full flex items-center justify-center border-4 border-ink-900"
                  style={{ backgroundColor: '#EFE183', boxShadow: '0 8px 16px rgba(0,0,0,0.35)' }}
                >
                  <span className="text-[36px] lg:text-[44px] leading-none" aria-hidden="true" role="img">📖</span>
                </div>
              </div>

              {/* Dickie Bush — top-right, forest bg, behind */}
              <div className="absolute right-0 top-0 z-10 flex flex-col items-center">
                <div
                  className="w-[170px] h-[170px] lg:w-[210px] lg:h-[210px] rounded-full overflow-hidden border-4 border-ink-900"
                  style={{ backgroundColor: '#4A7C59' }}
                >
                  <img src="/images/sps/dickie-circle.png" alt="Dickie Bush" className="w-full h-full object-cover object-top" />
                </div>
                <p className="font-display font-black uppercase text-paper-100 mt-2.5 text-[16px] lg:text-[18px] tracking-caps-lg">Dickie Bush</p>
                <p className="font-sans text-[10px] font-bold uppercase tracking-caps text-ink-300 mt-1 text-center">Co-Founder,<br />Ship 30 for 30</p>
              </div>

              {/* Nicolas Cole — bottom-left, rust bg, in front (overlaps Dickie) */}
              <div className="absolute left-0 bottom-0 z-20 flex flex-col items-center">
                <div
                  className="w-[210px] h-[210px] lg:w-[260px] lg:h-[260px] rounded-full overflow-hidden border-4 border-ink-900"
                  style={{ backgroundColor: '#B8633A' }}
                >
                  <img src="/images/sps/cole-circle.png" alt="Nicolas Cole" className="w-full h-full object-cover object-top" />
                </div>
                <p className="font-display font-black uppercase text-paper-100 mt-2.5 text-[16px] lg:text-[18px] tracking-caps-lg">Nicolas Cole</p>
                <p className="font-sans text-[10px] font-bold uppercase tracking-caps text-ink-300 mt-1 text-center">Co-Founder,<br />Premium Ghostwriting Academy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   WHY WRITE A BOOK — The opportunity
   ═══════════════════════════════════════════════════════════ */
function WhyWriteABook() {
  const reasons = [
    {
      num: '01',
      title: 'Master the craft.',
      body: 'Writing a book is the ultimate stress-test for whether you truly understand a topic. Finish one and you finish a version of yourself.',
    },
    {
      num: '02',
      title: 'Claim the authority.',
      body: "A book is the new business card. The moment you're an author, your positioning in your niche goes up — full stop.",
    },
    {
      num: '03',
      title: 'Build a business asset.',
      body: "A great non-fiction book is the front door to your entire ecosystem — the asset that turns readers into subscribers, students, and clients.",
    },
  ]

  return (
    <section className="bg-paper-100 py-20 md:py-28 px-5 md:px-8">
      <div className="max-w-container mx-auto">
        <Eyebrow className="text-rust-500 mb-3">The opportunity</Eyebrow>
        <Display size="m" className="text-ink-900 mb-12 max-w-[920px]">
          Why Write A Book?<br />
          <span className="text-rust-500">And Why Now?</span>
        </Display>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reasons.map((r) => (
            <div key={r.num} className="bg-paper-200 border border-paper-300 rounded-[4px] p-7 md:p-8 flex flex-col">
              <p className="font-display font-black text-[clamp(40px,4.5vw,60px)] leading-none text-rust-500 mb-4">{r.num}</p>
              <Display size="s" as="h3" className="text-ink-900 mb-3" style={{ fontSize: 'clamp(22px, 2.4vw, 30px)' }}>{r.title}</Display>
              <p className="font-serif text-[16px] leading-[1.55] text-ink-700">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   WHAT IS THE BOOTCAMP — Product box + six stat cards
   ═══════════════════════════════════════════════════════════ */
function Stats() {
  const stats = [
    { num: '6', label: 'Live Sessions', desc: '3 per week over 2 weeks. 60 min each. 3:00 PM ET.' },
    { num: '14', label: 'Days To Finish Your Book', desc: 'From blank page to a finished, ready-to-publish manuscript.' },
    { num: '6', label: 'AI Writing Assets', desc: 'Plug-and-play prompts and templates for every step.' },
    { num: '3', label: 'Mini-Courses', desc: 'Manuscript OS, Self-Publishing Empire, Book Launch Blueprint.' },
    { num: '3', label: 'Fast-Action Bonuses', desc: 'Indie vs Traditional, AI Author Autopilot, Book Monetization Mastery.' },
    { num: '2', label: 'World-Class Instructors', desc: 'Nicolas Cole & Dickie Bush — authors and digital publishers.' },
  ]

  return (
    <section className="bg-ink-900 py-20 md:py-28 px-5 md:px-8 border-t border-ink-700">
      <div className="max-w-container mx-auto">
        {/* Centered headline with small rust accent line */}
        <div className="flex flex-col items-center mb-14">
          <div className="w-16 h-[3px] bg-rust-500 mb-7" />
          <Display size="m" className="text-paper-100 text-center" style={{ fontSize: 'clamp(28px, 4.2vw, 56px)' }}>
            What Is Self-Publishing<br />
            <span className="text-butter-500">Studio LIVE?</span>
          </Display>
        </div>

        {/* Two-column: product box left, 2x3 stat grid right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-14 items-center">
          {/* Left — product box */}
          <div className="flex justify-center">
            <img
              src="/images/sps/product-box-sps.png"
              alt="Self-Publishing Studio LIVE"
              className="w-full max-w-[420px] drop-shadow-[20px_30px_40px_rgba(0,0,0,0.6)]"
              loading="lazy"
            />
          </div>

          {/* Right — 2x3 stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-ink-800 border border-ink-700 rounded-[4px] p-5 md:p-6 flex flex-col">
                <p className="font-display font-black text-rust-500 leading-none mb-3" style={{ fontSize: 'clamp(36px, 3.8vw, 52px)' }}>{s.num}</p>
                <p className="font-sans text-[12px] font-bold uppercase tracking-caps text-paper-100 mb-2 leading-tight">{s.label}</p>
                <p className="font-serif text-[13px] md:text-[14px] leading-[1.5] text-ink-200">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Centered CTA below */}
        <div className="mt-14 text-center">
          <a
            href={DEFAULT_CTA_URL}
            onClick={() => trackCTA('Stats')}
            className="inline-block bg-butter-500 text-ink-900 font-sans font-bold uppercase tracking-[0.08em] rounded-[3px] shadow-hard hover:bg-butter-400 transition-colors"
            style={{ padding: '20px 36px', fontSize: 'clamp(13px, 1vw, 15px)' }}
          >
            Join Self-Publishing Studio LIVE
          </a>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   IS THIS FOR YOU — Accordion of em-stressed questions
   ═══════════════════════════════════════════════════════════ */
function IsThisForYou() {
  const questions = [
    {
      q: "Have you been <em>'writing a book' for years</em> but never actually finished it?",
      a: "We've all been there — notes in a Google Doc, a half-finished draft you haven't opened in months, and a vague sense the world is missing the book you're meant to write. Self-Publishing Studio LIVE gives you the system, the structure, and the deadlines to finally ship it. Most students draft their first book in weeks, not years.",
    },
    {
      q: "Do you have <em>the expertise</em> but not the <em>system</em> to turn it into a book?",
      a: "You know your subject cold. What you don't know is how to organize it into chapters, how to outline a non-fiction book that actually sells, how to publish on Amazon, and how to market it after launch. This studio gives you the exact framework Cole has used across 10+ books and $500,000+ in royalties.",
    },
    {
      q: "Do you want a book that <em>builds your business</em> — not just sits on a shelf?",
      a: "Most books don't make money because most authors treat the book as the product. Inside the studio you'll learn how to treat your book as the front door to your business — the asset that turns readers into newsletter subscribers, digital product buyers, and clients. A $10 book becomes a $10,000 customer.",
    },
    {
      q: "Are you tired of writing posts and essays <em>into the void</em> with nothing to sell?",
      a: "You've built an audience on X, LinkedIn, or Substack. A book is the asset that compounds — it positions you as the authority in your niche, on autopilot. Inside, we walk you through the exact launch strategy that's sold tens of thousands of books without a PR firm or podcast tour.",
    },
    {
      q: "Do you want to use AI to <em>accelerate</em> — without producing generic AI slop?",
      a: "There's a difference between AI-generated slop (which Amazon flags and reputable readers hate) and AI-assisted authorship (which is the new standard). Inside Manuscript OS and AI Author Autopilot, you'll learn how to use AI as a power tool while keeping every page recognizably yours.",
    },
  ]

  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="bg-ink-900 py-20 md:py-28 px-5 md:px-8">
      <div className="max-w-narrow mx-auto">
        <div className="border-l-[6px] border-butter-500 pl-5 mb-10">
          <Eyebrow className="mb-2">Let's find out.</Eyebrow>
          <Display size="m" className="text-paper-100">Is the bootcamp right for you?</Display>
        </div>

        <div className="space-y-3">
          {questions.map((q, i) => (
            <div
              key={i}
              className={`bg-ink-900 border rounded-[4px] px-6 py-5 cursor-pointer transition-colors ${
                open === i ? 'border-butter-500/50' : 'border-ink-700 hover:border-ink-600'
              }`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div className="flex items-center justify-between gap-4">
                <h3
                  className="font-sans text-[16px] md:text-[18px] text-paper-100 font-medium [&_em]:not-italic [&_em]:text-butter-500 [&_em]:font-bold"
                  dangerouslySetInnerHTML={{ __html: q.q }}
                />
                <span className={`font-display font-black text-[24px] leading-none flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-45 text-butter-500' : 'text-ink-400'}`}>
                  +
                </span>
              </div>
              {open === i && (
                <p className="font-serif text-[15px] md:text-[16px] text-paper-200 leading-[1.6] mt-4 pb-1">{q.a}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="font-serif text-[18px] italic text-ink-200 mb-6">If any of these sound like you&hellip; this bootcamp was made for you.</p>
          <PrimaryCTA big track="Is This For You">Join Self-Publishing Studio LIVE</PrimaryCTA>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   CURRICULUM — 6 sessions on a vertical timeline
   ═══════════════════════════════════════════════════════════ */
function Curriculum() {
  const sessions = [
    { num: 1, date: 'Mon Jun 1', title: 'The Perfect Book Title', desc: 'How to craft a title that positions you as the authority in your niche, attracts the right reader, and ranks on Amazon.', asset: 'The Perfect Book Title Generator' },
    { num: 2, date: 'Wed Jun 3', title: 'Your Origin Story (Credibility & POV)', desc: 'Why people will read YOUR book — your earned authority, your unique angle, and the story only you can tell.', asset: 'Origin Story Interview Prompt' },
    { num: 3, date: 'Fri Jun 5', title: 'Outlining Your Book', desc: "Reverse-engineer a bulletproof outline from your reader's questions. Walk away with a complete skeleton you can draft against.", asset: 'Book Outline Crafter' },
    { num: 4, date: 'Mon Jun 8', title: 'Outlining Each Chapter', desc: 'The chapter-level framework Cole has used across 10+ books. Clear, valuable, and actually enjoyable to read.', asset: 'The Perfect Book Chapter Template' },
    { num: 5, date: 'Wed Jun 10', title: 'Book Writing Fundamentals', desc: 'How to draft without getting stuck. Use AI to accelerate the heavy lifting while keeping every page recognizably yours.', asset: 'Book Chapter Autowriter' },
    { num: 6, date: 'Fri Jun 12', title: 'Book Launch Blueprint', desc: "The evergreen marketing strategy that's generated $500K+ in royalties — without a PR firm, podcast tour, or massive budget.", asset: 'Book Launch Checklist' },
  ]

  return (
    <section id="curriculum" className="bg-paper-100 py-20 md:py-28 px-5 md:px-8">
      <div className="max-w-narrow mx-auto">
        <Eyebrow className="text-rust-500 mb-3 text-center">The 6 live sessions</Eyebrow>
        <Display size="m" className="text-ink-900 text-center mb-3">
          Here's what<br /><span className="text-rust-500">you'll build.</span>
        </Display>
        <p className="font-serif text-[15px] text-ink-700 text-center mb-14">
          All sessions 60 min &middot; M/W/F &middot; 3:00 PM ET &middot; June 1 &ndash; June 12, 2026
        </p>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line — desktop center */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-rust-500/30 -translate-x-1/2" />
          {/* Vertical line — mobile left */}
          <div className="md:hidden absolute left-5 top-0 bottom-0 w-[2px] bg-rust-500/30" />

          <div className="space-y-10 md:space-y-14">
            {sessions.map((s) => {
              const isEven = s.num % 2 === 0
              return (
                <div key={s.num} className="relative">
                  {/* Numbered circle on the line */}
                  <div className="absolute z-10 w-11 h-11 rounded-full bg-ink-900 border-2 border-butter-500 flex items-center justify-center left-0 md:left-1/2 md:-translate-x-1/2">
                    <span className="font-display font-black text-[18px] text-butter-500 leading-none">{s.num}</span>
                  </div>

                  {/* Content — desktop alternates, mobile always right */}
                  <div className={`pl-16 md:pl-0 md:w-[45%] ${isEven ? 'md:ml-auto md:pl-14' : 'md:mr-auto md:pr-14 md:text-right'}`}>
                    <span className="inline-block bg-ink-900 text-butter-500 font-sans text-[11px] font-bold uppercase tracking-caps px-3 py-1 rounded-[2px] mb-2.5">
                      {s.date}
                    </span>
                    <Display size="s" as="h3" className="text-ink-900 mb-2.5" style={{ fontSize: 'clamp(22px, 2.5vw, 30px)' }}>{s.title}</Display>
                    <p className="font-serif text-[15px] text-ink-700 leading-[1.55] mb-3">{s.desc}</p>
                    <div className={`inline-block bg-paper-200 border border-paper-300 rounded-[2px] px-3 py-1.5 ${isEven ? '' : 'md:ml-auto'}`}>
                      <p className="font-sans text-[10px] font-bold uppercase tracking-caps text-rust-500 mb-0.5">Asset included</p>
                      <p className="font-sans text-[13px] font-semibold text-ink-900">{s.asset}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Closing */}
        <div className="mt-16 text-center">
          <Display size="s" className="text-ink-900 leading-[1.05] mb-5" style={{ fontSize: 'clamp(22px, 3vw, 36px)' }}>
            We build <span className="text-rust-500">together</span>.<br />
            You leave with <span className="text-rust-500">a finished manuscript</span>.
          </Display>
          <p className="font-serif text-[16px] text-ink-700 mb-8">
            This isn't self-paced content you buy and forget.
          </p>
          <a
            href={DEFAULT_CTA_URL}
            onClick={() => trackCTA('Curriculum')}
            className="inline-block bg-ink-900 text-butter-500 font-sans font-bold uppercase text-[15px] tracking-[0.08em] px-9 py-5 rounded-[3px] hover:bg-ink-800 transition-colors shadow-hard"
          >
            Join Self-Publishing Studio LIVE
          </a>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   CAPTAINS — Cole + Dickie
   ═══════════════════════════════════════════════════════════ */
function Captains() {
  const captains = [
    {
      name: 'Nicolas Cole',
      role: 'Co-Founder, Ship 30 for 30 & Premium Ghostwriting Academy',
      img: '/images/sps/cole-headshot.png',
      bio: 'Author of 10+ non-fiction books, including The Art & Business of Online Writing. #1 most-read writer on Quora with 100M+ views. Co-founder of Ship 30 for 30 and Premium Ghostwriting Academy. Generated $500,000+ in self-published royalties on the back of his books.',
    },
    {
      name: 'Dickie Bush',
      role: 'Co-Founder, Ship 30 for 30',
      img: '/images/sps/dickie-headshot.png',
      bio: 'Former Wall Street trader at BlackRock turned digital entrepreneur. Creator of Ship 30 for 30—the fastest-growing cohort-based writing program on the internet. Used email and newsletters to sell $20,000,000 in digital products.',
    },
  ]

  const stats = [
    '10+ Published Books',
    '$500,000+ In Royalties',
    '10,000+ Students Taught',
    '$20M+ In Digital Products',
  ]

  return (
    <section id="captains" className="bg-ink-900 py-20 md:py-28 px-5 md:px-8">
      <div className="max-w-container mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-start">
        {/* Left — headline + subhead + stat pills */}
        <div>
          <Eyebrow className="text-rust-500 mb-5">Meet Your Instructors</Eyebrow>
          <Display size="m" className="text-paper-100 mb-6">
            Built by a best-selling author<br />
            <span className="text-butter-500">with 10+ published books.</span>
          </Display>
          <p className="font-serif text-[17px] text-ink-200 leading-[1.55] max-w-[520px] mb-8">
            Created by the founders of Ship 30 for 30 &amp; Premium Ghostwriting Academy.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {stats.map((s) => (
              <span key={s} className="inline-flex items-center bg-rust-500 text-paper-100 font-sans text-[12px] font-bold uppercase tracking-caps px-4 py-2 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Right — stacked instructor cards */}
        <div className="flex flex-col gap-5">
          {captains.map((c) => (
            <div key={c.name} className="flex gap-5 items-start">
              <div className="w-[88px] h-[88px] md:w-[96px] md:h-[96px] rounded-[4px] overflow-hidden flex-shrink-0 border border-ink-700">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover object-top" />
              </div>
              <div>
                <p className="font-display font-black text-[20px] md:text-[22px] text-paper-100 uppercase tracking-caps-lg leading-none">{c.name}</p>
                <p className="font-sans font-bold text-[11px] uppercase tracking-caps text-rust-500 mt-2 mb-3">{c.role}</p>
                <p className="font-serif text-[15px] leading-[1.55] text-ink-200">{c.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Book covers row — quiet evidence under the stat-pill claim */}
      <div className="max-w-container mx-auto mt-12 lg:mt-16 pt-10 lg:pt-12 border-t border-ink-700">
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
          {[
            { src: '/images/sps/book_artbiz.webp', alt: 'The Art & Business of Online Writing' },
            { src: '/images/sps/book_ghost.webp', alt: 'The Art & Business of Ghostwriting' },
            { src: '/images/sps/book_22laws.jpg', alt: 'The 22 Laws of Online Writing' },
            { src: '/images/sps/book_niche.jpg', alt: 'Niche Down' },
            { src: '/images/sps/book_pillars.png', alt: 'The 8 Pillars of Premium Ghostwriting' },
            { src: '/images/sps/book_career.webp', alt: 'Writer Career Paths' },
            { src: '/images/sps/book_confessions.webp', alt: 'Confessions of a Teenage Gamer' },
            { src: '/images/sps/book_snow.jpg', alt: 'Snow Leopard' },
          ].map((c) => (
            <div
              key={c.src}
              className="aspect-[2/3] overflow-hidden rounded-[2px] bg-ink-800 transition-transform duration-200 hover:-translate-y-1"
              style={{ boxShadow: '4px 4px 0 #08111F' }}
            >
              <img
                src={c.src}
                alt={c.alt}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   MINI-COURSES — Product box renders
   ═══════════════════════════════════════════════════════════ */
function MiniCourses() {
  const courses = [
    {
      img: '/images/sps/product-box-manuscriptos.png',
      eyebrow: 'Mini-Course #1',
      title: 'Manuscript OS',
      value: '$1,500 Value',
      desc: 'The complete system for writing your non-fiction book — from crafting a title that positions you as the authority in your niche, to building a bulletproof outline, to writing chapters that are clear, valuable, and actually enjoyable to read.',
    },
    {
      img: '/images/sps/product-box-playbook.png',
      eyebrow: 'Mini-Course #2',
      title: 'Self-Publishing Empire',
      value: '$1,500 Value',
      desc: 'Everything you need to format, upload, and publish your book on Amazon — including how to research the right categories, write a book description that converts, and price your book, eBook, and audiobook for maximum revenue.',
    },
    {
      img: '/images/sps/product-box-blueprint.png',
      eyebrow: 'Mini-Course #3',
      title: 'Book Launch Blueprint',
      value: '$1,500 Value',
      desc: 'The evergreen marketing strategy used to sell tens of thousands of books and generate over $500,000 in self-published royalties — without a PR firm, a podcast tour, or a massive launch budget.',
    },
  ]

  return (
    <section className="bg-ink-900 py-20 md:py-28 px-5 md:px-8">
      <div className="max-w-container mx-auto">
        <Eyebrow className="mb-4">Video &amp; Text Curriculum</Eyebrow>
        <Display size="m" className="text-paper-100 max-w-[920px] mb-5">
          3 Self-Publishing<br /><span className="text-butter-500">Mini-Courses.</span>
        </Display>
        <p className="font-serif text-[18px] text-ink-200 mb-14 max-w-[720px]">
          Get access to the Self-Publishing Studio self-study course:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div key={c.title} className="flex flex-col items-center text-center">
              <div className="bg-ink-800 border border-ink-700 rounded-[4px] p-8 mb-6 w-full flex items-center justify-center" style={{ minHeight: 280 }}>
                <img src={c.img} alt={c.title} className="max-w-full max-h-[220px] object-contain drop-shadow-[10px_14px_20px_rgba(0,0,0,0.55)]" loading="lazy" />
              </div>
              <Eyebrow className="mb-2">{c.eyebrow}</Eyebrow>
              <Display size="s" as="h3" className="text-paper-100 mb-2">{c.title}</Display>
              <p className="font-sans font-bold text-[14px] text-butter-500 tracking-caps mb-3">{c.value}</p>
              <p className="font-serif text-[15px] leading-[1.55] text-ink-200">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   BONUSES — 3 cards
   ═══════════════════════════════════════════════════════════ */
function Bonuses() {
  const bonuses: { num: number; icon: string; title: string; value: string; desc: string; expires?: string }[] = [
    {
      num: 1,
      icon: '/images/sps/bonus_1.png',
      title: 'Indie vs. Traditional Crash Course',
      value: '$497 Value',
      desc: 'Should you self-publish or try to land a book deal? Most writers spend months going back and forth. This crash course breaks down both paths — the real tradeoffs, the money, the timeline, the creative control — so you can make the right decision for your book and your business, fast.',
    },
    {
      num: 2,
      icon: '/images/sps/bonus_2.png',
      title: 'AI Author Autopilot',
      value: '$997 Value',
      expires: 'Expires May 26, 2026',
      desc: "Don't have time to write a book? This bonus gives you the exact AI system used to accelerate every stage of the writing process — from outlining to drafting to editing — without producing the kind of generic AI slop that kills your credibility. You do the thinking. AI handles the heavy lifting.",
    },
    {
      num: 3,
      icon: '/images/sps/bonus_3.png',
      title: 'Book Monetization Mastery',
      value: '$997 Value',
      expires: 'Expires May 29, 2026',
      desc: "Most books don't make money — because most authors treat the book as the product. This bonus shows you how to treat your book as the front door to your business: the entry point that turns readers into newsletter subscribers, digital product buyers, clients, and more. This is how a $10 book becomes a $10,000 customer.",
    },
  ]

  return (
    <section id="bonuses" className="bg-ink-800 py-20 md:py-28 px-5 md:px-8">
      <div className="max-w-container mx-auto">
        <Eyebrow className="mb-4">Free Bonuses Included</Eyebrow>
        <Display size="m" className="text-paper-100 max-w-[1000px] mb-14">
          Finally claim your badge<br />
          <span className="text-butter-500">of being an author.</span>
        </Display>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {bonuses.map((b) => (
            <div key={b.num} className="bg-ink-900 border border-ink-700 rounded-[4px] p-7 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <span className="font-sans text-[11px] font-bold uppercase tracking-caps text-butter-500 mt-2">
                  Bonus #{b.num}
                </span>
                <img src={b.icon} alt="" className="w-16 h-16 md:w-[72px] md:h-[72px] -mt-1 -mr-1" />
              </div>
              <Display size="s" as="h3" className="text-paper-100">{b.title}</Display>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="font-sans font-bold text-[14px] text-butter-500 tracking-caps">{b.value}</p>
                {b.expires && (
                  <p className="font-sans font-bold text-[11px] uppercase tracking-caps text-rust-400">&middot; {b.expires}</p>
                )}
              </div>
              <p className="font-serif text-[15px] leading-[1.55] text-ink-200">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   AI WRITING SKOOL — Free 30-Day Trial
   ═══════════════════════════════════════════════════════════ */
function AIWritingSkool() {
  const perks = [
    { title: 'AI Cole', desc: 'Our custom AI model trained on all of our programs, curriculums, books, and content. Ask it anything, 24/7.', value: '$5,000+ value' },
    { title: 'Monday Hot Seats with Cole', desc: 'Submit your questions and workshop your specific situation live.', value: '$3,000+ value' },
    { title: 'Weekly AI/Tech Clinic with Mitch Harris', desc: 'Office hours to troubleshoot, learn new AI tools, and stay on the cutting edge.', value: '$1,500+ value' },
    { title: 'Monthly Mini-Products, Templates, Prompts, and .Skills', desc: 'New resources dropped every month that you can download and use immediately.', value: '$1,000+ value' },
  ]

  return (
    <section className="bg-ink-900 py-20 md:py-28 px-5 md:px-8">
      <div className="max-w-container mx-auto">
        <Eyebrow className="mb-4">Included free with the bootcamp</Eyebrow>
        <Display size="m" className="text-paper-100 mb-4">
          30-Day Trial to<br /><span className="text-butter-500">AI Writing Skool.</span>
        </Display>
        <p className="font-serif text-[18px] text-ink-200 mb-12 max-w-[760px]">
          AI Writing Skool is THE community for writers and creators building in the new AI economy &mdash;
          and you get full access for 30 days so you can get feedback on your book, trade ideas, and stay sharp as you build.
        </p>

        <div className="flex flex-col md:flex-row gap-10 md:gap-12 items-start">
          <div className="w-full md:w-[45%] flex-shrink-0">
            <img src="/images/AIWS.png" alt="AI Writing Skool" className="w-full object-contain rounded-[4px] border border-ink-700" loading="lazy" />
          </div>
          <div className="flex-1">
            <Eyebrow className="mb-5">Inside, you'll unlock:</Eyebrow>
            <div className="space-y-5">
              {perks.map((p) => (
                <div key={p.title} className="flex gap-3">
                  <span className="text-butter-500 mt-1 flex-shrink-0">→</span>
                  <div>
                    <span className="font-sans text-[15px] font-bold text-paper-100">{p.title}:</span>
                    <span className="font-serif text-[15px] text-ink-200"> {p.desc}</span>
                    <span className="font-sans text-[13px] text-butter-500 font-semibold"> ({p.value})</span>
                  </div>
                </div>
              ))}
              <div className="flex gap-3">
                <span className="text-butter-500 mt-1 flex-shrink-0">→</span>
                <div>
                  <span className="font-sans text-[15px] font-bold text-paper-100">Daily Q&amp;A Channel:</span>
                  <span className="font-serif text-[15px] text-ink-200"> Never get stuck. Get answers from the community and our team every single day.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   PRICING — Offer stack
   ═══════════════════════════════════════════════════════════ */
function Pricing() {
  const items = [
    { name: '6 x 60-Minute Live Sessions', price: '$3,600' },
    { name: 'A 2-Week Build & Launch Schedule', price: '$1,000' },
    { name: 'The Bootcamp Session Guide', price: '$600' },
    { name: '6 Done-For-You Prompts & Templates', price: '$600' },
    { name: 'Mini-Course #1: Manuscript OS', price: '$1,500' },
    { name: 'Mini-Course #2: Self-Publishing Empire', price: '$1,500' },
    { name: 'Mini-Course #3: Book Launch Blueprint', price: '$1,500' },
    { name: 'Session Replays', price: '$300' },
    { name: 'Lifetime Access to the Curriculum', price: 'Priceless' },
    { name: 'BONUS: Indie vs. Traditional Crash Course', price: '$497' },
    { name: 'BONUS: AI Author Autopilot', price: '$997' },
    { name: 'BONUS: Book Monetization Mastery', price: '$997' },
    { name: '30-Day AI Writing Skool Trial', price: '$99' },
  ]

  return (
    <section id="pricing" className="bg-ink-800 py-24 md:py-32 px-5 md:px-8">
      <div className="max-w-narrow mx-auto text-center">
        <Eyebrow className="mb-4">Join The Bootcamp</Eyebrow>
        <h2
          className="font-display font-black uppercase text-paper-100 tracking-display mb-12"
          style={{ fontSize: 'clamp(28px, 4.2vw, 56px)', lineHeight: 1.0 }}
        >
          Want To Write Your<br />
          First (Or Next)<br />
          <span className="text-butter-500">Non-Fiction Book</span><br />
          In 14 Days?
        </h2>

        <div className="max-w-[560px] mx-auto rounded-[4px] overflow-hidden shadow-hard-lg">
          {/* Top: value stack */}
          <div className="bg-ink-900 border border-ink-700 border-b-0 p-7 md:p-9 text-left">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-ink-700 last:border-b-0 gap-4">
                <span className="font-sans text-[14px] text-paper-200">{item.name}</span>
                <span className="font-sans text-[14px] font-semibold text-ink-300 flex-shrink-0">{item.price}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 mt-3 border-t border-ink-600">
              <span className="font-sans text-[14px] font-bold text-paper-100">Total Value</span>
              <span className="font-display font-black text-[24px] text-paper-100 line-through decoration-rust-500 decoration-2">$13,190</span>
            </div>
          </div>

          {/* Bottom: price reveal — butter card */}
          <div className="bg-butter-500 p-7 md:p-9 text-center">
            <p className="font-sans text-[11px] font-bold uppercase tracking-caps text-ink-900/60">Your Price</p>
            <p className="font-display font-black text-[clamp(64px,10vw,96px)] text-ink-900 leading-none mt-2">$800</p>
            <a
              href={DEFAULT_CTA_URL}
              onClick={() => trackCTA('Pricing')}
              className="inline-block bg-ink-900 text-butter-500 font-sans font-bold uppercase text-[15px] tracking-[0.08em] px-9 py-5 rounded-[3px] mt-6 hover:bg-ink-800 transition-colors"
              style={{ boxShadow: '8px 8px 0 rgba(8,17,31,0.35)' }}
            >
              Join Self-Publishing Studio LIVE &rarr;
            </a>
            <p className="font-sans text-[12px] text-ink-900/70 mt-4">7-day money-back guarantee</p>
          </div>
        </div>

        <p className="font-sans text-[11px] uppercase tracking-caps text-ink-300 mt-10 mb-3">Enrollment closes in</p>
        <div className="inline-block"><CountdownTimer targetDate={CART_CLOSE_DATE} /></div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   PATTERN BOOK COVER — flat front with book-pattern texture,
   inline render of the "pattern" variant from the design bundle.
   ═══════════════════════════════════════════════════════════ */
function PatternBookCover({
  eyebrow = 'A NON-FICTION FIELD GUIDE',
  title = 'YOUR TITLE HERE',
  subtitle = "A field guide to writing and publishing the non-fiction book you've been meaning to write.",
  author = 'YOUR NAME HERE',
}: {
  eyebrow?: string
  title?: string
  subtitle?: string
  author?: string
}) {
  const fg = '#EFE183' // butter-500
  const bg = '#0C1929' // ink-900
  return (
    <div
      className="relative"
      style={{
        width: 'min(320px, 100%)',
        aspectRatio: '320 / 460',
        containerType: 'inline-size',
        boxShadow: '14px 14px 0 #0C1929, 0 30px 50px rgba(12,25,41,0.25)',
      }}
    >
      {/* Cover face */}
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          background: bg,
          backgroundImage:
            'url("/images/sps/book-pattern.svg"), radial-gradient(120% 80% at 30% 20%, rgba(255,255,255,0.04), transparent 60%)',
          backgroundSize: '56.25cqw auto, auto',
          backgroundBlendMode: 'screen, normal',
        }}
      >
        {/* Inner debossed frame */}
        <div
          className="absolute pointer-events-none"
          style={{ inset: '3.75cqw', border: '1px solid rgba(239,225,131,0.28)' }}
        />
        {/* Content stack */}
        <div className="absolute flex flex-col" style={{ inset: '6.875cqw' }}>
          {/* Eyebrow */}
          <div
            className="font-sans font-bold uppercase"
            style={{ fontSize: '3.125cqw', letterSpacing: '0.18em', color: fg, opacity: 0.85 }}
          >
            {eyebrow}
          </div>
          {/* Title + subtitle */}
          <div className="flex-1 flex flex-col justify-center min-h-0">
            <div
              className="font-display font-black uppercase"
              style={{
                fontSize: '18.75cqw',
                lineHeight: 0.86,
                letterSpacing: '-0.01em',
                color: fg,
                textWrap: 'balance' as React.CSSProperties['textWrap'],
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div
                className="font-sans"
                style={{
                  marginTop: '4.375cqw',
                  fontSize: '4.0625cqw',
                  lineHeight: 1.35,
                  color: fg,
                  opacity: 0.78,
                  maxWidth: '92%',
                  fontWeight: 500,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
          {/* Rule + author */}
          <div>
            <div style={{ height: '0.625cqw', width: '13.75cqw', background: fg, opacity: 0.6, marginBottom: '3.75cqw' }} />
            <div
              className="font-sans font-bold uppercase"
              style={{ fontSize: '3.4375cqw', letterSpacing: '0.22em', color: fg }}
            >
              {author}
            </div>
          </div>
        </div>
        {/* Sheen overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(110deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 28%, rgba(0,0,0,0.10) 80%, rgba(0,0,0,0.22) 100%)',
            opacity: 0.9,
          }}
        />
      </div>
      {/* Spine peek on the left */}
      <div
        aria-hidden="true"
        className="absolute top-0"
        style={{
          left: '-2.5cqw',
          width: '2.5cqw',
          height: '100%',
          background: 'linear-gradient(90deg, rgba(0,0,0,0.5), #08111F)',
        }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   GUARANTEE + FINAL CTA — Butter card
   ═══════════════════════════════════════════════════════════ */
function GuaranteeFinalCTA() {
  return (
    <section id="final-cta" className="bg-ink-900 py-20 md:py-28 px-5 md:px-8">
      <div className="max-w-container mx-auto">
        <div className="bg-butter-500 text-ink-900 p-10 md:p-14 rounded-[4px] shadow-hard-lg">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-14 items-center">
            {/* Copy column */}
            <div>
              <p className="font-sans text-[12px] font-bold uppercase tracking-caps text-ink-900 mb-6">
                Stop overthinking &middot; finally write the book
              </p>
              <Display size="l" className="text-ink-900 mb-6">
                Your book.<br />This year.
              </Display>
              <p className="font-serif text-[20px] leading-[1.55] text-ink-900 max-w-[560px] mb-9">
                Six live sessions, three mini-courses, six AI-powered writing assets, and three fast-action bonuses.
                Lifetime access. 7-day no-questions-asked refund if you show up to Session 1 and decide this isn't what you expected.
              </p>
              <a
                href={DEFAULT_CTA_URL}
                onClick={() => trackCTA('Final')}
                className="inline-block bg-ink-900 text-butter-500 font-sans font-bold uppercase text-[17px] tracking-[0.08em] px-10 py-5 rounded-[3px] hover:bg-ink-800 transition-colors"
                style={{ boxShadow: '8px 8px 0 rgba(8,17,31,0.35)' }}
              >
                Join Self-Publishing Studio LIVE
              </a>
              <p className="font-sans text-[14px] text-ink-900/70 mt-5">
                Live bootcamp begins Monday, June 1, 2026.
              </p>
            </div>

            {/* Book cover column */}
            <div className="flex flex-col items-center lg:items-end gap-4 pl-2 pr-4 lg:pr-8">
              <PatternBookCover />
              <p
                className="font-sans font-bold uppercase text-ink-900/55 whitespace-nowrap"
                style={{ fontSize: 12, letterSpacing: '0.22em' }}
              >
                &mdash; Could be yours &mdash;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   FAQ
   ═══════════════════════════════════════════════════════════ */
function FAQ() {
  const faqs = [
    { q: "How much time do I need per week?", a: "Three 60-minute live sessions per week (Monday, Wednesday, Friday at 3:00 PM ET), plus 1–2 hours to implement between sessions. Every asset is built during the session itself, so implementation time is minimal." },
    { q: "What if I can't attend live?", a: "Every session is recorded and the replay goes up within hours. You'll also get the full slide deck. Showing up live is where the real value is — real-time Q&A and feedback can't be replicated in a replay." },
    { q: "I don't have time to write a book. Will this work for me?", a: "This is the #1 objection we hear. Most people think writing a book takes years. Our AI-accelerated system shows you how to do it in weeks — not by producing generic AI slop, but by using AI to handle the heavy lifting while you do the thinking. You get a finished manuscript without giving up your evenings or weekends." },
    { q: "I'm not a great writer. Can I still write a book?", a: "You don't need to be a great writer. You need to be a clear thinker. The frameworks inside Manuscript OS show you how to organize your ideas — and the AI tools handle the prose. We've seen first-time authors finish manuscripts they're genuinely proud of, in their own voice." },
    { q: "Won't AI-written books get penalized by Amazon?", a: "Not the way we teach it. There's a difference between AI-generated slop (which Amazon flags and reputable authors avoid) and AI-assisted authorship (which is the new standard). We walk you through KDP's disclosure rules and show you how to produce work that's recognizably yours, with AI as a power tool — not the author." },
    { q: "Will my book actually make money?", a: "Most self-published books don't — because most authors treat the book as the product. We teach you to treat your book as the front door to your business. A $10 book that generates a $500/month client is worth $6,000/year, not $4 in royalties. The book is the funnel. The Book Monetization Mastery bonus covers this in detail." },
    { q: "I've tried writing a book before and didn't finish. How is this different?", a: "Our system has built-in completion mechanics: live deadlines, milestones, accountability checkpoints, and a peer community. The bootcamp structure forces you to ship. Most graduates finish their first draft within weeks." },
    { q: "How long do I have access?", a: "Lifetime. Every replay, slide deck, template, prompt, and bonus is yours forever. Including every update we ship to the curriculum." },
    { q: "How is this different from Ship 30 for 30?", a: "Ship 30 teaches you to write online — daily essays, 250 words at a time. Self-Publishing Studio LIVE teaches you to assemble that practice into a full non-fiction book and turn it into a business asset." },
    { q: "Is there a guarantee?", a: "Yes. Show up to Session 1, do the work, and if it isn't what you expected — email us within 7 days and we'll refund you in full. No questions asked." },
  ]

  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="bg-ink-900 py-20 md:py-28 px-5 md:px-8">
      <div className="max-w-narrow mx-auto">
        <Eyebrow className="mb-4">Frequently asked questions</Eyebrow>
        <Display size="m" className="text-butter-500 mb-12">Still wondering?</Display>
        <div className="flex flex-col gap-[2px] bg-ink-700">
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <div key={i} className="bg-ink-900">
                <button
                  onClick={() => {
                    if (!isOpen) Fathom.trackEvent(`FAQ: ${faq.q}`)
                    setOpen(isOpen ? null : i)
                  }}
                  className="w-full bg-transparent border-none cursor-pointer px-6 md:px-7 py-5 md:py-6 flex items-center justify-between text-left text-paper-100 font-sans text-[16px] md:text-[18px] font-semibold leading-tight hover:text-butter-500 transition-colors"
                >
                  <span className="pr-4">{faq.q}</span>
                  <span
                    className="font-display font-black text-[28px] text-butter-500 leading-none flex-shrink-0 transition-transform duration-200"
                    style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 md:px-7 pb-6 md:pb-7">
                    <p className="font-serif text-[16px] md:text-[17px] leading-[1.6] text-paper-200 max-w-[680px]">{faq.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   FOOTER — Minimal copyright line
   ═══════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-ink-950 border-t border-ink-700 px-5 md:px-8 py-10">
      <div className="max-w-container mx-auto text-center">
        <img src="/images/sps/wordmark-inline.svg" alt="Self-Publishing Studio" className="h-7 mx-auto mb-4 opacity-70" />
        <p className="font-sans text-[12px] text-ink-500">
          &copy; 2026 Ship 30 for 30, LLC. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

/* ═══════════════════════════════════════════════════════════
   STICKY CTA BAR — appears when hero CTA scrolls off
   ═══════════════════════════════════════════════════════════ */
function StickyCtaBar({ heroCtaRef }: { heroCtaRef: React.RefObject<HTMLAnchorElement | null> }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = heroCtaRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [heroCtaRef])

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-ink-950 border-t border-ink-700 transition-transform duration-300 ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="max-w-container mx-auto px-5 h-[64px] flex items-center justify-between gap-4">
        <span className="hidden md:flex items-center gap-3 font-display font-black text-[16px] text-butter-500 uppercase tracking-caps-lg">
          <img src="/images/sps/bookshelf-mark.svg" alt="" className="w-6 h-6" />
          Self-Publishing Studio LIVE
        </span>
        <div className="hidden md:block">
          <CountdownTimer targetDate={CART_CLOSE_DATE} compact />
        </div>
        <a
          href={DEFAULT_CTA_URL}
          onClick={() => trackCTA('Sticky Bar')}
          className="bg-butter-500 text-ink-900 font-sans font-bold uppercase text-[13px] tracking-caps px-6 py-2.5 rounded-[3px] hover:bg-butter-400 transition-colors mx-auto md:mx-0"
        >
          Join Now
        </a>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  const heroCtaRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    // Scroll-depth milestones — fire each threshold once per session
    const thresholds = [25, 50, 75, 100]
    const firedScroll = new Set<number>()
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      if (total <= 0) return
      const pct = (window.scrollY / total) * 100
      for (const t of thresholds) {
        if (pct >= t && !firedScroll.has(t)) {
          firedScroll.add(t)
          Fathom.trackEvent(`Scroll: ${t}%`)
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    // Section-reach — fire once when each key section enters the viewport
    const sectionNames: Record<string, string> = {
      bonuses: 'Section: Bonuses',
      pricing: 'Section: Pricing',
      'final-cta': 'Section: Final CTA',
      faq: 'Section: FAQ',
    }
    const firedSection = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !firedSection.has(entry.target.id)) {
            firedSection.add(entry.target.id)
            const name = sectionNames[entry.target.id]
            if (name) Fathom.trackEvent(name)
          }
        }
      },
      { threshold: 0.3 },
    )
    for (const id of Object.keys(sectionNames)) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [])

  return (
    <main className="min-h-screen bg-ink-900">
      <Hero ctaRef={heroCtaRef} />
      <FadeIn><WhyWriteABook /></FadeIn>
      <FadeIn><Stats /></FadeIn>
      <FadeIn><Captains /></FadeIn>
      <FadeIn><IsThisForYou /></FadeIn>
      <FadeIn><Curriculum /></FadeIn>
      <FadeIn><MiniCourses /></FadeIn>
      <FadeIn><Bonuses /></FadeIn>
      <FadeIn><AIWritingSkool /></FadeIn>
      <FadeIn><Pricing /></FadeIn>
      <FadeIn><GuaranteeFinalCTA /></FadeIn>
      <FadeIn><FAQ /></FadeIn>
      <Footer />
      <StickyCtaBar heroCtaRef={heroCtaRef} />
    </main>
  )
}
