using System;
using System.Collections.Generic;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;

namespace Focus.Application.UseCases.DailyMarks
{
    public class ListarDailyMarks(IDailyMarkRepository repository)
    {
        private readonly IDailyMarkRepository _repository = repository;

        public List<DailyMark> Executar(Guid usuarioId)
        {
            return _repository.ListarPorUsuario(usuarioId);
        }
    }
}
