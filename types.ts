export enum EducationalCycle {
  INICIAL = 'Cicle Inicial',
  MITJA = 'Cicle Mitjà',
  SUPERIOR = 'Cicle Superior',
  ESO_1 = '1r Cicle ESO (1r i 2n)',
  ESO_2 = '2n Cicle ESO (3r i 4t)'
}

export type ClassGroup = 'A' | 'B' | 'C';

export interface StudentEvaluation {
  id: string;
  name: string;
  scores: Record<string, string>; // Record<criteriaId, scoreLevel>
}

export interface CDASaber {
  id: string;
  competenceId: string; // "C1", "C2", etc.
  category: string;
  description: string;
}

export interface CDACriteria {
  id: string;
  competenceId: string; // "C1", "C2", etc.
  description: string;
}

export interface CDACompetence {
  id: string;
  title: string;
  description: string;
}

export interface SelectionState {
  title: string;
  cycle: EducationalCycle;
  sessions: number;
  sessionDuration: number;
  birthYear: number;
  classGroup: ClassGroup;
  robots?: string[];
  devices?: string[];
  kitElements?: Record<string, string[]>;
  topics?: Record<string, string>; // Key: criteriId, Value: user topic
  selectedCompetenceIds: string[];
  selectedCriteriaIds: string[];
  selectedSaberIds: string[];
}

export interface CDASequencingItem {
  criteriId: string;
  criteriDescripcio: string;
  saberId: string;
  saberDescripcio: string;
  propostaActivitat: string;
  einesUtilitzades: string[];
  producteFinal: string;
}

export interface CDASequencing {
  titol: string;
  cicle: string;
  einesSeleccionades: string[];
  sequenciacio: CDASequencingItem[];
  recomanacionsGlobals: string[];
}

export interface ProgramacioDetallada {
  pistesAlumnat: string;
  solucioDocent: string;
  blocsPrincipals: { categoria: string; nom: string }[];
}

export interface ActivitatDetallada {
  sessio: number;
  titol: string;
  descripcio: string;
  pasAPas: string[];
  eines: string[];
  producte: string;
  programacio?: ProgramacioDetallada; // Opcional, només per activitats CD5
}

export interface LearningSituation {
  titol: string;
  curs?: string;
  area?: string;
  descripcioContext: string;
  descripcioRepte: string;
  extensions: string[];
  materialsGlobals: string[];
  competenciesEspecificas?: string[];
  objectius?: {
    capacitat: string;
    saber: string;
    finalitat: string;
  }[];
  criterisAvaluacio: {
    id: string;
    accio: string;
    saber: string;
    context: string;
  }[];
  sabers?: string[];
  desenvolupament?: {
    estrategies: string;
    agrupaments: string;
    materials: string;
  };
  activitats: {
    inicials: ActivitatDetallada[];
    desenvolupament: ActivitatDetallada[];
    sintesi: ActivitatDetallada[];
    transferencia: ActivitatDetallada[];
  };
  dua?: {
    motivacio: string[];
    representacio: string[];
    accioExpressio: string[];
  };
  vectors?: string[];
}