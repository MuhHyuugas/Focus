using System;
using Focus.Domain.Enums;

namespace Focus.Domain.Entities
{
    public class Tratamento
    {
        public Guid Id { get; set; }
        
        // Mapped to id_usuario
        public string UsuarioId { get; set; } 
        public UsuarioTDAH Usuario { get; set; } = null!;

        // Mapped to id_medicamento
        public Guid MedicacaoId { get; set; }
        public Medicacao Medicacao { get; set; } = null!;

        public string? Dose { get; set; } // was DosagemPersonalizada
        public string? Dias { get; set; } // JSON
        public string? Horarios { get; set; } // JSON
        public string Status { get; set; } = "ativo";
        
        public DateTime? DataInicio { get; set; }
        public DateTime? DataFim { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public Tratamento(string usuarioId, Guid medicacaoId, string? dose, string? dias, string? horarios)
        {
            Id = Guid.NewGuid();
            UsuarioId = usuarioId;
            MedicacaoId = medicacaoId;
            Dose = dose;
            Dias = dias;
            Horarios = horarios;
            Status = "ativo";
            DataInicio = DateTime.UtcNow;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        protected Tratamento() { }
    }
}
