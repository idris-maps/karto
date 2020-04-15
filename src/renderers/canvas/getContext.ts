export default (elementId: string, width: number, height: number): CanvasRenderingContext2D => {
  if (!window || !document) {
    throw Error('needs a browser context')
  }
  const container = document.getElementById(elementId)
  if (!container) {
    throw new Error(`no element with id: "${elementId}" exists`)
  }
  const canvas = document.createElement('canvas')
  canvas.setAttribute('width', String(width))
  canvas.setAttribute('height', String(height))
  container.appendChild(canvas)
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Could not create canvas 2d context')
  }
  return context
}