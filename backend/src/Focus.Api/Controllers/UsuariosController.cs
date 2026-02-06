using Focus.Application.UseCases.Usuarios;
using Focus.Domain.Entities;
using Focus.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Focus.Api.Controllers
{
    /// <summary>
    /// Controller responsável pelo gerenciamento de usuários.
    /// Lida com o registro de novos usuários e autenticação (login).
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly RegistrarUsuario _registrarUsuario;
        private readonly LoginUsuario _loginUsuario;
        private readonly IUserRepository _userRepository;

        /// <summary>
        /// Inicializa uma nova instância de <see cref="UsuariosController"/>.
        /// </summary>
        public UsuariosController(
            RegistrarUsuario registrarUsuario, 
            LoginUsuario loginUsuario, 
            IUserRepository userRepository)
        {
            _registrarUsuario = registrarUsuario;
            _loginUsuario = loginUsuario;
            _userRepository = userRepository;
        }

        /// <summary>
        /// Registra um novo usuário no sistema.
        /// </summary>
        /// <param name="request">Dados do registro do usuário.</param>
        /// <returns>Resultado da operação com os dados básicos do usuário criado.</returns>
        [HttpPost]
        public IActionResult Registrar([FromBody] RegistroRequest request)
        {
            try
            {
                var novoUsuario = _registrarUsuario.Executar(
                    request.Nome, 
                    request.Email, 
                    request.Senha, 
                    request.DataNascimento, 
                    request.Telefone
                );

                return Created(string.Empty, new
                {
                    Message = "Usuário registrado com sucesso",
                    Usuario = new
                    {
                        novoUsuario.Id,
                        novoUsuario.Nome,
                        novoUsuario.Email,
                        novoUsuario.DataNascimento
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        /// <summary>
        /// Autentica um usuário e gera um token JWT.
        /// </summary>
        /// <param name="request">Credenciais de login.</param>
        /// <returns>Token de acesso e dados do perfil do usuário.</returns>
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


    public record RegistroRequest(
        string Nome, 
        string Email, 
        string Senha, 
        DateTime DataNascimento, 
        string? Telefone
    );

    public record LoginRequest(
        string Email, 
        string Senha
    );
}
