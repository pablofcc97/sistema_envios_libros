import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 24 },
  mitad: {
    height: 380,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderBottomStyle: 'dashed',
    paddingHorizontal: 20,
  },
  nombre: { fontSize: 16, fontWeight: 'bold', marginBottom: 14, textAlign: 'center', textTransform: 'uppercase' },
  dni: { fontSize: 26, fontWeight: 'bold', marginBottom: 14 },
  agencia: { fontSize: 12, marginBottom: 18, textAlign: 'center', textTransform: 'uppercase' },
  cel: { fontSize: 22, fontWeight: 'bold', marginBottom: 18 },
  libros: { fontSize: 9, textAlign: 'right', width: '100%', paddingRight: 10 },
  courier: { fontSize: 10, fontWeight: 'bold', textAlign: 'right', width: '100%', paddingRight: 10, textTransform: 'uppercase' },
})

type Envio = {
  id: string
  cliente: string
  dni: string
  celular: string
  agencia: string
  courier: string
  libros: string
}

function Rotulo({ envio }: { envio: Envio }) {
  return (
    <View style={styles.mitad}>
      <Text style={styles.nombre}>{envio.cliente}</Text>
      <Text style={styles.dni}>DNI: {envio.dni}</Text>
      <Text style={styles.agencia}>{envio.agencia}</Text>
      <Text style={styles.cel}>CEL: {envio.celular}</Text>
      <Text style={styles.courier}>{envio.courier}</Text>
      <Text style={styles.libros}>{envio.libros}</Text>
    </View>
  )
}

export function RotulosDocument({ envios }: { envios: Envio[] }) {
  const paginas: Envio[][] = []
  for (let i = 0; i < envios.length; i += 2) {
    paginas.push(envios.slice(i, i + 2))
  }

  return (
    <Document>
      {paginas.map((par, idx) => (
        <Page key={idx} size="A4" style={styles.page}>
          {par.map((envio) => (
            <Rotulo key={envio.id} envio={envio} />
          ))}
        </Page>
      ))}
    </Document>
  )
}