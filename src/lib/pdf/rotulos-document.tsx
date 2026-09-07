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
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  card: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
    padding: 12,
    height: '100%',
    justifyContent: 'space-between',
  },
  headerBlock: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#000',
    paddingBottom: 6,
    alignItems: 'center',
  },
  labelHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  mainDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginVertical: 4,
  },
  dniBox: { flex: 1, alignItems: 'flex-start' },
  celularBox: { flex: 1, alignItems: 'flex-end' },
  bigDataLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#555',
    textTransform: 'uppercase',
  },
  bigDataValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  direccionBlock: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  direccion: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    color: '#111',
    lineHeight: 1.2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 6,
    marginTop: 2,
    gap: 10,
  },
  courierBox: { justifyContent: 'flex-end' },
  courierBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    backgroundColor: '#000',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
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
  // Bloque para el Resumen Consolidado de Libros
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
  departamento?: string
  courier: string
  libros: string
  productosDetalle?: ProductoDetalle[]
}

function Rotulo({ envio }: { envio: Envio }) {
  const direccionBase = (envio.direccion || 'AGENCIA SHALOM').trim().toUpperCase()
  const depto = (envio.departamento || '').trim().toUpperCase()

  const direccionCompleta =
    depto && !direccionBase.includes(depto)
      ? `${direccionBase} - ${depto}`
      : direccionBase

  return (
    <View style={styles.mitad}>
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
          <Text style={styles.direccion}>{direccionCompleta}</Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.courierBox}>
            <Text style={styles.courierBadge}>{envio.courier}</Text>
          </View>
          <View style={styles.contenidoContainer}>
            <Text style={styles.contenidoLabel}>Contenido:</Text>
            <Text style={styles.librosInfo}>{envio.libros}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export function RotulosDocument({ envios }: { envios: Envio[] }) {
  // 1. Calcular el total acumulado de todos los productos en la orden de impresión
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

  // 2. Dividir en páginas de a 2 rótulos por hoja
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

            {/* Solo renderiza la barra de resumen en la parte inferior de la ÚLTIMA página */}
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