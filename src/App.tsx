import React, { useEffect, useState } from 'react';

interface PontoParada {
  id: number;
  horario: string;
  tempoDiferenca: string | number;
  passou: boolean;
}

interface Relatorio {
  id: number;
  data: string;
  linhaDescricao: string;
  descricaoVeiculo: string;
  linhaCodigo: string;
  status: string;
  sentido: string; 
  atrasado: boolean;
  empresa: { id: number; nome: string };
  pontoDeParadaRelatorio: PontoParada[];
}

const App: React.FC = () => {
  const [dadosOriginal, setDadosOriginal] = useState<Relatorio[]>([]);
  const [dadosFiltrados, setDadosFiltrados] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [dataSelecionada, setDataSelecionada] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>('TODAS');
  const [filtroSentido, setFiltroSentido] = useState<string>('TODOS');

  const converterParaMinutos = (tempo: string | number): number => {
    if (typeof tempo === 'number') return tempo;
    if (tempo && tempo.toString().includes(':')) {
      const [h, m] = tempo.toString().split(':').map(Number);
      return (h * 60) + m;
    }
    return parseInt(tempo?.toString(), 10) || 0;
  };

  const calcularHorarioRealizado = (horarioBase: string, diferenca: string | number) => {
    if (!horarioBase) return '--:--';
    const [h, m] = horarioBase.split(':').map(Number);
    const minutosDiff = converterParaMinutos(diferenca);
    const data = new Date();
    data.setHours(h, m, 0, 0);
    data.setMinutes(data.getMinutes() + minutosDiff);
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatarDataParaApi = (dataIso: string) => {
    const [year, month, day] = dataIso.split('-');
    return `${parseInt(day)}/${parseInt(month)}/${year}`;
  };

  const fetchData = async (dataParaBusca: string) => {
    setLoading(true);
    const dataFormatada = formatarDataParaApi(dataParaBusca);
    const url = `https://abmbus.com.br:8181/api/usuario/pesquisarelatorio?linhas=&empresas=3528816,3528804,3528807,3536646,3528817,3529151,3536839,3529224,3529142,3528920,3536708,3529024,3536624,3536600,3536756,3536730,3528806,3529220,3529258,3536796,3528893,3529153,3528928,3529147,3529222,3528872&dataInicial=${dataFormatada}&dataFinal=${dataFormatada}&periodo=&sentido=&agrupamentos=`;
    
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJtaW1vQGFibXByb3RlZ2UuY29tLmJyIiwiZXhwIjoxODcwMzE1NDA2fQ.WoOxG8y0D4iT1hJNxWisBlTmk2i5hVMwQmthRj00m9oWABF2pv_BZfICrASXf_Fkav8p4kZRydUHm-r6T1R9TA' }
      });
      const data = await response.json();
      const lista = Array.isArray(data) ? data : [data];

      // APLICAÇÃO DA REGRA DE FILTRO RESTRITIVO
      const filtrados = lista.filter(item => {
        const pontos = item.pontoDeParadaRelatorio || [];
        if (pontos.length === 0) return false;

        // Regra para ENTRADA: Baseada no último ponto
        if (item.sentido === 'Entrada') {
          const ultimoPonto = pontos[pontos.length - 1];
          const diffUltimo = converterParaMinutos(ultimoPonto?.tempoDiferenca || 0);
          return item.atrasado === true && diffUltimo > 10;
        }

        // Regra para SAÍDA: Baseada no primeiro ponto
        if (item.sentido === 'Saída') {
          const primeiroPonto = pontos[0];
          const diffPrimeiro = converterParaMinutos(primeiroPonto?.tempoDiferenca || 0);
          return item.atrasado === true && diffPrimeiro > 10;
        }

        return false; // Descarta se não for Entrada nem Saída com atraso > 10
      });

      setDadosOriginal(filtrados);
      setDadosFiltrados(filtrados);
    } catch (err) { 
        console.error(err);
        setDadosOriginal([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(dataSelecionada); }, [dataSelecionada]);

  useEffect(() => {
    let resultado = dadosOriginal;
    if (filtroEmpresa !== 'TODAS') resultado = resultado.filter(d => d.empresa.nome === filtroEmpresa);
    if (filtroSentido !== 'TODOS') resultado = resultado.filter(d => d.sentido === filtroSentido);
    setDadosFiltrados(resultado);
  }, [filtroEmpresa, filtroSentido, dadosOriginal]);

  const empresasUnicas = Array.from(new Set(dadosOriginal.map(d => d.empresa.nome))).sort();

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <h1 style={{ color: '#c0392b' }}>⚠️ Monitoramento de Atrasos Críticos (Filtro por Sentido)</h1>

      {/* Painel de Filtros */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Data:</label>
          <input type="date" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #c0392b' }} />
        </div>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Empresa:</label>
          <select value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }}>
            <option value="TODAS">Todas</option>
            {empresasUnicas.map(emp => <option key={emp} value={emp}>{emp}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Sentido:</label>
          <select value={filtroSentido} onChange={(e) => setFiltroSentido(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="TODOS">Todos</option>
            <option value="Entrada">Entrada</option>
            <option value="Saída">Saída</option>
          </select>
        </div>
        <button onClick={() => fetchData(dataSelecionada)} style={{ alignSelf: 'flex-end', padding: '10px 20px', backgroundColor: '#2c3e50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          🔄 Atualizar
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Analisando telemetria...</div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1100px' }}>
            <thead style={{ backgroundColor: '#c0392b', color: '#fff' }}>
              <tr>
                <th style={{ padding: '12px' }}>Empresa / Linha</th>
                <th style={{ padding: '12px' }}>Prefixo</th>
                <th style={{ padding: '12px' }}>Sentido</th>
                <th style={{ padding: '12px', backgroundColor: '#34495e' }}>H. Inic. Prog.</th>
                <th style={{ padding: '12px', backgroundColor: '#34495e' }}>H. Inic. Real.</th>
                <th style={{ padding: '12px' }}>H. Final Prog.</th>
                <th style={{ padding: '12px', backgroundColor: '#2c3e50' }}>H. Final Real.</th>
                <th style={{ padding: '12px' }}>Atraso Base</th>
              </tr>
            </thead>
            <tbody>
              {dadosFiltrados.map((item) => {
                const pontos = item.pontoDeParadaRelatorio || [];
                const pontoInic = pontos[0];
                const pontoFim = pontos[pontos.length - 1];
                
                // Determina qual ponto é a referência para o dado de atraso exibido
                const pontoRef = item.sentido === 'Saída' ? pontoInic : pontoFim;

                const hInicProg = pontoInic?.horario || '--:--';
                const hInicReal = calcularHorarioRealizado(hInicProg, pontoInic?.tempoDiferenca || 0);
                const hFinalProg = pontoFim?.horario || '--:--';
                const hFinalReal = calcularHorarioRealizado(hFinalProg, pontoFim?.tempoDiferenca || 0);

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                    <td style={{ padding: '12px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 'bold' }}>{item.empresa?.nome}</div>
                      <div style={{ fontSize: '0.8em', color: '#666' }}>{item.linhaDescricao}</div>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.descricaoVeiculo}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontWeight: 'bold', color: item.sentido === 'Entrada' ? '#2980b9' : '#e67e22' }}>
                        {item.sentido}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{hInicProg}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#34495e' }}>{hInicReal}</td>
                    <td style={{ padding: '12px' }}>{hFinalProg}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#c0392b' }}>{hFinalReal}</td>
                    <td style={{ padding: '12px', color: '#e74c3c', fontWeight: 'bold' }}>
                      {pontoRef?.tempoDiferenca} min
                      <div style={{ fontSize: '0.7em', color: '#999' }}>Ref: {item.sentido === 'Saída' ? 'Início' : 'Chegada'}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {dadosFiltrados.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>✅ Nenhum atraso crítico encontrado com os critérios atuais.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
