import React, { useEffect, useState } from 'react';

interface PontoParada {
  id: number;
  horario: string;
  tempoDiferenca: string | number; // Aceita "05", "00:05" ou 5
  passou: boolean;
}

interface Relatorio {
  id: number;
  data: string;
  linhaDescricao: string;
  placa: string;
  status: string;
  atrasado: boolean;
  pontoDeParadaRelatorio: PontoParada[];
}

const App: React.FC = () => {
  const [dados, setDados] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);

  // Função robusta para converter qualquer formato de tempo em minutos
  const converterParaMinutos = (tempo: string | number): number => {
    if (typeof tempo === 'number') return tempo;
    if (tempo.includes(':')) {
      const [h, m] = tempo.split(':').map(Number);
      return (h * 60) + m;
    }
    return parseInt(tempo, 10) || 0;
  };

  const calcularHorarioRealizado = (horarioBase: string, diferenca: string | number, isAtrasado: boolean) => {
    if (!horarioBase) return '--:--';

    const [h, m] = horarioBase.split(':').map(Number);
    const minutosBase = (h * 60) + m;
    const minutosDiff = converterParaMinutos(diferenca);

    // Regra: Atrasado (True) -> Soma | Adiantado (False) -> Subtrai
    const novoTotal = isAtrasado ? minutosBase + minutosDiff : minutosBase - minutosDiff;

    const dataFinal = new Date();
    dataFinal.setHours(0, novoTotal, 0);

    return dataFinal.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const fetchData = async () => {
    const url = "https://abmbus.com.br:8181/api/usuario/pesquisarelatorio?linhas=&empresas=3528816,3528804,3528807,3536646,3528817,3529151,3536839,3529224,3529142,3528920,3536708,3529024,3536624,3536600,3536756,3536730,3528806,3529220,3529258,3536796,3528893,3529153,3528928,3529147,3529222,3528872&dataInicial=10/2/2026&dataFinal=10/2/2026&periodo=&sentido=&agrupamentos=";
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJtaW1vQGFibXByb3RlZ2UuY29tLmJyIiwiZXhwIjoxODcwMzE1NDA2fQ.WoOxG8y0D4iT1hJNxWisBlTmk2i5hVMwQmthRj00m9oWABF2pv_BZfICrASXf_Fkav8p4kZRydUHm-r6T1R9TA' }
      });
      const data = await response.json();
      const lista = Array.isArray(data) ? data : [data];
      // Filtra para mostrar apenas os casos onde atrasado é true
      setDados(lista.filter(item => item.atrasado === true));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div style={{padding: '20px'}}>Processando dados de telemetria...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <h1 style={{ color: '#2c3e50', borderBottom: '2px solid #e74c3c', paddingBottom: '10px' }}>
        🚩 Painel de Atrasos Realizados
      </h1>
      
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#2c3e50', color: '#fff' }}>
            <tr>
              <th style={{ padding: '15px' }}>Placa</th>
              <th style={{ padding: '15px' }}>Prog. Fim</th>
              <th style={{ padding: '15px' }}>Diferença</th>
              <th style={{ padding: '15px', backgroundColor: '#8e44ad' }}>Realizado Fim</th>
              <th style={{ padding: '15px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((item) => {
              const pontos = item.pontoDeParadaRelatorio || [];
              const ultimoPonto = pontos[pontos.length - 1];
              const horarioFimProg = ultimoPonto?.horario || '--:--';
              
              // Cálculo baseado na sua regra: passou (true) && atrasado (true)
              const realizado = (ultimoPonto?.passou && item.atrasado)
                ? calcularHorarioRealizado(horarioFimProg, ultimoPonto.tempoDiferenca, item.atrasado)
                : horarioFimProg;

              return (
                <tr key={item.id} style={{ textAlign: 'center', borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.placa}</td>
                  <td style={{ padding: '12px' }}>{horarioFimProg}</td>
                  <td style={{ padding: '12px', color: '#e67e22', fontWeight: 'bold' }}>
                    {ultimoPonto?.tempoDiferenca} min
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#8e44ad', fontSize: '1.1em' }}>
                    {realizado}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ backgroundColor: '#fdecea', color: '#e74c3c', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9em' }}>
                      {item.status}
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
