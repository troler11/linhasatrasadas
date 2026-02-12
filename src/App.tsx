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

  const calcularHorarioRealizado = (horarioBase: string, diferenca: string | number) => {
    if (!horarioBase) return '--:--';
    const [h, m] = horarioBase.split(':').map(Number);
    const minutosDiff = converterParaMinutos(diferenca);
    const data = new Date();
    data.setHours(h, m, 0, 0);
    // Como o filtro só permite 'atrasado', aqui sempre somamos
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

      // FILTRO RESTRITIVO: 
      // 1. atrasado deve ser TRUE 
      // 2. diferença deve ser MAIOR que 10
      const apenasCriticos = lista.filter(item => {
        const ultimoPonto = item.pontoDeParadaRelatorio?.[item.pontoDeParadaRelatorio.length - 1];
        const diferenca = converterParaMinutos(ultimoPonto?.tempoDiferenca || 0);
        return item.atrasado === true && diferenca > 10;
      });

      setDados(apenasCriticos);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div style={{padding: '20px'}}>Filtrando atrasos críticos...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#e74c3c', borderBottom: '2px solid #e74c3c', paddingBottom: '10px' }}>
        ⚠️ Relatório de Atrasos Críticos (+10min)
      </h1>
      
      {dados.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#27ae60', fontSize: '1.2em' }}>
          ✅ Nenhum veículo com atraso crítico no momento.
        </div>
      ) : (
        <div style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#c0392b', color: '#fff' }}>
              <tr>
                <th style={{ padding: '12px' }}>Empresa / Linha</th>
                <th style={{ padding: '12px' }}>Placa</th>
                <th style={{ padding: '12px' }}>H. Inicial</th>
                <th style={{ padding: '12px' }}>H. Final Prog.</th>
                <th style={{ padding: '12px', backgroundColor: '#2c3e50' }}>H. Final Realizado</th>
                <th style={{ padding: '12px' }}>Atraso</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((item) => {
                const pontos = item.pontoDeParadaRelatorio || [];
                const primeiroPonto = pontos[0];
                const ultimoPonto = pontos[pontos.length - 1];
                const hInicial = primeiroPonto?.horario || '--:--';
                const hFinalProg = ultimoPonto?.horario || '--:--';
                
                const hFinalRealizado = calcularHorarioRealizado(hFinalProg, ultimoPonto.tempoDiferenca);

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                    <td style={{ padding: '12px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 'bold' }}>{item.empresa?.nome}</div>
                      <div style={{ fontSize: '0.8em', color: '#666' }}>{item.linhaDescricao}</div>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.placa}</td>
                    <td style={{ padding: '12px' }}>{hInicial}</td>
                    <td style={{ padding: '12px' }}>{hFinalProg}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#c0392b' }}>
                      {hFinalRealizado}
                    </td>
                    <td style={{ padding: '12px', color: '#e74c3c', fontWeight: 'bold' }}>
                      {ultimoPonto?.tempoDiferenca} min
                    </td>
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
