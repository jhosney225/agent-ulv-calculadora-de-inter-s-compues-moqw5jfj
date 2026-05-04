
```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Herramientas para la calculadora de interés compuesto
const tools = [
  {
    name: "calcular_interes_compuesto",
    description:
      "Calcula el monto final de una inversión con interés compuesto",
    input_schema: {
      type: "object",
      properties: {
        capital_inicial: {
          type: "number",
          description: "El capital inicial invertido",
        },
        tasa_anual: {
          type: "number",
          description: "La tasa de interés anual en porcentaje (ej: 5 para 5%)",
        },
        anos: {
          type: "number",
          description: "Número de años de inversión",
        },
        frecuencia_capitalizacion: {
          type: "string",
          enum: ["anual", "semestral", "trimestral", "mensual", "diaria"],
          description: "Frecuencia de capitalización del interés",
        },
      },
      required: [
        "capital_inicial",
        "tasa_anual",
        "anos",
        "frecuencia_capitalizacion",
      ],
    },
  },
  {
    name: "comparar_inversiones",
    description: "Compara múltiples opciones de inversión",
    input_schema: {
      type: "object",
      properties: {
        inversiones: {
          type: "array",
          description: "Lista de inversiones a comparar",
          items: {
            type: "object",
            properties: {
              nombre: {
                type: "string",
                description: "Nombre de la opción de inversión",
              },
              capital_inicial: {
                type: "number",
                description: "Capital inicial",
              },
              tasa_anual: {
                type: "number",
                description: "Tasa de interés anual",
              },
              anos: {
                type: "number",
                description: "Número de años",
              },
              frecuencia_capitalizacion: {
                type: "string",
                enum: ["anual", "semestral", "trimestral", "mensual", "diaria"],
              },
            },
            required: [
              "nombre",
              "capital_inicial",
              "tasa_anual",
              "anos",
              "frecuencia_capitalizacion",
            ],
          },
        },
      },
      required: ["inversiones"],
    },
  },
  {
    name: "calcular_aporte_regular",
    description:
      "Calcula el monto final con aportes regulares (anualidades)",
    input_schema: {
      type: "object",
      properties: {
        capital_inicial: {
          type: "number",
          description: "Capital inicial",
        },
        aporte_regular: {
          type: "number",
          description: "Monto del aporte regular periódico",
        },
        tasa_anual: {
          type: "number",
          description: "Tasa de interés anual en porcentaje",
        },
        anos: {
          type: "number",
          description: "Número de años",
        },
        periodo_aporte: {
          type: "string",
          enum: ["mensual", "trimestral", "semestral", "anual"],
          description: "Período de los aportes regulares",
        },
      },
      required: [
        "capital_inicial",
        "aporte_regular",
        "tasa_anual",
        "anos",
        "periodo_aporte",
      ],
    },
  },
];

function obtenerPeriodosCapitalizacion(frecuencia) {
  const periodos = {
    anual: 1,
    semestral: 2,
    trimestral: 4,
    mensual: 12,
    diaria: 365,
  };
  return periodos[frecuencia] || 1;
}

function calcularInteresCompuesto(
  capitalInicial,
  tasaAnual,
  anos,
  frecuenciaCapitalizacion
) {
  const n = obtenerPeriodosCapitalizacion(frecuenciaCapitalizacion);
  const r = tasaAnual / 100;
  const monto = capitalInicial * Math.pow(1 + r / n, n * anos);
  const interes = monto - capitalInicial;
  return {
    monto_final: Math.round(monto * 100) / 100,
    interes_ganado: Math.round(interes * 100) / 100,
    capital_inicial: capitalInicial,
    tasa_anual: tasaAnual,
    anos: anos,
    frecuencia_capitalizacion: frecuenciaCapitalizacion,
  };
}

function calcularAporteRegular(
  capitalInicial,
  aporteRegular,
  tasaAnual,
  anos,
  periodoAporte
) {
  const periodosAnuales = {
    mensual: 12,
    trimestral: 4,
    semestral: 2,
    anual: 1,
  };

  const m = periodosAnuales[periodoAporte];
  const r = tasaAnual / 100;
  const tasaPeriodica = r / m;
  const totalPeriodos = anos * m;

  // Monto del capital inicial con capitalización
  let montoCapitalInicial = capitalInicial;
  if (capitalInicial > 0) {