using Microsoft.EntityFrameworkCore;
using TestManagement.Api.Data;
using TestManagement.Api.Entities;

namespace TestManagement.Api.Repositories;

public class TestRepository : ITestRepository
{
    private readonly AppDbContext _context;

    public TestRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Test>> GetAllAsync()
    {
        return await _context.Tests
            .Include(x => x.Questions)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Test?> GetByIdAsync(Guid id)
    {
        return await _context.Tests
            .Include(x => x.Questions)
                .ThenInclude(q => q.AnswerOptions)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task AddAsync(Test test)
    {
        await _context.Tests.AddAsync(test);
        await _context.SaveChangesAsync();
    }

    public async Task ReplaceQuestionsAsync(Test test, List<Question> questions)
    {
        var oldQuestions = test.Questions.ToList();
        var oldAnswerOptions = oldQuestions
            .SelectMany(question => question.AnswerOptions)
            .ToList();

        _context.AnswerOptions.RemoveRange(oldAnswerOptions);
        _context.Questions.RemoveRange(oldQuestions);

        test.Questions.Clear();

        foreach (var question in questions)
        {
            question.TestId = test.Id;

            foreach (var answerOption in question.AnswerOptions)
            {
                answerOption.QuestionId = question.Id;
            }
        }

        await _context.Questions.AddRangeAsync(questions);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Test test)
    {
        _context.Tests.Remove(test);
        await _context.SaveChangesAsync();
    }
}
