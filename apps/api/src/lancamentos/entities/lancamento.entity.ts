import { TipoLancamento } from '../dto/create-lancamento.dto';

export class Lancamento {
  id: string;
  descricao?: string;
  pessoaId?: string;
  produtoId?: string;
  valor: number;
  tipo: TipoLancamento;
  dataCompetencia: Date;
  dataVencimento: Date;
  dataQuitacao?: Date;
  createdAt: Date;
}
