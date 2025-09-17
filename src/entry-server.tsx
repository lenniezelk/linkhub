// src/entry-server.tsx
import { StartServer } from '@tanstack/react-start/server'
import { createRouter } from './router'
import dotenv from 'dotenv'

dotenv.config()

export default function () {
    const router = createRouter()
    return <StartServer router={router} />
}
