"use client"

import type React from "react"
import { useState } from "react"
import { Box, Input, Text, Card, Heading, VStack, HStack, Icon, IconButton } from "@chakra-ui/react"
import { Field } from "@/components/ui/field"
import { Users, Plus, Trash2 } from "lucide-react"
import type { Client } from "@/app/page"

interface ClientManagerProps {
  clients: Client[]
  onAddClient: (name: string) => void
  onDeleteClient: (id: string) => void
}

export function ClientManager({ clients, onAddClient, onDeleteClient }: ClientManagerProps) {
  const [newClientName, setNewClientName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newClientName.trim()) {
      onAddClient(newClientName.trim())
      setNewClientName("")
    }
  }

  return (
    <Card.Root>
      <Card.Header>
        <HStack gap={2}>
          <Icon boxSize={5}>
            <Users />
          </Icon>
          <Heading size="lg">Clientes</Heading>
        </HStack>
      </Card.Header>
      <Card.Body>
        <VStack gap={4} align="stretch">
          <form onSubmit={handleSubmit}>
            <VStack gap={3} align="stretch">
              <Field label="Novo Cliente">
                <HStack gap={2}>
                  <Input
                    placeholder="Nome do cliente"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    flex={1}
                  />
                  <IconButton type="submit" colorPalette="blue">
                    <Plus />
                  </IconButton>
                </HStack>
              </Field>
            </VStack>
          </form>

          <VStack gap={2} align="stretch">
            {clients.length === 0 ? (
              <Box borderRadius="lg" borderWidth="1px" borderStyle="dashed" p={6} textAlign="center">
                <Text fontSize="sm" color="gray.600">
                  Nenhum cliente cadastrado
                </Text>
              </Box>
            ) : (
              clients.map((client) => (
                <HStack key={client.id} justify="space-between" borderRadius="lg" borderWidth="1px" bg="white" p={3}>
                  <Text fontWeight="medium">{client.name}</Text>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteClient(client.id)}
                    color="gray.600"
                    _hover={{ color: "red.500" }}
                  >
                    <Trash2 />
                  </IconButton>
                </HStack>
              ))
            )}
          </VStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}
