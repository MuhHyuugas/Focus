using Focus.Application.UseCases.Tratamentos;
using Microsoft.AspNetCore.Mvc;

namespace Focus.Api.Controllers
{
    /// <summary>
    /// Controller responsável pela gestão de tratamentos (prescrições).
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
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

                var listarTratamentos = HttpContext.RequestServices.GetRequiredService<ListarTratamentos>();
                var tratamentos = listarTratamentos.Executar(userGuid);

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

