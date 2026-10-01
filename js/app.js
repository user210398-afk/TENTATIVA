let pilhaNavegacao = ['materias'];
let materiaSelecionadaAtual = null;

// Base de Dados dos Simulados
const simuladosDados = {
  fisiologia: {
    nome: "Fisiologia",
    divisoes: [
      { id: "mod1", titulo: "Módulo 1: Neurofisiologia", simulados: [{ id: "sim1", titulo: "Simulado 1: Potencial de Ação", url: "about:blank" }] }
    ]
  },
  micro: {
    nome: "Microbiologia",
    divisoes: [
      { id: "bim1", titulo: "1º Bimestre: Bacteriologia", simulados: [{ id: "sim1", titulo: "Simulado 1: Estreptococos & Estafilococos", url: "about:blank" }] }
    ]
  },
  parasito: {
    nome: "Parasitologia",
    divisoes: [
      { id: "bim1", titulo: "1º Bimestre: Protozoários", simulados: [{ id: "sim1", titulo: "Simulado 1: Leishmaniose e Chagas", url: "about:blank" }] }
    ]
  },
  patologia: {
    nome: "Patologia",
    divisoes: [
      { id: "bim1", titulo: "1º Bimestre: Lesão Celular", simulados: [{ id: "sim1", titulo: "Simulado 1: Isquemia e Inflamação", url: "about:blank" }] }
    ]
  },
  imuno: {
    nome: "Imunologia",
    divisoes: [
      { id: "bim1", titulo: "1º Bimestre: Imunidade Inata", simulados: [{ id: "sim1", titulo: "Simulado 1: Neutrófilos & Macrófagos", url: "about:blank" }] }
    ]
  },
  vigilancia: {
    nome: "Vigilância em Saúde",
    divisoes: [
      { id: "bim1", titulo: "1º Bimestre: Epidemiologia", simulados: [{ id: "sim1", titulo: "Simulado 1: Taxa de Mortalidade e Incidência", url: "about:blank" }] }
    ]
  }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  atualizarContadores();
  carregarWidgets();
  carregarScratchpad();
});

function carregarWidgets() {
  const container = document.getElementById('dashboard-widgets');
  if(!container) return;
  container.innerHTML = `
    <div class="widget-card">
      <div class="widget-icon purple"><i class="ph-duotone ph-check-circle"></i></div>
      <div class="widget-content">
        <h4>Simulados Realizados</h4>
        <h2>6 Concluídos</h2>
        <p>Aproveitamento médio de 82%</p>
      </div>
    </div>
    <div class="widget-card">
      <div class="widget-icon"><i class="ph-duotone ph-chart-line-up"></i></div>
      <div class="widget-content">
        <h4>Meta Semanal</h4>
        <h2>4 / 5 Simulados</h2>
        <p>80% da meta atingida</p>
      </div>
    </div>
    <div class="widget-card">
      <div class="widget-icon purple"><i class="ph-duotone ph-clock"></i></div>
      <div class="widget-content">
        <h4>Tempo Médio</h4>
        <h2>1 min 45s / questão</h2>
        <p>Ritmo excelente de resolução</p>
      </div>
    </div>
  `;
}

function atualizarContadores() {
  Object.keys(simuladosDados).forEach(key => {
    const el = document.getElementById(`count-${key}`);
    if(el) {
      let total = 0;
      simuladosDados[key].divisoes.forEach(d => total += d.simulados.length);
      el.innerText = `${total} simulados`;
    }
  });
}

function navegarPara(telaId) {
  document.getElementById('tela-materias').classList.add('hidden');
  document.getElementById('tela-divisoes').classList.add('hidden');
  document.getElementById('tela-simulados').classList.add('hidden');
  
  document.getElementById(telaId).classList.remove('hidden');
  
  const btnBack = document.getElementById('btn-back');
  if (pilhaNavegacao.length > 1) {
    btnBack.classList.remove('hidden');
  } else {
    btnBack.classList.add('hidden');
  }
}

