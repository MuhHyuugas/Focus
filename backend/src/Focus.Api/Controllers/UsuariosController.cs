using Focus.Application.UseCases.Usuarios;
using Focus.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Focus.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly RegistrarUsuario _registrarUsuario;
        private readonly LoginUsuario _loginUsuario;
        private readonly Domain.Repositories.IUserRepository _userRepository;

        public UsuariosController(RegistrarUsuario registrarUsuario, LoginUsuario loginUsuario, Domain.Repositories.IUserRepository userRepository)
        {
            _registrarUsuario = registrarUsuario;
            _loginUsuario = loginUsuario;
            _userRepository = userRepository;
        }

        [HttpPost]
        public IActionResult Registrar([FromBody] RegistroRequest request)
        {
            try
            {
                var usuario = _registrarUsuario.Executar(request.Nome, request.Email, request.Senha, request.DataNascimento);

                return Created(string.Empty, new
                {
                    Message = "Usuário registrado com sucesso",
                    Usuario = new
                    {
                        usuario.Id,
                        usuario.Nome,
                        usuario.Email,
                        usuario.DataNascimento
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            try
            {
                var token = _loginUsuario.Executar(request.Email, request.Senha);
                var usuario = _userRepository.ObterPorEmail(request.Email);

                return Ok(new 
                { 
                    Token = token,
                    Usuario = new 
                    {
                        usuario!.Id,
                        usuario.Nome,
                        usuario.Email,
                        usuario.Telefone,
                        usuario.DataNascimento,
                        usuario.Avatar
                    }
                });
            }
            catch (Exception ex)
            {
                return Unauthorized(ex.Message);
            }
        }
    }

    public record RegistroRequest(string Nome, string Email, string Senha, DateTime DataNascimento);
    public record LoginRequest(string Email, string Senha);
}