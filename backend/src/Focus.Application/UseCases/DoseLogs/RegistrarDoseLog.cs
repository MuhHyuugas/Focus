using System;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;

namespace Focus.Application.UseCases.DoseLogs
{
    public class RegistrarDoseLog(IDoseLogRepository doseLogRepository)
    {
        private readonly IDoseLogRepository _doseLogRepository = doseLogRepository;

        public void Executar(Guid tratamentoId, DateTime horarioPlano, DateTime horarioTomado, int? humor, bool ansiedade, int? foco, string? notas, Guid? id = null)
        {
            var log = new DoseLog(tratamentoId, horarioPlano, horarioTomado, humor, ansiedade, foco, notas, id);
            _doseLogRepository.Adicionar(log);
        }
    }
}
