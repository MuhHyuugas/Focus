using System;
using System.Collections.Generic;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;

namespace Focus.Application.UseCases.SideEffects
{
    public class ListarSideEffects(ISideEffectRepository sideEffectRepository)
    {
        private readonly ISideEffectRepository _sideEffectRepository = sideEffectRepository;

        public IEnumerable<SideEffect> Executar(Guid usuarioId)
        {
            return _sideEffectRepository.ListarPorUsuario(usuarioId);
        }
    }
}
