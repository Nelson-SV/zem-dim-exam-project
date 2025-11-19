using System.Security.Claims;
using Application.Interfaces.Admin._3DScans;
using Application.Models;
using Application.Models.Dtos._3DScans;
using Application.Models.Dtos.Common;
using Application.Models.Dtos.UserManagement;
using Application.Models.Enums;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers.Admin._3DScans;

public class Admin3DScansController(IAdmin3DScanService service) : ControllerBase
{
    public const string ControllerRoute = "api/admin/3d-scans/";
    public const string Upload3dFile = ControllerRoute + nameof(Upload3DScan);
    public const string Get3DScans = ControllerRoute + nameof(Get3DScan);
    public const string GetProject3DScanById = ControllerRoute + nameof(Get3DScanById);
    public const string DeleteProject3DScan = ControllerRoute + nameof(Delete3DScan);
    public const string UpdateProject3DScan = ControllerRoute + nameof(Update3DScan);
    
    private const long MaxGlbSize = 200 * 1024 * 1024;
    private static readonly string[] AllowedContentTypes = { "model/gltf-binary", "application/octet-stream" };
    
    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxGlbSize)]
    [Authorize(Policy = AuthorizationRoles.Admin)]
    [Route(Upload3dFile)]
    public async Task<ActionResult<AdminThreeDScanDto>> Upload3DScan(
        [FromForm] UploadThreeDScanForm form,
        [FromServices] IValidator<UploadThreeDScanRequestDto> validator,
        CancellationToken ct)
    {
        //TODO: Should move this validation to service
        
        if (form.File == null || form.File.Length == 0 || form.File.Length > MaxGlbSize)
            return BadRequest("The .glb payload is missing or exceeds 200 MB.");
        if (!AllowedContentTypes.Contains(form.File.ContentType))
            return BadRequest("Only binary glTF (.glb) files are allowed.");

        var validation = await validator.ValidateAsync(form.ToDto(), ct);
        if (!validation.IsValid) return BadRequest(validation.Errors.Select(e => e.ErrorMessage));
        
        var adminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        
        await using var stream = form.File.OpenReadStream();
        var command = new UploadThreeDScanRequestDto.UploadThreeDScanCommand(
            form.ToDto(),
            new UploadThreeDScanRequestDto.UploadedFileDescriptor(stream, form.File.FileName, form.File.ContentType, form.File.Length));
        
        Console.WriteLine($"Form MilestoneId = {form.MilestoneId}");

        var result = await service.UploadAsync(command, adminId, ct);
        return CreatedAtAction(nameof(Get3DScanById), new { scanId = result.Id }, result);
    }

    [HttpGet]
    [Authorize(Policy = AuthorizationRoles.Admin)]
    [Route(Get3DScans)]
    public async Task<ActionResult<PaginationItemsResponse<AdminThreeDScanDto>>> Get3DScan(Guid? projectId,
        Guid? milestoneId, int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        return Ok(await service.GetAsync(projectId, milestoneId, page, pageSize, ct));
    }

    [HttpGet]
    [Authorize(Policy = AuthorizationRoles.Admin)]
    [Route(GetProject3DScanById)]
    public async Task<ActionResult<AdminThreeDScanDto>> Get3DScanById(Guid scanId, CancellationToken ct)
    {
        return await service.GetByIdAsync(scanId, ct) is { } dto ? Ok(dto) : NotFound();
    }
    
    [HttpDelete]
    [Authorize(Policy = AuthorizationRoles.Admin)]
    [Route(DeleteProject3DScan)]
    public async Task<ActionResult<DeleteResponseDto>> Delete3DScan(Guid scanId, CancellationToken ct)
    {
        var adminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        
        await service.DeleteAsync(scanId, adminId, ct);
        return Ok(DeleteResponseDto.FromObjects(true, SuccessMessages.GetMessage(SuccessCode.ThreeDScanDeletedSuccess)));
    }
    
    [HttpPut]
    [Authorize(Policy = AuthorizationRoles.Admin)]
    [Route(UpdateProject3DScan)]
    public async Task<ActionResult<AdminThreeDScanDto>> Update3DScan(
        Guid scanId,
        [FromBody] UpdateThreeDScanRequestDto dto,
        CancellationToken ct)
    {
        if (scanId == Guid.Empty)
            return BadRequest("Scan id is required.");
        
        var adminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

        var result = await service.UpdateAsync(scanId, dto, adminId, ct);
        return Ok(result);
    }

}
