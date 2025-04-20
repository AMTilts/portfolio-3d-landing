import AnimatedBackground from "@/components/animated-background"
import Navigation from "@/components/navigation"
import MorphingShape from "@/components/morphing-shape"
import Link from "next/link"

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a1030]">
      <AnimatedBackground />
      <MorphingShape />

      <div className="relative z-20 flex flex-col min-h-screen">
        <Navigation />

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="inline-block bg-black/20 backdrop-blur-sm px-4 py-1 rounded-full mb-4">
            <span className="text-yellow-400 text-sm font-medium">Digital Artist & Developer</span>
          </div>

          <div className="h-[300px] md:h-[400px] flex items-center justify-center">
            {/* Empty space for 3D morphing shape and text to show */}
          </div>

          <p className="text-white/80 text-center max-w-2xl mt-6 mb-8">
            Creating immersive digital experiences through code, design, and interactive media. Exploring the
            intersection of art and technology.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="#"
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-md font-medium transition-colors"
            >
              View Portfolio
            </Link>
            <Link
              href="#"
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Contact Me
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
