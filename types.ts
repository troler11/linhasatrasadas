// types.ts
export interface Relatorio {
  id: number;
  data: string;
  linhaDescricao: string;
  linhaCodigo: string;
  placa: string;
  motorista: string;
  status: string;
  servico: string;
  sentido: string;
  empresa: {
    nome: string;
  };
  veiculo: {
    veiculo: string; // O prefixo/número do carro
  };
  quantidadeUsuarios: number;
}
