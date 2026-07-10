/* =========================================================
   GS ELÉTRICA — LÓGICA DA PÁGINA DE CLIENTES
   ========================================================= */

(function () {
    const CHAVE_CLIENTES = 'gs-clientes';
    const CHAVE_HISTORICO = 'gs-historico-orcamentos';

    const grade = document.getElementById('grade-clientes');
    const campoBusca = document.getElementById('busca-cliente');

    function obterClientesManuais() {
        return JSON.parse(localStorage.getItem(CHAVE_CLIENTES) || '[]');
    }

    function salvarClientesManuais(lista) {
        localStorage.setItem(CHAVE_CLIENTES, JSON.stringify(lista));
    }

    function obterHistorico() {
        return JSON.parse(localStorage.getItem(CHAVE_HISTORICO) || '[]');
    }

    function normalizarTelefone(telefone) {
        return (telefone || '').replace(/\D/g, '');
    }

    // Junta clientes cadastrados manualmente com clientes que já têm orçamento gerado,
    // evitando duplicar pelo número de telefone.
    function listaCompletaDeClientes() {
        const manuais = obterClientesManuais().map(c => ({ ...c, origem: 'manual' }));
        const historico = obterHistorico();

        const telefonesJaListados = new Set(manuais.map(c => normalizarTelefone(c.telefone)));
        const derivadosDeOrcamentos = [];

        historico.forEach(registro => {
            const tel = normalizarTelefone(registro.cliente.telefone);
            if (!tel || telefonesJaListados.has(tel)) return;
            telefonesJaListados.add(tel);
            derivadosDeOrcamentos.push({
                id: `orc-${tel}`,
                nome: registro.cliente.nome,
                telefone: registro.cliente.telefone,
                cpf: registro.cliente.cpf,
                endereco: registro.cliente.endereco,
                origem: 'orcamento'
            });
        });

        return [...manuais, ...derivadosDeOrcamentos];
    }

    function iniciais(nome) {
        const partes = nome.trim().split(' ').filter(Boolean);
        if (partes.length === 0) return '?';
        if (partes.length === 1) return partes[0][0].toUpperCase();
        return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }

    function historicoDoCliente(telefone) {
        const tel = normalizarTelefone(telefone);
        return obterHistorico().filter(r => normalizarTelefone(r.cliente.telefone) === tel);
    }

    function renderizar(filtro = '') {
        const clientes = listaCompletaDeClientes().filter(c => {
            const alvo = `${c.nome} ${c.telefone}`.toLowerCase();
            return alvo.includes(filtro.toLowerCase());
        });

        if (clientes.length === 0) {
            grade.innerHTML = `<div class="estado-vazio">👥 Nenhum cliente encontrado. Cadastre um novo cliente ou gere um orçamento.</div>`;
            return;
        }

        grade.innerHTML = clientes.map(c => `
            <div class="card card-cliente">
                <div class="card-cliente-topo">
                    <div class="avatar-cliente">${iniciais(c.nome)}</div>
                    <div>
                        <h3>${c.nome}</h3>
                        <p>${c.telefone}</p>
                    </div>
                </div>
                <p>${c.endereco || 'Endereço não informado'}</p>
                <div class="card-cliente-acoes">
                    <button class="link-acao" data-acao="historico" data-telefone="${c.telefone}" data-nome="${c.nome}">Ver histórico</button>
                    ${c.origem === 'manual' ? `<button class="link-acao excluir" data-acao="excluir" data-id="${c.id}">Excluir</button>` : ''}
                </div>
            </div>
        `).join('');
    }

    campoBusca.addEventListener('input', () => renderizar(campoBusca.value));

    grade.addEventListener('click', function (e) {
        const botao = e.target.closest('button[data-acao]');
        if (!botao) return;

        if (botao.dataset.acao === 'historico') {
            mostrarHistorico(botao.dataset.nome, botao.dataset.telefone);
        }

        if (botao.dataset.acao === 'excluir') {
            const lista = obterClientesManuais().filter(c => c.id !== botao.dataset.id);
            salvarClientesManuais(lista);
            renderizar(campoBusca.value);
        }
    });

    function mostrarHistorico(nome, telefone) {
        const registros = historicoDoCliente(telefone);

        const corpo = registros.length
            ? `<ul class="lista-historico">${registros.map(r => `
                <li>
                    <span>Orçamento ${r.numero} — ${r.servico.descricao.slice(0, 40)}${r.servico.descricao.length > 40 ? '…' : ''}</span>
                    <strong>${Number(r.servico.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                </li>`).join('')}</ul>`
            : `<p class="texto-claro">Nenhum orçamento gerado para este cliente ainda.</p>`;

        abrirModalGS(`Histórico — ${nome}`, corpo, `<button class="btn btn-contorno" onclick="fecharModalGS()">Fechar</button>`);
    }

    document.getElementById('btn-novo-cliente').addEventListener('click', function () {
        const corpo = `
            <div class="campo"><label>Nome</label><input type="text" id="novo-nome" required></div>
            <div class="campo"><label>Telefone</label><input type="tel" id="novo-telefone" placeholder="(00) 00000-0000" required></div>
            <div class="campo"><label>CPF</label><input type="text" id="novo-cpf" placeholder="000.000.000-00"></div>
            <div class="campo"><label>Endereço</label><input type="text" id="novo-endereco"></div>
        `;
        const rodape = `
            <button class="btn btn-contorno" onclick="fecharModalGS()">Cancelar</button>
            <button class="btn btn-primario" id="btn-salvar-cliente">Salvar</button>
        `;
        abrirModalGS('Novo cliente', corpo, rodape);

        document.getElementById('btn-salvar-cliente').addEventListener('click', function () {
            const nome = document.getElementById('novo-nome').value.trim();
            const telefone = document.getElementById('novo-telefone').value.trim();
            if (!nome || !telefone) {
                alert('Preencha ao menos nome e telefone.');
                return;
            }

            const lista = obterClientesManuais();
            lista.unshift({
                id: `manual-${Date.now()}`,
                nome,
                telefone,
                cpf: document.getElementById('novo-cpf').value.trim(),
                endereco: document.getElementById('novo-endereco').value.trim()
            });
            salvarClientesManuais(lista);

            fecharModalGS();
            renderizar(campoBusca.value);
        });
    });

    renderizar();
})();
