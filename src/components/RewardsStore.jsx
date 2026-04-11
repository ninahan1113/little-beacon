import { useState } from 'react'
import { useStore } from '../store'

export default function RewardsStore() {
  const rewards = useStore(s => s.rewards)
  const gems = useStore(s => s.gems)
  const redeemReward = useStore(s => s.redeemReward)
  const [redeemed, setRedeemed] = useState(null)
  const [confirmId, setConfirmId] = useState(null) // P1: confirmation dialog

  const handleRedeem = (reward) => {
    if (gems < reward.cost) return
    redeemReward(reward.id)
    setConfirmId(null)
    setRedeemed(reward.id)
    setTimeout(() => setRedeemed(null), 2000)
  }

  return (
    <div className="px-4 pb-28 pt-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏡</div>
          <h2 className="text-xl font-bold text-gray-700 mb-1">树屋商店</h2>
          <p className="text-sm text-gray-400">
            用能量宝石兑换奖励吧！当前：<span className="text-purple-600 font-bold">{gems}</span> 💎
          </p>
        </div>

        {/* Reward cards */}
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
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mx-auto mb-3"
                  style={{ backgroundColor: reward.color + '40' }}
                >
                  {justRedeemed ? '🎉' : reward.icon}
                </div>

                {/* Name */}
                <h3 className="text-sm font-bold text-gray-700 text-center mb-1">
                  {reward.name}
                </h3>

                {/* Cost */}
                <div className="text-center mb-3">
                  <span className="text-xs font-medium text-purple-500">
                    {reward.cost} 💎
                  </span>
                </div>

                {/* Button */}
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
                      <button
                        onClick={() => setConfirmId(null)}
                        className="flex-1 py-2 rounded-xl text-xs font-medium bg-gray-100 text-gray-500 active:scale-95"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleRedeem(reward)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white active:scale-95"
                      >
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

        {/* Motivation message */}
        <div className="mt-8 bg-white/60 rounded-2xl p-5 text-center">
          <p className="text-2xl mb-2">🌟</p>
          <p className="text-sm text-gray-500">
            每天完成任务就能收集更多宝石哦！<br />
            坚持就有大奖励～
          </p>
        </div>
      </div>
    </div>
  )
}
