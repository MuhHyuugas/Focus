using Microsoft.AspNetCore.Mvc;
using Focus.Application.UseCases.Usuarios;
using Focus.Domain.Entities;

namespace Focus.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    public class UsuariosController : ControllerBase
    {
       
        private readonly RegistrarUsuario _registrarUsuario;

        
        public UsuariosController(RegistrarUsuario registrarUsuario)
        {
            _registrarUsuario = registrarUsuario;
        }

        [HttpPost] 
        public IActionResult Cadastrar(CadastroRequest request)
        {
    
            
            try
            {
                
                _registrarUsuario.Executar(request.Nome, request.Email, request.Senha, request.DataNascimento);
                

                
                return Ok("Usuário cadastrado com sucesso!");
            }
            catch (Exception ex)
            {
          
                return BadRequest(ex.Message);
            }
        }
    }

    // Essa classe serve apenas para "empacotar" os dados que vêm do Front-end
    public class CadastroRequest
    {
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
        public DateTime DataNascimento { get; set; } 
    }
}