using System;
using System.Collections.Generic;
using Focus.Domain.Entities;

namespace Focus.Domain.Repositories
{
    public interface IDailyMarkRepository
    {
        void Adicionar(DailyMark mark);
        List<DailyMark> ListarPorUsuario(Guid usuarioId);
        DailyMark? ObterPorData(Guid usuarioId, DateTime data);
    }
}
