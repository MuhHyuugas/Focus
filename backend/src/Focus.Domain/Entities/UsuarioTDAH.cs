using System;

namespace Focus.Domain.Entities
{
    // O construtor primário obriga quem criar o usuário a preencher tudo
    public class UsuarioTDAH(string id, string nome, string email, string senhaHash, DateTime dataNascimento)
    {
        public string Id { get; set; } = id;
        public string Nome { get; set; } = nome;
        public string Email { get; set; } = email;
        public string SenhaHash { get; set; } = senhaHash;
        public DateTime DataNascimento { get; set; } = dataNascimento;
    }
}