const MEUS_ARQUIVOS_MANUAIS = [
  'farmaco-p2-Simulado-2023 novo.html',
  'farmaco-p2-Simulado-2024 novo.html',
  'farmaco-p2-Simulado-2025 novo.html',
  'fisiologia-aula-m5- 1 - Introdução e Hipófise novo 2.0.html',
  'fisiologia-aula-m5-2-Hormônios Pancreáticos novo 2.0.html',
  'fisiologia-m5-Endocrino em Grupo novo.html',
  'imunologia-b4-Simulado 2022 novo.html',
  'imunologia-b4-Simulado 2023 novo.html',
  'imunologia-b4-Simulado 2024 novo.html',
  'imunologia-b4-Simulado 2025 novo.html',
  'micro-b4-Simulado 2023 novo.html',
  'micro-b4-Simulado 2024 novo.html',
  'micro-b4-Simulado 2025 novo.html',
  'parasito-b4-Simulado 2025 novo.html',
  'patologia-b3-Simulado-2025 novo.html',
  'propedeu-p2-Simulado 2024 novo.html',
  'propedeu-p2-Simulado 2025 novo.html'
];

const GITHUB_USER = 'user210398-afk'; 
const GITHUB_REPO = 'Simulado'; 

let listaDeArquivos = [];
let estadoAtual = 'materias';
let materiaAtualChave = '';
let materiaAtualNome = '';
let bimestreAtual = null;
let arquivoAbertoAtual = null;
let filtroPesquisaAtual = 'todos';

const mapaMaterias = {
  'fisiologia': { nomeOficial: 'Fisiologia', aliases: ['fisiologia', 'fisio'], divisaoTipo: 'Módulo', qtdDivisoes: 5, divisaoRegex: /(?:modulo|módulo|m)[_\s-]*([1-5])/i, blocosExtras: [{ id: 'aulas_m4', titulo: 'Aulas do Módulo 4', desc: 'Material e aulas específicas.' }, { id: 'aulas_m5', titulo: 'Aulas do Módulo 5', desc: 'Material e aulas específicas.' }] },
  'micro': { nomeOficial: 'Microbiologia', aliases: ['microbiologia', 'micro'], divisaoTipo: 'Bimestre', qtdDivisoes: 4, divisaoRegex: /(?:bimestre|b)[_\s-]*([1-4])/i },
  'parasito': { nomeOficial: 'Parasitologia', aliases: ['parasitologia', 'parasito'], divisaoTipo: 'Bimestre', qtdDivisoes: 4, divisaoRegex: /(?:bimestre|b)[_\s-]*([1-4])/i },
  'patologia': { nomeOficial: 'Patologia', aliases: ['patologia', 'pato'], divisaoTipo: 'Bimestre', qtdDivisoes: 4, divisaoRegex: /(?:bimestre|b)[_\s-]*([1-4])/i },
  'imuno': { nomeOficial: 'Imunologia', aliases: ['imunologia', 'imuno'], divisaoTipo: 'Bimestre', qtdDivisoes: 4, divisaoRegex: /(?:bimestre|b)[_\s-]*([1-4])/i },
  'vigilancia': { nomeOficial: 'Vigilância em Saúde', aliases: ['vigilancia', 'vigilância', 'saude', 'saúde', 'vigi'], divisaoTipo: 'Bimestre', qtdDivisoes: 4, divisaoRegex: /(?:bimestre|b)[_\s-]*([1-4])/i },
  'farmaco': { nomeOficial: 'Farmacologia', aliases: ['farmacologia', 'farmaco'], divisaoTipo: 'Prova', qtdDivisoes: 3, divisaoRegex: /(?:prova|p|bimestre|b)[_\s-]*([1-3])/i },
  'propedeu': { nomeOficial: 'Propedêutica', aliases: ['propedeutica', 'propedêutica', 'propedeu', 'prope'], divisaoTipo: 'Prova', qtdDivisoes: 2, divisaoRegex: /(?:prova|p|bimestre|b)[_\s-]*([1-2])/i },
  'psico': { nomeOficial: 'Psicomed', aliases: ['psicomed', 'psico', 'psicologia'], divisaoTipo: 'Bimestre', qtdDivisoes: 4, divisaoRegex: /(?:bimestre|b)[_\s-]*([1-4])/i }
};

