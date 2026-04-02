import { useState } from 'react'
import { useStore } from '../store'

export default function ParentLogin() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const unlockParent = useStore(s => s.unlockParent)
  const setView = useStore(s => s.setView)

  const handleSubmit = () => {
    if (pin === '1234') {
      unlockParent()
      setView('parents')
      setPin('')
      setError(false)
    } else {
      setError(true)
      setPin('')
    }
  }

  const handleDigit = (d) => {
    if (pin.length < 4) {
      const newPin = pin + d
      setPin(newPin)
      setError(false)
      if (newPin.length === 4) {
        setTimeout(() => {
          if (newPin === '1234') {
            unlockParent()
            setView('parents')
            setPin('')
          } else {
            setError(true)
            setPin('')
          }
        }, 200)
      }
    }
  }

  return (
    <div className="px-4 pb-28 pt-12">
      <div className="max-w-sm mx-auto text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">家长验证</h2>
        <p className="text-sm text-gray-400 mb-8">请输入4位密码进入家长模式</p>
        <p className="text-xs text-gray-300 mb-6">（默认密码：1234）</p>

        {/* PIN dots */}
        <div className="flex gap-3 justify-center mb-8">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all ${
                i < pin.length
                  ? 'bg-purple-500 scale-110'
                  : 'bg-gray-200'
              } ${error ? 'bg-red-400 animate-[shake_0.5s_ease-in-out]' : ''}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4 animate-pop-in">密码不正确，请重试</p>
        )}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((d, i) => (
            d === null ? <div key={i} /> :
            d === 'del' ? (
              <button
                key={i}
                onClick={() => setPin(pin.slice(0, -1))}
                className="h-14 rounded-2xl bg-gray-100 text-gray-500 text-lg font-medium hover:bg-gray-200 transition-colors active:scale-95"
              >
                ←
              </button>
            ) : (
              <button
                key={i}
                onClick={() => handleDigit(String(d))}
                className="h-14 rounded-2xl bg-white text-gray-700 text-xl font-medium hover:bg-purple-50 transition-colors active:scale-95 shadow-sm"
              >
                {d}
              </button>
            )
          ))}
        </div>

        <button
          onClick={() => setView('kids')}
          className="mt-8 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← 返回
        </button>
      </div>
    </div>
  )
}
