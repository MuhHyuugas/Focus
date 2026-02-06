using System;

namespace Focus.Domain.Entities
{
    public class Medicacao
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? DosagemPadrao { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public Medicacao(string nome, string? dosagemPadrao)
        {
            Id = Guid.NewGuid();
            Nome = nome;
            DosagemPadrao = dosagemPadrao;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        protected Medicacao() { }
    }
}
