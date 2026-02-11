import React, { useEffect, useState } from 'react';

// Interface movida para dentro do arquivo para evitar erros de importação
interface Relatorio {
  id: number;
  data: string;
  atrasado: boolean;
  linhaDescricao: string;
  placa: string;
  motorista: string;
  status: string;
  sentido: string;
  empresa: { nome: string };
  veiculo: { veiculo: string };
}

const App: React.FC = () => {
  const [dados, setDados] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const fetchData = async () => {
    // Note: Usando proxy.php ou a URL direta dependendo da sua config de CORS
    const url = "https://abmbus.com.br:8181/api/usuario/pesquisarelatorio?linhas=&empresas=3528816,3528804,3528807,3536646,3528817,3529151,3536839,3529224,3529142,3528920,3536708,3529024,3536624,3536600,3536756,3536730,3528806,3529220,3529258,3536796,3528893,3529153,3528928,3529147,3529222,3528872&dataInicial=10/2/2026&dataFinal=10/2/2026&periodo=&sentido=&agrupamentos=";

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJtaW1vQGFibXByb3RlZ2UuY29tLmJyIiwiZXhwIjoxODcwMzE1NDA2fQ.WoOxG8y0D4iT1hJNxWisBlTmk2i5hVMwQmthRj00m9oWABF2pv_BZfICrASXf_Fkav8p4kZRydUHm-r6T1R9TA'
        }
      });
      if (!response.ok) throw new Error("Erro ao buscar dados");
      const data = await response.json();
      setDados(Array.isArray(data) ? data : [data]);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div style={{padding: '20px'}}>Carregando...</div>;
  if (erro) return <div style={{padding: '20px', color: 'red'}}>Erro: {erro}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Relatório ABM Bus</h1>
      <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#f4f4f4' }}>
          <tr>
            <th>Data</th>
            <th>Empresa</th>
             <th>Atrasado</th>
            <th>Placa</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((item) => (
            <tr key={item.id}>
              <td>{item.data}</td>
              <td>{item.empresa?.nome}</td>
              <td>{item.atrasado}</td>
              <td>{item.placa}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
