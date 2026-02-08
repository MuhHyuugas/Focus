using System;

namespace Focus.Domain.Entities
{
    public class DoseLog
    {
        public Guid Id { get; set; }
        
        // Mapped to id_tratamento
        public Guid TratamentoId { get; set; }
        public Tratamento Tratamento { get; set; } = null!;

        public DateTime HorarioPlano { get; set; }
        public DateTime HorarioTomado { get; set; }
        
        public string? Notas { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public DoseLog(Guid tratamentoId, DateTime horarioPlano, DateTime horarioTomado, string? notas, Guid? id = null)
        {
            Id = id ?? Guid.NewGuid();
            TratamentoId = tratamentoId;
            HorarioPlano = horarioPlano;
            HorarioTomado = horarioTomado;
            Notas = notas;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        protected DoseLog() { }
    }
}
