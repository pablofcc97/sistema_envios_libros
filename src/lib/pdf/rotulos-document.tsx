import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 16,
    fontFamily: 'Helvetica',
  },
  mitad: {
    height: 380,
    borderBottomWidth: 1,
    borderBottomColor: '#aaa',
    borderBottomStyle: 'dashed',
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  card: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  headerBlock: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#000',
    paddingBottom: 8,
    alignItems: 'center',
  },
  labelHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    paddingVertical: 4,
  },
  mainDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    marginVertical: 6,
  },
  dniBox: { flex: 1, alignItems: 'flex-start' },
  celularBox: { flex: 1, alignItems: 'flex-end' },
  bigDataLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#555',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  bigDataValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  direccionBlock: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  referenciaText: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    color: '#000',
    marginBottom: 6,
  },
  direccion: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    color: '#222',
    lineHeight: 1.2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 8,
    marginTop: 4,
    gap: 10,
  },
  courierBox: { justifyContent: 'flex-end' },
  courierBadge: {
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  contenidoContainer: { flex: 1, alignItems: 'flex-end' },
  contenidoLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  librosInfo: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#222',
    lineHeight: 1.2,
  },
  // Estilo externo para observaciones fuera del cuadro principal
  obsExternaBlock: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  obsExternaText: {
    fontSize: 9,
    color: '#333',
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
  resumenBlock: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 6,
  },
  resumenTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  resumenText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
  },
})

export type ProductoDetalle = {
  nombre: string
  cantidad: number
}

export type Envio = {
  id: string
  cliente: string
  dni: string
  celular: string
  direccion: string
  referencia?: string
  departamento?: string
  observaciones?: string
  courier: string
  libros: string
  productosDetalle?: ProductoDetalle[]
}

function getCourierStyle(courierNombre: string) {
  const nombre = (courierNombre || '').toUpperCase()

  if (nombre.includes('SHALOM')) {
    return { backgroundColor: '#EE2A2F', color: '#FFFFFF' }
  }
  if (nombre.includes('OLVA')) {
    return { backgroundColor: '#F9B52F', color: '#000000' }
  }
  return { backgroundColor: '#000000', color: '#FFFFFF' }
}

function Rotulo({ envio }: { envio: Envio }) {
  const direccionBase = (envio.direccion || '').trim().toUpperCase()
  const depto = (envio.departamento || '').trim().toUpperCase()
  const ref = (envio.referencia || '').trim().toUpperCase()
  const obs = (envio.observaciones || '').trim()

  const direccionConDepto = depto
    ? `${direccionBase || 'AGENCIA SHALOM'} - ${depto}`
    : direccionBase || 'AGENCIA SHALOM'

  const courierStyle = getCourierStyle(envio.courier)

  return (
    <View style={styles.mitad}>
      {/* Cuadro principal del rótulo (lo que va pegado en el paquete) */}
      <View style={styles.card}>
        <View style={styles.headerBlock}>
          <Text style={styles.labelHeader}>Destinatario</Text>
          <Text style={styles.nombre}>{envio.cliente}</Text>
        </View>

        <View style={styles.mainDataRow}>
          <View style={styles.dniBox}>
            <Text style={styles.bigDataLabel}>DNI / RUC</Text>
            <Text style={styles.bigDataValue}>{envio.dni}</Text>
          </View>
          <View style={styles.celularBox}>
            <Text style={styles.bigDataLabel}>Teléfono / Celular</Text>
            <Text style={styles.bigDataValue}>{envio.celular}</Text>
          </View>
        </View>

        <View style={styles.direccionBlock}>
          <Text style={styles.labelHeader}>Destino / Dirección / Agencia</Text>
          {ref ? <Text style={styles.referenciaText}>({ref})</Text> : null}
          <Text style={styles.direccion}>{direccionConDepto}</Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.courierBox}>
            <Text style={[styles.courierBadge, courierStyle]}>
              {envio.courier}
            </Text>
          </View>
          <View style={styles.contenidoContainer}>
            <Text style={styles.contenidoLabel}>Contenido:</Text>
            <Text style={styles.librosInfo}>{envio.libros}</Text>
          </View>
        </View>
      </View>

      {/* Nota/Observación fuera del cuadro del rótulo */}
      {obs ? (
        <View style={styles.obsExternaBlock}>
          <Text style={styles.obsExternaText}>
            <Text style={{ fontWeight: 'bold' }}>Obs. interna:</Text> {obs}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

export function RotulosDocument({ envios }: { envios: Envio[] }) {
  const conteoProductos = new Map<string, number>()
  let totalPaquetes = envios.length

  envios.forEach((e) => {
    e.productosDetalle?.forEach((p) => {
      const actual = conteoProductos.get(p.nombre) || 0
      conteoProductos.set(p.nombre, actual + p.cantidad)
    })
  })

  const resumenTexto = Array.from(conteoProductos.entries())
    .map(([nombre, cant]) => `${nombre} x${cant}`)
    .join('  •  ')

  const paginas: Envio[][] = []
  for (let i = 0; i < envios.length; i += 2) {
    paginas.push(envios.slice(i, i + 2))
  }

  return (
    <Document>
      {paginas.map((par, idx) => {
        const esUltimaPagina = idx === paginas.length - 1

        return (
          <Page key={idx} size="A4" style={styles.page}>
            {par.map((envio) => (
              <Rotulo key={envio.id} envio={envio} />
            ))}

            {esUltimaPagina && resumenTexto && (
              <View style={styles.resumenBlock}>
                <Text style={styles.resumenTitle}>
                  Resumen de Alistamiento ({totalPaquetes} envíos en total):
                </Text>
                <Text style={styles.resumenText}>{resumenTexto}</Text>
              </View>
            )}
          </Page>
        )
      })}
    </Document>
  )
}