"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export default function ThreeDText({ colorMode = "blend" }: { colorMode?: "blend" | "contrast" }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [textMesh, setTextMesh] = useState<THREE.Mesh | null>(null)
  const [scene, setScene] = useState<THREE.Scene | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const newScene = new THREE.Scene()
    setScene(newScene)

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    newScene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(1, 1, 1)
    newScene.add(directionalLight)

    // Colored lights based on color mode
    let pointLight1, pointLight2, pointLight3

    if (colorMode === "blend") {
      // Lights that match the background for seamless blending
      pointLight1 = new THREE.PointLight(0x0046ff, 2, 100) // Blue
      pointLight2 = new THREE.PointLight(0xff0080, 2, 100) // Pink
      pointLight3 = new THREE.PointLight(0x00c832, 2, 100) // Green
    } else {
      // Contrasting lights for complementary effect
      pointLight1 = new THREE.PointLight(0xffcc00, 2, 100) // Gold/Yellow
      pointLight2 = new THREE.PointLight(0x00ffcc, 2, 100) // Teal
      pointLight3 = new THREE.PointLight(0xffffff, 2, 100) // White
    }

    pointLight1.position.set(5, 5, 5)
    pointLight2.position.set(-5, -5, 5)
    pointLight3.position.set(0, 8, -5)

    newScene.add(pointLight1)
    newScene.add(pointLight2)
    newScene.add(pointLight3)

    // Create gradient texture for the material
    const createGradientTexture = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 512
      canvas.height = 512

      const context = canvas.getContext("2d")
      if (!context) return null

      // Create gradient based on color mode
      const gradient = context.createLinearGradient(0, 0, 0, 512)

      if (colorMode === "blend") {
        // Seamless blend with background - using similar colors but with subtle variations
        gradient.addColorStop(0, "#0057ff") // Slightly brighter blue
        gradient.addColorStop(0.25, "#6a00ff") // Slightly muted purple
        gradient.addColorStop(0.5, "#ff0080") // Same pink
        gradient.addColorStop(0.75, "#00c832") // Same green
        gradient.addColorStop(1, "#0a1030") // Deep background blue
      } else {
        // Complementary contrast - using colors that contrast with the background
        gradient.addColorStop(0, "#ffcc00") // Gold/Yellow (complements blue)
        gradient.addColorStop(0.33, "#ff9900") // Orange (complements blue/purple)
        gradient.addColorStop(0.66, "#00ffcc") // Teal (complements pink/red)
        gradient.addColorStop(1, "#ffffff") // White (pops against all background colors)
      }

      context.fillStyle = gradient
      context.fillRect(0, 0, 512, 512)

      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true
      return texture
    }

    // Load font and create text
    const fontLoader = new FontLoader()

    fontLoader.load("/fonts/helvetiker_bold.typeface.json", (font) => {
      const textGeometry = new TextGeometry("DICE", {
        font: font,
        size: 1.5,
        height: 0.4,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.05,
        bevelOffset: 0,
        bevelSegments: 5,
      })

      textGeometry.center()

      // Create gradient texture
      const gradientTexture = createGradientTexture()

      // Create materials with transparency and gradient
      const frontMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: colorMode === "blend" ? 0.85 : 0.95, // More transparent for blend mode
        metalness: colorMode === "blend" ? 0.5 : 0.8, // More metallic for contrast mode
        roughness: colorMode === "blend" ? 0.3 : 0.2,
        map: gradientTexture,
        side: THREE.FrontSide,
        envMapIntensity: 1,
      })

      const sideMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: colorMode === "blend" ? 0.7 : 0.8,
        metalness: colorMode === "blend" ? 0.4 : 0.7,
        roughness: colorMode === "blend" ? 0.4 : 0.3,
        map: gradientTexture,
        side: THREE.BackSide,
        envMapIntensity: 0.8,
      })

      const materials = [frontMaterial, sideMaterial]
      const mesh = new THREE.Mesh(textGeometry, materials)
      setTextMesh(mesh)
      newScene.add(mesh)
    })

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return

      const width = window.innerWidth
      const height = window.innerHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()

      // Animate lights
      const time = Date.now() * 0.001
      pointLight1.position.x = Math.sin(time) * 5
      pointLight1.position.y = Math.cos(time) * 5
      pointLight2.position.x = Math.sin(time + Math.PI) * 5
      pointLight2.position.y = Math.cos(time + Math.PI) * 5
      pointLight3.position.x = Math.sin(time * 0.7) * 5
      pointLight3.position.z = Math.cos(time * 0.7) * 5

      renderer.render(newScene, camera)
    }

    animate()

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
      window.removeEventListener("resize", handleResize)
    }
  }, [colorMode])

  return <div ref={containerRef} className="absolute inset-0 z-30" />
}
