const getCanvas = (container: HTMLElement) => {
  const existingCanvas = container.getElementsByTagName('canvas')[0]
  if (existingCanvas) {
    return existingCanvas
  }
  const canvas = document.createElement('canvas')
  container.appendChild(canvas)
  return canvas
}

export default (elementId: string, width: number, height: number): CanvasRenderingContext2D => {
  if (!window || !document) {
    throw Error('needs a browser context')
  }
  const container = document.getElementById(elementId)
  if (!container) {
    throw new Error(`no element with id: "${elementId}" exists`)
  }

  const canvas = getCanvas(container)
  canvas.setAttribute('width', String(width))
  canvas.setAttribute('height', String(height))

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Could not create canvas 2d context')
  }
  return context
}