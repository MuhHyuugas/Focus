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
        
        public int? Humor { get; set; }
        public bool Ansiedade { get; set; }
        public int? Foco { get; set; }
        public string? Notas { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public DoseLog(Guid tratamentoId, DateTime horarioPlano, DateTime horarioTomado, int? humor, bool ansiedade, int? foco, string? notas, Guid? id = null)
        {
            Id = id ?? Guid.NewGuid();
            TratamentoId = tratamentoId;
            HorarioPlano = horarioPlano;
            HorarioTomado = horarioTomado;
            Humor = humor;
            Ansiedade = ansiedade;
            Foco = foco;
            Notas = notas;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        protected DoseLog() { }
    }
}
