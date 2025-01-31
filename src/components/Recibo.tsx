import Printer, {
  BarcodeModes,
  JustifyModes,
  PrinterModes,
} from "esc-pos-printer";

interface ProductoRecibo {
  nombre: string;
  precio: number;
  cantidad: number;
  total: number;
}

interface DatosRecibo {
  fecha: string;
  total: number;
  productos: ProductoRecibo[];
  boletaNumero: number;
}

const LINEA_PUNTEADA = "--------------------------------";
const ESPACIO_DOBLE = "\n\n";
const ESPACIO_SIMPLE = "\n";

export class Item {
  private cantidad: string;
  private descripcion: string;
  private valor: string;

  constructor(
    cantidad: string = "",
    descripcion: string = "",
    valor: string = ""
  ) {
    this.cantidad = cantidad;
    this.descripcion = descripcion;
    this.valor = valor;
  }

  toString(): string {
    const cantidadCols: number = 9;
    const descripcionCols: number = 18;
    const valorCols: number = 0;

    const cantidadStr = this.padString(this.cantidad, cantidadCols);
    const descripcionStr = this.padString(this.descripcion, descripcionCols);
    const valorStr = this.padStringLeft(this.valor, valorCols);

    return `${cantidadStr} ${descripcionStr} ${valorStr}\n`;
  }

  private padString(str: string, width: number, padChar: string = " "): string {
    if (str.length >= width) {
      return str.substring(0, width);
    }
    const padding: string = padChar.repeat(width - str.length);
    return str + padding;
  }

  private padStringLeft(
    str: string,
    width: number,
    padChar: string = " "
  ): string {
    if (str.length >= width) {
      return str.substring(0, width);
    }
    const padding: string = padChar.repeat(width - str.length);
    return padding + str;
  }
}

const formatNumber = (number: number): string => {
  return number.toLocaleString("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const Recibo = async (printerName?: string, datos?: DatosRecibo) => {
  const printer = new Printer(printerName ?? "comerciandoPrinter");

  // Encabezado
  printer.justify(JustifyModes.justifyCenter);
  printer.text(LINEA_PUNTEADA + ESPACIO_SIMPLE);
  printer.justify(JustifyModes.justifyCenter);
  printer.text("RUT: 11.111.111-1" + ESPACIO_SIMPLE);
  printer.justify(JustifyModes.justifyCenter);
  printer.text("BOLETA ELECTRONICA" + ESPACIO_SIMPLE);
  printer.justify(JustifyModes.justifyCenter);
  printer.text(`N° ${datos?.boletaNumero || "N/A"}` + ESPACIO_SIMPLE);
  printer.text(LINEA_PUNTEADA + ESPACIO_SIMPLE);

  // Datos de la empresa
  printer.text("EMPRESA CEVICHÓN" + ESPACIO_SIMPLE);
  printer.text(
    `FECHA EMISION: ${datos?.fecha || new Date().toLocaleDateString()}` +
      ESPACIO_SIMPLE
  );
  printer.text(LINEA_PUNTEADA + ESPACIO_SIMPLE);

  // Encabezado de items
  printer.text("CANTIDAD  DESCRIPCION       VALOR" + ESPACIO_SIMPLE);
  printer.text(LINEA_PUNTEADA + ESPACIO_SIMPLE);

  // Items
  printer.justify(JustifyModes.justifyLeft);
  if (datos?.productos) {
    datos.productos.forEach((producto) => {
      printer.text(
        new Item(
          producto.cantidad.toString(),
          producto.nombre,
          `$${formatNumber(producto.total)}`
        ).toString()
      );
    });
  }

  // Total
  printer.text(LINEA_PUNTEADA + ESPACIO_SIMPLE);
  printer.text(
    new Item("", "TOTAL:", `$${formatNumber(datos?.total || 0)}`).toString()
  );

  // Pie de página
  printer.text(LINEA_PUNTEADA + ESPACIO_DOBLE);
  printer.text("Timbre Electronico SII" + ESPACIO_SIMPLE);
  printer.text(`Res.74 de ${new Date().getFullYear()}` + ESPACIO_SIMPLE);
  printer.text("DTE Generada con Software Cevichón");
  printer.text(ESPACIO_SIMPLE);
  printer.barcode(
    "ID" + datos?.boletaNumero.toString() || "N/A" + "F" + datos?.fecha,
    BarcodeModes.BARCODE_CODE39
  );
  printer.text(ESPACIO_DOBLE);

  printer.cut();
  printer.close();

  await printer.print();
};

export default Recibo;
