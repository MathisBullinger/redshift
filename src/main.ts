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
  previous: [],
})

const particles: Particle[] = []
for (let i = 0; i < 100; i++) particles.push(genPart())
particles[0].r = 10

function render() {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = particles.length - 1; i >= 0; i--) {
    const part = particles[i]

    let cla = '#fff8'
    let clb = '#fff0'
    if (i > 0) {
      const rv = vec.sub(part.vel, particles[0].vel)

      const rva = vec.angle(rv, vec.sub(part.pos, particles[0].pos))
      const ar =
        ((rva > Math.PI ? Math.PI - Math.PI - (rva - Math.PI) : rva) -
          Math.PI / 2) /
        (Math.PI / 2)

      let rvm = (ar * Math.min(vec.mag(rv), 200)) / 200
      rvm = rvm ** 2 * (rvm > 0 ? 1 : -1) * 0xff

      const hd2 = (n: number) => `0${(n | 0).toString(16)}`.slice(-2)
      const cl = `#${hd2(Math.max(-rvm, 0))}00${hd2(Math.max(rvm, 0))}`

      cla = cl
      clb = cl + '00'
    }

    const gradient = ctx.createRadialGradient(
      part.pos[0],
      part.pos[1],
      0.5 * part.r,
      part.pos[0],
      part.pos[1],
      part.r
    )
    gradient.addColorStop(0.5, cla)
    gradient.addColorStop(1, clb)
    ctx.fillStyle = gradient
    ctx.fillRect(
      part.pos[0] - part.r,
      part.pos[1] - part.r,
      part.r * 2,
      part.r * 2
    )
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
