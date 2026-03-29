import { TipoPessoa } from '../dto/create-pessoa.dto';

export class Pessoa {
  id: string;
  nome: string;
  tipo: TipoPessoa;
  documento?: string;
  createdAt: Date;
}
