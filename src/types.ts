export type GuestType = 'agraciado' | 'indicante';

export type ScreenMode = 'select' | 'checkin' | 'painel' | 'admin';

export interface AgraciadoRecord {
  id: string;
  name: string;
  indicanteName: string;
  indicanteRole: string;
  indicantePartyState: string;
  isInMemoriam?: boolean;
  isInstitution?: boolean;
  checkedIn: boolean;
  checkedInAt: string | null;
  posto: string | null;
  representativeName: string;
  notes: string;
  isExtra: boolean;
}

export interface IndicanteRecord {
  id: string;
  name: string;
  role: string;
  partyState: string;
  category: 'Mesa Diretora' | 'Liderança';
  agraciadoNames: string[];
  checkedIn: boolean;
  checkedInAt: string | null;
  posto: string | null;
  representativeName: string;
  notes: string;
  isExtra: boolean;
}

export interface CheckinLogEntry {
  id: string;
  guestId: string;
  guestType: GuestType;
  name: string;
  subtitle: string;
  posto: string;
  checkedInAt: string;
  isExtra: boolean;
  representativeName: string;
}

export interface EventMeta {
  title: string;
  subtitle: string;
  date: string;
  timeRange: string;
  location: string;
  supervision: string;
  organ: string;
}

export interface CredenciamentoState {
  event: EventMeta;
  agraciados: AgraciadoRecord[];
  indicantes: IndicanteRecord[];
  logs: CheckinLogEntry[];
  postos: string[];
  spreadsheetPath: string;
  lastUpdated: string;
}
