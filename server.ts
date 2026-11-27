import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { buildInitialState, DEFAULT_POSTOS, EVENT_META } from './src/data/seedData.ts';
import type {
  AgraciadoRecord,
  CheckinLogEntry,
  CredenciamentoState,
  GuestType,
  IndicanteRecord,
} from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'credenciamento.json');
const SPREADSHEET_FILE = path.join(DATA_DIR, 'planilha_credenciados_2026.csv');
const SPREADSHEET_REL_PATH = 'data/planilha_credenciados_2026.csv';

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function escapeCsvCell(value: string): string {
  const cleaned = (value ?? '').replace(/\r?\n/g, ' ').trim();
  if (cleaned.includes(';') || cleaned.includes('"') || cleaned.includes(',')) {
    return `"${cleaned.replace(/"/g, '""')}"`;
  }
  return cleaned;
}

function formatBrDateTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function generateCsvContent(
  state: CredenciamentoState,
  scope: 'presentes' | 'todos' = 'presentes',
  typeFilter: 'agraciados' | 'indicantes' | 'todos' = 'todos'
): string {
  const headers = [
    'Público',
    'Nome Completo',
    'Indicante / Cargo',
    'Partido / UF ou Agraciados Indicados',
    'Status Check-in',
    'Data e Horário Check-in',
    'Posto',
    'Representante / Acompanhante',
    'Inclusão no Local (Extra)',
    'Observações',
  ];

  const rows: string[][] = [];

  if (typeFilter === 'todos' || typeFilter === 'agraciados') {
    const list =
      scope === 'presentes'
        ? state.agraciados.filter((g) => g.checkedIn)
        : state.agraciados;

    for (const g of list) {
      rows.push([
        'Agraciado',
        g.name,
        `${g.indicanteName}${g.indicanteRole ? ` (${g.indicanteRole})` : ''}`,
        g.indicantePartyState,
        g.checkedIn ? 'Credenciado' : 'Pendente',
        formatBrDateTime(g.checkedInAt),
        g.posto ?? '',
        g.representativeName,
        g.isExtra ? 'Sim' : 'Não',
        g.notes,
      ]);
    }
  }

  if (typeFilter === 'todos' || typeFilter === 'indicantes') {
    const list =
      scope === 'presentes'
        ? state.indicantes.filter((i) => i.checkedIn)
        : state.indicantes;

    for (const i of list) {
      rows.push([
        'Indicante',
        i.name,
        i.role,
        `${i.partyState}${i.agraciadoNames.length ? ` · Indica: ${i.agraciadoNames.join(', ')}` : ''}`,
        i.checkedIn ? 'Credenciado' : 'Pendente',
        formatBrDateTime(i.checkedInAt),
        i.posto ?? '',
        i.representativeName,
        i.isExtra ? 'Sim' : 'Não',
        i.notes,
      ]);
    }
  }

  const lines = [
    headers.map(escapeCsvCell).join(';'),
    ...rows.map((r) => r.map(escapeCsvCell).join(';')),
  ];

  return '\uFEFF' + lines.join('\r\n');
}

function loadState(): CredenciamentoState {
  ensureDataDir();
  if (fs.existsSync(STATE_FILE)) {
    try {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as CredenciamentoState;
      if (parsed && Array.isArray(parsed.agraciados) && Array.isArray(parsed.indicantes)) {
        parsed.spreadsheetPath = SPREADSHEET_REL_PATH;
        parsed.postos = DEFAULT_POSTOS;
        parsed.event = EVENT_META;
        return parsed;
      }
    } catch (err) {
      console.error('Erro ao ler estado salvo, reinicializando:', err);
    }
  }
  const initial = buildInitialState(SPREADSHEET_REL_PATH);
  saveState(initial);
  return initial;
}

