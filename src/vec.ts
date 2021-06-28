export type Vec = [x: number, y: number]

export const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]]
export const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]]
export const mult = (vec: Vec, m: number): Vec => [vec[0] * m, vec[1] * m]
export const div = (vec: Vec, m: number): Vec => [vec[0] / m, vec[1] / m]

export const mag = ([x, y]: Vec): number => Math.sqrt(x ** 2 + y ** 2)

export const angle = (a: Vec, b: Vec) =>
  Math.acos((a[0] * b[0] + a[1] * b[1]) / (mag(a) * mag(b)))
