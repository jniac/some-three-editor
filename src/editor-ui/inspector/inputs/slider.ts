import { inverseLerp, lerp } from 'some-utils-ts/math/basic'

export const defaultSliderProps = {
  min: 0,
  max: 1,
  step: 0,
  pow: 0,
  ease: 'linear',
}

export type SliderProps = typeof defaultSliderProps

export function parseSliderProps(str: string): SliderProps {
  const [min, max, ...rest] = str.split(/\s*,\s*/).map(s => s.trim())
  const props: Record<string, any> = {
    ...defaultSliderProps,
    min: Number.parseFloat(min),
    max: Number.parseFloat(max),
  }

  for (const param of rest) {
    const [key, value] = param.split(':').map(s => s.trim()) as [keyof SliderProps, string]
    props[key] = /^ease$/.test(key) ? value : Number.parseFloat(value)
  }

  return props as SliderProps
}

/**
 * Converts a value to a normalized value (slider range 0-1).
 */
export function sliderNormalize(value: number, props: SliderProps) {
  const { min, max, step, pow } = props
  if (Number.isFinite(step) && step > 0) {
    value = Math.round(value / step) * step
  }
  if (pow > 0) {
    // value = (Math.log(value) - Math.log(min)) / (Math.log(max) - Math.log(min))
    value = Math.log(value) / Math.log(pow)
  }
  return inverseLerp(min, max, value)
}

/**
 * Converts a normalized value (slider range 0-1) to a value.
 */
export function sliderUnnormalize(value: number, props: SliderProps) {
  const { min, max, step, pow } = props
  value = lerp(min, max, value)
  if (pow > 0) {
    // value = Math.exp(Math.log(min) * (1 - value) + Math.log(max) * value)
    value = Math.pow(pow, value)
  }
  if (Number.isFinite(step) && step > 0) {
    value = Math.round(value / step) * step
  }
  return value
}