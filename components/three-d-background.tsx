"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise"

export default function ThreeDBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 20

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.current.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5
    controls.enablePan = false

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    // Colored lights to match Connectif-AI theme
    const pointLight1 = new THREE.PointLight(0x0046ff, 2, 100) // Blue
    pointLight1.position.set(5, 5, 5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xff0080, 2, 100) // Pink
    pointLight2.position.set(-5, -5, 5)
    scene.add(pointLight2)

    const pointLight3 = new THREE.PointLight(0x00c832, 2, 100) // Green
    pointLight3.position.set(0, 8, -5)
    scene.add(pointLight3)

    // Create gradient textures
    const createGradientTexture = (colors: string[]) => {
      const canvas = document.createElement("canvas")
      canvas.width = 256
      canvas.height = 256

      const context = canvas.getContext("2d")
      if (!context) return null

      // Create gradient
      const gradient = context.createLinearGradient(0, 0, 0, 256)
      colors.forEach((color, index) => {
        gradient.addColorStop(index / (colors.length - 1), color)
      })

      context.fillStyle = gradient
      context.fillRect(0, 0, 256, 256)

      const texture = new THREE.CanvasTexture(canvas)
      return texture
    }

    // Create different gradient textures with Connectif-AI colors
    const gradientTexture1 = createGradientTexture(["#0046ff", "#7800ff", "#ff0080"])
    const gradientTexture2 = createGradientTexture(["#7800ff", "#ff0080", "#ff3200"])
    const gradientTexture3 = createGradientTexture(["#0046ff", "#00c832", "#ff3200"])

    // Create materials
    const createMaterial = (texture: THREE.Texture | null) => {
      return new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
        metalness: 0.3,
        roughness: 0.2,
        map: texture,
        side: THREE.DoubleSide,
        envMapIntensity: 1,
      })
    }

    const material1 = createMaterial(gradientTexture1)
    const material2 = createMaterial(gradientTexture2)
    const material3 = createMaterial(gradientTexture3)

    // Create shapes
    const torusKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(5, 1.5, 200, 32, 3, 7), material1)
    scene.add(torusKnot)

    // Create distorted icosahedron
    const icosaGeometry = new THREE.IcosahedronGeometry(4, 4)
    const simplex = new SimplexNoise()

    // Distort vertices
    const positionAttribute = icosaGeometry.getAttribute("position")
    const vertex = new THREE.Vector3()

    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i)
      const noise = simplex.noise3d(vertex.x * 0.1, vertex.y * 0.1, vertex.z * 0.1) * 0.5
      vertex.multiplyScalar(1 + noise)
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z)
    }

    icosaGeometry.computeVertexNormals()
    const icosahedron = new THREE.Mesh(icosaGeometry, material2)
    icosahedron.position.set(-10, -5, -5)
    scene.add(icosahedron)

    // Create octahedron
    const octahedron = new THREE.Mesh(new THREE.OctahedronGeometry(3, 2), material3)
    octahedron.position.set(10, 5, -5)
    scene.add(octahedron)

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
    const clock = new THREE.Clock()

    const animate = () => {
      requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()

      // Rotate shapes independently
      torusKnot.rotation.x = elapsedTime * 0.2
      torusKnot.rotation.y = elapsedTime * 0.1

      icosahedron.rotation.x = -elapsedTime * 0.15
      icosahedron.rotation.y = -elapsedTime * 0.1

      octahedron.rotation.x = elapsedTime * 0.1
      octahedron.rotation.y = elapsedTime * 0.2

      // Animate lights
      pointLight1.position.x = Math.sin(elapsedTime * 0.5) * 10
      pointLight1.position.y = Math.cos(elapsedTime * 0.5) * 10

      pointLight2.position.x = Math.sin(elapsedTime * 0.5 + Math.PI) * 10
      pointLight2.position.y = Math.cos(elapsedTime * 0.5 + Math.PI) * 10

      pointLight3.position.x = Math.sin(elapsedTime * 0.3) * 8
      pointLight3.position.z = Math.cos(elapsedTime * 0.3) * 8

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <div ref={containerRef} className="absolute inset-0 z-10" />
}
