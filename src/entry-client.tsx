// src/entry-client.tsx
import { StartClient } from '@tanstack/react-start/client'
import { createRouter } from './router'

const router = createRouter()

StartClient({ router })
