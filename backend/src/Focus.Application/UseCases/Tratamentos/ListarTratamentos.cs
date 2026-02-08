using System;
using System.Collections.Generic;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;

namespace Focus.Application.UseCases.Tratamentos
{
    public class ListarTratamentos(ITratamentoRepository repository)
    {
        private readonly ITratamentoRepository _repository = repository;

        public List<Tratamento> Executar(Guid usuarioId)
        {
            return _repository.BuscarPorUsuario(usuarioId);
        }
    }
}
