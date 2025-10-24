"use client"

import { useState, useEffect } from "react"
import { Box, Container, Heading, Text, HStack, Icon, Grid, GridItem } from "@chakra-ui/react"
import { TimeTracker } from "@/components/time-tracker"
import { TimeEntryList } from "@/components/time-entry-list"
import { TimeStats } from "@/components/time-stats"
import { ClientManager } from "@/components/client-manager"
import { Clock } from "lucide-react"

export interface TimeEntry {
  id: string
  client: string
  description: string
  startTime: Date
  endTime?: Date
  duration: number
}

export interface Client {
  id: string
  name: string
}

export default function Home() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
  const [clients, setClients] = useState<Client[]>([])

  // Carregar entradas do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("timeEntries")
    if (saved) {
      const parsed = JSON.parse(saved)
      setEntries(
        parsed.map((e: TimeEntry) => ({
          ...e,
          startTime: new Date(e.startTime),
          endTime: e.endTime ? new Date(e.endTime) : undefined,
        })),
      )
    }

    const savedActive = localStorage.getItem("activeEntry")
    if (savedActive) {
      const parsed = JSON.parse(savedActive)
      setActiveEntry({
        ...parsed,
        startTime: new Date(parsed.startTime),
      })
    }

    const savedClients = localStorage.getItem("clients")
    if (savedClients) {
      setClients(JSON.parse(savedClients))
    }
  }, [])

  // Salvar entradas no localStorage
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem("timeEntries", JSON.stringify(entries))
    }
  }, [entries])

  useEffect(() => {
    if (activeEntry) {
      localStorage.setItem("activeEntry", JSON.stringify(activeEntry))
    } else {
      localStorage.removeItem("activeEntry")
    }
  }, [activeEntry])

  useEffect(() => {
    localStorage.setItem("clients", JSON.stringify(clients))
  }, [clients])

  const handleStart = (client: string, description: string) => {
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      client,
      description,
      startTime: new Date(),
      duration: 0,
    }
    setActiveEntry(newEntry)
  }

  const handleStop = () => {
    if (activeEntry) {
      const endTime = new Date()
      const duration = Math.floor((endTime.getTime() - activeEntry.startTime.getTime()) / 1000)
      const completedEntry = {
        ...activeEntry,
        endTime,
        duration,
      }
      setEntries([completedEntry, ...entries])
      setActiveEntry(null)
    }
  }

  const handleDelete = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id))
  }

  const handleAddClient = (name: string) => {
    const newClient: Client = {
      id: Date.now().toString(),
      name,
    }
    setClients([...clients, newClient])
  }

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter((c) => c.id !== id))
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <HStack gap={3}>
            <Box
              w={12}
              h={12}
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="xl"
              bg="blue.500"
            >
              <Icon color="white" boxSize={6}>
                <Clock />
              </Icon>
            </Box>
            <Box>
              <Heading size="2xl" fontWeight="bold" color="gray.900">
                Time Tracker
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Registre suas horas trabalhadas
              </Text>
            </Box>
          </HStack>
        </Box>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
          <GridItem display="flex" flexDirection="column" gap={6}>
            <TimeTracker activeEntry={activeEntry} onStart={handleStart} onStop={handleStop} clients={clients} />
            <TimeEntryList entries={entries} onDelete={handleDelete} />
          </GridItem>
          <GridItem display="flex" flexDirection="column" gap={6}>
            <ClientManager clients={clients} onAddClient={handleAddClient} onDeleteClient={handleDeleteClient} />
            <TimeStats entries={entries} activeEntry={activeEntry} />
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
}
