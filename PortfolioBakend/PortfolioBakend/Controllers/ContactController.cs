using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioBakend.DTOs;
using PortfolioBakend.Services;

namespace PortfolioBakend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        private readonly IContactService _contactService;

        public ContactController(IContactService contactService)
        {
            _contactService = contactService;
        }

        // POST: api/Contact
        // Public endpoint for submitting a contact form
        [HttpPost]
        public async Task<IActionResult> SubmitContact([FromBody] ContactCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = Request.Headers["User-Agent"].ToString();

            var result = await _contactService.SubmitContactAsync(dto, ipAddress, userAgent);
            return Ok(result);
        }

        // GET: api/Contact
        // Secured endpoint for admin dashboard to list contacts
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetContacts([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string search = "", [FromQuery] string status = "all")
        {
            var result = await _contactService.GetContactsAsync(page, pageSize, search, status);
            return Ok(result);
        }

        // GET: api/Contact/{id}
        // Secured endpoint for admin dashboard to view a single contact with logs
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetContact(int id)
        {
            var result = await _contactService.GetContactByIdAsync(id);
            if (result == null)
                return NotFound(new { message = "Contact not found" });

            return Ok(result);
        }

        // PUT: api/Contact/{id}/status
        [Authorize]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] ContactUpdateStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var success = await _contactService.UpdateStatusAsync(id, dto.Status);
            if (!success)
                return NotFound(new { message = "Contact not found" });

            return NoContent();
        }

        // PUT: api/Contact/{id}/read
        [Authorize]
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id, [FromBody] ContactUpdateReadStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var success = await _contactService.MarkAsReadAsync(id, dto.IsRead);
            if (!success)
                return NotFound(new { message = "Contact not found" });

            return NoContent();
        }

        // DELETE: api/Contact/{id}
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContact(int id)
        {
            var success = await _contactService.DeleteContactAsync(id);
            if (!success)
                return NotFound(new { message = "Contact not found" });

            return NoContent();
        }

        // POST: api/Contact/{id}/reply
        [Authorize]
        [HttpPost("{id}/reply")]
        public async Task<IActionResult> ReplyToContact(int id, [FromBody] ContactReplyDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var success = await _contactService.ReplyToContactAsync(id, dto.Message);
            if (!success)
                return BadRequest(new { message = "Failed to send reply. Please try again." });

            return Ok(new { message = "Reply sent successfully" });
        }
    }
}