function selecionarMateria(key, nome) {
  materiaSelecionadaAtual = key;
  pilhaNavegacao.push('divisoes');
  
  const titulo = document.getElementById('titulo-divisoes');
  titulo.innerHTML = `<i class="ph-bold ph-list-numbers"></i> ${nome} - Divisões`;

  const container = document.getElementById('container-divisoes');
  container.innerHTML = '';

  const mat = simuladosDados[key];
  if (mat && mat.divisoes) {
    mat.divisoes.forEach((div, idx) => {
      container.innerHTML += `
        <div class="timeline-item">
          <div class="timeline-node">${idx + 1}</div>
          <div class="timeline-card" onclick="abrirDivisao('${div.id}', '${div.titulo}')">
            <div class="timeline-card-content">
              <div class="timeline-card-info">
                <h3>${div.titulo}</h3>
                <p>${div.simulados.length} simulados disponíveis</p>
              </div>
              <div class="timeline-card-footer">
                <span>Acessar →</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  }
  navegarPara('tela-divisoes');
}

function abrirDivisao(divId, tituloDivisao) {
  pilhaNavegacao.push('simulados');
  const grid = document.getElementById('grid-simulados');
  grid.innerHTML = '';
  
  document.getElementById('titulo-simulados').innerHTML = `<i class="ph-bold ph-file-text"></i> ${tituloDivisao}`;

  const mat = simuladosDados[materiaSelecionadaAtual];
  const divObj = mat.divisoes.find(d => d.id === divId);

  if (divObj) {
    divObj.simulados.forEach(sim => {
      grid.innerHTML += `
        <div class="subject-card simulado-card" onclick="abrirProva('${sim.url}')">
          <div>
            <i class="ph-duotone ph-file-text card-icon"></i>
            <h3>${sim.titulo}</h3>
            <p>Clique para iniciar a responder.</p>
          </div>
          <div class="card-footer">
            <span>Iniciar Simulado →</span>
          </div>
        </div>
      `;
    });
  }
  navegarPara('tela-simulados');
}

function voltar() {
  if (pilhaNavegacao.length > 1) {
    pilhaNavegacao.pop();
    const ultimaTela = pilhaNavegacao[pilhaNavegacao.length - 1];
    navegarPara(ultimaTela === 'materias' ? 'tela-materias' : (ultimaTela === 'divisoes' ? 'tela-divisoes' : 'tela-simulados'));
  }
}

function voltarParaInicio() {
  pilhaNavegacao = ['materias'];
  navegarPara('tela-materias');
}

/* Exam Viewer */
function abrirProva(url) {
  const examView = document.getElementById('tela-prova');
  const iframe = document.getElementById('iframe-simulado');
  document.getElementById('spinner-loader').style.display = 'flex';
  iframe.src = url;
  examView.style.display = 'block';
}

function fecharProva() {
  const examView = document.getElementById('tela-prova');
  const iframe = document.getElementById('iframe-simulado');
  iframe.src = '';
  examView.style.display = 'none';
}

function esconderSpinner() {
  document.getElementById('spinner-loader').style.display = 'none';
}

/* Scratchpad */
function toggleScratchpad() {
  document.getElementById('scratchpad-panel').classList.toggle('open');
}

function carregarScratchpad() {
  const scratchpadArea = document.getElementById('scratchpad-text');
  if(!scratchpadArea) return;
  scratchpadArea.value = localStorage.getItem('medhub_scratchpad') || '';
  scratchpadArea.addEventListener('input', () => {
    localStorage.setItem('medhub_scratchpad', scratchpadArea.value);
  });
}

/* Modais */
function fecharModal() {
  document.getElementById('modal-container').style.display = 'none';
}

function abrirModalAjuda() {
  const modal = document.getElementById('modal-container');
  const box = document.getElementById('modal-box-content');
  box.innerHTML = `
    <h2><i class="ph-duotone ph-question"></i> Ajuda & Regras</h2>
    <p>Selecione uma matéria no menu principal para visualizar seus respectivos módulos e simulados.</p>
    <button class="btn-modal-close" onclick="fecharModal()">Fechar</button>
  `;
  modal.style.display = 'flex';
}

function abrirModalConfig() {
  const modal = document.getElementById('modal-container');
  const box = document.getElementById('modal-box-content');
  const isDark = document.body.classList.contains('dark-mode');
  
  box.innerHTML = `
    <h2><i class="ph-duotone ph-sliders-horizontal"></i> Configurações</h2>
    <div class="setting-row">
      <span>Modo Escuro</span>
      <label class="toggle-switch">
        <input type="checkbox" id="chk-dark" ${isDark ? 'checked' : ''} onchange="toggleDarkMode()">
        <span class="slider"></span>
      </label>
    </div>
    <button class="btn-modal-close" onclick="fecharModal()">Fechar</button>
  `;
  modal.style.display = 'flex';
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

function abrirOmnisearch() {
  const modal = document.getElementById('modal-container');
  const box = document.getElementById('modal-box-content');
  box.innerHTML = `
    <h2><i class="ph-bold ph-magnifying-glass"></i> Pesquisar</h2>
    <input type="text" class="omnisearch-input" id="input-search" placeholder="Digite para buscar matérias ou simulados..." oninput="filtrarOmnisearch(this.value)">
    <div id="omnisearch-results"></div>
    <button class="btn-modal-close" onclick="fecharModal()">Fechar</button>
  `;
  modal.style.display = 'flex';
  setTimeout(() => document.getElementById('input-search').focus(), 100);
}

function filtrarOmnisearch(query) {
  const resultados = document.getElementById('omnisearch-results');
  if (!resultados) return;
  if (!query.trim()) { resultados.innerHTML = ''; return; }
  
  let html = '';
  const q = query.toLowerCase();
  
  Object.keys(simuladosDados).forEach(matKey => {
    const mat = simuladosDados[matKey];
    mat.divisoes.forEach(div => {
      div.simulados.forEach(sim => {
        if (sim.titulo.toLowerCase().includes(q) || mat.nome.toLowerCase().includes(q)) {
          html += `
            <div style="padding: 12px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="fecharModal(); abrirProva('${sim.url}')">
              <strong>${mat.nome}</strong>: ${sim.titulo}
            </div>
          `;
        }
      });
    });
  });
  resultados.innerHTML = html || '<p style="color:var(--text-muted); padding:10px;">Nenhum simulado encontrado.</p>';
}

function abrirCalendarioInterativo() {
  const modal = document.getElementById('modal-container');
  const box = document.getElementById('modal-box-content');
  box.innerHTML = `
    <h2><i class="ph-duotone ph-calendar-blank"></i> Calendário de Provas</h2>
    <p>Acompanhe suas datas e revisões agendadas para o ciclo 2026.</p>
    <button class="btn-modal-close" onclick="fecharModal()">Fechar</button>
  `;
  modal.style.display = 'flex';
}

/* Funções Auxiliares de Estudo */
function dispararConfete() {
  if (typeof confetti === 'function') {
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
  }
}

function exportarParaPDF(elementoId, nomeArquivo = 'relatorio.pdf') {
  const el = document.getElementById(elementoId);
  if(el && typeof html2pdf !== 'undefined') {
    html2pdf().set({ margin: 10, filename: nomeArquivo }).from(el).save();
  }
}
