import React from 'react'
import { Bot, Volume2, Radio } from 'lucide-react'
import Card from '@/renderer/components/common/Card'
import { LiveCanvas } from '@/renderer/components/canvas/LiveCanvas'
import StreamPanel from '@/renderer/components/stream/StreamPanel'
import ChatPanel from '@/renderer/components/ai/ChatPanel'
import { useStreamStore } from '@/renderer/store/useStreamStore'
import { useAIStore } from '@/renderer/store/useAIStore'
import { useTTSStore } from '@/renderer/store/useTTSStore'

/* ------------------------------------------------------------------ */
/*  Status Card                                                         */
/* ------------------------------------------------------------------ */

const StatusCard: React.FC<{
  title: string
  icon: React.ReactNode
  status: string
  active: boolean
  colorClass: string
}> = ({ title, icon, status, active, colorClass }) => {
  return (
    <Card className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          active ? colorClass : 'bg-slate-700'
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{title}</p>
        <p
          className={`text-sm font-medium truncate ${
            active ? 'text-slate-200' : 'text-slate-500'
          }`}
        >
          {status}
        </p>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Dashboard Page                                                      */
/* ------------------------------------------------------------------ */

const Dashboard: React.FC = () => {
  const { status: streamStatus } = useStreamStore()
  const { isGenerating } = useAIStore()
  const { currentState: ttsState } = useTTSStore()

  const isStreaming = streamStatus.state === 'streaming'

  return (
    <div className="space-y-6">
      {/* Status overview */}
      <div className="grid grid-cols-3 gap-4">
        <StatusCard
          title="AI 状态"
          icon={<Bot className="w-5 h-5 text-indigo-400" />}
          status={isGenerating ? '生成中...' : '就绪'}
          active={true}
          colorClass="bg-indigo-500/20"
        />
        <StatusCard
          title="TTS 状态"
          icon={<Volume2 className="w-5 h-5 text-pink-400" />}
          status={ttsState === 'speaking' ? '播报中' : ttsState === 'queued' ? '队列中' : '就绪'}
          active={ttsState !== 'idle'}
          colorClass="bg-pink-500/20"
        />
        <StatusCard
          title="推流状态"
          icon={<Radio className="w-5 h-5 text-green-400" />}
          status={
            streamStatus.state === 'streaming'
              ? '直播中'
              : streamStatus.state === 'connecting'
              ? '连接中...'
              : streamStatus.state === 'error'
              ? '错误'
              : '未开始'
          }
          active={isStreaming}
          colorClass="bg-green-500/20"
        />
      </div>

      {/* Main area: preview + control panels */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Live canvas preview */}
        <div className="col-span-2 space-y-4">
          <LiveCanvas
            scene={{
              id: 'default',
              name: '默认场景',
              background: {
                type: 'gradient',
                value: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              },
              subtitle: {
                enabled: true,
                position: 'bottom',
                fontSize: 24,
                fontColor: '#ffffff',
                bgColor: '#000000',
                bgOpacity: 0.6,
              },
              overlays: [],
            }}
            subtitle="欢迎使用视频号AI直播助手！配置好参数后点击开始直播即可启动无人值守AI直播。"
            isStreaming={isStreaming}
            viewerCount={0}
            recentComments={[]}
          />
        </div>

        {/* Right: Control panels */}
        <div className="col-span-1 space-y-4">
          <StreamPanel />
          <ChatPanel />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
