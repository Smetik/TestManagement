using TestManagement.Api.DTOs;

namespace TestManagement.Api.Services;

public interface ITestService
{
    Task<List<TestListDto>> GetAllAsync();

    Task<TestDetailsDto?> GetByIdAsync(Guid id);

    Task<TestDetailsDto> CreateAsync(CreateTestDto dto);

    Task<bool> UpdateAsync(Guid id, CreateTestDto dto);

    Task<bool> DeleteAsync(Guid id);

    Task<TestResultDto?> SubmitAsync(Guid testId, SubmitTestDto dto);
}