using System.Collections.Generic;
using Focus.Domain.Entities;

namespace Focus.Domain.Repositories
{
    public interface ITratamentoRepository
    {
        void Adicionar(Tratamento tratamento);
        // Usaremos este método mais pra frente para listar, mas já deixamos a interface pronta
        List<Tratamento> BuscarPorUsuario(Guid usuarioId);
    }
}
