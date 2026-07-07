import { BerserkDB } from './db.js';

const SENHA_ADMIN = "berserk123";
let isAdmin = false;

window.globalState = { jogadores: [], treinos: [], calendario: [], estatisticas: {}, financeiro: {}, materiais: [], patrocinios: [] }; 

const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const toggleRoleBtn = document.getElementById('toggleRoleBtn');
const roleLabel = document.getElementById('roleLabel');

toggleRoleBtn.addEventListener('click', () => {
    if (!isAdmin) {
        const inputSenha = prompt("🛡️ Digite a senha master para acessar o Modo Administrador:");
        if (inputSenha === SENHA_ADMIN) {
            isAdmin = true;
            alert("Acesso concedido!");
        } else {
            alert("❌ Senha incorreta!");
            return;
        }
    } else {
        isAdmin = false;
        alert("Você saiu do modo Administrador.");
    }
    updateSystemView();
});

function updateSystemView() {
    const adminElements = document.querySelectorAll('.admin-only');
    if (isAdmin) {
        roleLabel.innerHTML = 'Modo: <strong style="color: #e63946;">Admin</strong>';
        toggleRoleBtn.textContent = 'Sair do Admin';
        adminElements.forEach(el => el.style.display = 'block');
    } else {
        roleLabel.innerHTML = 'Modo: <strong>Visitante</strong>';
        toggleRoleBtn.textContent = 'Área do Admin';
        adminElements.forEach(el => el.style.display = 'none');
        if (document.getElementById('admin').classList.contains('active')) {
            document.querySelector('[data-tab="dashboard"]').click();
        }
    }
    renderUI(); 
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
        sidebar.classList.remove('open');
    });
});
menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

async function carregarDados() {
    try {
        const [jogadores, treinos, calendario, materiais, patrocinios, estatisticas, financeiro] = await Promise.all([
            BerserkDB.getItems('jogadores'),
            BerserkDB.getItems('treinos'),
            BerserkDB.getItems('calendario'),
            BerserkDB.getItems('materiais'),
            BerserkDB.getItems('patrocinios'),
            BerserkDB.getEstatisticas(),
            BerserkDB.getFinanceiro()
        ]);
        window.globalState = { jogadores, treinos, calendario, materiais, patrocinios, estatisticas, financeiro };
        renderUI();
    } catch (erro) {
        console.error(erro);
        alert("Erro ao buscar dados do servidor Firebase: " + erro.message);
    }
}

