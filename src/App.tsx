import React, { useEffect, useState } from 'react';

// 1. Atualizamos a interface para incluir a lista de pontos
interface PontoParada {
  id: number;
  horario: string; // O campo que você quer extrair
  latitude: string;
  longitude: string;
}

interface Relatorio {
  id: number;
  data: string;
  linhaDescricao: string;
  placa: string;
  motorista: string;
  status: string;
  atrasado: boolean;
  empresa: { nome: string };
  veiculo: { veiculo: string };
  pontoDeParadaRelatorio: PontoParada[]; // Adicionado aqui
}

const App: React.FC = () => {
  const [dados, setDados] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const fetchData = async () => {
    const url = "https://abmbus.com.br:8181/api/usuario/pesquisarelatorio?linhas=&empresas=3528816,3528804,3528807,3536646,3528817,3529151,3536839,3529224,3529142,3528920,3536708,3529024,3536624,3536600,3536756,3536730,3528806,3529220,3529258,3536796,3528893,3529153,3528928,3529147,3529222,3528872&dataInicial=10/2/2026&dataFinal=10/2/2026&periodo=&sentido=&agrupamentos=";

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJtaW1vQGFibXByb3RlZ2UuY29tLmJyIiwiZXhwIjoxODcwMzE1NDA2fQ.WoOxG8y0D4iT1hJNxWisBlTmk2i5hVMwQmthRj00m9oWABF2pv_BZfICrASXf_Fkav8p4kZRydUHm-r6T1R9TA'
        }
      });
      if (!response.ok) throw new Error("Erro na API");
      const data = await response.json();
      
      const listaTotal = Array.isArray(data) ? data : [data];
      
      // Filtramos para ver apenas os TRUE conforme solicitado antes
      const apenasAtrasados = listaTotal.filter(item => item.atrasado === true);
      
      setDados(apenasAtrasados);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div style={{padding: '20px'}}>Buscando atrasos...</div>;
  if (erro) return <div style={{padding: '20px', color: 'red'}}>Erro: {erro}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#c62828' }}>⚠️ Monitoramento de Atrasos - ABM Bus</h1>
      <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead style={{ backgroundColor: '#2c3e50', color: '#fff' }}>
          <tr>
            <th style={{ padding: '10px' }}>Placa</th>
            <th style={{ padding: '10px' }}>Linha</th>
            <th style={{ padding: '10px' }}>Início (1º Ponto)</th>
            <th style={{ padding: '10px' }}>Fim (Último Ponto)</th>
            <th style={{ padding: '10px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((item) => {
            // Lógica para pegar o primeiro e o último horário
            const pontos = item.pontoDeParadaRelatorio || [];
            const horarioInicio = pontos.length > 0 ? pontos[0].horario : '--:--';
            const horarioFim = pontos.length > 1 ? pontos[pontos.length - 1].horario : (pontos.length === 1 ? pontos[0].horario : '--:--');

            return (
              <tr key={item.id} style={{ textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.placa}</td>
                <td style={{ padding: '10px', textAlign: 'left' }}>
                  <small>{item.linhaDescricao}</small>
                </td>
                <td style={{ padding: '10px', color: '#2980b9', fontWeight: 'bold' }}>
                  {horarioInicio}
                </td>
                <td style={{ padding: '10px', color: '#27ae60', fontWeight: 'bold' }}>
                  {horarioFim}
                </td>
                <td style={{ padding: '10px', color: '#e74c3c' }}>{item.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {dados.length === 0 && <p style={{marginTop: '20px'}}>Nenhum veículo atrasado encontrado.</p>}
    </div>
  );
};

export default App;
