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
  atrasado: boolean;
  empresa: { nome: string };
  pontoDeParadaRelatorio: PontoParada[];
}

const App: React.FC = () => {
  const [dados, setDados] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);

  const converterParaMinutos = (tempo: string | number): number => {
    if (typeof tempo === 'number') return tempo;
    if (tempo && tempo.toString().includes(':')) {
      const [h, m] = tempo.toString().split(':').map(Number);
      return (h * 60) + m;
    }
    return parseInt(tempo?.toString(), 10) || 0;
  };

  const calcularHorarioRealizado = (horarioBase: string, diferenca: string | number, isAtrasado: boolean) => {
    if (!horarioBase) return '--:--';
    const [h, m] = horarioBase.split(':').map(Number);
    const minutosDiff = converterParaMinutos(diferenca);
    const data = new Date();
    data.setHours(h, m, 0, 0);

    if (isAtrasado) {
      data.setMinutes(data.getMinutes() + minutosDiff);
    } else {
      data.setMinutes(data.getMinutes() - minutosDiff);
    }
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const fetchData = async () => {
    const url = "https://abmbus.com.br:8181/api/usuario/pesquisarelatorio?linhas=&empresas=3528816,3528804,3528807,3536646,3528817,3529151,3536839,3529224,3529142,3528920,3536708,3529024,3536624,3536600,3536756,3536730,3528806,3529220,3529258,3536796,3528893,3529153,3528928,3529147,3529222,3528872&dataInicial=10/2/2026&dataFinal=10/2/2026&periodo=&sentido=&agrupamentos=";
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJtaW1vQGFibXByb3RlZ2UuY29tLmJyIiwiZXhwIjoxODcwMzE1NDA2fQ.WoOxG8y0D4iT1hJNxWisBlTmk2i5hVMwQmthRj00m9oWABF2pv_BZfICrASXf_Fkav8p4kZRydUHm-r6T1R9TA' }
      });
      const data = await response.json();
      const lista = Array.isArray(data) ? data : [data];

      // REGRA DE TOLERÂNCIA:
      // 1. Se for ADIANTADO (atrasado === false), mostra sempre.
      // 2. Se for ATRASADO (atrasado === true), só mostra se a diferença for > 10.
      const dadosFiltrados = lista.filter(item => {
        const ultimoPonto = item.pontoDeParadaRelatorio?.[item.pontoDeParadaRelatorio.length - 1];
        const diferencaMinutos = converterParaMinutos(ultimoPonto?.tempoDiferenca || 0);
        
        if (item.atrasado) {
          return diferencaMinutos > 10; // Só mostra atrasos acima de 10 min
        }
        return true; // Mostra todos os adiantados (ou você pode filtrar aqui também se quiser)
      });

      setDados(dadosFiltrados);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div style={{padding: '20px'}}>Aplicando tolerância de 10 minutos...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#2c3e50', margin: 0 }}>📋 Monitoramento de Pontualidade (Tolerância 10min)</h1>
        <div style={{ backgroundColor: '#e74c3c', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold' }}>
          {dados.filter(d => d.atrasado).length} Críticos
        </div>
      </div>
      
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1100px' }}>
          <thead style={{ backgroundColor: '#34495e', color: '#fff' }}>
            <tr>
              <th style={{ padding: '12px' }}>Empresa / Linha</th>
              <th style={{ padding: '12px' }}>Placa</th>
              <th style={{ padding: '12px' }}>H. Inicial</th>
              <th style={{ padding: '12px' }}>H. Final Prog.</th>
              <th style={{ padding: '12px', backgroundColor: '#2980b9' }}>H. Final Realizado</th>
              <th style={{ padding: '12px' }}>Diferença</th>
              <th style={{ padding: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((item) => {
              const pontos = item.pontoDeParadaRelatorio || [];
              const primeiroPonto = pontos[0];
              const ultimoPonto = pontos[pontos.length - 1];
              const hInicial = primeiroPonto?.horario || '--:--';
              const hFinalProg = ultimoPonto?.horario || '--:--';
              
              const hFinalRealizado = (ultimoPonto?.passou)
                ? calcularHorarioRealizado(hFinalProg, ultimoPonto.tempoDiferenca, item.atrasado)
                : hFinalProg;

              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                  <td style={{ padding: '12px', textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9em' }}>{item.empresa?.nome}</div>
                    <div style={{ fontSize: '0.8em', color: '#7f8c8d' }}>{item.linhaDescricao}</div>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.placa}</td>
                  <td style={{ padding: '12px' }}>{hInicial}</td>
                  <td style={{ padding: '12px' }}>{hFinalProg}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#2980b9' }}>
                    {hFinalRealizado}
                  </td>
                  <td style={{ padding: '12px', color: item.atrasado ? '#e74c3c' : '#27ae60', fontWeight: 'bold' }}>
                    {item.atrasado ? `+${ultimoPonto?.tempoDiferenca}` : `-${ultimoPonto?.tempoDiferenca}`} min
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8em',
                      backgroundColor: item.atrasado ? '#fdecea' : '#eafaf1',
                      color: item.atrasado ? '#e74c3c' : '#27ae60', fontWeight: 'bold'
                    }}>
                      {item.atrasado ? 'ATRASADO CRÍTICO' : 'ADIANTADO'}
                    </span>
                  </td>
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
