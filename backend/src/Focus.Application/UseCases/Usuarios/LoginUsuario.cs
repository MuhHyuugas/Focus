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
            Console.WriteLine($"[Login Debug] Attempting login for: {email}");
            var usuario = _repository.ObterPorEmail(email);

            if (usuario == null)
            {
                Console.WriteLine("[Login Debug] User NOT found in database.");
                throw new Exception("Email ou senha inválidos");
            }
            
            Console.WriteLine($"[Login Debug] User found. Id: {usuario.Id}");
            Console.WriteLine($"[Login Debug] Stored Hash Length: {usuario.SenhaHash?.Length ?? 0}");

            var passwordValido = _passwordHasher.Verify(senha, usuario.SenhaHash);
            
            Console.WriteLine($"[Login Debug] Password Verify Result: {passwordValido}");

            if (!passwordValido)
            {
                 throw new Exception("Email ou senha inválidos");
            }

            return _tokenGenerator.Generate(usuario);
        }
    }
}
