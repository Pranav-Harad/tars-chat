"use client";

import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/* ---------- Animated dot-grid canvas background ---------- */
function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;

    const PARTICLE_COUNT = 70;
    const particles: {
      x: number; y: number;
      vx: number; vy: number;
      size: number; alpha: number;
    }[] = [];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = canvas.closest("section")?.clientHeight ?? window.innerHeight;
    };

    const init = () => {
      resize();
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2 + 1,
          alpha: Math.random() * 0.5 + 0.1,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(128,128,255,${0.12 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.alpha})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }

      animationId = requestAnimationFrame(draw);
    };

    init();
    draw();

    window.addEventListener("resize", init);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none -z-10 opacity-60 dark:opacity-40"
    />
  );
}

/* ---------- Main Page ---------- */
export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/chat");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-65px)]">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isSignedIn) return null;

  return (
    <main className="min-h-[calc(100vh-65px)] bg-background overflow-x-hidden">

      {/* ── Hero Section ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-28 md:py-40 overflow-hidden">
        <AnimatedBackground />

        {/* Soft radial gradient overlay */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,hsl(var(--primary)/0.15),transparent)]" />

        {/* Floating accent blobs */}
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-violet-500/10 rounded-full blur-[80px] animate-pulse -z-10" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-[80px] animate-pulse delay-1000 -z-10" />

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium shadow-sm backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
          Welcome to Pranverse
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          <span className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            Chat in
          </span>{" "}
          <span className="bg-gradient-to-br from-violet-500 via-primary to-indigo-500 bg-clip-text text-transparent">
            Real Time.
          </span>
          <br />
          <span className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent text-4xl md:text-6xl">
            Connect Instantly.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Pranverse is a modern, real-time messaging platform. Send messages, react with emojis, see who&apos;s typing, and stay connected in a beautifully designed interface.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <SignUpButton mode="modal">
            <button className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90 active:scale-[0.97] transition-all shadow-lg shadow-primary/25 text-base">
              Get Started
            </button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button className="px-8 py-4 bg-muted text-foreground font-semibold rounded-2xl hover:bg-muted/80 active:scale-[0.97] transition-all border border-border text-base backdrop-blur-sm">
              Sign In
            </button>
          </SignInButton>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-6 bg-muted/20 border-y border-border/50">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get started in seconds</h2>
          <p className="text-muted-foreground text-base md:text-lg">Three simple steps to start chatting with anyone.</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Create your account",
              desc: "Sign up with your email or continue with Google. Your profile is set up automatically.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              ),
            },
            {
              step: "02",
              title: "Find your friends",
              desc: "Search for any registered user by name. Start a private conversation or create a group.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              ),
            },
            {
              step: "03",
              title: "Start chatting!",
              desc: "Send messages, react with emojis, and see real-time typing indicators as you chat.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
              ),
            },
          ].map((item, i) => (
            <div key={i} className="relative group bg-card border border-border/60 rounded-2xl p-8 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="absolute top-4 right-6 text-6xl font-black text-muted/30 select-none group-hover:text-primary/10 transition-colors">{item.step}</div>
              <div className="mb-5 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to stay connected</h2>
          <p className="text-muted-foreground text-base md:text-lg">A powerful, modern chat experience built with the latest technology.</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Real-Time Messaging", desc: "Messages appear instantly for everyone in the conversation.", emoji: "⚡" },
            { title: "Typing Indicators", desc: "See animated dots when someone is composing a message.", emoji: "💬" },
            { title: "Message Reactions", desc: "React to any message with a quick emoji tap.", emoji: "❤️" },
            { title: "Online Presence", desc: "See who's online with live status indicators.", emoji: "🟢" },
            { title: "Read Receipts", desc: "Know when your message has been seen with checkmarks.", emoji: "✅" },
            { title: "Group Chats", desc: "Create group conversations with multiple people at once.", emoji: "👥" },
            { title: "Dark & Light Mode", desc: "Switch between themes to match your preference.", emoji: "🌙" },
            { title: "Unread Badges", desc: "Never miss a message with unread count notifications.", emoji: "🔔" },
            { title: "Secure Auth", desc: "Powered by Clerk for enterprise-grade authentication.", emoji: "🔒" },
          ].map((f, i) => (
            <div key={i} className="bg-card border border-border/60 rounded-2xl p-6 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 group">
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-20 px-6 overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start chatting?</h2>
          <p className="text-primary-foreground/70 mb-8 text-lg">Join Pranverse today and experience real-time chat like never before.</p>
          <SignUpButton mode="modal">
            <button className="px-8 py-4 bg-primary-foreground text-primary font-bold rounded-2xl hover:opacity-90 active:scale-[0.97] transition-all shadow-lg text-base">
              Join Pranverse
            </button>
          </SignUpButton>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-primary-foreground"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
          </div>
          <span className="font-semibold text-foreground">Pranverse</span>
        </div>
        <p>© {new Date().getFullYear()} Pranverse. Built with Next.js, Convex &amp; Clerk.</p>
      </footer>
    </main>
  );
}
