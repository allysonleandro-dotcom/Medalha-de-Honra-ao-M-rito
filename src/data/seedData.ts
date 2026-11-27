import type { AgraciadoRecord, CredenciamentoState, EventMeta, IndicanteRecord } from '../types.ts';

export const EVENT_META: EventMeta = {
  title: 'Medalha Mérito Legislativo 2026',
  subtitle: 'Sessão Solene para Outorga da Medalha do Mérito Legislativo',
  date: '02/12/2026',
  timeRange: '10:00 às 12:00',
  location: 'Plenário Ulisses Guimarães',
  supervision: 'Frederico Fonseca',
  organ: 'Segunda-Secretaria · Câmara dos Deputados',
};

export const DEFAULT_POSTOS: string[] = ['Plenário Ulisses Guimarães'];

interface SeedAgraciado {
  name: string;
  indicanteRole: string;
  indicanteName: string;
  indicantePartyState: string;
  isInMemoriam?: boolean;
  isInstitution?: boolean;
}

const RAW_AGRACIADOS: SeedAgraciado[] = [
  // Página 1
  {
    name: 'Ágide Meneguette',
    indicanteRole: 'Quarto-Secretário',
    indicanteName: 'Dep. Sergio Souza',
    indicantePartyState: 'MDB/PR',
  },
  {
    name: 'Alexandre Reis Siqueira Freire',
    indicanteRole: 'Segundo Vice-Presidente',
    indicanteName: 'Dep. Elmar Nascimento',
    indicantePartyState: 'União/BA',
  },
  {
    name: 'Allan Kardec Duailibe Barros Filho',
    indicanteRole: 'Líder do União Brasil',
    indicanteName: 'Dep. Pedro Lucas Fernandes',
    indicantePartyState: 'União/MA',
  },
  {
    name: 'Álvaro Damião Vieira da Paz',
    indicanteRole: 'Líder do Avante',
    indicanteName: 'Dep. Waldemar Oliveira',
    indicantePartyState: 'Avante/PE',
  },
  {
    name: 'Deputado Federal André Janones',
    indicanteRole: 'Primeiro-Secretário',
    indicanteName: 'Dep. Carlos Veras',
    indicantePartyState: 'PT/PE',
  },
  {
    name: 'Antonio Firmino de Sá Linhares',
    indicanteRole: 'Líder do PL',
    indicanteName: 'Dep. Sóstenes Cavalcante',
    indicantePartyState: 'PL/RJ',
  },
  {
    name: 'Antônio Waldez Góes da Silva',
    indicanteRole: 'Líder do PDT',
    indicanteName: 'Dep. André Figueiredo',
    indicantePartyState: 'PDT/CE',
  },
  {
    name: 'Arnold Wald',
    indicanteRole: 'Presidente da Câmara dos Deputados',
    indicanteName: 'Dep. Hugo Motta',
    indicantePartyState: 'Republicanos/PB',
  },
  {
    name: 'ASEZ - Voluntariado Universitário da Igreja de Deus Sociedade Missionária Mundial',
    indicanteRole: 'Primeiro Vice-Presidente',
    indicanteName: 'Dep. Altineu Côrtes',
    indicantePartyState: 'PL/RJ',
    isInstitution: true,
  },
  {
    name: 'Benedito Gonçalves',
    indicanteRole: 'Presidente da Câmara dos Deputados',
    indicanteName: 'Dep. Hugo Motta',
    indicantePartyState: 'Republicanos/PB',
  },
  {
    name: 'Deputado Federal Beto Richa',
    indicanteRole: 'Líder do PSDB',
    indicanteName: 'Dep. Adolfo Viana',
    indicantePartyState: 'PSDB/BA',
  },
  {
    name: 'Bianca Borges dos Santos',
    indicanteRole: 'Líder do PcdoB',
    indicanteName: 'Dep. Jandira Feghali',
    indicantePartyState: 'PcdoB/RJ',
  },
  {
    name: 'Carlos Aurélio Linhalis',
    indicanteRole: 'Terceiro-Suplente',
    indicanteName: 'Dep. Dr. Victor Linhalis',
    indicantePartyState: 'PSB/ES',
  },
  {
    name: 'Carlos Eduardo Sanchez',
    indicanteRole: 'Líder do MDB',
    indicanteName: 'Dep. Isnaldo Bulhões Jr.',
    indicantePartyState: 'MDB/AL',
  },
  {
    name: 'Daniela Alessandra Soares Fichino (in memoriam)',
    indicanteRole: 'Líder do PSOL',
    indicanteName: 'Dep. Tarcísio Motta',
    indicantePartyState: 'PSOL/RJ',
    isInMemoriam: true,
  },

  // Página 2
  {
    name: 'Danielle Christian Ribeiro Barros',
    indicanteRole: 'Líder do Solidariedade',
    indicanteName: 'Dep. Aureo Ribeiro',
    indicantePartyState: 'Solidariedade/RJ',
  },
  {
    name: 'Deltan Martinazzo Dallagnol',
    indicanteRole: 'Líder do Novo',
    indicanteName: 'Dep. Gilson Marques',
    indicantePartyState: 'Novo/SC',
  },
  {
    name: 'DIAP - Departamento Intersindical de Assessoria Parlamentar',
    indicanteRole: 'Primeiro-Secretário',
    indicanteName: 'Dep. Carlos Veras',
    indicantePartyState: 'PT/PE',
    isInstitution: true,
  },
  {
    name: 'Érica Lima Cavalcante Mitidieri',
    indicanteRole: 'Terceira-Secretária',
    indicanteName: 'Dep. Delegada Katarina',
    indicantePartyState: 'PSD/SE',
  },
  {
    name: 'Estela Aranha',
    indicanteRole: 'Presidente da Câmara dos Deputados',
    indicanteName: 'Dep. Hugo Motta',
    indicantePartyState: 'Republicanos/PB',
  },
  {
    name: 'Des. Francisco José dos Anjos Bandeira de Mello',
    indicanteRole: 'Segundo-Secretário',
    indicanteName: 'Dep. Lula da Fonte',
    indicantePartyState: 'PP/PE',
  },
  {
    name: 'Guilherme Augusto Caputo Bastos',
    indicanteRole: 'Líder do PRD',
    indicanteName: 'Dep. Fred Costa',
    indicantePartyState: 'PRD/MG',
  },
  {
    name: 'Instituto Transbordar do Avivamento',
    indicanteRole: 'Primeiro Vice-Presidente',
    indicanteName: 'Dep. Altineu Côrtes',
    indicantePartyState: 'PL/RJ',
    isInstitution: true,
  },
  {
    name: 'Isabela Silva Suarez',
    indicanteRole: 'Segundo Vice-Presidente',
    indicanteName: 'Dep. Elmar Nascimento',
    indicantePartyState: 'União/BA',
  },
  {
    name: 'Jesus Elias Tajra',
    indicanteRole: 'Segundo-Secretário',
    indicanteName: 'Dep. Lula da Fonte',
    indicantePartyState: 'PP/PE',
  },
  {
    name: 'João Henrique Hummel Vieira',
    indicanteRole: 'Líder do Cidadania',
    indicanteName: 'Dep. Alex Manente',
    indicantePartyState: 'Cidadania/SP',
  },
  {
    name: 'Jolinda Garcia dos Santos Clemente',
    indicanteRole: 'Líder do PSB',
    indicanteName: 'Dep. Jonas Donizette',
    indicantePartyState: 'PSB/SP',
  },
  {
    name: 'José Álvaro Góes Filho',
    indicanteRole: 'Líder do PV',
    indicanteName: 'Dep. Aliel Machado',
    indicantePartyState: 'PV/PR',
  },
  {
    name: 'Luis Felipe Salomão',
    indicanteRole: 'Presidente da Câmara dos Deputados',
    indicanteName: 'Dep. Hugo Motta',
    indicantePartyState: 'Republicanos/PB',
  },
  {
    name: 'Luis Henrique dos Santos Moreira',
    indicanteRole: 'Primeiro-Suplente',
    indicanteName: 'Dep. Antonio Carlos Rodrigues',
    indicantePartyState: 'PODE/SP',
  },

  // Página 3
  {
    name: 'Luís Otávio Veríssimo Teixeira',
    indicanteRole: 'Líder do PP',
    indicanteName: 'Dep. Doutor Luizinho',
    indicantePartyState: 'PP/RJ',
  },
  {
    name: 'Marcella Balthar de Mello Peixoto Tavares',
    indicanteRole: 'Segundo-Suplente',
    indicanteName: 'Dep. Paulo Folletto',
    indicantePartyState: 'PSB/ES',
  },
  {
    name: 'Márlon Henrique Cunha',
    indicanteRole: 'Líder do PSD',
    indicanteName: 'Dep. Antonio Brito',
    indicantePartyState: 'PSD/BA',
  },
  {
    name: 'Miguel Sanches Neto',
    indicanteRole: 'Presidente da Câmara dos Deputados',
    indicanteName: 'Dep. Hugo Motta',
    indicantePartyState: 'Republicanos/PB',
  },
  {
    name: 'Orlando Pessuti',
    indicanteRole: 'Quarto-Secretário',
    indicanteName: 'Dep. Sergio Souza',
    indicantePartyState: 'MDB/PR',
  },
  {
    name: 'Renato Simões',
    indicanteRole: 'Líder do PT',
    indicanteName: 'Dep. Pedro Uczai',
    indicantePartyState: 'PT/SC',
  },
  {
    name: 'Tatiana Lobo Coelho de Sampaio',
    indicanteRole: 'Líder do Podemos',
    indicanteName: 'Dep. Rodrigo Gambale',
    indicantePartyState: 'PODE/SP',
  },
  {
    name: 'Teodoro Silva Santos',
    indicanteRole: 'Presidente da Câmara dos Deputados',
    indicanteName: 'Dep. Hugo Motta',
    indicantePartyState: 'Republicanos/PB',
  },
  {
    name: 'Ulisses de Andrade Filho',
    indicanteRole: 'Terceira-Secretária',
    indicanteName: 'Dep. Delegada Katarina',
    indicantePartyState: 'PSD/SE',
  },
  {
    name: 'Universidade Federal de Pernambuco',
    indicanteRole: 'Líder do Republicanos',
    indicanteName: 'Dep. Augusto Coutinho',
    indicantePartyState: 'Republicanos/PE',
    isInstitution: true,
  },
];

