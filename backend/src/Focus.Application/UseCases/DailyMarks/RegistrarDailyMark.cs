using System;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;

namespace Focus.Application.UseCases.DailyMarks
{
    public class RegistrarDailyMark(IDailyMarkRepository repository)
    {
        private readonly IDailyMarkRepository _repository = repository;

        public void Executar(Guid id, Guid usuarioId, DateTime data)
        {
            // Check if mark already exists for this date
            var existing = _repository.ObterPorData(usuarioId, data);
            if (existing != null) return;

            var mark = new DailyMark(id, usuarioId, data);
            _repository.Adicionar(mark);
        }
    }
}
