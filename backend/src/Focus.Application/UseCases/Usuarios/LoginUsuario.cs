using Focus.Domain.Repositories;
using Focus.Domain.Security;

namespace Focus.Application.UseCases.Usuarios
{
    public class LoginUsuario
    {
        private readonly IUserRepository _repository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ITokenGenerator _tokenGenerator;

        public LoginUsuario(IUserRepository repository, IPasswordHasher passwordHasher, ITokenGenerator tokenGenerator)
        {
            _repository = repository;
            _passwordHasher = passwordHasher;
            _tokenGenerator = tokenGenerator;
        }

        public string Executar(string email, string senha)
        {
            var usuario = _repository.ObterPorEmail(email);

            if (usuario == null)
            {
                throw new Exception("Email ou senha inválidos");
            }

            var passwordValido = _passwordHasher.Verify(senha, usuario.SenhaHash);

            if (!passwordValido)
            {
                throw new Exception("Email ou senha inválidos");
            }

            return _tokenGenerator.Generate(usuario);
        }
    }
}
