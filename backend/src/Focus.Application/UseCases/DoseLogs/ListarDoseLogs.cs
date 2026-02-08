using System;
using System.Collections.Generic;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;

namespace Focus.Application.UseCases.DoseLogs
{
    public class ListarDoseLogs(IDoseLogRepository doseLogRepository)
    {
        private readonly IDoseLogRepository _doseLogRepository = doseLogRepository;

        public List<DoseLog> ExecutarPorUsuario(Guid usuarioId)
        {
            return _doseLogRepository.BuscarPorUsuario(usuarioId);
        }

        public List<DoseLog> ExecutarPorTratamento(Guid tratamentoId)
        {
            return _doseLogRepository.BuscarPorTratamento(tratamentoId);
        }
    }
}
