import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useInView, animate } from "framer-motion";
import { Code2, Sparkles, Terminal, Globe, Coffee, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetStatsQuery, useGetAboutSkillsQuery, useGetHeroQuery } from "../store/portfolioApi";

// Animated number counter component
function AnimatedCounter({ from, to, suffix = "", duration = 2 }) {
  const nodeRef = useRef(null);
  const inView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      const controls = animate(from, to, {
        duration,
        ease: "easeOut",
        onUpdate(value) {
          if (nodeRef.current) {
            nodeRef.current.textContent = Math.round(value) + suffix;
          }
        },
      });
      return () => controls.stop();
    }
  }, [from, to, duration, inView, suffix]);

  return <span ref={nodeRef}>{from}{suffix}</span>;
}

// Map of icon names from backend to lucide components
const iconMap = {
  code: Code2,
  design: Sparkles,
  architecture: Terminal,
  optimization: Globe,
  coffee: Coffee,
};

const colorMap = [
  { color: "text-blue-400", bg: "bg-blue-500/10" },
  { color: "text-purple-400", bg: "bg-purple-500/10" },
  { color: "text-pink-400", bg: "bg-pink-500/10" },
  { color: "text-emerald-400", bg: "bg-emerald-500/10" },
];

export default function About() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const yParallax = useTransform(scrollYProgress, [0, 1], [100, -100]);

  // Fetch live data from backend via RTK Query
  const { data: stats, isLoading: statsLoading } = useGetStatsQuery();
  const { data: skills, isLoading: skillsLoading } = useGetAboutSkillsQuery();
  const { data: hero } = useGetHeroQuery();

  return (
    <section ref={containerRef} className="py-24 relative overflow-hidden bg-zinc-950">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="absolute -left-[10%] top-[20%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute -right-[10%] bottom-[20%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4 md:hidden"
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-zinc-700/50 bg-zinc-800/30 text-zinc-300 text-sm font-medium backdrop-blur-md">
            Who I Am
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            About <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Me</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Side: Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="hidden md:block space-y-4">
              <div className="inline-block px-4 py-1.5 rounded-full border border-zinc-700/50 bg-zinc-800/30 text-zinc-300 text-sm font-medium backdrop-blur-md">
                Who I Am
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white">
                Designing with passion, <br className="hidden lg:block"/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                  building with purpose.
                </span>
              </h2>
            </div>

            <div className="space-y-4 text-lg text-zinc-400 leading-relaxed">
              <p>
                I'm a full-stack developer based in San Francisco with a profound passion for 
                crafting elegant, high-performance digital experiences. My journey in tech started 
                with a simple curiosity about how the web works, which quickly evolved into a 
                career building complex, scalable web applications.
              </p>
              <p>
                I believe that great software lies at the intersection of minimalist design and 
                robust engineering. When I'm not coding, you can find me exploring new coffee 
                shops, reading about system architecture, or contributing to open-source projects.
              </p>
            </div>

            {/* Dynamic Skills Grid from API */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              {skillsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 rounded-2xl bg-zinc-900/40 border border-zinc-800 animate-pulse" />
                  ))
                : (skills && skills.length > 0 ? skills : [
                    { id: 'f1', title: 'Clean Code', description: 'Writing maintainable & scalable software', icon: 'code' },
                    { id: 'f2', title: 'UI/UX Design', description: 'Creating intuitive user interfaces', icon: 'design' },
                    { id: 'f3', title: 'Architecture', description: 'Designing robust backend systems', icon: 'architecture' },
                    { id: 'f4', title: 'Optimization', description: 'Ensuring maximum web performance', icon: 'optimization' },
                  ]).map((skill, idx) => {
                    const Icon = iconMap[skill.icon] || Code2;
                    const palette = colorMap[idx % colorMap.length];
                    return (
                      <motion.div 
                        key={skill.id}
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(39, 39, 42, 0.6)" }}
                        className="flex gap-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm transition-colors"
                      >
                        <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${palette.bg}`}>
                          <Icon className={`w-5 h-5 ${palette.color}`} />
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-1">{skill.title}</h4>
                          <p className="text-sm text-zinc-500">{skill.description}</p>
                        </div>
                      </motion.div>
                    );
                  })
              }
            </div>
            
            <div className="pt-6">
              <Button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-full bg-white text-zinc-950 hover:bg-zinc-200 px-8 h-12 text-base font-semibold transition-all hover:scale-105 active:scale-95 group">
                Let's Talk 
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>

          {/* Right Side: Visuals & Stats */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-5 relative mt-12 lg:mt-0"
          >
            {/* Main Image Container */}
            <div className="relative z-10 rounded-[2rem] overflow-hidden border border-zinc-800 bg-zinc-900 aspect-[4/5]">
              <motion.img 
                style={{ y: yParallax, scale: 1.15 }}
                src={hero?.profilePhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop"} 
                alt="Profile" 
                className="w-full h-[120%] object-cover origin-center opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
            </div>

            {/* Dynamic Floating Stat Cards from API */}
            {statsLoading ? (
              <>
                <div className="absolute -bottom-6 -left-6 z-20 w-40 h-20 rounded-2xl bg-zinc-900/80 border border-white/10 animate-pulse" />
                <div className="absolute top-1/4 -right-6 z-20 w-24 h-20 rounded-2xl bg-zinc-900/80 border border-white/10 animate-pulse" />
              </>
            ) : (
              (stats || []).slice(0, 3).map((stat, idx) => {
                const positions = [
                  "absolute -bottom-6 -left-6 z-20",
                  "absolute top-1/4 -right-6 z-20",
                  "absolute bottom-1/4 -right-4 z-20",
                ];
                const delays = [0.5, 0.7, 0.9];
                const Icon = iconMap[stat.icon] || Coffee;
                const isFirst = idx === 0;

                return (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: delays[idx] || 0.5, duration: 0.5 }}
                    className={`${positions[idx] || "absolute bottom-0 left-0 z-20"} p-4 md:p-5 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10`}
                  >
                    {isFirst ? (
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-white flex items-center">
                            <AnimatedCounter from={0} to={stat.value} suffix={stat.suffix || ''} duration={2.5} />
                          </div>
                          <div className="text-sm font-medium text-zinc-400">{stat.label}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className={`text-4xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 mb-1`}>
                          <AnimatedCounter from={0} to={stat.value} suffix={stat.suffix || ''} duration={2} />
                        </div>
                        <div className={`text-xs font-semibold tracking-wider uppercase ${idx === 1 ? 'text-blue-400' : 'text-purple-400'}`}>
                          {stat.label}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}

          </motion.div>

        </div>
      </div>
    </section>
  );
}
