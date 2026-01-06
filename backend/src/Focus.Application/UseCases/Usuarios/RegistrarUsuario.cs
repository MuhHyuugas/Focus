using System;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;

namespace Focus.Application.UseCases.Usuarios
{
    public class RegistrarUsuario(IUserRepository repository)
    {
        private readonly IUserRepository _repository = repository;


        public void Executar(string nome, string email, string senha, DateTime dataNascimento)
        {
            
            var usuario = _repository.ObterPorEmail(email);
            
           
            if (usuario != null)
            {
                throw new Exception("Usuário já existe");
            }

        
           usuario = new UsuarioTDAH(Guid.NewGuid().ToString(), nome, email, senha, dataNascimento);
            
          
            _repository.Adicionar(usuario);

        }
    }
}