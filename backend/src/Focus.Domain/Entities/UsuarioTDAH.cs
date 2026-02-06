using System;

namespace Focus.Domain.Entities
{
    // O construtor primário obriga quem criar o usuário a preencher tudo
    public class UsuarioTDAH
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? SenhaHash { get; set; }
        public string? Telefone { get; set; }
        public string? Avatar { get; set; }
        public DateTime? DataNascimento { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public UsuarioTDAH(Guid id, string nome, string email)
        {
            Id = id;
            Nome = nome;
            Email = email;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
        
        protected UsuarioTDAH() { }
    }
}