export function buildInitialState(spreadsheetPath = 'data/planilha_credenciados_2026.csv'): CredenciamentoState {
  const agraciados: AgraciadoRecord[] = RAW_AGRACIADOS.map((item, idx) => ({
    id: `agr-${String(idx + 1).padStart(3, '0')}`,
    name: item.name,
    indicanteName: item.indicanteName,
    indicanteRole: item.indicanteRole,
    indicantePartyState: item.indicantePartyState,
    isInMemoriam: Boolean(item.isInMemoriam),
    isInstitution: Boolean(item.isInstitution),
    checkedIn: false,
    checkedInAt: null,
    posto: null,
    representativeName: '',
    notes: '',
    isExtra: false,
  }));

  const indicantesMap = new Map<string, IndicanteRecord>();

  for (const item of RAW_AGRACIADOS) {
    const key = item.indicanteName;
    const existing = indicantesMap.get(key);
    if (existing) {
      existing.agraciadoNames.push(item.name);
    } else {
      const isLeader = item.indicanteRole.toLowerCase().startsWith('líder');
      indicantesMap.set(key, {
        id: `ind-${String(indicantesMap.size + 1).padStart(3, '0')}`,
        name: item.indicanteName,
        role: item.indicanteRole,
        partyState: item.indicantePartyState,
        category: isLeader ? 'Liderança' : 'Mesa Diretora',
        agraciadoNames: [item.name],
        checkedIn: false,
        checkedInAt: null,
        posto: null,
        representativeName: '',
        notes: '',
        isExtra: false,
      });
    }
  }

  const indicantes = Array.from(indicantesMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR')
  );

  return {
    event: EVENT_META,
    agraciados,
    indicantes,
    logs: [],
    postos: DEFAULT_POSTOS,
    spreadsheetPath,
    lastUpdated: new Date().toISOString(),
  };
}
