import * as THREE from 'three'
import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Image, Environment, useTexture, useVideoTexture } from '@react-three/drei'
import { easing } from 'maath'
import { GalleryOverlay } from './GalleryOverlay'
import './util'

// ─────────────────────────────────────────
//  프로젝트 데이터
//  type: 'youtube' | 'site' | 'video' | 'gallery'
// ─────────────────────────────────────────
const PROJECTS = [
  {
    id: 0,
    title: 'Innovation Seed',
    type: 'youtube',
    thumb: '/projects/reptile-expo-yt.jpg',
    link: 'https://www.youtube.com/watch?v=xeaKFQu4ZYw',
  },
  {
    id: 1,
    title: 'Reptile Expo Site',
    type: 'site',
    thumb: '/projects/Reptile.png',
    link: '#',
  },
  {
    id: 2,
    title: 'Pizza Hut Site',
    type: 'site',
    thumb: '/projects/Pizza.png',
    link: '#',
  },
  {
    id: 3,
    title: 'Study Pet',
    type: 'gallery',          // 클릭 시 갤러리 오버레이
    galleryKey: 'studypet',
    thumb: '/projects/studypet.png',
    link: '#',
  },
  {
    id: 4,
    title: 'Repta',
    type: 'gallery',          // 클릭 시 갤러리 오버레이
    galleryKey: 'repta',
    thumb: '/projects/repta.png',
    link: '#',
  },
  {
    id: 5,
    title: 'Bottega Veneta',
    type: 'video',
    thumb: '/projects/bottega-thumb.jpg',
    video: '/projects/보테가베네타.mp4',
    link: '#',
  },
  {
    id: 6,
    title: 'Japan Food',
    type: 'video',
    thumb: '/projects/japan-food-thumb.jpg',
    video: '/projects/일본음식숏츠.mp4',
    link: '#',
  },
  {
    id: 7,
    title: 'Cat Festa',
    type: 'video',
    thumb: '/projects/cat-festa-thumb.jpg',
    video: '/projects/캣페스타.mp4',
    link: '#',
  },
]

// ─────────────────────────────────────────
//  Canvas 루트 + 갤러리 오버레이 상태 관리
// ─────────────────────────────────────────
export const App = () => {
  const [galleryKey, setGalleryKey] = useState(null)

  return (
    <>
      <Canvas camera={{ position: [0, 0, 100], fov: 15 }}>
        <fog attach="fog" args={['#e5e4de', 8.5, 12]} />
        <Rig rotation={[0, 0, 0.15]}>
          <Carousel onOpenGallery={setGalleryKey} />
        </Rig>
        <Environment preset="dawn" background blur={0.5} />
      </Canvas>

      {/* 갤러리 오버레이 — 포털 없이 Canvas 위에 absolute 배치 */}
      {galleryKey && (
        <GalleryOverlay
          projectKey={galleryKey}
          onClose={() => setGalleryKey(null)}
        />
      )}
    </>
  )
}

// ─────────────────────────────────────────
//  스크롤 기반 회전 Rig
// ─────────────────────────────────────────
function Rig(props) {
  const ref = useRef()
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const workSection = document.getElementById('work')
      if (!workSection) return
      const rect = workSection.getBoundingClientRect()
      const scrolledDistance = -rect.top
      const maxScroll = rect.height - window.innerHeight
      let progress = scrolledDistance / maxScroll
      progress = Math.max(0, Math.min(1, progress))
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  useFrame((state, delta) => {
    easing.damp(ref.current.rotation, 'y', -scrollProgress * Math.PI * 2, 0.2, delta)
    easing.damp3(state.camera.position, [-state.pointer.x * 2, state.pointer.y + 1.5, 10], 0.3, delta)
    state.camera.lookAt(0, 0, 0)
  })
  return <group ref={ref} {...props} />
}

