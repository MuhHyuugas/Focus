using Focus.Domain.Entities;
using System.Collections.Generic;

namespace Focus.Domain.Repositories
{
    public interface ILembreteRepository
    {
        void Adicionar(Lembrete lembrete);
        void AdicionarRange(IEnumerable<Lembrete> lembretes);
        List<Lembrete> BuscarPorUsuarioEData(string usuarioId, DateTime data);
        Lembrete? BuscarPorId(Guid id);
        void Atualizar(Lembrete lembrete);
    }
}
