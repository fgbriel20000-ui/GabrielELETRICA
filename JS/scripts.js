// Funções auxiliares compartilhadas
function ajustarFP(modulo) {
    let tipo = document.getElementById(modulo+'_fp_tipo').value;
    let manual = document.getElementById(modulo+'_fp_manual');
    manual.disabled = (tipo !== 'manual');
    if(tipo !== 'manual') manual.value = tipo;
}

function getFP(modulo) {
    let tipo = document.getElementById(modulo+'_fp_tipo').value;
    return tipo === 'manual' ? Number(document.getElementById(modulo+'_fp_manual').value) : Number(tipo);
}

// Tabela de ampacidade (NBR 5410)
const ampacidade = {1.5:15.5, 2.5:21, 4:28, 6:36, 10:50, 16:68};

// Cálculo de Corrente
function calcCorrente() {
    let P = Number(document.getElementById('corr_pot').value);
    let V = Number(document.getElementById('corr_tensao').value);
    let FP = getFP('corr');
    let I = (P / (V * FP)).toFixed(2);
    document.getElementById('res_corr').innerHTML = `
        <strong>Corrente Calculada:</strong> <span class="text-highlight">${I} A</span><br>
        Fator de Potência Utilizado: ${FP}<br>
        <small>Fórmula: I = P / (V × FP)</small>
    `;
    document.getElementById('res_corr').classList.remove('hidden');
}

// Cálculo de Potência
function calcPotencia() {
    let V = Number(document.getElementById('pot_tensao').value);
    let I = Number(document.getElementById('pot_corr').value);
    let FP = getFP('pot');
    let P = (V * I * FP).toFixed(2);
    document.getElementById('res_pot').innerHTML = `
        <strong>Potência Ativa:</strong> <span class="text-highlight">${P} W</span><br>
        Fator de Potência: ${FP}
    `;
    document.getElementById('res_pot').classList.remove('hidden');
}

// Cálculo de Queda de Tensão
function calcQueda() {
    let V = Number(document.getElementById('q_tensao').value);
    let I = Number(document.getElementById('q_corr').value);
    let L = Number(document.getElementById('q_comp').value);
    let S = Number(document.getElementById('q_sec').value);
    let quedaV = (2 * 0.0172 * L * I) / S;
    let quedaP = (quedaV / V * 100).toFixed(2);
    let status = quedaP > 4 ? '<span class="text-red-400 font-bold">⚠️ Acima do limite permitido (4%)</span>' : '<span class="text-green-400 font-bold">✅ Dentro do limite</span>';
    document.getElementById('res_q').innerHTML = `
        Queda de Tensão: <span class="text-highlight">${quedaV.toFixed(2)} V</span><br>
        Percentual: <span class="text-highlight">${quedaP}%</span><br>
        ${status}
    `;
    document.getElementById('res_q').classList.remove('hidden');
}

// Cálculo de Bitola
function calcBitola() {
    let I = Number(document.getElementById('b_corr').value);
    let L = Number(document.getElementById('b_comp').value);
    let V = Number(document.getElementById('b_tensao').value);
    let Smin = null;
    for(let [s,iz] of Object.entries(ampacidade)) if(iz>=I) { Smin=Number(s); break; }
    let Squeda = Math.sqrt(2*0.0172*L*I/V/0.04);
    let Sfinal = Math.max(Smin, Math.ceil(Squeda*2)/2);
    document.getElementById('res_b').innerHTML = `
        Seção mínima por corrente: ${Smin} mm²<br>
        Seção mínima por queda: ${Squeda.toFixed(2)} mm²<br>
        <strong>Bitola recomendada: <span class="text-highlight">${Sfinal} mm²</span></strong>
    `;
    document.getElementById('res_b').classList.remove('hidden');
}

// Cálculo de Disjuntor
function calcDisjuntor() {
    let I = Number(document.getElementById('d_corr').value);
    let S = Number(document.getElementById('d_sec').value);
    let tipo = document.getElementById('d_tipo').value;
    let curva = tipo==='veiculo'?'D':tipo==='resistiva'?'B':'C';
    let disj = Math.ceil(I/5)*5;
    if(disj<10) disj=10;
    document.getElementById('res_d').innerHTML = `
        Disjuntor: <span class="text-highlight">${disj} A</span> (Curva ${curva})<br>
        Capacidade do cabo: ${ampacidade[S] || 'Verificar bitola'} A
    `;
    document.getElementById('res_d').classList.remove('hidden');
}

// Cálculo de Consumo
function calcConsumo() {
    let P = Number(document.getElementById('c_pot').value);
    let h = Number(document.getElementById('c_hora').value);
    let d = Number(document.getElementById('c_dia').value);
    let preco = Number(document.getElementById('c_preco').value);
    let kwh = (P/1000)*h*d;
    let valor = (kwh*preco).toFixed(2);
    document.getElementById('res_c').innerHTML = `
        Consumo Mensal: <span class="text-highlight">${kwh.toFixed(2)} kWh</span><br>
        Valor Estimado: <span class="text-highlight">R$ ${valor}</span>
    `;
    document.getElementById('res_c').classList.remove('hidden');
}

// Cálculo de Demanda
function calcDemanda() {
    let total = Number(document.getElementById('fd_total').value);
    let circ = Number(document.getElementById('fd_circ').value);
    let fd = circ<=2 ? 0.8 : circ<=4 ? 0.7 : 0.6;
    let demanda = total*fd;
    document.getElementById('res_fd').innerHTML = `
        Fator de Demanda: <span class="text-highlight">${fd}</span><br>
        Potência de Demanda: <span class="text-highlight">${demanda.toFixed(0)} W</span>
    `;
    document.getElementById('res_fd').classList.remove('hidden');
}

