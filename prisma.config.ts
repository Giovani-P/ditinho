import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { defineConfig } from 'prisma/config'

// Carrega .env.local primeiro (Next.js convention), depois .env
const envLocal = path.resolve(process.cwd(), '.env.local')
const envFile = path.resolve(process.cwd(), '.env')

if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal })
} else if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile })
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'] ?? 'postgresql://dummy:dummy@localhost:5432/dummy',
  },
})