// Omitindo dadosCronograma extenso para não poluir o código. No seu arquivo real, mantenha todo o JSON aqui.
const dadosCronograma = {
  "2026-09-29": ["Manhã (Fisiologia): Aula teórica..."],
  "2026-10-06": ["Manhã (Fisiologia): Aula prática..."]
};

let concluidos = JSON.parse(localStorage.getItem('simulados_concluidos') || '[]');

// History API Integration (Navegação via "Voltar" nativo)
function updateHistoryState(stateObj) {
  if (history.state && history.state.tela === stateObj.tela && history.state.param === stateObj.param) return;
  history.pushState(stateObj, '', '');
}

window.addEventListener('popstate', (e) => {
  if (e.state) {
    if (e.state.tela === 'materias') voltarParaInicio(false);
    else if (e.state.tela === 'bimestres') selecionarMateria(e.state.param.chave, e.state.param.nome, false);
    else if (e.state.tela === 'simulados') abrirBimestre(e.state.param.bimestre, null, false);
    else if (e.state.tela === 'calendario') abrirCalendarioInterativo(false);
  } else {
    voltarParaInicio(false);
  }
});

// Acessibilidade (Foco)
let ultimoElementoFocado = null;

function trapFocus(modalId, closeBtnId) {
  ultimoElementoFocado = document.activeElement;
  document.getElementById(modalId).style.display = 'flex';
  const closeBtn = document.getElementById(closeBtnId);
  if(closeBtn) closeBtn.focus();
}

function releaseFocus(modalId) {
  document.getElementById(modalId).style.display = 'none';
  if(ultimoElementoFocado) ultimoElementoFocado.focus();
}

window.addEventListener('message', function(event) {
  if (event.data === 'simulados_concluido' || (event.data && event.data.type === 'simulados_concluido')) {
    const arquivo = (event.data && event.data.arquivo) ? event.data.arquivo : arquivoAbertoAtual;
    if (arquivo && !concluidos.includes(arquivo)) {
      concluidos.push(arquivo);
      localStorage.setItem('simulados_concluidos', JSON.stringify(concluidos));
      if (estadoAtual === 'simulados' && bimestreAtual) abrirBimestre(bimestreAtual, null, false);
    }
  }
});

