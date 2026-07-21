/* =========================================================
   GS ELÉTRICA — LÓGICA DA PÁGINA "CALCULADORAS"
   Cada calculadora nova (corrente, disjuntor, bitola etc.)
   deve seguir o mesmo padrão: uma função independente,
   chamada pelo submit do seu próprio formulário.
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

    /* ===== Calculadora: Queda de Tensão ===== */
    const formQuedaTensao = document.getElementById('form-queda-tensao');
    const qtVazio = document.getElementById('qt-vazio');
    const qtConteudo = document.getElementById('qt-conteudo');

    function formatarNumero(valor, casas) {
        return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
    }

    formQuedaTensao.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const corrente = Number(document.getElementById('qt-corrente').value || 0);
        const comprimentoIda = Number(document.getElementById('qt-comprimento').value || 0);
        const bitola = Number(document.getElementById('qt-bitola').value || 0);
        const resistividade = Number(document.getElementById('qt-material').value);
        const tensaoNominal = Number(document.getElementById('qt-tensao').value);

        if (bitola <= 0 || tensaoNominal <= 0) return;

        // R = ρ × (comprimento total, ida e volta) / seção do cabo
        const comprimentoTotal = comprimentoIda * 2;
        const resistencia = resistividade * (comprimentoTotal / bitola);

        // Queda de tensão: V = I × R
        const quedaVolts = corrente * resistencia;
        const quedaPercentual = (quedaVolts / tensaoNominal) * 100;

        document.getElementById('qt-out-volts').textContent = `${formatarNumero(quedaVolts, 2)} V`;
        document.getElementById('qt-out-percentual').textContent = `${formatarNumero(quedaPercentual, 2)}% da tensão nominal`;

        const selo = document.getElementById('qt-out-selo');
        if (quedaPercentual <= 4) {
            selo.textContent = '✅ Dentro do limite recomendado (≤ 4%)';
            selo.className = 'selo-status ok';
        } else {
            selo.textContent = '⚠️ Acima do limite recomendado (> 4%)';
            selo.className = 'selo-status alerta';
        }

        qtVazio.style.display = 'none';
        qtConteudo.style.display = 'block';
    });
})();