function renderUI(filtroJogador = '', filtroTreino = '') {
    const { jogadores, treinos, calendario, materiais, patrocinios, estatisticas, financeiro } = window.globalState;

    document.getElementById('dash-players-count').textContent = jogadores.length;
    document.getElementById('dash-sponsors-count').textContent = patrocinios.length;
    document.getElementById('dash-balance').textContent = `R$ ${Number(financeiro.caixa).toFixed(2).replace('.', ',')}`;

    // LÓGICA DO PRÓXIMO TREINO NO DASHBOARD
    const treinosAgendados = treinos.filter(t => t.status === 'Agendado' && t.data && t.hora);
    let proximoTreino = null;
    
    if (treinosAgendados.length > 0) {
        const agora = new Date();
        // Pega só os que a data/hora combinadas são maiores que o momento atual
        const futuros = treinosAgendados.filter(t => new Date(`${t.data}T${t.hora}`) >= agora);
        // Ordena do mais perto pro mais longe
        futuros.sort((a, b) => new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`));
        
        if (futuros.length > 0) proximoTreino = futuros[0];
    }

    const txtProximo = document.getElementById('dash-next-training');
    if (proximoTreino) {
        const [ano, mes, dia] = proximoTreino.data.split('-');
        txtProximo.textContent = `${dia}/${mes}/${ano} às ${proximoTreino.hora}`;
        txtProximo.style.fontSize = '1.2rem';
    } else {
        txtProximo.textContent = 'Todos os treinos já foram completos até agora';
        txtProximo.style.fontSize = '1rem';
    }

    // JOGADORES
    const pList = document.getElementById('playersList');
    pList.innerHTML = '';
    const jFiltro = filtroJogador.toLowerCase();
    const jogadoresFiltrados = jogadores.filter(j => j.nome.toLowerCase().includes(jFiltro) || j.apelido.toLowerCase().includes(jFiltro));
    
    if(jogadoresFiltrados.length === 0) pList.innerHTML = '<p style="color:var(--text-muted)">Nenhum jogador encontrado.</p>';
    
    jogadoresFiltrados.forEach(j => {
        let statusCor = j.status === 'Ativo' ? '#2a9d8f' : (j.status === 'Inativo' ? '#e63946' : '#e9c46a');
        pList.innerHTML += `
            <div class="player-card" style="border-top: 3px solid ${statusCor};">
                <span class="player-number">#${j.numero}</span>
                <h3>${j.nome}</h3>
                <p style="color: var(--text-muted); font-style: italic;">"${j.apelido}"</p>
                <p style="color: var(--primary-color); font-weight: bold; margin-top: 5px;">${j.posicao}</p>
                <p style="margin-top: 5px; font-size: 0.9rem; color: var(--text-muted)">Altura: ${j.altura} | Idade: ${j.idade}</p>
                <p style="font-size: 0.8rem; color: ${statusCor}; margin-top: 5px; font-weight: bold;">Status: ${j.status}</p>
                
                <div style="display:flex; gap: 5px; margin-top: 15px;">
                    <button class="btn-role" style="flex:1;" onclick="abrirAvaliacao('${j.id}')">📊 Avaliação</button>
                    ${isAdmin ? `<button class="btn-role" onclick="abrirEdicao('${j.id}')">✏️</button>
                                 <button class="btn-danger" onclick="deleteGlobalItem('jogadores', '${j.id}')">X</button>` : ''}
                </div>
            </div>`;
    });

    // TREINOS
    const tList = document.getElementById('treinosList');
    tList.innerHTML = '';
    const tFiltro = filtroTreino.toLowerCase();
    // Filtro busca por data ou foco
    const treinosFiltrados = treinos.filter(t => (t.data && t.data.includes(tFiltro)) || t.foco.toLowerCase().includes(tFiltro));

    if(treinosFiltrados.length === 0) tList.innerHTML = '<p style="color:var(--text-muted)">Nenhum treino encontrado.</p>';

    treinosFiltrados.forEach(t => {
        let statusBadge = t.status === 'Concluido' 
            ? `<span style="background: #2a9d8f; color: white;" class="status-badge">✅ Concluído</span>`
            : `<span style="background: #e9c46a; color: black;" class="status-badge">⏳ Agendado</span>`;
            
        // Formata data YYYY-MM-DD para DD/MM/YYYY
        let dataVisual = "Sem data";
        if (t.data) {
            const [a, m, d] = t.data.split('-');
            dataVisual = `${d}/${m}/${a}`;
        }

        let selectEdicaoStatus = isAdmin ? `
            <select onchange="atualizarStatusTreino('${t.id}', this.value)" style="margin-left:10px; background:var(--bg-dark); color:var(--text-main); border:1px solid var(--border-color); border-radius:4px; padding:2px;">
                <option value="Agendado" ${t.status === 'Agendado' ? 'selected' : ''}>Mudar para Agendado</option>
                <option value="Concluido" ${t.status === 'Concluido' ? 'selected' : ''}>Mudar para Concluído</option>
            </select>` : '';

        let chamadaHTML = `<div class="chamada-header" onclick="toggleChamada('chamada-${t.id}')">
                            <span style="font-weight:bold; color:var(--primary-color)">📋 Lista de Presença (${jogadores.length} jogadores)</span>
                            <span>▼</span>
                           </div>
                           <div id="chamada-${t.id}" class="chamada-content">`;
        
        if (jogadores.length === 0) chamadaHTML += `<p>Nenhum jogador para listar.</p>`;
        
        jogadores.forEach(j => {
            const statusChamada = t.chamada ? t.chamada[j.id] : '';
            let exibirStatus = statusChamada === 'presente' ? '✅ Presente' : (statusChamada === 'faltou' ? '❌ Faltou' : (statusChamada === 'justificado' ? '⚠️ Justificado' : '⚪ Não Marcado'));
            
            chamadaHTML += `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px; font-size:0.9rem; border-bottom: 1px solid var(--border-color); padding-bottom: 5px;">
                    <span>${j.nome} (${j.apelido})</span>
                    ${isAdmin ? `
                    <select onchange="atualizarPresenca('${t.id}', '${j.id}', this.value)" style="width: auto; padding: 4px; font-size: 0.85rem; border:none;">
                        <option value="" ${statusChamada===''?'selected':''}>Não Marcado</option>
                        <option value="presente" ${statusChamada==='presente'?'selected':''}>✅ Presente</option>
                        <option value="faltou" ${statusChamada==='faltou'?'selected':''}>❌ Faltou</option>
                        <option value="justificado" ${statusChamada==='justificado'?'selected':''}>⚠️ Não pode ir</option>
                    </select>` : `<span style="font-size:0.85rem; color:var(--text-muted)">${exibirStatus}</span>`}
                </div>`;
        });
        chamadaHTML += `</div>`;

        tList.innerHTML += `
            <div class="panel" style="margin-bottom: 15px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <strong style="font-size:1.1rem">${dataVisual} às ${t.hora}</strong> ${statusBadge} ${selectEdicaoStatus}<br>
                        <span style="color:var(--text-muted)">Prof. ${t.professor} | Local: ${t.local}</span><br>
                        <span style="color:var(--text-main); margin-top:5px; display:inline-block;">Foco: ${t.foco}</span>
                    </div>
                    ${isAdmin ? `<button class="btn-danger" style="padding: 5px 10px;" onclick="deleteGlobalItem('treinos', '${t.id}')">Excluir</button>` : ''}
                </div>
                ${chamadaHTML}
            </div>`;
    });

    // CALENDÁRIO
    const cList = document.getElementById('calendarioList');
    cList.innerHTML = calendario.length === 0 ? '<p style="color:var(--text-muted)">Nenhum jogo marcado.</p>' : '';
    calendario.forEach(c => {
        let dataSplit = c.data.split('/');
        let diaVisual = dataSplit[0] || 'Dia';
        let mesVisual = dataSplit[1] ? `Mês ${dataSplit[1]}` : '';

        cList.innerHTML += `
            <div class="calendar-card">
                <div class="calendar-date-block">
                    <span>${diaVisual}</span>
                    <span>${mesVisual}</span>
                </div>
                <div class="calendar-details">
                    <h3>${c.adversario}</h3>
                    <p>${c.tipo} • ${c.hora}</p>
                </div>
                ${isAdmin ? `<div style="padding:15px; display:flex; align-items:center;"><button class="btn-danger" onclick="deleteGlobalItem('calendario', '${c.id}')">Apagar</button></div>` : ''}
            </div>`;
    });

    // OUTROS
    document.getElementById('view-vitorias').textContent = estatisticas.vitorias;
    document.getElementById('view-derrotas').textContent = estatisticas.derrotas;
    const totalJogos = Number(estatisticas.vitorias) + Number(estatisticas.derrotas);
    document.getElementById('view-aproveitamento').textContent = totalJogos > 0 ? `${Math.round((estatisticas.vitorias / totalJogos) * 100)}%` : '0%';
    document.getElementById('view-receita').textContent = financeiro.receita;
    document.getElementById('view-custo').textContent = financeiro.proximoCusto;

    const mList = document.getElementById('materiaisList');
    mList.innerHTML = materiais.length === 0 ? '<p style="color:var(--text-muted)">Inventário vazio.</p>' : '';
    materiais.forEach(m => {
        mList.innerHTML += `<li style="padding: 10px; border-bottom: 1px solid var(--border-color); display:flex; justify-content:space-between;"><div>🏐 ${m.item}: <strong>${m.quantidade}</strong></div>${isAdmin ? `<button class="btn-danger" onclick="deleteGlobalItem('materiais', '${m.id}')">Excluir</button>` : ''}</li>`;
    });

    const patList = document.getElementById('patrociniosList');
    patList.innerHTML = patrocinios.length === 0 ? '<p style="color:var(--text-muted)">Sem patrocinadores.</p>' : '';
    patrocinios.forEach(p => {
        patList.innerHTML += `<div class="card"><h3>${p.nome}</h3><p style="color:var(--text-muted); margin-top:5px;">${p.beneficio}</p>${isAdmin ? `<button class="btn-danger mt-1" onclick="deleteGlobalItem('patrocinios', '${p.id}')">Remover</button>` : ''}</div>`;
    });
}

// FILTROS
document.getElementById('searchJogador').addEventListener('input', (e) => { renderUI(e.target.value, document.getElementById('searchTreino').value); });
document.getElementById('searchTreino').addEventListener('input', (e) => { renderUI(document.getElementById('searchJogador').value, e.target.value); });

// TOGGLE CHAMADA
window.toggleChamada = function(id) {
    const content = document.getElementById(id);
    if(content) content.classList.toggle('open');
}

// ATUALIZAR STATUS DO TREINO DIRETO DA LISTA
window.atualizarStatusTreino = async function(treinoId, novoStatus) {
    if(!isAdmin) { alert("❌ Acesso negado!"); return; }
    try {
        await BerserkDB.updateItem('treinos', treinoId, { status: novoStatus });
        const treino = window.globalState.treinos.find(t => t.id === treinoId);
        if(treino) treino.status = novoStatus;
        renderUI(); // Re-renderiza para atualizar as badges e o Dashboard
    } catch(erro) { alert("Erro ao atualizar status: " + erro.message); }
}

/* ================= TRAVAS DE SEGURANÇA NOS FORMULÁRIOS ================= */

document.getElementById('playerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!isAdmin) { alert("❌ Acesso negado! Apenas o administrador pode salvar dados."); return; }
    try {
        await BerserkDB.addItem('jogadores', {
            nome: document.getElementById('playerName').value,
            apelido: document.getElementById('playerApelido').value,
            idade: document.getElementById('playerIdade').value,
            numero: document.getElementById('playerNumber').value,
            posicao: document.getElementById('playerPosition').value,
            altura: document.getElementById('playerHeight').value,
            status: document.getElementById('playerStatus').value,
            avaliacao: { saque: 0, passe: 0, ataque: 0, bloqueio: 0, geral: "", melhorar: "", video: "" }
        });
        e.target.reset(); carregarDados(); alert("Jogador salvo!");
    } catch(erro) { alert("Erro: " + erro.message); }
});

document.getElementById('treinoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!isAdmin) { alert("❌ Acesso negado!"); return; }
    try {
        await BerserkDB.addItem('treinos', {
            data: document.getElementById('treinoData').value,
            hora: document.getElementById('treinoHora').value,
            foco: document.getElementById('treinoFoco').value,
            local: document.getElementById('treinoLocal').value,
            professor: document.getElementById('treinoProf').value,
            status: document.getElementById('treinoStatus').value,
            chamada: {}
        });
        e.target.reset(); carregarDados(); alert("Treino salvo!");
    } catch(erro) { alert("Erro: " + erro.message); }
});

document.getElementById('calendarioForm').addEventListener('submit', async (e) => { 
    e.preventDefault(); 
    if (!isAdmin) { alert("❌ Acesso negado!"); return; }
    try { await BerserkDB.addItem('calendario', { data: document.getElementById('calData').value, adversario: document.getElementById('calAdversario').value, tipo: document.getElementById('calTipo').value, hora: document.getElementById('calHora').value }); e.target.reset(); carregarDados(); } catch(err) { alert(err.message); }
});

document.getElementById('estatisticasForm').addEventListener('submit', async (e) => { 
    e.preventDefault(); 
    if (!isAdmin) { alert("❌ Acesso negado!"); return; }
    try { await BerserkDB.updateEstatisticas({ vitorias: Number(document.getElementById('estVitorias').value), derrotas: Number(document.getElementById('estDerrotas').value) }); e.target.reset(); carregarDados(); } catch(err) { alert(err.message); }
});

document.getElementById('financeiroForm').addEventListener('submit', async (e) => { 
    e.preventDefault(); 
    if (!isAdmin) { alert("❌ Acesso negado!"); return; }
    try { await BerserkDB.updateFinanceiro({ caixa: Number(document.getElementById('finCaixa').value), receita: document.getElementById('finReceita').value, proximoCusto: document.getElementById('finCusto').value }); e.target.reset(); carregarDados(); } catch(err) { alert(err.message); }
});

document.getElementById('materialForm').addEventListener('submit', async (e) => { 
    e.preventDefault(); 
    if (!isAdmin) { alert("❌ Acesso negado!"); return; }
    try { await BerserkDB.addItem('materiais', { item: document.getElementById('matItem').value, quantidade: document.getElementById('matQtd').value }); e.target.reset(); carregarDados(); } catch(err) { alert(err.message); }
});

document.getElementById('patrocinioForm').addEventListener('submit', async (e) => { 
    e.preventDefault(); 
    if (!isAdmin) { alert("❌ Acesso negado!"); return; }
    try { await BerserkDB.addItem('patrocinios', { nome: document.getElementById('patNome').value, beneficio: document.getElementById('patBeneficio').value }); e.target.reset(); carregarDados(); } catch(err) { alert(err.message); }
});

window.deleteGlobalItem = async function(collection, id) {
    if(!isAdmin) { alert("❌ Acesso negado!"); return; }
    if(confirm("Deseja remover permanentemente este item?")) {
        try { await BerserkDB.deleteItem(collection, id); carregarDados(); } catch(erro) { alert("Erro: " + erro.message); }
    }
};

window.atualizarPresenca = async function(treinoId, jogadorId, status) {
    if(!isAdmin) { alert("❌ Acesso negado!"); return; }
    try {
        const treino = window.globalState.treinos.find(t => t.id === treinoId);
        let chamadaAtual = treino.chamada || {};
        chamadaAtual[jogadorId] = status;
        await BerserkDB.updateItem('treinos', treinoId, { chamada: chamadaAtual });
        treino.chamada = chamadaAtual; 
    } catch (erro) { alert("Erro ao marcar presença: " + erro.message); }
};

/* ================= LÓGICA DAS JANELAS MODAIS ================= */

window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// MODAL EDIÇÃO
window.abrirEdicao = function(id) {
    if(!isAdmin) { alert("❌ Acesso negado!"); return; }
    const j = window.globalState.jogadores.find(x => x.id === id);
    if(!j) return;
    
    document.getElementById('editPlayerId').value = j.id;
    document.getElementById('editPlayerName').value = j.nome;
    document.getElementById('editPlayerApelido').value = j.apelido;
    document.getElementById('editPlayerIdade').value = j.idade;
    document.getElementById('editPlayerNumber').value = j.numero;
    document.getElementById('editPlayerPosition').value = j.posicao;
    document.getElementById('editPlayerHeight').value = j.altura;
    document.getElementById('editPlayerStatus').value = j.status;
    
    document.getElementById('modalEditOverlay').classList.add('active');
}

document.getElementById('editPlayerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!isAdmin) { alert("❌ Acesso negado!"); return; }
    const id = document.getElementById('editPlayerId').value;
    try {
        await BerserkDB.updateItem('jogadores', id, {
            nome: document.getElementById('editPlayerName').value,
            apelido: document.getElementById('editPlayerApelido').value,
            idade: document.getElementById('editPlayerIdade').value,
            numero: document.getElementById('editPlayerNumber').value,
            posicao: document.getElementById('editPlayerPosition').value,
            altura: document.getElementById('editPlayerHeight').value,
            status: document.getElementById('editPlayerStatus').value
        });
        closeModal('modalEditOverlay');
        carregarDados();
        alert('Informações atualizadas!');
    } catch (erro) { alert("Erro: " + erro.message); }
});

// MODAL AVALIAÇÃO
window.abrirAvaliacao = function(id) {
    const j = window.globalState.jogadores.find(x => x.id === id);
    if(!j) return;

    document.getElementById('avNameTitle').textContent = `Avaliação: ${j.nome}`;
    const av = j.avaliacao || { saque: 0, passe: 0, ataque: 0, bloqueio: 0, geral: "Sem dados", melhorar: "Sem dados", video: "" };

    const viewHTML = `
        <div style="margin-bottom: 20px;">
            <p><strong>Saque:</strong> ${av.saque}/10 <div class="stat-bar-container"><div class="stat-bar-fill" style="width: ${av.saque*10}%"></div></div></p>
            <p style="margin-top:10px;"><strong>Passe/Recepção:</strong> ${av.passe}/10 <div class="stat-bar-container"><div class="stat-bar-fill" style="width: ${av.passe*10}%"></div></div></p>
            <p style="margin-top:10px;"><strong>Ataque:</strong> ${av.ataque}/10 <div class="stat-bar-container"><div class="stat-bar-fill" style="width: ${av.ataque*10}%"></div></div></p>
            <p style="margin-top:10px;"><strong>Bloqueio:</strong> ${av.bloqueio}/10 <div class="stat-bar-container"><div class="stat-bar-fill" style="width: ${av.bloqueio*10}%"></div></div></p>
        </div>
        <div style="background: var(--bg-dark); padding: 15px; border-radius: 6px;">
            <p style="color:var(--text-muted)"><strong>Geral:</strong> ${av.geral}</p>
            <p style="color:var(--primary-color); margin-top: 10px;"><strong>A Melhorar:</strong> ${av.melhorar}</p>
            ${av.video ? `<a href="${av.video}" target="_blank" style="display:inline-block; margin-top:10px; color: #4dabf7; text-decoration: none;">▶️ Assistir Vídeo Recomendado</a>` : ''}
        </div>
    `;
    document.getElementById('avViewContent').innerHTML = viewHTML;

    if (isAdmin) {
        document.getElementById('avEditForm').style.display = 'block';
        document.getElementById('avPlayerId').value = j.id;
        document.getElementById('avSaque').value = av.saque;
        document.getElementById('avPasse').value = av.passe;
        document.getElementById('avAtaque').value = av.ataque;
        document.getElementById('avBloqueio').value = av.bloqueio;
        document.getElementById('avGeral').value = av.geral;
        document.getElementById('avMelhorar').value = av.melhorar;
        document.getElementById('avVideo').value = av.video;
    } else {
        document.getElementById('avEditForm').style.display = 'none';
    }

    document.getElementById('modalAvaliacaoOverlay').classList.add('active');
}

document.getElementById('avEditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!isAdmin) { alert("❌ Acesso negado!"); return; }
    
    const id = document.getElementById('avPlayerId').value;
    const novaAvaliacao = {
        saque: Number(document.getElementById('avSaque').value),
        passe: Number(document.getElementById('avPasse').value),
        ataque: Number(document.getElementById('avAtaque').value),
        bloqueio: Number(document.getElementById('avBloqueio').value),
        geral: document.getElementById('avGeral').value,
        melhorar: document.getElementById('avMelhorar').value,
        video: document.getElementById('avVideo').value
    };

    try {
        await BerserkDB.updateItem('jogadores', id, { avaliacao: novaAvaliacao });
        closeModal('modalAvaliacaoOverlay');
        carregarDados();
        alert('Avaliação do jogador atualizada!');
    } catch (erro) { alert("Erro: " + erro.message); }
});

updateSystemView();
carregarDados();