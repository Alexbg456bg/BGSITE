import { createServer } from 'vite'

const server = await createServer({
  configLoader: 'native',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
})

await server.listen()
server.printUrls()

setInterval(() => {
  // Keep the detached Windows process alive even without an attached terminal.
}, 60_000)
