/* =========================================================
   GS ELÉTRICA — LÓGICA DA PÁGINA DE ORÇAMENTOS
   ========================================================= */

(function () {
    const CHAVE_HISTORICO = 'gs-historico-orcamentos';
    const CHAVE_CONTADOR = 'gs-contador-orcamentos';

    const form = document.getElementById('form-orcamento');
    const areaVazia = document.getElementById('of-vazio');
    const areaConteudo = document.getElementById('of-conteudo');
    const acoesPreview = document.getElementById('acoes-preview');

    function formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function formatarData(data) {
        return data.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function proximoNumeroDocumento() {
        const agora = new Date();
        const prefixo = `${agora.getFullYear()}${String(agora.getMonth() + 1).padStart(2, '0')}`;
        let contador = Number(localStorage.getItem(CHAVE_CONTADOR) || '0') + 1;
        localStorage.setItem(CHAVE_CONTADOR, String(contador));
        return `${prefixo}-${contador}`;
    }

    function salvarNoHistorico(registro) {
        const historico = JSON.parse(localStorage.getItem(CHAVE_HISTORICO) || '[]');
        historico.unshift(registro);
        localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(historico));
    }

    function listaFormasPagamento() {
        const formas = [];
        if (document.getElementById('pg-dinheiro').checked) formas.push('Dinheiro');
        if (document.getElementById('pg-cartao').checked) formas.push('Cartão de Crédito');
        if (document.getElementById('pg-boleto').checked) formas.push('Boleto');
        if (document.getElementById('pg-pix').checked) formas.push('Pix');
        return formas.join(' / ') || 'A combinar';
    }

    form.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const dados = {
            numero: proximoNumeroDocumento(),
            data: formatarData(new Date()),
            cliente: {
                nome: document.getElementById('cliente-nome').value.trim(),
                telefone: document.getElementById('cliente-telefone').value.trim(),
                cpf: document.getElementById('cliente-cpf').value.trim(),
                endereco: document.getElementById('cliente-endereco').value.trim()
            },
            servico: {
                descricao: document.getElementById('servico-descricao').value.trim(),
                valor: Number(document.getElementById('servico-valor').value || 0),
                local: document.getElementById('servico-local').value.trim()
            },
            validadeDias: Number(document.getElementById('validade-dias').value || 7),
            garantiaDias: Number(document.getElementById('garantia-dias').value || 90),
            formasPagamento: listaFormasPagamento(),
            observacoes: document.getElementById('observacoes').value.trim()
        };

        preencherPreview(dados);
        salvarNoHistorico(dados);
    });

    function preencherPreview(dados) {
        document.getElementById('of-numero').textContent = `Orçamento Nº ${dados.numero}`;
        document.getElementById('of-data').textContent = dados.data;

        document.getElementById('of-cliente-nome').textContent = dados.cliente.nome;
        document.getElementById('of-cliente-telefone').textContent = dados.cliente.telefone;
        document.getElementById('of-cliente-cpf').textContent = `CPF: ${dados.cliente.cpf}`;
        document.getElementById('of-cliente-endereco').textContent = dados.cliente.endereco;
        document.getElementById('of-servico-local').textContent = `Local do serviço: ${dados.servico.local}`;

        document.getElementById('of-servico-descricao').textContent = dados.servico.descricao;
        document.getElementById('of-servico-valor').textContent = formatarMoeda(dados.servico.valor);
        document.getElementById('of-total').textContent = formatarMoeda(dados.servico.valor);

        document.getElementById('of-condicoes').textContent =
            `Validade do orçamento: ${dados.validadeDias} dias • Garantia da mão de obra: ${dados.garantiaDias} dias • Formas de pagamento aceitas: ${dados.formasPagamento}`;

        document.getElementById('of-observacoes').textContent = dados.observacoes || 'Nenhuma observação adicional.';

        areaVazia.style.display = 'none';
        areaConteudo.style.display = 'block';
        acoesPreview.style.display = 'flex';
    }

    document.getElementById('btn-limpar').addEventListener('click', function () {
        form.reset();
        areaVazia.style.display = 'block';
        areaConteudo.style.display = 'none';
        acoesPreview.style.display = 'none';
    });

    document.getElementById('btn-imprimir').addEventListener('click', function () {
        window.print();
    });

    document.getElementById('btn-baixar-pdf').addEventListener('click', async function () {
        const botao = this;
        const textoOriginal = botao.textContent;
        botao.textContent = 'Gerando PDF...';
        botao.disabled = true;

        try {
            const folha = document.getElementById('folha-orcamento');
            const canvas = await html2canvas(folha, { scale: 2, backgroundColor: '#ffffff' });
            const imagem = canvas.toDataURL('image/png');

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ unit: 'mm', format: 'a4' });

            const larguraPdf = pdf.internal.pageSize.getWidth();
            const alturaImagem = (canvas.height * larguraPdf) / canvas.width;

            pdf.addImage(imagem, 'PNG', 0, 0, larguraPdf, alturaImagem);

            const numero = document.getElementById('of-numero').textContent.replace(/\D/g, '-');
            pdf.save(`orcamento-gs-eletrica-${numero || 'documento'}.pdf`);
        } catch (erro) {
            console.error('[GS Elétrica] Erro ao gerar PDF:', erro);
            alert('Não foi possível gerar o PDF. Tente novamente.');
        } finally {
            botao.textContent = textoOriginal;
            botao.disabled = false;
        }
    });
})();
