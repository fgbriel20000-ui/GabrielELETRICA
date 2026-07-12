/* =========================================================
   GS ELÉTRICA — LÓGICA DA PÁGINA DE ORÇAMENTOS
   ========================================================= */

(function () {
    const CHAVE_HISTORICO = 'gs-historico-orcamentos';
    const CHAVE_CONTADOR = 'gs-contador-orcamentos';
    const CHAVE_ASSINATURA = 'gs-assinatura-eletricista';

    const form = document.getElementById('form-orcamento');
    const areaVazia = document.getElementById('of-vazio');
    const areaConteudo = document.getElementById('of-conteudo');
    const acoesPreview = document.getElementById('acoes-preview');

    const canvasAssinatura = document.getElementById('assinatura-canvas');
    const ctxAssinatura = canvasAssinatura.getContext('2d');
    const statusAssinatura = document.getElementById('assinatura-status');
    const imagemPreviewAssinatura = document.getElementById('of-assinatura-imagem');
    const linhaPreviewAssinatura = document.getElementById('of-assinatura-linha');

    let desenhandoAssinatura = false;
    let assinaturaFoiAlterada = false;

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

    /* ===== Assinatura digital ===== */

    canvasAssinatura.width = canvasAssinatura.clientWidth;
    canvasAssinatura.height = canvasAssinatura.clientHeight;
    ctxAssinatura.lineWidth = 2;
    ctxAssinatura.lineCap = 'round';
    ctxAssinatura.strokeStyle = '#101828';

    function posicaoDoEvento(evento) {
        const retangulo = canvasAssinatura.getBoundingClientRect();
        const origem = evento.touches ? evento.touches[0] : evento;
        return {
            x: origem.clientX - retangulo.left,
            y: origem.clientY - retangulo.top
        };
    }

    function iniciarTraco(evento) {
        evento.preventDefault();
        desenhandoAssinatura = true;
        const pos = posicaoDoEvento(evento);
        ctxAssinatura.beginPath();
        ctxAssinatura.moveTo(pos.x, pos.y);
    }

    function desenharTraco(evento) {
        if (!desenhandoAssinatura) return;
        evento.preventDefault();
        const pos = posicaoDoEvento(evento);
        ctxAssinatura.lineTo(pos.x, pos.y);
        ctxAssinatura.stroke();
        assinaturaFoiAlterada = true;
    }

    function finalizarTraco() {
        if (!desenhandoAssinatura) return;
        desenhandoAssinatura = false;
        if (assinaturaFoiAlterada) {
            localStorage.setItem(CHAVE_ASSINATURA, canvasAssinatura.toDataURL('image/png'));
            atualizarStatusAssinatura();
        }
    }

    canvasAssinatura.addEventListener('mousedown', iniciarTraco);
    canvasAssinatura.addEventListener('mousemove', desenharTraco);
    window.addEventListener('mouseup', finalizarTraco);

    canvasAssinatura.addEventListener('touchstart', iniciarTraco, { passive: false });
    canvasAssinatura.addEventListener('touchmove', desenharTraco, { passive: false });
    canvasAssinatura.addEventListener('touchend', finalizarTraco);

    function atualizarStatusAssinatura() {
        const salva = localStorage.getItem(CHAVE_ASSINATURA);
        if (salva) {
            statusAssinatura.textContent = 'Assinatura salva ✓';
            statusAssinatura.classList.add('salva');
            canvasAssinatura.classList.add('tem-assinatura');
        } else {
            statusAssinatura.textContent = 'Nenhuma assinatura salva';
            statusAssinatura.classList.remove('salva');
            canvasAssinatura.classList.remove('tem-assinatura');
        }
    }

    function carregarAssinaturaSalva() {
        const dados = localStorage.getItem(CHAVE_ASSINATURA);
        atualizarStatusAssinatura();
        if (!dados) return;
        const imagem = new Image();
        imagem.onload = function () {
            ctxAssinatura.drawImage(imagem, 0, 0, canvasAssinatura.width, canvasAssinatura.height);
        };
        imagem.src = dados;
    }

    carregarAssinaturaSalva();

    document.getElementById('btn-limpar-assinatura').addEventListener('click', function () {
        ctxAssinatura.clearRect(0, 0, canvasAssinatura.width, canvasAssinatura.height);
        assinaturaFoiAlterada = false;
        localStorage.removeItem(CHAVE_ASSINATURA);
        atualizarStatusAssinatura();
    });

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

        const assinaturaSalva = localStorage.getItem(CHAVE_ASSINATURA);
        if (assinaturaSalva) {
            imagemPreviewAssinatura.src = assinaturaSalva;
            imagemPreviewAssinatura.style.display = 'block';
            linhaPreviewAssinatura.style.display = 'none';
        } else {
            imagemPreviewAssinatura.style.display = 'none';
            linhaPreviewAssinatura.style.display = 'block';
        }

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

    async function gerarPdfDoOrcamento() {
        const folha = document.getElementById('folha-orcamento');
        const canvas = await html2canvas(folha, { scale: 2, backgroundColor: '#ffffff' });
        const imagem = canvas.toDataURL('image/png');

        // A página do PDF é criada do tamanho exato do conteúdo (largura de A4, altura proporcional),
        // assim o orçamento inteiro cabe numa página só, sem cortar nada quando ele é mais alto que uma A4.
        const larguraMm = 210;
        const alturaMm = (canvas.height * larguraMm) / canvas.width;

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: 'mm', format: [larguraMm, alturaMm] });

        pdf.addImage(imagem, 'PNG', 0, 0, larguraMm, alturaMm);

        const numero = document.getElementById('of-numero').textContent.replace(/\D/g, '-');
        const nomeArquivo = `orcamento-gs-eletrica-${numero || 'documento'}.pdf`;

        return { pdf, nomeArquivo };
    }

    function montarMensagemWhatsapp() {
        const nome = document.getElementById('of-cliente-nome').textContent.trim();
        const numero = document.getElementById('of-numero').textContent.trim();
        const descricao = document.getElementById('of-servico-descricao').textContent.trim();
        const valor = document.getElementById('of-total').textContent.trim();
        const condicoes = document.getElementById('of-condicoes').textContent.trim();

        return `Olá${nome ? ' ' + nome : ''}! Segue o orçamento *${numero}* da GS Elétrica.\n\n` +
            `*Serviço:* ${descricao}\n*Valor:* ${valor}\n${condicoes}\n\n` +
            `Qualquer dúvida, estou à disposição!`;
    }

    function numeroWhatsappDoCliente() {
        const telefone = document.getElementById('of-cliente-telefone').textContent || '';
        const digitos = telefone.replace(/\D/g, '');
        if (!digitos) return '';
        return digitos.length <= 11 ? `55${digitos}` : digitos;
    }

    document.getElementById('btn-baixar-pdf').addEventListener('click', async function () {
        const botao = this;
        const textoOriginal = botao.textContent;
        botao.textContent = 'Gerando PDF...';
        botao.disabled = true;

        try {
            const { pdf, nomeArquivo } = await gerarPdfDoOrcamento();
            pdf.save(nomeArquivo);
        } catch (erro) {
            console.error('[GS Elétrica] Erro ao gerar PDF:', erro);
            alert('Não foi possível gerar o PDF. Tente novamente.');
        } finally {
            botao.textContent = textoOriginal;
            botao.disabled = false;
        }
    });

    document.getElementById('btn-whatsapp').addEventListener('click', async function () {
        const botao = this;
        const textoOriginal = botao.textContent;
        botao.textContent = 'Preparando...';
        botao.disabled = true;

        try {
            const { pdf, nomeArquivo } = await gerarPdfDoOrcamento();
            const mensagem = montarMensagemWhatsapp();
            const blobPdf = pdf.output('blob');
            const arquivo = new File([blobPdf], nomeArquivo, { type: 'application/pdf' });

            if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
                // Celular com suporte a compartilhamento nativo: manda o PDF direto para o WhatsApp escolhido
                await navigator.share({
                    files: [arquivo],
                    title: nomeArquivo,
                    text: mensagem
                });
            } else {
                // Sem suporte a compartilhar arquivo (ex: computador): baixa o PDF e abre o WhatsApp com a mensagem pronta
                pdf.save(nomeArquivo);
                const numeroCliente = numeroWhatsappDoCliente();
                const link = numeroCliente
                    ? `https://wa.me/${numeroCliente}?text=${encodeURIComponent(mensagem)}`
                    : `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`;
                window.open(link, '_blank');
            }
        } catch (erro) {
            if (erro.name !== 'AbortError') {
                console.error('[GS Elétrica] Erro ao enviar pelo WhatsApp:', erro);
                alert('Não foi possível enviar pelo WhatsApp. Tente novamente.');
            }
        } finally {
            botao.textContent = textoOriginal;
            botao.disabled = false;
        }
    });
})();