// Conversões
function convAWG() {
    let awg = Number(document.getElementById('conv_awg').value);
    let tab = {14:2.08,12:3.31,10:5.26,8:8.37,6:13.3};
    document.getElementById('res_awg').innerHTML = tab[awg] ? `${awg} AWG = <span class="text-highlight">${tab[awg]} mm²</span>` : 'Valor não encontrado';
}
function convW() {
    let val = Number(document.getElementById('conv_w').value);
    document.getElementById('res_w').innerHTML = val>=1000 ? `${val} W = <span class="text-highlight">${val/1000} kW</span>` : `${val} kW = <span class="text-highlight">${val*1000} W</span>`;
}

// Cálculo de Cargas Específicas
function calcCarga() {
    let tipo = document.getElementById('carga_tipo').value;
    let val = Number(document.getElementById('carga_valor').value);
    let V = Number(document.getElementById('carga_tensao').value);
    let FP = tipo === 'chuveiro' ? 1.0 : Number(document.getElementById('carga_fp').value);
    let res='';
    if(tipo==='chuveiro') {
        let I = (val/(V*FP)).toFixed(2);
        res=`Chuveiro ${val}W:<br>Corrente: <span class="text-highlight">${I}A</span><br>Bitola: ${val>5000?6:4}mm²<br>Disjuntor: ${Math.ceil(I/5)*5}A`;
    } else if(tipo==='ar') {
        let I = (val/(V*FP)).toFixed(2);
        res=`Ar-Condicionado ${val}W:<br>Corrente: <span class="text-highlight">${I}A</span><br>Bitola: ${val>3500?6:4}mm²<br>Disjuntor Curva D: ${Math.ceil(I)}A`;
    } else if(tipo==='motor') {
        let potW = val*736;
        let I = (potW/(V*FP*0.85)).toFixed(2);
        res=`Motor ${val}CV:<br>Corrente: <span class="text-highlight">${I}A</span><br>Bitola: ${val>2?6:4}mm²<br>Disjuntor Curva D: ${Math.ceil(I*1.2)}A`;
    }
    document.getElementById('res_carga').innerHTML=res;
    document.getElementById('res_carga').classList.remove('hidden');
}

// Orçamento
function gerarOrcamento() {
    let qTom = Number(document.getElementById('qtd_tomada').value);
    let qInt = Number(document.getElementById('qtd_interruptor').value);
    let m15 = Number(document.getElementById('m15').value);
    let m25 = Number(document.getElementById('m25').value);
    let m4 = Number(document.getElementById('m4').value);
    let qDisj = Number(document.getElementById('qtd_disj').value);
    let qCond = Number(document.getElementById('qtd_conduite').value);

    let pTom = Number(document.getElementById('preco_tomada').value);
    let pInt = Number(document.getElementById('preco_interruptor').value);
    let pm15 = Number(document.getElementById('preco_m15').value);
    let pm25 = Number(document.getElementById('preco_m25').value);
    let pm4 = Number(document.getElementById('preco_m4').value);
    let pDisj = Number(document.getElementById('preco_disj').value);
    let pCond = Number(document.getElementById('preco_conduite').value);
    let mao = Number(document.getElementById('mao').value);
    let lucro = Number(document.getElementById('lucro').value)/100;

    let totalMat = qTom*pTom + qInt*pInt + m15*pm15 + m25*pm25 + m4*pm4 + qDisj*pDisj + qCond*pCond;
    let totalComLucro = totalMat * (1+lucro);
    let totalGeral = totalComLucro + mao;

    document.getElementById('res_orc').innerHTML = `
        <strong>Materiais:</strong> R$ ${totalMat.toFixed(2)}<br>
        <strong>Com Lucro (${lucro*100}%):</strong> R$ ${totalComLucro.toFixed(2)}<br>
        <strong>Mão de Obra:</strong> R$ ${mao.toFixed(2)}<br>
        <strong>Total Geral:</strong> <span class="text-highlight">R$ ${totalGeral.toFixed(2)}</span>
    `;
    document.getElementById('res_orc').classList.remove('hidden');
}

// Recibo
function gerarRecibo() {
    let prestNome = document.getElementById('prestador_nome').value;
    let prestDoc = document.getElementById('prestador_doc').value;
    let prestEnd = document.getElementById('prestador_end').value;
    let cliNome = document.getElementById('cliente_nome').value;
    let cliDoc = document.getElementById('cliente_doc').value;
    let cliEnd = document.getElementById('cliente_end').value;
    let desc = document.getElementById('descricao').value;
    let valor = Number(document.getElementById('valor_total').value).toFixed(2);
    let data = document.getElementById('data_recibo').value;

    document.getElementById('recibo_area').innerHTML = `
        <div class="recibo">
            <h2>RECIBO DE SERVIÇO ELÉTRICO</h2>
            <p><strong>Prestador:</strong> ${prestNome}<br>
            <strong>CPF/CNPJ:</strong> ${prestDoc}<br>
            <strong>Endereço:</strong> ${prestEnd}</p>
            <hr class="my-4">
            <p><strong>Cliente:</strong> ${cliNome}<br>
            <strong>CPF:</strong> ${cliDoc}<br>
            <strong>Endereço da Obra:</strong> ${cliEnd}</p>
            <hr class="my-4">
            <p><strong>Serviço:</strong> ${desc}</p>
            <p class="text-xl font-bold mt-6">Valor Total: R$ ${valor}</p>
            <p class="mt-4">Data: ${data}</p>
            <div class="mt-10 text-center">
                <p>_______________________________________</p>
                <p>Assinatura do Prestador</p>
            </div>
        </div>
    `;
}

