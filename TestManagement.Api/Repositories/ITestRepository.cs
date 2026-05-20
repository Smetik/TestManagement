using TestManagement.Api.Entities;

namespace TestManagement.Api.Repositories;

public interface ITestRepository
{
    Task<List<Test>> GetAllAsync();

    Task<Test?> GetByIdAsync(Guid id);

    Task AddAsync(Test test);

    Task UpdateAsync(Test test);

    Task DeleteAsync(Test test);
}