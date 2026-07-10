/* =========================================================
   GS ELÉTRICA — LÓGICA DA PÁGINA "MAIS"
   (Recibos, Biblioteca, Configurações)
   ========================================================= */

(function () {
    /* ===== Abas ===== */
    const botoesAba = document.querySelectorAll('.aba-botao');
    const paineis = document.querySelectorAll('.painel-aba');

    botoesAba.forEach(botao => {
        botao.addEventListener('click', () => {
            botoesAba.forEach(b => b.classList.remove('ativa'));
            paineis.forEach(p => p.classList.remove('ativa'));
            botao.classList.add('ativa');
            document.getElementById(`painel-${botao.dataset.aba}`).classList.add('ativa');
        });
    });

    /* ===== Recibos ===== */
    const CHAVE_CONTADOR_RECIBO = 'gs-contador-recibos';
    const CHAVE_HISTORICO_RECIBOS = 'gs-historico-recibos';

    const formRecibo = document.getElementById('form-recibo');
    const rcVazio = document.getElementById('rc-vazio');
    const rcConteudo = document.getElementById('rc-conteudo');
    const rcAcoes = document.getElementById('rc-acoes');

    function formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function proximoNumeroRecibo() {
        const contador = Number(localStorage.getItem(CHAVE_CONTADOR_RECIBO) || '0') + 1;
        localStorage.setItem(CHAVE_CONTADOR_RECIBO, String(contador));
        return `REC-${contador}`;
    }

    formRecibo.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const dados = {
            numero: proximoNumeroRecibo(),
            data: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            cliente: document.getElementById('rc-cliente').value.trim(),
            servico: document.getElementById('rc-servico').value.trim(),
            valor: Number(document.getElementById('rc-valor').value || 0),
            forma: document.getElementById('rc-forma').value
        };

        document.getElementById('rc-numero').textContent = `Recibo ${dados.numero}`;
        document.getElementById('rc-data').textContent = dados.data;
        document.getElementById('rc-out-cliente').textContent = dados.cliente;
        document.getElementById('rc-out-servico').textContent = dados.servico;
        document.getElementById('rc-out-valor').textContent = formatarMoeda(dados.valor);
        document.getElementById('rc-out-forma').textContent = `Forma de pagamento: ${dados.forma}`;

        rcVazio.style.display = 'none';
        rcConteudo.style.display = 'block';
        rcAcoes.style.display = 'flex';

        const historico = JSON.parse(localStorage.getItem(CHAVE_HISTORICO_RECIBOS) || '[]');
        historico.unshift(dados);
        localStorage.setItem(CHAVE_HISTORICO_RECIBOS, JSON.stringify(historico));
    });

    document.getElementById('btn-imprimir-recibo').addEventListener('click', () => window.print());

    document.getElementById('btn-baixar-recibo').addEventListener('click', async function () {
        const botao = this;
        const textoOriginal = botao.textContent;
        botao.textContent = 'Gerando PDF...';
        botao.disabled = true;

        try {
            const folha = document.getElementById('folha-recibo');
            const canvas = await html2canvas(folha, { scale: 2, backgroundColor: '#ffffff' });
            const imagem = canvas.toDataURL('image/png');

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
            const largura = pdf.internal.pageSize.getWidth();
            const altura = (canvas.height * largura) / canvas.width;

            pdf.addImage(imagem, 'PNG', 0, 0, largura, altura);
            pdf.save('recibo-gs-eletrica.pdf');
        } catch (erro) {
            console.error('[GS Elétrica] Erro ao gerar PDF do recibo:', erro);
            alert('Não foi possível gerar o PDF. Tente novamente.');
        } finally {
            botao.textContent = textoOriginal;
            botao.disabled = false;
        }
    });

    /* ===== Configurações: tema ===== */
    const checkTema = document.getElementById('config-tema-escuro');
    checkTema.checked = localStorage.getItem('gs-tema') === 'escuro';
    document.body.classList.toggle('dark-mode', checkTema.checked);

    checkTema.addEventListener('change', function () {
        document.body.classList.toggle('dark-mode', this.checked);
        localStorage.setItem('gs-tema', this.checked ? 'escuro' : 'claro');
    });

    /* ===== Configurações: backup e restauração ===== */
    const CHAVES_DADOS = [
        'gs-clientes',
        'gs-historico-orcamentos',
        'gs-contador-orcamentos',
        'gs-agenda',
        'gs-historico-recibos',
        'gs-contador-recibos',
        'gs-tema'
    ];

    document.getElementById('btn-exportar-backup').addEventListener('click', function () {
        const backup = {};
        CHAVES_DADOS.forEach(chave => {
            const valor = localStorage.getItem(chave);
            if (valor !== null) backup[chave] = valor;
        });

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup-gs-eletrica-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('input-importar-backup').addEventListener('change', function (evento) {
        const arquivo = evento.target.files[0];
        if (!arquivo) return;

        const leitor = new FileReader();
        leitor.onload = function () {
            try {
                const backup = JSON.parse(leitor.result);
                Object.keys(backup).forEach(chave => {
                    if (CHAVES_DADOS.includes(chave)) {
                        localStorage.setItem(chave, backup[chave]);
                    }
                });
                alert('Backup restaurado com sucesso! A página vai recarregar.');
                window.location.reload();
            } catch (erro) {
                console.error('[GS Elétrica] Erro ao importar backup:', erro);
                alert('Arquivo de backup inválido.');
            }
        };
        leitor.readAsText(arquivo);
    });

    document.getElementById('btn-limpar-dados').addEventListener('click', function () {
        const confirmar = confirm('Tem certeza? Isso vai apagar todos os clientes, orçamentos, recibos e compromissos deste aparelho. Essa ação não pode ser desfeita.');
        if (!confirmar) return;

        CHAVES_DADOS.forEach(chave => localStorage.removeItem(chave));
        alert('Dados apagados.');
        window.location.reload();
    });
})();
