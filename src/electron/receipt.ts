import {
  PosPrinter,
  PosPrintData,
  PosPrintOptions,
} from "@plick/electron-pos-printer";

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

const Recibo = async (_printerName: string, datos: DatosRecibo) => {
  const options: PosPrintOptions = {
    preview: true,
    margin: "0 0 0 0",
    copies: 1,
    printerName: _printerName,
    timeOutPerLine: 400,
    pageSize: "58mm",
    boolean: true,
  };

  const data: PosPrintData[] = [
    {
      type: "text",
      value: `Cevichón`,
      style: {
        textAlign: "center",
        fontSize: "20px",
        fontFamily: "Arial",
        fontWeight: "bold",
        marginBlock: "16px",
      },
    },
    {
      type: "text",
      value: `BOLETA ELECTRONICA N° ${datos.boletaNumero}`,
      style: {
        textAlign: "center",
        fontSize: "12px",
        fontFamily: "Arial",
        fontWeight: "bold",
      },
    },
    {
      type: "barCode",
      value: datos.boletaNumero.toString(),
      displayValue: false,
      position: "center",
    },
    {
      type: "text",
      value: `Fecha emitida: ${datos.fecha}`,
      style: {
        textAlign: "center",
        fontSize: "12px",
        fontFamily: "Arial",
        fontWeight: "bold",
      },
    },
    {
      type: "table",
      style: { border: "none", fontFamily: "Arial", marginBlock: "16px" },
      tableHeader: [
        { type: "text", value: "Desc." },
        { type: "text", value: "Cant." },
        { type: "text", value: "Precio" },
        { type: "text", value: "Total" },
      ],
      tableBody:
        datos.productos.map((producto) => [
          { type: "text", value: producto.nombre },
          { type: "text", value: "X" + producto.cantidad },
          { type: "text", value: `$${formatNumber(producto.precio)}` },
          { type: "text", value: `$${formatNumber(producto.total)}` },
        ]) || [],
      tableFooter: [
        [
          { type: "text", value: "Subtotal" },
          { type: "text", value: "" },
          { type: "text", value: "" },
          { type: "text", value: `$${formatNumber(datos.total)}` },
        ],
        [
          { type: "text", value: "Total (+IVA)" },
          { type: "text", value: "" },
          { type: "text", value: "" },
          { type: "text", value: `$${formatNumber(datos.total * 1.19)}` }, // iva 19%
        ],
      ],
      tableHeaderStyle: {
        backgroundColor: "#fff",
        color: "#000",
        fontWeight: "bold",
        border: "none",
        borderBlock: "dashed 1px",
        fontSize: "10px",
      },
      tableBodyStyle: {
        border: "none",
        borderBottom: "dashed 1px",
        fontSize: "10px",
      },
      tableFooterStyle: {
        backgroundColor: "#fff",
        color: "#000",
        fontWeight: "bold",
        borderBottom: "dashed 1px",
        fontSize: "10px",
      },
      tableHeaderCellStyle: {
        padding: "2px 4px",
        textAlign: "left",
      },
      tableBodyCellStyle: {
        padding: "2px 4px",
        textAlign: "left",
      },
      tableFooterCellStyle: {
        padding: "2px 4px",
        textAlign: "left",
      },
    },
    {
      type: "text",
      value: "\n¡Gracias por su compra!",
      style: { textAlign: "center", fontFamily: "Arial", fontSize: "12px" },
    },
  ];

  await PosPrinter.print(data, options)
    .then(console.log)
    .catch((error: string) => {
      console.error(error);
    });
};

export default Recibo;
