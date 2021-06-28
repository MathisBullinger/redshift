import * as vec from './vec'

const canvas = document.querySelector<HTMLCanvasElement>('canvas')!
const ctx = canvas.getContext('2d')!

canvas.width = window.innerWidth * devicePixelRatio
canvas.height = window.innerHeight * devicePixelRatio

type Particle = {
  pos: vec.Vec
  vel: vec.Vec
  cl: string
  r: number
  stop: number
  previous: vec.Vec[]
}

const ranCl = () =>
  '#' +
  Array(3)
    .fill(0)
    .map(() => Math.floor(Math.random() * 200 + 55).toString(16))
    .join('')

const maxV = 50
const genPart = (): Particle => ({
  pos: [Math.random() * canvas.width, Math.random() * canvas.height],
  vel: [Math.random() * maxV - maxV / 2, Math.random() * maxV - maxV / 2],
  cl: ranCl(),
  r: 10 + Math.random() ** 2 * 50,
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
    vel,
    cl,
    r,
    stop,
  } of particles) {
    const gradient = ctx.createRadialGradient(x, y, 0.5 * r, x, y, r)
    const a = ((Math.min(vec.mag(vel), 400) / 400) * 0xff) | 0
    gradient.addColorStop(stop, cl + `0${a.toString(16)}`.slice(-2))
    gradient.addColorStop(1, cl + '00')
    ctx.fillStyle = gradient
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
}

let last = performance.now()

function update() {
  const dt = (performance.now() - last) / 1000
  last += dt * 1000

  for (const part of particles) {
    for (const p2 of particles) {
      if (p2 === part) continue
      attract(p2, part.pos, dt, part.r ** 2 / 20000)
    }

    part.pos = vec.add(part.pos, vec.mult(part.vel, dt))

    // friction
    // part.vel = vec.mult(part.vel, 1 - 0.2 * dt)

    // collision
    if (part.pos[0] < 0) part.pos[0] = canvas.width
    else if (part.pos[0] > canvas.width) part.pos[0] = 0
    if (part.pos[1] < 0) part.pos[1] = canvas.height
    else if (part.pos[1] > canvas.height) part.pos[1] = 0
  }
}

function attract(part: Particle, origin: vec.Vec, dt: number, m = 1) {
  const d = vec.mag(vec.sub(origin, part.pos))
  if (d === 0) return
  const f = Math.min(m / (d / 1000) ** 2, 1000)
  const fv = vec.mult(vec.div(vec.sub(origin, part.pos), d), f)
  part.vel = vec.add(part.vel, vec.mult(fv, dt))
}

let afId: number
step()
function step() {
  update()
  render()
  afId = requestAnimationFrame(step)
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    last = performance.now()
    step()
  } else {
    cancelAnimationFrame(afId)
  }
})
