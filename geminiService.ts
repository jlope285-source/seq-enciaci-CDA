
// @google/genai guidelines followed: Use GoogleGenAI, Type, and direct .text property.
import { GoogleGenAI, Type } from "@google/genai";
import { SelectionState, CDASequencing } from "./types";
import { CDA_DATA, COMPETENCES } from "./constants";

const KITS_COMPONENTS = {
  'Maleta audiovisual': "Kit complet de croma i il·luminació (softboxes, paraigües, teles), Cercle de llum LED, Micròfons (taula XLR, lavalier simple i doble sense fil, sense fil de mà), Taula de so USB de 12 canals, Amplificador d'auriculars, Gravadora d'àudio digital portàtil, Càmera de vídeo 4K, Càmera d'acció 4K, Caixa d'estudi fotogràfic, Trípodes i Estabilitzador de mà (Gimbal).",
  'conjunt de sensors i actuadors primària amb reptes': "Placa d'extensió micro:shield, Sensor d'humitat del terra, Pantalla OLED, Sensor de col·lisió o fi de cursa, Sensor infraroig (x3), Sensor PIR, Sensor de distància per ultrasons, Tira de 30 leds (1m), Motor amb roda (x2), Servomotor (x2).",
  'conjunt de sensors i actuadors secundària bàsic': "Sensor de llum, Sensor d'humitat del terra, Sensor de temperatura, Pantalla OLED, Sensor de col·lisi o fi de cursa, Sensor infraroig (x3), Sensor PIR, Sensor de distància per ultrasons, Tira de 30 LEDs (1m), Motor amb roda (x2), Servomotor (x2).",
  'conjunt de sensors i actuadors secundària avançat': "Sensor de so/micròfon, Giroscopi i acceleròmetre, Sensor CO2, Sensor d'humitat i temperatura, Sensor pressió baromètrica, LED blanc, LED groc, LED verd, LED vermell, LED RGB, Brunzidor, Relé, Bomba d'aigua, Receptor IR i comandament, Emissor IR, Polsador.",
  'Màquines maker': "Impressora 3D, Talladora làser, Màquina de tall de vinil, Brodadora."
};

// Generate a CDA Sequencing using Gemini 3.1 Pro
export const generateCDASequencing = async (state: SelectionState): Promise<CDASequencing> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cycleData = CDA_DATA[state.cycle];
  
  const toolsInfo: string[] = [];
  if (state.devices && state.devices.length > 0) {
    toolsInfo.push(`Dispositius: ${state.devices.join(', ')}.`);
  }
  if (state.robots && state.robots.length > 0) {
    toolsInfo.push(`Categories d'eines: ${state.robots.join(', ')}.`);
    Object.entries(state.kitElements || {}).forEach(([kitName, elements]) => {
      if (elements.length > 0) {
        toolsInfo.push(`Elements de "${kitName}": ${elements.join(', ')}.`);
      }
    });
  }

  const topicsInfo = Object.entries(state.topics || {})
    .map(([id, topic]) => `Criteri ${id}: Tema "${topic}"`)
    .join("\n");

  const prompt = `
    ACTUA COM UN COORDINADOR PEDAGÒGIC EXPERT EN COMPETÈNCIA DIGITAL DE L'ALUMNAT (CDA).
    Genera una "Seqüenciació de la CDA" per al cicle ${state.cycle} en CATALÀ.
    
    EINES DISPONIBLES AL CENTRE:
    ${toolsInfo.join("\n")}

    TEMES PROPOSATS PER L'USUARI PER A CADA CRITERI:
    ${topicsInfo || "L'usuari no ha indicat temes específics. Genera tu propostes de temes, reptes o centres d'interès que siguin coherents amb el currículum d'educació primària de Catalunya (LOMLOE) per a cada criteri."}

    OBJECTIU:
    Crear una proposta de seqüenciació que cobreixi TOTS els criteris d'avaluació i sabers de la CDA per a aquest cicle, utilitzant les eines seleccionades i respectant els temes indicats (o proposant-ne de nous basats en el currículum català).
    
    CRITERIS I SABERS A TREBALLAR (Cicle ${state.cycle}):
    ${cycleData.criteria.map(c => `- Criteri ${c.id}: ${c.description}`).join("\n")}
    ${cycleData.sabers.map(s => `- Saber ${s.id}: ${s.description}`).join("\n")}

    REQUISITS:
    1. Genera una entrada per a CADA criteri d'avaluació del cicle. No en deixis cap fora.
    2. Relaciona cada criteri amb el saber més adient (o el que s'indica a la llista).
    3. Totes les eines i dispositius seleccionats han de ser utilitzats almenys una vegada al llarg de la seqüenciació. Distribueix-los de manera equilibrada entre les diferents activitats.
    4. Si l'usuari ha indicat un "Tema" per a un criteri, l'activitat ha de girar al voltant d'aquest tema. Si no, proposa una activitat basada en un tema, projecte o centre d'interès propi del currículum de primària de Catalunya (per exemple: el medi natural, la història local, reptes de sostenibilitat, expressió artística, etc.).
    5. Sigues específic en com s'utilitza l'eina.
    6. Utilitza llenguatge inclusiu i no sexista.

    FORMAT DE SORTIDA: JSON PUR segons l'esquema.
  `;

  const maxRetries = 3;
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              titol: { type: Type.STRING },
              cicle: { type: Type.STRING },
              einesSeleccionades: { type: Type.ARRAY, items: { type: Type.STRING } },
              sequenciacio: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    criteriId: { type: Type.STRING },
                    criteriDescripcio: { type: Type.STRING },
                    saberId: { type: Type.STRING },
                    saberDescripcio: { type: Type.STRING },
                    propostaActivitat: { type: Type.STRING },
                    einesUtilitzades: { type: Type.ARRAY, items: { type: Type.STRING } },
                    producteFinal: { type: Type.STRING }
                  },
                  required: ["criteriId", "criteriDescripcio", "saberId", "saberDescripcio", "propostaActivitat", "einesUtilitzades", "producteFinal"]
                }
              },
              recomanacionsGlobals: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["titol", "cicle", "einesSeleccionades", "sequenciacio", "recomanacionsGlobals"]
          }
        }
      });

      const jsonText = response.text;
      if (!jsonText) throw new Error("No text content returned from API.");
      return JSON.parse(jsonText.trim()) as CDASequencing;
    } catch (error: any) {
      lastError = error;
      if ((error.status === 'UNAVAILABLE' || error.code === 503 || error.code === 429) && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 3000 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};
