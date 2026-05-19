import { useRef, useEffect, Suspense } from 'react'
import ReactDOM from 'react-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Image, ScrollControls, Scroll, useScroll } from '@react-three/drei'
import { easing } from 'maath'

// ─────────────────────────────────────────
//  프로젝트별 이미지 목록
// ─────────────────────────────────────────
const PROJECT_DATA = {
  studypet: {
    title: 'Study Pet',
    subtitle: 'Branding / UI Design',
    // 12장 → 3열 4그룹으로 구성
    groups: [
      ['/projects/studypet1.png', '/projects/studypet2.png', '/projects/studypet3.png'],
      ['/projects/studypet4.png', '/projects/studypet5.png', '/projects/studypet6.png'],
      ['/projects/studypet7.png', '/projects/studypet8.png', '/projects/studypet9.png'],
      ['/projects/studypet10.png', '/projects/studypet11.png', '/projects/studypet12.png'],
    ],
  },
  repta: {
    title: 'Repta',
    subtitle: 'Branding / Visual Identity',
    // 7장 → 3열 3그룹 (마지막 그룹은 2장 + 첫 장 반복)
    groups: [
      ['/projects/repta1.png', '/projects/repta2.png', '/projects/repta3.png'],
      ['/projects/repta4.png', '/projects/repta5.png', '/projects/repta6.png'],
      ['/projects/repta7.png', '/projects/repta1.png', '/projects/repta2.png'],
    ],
  },
}

// ─────────────────────────────────────────
//  개별 이미지 아이템 (스크롤 delta로 Z + grayscale 애니메이션)
// ─────────────────────────────────────────
function Item({ url, scale, ...props }) {
  const ref = useRef()
  const scroll = useScroll()

  useFrame((_, delta) => {
    if (!ref.current) return
    // 스크롤 속도(delta)에 따라 Z축 앞으로 튀어나오는 효과
    easing.damp(
      ref.current.position, 'z',
      Math.max(0, scroll.delta * 60),
      0.3, delta
    )
    // 스크롤 중 grayscale → 멈추면 컬러 복원
    easing.damp(
      ref.current.material, 'grayscale',
      Math.max(0, 1 - scroll.delta * 1500),
      0.3, delta
    )
  })

  return (
    <Image
      ref={ref}
      url={url}
      scale={scale}
      {...props}
    />
  )
}

// ─────────────────────────────────────────
//  3열 이미지 그룹 (한 "페이지" 단위)
// ─────────────────────────────────────────
function ImageGroup({ urls, gap = 0.15, ...props }) {
  const { viewport } = useThree()
  const w = viewport.width
  // 반응형: 좁은 화면이면 1열로
  const colRatio = w < 10 ? 1.5 / 3 : 1 / 3
  const itemW = w * colRatio - gap * 2

  return (
    <group {...props}>
      <Item
        position={[-w * colRatio, 0, -1]}
        scale={[itemW, 5, 1]}
        url={urls[0]}
      />
      <Item
        position={[0, 0, 0]}
        scale={[itemW, 5, 1]}
        url={urls[1]}
      />
      <Item
        position={[w * colRatio, 0, 1]}
        scale={[itemW, 5, 1]}
        url={urls[2]}
      />
    </group>
  )
}

// ─────────────────────────────────────────
//  전체 갤러리 씬 (가로 무한 스크롤)
// ─────────────────────────────────────────
function GalleryScene({ groups }) {
  const { viewport } = useThree()
  const w = viewport.width
  const count = groups.length

  return (
    // infinite: true → 끝에 도달하면 처음으로 루프
    <ScrollControls
      infinite
      horizontal
      damping={4}
      pages={count}
      distance={1}
    >
      {/* 3D 이미지 레이어 */}
      <Scroll>
        {groups.map((urls, i) => (
          <ImageGroup
            key={i}
            urls={urls}
            position={[w * i, 0, 0]}
          />
        ))}
      </Scroll>

      {/* HTML 텍스트 오버레이 레이어 */}
      <Scroll html>
        {groups.map((_, i) => (
          <h1
            key={i}
            style={{
              position: 'absolute',
              top: '20vh',
              left: `${i * 100 + 12}vw`,
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(3rem, 8vw, 7rem)',
              fontWeight: 700,
              color: 'rgba(240,237,230,0.08)',
              letterSpacing: '-0.03em',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {String(i + 1).padStart(2, '0')}
          </h1>
        ))}
      </Scroll>
    </ScrollControls>
  )
}

// ─────────────────────────────────────────
//  갤러리 오버레이 내부 컨텐츠
// ─────────────────────────────────────────
function GalleryContent({ projectKey, onClose }) {
  const data = PROJECT_DATA[projectKey]

  // ESC 키로 닫기
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // 페이지 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!data) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: '#0a0a0a',
    }}>
      {/* R3F 캔버스 — 전체 화면 */}
      <Canvas
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#0a0a0a']} />
        <Suspense fallback={null}>
          <GalleryScene groups={data.groups} />
        </Suspense>
      </Canvas>

      {/* UI 오버레이 (포인터 이벤트 없음) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        {/* 좌상단 타이틀 */}
        <div style={{
          position: 'absolute',
          top: '2.5rem',
          left: '2.5rem',
        }}>
          <p style={{
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            color: 'rgba(240,237,230,0.4)',
            textTransform: 'uppercase',
            marginBottom: '0.3rem',
          }}>
            {data.subtitle}
          </p>
          <h2 style={{
            margin: 0,
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
            fontWeight: 700,
            color: '#f0ede6',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            {data.title}
          </h2>
        </div>

        {/* 우상단 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '2.5rem',
            right: '2.5rem',
            pointerEvents: 'auto',
            background: 'none',
            border: '1px solid rgba(240,237,230,0.25)',
            color: 'rgba(240,237,230,0.7)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            padding: '0.5rem 1.2rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(240,237,230,0.08)'
            e.currentTarget.style.borderColor = 'rgba(240,237,230,0.6)'
            e.currentTarget.style.color = '#f0ede6'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'none'
            e.currentTarget.style.borderColor = 'rgba(240,237,230,0.25)'
            e.currentTarget.style.color = 'rgba(240,237,230,0.7)'
          }}
        >
          ✕ Close
        </button>

        {/* 하단 스크롤 힌트 */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '2.5rem',
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '0.65rem',
          letterSpacing: '0.2em',
          color: 'rgba(240,237,230,0.3)',
          textTransform: 'uppercase',
        }}>
          ← Scroll to explore →
        </div>

        {/* 우하단 이미지 수 */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          right: '2.5rem',
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          color: 'rgba(240,237,230,0.3)',
        }}>
          {data.groups.flat().length} images
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
//  포털로 body에 마운트
// ─────────────────────────────────────────
export function GalleryOverlay({ projectKey, onClose }) {
  return ReactDOM.createPortal(
    <GalleryContent projectKey={projectKey} onClose={onClose} />,
    document.body
  )
}
