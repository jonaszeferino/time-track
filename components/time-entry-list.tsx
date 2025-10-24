"use client"

import { Text, Card, Heading, VStack, HStack, Icon, IconButton } from "@chakra-ui/react"
import { Trash2, Clock } from "lucide-react"
import type { TimeEntry } from "@/app/page"

interface TimeEntryListProps {
  entries: TimeEntry[]
  onDelete: (id: string) => void
}

export function TimeEntryList({ entries, onDelete }: TimeEntryListProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (entries.length === 0) {
    return (
      <Card.Root>
        <Card.Header>
          <Heading size="lg">Histórico de Entradas</Heading>
        </Card.Header>
        <Card.Body>
          <VStack py={12} textAlign="center">
            <Icon boxSize={12} color="gray.400" mb={4}>
              <Clock />
            </Icon>
            <Text color="gray.600">Nenhuma entrada registrada ainda</Text>
            <Text fontSize="sm" color="gray.600">
              Inicie um timer para começar
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    )
  }

  return (
    <Card.Root>
      <Card.Header>
        <Heading size="lg">Histórico de Entradas</Heading>
      </Card.Header>
      <Card.Body>
        <VStack gap={3} align="stretch">
          {entries.map((entry) => (
            <HStack
              key={entry.id}
              justify="space-between"
              align="flex-start"
              gap={4}
              borderRadius="lg"
              borderWidth="1px"
              bg="white"
              p={4}
              _hover={{ bg: "gray.50" }}
              transition="background 0.2s"
            >
              <VStack flex={1} align="stretch" gap={1}>
                <HStack gap={2}>
                  <Text fontWeight="semibold" color="gray.900">
                    {entry.client}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    •
                  </Text>
                  <Text fontFamily="mono" fontSize="sm" fontWeight="medium" color="blue.500">
                    {formatDuration(entry.duration)}
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  {entry.description}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  {formatDate(entry.startTime)}
                </Text>
              </VStack>
              <IconButton
                variant="ghost"
                size="sm"
                onClick={() => onDelete(entry.id)}
                color="gray.600"
                _hover={{ color: "red.500" }}
              >
                <Trash2 />
              </IconButton>
            </HStack>
          ))}
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}
