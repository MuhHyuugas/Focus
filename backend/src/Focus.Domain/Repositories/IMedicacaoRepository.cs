using Focus.Domain.Entities;
using System.Collections.Generic;

namespace Focus.Domain.Repositories
{
    public interface IMedicacaoRepository
    {
        Medicacao? BuscarPorNome(string nome);
        void Adicionar(Medicacao medicacao);
        IEnumerable<Medicacao> ListarTodos();
    }
}
