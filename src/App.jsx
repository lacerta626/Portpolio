import * as THREE from 'three'
import { useRef, useState, useEffect, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { Image, Environment, useTexture, useVideoTexture } from '@react-three/drei'
import { easing } from 'maath'
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
    type: 'gallery',
    galleryKey: 'studypet',
    thumb: '/projects/studypet.png',
    link: '#',
  },
  {
    id: 4,
    title: 'Repta',
    type: 'gallery',
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
//  영상 라이트박스 오버레이
// ─────────────────────────────────────────
function VideoLightbox({ videoUrl, title, onClose }) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'lbFadeIn 0.25s ease',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes lbFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lbScaleIn {
          from { transform: scale(0.94); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        .lb-inner {
          position: relative;
          width: min(90vw, 1100px);
          animation: lbScaleIn 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        .lb-inner video {
          width: 100%;
          display: block;
          border-radius: 4px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6);
        }
        .lb-close {
          position: absolute;
          top: -2.8rem;
          right: 0;
          background: none;
          border: 1px solid rgba(255,255,255,0.25);
          color: #fff;
          font-size: 0.65rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 0.4rem 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Space Grotesk', sans-serif;
          transition: background 0.2s, border-color 0.2s;
        }
        .lb-close:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.6);
        }
        .lb-title {
          position: absolute;
          bottom: -2.6rem;
          left: 0;
          font-size: 0.68rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          font-family: 'Space Grotesk', sans-serif;
        }
      `}</style>

      <div
        className="lb-inner"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button className="lb-close" onClick={onClose}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="1" y1="1" x2="11" y2="11"/>
            <line x1="11" y1="1" x2="1" y2="11"/>
          </svg>
          Close
        </button>

        {/* 영상 */}
        <video
          src={videoUrl}
          autoPlay
          controls
          playsInline
          loop
        />

        {/* 영상 타이틀 */}
        <p className="lb-title">{title}</p>
      </div>
    </div>,
    document.body
  )
}

// ─────────────────────────────────────────
//  Canvas 루트
// ─────────────────────────────────────────
export const App = () => {
  const [lightbox, setLightbox] = useState(null) // { videoUrl, title }

  return (
    <>
      <Canvas camera={{ position: [0, 0, 100], fov: 15 }}>
        <fog attach="fog" args={['#e5e4de', 8.5, 12]} />
        <Rig rotation={[0, 0, 0.15]}>
          <Carousel onOpenVideo={setLightbox} />
        </Rig>
        <Environment preset="studio" background blur={0.5} />
      </Canvas>

      {lightbox && (
        <VideoLightbox
          videoUrl={lightbox.videoUrl}
          title={lightbox.title}
          onClose={() => setLightbox(null)}
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
function Carousel({ radius = 1.4, onOpenVideo }) {
  const count = PROJECTS.length
  return PROJECTS.map((project, i) => (
    <Card
      key={project.id}
      project={project}
      onOpenVideo={onOpenVideo}
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
//  이미지 카드
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
//  영상 카드 — 호버 시 mp4 미리보기 재생
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
const GALLERY_PAGES = {
  studypet: 'project-studypet.html',
  repta: 'project-repta.html',
}

function Card({ project, onOpenVideo, ...props }) {
  const [hovered, setHovered] = useState(false)

  const handleClick = (e) => {
    e.stopPropagation()
    if (project.type === 'video') {
      // 영상 라이트박스 열기
      onOpenVideo({ videoUrl: project.video, title: project.title })
    } else if (project.type === 'gallery' && project.galleryKey) {
      window.location.href = GALLERY_PAGES[project.galleryKey]
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

  return (
    <ImageCard url={project.thumb} hovered={hovered} {...events} {...props} />
  )
}
