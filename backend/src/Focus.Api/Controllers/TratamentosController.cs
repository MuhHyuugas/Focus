using Focus.Application.UseCases.Tratamentos;
using Microsoft.AspNetCore.Mvc;

namespace Focus.Api.Controllers
{
    /// <summary>
    /// Controller responsável pela gestão de tratamentos (prescrições).
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class TratamentosController(CriarTratamento criarTratamento, ListarTratamentos listarTratamentos) : ControllerBase
    {
        private readonly CriarTratamento _criarTratamento = criarTratamento;
        private readonly ListarTratamentos _listarTratamentos = listarTratamentos;

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

        /// <summary>
        /// Lista todos os tratamentos de um usuário.
        /// </summary>
        [HttpGet("{usuarioId}")]
        public IActionResult Listar(string usuarioId)
        {
            try
            {
                if (!Guid.TryParse(usuarioId, out var userGuid))
                    return BadRequest("ID do usuário inválido");

                var tratamentos = _listarTratamentos.Executar(userGuid);

                var response = tratamentos.Select(t => new {
                    t.Id,
                    t.MedicacaoId,
                    NomeMedicamento = t.Medicacao?.Nome,
                    t.Dose,
                    t.Dias,
                    t.Horarios,
                    t.Status,
                    t.DataInicio,
                    t.DataFim
                });

                return Ok(response);
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
