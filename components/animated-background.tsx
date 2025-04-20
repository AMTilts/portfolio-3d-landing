"use client"

import { useEffect, useRef } from "react"

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Define gradient colors to match Connectif-AI
    const colors = [
      { r: 0, g: 20, b: 70 }, // Deep navy blue
      { r: 0, g: 70, b: 255 }, // Bright blue
      { r: 120, g: 0, b: 255 }, // Purple
      { r: 255, g: 0, b: 128 }, // Pink/magenta
      { r: 255, g: 50, b: 0 }, // Red/orange
      { r: 0, g: 200, b: 50 }, // Green
    ]

    // Create blobs
    const blobs = []
    for (let i = 0; i < 6; i++) {
      const colorIndex = i % colors.length
      blobs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 400 + 300,
        xSpeed: (Math.random() - 0.5) * 0.5,
        ySpeed: (Math.random() - 0.5) * 0.5,
        color: colors[colorIndex],
      })
    }

    // Animation function
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background
      ctx.fillStyle = "#0a1030"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw blobs
      blobs.forEach((blob) => {
        // Move blob
        blob.x += blob.xSpeed
        blob.y += blob.ySpeed

        // Bounce off edges
        if (blob.x < -blob.radius || blob.x > canvas.width + blob.radius) {
          blob.xSpeed *= -1
        }
        if (blob.y < -blob.radius || blob.y > canvas.height + blob.radius) {
          blob.ySpeed *= -1
        }

        // Draw blob
        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius)

        gradient.addColorStop(0, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, 0.7)`)
        gradient.addColorStop(1, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  // Increased blur and added a small negative margin to eliminate any white borders
  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-[calc(100%+4px)] h-[calc(100%+4px)] -ml-2 -mt-2 z-0"
      style={{ filter: "blur(60px)" }}
    />
  )
}
