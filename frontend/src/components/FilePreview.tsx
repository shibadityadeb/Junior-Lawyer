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
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="group inline-flex items-center bg-gradient-to-br from-slate-700/60 to-slate-800/60 border border-slate-600/50 rounded-xl px-3.5 py-2 text-xs text-slate-200 hover:border-slate-500 hover:shadow-md transition-all duration-200 backdrop-blur-sm"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-700/50 text-slate-300 mr-2.5 group-hover:bg-slate-600/50 transition-colors">
              {getFileIcon(file)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate max-w-[160px] font-medium text-slate-100" title={file.name}>
                {file.name}
              </span>
              <span className="text-[10px] text-slate-400">{formatFileSize(file.size)}</span>
            </div>
            <button
              onClick={() => onRemove(index)}
              className="ml-3 flex items-center justify-center w-5 h-5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
              type="button"
              aria-label={`Remove ${file.name}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
