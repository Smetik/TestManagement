using TestManagement.Api.Entities;

namespace TestManagement.Api.Repositories;

public interface ITestRepository
{
    Task<List<Test>> GetAllAsync();

    Task<Test?> GetByIdAsync(Guid id);

    Task AddAsync(Test test);

    Task ReplaceQuestionsAsync(Test test, List<Question> questions);

    Task DeleteAsync(Test test);
}
