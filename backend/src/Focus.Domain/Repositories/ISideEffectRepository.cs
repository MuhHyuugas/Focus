using System;
using System.Collections.Generic;
using Focus.Domain.Entities;

namespace Focus.Domain.Repositories
{
    public interface ISideEffectRepository
    {
        void Adicionar(SideEffect sideEffect);
        IEnumerable<SideEffect> ListarPorUsuario(Guid usuarioId);
        void Remover(Guid id);
    }
}
