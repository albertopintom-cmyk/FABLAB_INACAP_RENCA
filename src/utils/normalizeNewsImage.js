export function calculateCoverDimensions(sourceWidth, sourceHeight) {
  const targetWidth = 1600
  const targetHeight = 900

  const sourceRatio = sourceWidth / sourceHeight
  const targetRatio = targetWidth / targetHeight

  let drawWidth = sourceWidth
  let drawHeight = sourceHeight
  let offsetX = 0
  let offsetY = 0

  if (sourceRatio > targetRatio) {
    drawHeight = sourceHeight
    drawWidth = sourceHeight * targetRatio
    offsetX = (sourceWidth - drawWidth) / 2
  } else {
    drawWidth = sourceWidth
    drawHeight = sourceWidth / targetRatio
    offsetY = (sourceHeight - drawHeight) / 2
  }

  return {
    drawWidth,
    drawHeight,
    offsetX,
    offsetY,
    canvasWidth: targetWidth,
    canvasHeight: targetHeight,
  }
}

export function normalizeNewsImage(file) {
  if (!(file instanceof Blob)) {
    return Promise.resolve(file)
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const image = new Image()

      image.onload = () => {
        try {
          const { drawWidth, drawHeight, offsetX, offsetY, canvasWidth, canvasHeight } = calculateCoverDimensions(
            image.naturalWidth || image.width,
            image.naturalHeight || image.height,
          )

          const canvas = document.createElement('canvas')
          canvas.width = canvasWidth
          canvas.height = canvasHeight

          const context = canvas.getContext('2d')
          if (!context) {
            throw new Error('No se pudo crear el contexto del canvas para la imagen.')
          }

          context.fillStyle = '#f2f4f7'
          context.fillRect(0, 0, canvas.width, canvas.height)
          context.drawImage(
            image,
            offsetX,
            offsetY,
            drawWidth,
            drawHeight,
            0,
            0,
            canvas.width,
            canvas.height,
          )

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('No se pudo procesar la imagen.'))
                return
              }

              const processedFile = new File([blob], `${(file.name || 'news-image').replace(/\.[^/.]+$/, '')}.jpg`, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })

              resolve(processedFile)
            },
            'image/jpeg',
            0.9,
          )
        } catch (error) {
          reject(error)
        }
      }

      image.onerror = () => reject(new Error('No se pudo cargar la imagen para normalizarla.'))
      image.src = reader.result
    }

    reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen.'))
    reader.readAsDataURL(file)
  })
}
