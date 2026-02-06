using System;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;
using Focus.Domain.Security;

namespace Focus.Application.UseCases.Usuarios
{
    public class RegistrarUsuario(IUserRepository repository, IPasswordHasher passwordHasher)
    {
        private readonly IUserRepository _repository = repository;
        private readonly IPasswordHasher _passwordHasher = passwordHasher;


        public UsuarioTDAH Executar(string nome, string email, string senha, DateTime dataNascimento, string? telefone = null)
        {

            var emailJaExiste = _repository.ExisteEmail(email);


            if (emailJaExiste)
            {
                throw new Exception("Usuário já existe");
            }

            var passwordHash = _passwordHasher.Hash(senha);

            var usuario = new UsuarioTDAH(Guid.NewGuid(), nome, email)
            {
                SenhaHash = passwordHash,
                DataNascimento = dataNascimento,
                Telefone = telefone
            };


            _repository.Adicionar(usuario);

            return usuario;
        }

        public void Executar(string email)
        {
            throw new NotImplementedException();
        }

        public void Executar(DateTime dataNascimento)
        {
            throw new NotImplementedException();
        }
    }
}