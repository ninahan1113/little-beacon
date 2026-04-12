import { useState, useRef } from 'react'
import { useStore } from '../store'
import { playGem } from '../sounds'

// Reuse the same compress logic from TaskModal
const compressPhoto = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 480
        let w = img.width, h = img.height
        if (w > h) { if (w > maxSize) { h = (h * maxSize) / w; w = maxSize } }
        else { if (h > maxSize) { w = (w * maxSize) / h; h = maxSize } }
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.6))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function RewardsStore() {
  const rewards = useStore(s => s.rewards)
  const gems = useStore(s => s.gems)
  const redeemReward = useStore(s => s.redeemReward)
  const redeemedRewards = useStore(s => s.redeemedRewards)
  const addRedeemPhoto = useStore(s => s.addRedeemPhoto)
  const [redeemed, setRedeemed] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [showCabinet, setShowCabinet] = useState(false)
  const [viewingPhoto, setViewingPhoto] = useState(null)
  const fileRef = useRef(null)
  const [uploadingId, setUploadingId] = useState(null)

  const handleRedeem = (reward) => {
    if (gems < reward.cost) return
    redeemReward(reward.id)
    playGem()
    setConfirmId(null)
    setRedeemed(reward.id)
    setTimeout(() => setRedeemed(null), 2000)
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (file && uploadingId) {
      const base64 = await compressPhoto(file)
      addRedeemPhoto(uploadingId, base64)
      setUploadingId(null)
    }
    e.target.value = '' // reset input
  }

  const triggerUpload = (redeemId) => {
    setUploadingId(redeemId)
    fileRef.current?.click()
  }

  const getReward = (rewardId) => rewards.find(r => r.id === rewardId)

  const formatDate = (iso) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }

  // Group redeemed rewards by month for display
  const sortedRedeemed = [...redeemedRewards].reverse()

  return (
    <div className="px-4 pb-28 pt-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏡</div>
          <h2 className="text-xl font-bold text-gray-700 mb-1">树屋商店</h2>
          <p className="text-sm text-gray-400">
            用能量宝石兑换奖励吧！当前：<span className="text-purple-600 font-bold">{gems}</span> 💎
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setShowCabinet(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              !showCabinet ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400'
            }`}
          >
            🎁 兑换商店
          </button>
          <button
            onClick={() => setShowCabinet(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all relative ${
              showCabinet ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-400'
            }`}
          >
            🏆 我的奖品柜
            {redeemedRewards.length > 0 && (
              <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                showCabinet ? 'bg-amber-500 text-white' : 'bg-gray-300 text-white'
              }`}>
                {redeemedRewards.length}
              </span>
            )}
          </button>
        </div>

        {/* Store view */}
        {!showCabinet && (
          <>
            <div className="grid grid-cols-2 gap-4">
              {rewards.map(reward => {
                const canAfford = gems >= reward.cost
                const justRedeemed = redeemed === reward.id
                const isConfirming = confirmId === reward.id
                return (
                  <div
                    key={reward.id}
                    className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${
                      justRedeemed
                        ? 'border-green-300 bg-green-50'
                        : isConfirming
                        ? 'border-yellow-300 bg-yellow-50'
                        : canAfford
                        ? 'border-purple-100 hover:border-purple-200 hover:shadow-md'
                        : 'border-gray-100 opacity-60'
                    }`}
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mx-auto mb-3"
                      style={{ backgroundColor: reward.color + '40' }}
                    >
                      {justRedeemed ? '🎉' : reward.icon}
                    </div>
                    <h3 className="text-sm font-bold text-gray-700 text-center mb-1">{reward.name}</h3>
                    <div className="text-center mb-3">
                      <span className="text-xs font-medium text-purple-500">{reward.cost} 💎</span>
                    </div>
                    {justRedeemed ? (
                      <div className="text-center py-2 animate-pop-in">
                        <span className="text-sm font-bold text-green-600">兑换成功！</span>
                      </div>
                    ) : isConfirming ? (
                      <div className="space-y-2 animate-pop-in">
                        <p className="text-xs text-center text-yellow-700 font-medium">
                          确定花 {reward.cost}💎 兑换吗？
                        </p>
                        <div className="flex gap-2">
                          <button onClick={() => setConfirmId(null)}
                            className="flex-1 py-2 rounded-xl text-xs font-medium bg-gray-100 text-gray-500 active:scale-95">
                            取消
                          </button>
                          <button onClick={() => handleRedeem(reward)}
                            className="flex-1 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white active:scale-95">
                            确定！
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => canAfford && setConfirmId(reward.id)}
                        disabled={!canAfford}
                        className={`w-full py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                          canAfford
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-200 hover:opacity-90'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? '兑换' : `还差 ${reward.cost - gems} 💎`}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-8 bg-white/60 rounded-2xl p-5 text-center">
              <p className="text-2xl mb-2">🌟</p>
              <p className="text-sm text-gray-500">
                每天完成任务就能收集更多宝石哦！<br />
                坚持就有大奖励～
              </p>
            </div>
          </>
        )}

        {/* Trophy cabinet view */}
        {showCabinet && (
          <>
            {sortedRedeemed.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🏆</div>
                <p className="text-gray-400 font-medium">奖品柜还是空的</p>
                <p className="text-sm text-gray-300 mt-1">快去兑换你的第一个奖品吧！</p>
              </div>
            ) : (
              <>
                {/* Stats banner */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-4 mb-4 border border-amber-100 text-center">
                  <div className="text-3xl mb-1">🌟</div>
                  <p className="text-sm text-amber-700 font-bold">
                    已收获 <span className="text-xl">{sortedRedeemed.length}</span> 个奖品！
                  </p>
                  <p className="text-xs text-amber-500 mt-1">每一个都是努力的见证</p>
                </div>

                {/* Redeemed list */}
                <div className="space-y-3">
                  {sortedRedeemed.map(item => {
                    const reward = getReward(item.rewardId)
                    return (
                      <div key={item.id || item.timestamp} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                        {/* Photo area */}
                        {item.photoUrl ? (
                          <div
                            className="relative cursor-pointer"
                            onClick={() => setViewingPhoto(item.photoUrl)}
                          >
                            <img src={item.photoUrl} alt="奖品照片" className="w-full h-40 object-cover" />
                            <div className="absolute bottom-2 right-2 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full">
                              点击查看大图
                            </div>
                          </div>
                        ) : null}

                        {/* Info row */}
                        <div className="p-3 flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                            style={{ backgroundColor: (reward?.color || '#ffd3b6') + '40' }}
                          >
                            {reward?.icon || '🎁'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-700 truncate">
                              {reward?.name || '已兑换奖品'}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {formatDate(item.timestamp)} · 花费 {reward?.cost || '?'}💎
                            </div>
                          </div>

                          {/* Photo button */}
                          {!item.photoUrl ? (
                            <button
                              onClick={() => triggerUpload(item.id)}
                              className="shrink-0 px-2.5 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors active:scale-95 border border-amber-200"
                            >
                              📸 拍照留念
                            </button>
                          ) : (
                            <span className="shrink-0 text-xs text-green-500 font-medium">✅ 已留念</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* Hidden file input for photo upload */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoUpload}
          className="hidden"
        />

        {/* Photo lightbox */}
        {viewingPhoto && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setViewingPhoto(null)}
          >
            <div className="relative max-w-lg w-full animate-pop-in">
              <img src={viewingPhoto} alt="奖品照片" className="w-full rounded-2xl" />
              <button
                onClick={() => setViewingPhoto(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
