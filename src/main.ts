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
}

const ranCl = () =>
  '#' +
  Array(3)
    .fill(0)
    .map(() => Math.floor((Math.random() * 200 + 55) / 0xf).toString(16)[0])
    .join('')

const genPart = (): Particle => ({
  pos: [Math.random() * canvas.width, Math.random() * canvas.height],
  vel: [0, 0],
  cl: ranCl(),
  r: 50 + Math.sqrt(Math.random() * 100000),
  stop: (Math.random() * 0.5) ** 2,
})

const particles: Particle[] = []
for (let i = 0; i < 20; i++) particles.push(genPart())

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
}

let mouse: Vec | null = null
canvas.addEventListener('mousemove', ({ clientX: x, clientY: y }) => {
  mouse = [x * devicePixelRatio, y * devicePixelRatio]
})

let last = performance.now()
function update() {
  const dt = (performance.now() - last) / 1000
  last += dt * 1000

  for (const { pos, vel } of particles) {
    if (mouse) {
      const d = Math.sqrt((mouse[0] - pos[0]) ** 2 + (mouse[1] - pos[1]) ** 2)
      const f = -Math.min((3000 / d) ** 2, 500)
      const fx = ((mouse[0] - pos[0]) / d) * -f
      const fy = ((mouse[1] - pos[1]) / d) * -f
      vel[0] += fx * dt
      vel[1] += fy * dt
    }

    vel[0] *= 1 - 0.5 * dt
    vel[1] *= 1 - 0.5 * dt

    pos[0] += vel[0] * dt
    pos[1] += vel[1] * dt
  }
}

step()
function step() {
  update()
  render()
  requestAnimationFrame(step)
}
