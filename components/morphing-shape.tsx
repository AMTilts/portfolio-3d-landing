"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass"
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise"

// Custom shader for the subtle shimmering effect
const shimmerShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    intensity: { value: 0.1 }, // Reduced intensity
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float intensity;
    varying vec2 vUv;
    
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      
      // Smaller, more subtle checkered pattern
      float checker = sin(vUv.x * 30.0 + time) * sin(vUv.y * 30.0 + time * 0.7) * intensity;
      
      // Make it almost transparent
      vec3 color = texel.rgb + vec3(checker) * 0.3;
      gl_FragColor = vec4(color, texel.a);
    }
  `,
}

export default function MorphingShape() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

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
    controls.autoRotateSpeed = 0.3
    controls.enablePan = false

    // Post-processing
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    // Subtle bloom effect
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5, // reduced strength
      0.4, // radius
      0.85, // threshold
    )
    composer.addPass(bloomPass)

    // Custom shimmer effect (more subtle)
    const shimmerPass = new ShaderPass(shimmerShader)
    composer.addPass(shimmerPass)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    // Colored lights
    const pointLight1 = new THREE.PointLight(0x0046ff, 2, 100) // Blue
    pointLight1.position.set(5, 5, 5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xff0080, 2, 100) // Pink
    pointLight2.position.set(-5, -5, 5)
    scene.add(pointLight2)

    const pointLight3 = new THREE.PointLight(0x00c832, 2, 100) // Green
    pointLight3.position.set(0, 8, -5)
    scene.add(pointLight3)

    // Create gradient texture for materials
    const createGradientTexture = (colors: string[]) => {
      const canvas = document.createElement("canvas")
      canvas.width = 512
      canvas.height = 512

      const context = canvas.getContext("2d")
      if (!context) return null

      // Create gradient
      const gradient = context.createLinearGradient(0, 0, 0, 512)
      colors.forEach((color, index) => {
        gradient.addColorStop(index / (colors.length - 1), color)
      })

      context.fillStyle = gradient
      context.fillRect(0, 0, 512, 512)

      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true
      return texture
    }

    // Create smaller, longer fluid-like shape
    // Using a cylinder as base for a longer shape
    const morphingShapeGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32, 32)

    // Rotate to make it horizontal
    morphingShapeGeometry.rotateZ(Math.PI / 2)

    const morphingShapeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7, // More transparent
      metalness: 0.2,
      roughness: 0.3,
      map: createGradientTexture(["#0046ff", "#7800ff", "#ff0080", "#00c832"]),
      side: THREE.DoubleSide,
      envMapIntensity: 0.8,
    })

    const morphingShape = new THREE.Mesh(morphingShapeGeometry, morphingShapeMaterial)
    // Make it smaller overall
    morphingShape.scale.set(0.7, 0.7, 0.7)
    scene.add(morphingShape)

    // Store original vertices for morphing
    const originalPositions: number[] = []
    const positionAttribute = morphingShapeGeometry.getAttribute("position")

    for (let i = 0; i < positionAttribute.count; i++) {
      originalPositions.push(positionAttribute.getX(i), positionAttribute.getY(i), positionAttribute.getZ(i))
    }

    // Create 3D text - separated into two words
    const fontLoader = new FontLoader()
    let matthewMesh: THREE.Mesh
    let priceMesh: THREE.Mesh

    fontLoader.load("/fonts/helvetiker_bold.typeface.json", (font) => {
      // Create "Matthew" text
      const matthewGeometry = new TextGeometry("Matthew", {
        font: font,
        size: 0.3,
        height: 0.02, // Very shallow depth
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.005,
        bevelSize: 0.002,
        bevelOffset: 0,
        bevelSegments: 5,
      })

      matthewGeometry.center()

      // Create "Price" text
      const priceGeometry = new TextGeometry("Price", {
        font: font,
        size: 0.3,
        height: 0.02, // Very shallow depth
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.005,
        bevelSize: 0.002,
        bevelOffset: 0,
        bevelSegments: 5,
      })

      priceGeometry.center()

      const textMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        metalness: 0.5,
        roughness: 0.2,
        map: createGradientTexture(["#ffcc00", "#ff9900", "#00ffcc", "#ffffff"]),
      })

      // Create and position "Matthew"
      matthewMesh = new THREE.Mesh(matthewGeometry, textMaterial)
      matthewMesh.position.set(-0.1, 0.2, 0.5) // Slightly off-center to the left

      // Very slight rotation (1-2 degrees max)
      matthewMesh.rotation.x = THREE.MathUtils.degToRad(1)
      matthewMesh.rotation.y = THREE.MathUtils.degToRad(1.5)

      scene.add(matthewMesh)

      // Create and position "Price"
      priceMesh = new THREE.Mesh(priceGeometry, textMaterial)
      priceMesh.position.set(0.1, -0.2, 0.5) // Slightly off-center to the right

      // Very slight rotation (1-2 degrees max)
      priceMesh.rotation.x = THREE.MathUtils.degToRad(1)
      priceMesh.rotation.y = THREE.MathUtils.degToRad(-1)

      scene.add(priceMesh)
    })

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return

      const width = window.innerWidth
      const height = window.innerHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      composer.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)

    // Animation loop
    const clock = new THREE.Clock()
    const simplex = new SimplexNoise()

    const animate = () => {
      requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()

      // Update shimmer shader time
      shimmerPass.uniforms.time.value = elapsedTime

      // Morph the shape for fluid-like consistency
      const positionAttribute = morphingShapeGeometry.getAttribute("position")
      const vertex = new THREE.Vector3()

      for (let i = 0; i < positionAttribute.count; i++) {
        // Get original position
        vertex.fromArray(originalPositions, i * 3)

        // Apply fluid-like noise-based displacement
        // Higher frequency for more fluid-like movement
        const noise1 =
          simplex.noise3d(vertex.x * 1.5 + elapsedTime * 0.2, vertex.y * 1.5 + elapsedTime * 0.1, vertex.z * 1.5) * 0.15 // Smaller displacement for subtlety

        const noise2 =
          simplex.noise3d(vertex.x * 2.0 - elapsedTime * 0.15, vertex.y * 2.0 + elapsedTime * 0.25, vertex.z * 2.0) *
          0.1 // Smaller displacement for subtlety

        // Apply displacement - more fluid-like
        const displacement = 1 + noise1 + noise2 * Math.sin(elapsedTime * 0.5 + vertex.x * 2)
        vertex.multiplyScalar(displacement)

        // Update position
        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z)
      }

      positionAttribute.needsUpdate = true
      morphingShapeGeometry.computeVertexNormals()

      // Rotate the shape
      morphingShape.rotation.x = elapsedTime * 0.1
      morphingShape.rotation.y = elapsedTime * 0.15
      morphingShape.rotation.z = Math.sin(elapsedTime * 0.1) * 0.05

      // Animate text with very subtle movement (1-2 degrees max)
      if (matthewMesh) {
        // Keep rotation within 1-2 degrees
        const maxRotation = THREE.MathUtils.degToRad(0.5) // 0.5 degree variation

        matthewMesh.rotation.x = THREE.MathUtils.degToRad(1) + Math.sin(elapsedTime * 0.3) * maxRotation
        matthewMesh.rotation.y = THREE.MathUtils.degToRad(1.5) + Math.sin(elapsedTime * 0.2) * maxRotation
      }

      if (priceMesh) {
        // Keep rotation within 1-2 degrees
        const maxRotation = THREE.MathUtils.degToRad(0.5) // 0.5 degree variation

        priceMesh.rotation.x = THREE.MathUtils.degToRad(1) + Math.sin(elapsedTime * 0.3 + 1) * maxRotation
        priceMesh.rotation.y = THREE.MathUtils.degToRad(-1) + Math.sin(elapsedTime * 0.2 + 1) * maxRotation
      }

      // Animate lights
      pointLight1.position.x = Math.sin(elapsedTime * 0.5) * 5
      pointLight1.position.y = Math.cos(elapsedTime * 0.5) * 5

      pointLight2.position.x = Math.sin(elapsedTime * 0.5 + Math.PI) * 5
      pointLight2.position.y = Math.cos(elapsedTime * 0.5 + Math.PI) * 5

      pointLight3.position.x = Math.sin(elapsedTime * 0.3) * 5
      pointLight3.position.z = Math.cos(elapsedTime * 0.3) * 5

      controls.update()
      composer.render()
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

  return <div ref={containerRef} className="absolute inset-0 z-30" />
}
