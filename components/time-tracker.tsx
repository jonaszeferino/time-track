"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Box, Button, Input, Text, Card, Heading, VStack, Icon, Select } from "@chakra-ui/react"
import { Field } from "@/components/ui/field"
import { Play, Square } from "lucide-react"
import type { TimeEntry, Client } from "@/app/page"

interface TimeTrackerProps {
  activeEntry: TimeEntry | null
  onStart: (client: string, description: string) => void
  onStop: () => void
  clients: Client[]
}

export function TimeTracker({ activeEntry, onStart, onStop, clients }: TimeTrackerProps) {
  const [clientId, setClientId] = useState("")
  const [description, setDescription] = useState("")
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (activeEntry) {
      interval = setInterval(() => {
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - activeEntry.startTime.getTime()) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
    } else {
      setElapsedTime(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeEntry])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeEntry) {
      onStop()
    } else if (clientId && description) {
      const selectedClient = clients.find((c) => c.id === clientId)
      if (selectedClient) {
        onStart(selectedClient.name, description)
        setClientId("")
        setDescription("")
      }
    }
  }

  return (
    <Card.Root>
      <Card.Header>
        <Heading size="lg">{activeEntry ? "Timer Ativo" : "Iniciar Nova Tarefa"}</Heading>
      </Card.Header>
      <Card.Body>
        {activeEntry ? (
          <VStack gap={6} align="stretch">
            <Box borderRadius="lg" bg="gray.100" p={6} textAlign="center">
              <Text mb={2} fontSize="sm" fontWeight="medium" color="gray.600">
                Tempo Decorrido
              </Text>
              <Text fontFamily="mono" fontSize="5xl" fontWeight="bold" color="gray.900">
                {formatTime(elapsedTime)}
              </Text>
            </Box>
            <VStack gap={3} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                  Cliente
                </Text>
                <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                  {activeEntry.client}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                  Descrição
                </Text>
                <Text color="gray.900">{activeEntry.description}</Text>
              </Box>
            </VStack>
            <Button onClick={onStop} width="full" size="lg" colorPalette="blue">
              <Icon mr={2} boxSize={5}>
                <Square />
              </Icon>
              Parar Timer
            </Button>
          </VStack>
        ) : (
          <form onSubmit={handleSubmit}>
            <VStack gap={4} align="stretch">
              <Field label="Cliente">
                <Select.Root value={clientId ? [clientId] : []} onValueChange={(e) => setClientId(e.value[0])} required>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Selecione um cliente" />
                  </Select.Trigger>
                  <Select.Content>
                    {clients.length === 0 ? (
                      <Box px={2} py={6} textAlign="center">
                        <Text fontSize="sm" color="gray.600">
                          Nenhum cliente cadastrado
                        </Text>
                      </Box>
                    ) : (
                      clients.map((client) => (
                        <Select.Item key={client.id} item={client.id}>
                          {client.name}
                        </Select.Item>
                      ))
                    )}
                  </Select.Content>
                </Select.Root>
              </Field>
              <Field label="Descrição da Tarefa">
                <Input
                  placeholder="O que você está fazendo?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Field>
              <Button type="submit" width="full" size="lg" colorPalette="blue" disabled={clients.length === 0}>
                <Icon mr={2} boxSize={5}>
                  <Play />
                </Icon>
                Iniciar Timer
              </Button>
            </VStack>
          </form>
        )}
      </Card.Body>
    </Card.Root>
  )
}
