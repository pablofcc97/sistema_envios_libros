import { prisma } from '../src/lib/prisma'

async function main() {
  const envios = await prisma.envio.findMany()
  console.log(envios)
}

main()