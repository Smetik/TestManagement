using Microsoft.AspNetCore.Mvc;
using TestManagement.Api.DTOs;
using TestManagement.Api.Services;

namespace TestManagement.Api.Controllers;

[ApiController]
[Route("api/tests")]
public class TestsController : ControllerBase
{
    private readonly ITestService _testService;

    public TestsController(ITestService testService)
    {
        _testService = testService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TestListDto>>> GetAll()
    {
        var tests = await _testService.GetAllAsync();

        return Ok(tests);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TestDetailsDto>> GetById(Guid id)
    {
        var test = await _testService.GetByIdAsync(id);

        if (test is null)
            return NotFound();

        return Ok(test);
    }

    [HttpPost]
    public async Task<ActionResult<TestDetailsDto>> Create(CreateTestDto dto)
    {
        try
        {
            var createdTest = await _testService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = createdTest.Id },
                createdTest
            );
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, CreateTestDto dto)
    {
        try
        {
            var updated = await _testService.UpdateAsync(id, dto);

            if (!updated)
                return NotFound();

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _testService.DeleteAsync(id);

        if (!deleted)
            return NotFound();

        return NoContent();
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<ActionResult<TestResultDto>> Submit(Guid id, [FromBody] SubmitTestDto dto)
    {
        try
        {
            var result = await _testService.SubmitAsync(id, dto);

            if (result is null)
                return NotFound();

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
