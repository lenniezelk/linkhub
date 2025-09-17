// src/entry-client.tsx
import { StartClient } from '@tanstack/react-start/client'
import { createRouter } from './router'
import dotenv from 'dotenv'

dotenv.config()

const router = createRouter()

StartClient({ router })
