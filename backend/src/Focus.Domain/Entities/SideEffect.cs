using System;

namespace Focus.Domain.Entities
{
    public class SideEffect
    {
        public Guid Id { get; set; }
        public Guid TratamentoId { get; set; }
        public Tratamento Tratamento { get; set; } = null!;

        public string TipoId { get; set; } = string.Empty; // "type-1", etc.
        public string Descricao { get; set; } = string.Empty; // "Alterações de humor"
        
        public DateTime Data { get; set; }
        
        public int? Humor { get; set; }
        public bool Ansiedade { get; set; }
        public int? Foco { get; set; }
        public string? Notas { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public SideEffect(Guid tratamentoId, string tipoId, string descricao, DateTime data, int? humor, bool ansiedade, int? foco, string? notas, Guid? id = null)
        {
            Id = id ?? Guid.NewGuid();
            TratamentoId = tratamentoId;
            TipoId = tipoId;
            Descricao = descricao;
            Data = data;
            Humor = humor;
            Ansiedade = ansiedade;
            Foco = foco;
            Notas = notas;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        protected SideEffect() { }
    }
}
