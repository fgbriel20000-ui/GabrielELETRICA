/* =========================================================
   GS ELÉTRICA — LÓGICA DA AGENDA
   ========================================================= */

(function () {
    const CHAVE_AGENDA = 'gs-agenda';
    const MINUTOS_ANTECEDENCIA = 30; // avisa quando faltar esse tempo pro compromisso

    const cardProximo = document.getElementById('card-proximo');
    const lista = document.getElementById('lista-compromissos');
    const avisoNotificacao = document.getElementById('aviso-notificacao');

    function obterCompromissos() {
        return JSON.parse(localStorage.getItem(CHAVE_AGENDA) || '[]');
    }

    function salvarCompromissos(lista) {
        localStorage.setItem(CHAVE_AGENDA, JSON.stringify(lista));
    }

    function ordenados() {
        return obterCompromissos()
            .slice()
            .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
    }

    function formatarDataHora(iso) {
        const d = new Date(iso);
        return d.toLocaleString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' });
    }

    function formatarContagem(iso) {
        const diffMs = new Date(iso) - new Date();
        if (diffMs <= 0) return 'Agora';
        const minutos = Math.floor(diffMs / 60000);
        if (minutos < 60) return `Em ${minutos} min`;
        const horas = Math.floor(minutos / 60);
        if (horas < 24) return `Em ${horas}h${minutos % 60 ? ' ' + (minutos % 60) + 'min' : ''}`;
        const dias = Math.floor(horas / 24);
        return `Em ${dias} dia${dias > 1 ? 's' : ''}`;
    }

    function renderizarProximo() {
        const futuros = ordenados().filter(c => new Date(c.dataHora) >= new Date());
        const proximo = futuros[0];

        if (!proximo) {
            cardProximo.innerHTML = `
                <div class="card-proximo">
                    <p class="rotulo">Próximo trabalho</p>
                    <h2>Nenhum compromisso agendado</h2>
                    <p>Clique em "+ Novo compromisso" pra marcar o próximo serviço.</p>
                </div>`;
            return;
        }

        cardProximo.innerHTML = `
            <div class="card-proximo">
                <p class="rotulo">Próximo trabalho</p>
                <h2>${proximo.titulo}</h2>
                <p>📍 ${proximo.local || 'Local não informado'}</p>
                <p>👤 ${proximo.cliente || 'Cliente não informado'}</p>
                <p>🕒 ${formatarDataHora(proximo.dataHora)}</p>
                <span class="contagem">${formatarContagem(proximo.dataHora)}</span>
            </div>`;
    }

    function renderizarLista() {
        const compromissos = ordenados();

        if (compromissos.length === 0) {
            lista.innerHTML = `<div class="estado-vazio">📅 Nenhum compromisso marcado ainda.</div>`;
            return;
        }

        lista.innerHTML = compromissos.map(c => {
            const data = new Date(c.dataHora);
            const passado = data < new Date();
            return `
                <div class="card item-compromisso ${passado ? 'item-passado' : ''}">
                    <div class="item-data">
                        <div class="dia">${String(data.getDate()).padStart(2, '0')}</div>
                        <div class="mes">${data.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}</div>
                    </div>
                    <div class="item-info">
                        <h4>${c.titulo}</h4>
                        <p>📍 ${c.local || 'Local não informado'} • 👤 ${c.cliente || 'Cliente não informado'} • ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div class="item-acoes">
                        <button data-acao="excluir" data-id="${c.id}" aria-label="Excluir compromisso">🗑️</button>
                    </div>
                </div>`;
        }).join('');
    }

    function renderizarTudo() {
        renderizarProximo();
        renderizarLista();
    }

    lista.addEventListener('click', function (e) {
        const botao = e.target.closest('button[data-acao="excluir"]');
        if (!botao) return;
        const restantes = obterCompromissos().filter(c => c.id !== botao.dataset.id);
        salvarCompromissos(restantes);
        renderizarTudo();
    });

    document.getElementById('btn-novo-compromisso').addEventListener('click', function () {
        const corpo = `
            <div class="campo"><label>Serviço / título</label><input type="text" id="novo-titulo" required></div>
            <div class="campo"><label>Cliente</label><input type="text" id="novo-cliente"></div>
            <div class="campo"><label>Local</label><input type="text" id="novo-local"></div>
            <div class="linha-campos">
                <div class="campo"><label>Data</label><input type="date" id="novo-data" required></div>
                <div class="campo"><label>Hora</label><input type="time" id="novo-hora" required></div>
            </div>
        `;
        const rodape = `
            <button class="btn btn-contorno" onclick="fecharModalGS()">Cancelar</button>
            <button class="btn btn-primario" id="btn-salvar-compromisso">Salvar</button>
        `;
        abrirModalGS('Novo compromisso', corpo, rodape);

        document.getElementById('btn-salvar-compromisso').addEventListener('click', function () {
            const titulo = document.getElementById('novo-titulo').value.trim();
            const data = document.getElementById('novo-data').value;
            const hora = document.getElementById('novo-hora').value;

            if (!titulo || !data || !hora) {
                alert('Preencha ao menos o serviço, a data e a hora.');
                return;
            }

            const compromissos = obterCompromissos();
            compromissos.push({
                id: `compromisso-${Date.now()}`,
                titulo,
                cliente: document.getElementById('novo-cliente').value.trim(),
                local: document.getElementById('novo-local').value.trim(),
                dataHora: new Date(`${data}T${hora}`).toISOString(),
                notificado: false
            });
            salvarCompromissos(compromissos);

            fecharModalGS();
            renderizarTudo();
        });
    });

    /* ===== Notificações do navegador ===== */
    function configurarNotificacoes() {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'default') {
            avisoNotificacao.style.display = 'flex';
        }

        document.getElementById('btn-ativar-notificacao')?.addEventListener('click', function () {
            Notification.requestPermission().then(permissao => {
                if (permissao === 'granted') {
                    avisoNotificacao.style.display = 'none';
                    new Notification('GS Elétrica', { body: 'Notificações ativadas! Você será avisado antes de cada trabalho.' });
                }
            });
        });

        // Verifica a cada minuto se algum compromisso está próximo
        setInterval(verificarCompromissosProximos, 60 * 1000);
        verificarCompromissosProximos();
    }

    function verificarCompromissosProximos() {
        if (Notification.permission !== 'granted') return;

        const compromissos = obterCompromissos();
        const agora = new Date();
        let alterou = false;

        compromissos.forEach(c => {
            if (c.notificado) return;
            const minutosRestantes = (new Date(c.dataHora) - agora) / 60000;

            if (minutosRestantes > 0 && minutosRestantes <= MINUTOS_ANTECEDENCIA) {
                new Notification('Próximo trabalho em breve', {
                    body: `${c.titulo}${c.local ? ' — ' + c.local : ''} em ${Math.round(minutosRestantes)} min.`
                });
                c.notificado = true;
                alterou = true;
            }
        });

        if (alterou) salvarCompromissos(compromissos);
    }

    // Atualiza a contagem do próximo compromisso a cada minuto, sem precisar recarregar a página
    setInterval(renderizarProximo, 60 * 1000);

    configurarNotificacoes();
    renderizarTudo();
})();
