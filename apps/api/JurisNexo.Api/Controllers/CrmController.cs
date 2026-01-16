using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using JurisNexo.Core.Interfaces;
using JurisNexo.Core.Entities;
using JurisNexo.Application.DTOs.Contact;
using JurisNexo.Application.DTOs.Common;

namespace JurisNexo.API.Controllers;

[Authorize]
[ApiController]
[Route("api/crm")]
public class CrmController : BaseApiController
{
    private readonly IContactRepository _contactRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CrmController(IContactRepository contactRepository, IUnitOfWork unitOfWork)
    {
        _contactRepository = contactRepository;
        _unitOfWork = unitOfWork;
    }

    [HttpGet("contacts")]
    [ProducesResponseType(typeof(PaginatedResponse<ContactDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetContacts(
        [FromQuery] string? search,
        [FromQuery] string? source,
        [FromQuery] bool? isLead,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var tenantId = GetCurrentTenantId();
            ContactSource? sourceEnum = source != null ? Enum.Parse<ContactSource>(source, true) : null;

            var (items, total) = await _contactRepository.SearchAsync(
                tenantId,
                search,
                sourceEnum,
                isLead,
                page,
                limit,
                cancellationToken);

            var dtos = items.Select(MapToContactDto).ToList();
            var totalPages = (int)Math.Ceiling(total / (double)limit);

            var response = new PaginatedResponse<ContactDto>(
                dtos,
                new PaginationMetadata(page, limit, total, totalPages)
            );

            return Ok(response);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [HttpGet("contacts/{id:guid}")]
    [ProducesResponseType(typeof(ContactDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetContact(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var contact = await _contactRepository.GetByIdAsync(id, cancellationToken);
            if (contact == null)
                return NotFound(new { message = "Contato não encontrado" });

            return Ok(MapToContactDto(contact));
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [HttpPost("contacts")]
    [ProducesResponseType(typeof(ContactDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateContact([FromBody] CreateContactRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var tenantId = GetCurrentTenantId();
            
            var contact = new Contact
            {
                TenantId = tenantId,
                Name = request.Name,
                Phone = request.Phone,
                Email = request.Email,
                Cpf = request.Cpf,
                Address = request.Address,
                City = request.City,
                State = request.State,
                ZipCode = request.ZipCode,
                Source = Enum.Parse<ContactSource>(request.Source, true),
                Tags = request.Tags ?? new List<string>(),
                Notes = request.Notes,
                IsLead = request.IsLead
            };

            await _contactRepository.AddAsync(contact, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(GetContact), new { id = contact.Id }, MapToContactDto(contact));
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [HttpPatch("contacts/{id:guid}")]
    [ProducesResponseType(typeof(ContactDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateContact(
        Guid id,
        [FromBody] UpdateContactRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var contact = await _contactRepository.GetByIdAsync(id, cancellationToken);
            if (contact == null)
                return NotFound(new { message = "Contato não encontrado" });

            if (request.Name != null) contact.Name = request.Name;
            if (request.Phone != null) contact.Phone = request.Phone;
            if (request.Email != null) contact.Email = request.Email;
            if (request.Cpf != null) contact.Cpf = request.Cpf;
            if (request.Address != null) contact.Address = request.Address;
            if (request.City != null) contact.City = request.City;
            if (request.State != null) contact.State = request.State;
            if (request.ZipCode != null) contact.ZipCode = request.ZipCode;
            if (request.Source != null) contact.Source = Enum.Parse<ContactSource>(request.Source, true);
            if (request.Tags != null) contact.Tags = request.Tags;
            if (request.Notes != null) contact.Notes = request.Notes;
            if (request.IsLead.HasValue) contact.IsLead = request.IsLead.Value;

            await _contactRepository.UpdateAsync(contact, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Ok(MapToContactDto(contact));
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [HttpDelete("contacts/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteContact(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await _contactRepository.DeleteAsync(id, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [HttpGet("contacts/by-phone")]
    [ProducesResponseType(typeof(ContactDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetContactByPhone([FromQuery] string phone, CancellationToken cancellationToken)
    {
        try
        {
            var tenantId = GetCurrentTenantId();
            var contact = await _contactRepository.GetByPhoneAsync(tenantId, phone, cancellationToken);
            
            if (contact == null)
                return NotFound();

            return Ok(MapToContactDto(contact));
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    private static ContactDto MapToContactDto(Contact contact)
    {
        return new ContactDto(
            contact.Id,
            contact.TenantId,
            contact.Name,
            contact.Phone,
            contact.Email,
            contact.Cpf,
            contact.Address,
            contact.City,
            contact.State,
            contact.ZipCode,
            contact.Source.ToString(),
            contact.Tags,
            contact.Notes,
            contact.IsLead,
            contact.CreatedAt,
            contact.UpdatedAt
        );
    }
}
