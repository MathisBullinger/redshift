const canvas = document.querySelector<HTMLCanvasElement>('canvas')!
const ctx = canvas.getContext('2d')!

canvas.width = window.innerWidth * devicePixelRatio
canvas.height = window.innerHeight * devicePixelRatio

type Vec = [x: number, y: number]
type Particle = {
  pos: Vec
  vel: Vec
  cl: string
  r: number
  stop: number
  previous: Vec[]
}

const ranCl = () =>
  '#' +
  Array(3)
    .fill(0)
    .map(() => Math.floor((Math.random() * 200 + 55) / 0xf).toString(16)[0])
    .join('')

const maxV = 300

const genPart = (): Particle => ({
  pos: [Math.random() * canvas.width, Math.random() * canvas.height],
  vel: [Math.random() * maxV - maxV / 2, Math.random() * maxV - maxV / 2],
  cl: ranCl(),
  r: 10 + Math.random() ** 2 * 200,
  stop: (Math.random() * 0.5) ** 2,
  previous: [],
})

const particles: Particle[] = []
for (let i = 0; i < 100; i++) particles.push(genPart())

function render() {
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const {
    pos: [x, y],
    cl,
    r,
    stop,
  } of particles) {
    const gradient = ctx.createRadialGradient(x, y, 10, x, y, r)
    gradient.addColorStop(stop, cl)
    gradient.addColorStop(1, cl + '0')
    ctx.fillStyle = gradient
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }

  // center pos
  // const [cx, cy] = [0, 1].map(
  //   (i) => particles.reduce((a, c) => a + c.pos[i], 0) / particles.length
  // )
  // ctx.strokeStyle = '#f00'
  // ctx.strokeRect(cx - 10, cy - 10, 20, 20)
}

let mouse: Vec | null = null
canvas.addEventListener('mousemove', ({ clientX: x, clientY: y }) => {
  mouse = [x * devicePixelRatio, y * devicePixelRatio]
})

let last = performance.now()

function update() {
  const dt = (performance.now() - last) / 1000
  last += dt * 1000

  for (const part of particles) {
    for (const p2 of particles) {
      if (p2 === part) continue
      attract(p2, part.pos, dt, part.r ** 2 / 50000)
    }

    part.pos[0] += part.vel[0] * dt
    part.pos[1] += part.vel[1] * dt

    // friction
    // part.vel[0] *= 1 - 0.1 * dt
    // part.vel[1] *= 1 - 0.1 * dt

    // collision
    if (part.pos[0] < 0) {
      part.pos[0] = 0
      part.vel[0] *= -1
    } else if (part.pos[0] > canvas.width) {
      part.pos[0] = canvas.width
      part.vel[0] *= -1
    }
    if (part.pos[1] < 0) {
      part.pos[1] = 0
      part.vel[1] *= -1
    } else if (part.pos[1] > canvas.height) {
      part.pos[1] = canvas.height
      part.vel[1] *= -1
    }
  }
}

function attract(part: Particle, origin: Vec, dt: number, m = 1) {
  const d = Math.sqrt(
    (origin[0] - part.pos[0]) ** 2 + (origin[1] - part.pos[1]) ** 2
  )
  if (d === 0) return
  const f = Math.min(m / (d / 1000) ** 2, 1000)
  const fx = ((origin[0] - part.pos[0]) / d) * f
  const fy = ((origin[1] - part.pos[1]) / d) * f
  part.vel[0] += fx * dt
  part.vel[1] += fy * dt
}

step()
function step() {
  update()
  render()
  requestAnimationFrame(step)
}
