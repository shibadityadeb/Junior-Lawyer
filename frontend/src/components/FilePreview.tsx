import { X, File, Image, FileText } from 'lucide-react'

interface FilePreviewProps {
  files: File[]
  onRemove: (index: number) => void
}

export function FilePreview({ files, onRemove }: FilePreviewProps) {
  if (files.length === 0) return null

  const getFileIcon = (file: File) => {
    const type = file.type
    const name = file.name.toLowerCase()

    if (type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (name.endsWith('.pdf')) return <File className="w-4 h-4" />
    if (name.endsWith('.docx')) return <FileText className="w-4 h-4" />
    if (type === 'text/plain') return <FileText className="w-4 h-4" />

    return <File className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="px-4 py-2 mb-2">
      <div className="flex flex-wrap gap-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="inline-flex items-center bg-slate-700/50 border border-slate-600 rounded-full px-3 py-1 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
          >
            {getFileIcon(file)}
            <span className="ml-2 truncate max-w-[150px]" title={file.name}>
              {file.name}
            </span>
            <span className="ml-2 text-slate-500">({formatFileSize(file.size)})</span>
            <button
              onClick={() => onRemove(index)}
              className="ml-2 text-slate-400 hover:text-red-400 transition-colors"
              type="button"
              aria-label={`Remove ${file.name}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