// ─────────────────────────────────────────
//  카드 배치
// ─────────────────────────────────────────
function Carousel({ radius = 1.4, onOpenGallery }) {
  const count = PROJECTS.length
  return PROJECTS.map((project, i) => (
    <Card
      key={project.id}
      project={project}
      onOpenGallery={onOpenGallery}
      position={[
        Math.sin((i / count) * Math.PI * 2) * radius,
        0,
        Math.cos((i / count) * Math.PI * 2) * radius,
      ]}
      rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0]}
    />
  ))
}

// ─────────────────────────────────────────
//  이미지 카드 (youtube / site / gallery)
// ─────────────────────────────────────────
function ImageCard({ url, hovered, ...props }) {
  const ref = useRef()
  useFrame((_, delta) => {
    const targetScale = hovered ? 1.15 : 1
    easing.damp(ref.current.scale, 'x', -targetScale, 0.1, delta)
    easing.damp(ref.current.scale, 'y', targetScale, 0.1, delta)
    easing.damp(ref.current.scale, 'z', targetScale, 0.1, delta)
    easing.damp(ref.current.material, 'radius', hovered ? 0.25 : 0.1, 0.2, delta)
    easing.damp(ref.current.material, 'zoom', hovered ? 1 : 1.5, 0.2, delta)
  })
  return (
    <Image ref={ref} url={url} transparent side={THREE.DoubleSide} {...props}>
      <bentPlaneGeometry args={[0.1, 1, 1, 20, 20]} />
    </Image>
  )
}

// ─────────────────────────────────────────
//  영상 카드 — 호버 시 mp4 재생
// ─────────────────────────────────────────
function VideoCard({ videoUrl, thumbUrl, hovered, ...props }) {
  const ref = useRef()

  const videoTexture = useVideoTexture(videoUrl, {
    muted: true,
    loop: true,
    start: hovered,
  })
  const thumbTexture = useTexture(thumbUrl)

  useFrame((_, delta) => {
    if (!ref.current) return
    const targetScale = hovered ? 1.15 : 1
    easing.damp(ref.current.scale, 'x', -targetScale, 0.1, delta)
    easing.damp(ref.current.scale, 'y', targetScale, 0.1, delta)
    easing.damp(ref.current.scale, 'z', targetScale, 0.1, delta)
    easing.damp(ref.current.material, 'radius', hovered ? 0.25 : 0.1, 0.2, delta)
    easing.damp(ref.current.material, 'zoom', hovered ? 1 : 1.5, 0.2, delta)
    ref.current.material.map = hovered ? videoTexture : thumbTexture
    ref.current.material.needsUpdate = true
  })

  return (
    <Image ref={ref} url={thumbUrl} transparent side={THREE.DoubleSide} {...props}>
      <bentPlaneGeometry args={[0.1, 1, 1, 20, 20]} />
    </Image>
  )
}

// ─────────────────────────────────────────
//  카드 디스패처
// ─────────────────────────────────────────
function Card({ project, onOpenGallery, ...props }) {
  const [hovered, setHovered] = useState(false)

  const handleClick = (e) => {
    e.stopPropagation()
    if (project.type === 'gallery') {
      onOpenGallery(project.galleryKey)
    } else if (project.link && project.link !== '#') {
      window.open(project.link, '_blank')
    }
  }

  const events = {
    onPointerOver: (e) => { e.stopPropagation(); setHovered(true) },
    onPointerOut: () => setHovered(false),
    onClick: handleClick,
  }

  if (project.type === 'video') {
    return (
      <Suspense
        fallback={
          <ImageCard url={project.thumb} hovered={hovered} {...events} {...props} />
        }
      >
        <VideoCard
          videoUrl={project.video}
          thumbUrl={project.thumb}
          hovered={hovered}
          {...events}
          {...props}
        />
      </Suspense>
    )
  }

  // youtube / site / gallery — 썸네일 이미지
  return (
    <ImageCard url={project.thumb} hovered={hovered} {...events} {...props} />
  )
}