function saveState(state: CredenciamentoState): void {
  ensureDataDir();
  state.lastUpdated = new Date().toISOString();
  state.spreadsheetPath = SPREADSHEET_REL_PATH;
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  const csv = generateCsvContent(state, 'presentes', 'todos');
  fs.writeFileSync(SPREADSHEET_FILE, csv, 'utf-8');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  let state = loadState();

  // Ensure spreadsheet exists on boot
  if (!fs.existsSync(SPREADSHEET_FILE)) {
    saveState(state);
  }

  app.get('/api/state', (_req, res) => {
    res.json(state);
  });

  app.post('/api/checkin', (req, res) => {
    const { guestType, id, posto, representativeName, notes } = req.body as {
      guestType?: GuestType;
      id?: string;
      posto?: string;
      representativeName?: string;
      notes?: string;
    };

    if (!guestType || !id || !posto) {
      res.status(400).json({ error: 'Campos obrigatórios ausentes (guestType, id, posto).' });
      return;
    }

    const now = new Date().toISOString();

    if (guestType === 'agraciado') {
      const guest = state.agraciados.find((g) => g.id === id);
      if (!guest) {
        res.status(404).json({ error: 'Agraciado não encontrado.' });
        return;
      }
      guest.checkedIn = true;
      guest.checkedInAt = now;
      guest.posto = posto;
      if (typeof representativeName === 'string') {
        guest.representativeName = representativeName.trim();
      }
      if (typeof notes === 'string') {
        guest.notes = notes.trim();
      }

      const logEntry: CheckinLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        guestId: guest.id,
        guestType: 'agraciado',
        name: guest.name,
        subtitle: `${guest.indicanteName}${guest.indicantePartyState ? ` (${guest.indicantePartyState})` : ''}`,
        posto,
        checkedInAt: now,
        isExtra: guest.isExtra,
        representativeName: guest.representativeName,
      };
      state.logs = [logEntry, ...state.logs.filter((l) => !(l.guestType === 'agraciado' && l.guestId === guest.id))];
    } else if (guestType === 'indicante') {
      const guest = state.indicantes.find((i) => i.id === id);
      if (!guest) {
        res.status(404).json({ error: 'Indicante não encontrado.' });
        return;
      }
      guest.checkedIn = true;
      guest.checkedInAt = now;
      guest.posto = posto;
      if (typeof representativeName === 'string') {
        guest.representativeName = representativeName.trim();
      }
      if (typeof notes === 'string') {
        guest.notes = notes.trim();
      }

      const logEntry: CheckinLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        guestId: guest.id,
        guestType: 'indicante',
        name: guest.name,
        subtitle: `${guest.role}${guest.partyState ? ` · ${guest.partyState}` : ''}`,
        posto,
        checkedInAt: now,
        isExtra: guest.isExtra,
        representativeName: guest.representativeName,
      };
      state.logs = [logEntry, ...state.logs.filter((l) => !(l.guestType === 'indicante' && l.guestId === guest.id))];
    } else {
      res.status(400).json({ error: 'Tipo de convidado inválido.' });
      return;
    }

    saveState(state);
    res.json(state);
  });

  app.post('/api/undo-checkin', (req, res) => {
    const { guestType, id } = req.body as { guestType?: GuestType; id?: string };
    if (!guestType || !id) {
      res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
      return;
    }

    if (guestType === 'agraciado') {
      const guest = state.agraciados.find((g) => g.id === id);
      if (!guest) {
        res.status(404).json({ error: 'Agraciado não encontrado.' });
        return;
      }
      guest.checkedIn = false;
      guest.checkedInAt = null;
      guest.posto = null;
    } else if (guestType === 'indicante') {
      const guest = state.indicantes.find((i) => i.id === id);
      if (!guest) {
        res.status(404).json({ error: 'Indicante não encontrado.' });
        return;
      }
      guest.checkedIn = false;
      guest.checkedInAt = null;
      guest.posto = null;
    }

    state.logs = state.logs.filter((l) => !(l.guestType === guestType && l.guestId === id));
    saveState(state);
    res.json(state);
  });

  app.post('/api/update-guest', (req, res) => {
    const { guestType, id, representativeName, notes } = req.body as {
      guestType?: GuestType;
      id?: string;
      representativeName?: string;
      notes?: string;
    };

    if (!guestType || !id) {
      res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
      return;
    }

    if (guestType === 'agraciado') {
      const guest = state.agraciados.find((g) => g.id === id);
      if (!guest) {
        res.status(404).json({ error: 'Agraciado não encontrado.' });
        return;
      }
      if (typeof representativeName === 'string') guest.representativeName = representativeName.trim();
      if (typeof notes === 'string') guest.notes = notes.trim();

      const logItem = state.logs.find((l) => l.guestType === 'agraciado' && l.guestId === id);
      if (logItem && typeof representativeName === 'string') {
        logItem.representativeName = guest.representativeName;
      }
    } else if (guestType === 'indicante') {
      const guest = state.indicantes.find((i) => i.id === id);
      if (!guest) {
        res.status(404).json({ error: 'Indicante não encontrado.' });
        return;
      }
      if (typeof representativeName === 'string') guest.representativeName = representativeName.trim();
      if (typeof notes === 'string') guest.notes = notes.trim();

      const logItem = state.logs.find((l) => l.guestType === 'indicante' && l.guestId === id);
      if (logItem && typeof representativeName === 'string') {
        logItem.representativeName = guest.representativeName;
      }
    }

    saveState(state);
    res.json(state);
  });

  app.post('/api/extra', (req, res) => {
    const {
      guestType,
      name,
      indicanteOrRole,
      partyState,
      posto,
      representativeName,
      notes,
      checkInNow = true,
    } = req.body as {
      guestType?: GuestType;
      name?: string;
      indicanteOrRole?: string;
      partyState?: string;
      posto?: string;
      representativeName?: string;
      notes?: string;
      checkInNow?: boolean;
    };

    if (!guestType || !name || !name.trim()) {
      res.status(400).json({ error: 'Informe o nome completo para a inclusão no local.' });
      return;
    }

    const now = new Date().toISOString();
    const effectivePosto = posto || 'Plenário Ulisses Guimarães';

    if (guestType === 'agraciado') {
      const newRecord: AgraciadoRecord = {
        id: `agr-extra-${Date.now()}`,
        name: name.trim(),
        indicanteName: (indicanteOrRole || 'Inclusão no Local').trim(),
        indicanteRole: 'Inclusão Extra no Evento',
        indicantePartyState: (partyState || '').trim(),
        checkedIn: Boolean(checkInNow),
        checkedInAt: checkInNow ? now : null,
        posto: checkInNow ? effectivePosto : null,
        representativeName: (representativeName || '').trim(),
        notes: (notes || '').trim(),
        isExtra: true,
      };
      state.agraciados.push(newRecord);

      if (checkInNow) {
        state.logs = [
          {
            id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            guestId: newRecord.id,
            guestType: 'agraciado',
            name: newRecord.name,
            subtitle: newRecord.indicanteName,
            posto: effectivePosto,
            checkedInAt: now,
            isExtra: true,
            representativeName: newRecord.representativeName,
          },
          ...state.logs,
        ];
      }
    } else {
      const newRecord: IndicanteRecord = {
        id: `ind-extra-${Date.now()}`,
        name: name.trim(),
        role: (indicanteOrRole || 'Autoridade / Convidado Extra').trim(),
        partyState: (partyState || '').trim(),
        category: 'Liderança',
        agraciadoNames: [],
        checkedIn: Boolean(checkInNow),
        checkedInAt: checkInNow ? now : null,
        posto: checkInNow ? effectivePosto : null,
        representativeName: (representativeName || '').trim(),
        notes: (notes || '').trim(),
        isExtra: true,
      };
      state.indicantes.push(newRecord);

      if (checkInNow) {
        state.logs = [
          {
            id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            guestId: newRecord.id,
            guestType: 'indicante',
            name: newRecord.name,
            subtitle: `${newRecord.role}${newRecord.partyState ? ` · ${newRecord.partyState}` : ''}`,
            posto: effectivePosto,
            checkedInAt: now,
            isExtra: true,
            representativeName: newRecord.representativeName,
          },
          ...state.logs,
        ];
      }
    }

    saveState(state);
    res.json(state);
  });

  app.post('/api/delete-extra', (req, res) => {
    const { guestType, id } = req.body as { guestType?: GuestType; id?: string };
    if (!guestType || !id) {
      res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
      return;
    }

    if (guestType === 'agraciado') {
      state.agraciados = state.agraciados.filter((g) => !(g.id === id && g.isExtra));
    } else {
      state.indicantes = state.indicantes.filter((i) => !(i.id === id && i.isExtra));
    }

    state.logs = state.logs.filter((l) => !(l.guestType === guestType && l.guestId === id));
    saveState(state);
    res.json(state);
  });

  app.post('/api/reset', (_req, res) => {
    state = buildInitialState(SPREADSHEET_REL_PATH);
    saveState(state);
    res.json(state);
  });

  app.get('/api/export/csv', (req, res) => {
    const scope = req.query.scope === 'todos' ? 'todos' : 'presentes';
    const typeParam = req.query.type;
    const typeFilter =
      typeParam === 'agraciados' || typeParam === 'indicantes' ? typeParam : 'todos';

    const csv = generateCsvContent(state, scope, typeFilter);
    const filename =
      scope === 'presentes'
        ? `planilha_presentes_medalha_2026_${typeFilter}.csv`
        : `planilha_completa_medalha_2026_${typeFilter}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de credenciamento ativo em http://localhost:${PORT}`);
  });
}

startServer();
