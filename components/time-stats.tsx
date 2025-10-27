"use client"

import { useEffect, useState } from "react"
import type { TimeEntry } from "@/app/page"
import { Calendar, TrendingUp } from "lucide-react"

interface TimeStatsProps {
  entries: TimeEntry[]
  activeEntry: TimeEntry | null
}

export function TimeStats({ entries, activeEntry }: TimeStatsProps) {
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const getTodayTotal = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let total = entries
      .filter((e) => {
        const entryDate = new Date(e.startTime)
        entryDate.setHours(0, 0, 0, 0)
        return entryDate.getTime() === today.getTime()
      })
      .reduce((sum, e) => sum + e.duration, 0)

    if (activeEntry) {
      const activeDate = new Date(activeEntry.startTime)
      activeDate.setHours(0, 0, 0, 0)
      if (activeDate.getTime() === today.getTime()) {
        total += Math.floor((currentTime - activeEntry.startTime.getTime()) / 1000)
      }
    }

    return total
  }

  const getWeekTotal = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    monday.setHours(0, 0, 0, 0)

    let total = entries.filter((e) => new Date(e.startTime) >= monday).reduce((sum, e) => sum + e.duration, 0)

    if (activeEntry && new Date(activeEntry.startTime) >= monday) {
      total += Math.floor((currentTime - activeEntry.startTime.getTime()) / 1000)
    }

    return total
  }

  const getClientStats = () => {
    const clientMap = new Map<string, number>()

    entries.forEach((e) => {
      const current = clientMap.get(e.client) || 0
      clientMap.set(e.client, current + e.duration)
    })

    if (activeEntry) {
      const current = clientMap.get(activeEntry.client) || 0
      const activeDuration = Math.floor((currentTime - activeEntry.startTime.getTime()) / 1000)
      clientMap.set(activeEntry.client, current + activeDuration)
    }

    return Array.from(clientMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }

  const weekTotal = getWeekTotal()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Tempo Hoje</h2>
          </div>
        </div>
        <div className="p-6">
          <p className="text-3xl font-bold text-gray-900">
            {formatDuration(getTodayTotal())}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Tempo Semanal</h2>
          </div>
        </div>
        <div className="p-6">
          <p className="text-3xl font-bold text-gray-900">
            {formatDuration(weekTotal)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Top Clientes</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {getClientStats().length === 0 ? (
              <p className="text-sm text-gray-600">
                Nenhum dado ainda
              </p>
            ) : (
              getClientStats().map(([client, duration]) => (
                <div key={client} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <p className="font-medium text-gray-900">
                      {client}
                    </p>
                    <p className="font-mono text-blue-500">
                      {formatDuration(duration)}
                    </p>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{
                        width: `${weekTotal > 0 ? (duration / weekTotal) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
