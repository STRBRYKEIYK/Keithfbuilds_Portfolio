import { useEffect, useState, useRef } from "react";
import Cursor from "./components/Cursor";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ScanlineIcon from "./components/ScanlineIcon";

const BOOT_LINES = [
  "> initializing neural_link...",
  "> loading portfolio modules...",
  "> mounting components...",
  "> compiling shaders...",
  "> all systems nominal.",
];

function Loader({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [visibleLines, setVisibleLines] = useState([]);

  // Progress bar — pace progress to finish exactly at 2.5s
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    const DURATION = 2500; // ms
    let rafId = null;

    function tick() {
      const elapsed = Date.now() - mountTimeRef.current;
      const pct = Math.min(100, (elapsed / DURATION) * 100);
      setProgress(pct);

      if (pct < 100) {
        rafId = requestAnimationFrame(tick);
      } else {
        // reach 100% exactly at DURATION, then start leave animation immediately
        setLeaving(true);
        setTimeout(onDone, 700); // match CSS transition duration
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [onDone]);

  // Stagger boot log lines based on progress
  useEffect(() => {
    const lineIndex = Math.floor((progress / 100) * BOOT_LINES.length);
    setVisibleLines(BOOT_LINES.slice(0, lineIndex));
  }, [progress]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#050A07",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "28px",
        transition: "opacity 0.7s ease, transform 0.7s ease",
        opacity: leaving ? 0 : 1,
        transform: leaving ? "translateY(-24px)" : "translateY(0)",
      }}
    >
      {/* Ambient grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(22,193,114,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(22,193,114,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      {/* Corner decorators */}
      {[
        { top: 24, left: 24, borderTop: "1px solid", borderLeft: "1px solid" },
        {
          top: 24,
          right: 24,
          borderTop: "1px solid",
          borderRight: "1px solid",
        },
        {
          bottom: 24,
          left: 24,
          borderBottom: "1px solid",
          borderLeft: "1px solid",
        },
        {
          bottom: 24,
          right: 24,
          borderBottom: "1px solid",
          borderRight: "1px solid",
        },
      ].map((style, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 20,
            height: 20,
            borderColor: "rgba(22,193,114,0.3)",
            ...style,
          }}
        />
      ))}

      {/* Icon + Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          zIndex: 1,
        }}
      >
        <ScanlineIcon size={72} />
        <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <h1
            style={{
              fontSize: "22px",
              margin: 0,
              letterSpacing: "0.12em",
              color: "#16C172",
              textShadow: "0 0 12px #16C17299",
            }}
          >
            KEITHFBUILDS.DEV
          </h1>
          <p
            style={{
              fontSize: "11px",
              opacity: 0.5,
              margin: "5px 0 0 0",
              color: "#16C172",
              letterSpacing: "0.15em",
            }}
          >
            v2.0.4 // NEURAL_LINK_ACTIVE
          </p>
        </div>
      </div>

      {/* Boot log */}
      <div
        style={{
          width: 300,
          minHeight: 90,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          zIndex: 1,
        }}
      >
        {visibleLines.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              color: i === visibleLines.length - 1 ? "#16C172" : "#4A6B57",
              letterSpacing: "0.08em",
              textShadow:
                i === visibleLines.length - 1 ? "0 0 6px #16C17266" : "none",
              animation: "fadeInLine 0.2s ease forwards",
            }}
          >
            {line}
            {i === visibleLines.length - 1 && progress < 100 && (
              <span
                style={{
                  animation: "blink 0.8s step-end infinite",
                  marginLeft: 2,
                }}
              >
                █
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ width: 300, zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px",
            color: "#4A6B57",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          <span>LOADING</span>
          <span
            style={{
              color: progress === 100 ? "#16C172" : "#4A6B57",
              textShadow: progress === 100 ? "0 0 6px #16C172" : "none",
            }}
          >
            {Math.min(Math.round(progress), 100)}%
          </span>
        </div>

        {/* Track */}
        <div
          style={{
            width: "100%",
            height: "2px",
            background: "rgba(22,193,114,0.12)",
            borderRadius: "2px",
            overflow: "visible",
            position: "relative",
          }}
        >
          {/* Fill */}
          <div
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #0d7a47 0%, #16C172 100%)",
              width: `${Math.min(progress, 100)}%`,
              transition: "width 0.12s ease",
              borderRadius: "2px",
              boxShadow: "0 0 10px #16C17299, 0 0 24px #16C17244",
              position: "relative",
            }}
          >
            {/* Leading glow dot */}
            <div
              style={{
                position: "absolute",
                right: -3,
                top: "50%",
                transform: "translateY(-50%)",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#16C172",
                boxShadow: "0 0 8px 3px #16C172",
              }}
            />
          </div>
        </div>

        {/* Tick marks */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          {[0, 25, 50, 75, 100].map((tick) => (
            <div
              key={tick}
              style={{
                width: "1px",
                height: "4px",
                background:
                  progress >= tick
                    ? "rgba(22,193,114,0.6)"
                    : "rgba(22,193,114,0.15)",
                transition: "background 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInLine {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [loaded, setLoaded] = useState(false);

  // Smooth scroll init with Lenis
  useEffect(() => {
    if (!loaded) return;
    let lenis;
    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        smoothWheel: true,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    });

    return () => {
      if (lenis) lenis.destroy();
    };
  }, [loaded]);

  return (
    <>
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      <Cursor />
      <div
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.5s ease 0.1s",
        }}
      >
        <Navbar />
        <main>
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
