import { useState, useRef } from 'react'
import { useStore } from '../store'

export default function TaskModal() {
  const selectedTask = useStore(s => s.selectedTask)
  const closeTask = useStore(s => s.closeTask)
  const submitTask = useStore(s => s.submitTask)
  const [photo, setPhoto] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef(null)

  if (!selectedTask) return null

  const handleCapture = () => {
    fileRef.current?.click()
  }

  const [uploading, setUploading] = useState(false)

  // Convert photo to compressed base64 for cross-device persistence
  const compressAndConvert = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxSize = 480 // compress to max 480px
          let w = img.width, h = img.height
          if (w > h) { if (w > maxSize) { h = (h * maxSize) / w; w = maxSize } }
          else { if (h > maxSize) { w = (w * maxSize) / h; h = maxSize } }
          canvas.width = w
          canvas.height = h
          canvas.getContext('2d').drawImage(img, 0, 0, w, h)
          resolve(canvas.toDataURL('image/jpeg', 0.6)) // ~30-80KB
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading(true)
      const base64 = await compressAndConvert(file)
      setPhoto(base64)
      setUploading(false)
    }
  }

  const handleSubmit = () => {
    submitTask(selectedTask.id, photo)
    setSubmitted(true)
    setTimeout(() => {
      setPhoto(null)
      setSubmitted(false)
      closeTask()
    }, 1500)
  }

  const handleClose = () => {
    setPhoto(null)
    setSubmitted(false)
    closeTask()
  }

  // Task-specific illustrations (using colored placeholder with emoji)
  const illustrations = {
    1: { bg: 'from-blue-100 to-cyan-50', scene: '🪥🫧✨🚿', sub: '泡泡飞呀飞～' },
    2: { bg: 'from-amber-100 to-yellow-50', scene: '🎒📚✏️📐', sub: '整整齐齐真开心' },
    3: { bg: 'from-orange-100 to-red-50', scene: '📖🔤✨🧒', sub: '知识就是力量' },
    4: { bg: 'from-pink-100 to-rose-50', scene: '🤸🏃‍♀️💪🌈', sub: '跳出健康跳出美' },
  }
  const illust = illustrations[selectedTask.id] || illustrations[1]

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-end sm:items-center justify-center p-4" onClick={handleClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-slide-up shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Illustration area */}
        <div className={`bg-gradient-to-b ${illust.bg} p-8 text-center relative`}>
          <div className="text-6xl mb-2 tracking-widest">{illust.scene}</div>
          <p className="text-sm text-gray-500">{illust.sub}</p>
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-gray-500 hover:bg-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{selectedTask.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{selectedTask.name}</h3>
              <span className="text-xs text-purple-500 font-medium">+{selectedTask.gems} 💎</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {selectedTask.description}
          </p>

          {/* Photo area */}
          {submitted ? (
            <div className="text-center py-6 animate-pop-in">
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-lg font-bold text-green-600">提交成功！</p>
              <p className="text-sm text-gray-400">等待爸爸妈妈审批哦～</p>
            </div>
          ) : (
            <>
              {photo ? (
                <div className="mb-4">
                  <div className="relative rounded-2xl overflow-hidden">
                    <img src={photo} alt="打卡照片" className="w-full h-48 object-cover" />
                    <button
                      onClick={() => setPhoto(null)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleCapture}
                  disabled={uploading}
                  className="w-full border-2 border-dashed border-purple-200 rounded-2xl py-8 flex flex-col items-center gap-2 hover:border-purple-300 hover:bg-purple-50/50 transition-all active:scale-98 mb-4"
                >
                  {uploading ? (
                    <>
                      <span className="text-4xl animate-pulse">⏳</span>
                      <span className="text-sm font-medium text-purple-500">处理中...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl">📸</span>
                      <span className="text-sm font-medium text-purple-500">拍照打卡</span>
                      <span className="text-xs text-gray-400">点击拍照或上传图片</span>
                    </>
                  )}
                </button>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {photo && (
                <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3.5 rounded-2xl text-base hover:opacity-90 transition-opacity active:scale-98 shadow-lg shadow-purple-200"
                >
                  ✨ 提交打卡
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
