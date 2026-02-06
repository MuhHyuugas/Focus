using Focus.Application.UseCases.Medicacoes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Focus.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Requires valid JWT
    public class MedicacoesController(ListarMedicacoes listarMedicacoes) : ControllerBase
    {
        private readonly ListarMedicacoes _listarMedicacoes = listarMedicacoes;

        [HttpGet]
        public IActionResult Listar()
        {
            // Simple GET to sync catalog
            var medicacoes = _listarMedicacoes.Executar();
            return Ok(medicacoes);
        }
    }
}
