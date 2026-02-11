import React, { useEffect, useState } from 'react';
import { Relatorio } from './types';

const App: React.FC = () => {
  const [dados, setDados] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const fetchData = async () => {
    const url = "https://abmbus.com.br:8181/api/usuario/pesquisarelatorio?linhas=&empresas=3528816,3528804,3528807,3536646,3528817,3529151,3536839,3529224,3529142,3528920,3536708,3529024,3536624,3536600,3536756,3536730,3528806,3529220,3529258,3536796,3528893,3529153,3528928,3529147,3529222,3528872&dataInicial=10/2/2026&dataFinal=10/2/2026&periodo=&sentido=&agrupamentos=";

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Authorization': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJtaW1vQGFibXByb3RlZ2UuY29tLmJyIiwiZXhwIjoxODcwMzE1NDA2fQ.WoOxG8y0D4iT1hJNxWisBlTmk2i5hVMwQmthRj00m9oWABF2pv_BZfICrASXf_Fkav8p4kZRydUHm-r6T1R9TA',
          'Origin': 'https://abmbus.com.br',
          'Referer': 'https://abmbus.com.br/'
        }
      });

      if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);
      
      const data = await response.json();
      // Garantimos que 'dados' seja sempre um array para o .map() não quebrar
      setDados(Array.isArray(data) ? data : [data]);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-20 font-sans">🔄 Carregando dados da ABM Bus...</div>;
  if (erro) return <div className="p-10 text-red-600 font-bold">❌ Erro: {erro}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Relatório de Viagens</h1>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {dados.length} registros encontrados
          </span>
        </header>

        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-gray-800 text-white text-xs uppercase tracking-wider">
                  <th className="px-5 py-4 text-left font-semibold">Data</th>
                  <th className="px-5 py-4 text-left font-semibold">Empresa / Linha</th>
                  <th className="px-5 py-4 text-left font-semibold">Placa / Prefixo</th>
                  <th className="px-5 py-4 text-left font-semibold">Motorista</th>
                  <th className="px-5 py-4 text-left font-semibold">Sentido / Serviço</th>
                  <th className="px-5 py-4 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm divide-y divide-gray-200">
                {dados.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">{item.data}</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900">{item.empresa?.nome}</div>
                      <div className="text-xs text-gray-500">{item.linhaDescricao}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold">{item.placa}</div>
                      <div className="text-xs text-gray-500">Prefixo: {item.veiculo?.veiculo}</div>
                    </td>
                    <td className="px-5 py-4 font-medium">{item.motorista}</td>
                    <td className="px-5 py-4">
                      <div>{item.sentido}</div>
                      <div className="text-xs text-gray-500 italic">{item.servico}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        item.status === 'Em andamento' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
