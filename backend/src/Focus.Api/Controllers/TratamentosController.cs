using Focus.Application.UseCases.Tratamentos;
using Microsoft.AspNetCore.Mvc;

namespace Focus.Api.Controllers
{
    /// <summary>
    /// Controller responsável pela gestão de tratamentos (prescrições).
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class TratamentosController : ControllerBase
    {
        private readonly CriarTratamento _criarTratamento;

        /// <summary>
        /// Inicializa uma nova instância de <see cref="TratamentosController"/>.
        /// </summary>
        public TratamentosController(CriarTratamento criarTratamento)
        {
            _criarTratamento = criarTratamento;
        }

        /// <summary>
        /// Cria um novo registro de tratamento para um usuário.
        /// </summary>
        /// <param name="request">Dados do tratamento e horários.</param>
        /// <returns>Mensagem de sucesso ou erro.</returns>
        [HttpPost]
        public IActionResult Criar([FromBody] CriarTratamentoRequest request)
        {
            try
            {
                _criarTratamento.Executar(
                    request.UsuarioId,
                    request.NomeMedicamento,
                    request.Dosagem,
                    request.Dias,
                    request.Horarios
                );

                return Created(string.Empty, new { Message = "Tratamento criado com sucesso." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }


    public record CriarTratamentoRequest(
        string UsuarioId,
        string NomeMedicamento,
        string Dosagem,
        string Dias,
        string Horarios
    );
}

