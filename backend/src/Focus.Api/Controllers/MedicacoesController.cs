using Focus.Application.UseCases.Medicacoes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Focus.Api.Controllers
{
    /// <summary>
    /// Controller responsável pela listagem do catálogo de medicações.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MedicacoesController : ControllerBase
    {
        private readonly ListarMedicacoes _listarMedicacoes;

        /// <summary>
        /// Inicializa uma nova instância de <see cref="MedicacoesController"/>.
        /// </summary>
        public MedicacoesController(ListarMedicacoes listarMedicacoes)
        {
            _listarMedicacoes = listarMedicacoes;
        }

        /// <summary>
        /// Obtém a lista completa de medicações disponíveis no catálogo.
        /// </summary>
        /// <returns>Lista de medicações para sincronização com o mobile.</returns>
        [HttpGet]
        public IActionResult Listar()
        {
            var medicacoes = _listarMedicacoes.Executar();
            return Ok(medicacoes);
        }
    }

}

