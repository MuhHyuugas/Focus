using System;
using System.Collections.Generic;
using Focus.Domain.Entities;

namespace Focus.Domain.Repositories
{
    public interface IDoseLogRepository
    {
        void Adicionar(DoseLog log);
        List<DoseLog> BuscarPorTratamento(Guid tratamentoId);
        List<DoseLog> BuscarPorUsuario(Guid usuarioId);
        DoseLog? BuscarPorId(Guid id);
    }
}
