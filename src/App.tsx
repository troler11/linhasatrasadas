import React, { useEffect, useState } from 'react';

interface PontoParada {
  id: number;
  horario: string;
  tempoDiferenca: string | number;
  passou: boolean;
  atrasado: boolean; 
}

interface Relatorio {
  id: number;
  data: string;
  linhaDescricao: string;
  descricaoVeiculo: string;
  linhaCodigo: string;
  status: string;
  linhaCodigo: string;
  sentido: string; 
  empresa: { id: number; nome: string };
  pontoDeParadaRelatorio: PontoParada[];
}

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const App: React.FC = () => {
  const [dadosOriginal, setDadosOriginal] = useState<Relatorio[]>([]);
  const [dadosFiltrados, setDadosFiltrados] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  
  const [dataSelecionada, setDataSelecionada] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>('TODAS');
  const [filtroSentido, setFiltroSentido] = useState<string>('TODOS');

  const converterParaMinutos = (tempo: string | number): number => {
    if (typeof tempo === 'number') return tempo;
    if (tempo && tempo.toString().includes(':')) {
      const [h, m] = tempo.toString().split(':').map(Number);
      return (h * 60) + m;
    }
    const n = parseInt(tempo?.toString() || '0', 10);
    return isNaN(n) ? 0 : n;
  };

  const calcularHorarioRealizado = (horarioBase: string, diferenca: string | number, estaAtrasado: boolean) => {
    if (!horarioBase) return '00:00';
    const [h, m] = horarioBase.split(':').map(Number);
    const minutosDiff = converterParaMinutos(diferenca);
    const data = new Date();
    data.setHours(h, m, 0, 0);
    estaAtrasado ? data.setMinutes(data.getMinutes() + minutosDiff) : data.setMinutes(data.getMinutes() - minutosDiff);
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const fetchData = async (dataParaBusca: string) => {
    setLoading(true);
    const [year, month, day] = dataParaBusca.split('-');
    const dataFormatada = `${parseInt(day)}/${parseInt(month)}/${year}`;
    const url = `https://abmbus.com.br:8181/api/usuario/pesquisarelatorio?linhas=&empresas=3528816,3528804,3528807,3536646,3528817,3529151,3536839,3529224,3529142,3528920,3536708,3529024,3536624,3536600,3536756,3536730,3528806,3529220,3529258,3536796,3528893,3529153,3528928,3529147,3529222,3528872&dataInicial=${dataFormatada}&dataFinal=${dataFormatada}&periodo=&sentido=&agrupamentos=`;
    
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJtaW1vQGFibXByb3RlZ2UuY29tLmJyIiwiZXhwIjoxODcwMzE1NDA2fQ.WoOxG8y0D4iT1hJNxWisBlTmk2i5hVMwQmthRj00m9oWABF2pv_BZfICrASXf_Fkav8p4kZRydUHm-r6T1R9TA' }
      });
      const data = await response.json();
      const lista = Array.isArray(data) ? data : [data];
      const filtrados = lista.filter(item => {
        const pontos = item.pontoDeParadaRelatorio || [];
        const pontoRef = item.sentido === 'Saída' ? pontos[0] : pontos[pontos.length - 1];
        return pontoRef?.passou && pontoRef?.atrasado && converterParaMinutos(pontoRef.tempoDiferenca) > 10;
      });
      setDadosOriginal(filtrados);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(dataSelecionada); }, [dataSelecionada]);

  useEffect(() => {
    let resultado = [...dadosOriginal];
    if (filtroEmpresa !== 'TODAS') resultado = resultado.filter(d => d.empresa.nome === filtroEmpresa);
    if (filtroSentido !== 'TODOS') resultado = resultado.filter(d => d.sentido === filtroSentido);

    if (sortConfig) {
      const { key, direction } = sortConfig; // Garantia de que não é null
      resultado.sort((a, b) => {
        let valA: any, valB: any;
        const pInicA = a.pontoDeParadaRelatorio[0], pFimA = a.pontoDeParadaRelatorio[a.pontoDeParadaRelatorio.length - 1];
        const pInicB = b.pontoDeParadaRelatorio[0], pFimB = b.pontoDeParadaRelatorio[b.pontoDeParadaRelatorio.length - 1];

        switch (key) {
          case 'empresa': valA = a.empresa.nome; valB = b.empresa.nome; break;
          case 'prefixo': valA = a.descricaoVeiculo; valB = b.descricaoVeiculo; break;
          case 'sentido': valA = a.sentido; valB = b.sentido; break;
          case 'hInicProg': valA = pInicA?.horario; valB = pInicB?.horario; break;
          case 'hFinalProg': valA = pFimA?.horario; valB = pFimB?.horario; break;
          case 'atraso': 
            valA = converterParaMinutos(a.sentido === 'Saída' ? pInicA?.tempoDiferenca : pFimA?.tempoDiferenca);
            valB = converterParaMinutos(b.sentido === 'Saída' ? pInicB?.tempoDiferenca : pFimB?.tempoDiferenca);
            break;
          default: valA = ''; valB = '';
        }

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    setDadosFiltrados(resultado);
  }, [filtroEmpresa, filtroSentido, dadosOriginal, sortConfig]);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <h1 style={{ color: '#c0392b' }}>{`⚠️ Monitoramento de Atrasos Críticos`}</h1>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <input type="date" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <select value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="TODAS">Empresas</option>
          {Array.from(new Set(dadosOriginal.map(d => d.empresa.nome))).sort().map(emp => <option key={emp} value={emp}>{emp}</option>)}
        </select>
        <select value={filtroSentido} onChange={(e) => setFiltroSentido(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="TODOS">Sentidos</option>
          <option value="Entrada">Entrada</option>
          <option value="Saída">Saída</option>
        </select>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
          <thead style={{ color: '#fff' }}>
            <tr>
              {[
                { label: "Empresa / Linha", key: "empresa" },
                { label: "Prefixo", key: "prefixo" },
                { label: "Sentido", key: "sentido" },
                { label: "H. Inic. Prog.", key: "hInicProg" },
                { label: "H. Inic. Real.", key: "" },
                { label: "H. Final Prog.", key: "hFinalProg" },
                { label: "H. Final Real.", key: "" },
                { label: "Atraso", key: "atraso" }
              ].map((col) => (
                <th 
                  key={col.label}
                  onClick={() => col.key && handleSort(col.key)}
                  style={{ 
                    padding: '12px', 
                    cursor: col.key ? 'pointer' : 'default', 
                    backgroundColor: col.key === 'atraso' ? '#2c3e50' : '#c0392b',
                    borderRight: '1px solid rgba(255,255,255,0.1)' 
                  }}
                >
                  {col.label} {sortConfig?.key === col.key ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dadosFiltrados.map((item) => {
              const pInic = item.pontoDeParadaRelatorio[0], pFim = item.pontoDeParadaRelatorio[item.pontoDeParadaRelatorio.length - 1];
              const pRef = item.sentido === 'Saída' ? pInic : pFim;
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                  <td style={{ padding: '12px', textAlign: 'left' }}><strong>{item.empresa?.nome}</strong><br/><small>{item.linhaDescricao} {item.linhaCodigo}</small></td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.descricaoVeiculo}</td>
                  <td style={{ padding: '12px' }}>{item.sentido}</td>
                  <td style={{ padding: '12px' }}>{pInic?.horario}</td>
                  <td style={{ padding: '12px' }}>{calcularHorarioRealizado(pInic?.horario, pInic?.tempoDiferenca, pInic?.atrasado)}</td>
                  <td style={{ padding: '12px' }}>{pFim?.horario}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{calcularHorarioRealizado(pFim?.horario, pFim?.tempoDiferenca, pFim?.atrasado)}</td>
                  <td style={{ padding: '12px', color: '#e74c3c', fontWeight: 'bold' }}>{`+${pRef?.tempoDiferenca} min`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
