import { useRef, useState } from 'react'

import { html } from 'htm/react'

import { DropAreaWrapper, HiddenInput, Label } from './styles'

/**
 * @param {{
 *  label: import('react').ReactNode,
 *  onFileDrop: (files: File[]) => void,
 *  accepts: string,
 * }} props
 */
export const FileDropArea = ({ label, onFileDrop, accepts }) => {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleAreaClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    const files = event.target.files

    onFileDrop?.(files)
  }

  const handleDragOver = (event) => {
    event.preventDefault()

    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()

    const files = Array.from(event.dataTransfer.files)

    onFileDrop?.(files)
  }

  return html` <${DropAreaWrapper}
    onClick=${handleAreaClick}
    onDragOver=${handleDragOver}
    onDragLeave=${handleDragLeave}
    onDrop=${handleDrop}
    isDragging=${isDragging}
  >
    <${Label}> ${label} <//>
    <${HiddenInput}
      ref=${fileInputRef}
      type="file"
      accepts=${accepts}
      onChange=${handleFileChange}
    />
  <//>`
}
