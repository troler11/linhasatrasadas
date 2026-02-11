import React, { useEffect, useState } from 'react';

interface Relatorio {
  id: number;
  data: string;
  linhaDescricao: string;
  placa: string;
  motorista: string;
  status: string;
  atrasado: boolean;
  empresa: { nome: string };
}

const App: React.FC = () => {
  const [dados, setDados] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch("https://abmbus.com.br:8181/api/usuario/pesquisarelatorio?linhas=&empresas=3528816,3528804,3528807,3536646,3528817,3529151,3536839,3529224,3529142,3528920,3536708,3529024,3536624,3536600,3536756,3536730,3528806,3529220,3529258,3536796,3528893,3529153,3528928,3529147,3529222,3528872&dataInicial=10/2/2026&dataFinal=10/2/2026&periodo=&sentido=&agrupamentos=", {
        headers: {
          'Authorization': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJtaW1vQGFibXByb3RlZ2UuY29tLmJyIiwiZXhwIjoxODcwMzE1NDA2fQ.WoOxG8y0D4iT1hJNxWisBlTmk2i5hVMwQmthRj00m9oWABF2pv_BZfICrASXf_Fkav8p4kZRydUHm-r6T1R9TA'
        }
      });
      const json = await response.json();
      
      const listaTotal = Array.isArray(json) ? json : [json];
      
      // FILTRO: Apenas o que for atrasado === true
      const apenasAtrasados = listaTotal.filter(item => item.atrasado === true);
      
      setDados(apenasAtrasados);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div style={{padding: '20px'}}>Buscando apenas veículos atrasados...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#c62828' }}>⚠️ Veículos em Atraso</h2>
      
      {dados.length === 0 ? (
        <p>Nenhum veículo atrasado no momento.</p>
      ) : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead style={{ backgroundColor: '#f2f2f2' }}>
            <tr>
              <th style={{ padding: '10px' }}>Placa</th>
              <th style={{ padding: '10px' }}>Linha</th>
              <th style={{ padding: '10px' }}>Motorista</th>
              <th style={{ padding: '10px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((item) => (
              <tr key={item.id}>
                <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{item.placa}</td>
                <td style={{ padding: '10px' }}>{item.linhaDescricao}</td>
                <td style={{ padding: '10px' }}>{item.motorista}</td>
                <td style={{ padding: '10px', textAlign: 'center', color: '#c62828' }}>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default App;
