using System;

namespace Focus.Domain.Entities
{
    public class Medicacao
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string DosagemPadrao { get; set; } = string.Empty;
        public string? Laboratorio { get; set; }
        public string? BulaUrl { get; set; }

        public Medicacao(string nome, string dosagemPadrao)
        {
            Id = Guid.NewGuid();
            Nome = nome;
            DosagemPadrao = dosagemPadrao;
        }

        // Construtor vazio para o EF Core
        protected Medicacao() { }
    }
}
