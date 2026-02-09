using System.Collections.Generic;
using Focus.Domain.Entities;

namespace Focus.Domain.Repositories
{
    public interface ITratamentoRepository
    {
        void Adicionar(Tratamento tratamento);
        void Atualizar(Tratamento tratamento);
        Tratamento? ObterPorId(Guid id);
        List<Tratamento> BuscarPorUsuario(Guid usuarioId);
        void DesativarTratamentosAtivos(Guid usuarioId);
    }
}
