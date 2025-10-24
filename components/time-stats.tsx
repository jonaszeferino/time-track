"use client"

import { useEffect, useState } from "react"
import { Box, Text, Card, Heading, VStack, HStack, Icon } from "@chakra-ui/react"
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

  return (
    <VStack gap={6} align="stretch">
      <Card.Root>
        <Card.Header>
          <HStack gap={2}>
            <Icon boxSize={5}>
              <Calendar />
            </Icon>
            <Heading size="lg">Tempo Hoje</Heading>
          </HStack>
        </Card.Header>
        <Card.Body>
          <Text fontSize="3xl" fontWeight="bold" color="gray.900">
            {formatDuration(getTodayTotal())}
          </Text>
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <HStack gap={2}>
            <Icon boxSize={5}>
              <TrendingUp />
            </Icon>
            <Heading size="lg">Tempo Semanal</Heading>
          </HStack>
        </Card.Header>
        <Card.Body>
          <Text fontSize="3xl" fontWeight="bold" color="gray.900">
            {formatDuration(getWeekTotal())}
          </Text>
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Heading size="lg">Top Clientes</Heading>
        </Card.Header>
        <Card.Body>
          <VStack gap={3} align="stretch">
            {getClientStats().length === 0 ? (
              <Text fontSize="sm" color="gray.600">
                Nenhum dado ainda
              </Text>
            ) : (
              getClientStats().map(([client, duration]) => (
                <VStack key={client} gap={1} align="stretch">
                  <HStack justify="space-between" fontSize="sm">
                    <Text fontWeight="medium" color="gray.900">
                      {client}
                    </Text>
                    <Text fontFamily="mono" color="blue.500">
                      {formatDuration(duration)}
                    </Text>
                  </HStack>
                  <Box h={2} w="full" overflow="hidden" borderRadius="full" bg="gray.200">
                    <Box
                      h="full"
                      bg="blue.500"
                      transition="width 0.3s"
                      style={{
                        width: `${(duration / getWeekTotal()) * 100}%`,
                      }}
                    />
                  </Box>
                </VStack>
              ))
            )}
          </VStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  )
}
