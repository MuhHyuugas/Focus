using Focus.Application.UseCases.Diario;
using Focus.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Focus.Api.Controllers
{
    /// <summary>
    /// Controller responsável pelos registros diários de saúde e humor.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class DiarioController : ControllerBase
    {
        private readonly RegistrarDiario _registrarDiario;
        private readonly ObterHistoricoDiario _obterHistoricoDiario;

        /// <summary>
        /// Inicializa uma nova instância de <see cref="DiarioController"/>.
        /// </summary>
        public DiarioController(
            RegistrarDiario registrarDiario, 
            ObterHistoricoDiario obterHistoricoDiario)
        {
            _registrarDiario = registrarDiario;
            _obterHistoricoDiario = obterHistoricoDiario;
        }

        /// <summary>
        /// Registra uma nova entrada no diário para o usuário.
        /// </summary>
        /// <param name="request">Dados do registro diário (Humor, Foco, Ansiedade, etc).</param>
        /// <returns>Resultado da operação.</returns>
        [HttpPost]
        public IActionResult Registrar([FromBody] RegistrarDiarioRequest request)
        {
            try
            {
                _registrarDiario.Executar(
                    request.UsuarioId,
                    (Humor)request.Humor,
                    request.NivelFoco,
                    request.Ansiedade,
                    request.Observacoes
                );

                return Ok(new { Message = "Registro diário salvo com sucesso." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        /// <summary>
        /// Obtém o histórico de registros diários de um usuário.
        /// </summary>
        /// <param name="usuarioId">Identificador do usuário.</param>
        /// <param name="dias">Período em dias para o histórico (padrão 30).</param>
        /// <returns>Lista de registros históricos.</returns>
        [HttpGet]
        public IActionResult ObterHistorico([FromQuery] string usuarioId, [FromQuery] int dias = 30)
        {
            try
            {
                var historico = _obterHistoricoDiario.Executar(usuarioId, dias);
                return Ok(historico);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }


    public record RegistrarDiarioRequest(
        string UsuarioId,
        int Humor,
        int NivelFoco,
        bool Ansiedade,
        string? Observacoes
    );
}