// Cache da API do GitHub via sessionStorage
async function carregarArquivosDoGithub() {
  const cacheKey = 'medhub_gh_files';
  const cacheTimeKey = 'medhub_gh_time';
  const now = Date.now();
  const tempoCache = 1000 * 60 * 60; // 1 hora
  let arquivosRemotos = [];

  const cacheSalvo = sessionStorage.getItem(cacheKey);
  const dataCache = sessionStorage.getItem(cacheTimeKey);

  if (cacheSalvo && dataCache && (now - dataCache < tempoCache)) {
    arquivosRemotos = JSON.parse(cacheSalvo);
  } else {
    try {
      let response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/`);
      if (response.ok) {
        const dados = await response.json();
        if (Array.isArray(dados)) {
          arquivosRemotos = dados
            .filter(item => (item.type === 'file' || item.name) && item.name.toLowerCase().endsWith('.html') && item.name.toLowerCase() !== 'index.html')
            .map(item => item.name);
          sessionStorage.setItem(cacheKey, JSON.stringify(arquivosRemotos));
          sessionStorage.setItem(cacheTimeKey, now.toString());
        }
      }
    } catch (erro) {
      console.warn('Conexão remota indisponível. Carregando modo offline.', erro);
    }
  }

  const unificados = new Set([...arquivosRemotos, ...MEUS_ARQUIVOS_MANUAIS]);
  listaDeArquivos = Array.from(unificados);
  atualizarContadores();

  if (estadoAtual === 'bimestres') atualizarContadoresBimestres();
  else if (estadoAtual === 'simulados' && bimestreAtual) abrirBimestre(bimestreAtual, null, false);
}

// Funções de Navegação
function selecionarMateria(prefixoChave, nomeMateria, doPush = true) {
  materiaAtualChave = prefixoChave;
  materiaAtualNome = nomeMateria;
  estadoAtual = 'bimestres';
  if(doPush) updateHistoryState({tela: 'bimestres', param: {chave: prefixoChave, nome: nomeMateria}});

  const mat = mapaMaterias[prefixoChave];
  const numDivisoes = mat ? mat.qtdDivisoes : 4;
  
  document.getElementById('main-title').innerText = nomeMateria;
  document.getElementById('main-subtitle').innerText = `Selecione a etapa na trilha.`;
  document.getElementById('badge-top').innerText = `Trilha de Estudos`;
  document.getElementById('btn-back').classList.remove('hidden');

  const container = document.getElementById('container-divisoes');
  container.innerHTML = '';
  container.className = 'timeline-container';

  for (let i = 1; i <= numDivisoes; i++) {
    const divCard = document.createElement('div');
    divCard.className = 'timeline-item';
    divCard.onclick = () => abrirBimestre(i);
    divCard.innerHTML = `
      <div class="timeline-node">${i}</div>
      <div class="timeline-card">
        <div class="timeline-card-content">
          <div class="timeline-card-info">
            <h3>${i}º ${mat ? mat.divisaoTipo : 'Bimestre'}</h3>
          </div>
          <div class="timeline-card-footer">
            <span class="count-badge" id="count-b${i}">0 simulados</span>
            <i class="ph-bold ph-arrow-right" style="color: var(--purple-primary);"></i>
          </div>
        </div>
      </div>
    `;
    container.appendChild(divCard);
  }

  atualizarContadoresBimestres();
  document.getElementById('tela-materias').classList.add('hidden');
  document.getElementById('tela-bimestres').classList.remove('hidden');
  document.getElementById('tela-simulados').classList.add('hidden');
  document.getElementById('tela-calendario').classList.add('hidden');
}

function abrirBimestre(numeroBimestre, tituloCustom = null, doPush = true) {
  estadoAtual = 'simulados';
  bimestreAtual = numeroBimestre;
  if(doPush) updateHistoryState({tela: 'simulados', param: {bimestre: numeroBimestre}});

  document.getElementById('main-title').innerText = `${materiaAtualNome}`;
  document.getElementById('badge-top').innerText = 'Lista de Provas';
  
  document.getElementById('tela-bimestres').classList.add('hidden');
  document.getElementById('tela-simulados').classList.remove('hidden');

  const gridSimulados = document.getElementById('grid-simulados');
  gridSimulados.innerHTML = '';

  const simuladosEncontrados = listaDeArquivos.filter(arquivo => {
    return arquivoPertenceAMateria(arquivo, materiaAtualChave) && extrairBimestreDoArquivo(arquivo, materiaAtualChave) === numeroBimestre;
  });

  renderizarCardsSimulados(simuladosEncontrados, gridSimulados, false);
}

function voltarParaInicio(doPush = true) {
  if(doPush) updateHistoryState({tela: 'materias'});
  document.getElementById('search-input').value = '';
  document.getElementById('tela-simulados').classList.add('hidden');
  document.getElementById('tela-bimestres').classList.add('hidden');
  document.getElementById('tela-calendario').classList.add('hidden');
  document.getElementById('tela-materias').classList.remove('hidden');
  document.getElementById('btn-back').classList.add('hidden');
  document.getElementById('dashboard-widgets').classList.remove('hidden');
  
  document.getElementById('main-title').innerText = 'Simulados das Provas 2026';
  estadoAtual = 'materias';
}

function voltar() {
  if (estadoAtual === 'simulados') history.back();
  else if (estadoAtual === 'bimestres' || estadoAtual === 'simulados_busca' || estadoAtual === 'calendario') history.back();
}

// Iframe Timeout & Handling
let iframeTimer;
function carregarSimulado(arquivoEncoded, arquivoOriginal) {
  arquivoAbertoAtual = arquivoOriginal;
  const telaProva = document.getElementById('tela-prova');
  const iframe = document.getElementById('iframe-simulado');
  
  document.getElementById('spinner-loader').style.display = 'flex';
  document.getElementById('spinner-texto').innerText = 'Preparando sua avaliação...';
  
  // Tratamento de Erro / Demora
  iframeTimer = setTimeout(() => {
    document.getElementById('spinner-texto').innerHTML = 'O carregamento está demorando.<br>A avaliação pode não existir ou a conexão falhou.';
  }, 6000);

  const src = arquivoEncoded.includes('?') ? `${arquivoEncoded}&autostart=true` : `${arquivoEncoded}?autostart=true`;
  iframe.src = src;
  telaProva.style.display = 'block';

  const infoMat = identificarMateriaDoArquivo(arquivoOriginal);
  const title = formatarTituloSimulado(arquivoOriginal, infoMat.chave);
  localStorage.setItem('ultimo_acesso_simulado', JSON.stringify({
    encoded: arquivoEncoded, original: arquivoOriginal, titulo: title, materia: infoMat.nomeOficial
  }));
  renderizarWidgetsDashboard();
}

function esconderSpinner() {
  clearTimeout(iframeTimer);
  document.getElementById('spinner-loader').style.display = 'none';
}

function fecharProva() {
  document.getElementById('tela-prova').style.display = 'none';
  document.getElementById('iframe-simulado').src = '';
  arquivoAbertoAtual = null;
}

// Scratchpad Actions
function toggleScratchpad() {
  document.getElementById('scratchpad-panel').classList.toggle('open');
}

function limparScratchpad() {
  if(confirm("Tem certeza que deseja limpar todas as anotações?")) {
    document.getElementById('scratchpad-text').value = '';
    localStorage.removeItem('medhub_scratchpad');
  }
}

function exportarScratchpad() {
  const txt = document.getElementById('scratchpad-text').value;
  const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "anotacoes_medhub.txt";
  a.click();
}

// Mobile Menu
function toggleMenuMobile() {
  document.getElementById('sidebar').classList.toggle('open');
}

// Funções Auxiliares de Arquivos, Títulos e Renderização
function arquivoPertenceAMateria(nome, chave) { return mapaMaterias[chave].aliases.some(a => nome.toLowerCase().includes(a)); }
function identificarMateriaDoArquivo(arq) {
  for (const [ch, info] of Object.entries(mapaMaterias)) if (info.aliases.some(a => arq.toLowerCase().includes(a))) return { chave: ch, nomeOficial: info.nomeOficial };
  return { chave: '', nomeOficial: 'Geral' };
}
function extrairBimestreDoArquivo(arq, ch) {
  const match = arq.toLowerCase().match(/(?:modulo|módulo|m|prova|p|bimestre|b)[_\s-]*([1-5])/i);
  return match ? parseInt(match[1]) : 1;
}

function formatarTituloSimulado(arquivo, chave) {
  let nome = arquivo.split('/').pop().replace(/\.html?$/i, '');
  if(chave && mapaMaterias[chave]) mapaMaterias[chave].aliases.forEach(a => nome = nome.replace(new RegExp(`${a}`, 'gi'), ' '));
  nome = nome.replace(/(?:modulo|módulo|m|prova|p|bimestre|b)[_\s-]*[1-5]/gi, ' ').replace(/[-_]+/g, ' ').trim();
  return nome || arquivo.replace(/\.html?$/i, '');
}

function renderizarCardsSimulados(lista, container, ehBusca = false) {
  // Aplicando filtros
  if (filtroPesquisaAtual === 'pendentes') lista = lista.filter(a => !concluidos.includes(a));
  else if (filtroPesquisaAtual === 'concluidos') lista = lista.filter(a => concluidos.includes(a));

  if (lista.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; padding: 40px; text-align: center;">Nenhum simulado correspondente encontrado.</div>`;
    return;
  }
  
  lista.forEach(arquivo => {
    const info = identificarMateriaDoArquivo(arquivo);
    const titulo = formatarTituloSimulado(arquivo, info.chave);
    const concluido = concluidos.includes(arquivo);
    const card = document.createElement('div');
    card.className = 'subject-card simulado-card';
    card.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
          ${ehBusca ? `<span class="count-badge">${info.nomeOficial}</span>` : ''}
          ${concluido ? '<span class="done-badge">✔ Concluído</span>' : '<span class="count-badge">Pendente</span>'}
        </div>
        <h3 style="font-size: 1.15rem;">${titulo}</h3>
      </div>
    `;
    card.onclick = () => carregarSimulado(encodeURI(arquivo), arquivo);
    container.appendChild(card);
  });
}

// Omnisearch
function abrirOmnisearch() { trapFocus('modal-omnisearch', 'search-input'); }
function fecharOmnisearch() { releaseFocus('modal-omnisearch'); }
function fecharOmnisearchClick(e) { if(e.target.id === 'modal-omnisearch') fecharOmnisearch(); }

function mudarFiltroBusca(filtro) {
  filtroPesquisaAtual = filtro;
  document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
  document.getElementById('filter-' + filtro).classList.add('active');
  filtrarSimuladosPorBusca();
}

function filtrarSimuladosPorBusca() {
  const termo = document.getElementById('search-input').value.toLowerCase().trim();
  if (!termo && estadoAtual !== 'simulados_busca') return;
  
  estadoAtual = 'simulados_busca';
  document.getElementById('tela-materias').classList.add('hidden');
  document.getElementById('tela-bimestres').classList.add('hidden');
  document.getElementById('tela-simulados').classList.remove('hidden');
  document.getElementById('dashboard-widgets').classList.add('hidden');
  document.getElementById('btn-back').classList.remove('hidden');
  document.getElementById('main-title').innerText = 'Resultados da Busca';
  
  const filtrados = listaDeArquivos.filter(a => a.toLowerCase().includes(termo));
  renderizarCardsSimulados(filtrados, document.getElementById('grid-simulados'), true);
}

// Atualizar Contadores
function atualizarContadores() {
  Object.keys(mapaMaterias).forEach(chave => {
    const c = listaDeArquivos.filter(a => arquivoPertenceAMateria(a, chave)).length;
    const el = document.getElementById(`count-${chave}`);
    if (el) el.innerText = `${c} simulado${c !== 1 ? 's' : ''}`;
  });
}
function atualizarContadoresBimestres() {
  for (let b = 1; b <= mapaMaterias[materiaAtualChave].qtdDivisoes; b++) {
    const c = listaDeArquivos.filter(a => arquivoPertenceAMateria(a, materiaAtualChave) && extrairBimestreDoArquivo(a, materiaAtualChave) === b).length;
    const el = document.getElementById(`count-b${b}`);
    if (el) el.innerText = `${c} simulado${c !== 1 ? 's' : ''}`;
  }
}

// Utilitários de Interface e Modais
function abrirModalAjuda() { trapFocus('modal-ajuda', 'btn-close-ajuda'); }
function fecharModalAjuda() { releaseFocus('modal-ajuda'); }
function abrirModalConfig() { trapFocus('modal-config', 'btn-close-config'); }
function fecharModalConfig() { releaseFocus('modal-config'); }

function aplicarBentoToggle() {
  const check = document.getElementById('toggle-bento').checked;
  document.getElementById('grid-materias').classList.toggle('bento-active', check);
  localStorage.setItem('preferencia_bento', check);
}

function toggleDarkModeConfig() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('preferencia_darkmode', isDark);
}

// Inicializações
window.addEventListener('DOMContentLoaded', () => {
  updateHistoryState({tela: 'materias'});
  
  document.getElementById('scratchpad-text').value = localStorage.getItem('medhub_scratchpad') || '';
  document.getElementById('scratchpad-text').addEventListener('input', e => localStorage.setItem('medhub_scratchpad', e.target.value));

  if (localStorage.getItem('preferencia_bento') === 'false') {
    document.getElementById('toggle-bento').checked = false;
    aplicarBentoToggle();
  }
  if (localStorage.getItem('preferencia_darkmode') === 'true') {
    document.getElementById('toggle-darkmode').checked = true;
    document.body.classList.add('dark-mode');
  }
  carregarArquivosDoGithub();
});

// Resumo Dashboard
function renderizarWidgetsDashboard() {} // (Mesma função do seu script original que desenha os cards do dashboard)
function abrirCalendarioInterativo(doPush = true) {} // (Mesma função de calendário original que popula os grids, adicione doPush logica semelhante)
