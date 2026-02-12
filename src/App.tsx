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
  placa: string;
  status: string;
  sentido: string; // Campo para o filtro de sentido
  atrasado: boolean;
  empresa: { id: number; nome: string };
  pontoDeParadaRelatorio: PontoParada[];
}

const App: React.FC = () => {
  const [dadosOriginal, setDadosOriginal] = useState<Relatorio[]>([]);
  const [dadosFiltrados, setDadosFiltrados] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados dos Filtros
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

  const fetchData = async () => {
    const url = "https://abmbus.com.br:8181/api/usuario/pesquisarelatorio?linhas=&empresas=3528816,3528804,3528807,3536646,3528817,3529151,3536839,3529224,3529142,3528920,3536708,3529024,3536624,3536600,3536756,3536730,3528806,3529220,3529258,3536796,3528893,3529153,3528928,3529147,3529222,3528872&dataInicial=12/2/2026&dataFinal=12/2/2026&periodo=&sentido=&agrupamentos=";
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJtaW1vQGFibXByb3RlZ2UuY29tLmJyIiwiZXhwIjoxODcwMzE1NDA2fQ.WoOxG8y0D4iT1hJNxWisBlTmk2i5hVMwQmthRj00m9oWABF2pv_BZfICrASXf_Fkav8p4kZRydUHm-r6T1R9TA' }
      });
      const data = await response.json();
      const lista = Array.isArray(data) ? data : [data];

      // Filtro inicial de Atraso Crítico (+10min)
      const apenasCriticos = lista.filter(item => {
        const ultimoPonto = item.pontoDeParadaRelatorio?.[item.pontoDeParadaRelatorio.length - 1];
        const diferenca = converterParaMinutos(ultimoPonto?.tempoDiferenca || 0);
        return item.atrasado === true && diferenca > 10;
      });

      setDadosOriginal(apenasCriticos);
      setDadosFiltrados(apenasCriticos);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  // Lógica de Filtros em Tempo Real
  useEffect(() => {
    let resultado = dadosOriginal;

    if (filtroEmpresa !== 'TODAS') {
      resultado = resultado.filter(d => d.empresa.nome === filtroEmpresa);
    }

    if (filtroSentido !== 'TODOS') {
      resultado = resultado.filter(d => d.sentido === filtroSentido);
    }

    setDadosFiltrados(resultado);
  }, [filtroEmpresa, filtroSentido, dadosOriginal]);

  useEffect(() => { fetchData(); }, []);

  // Lista de empresas únicas para o Select
  const empresasUnicas = Array.from(new Set(dadosOriginal.map(d => d.empresa.nome))).sort();

  if (loading) return <div style={{padding: '20px'}}>Carregando filtros e dados...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <h1 style={{ color: '#c0392b' }}>⚠️ Monitoramento de Atrasos Críticos</h1>

      {/* Seção de Filtros */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Empresa:</label>
          <select 
            value={filtroEmpresa} 
            onChange={(e) => setFiltroEmpresa(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}
          >
            <option value="TODAS">Todas as Empresas</option>
            {empresasUnicas.map(emp => <option key={emp} value={emp}>{emp}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Sentido:</label>
          <select 
            value={filtroSentido} 
            onChange={(e) => setFiltroSentido(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }}
          >
            <option value="TODOS">Todos os Sentidos</option>
            <option value="Entrada">Entrada</option>
            <option value="Saída">Saída</option>
          </select>
        </div>
      </div>

      {dadosFiltrados.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>
          Nenhum atraso crítico encontrado com estes filtros.
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#c0392b', color: '#fff' }}>
              <tr>
                <th style={{ padding: '12px' }}>Empresa / Linha</th>
                <th style={{ padding: '12px' }}>Placa</th>
                <th style={{ padding: '12px' }}>Sentido</th>
                <th style={{ padding: '12px' }}>H. Inicial</th>
                <th style={{ padding: '12px' }}>H. Final Prog.</th>
                <th style={{ padding: '12px', backgroundColor: '#2c3e50' }}>H. Final Realizado</th>
                <th style={{ padding: '12px' }}>Atraso</th>
              </tr>
            </thead>
            <tbody>
              {dadosFiltrados.map((item) => {
                const pontos = item.pontoDeParadaRelatorio || [];
                const ultimoPonto = pontos[pontos.length - 1];
                const hInicial = pontos[0]?.horario || '--:--';
                const hFinalProg = ultimoPonto?.horario || '--:--';
                const hFinalRealizado = calcularHorarioRealizado(hFinalProg, ultimoPonto?.tempoDiferenca || 0);

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                    <td style={{ padding: '12px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 'bold' }}>{item.empresa?.nome}</div>
                      <div style={{ fontSize: '0.8em', color: '#666' }}>{item.linhaDescricao}</div>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.placa}</td>
                    <td style={{ padding: '12px' }}>{item.sentido}</td>
                    <td style={{ padding: '12px' }}>{hInicial}</td>
                    <td style={{ padding: '12px' }}>{hFinalProg}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#c0392b' }}>{hFinalRealizado}</td>
                    <td style={{ padding: '12px', color: '#e74c3c', fontWeight: 'bold' }}>{ultimoPonto?.tempoDiferenca} min</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default App;
