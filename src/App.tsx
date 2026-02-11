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
      const response = await fetch("https://abmbus.com.br:8181/api/usuario/pesquisarelatorio?...", {
        headers: {
          'Authorization': 'eyJhbGciOiJIUzUxMiJ9...'
        }
      });
      const json = await response.json();
      setDados(Array.isArray(json) ? json : [json]);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <p>Carregando...</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Monitoramento de Frota</h2>
      <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#f2f2f2' }}>
          <tr>
            <th>Placa</th>
            <th>Linha</th>
            <th>Status</th>
            <th>Atrasado</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((item) => (
            <tr key={item.id}>
              <td style={{ padding: '8px' }}>{item.placa}</td>
              <td style={{ padding: '8px' }}>{item.linhaDescricao}</td>
              <td style={{ padding: '8px' }}>{item.status}</td>
              <td style={{ 
                padding: '8px', 
                textAlign: 'center',
                backgroundColor: item.atrasado ? '#ffebee' : '#e8f5e9',
                color: item.atrasado ? '#c62828' : '#2e7d32',
                fontWeight: 'bold'
              }}>
                {item.atrasado ? "⚠️ SIM" : "✅ NÃO"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
