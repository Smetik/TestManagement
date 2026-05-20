using TestManagement.Api.DTOs;
using TestManagement.Api.Entities;
using TestManagement.Api.Repositories;

namespace TestManagement.Api.Services;

public class TestService : ITestService
{
    private readonly ITestRepository _repository;

    public TestService(ITestRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<TestListDto>> GetAllAsync()
    {
        var tests = await _repository.GetAllAsync();

        return tests.Select(test => new TestListDto
        {
            Id = test.Id,
            Title = test.Title,
            Description = test.Description,
            QuestionsCount = test.Questions.Count
        }).ToList();
    }

    public async Task<TestDetailsDto?> GetByIdAsync(Guid id)
    {
        var test = await _repository.GetByIdAsync(id);

        if (test is null)
            return null;

        return MapToDetailsDto(test);
    }

    public async Task<TestDetailsDto> CreateAsync(CreateTestDto dto)
    {
        ValidateTest(dto);

        var test = new Test
        {
            Id = Guid.NewGuid(),
            Title = dto.Title.Trim(),
            Description = dto.Description,
            Questions = dto.Questions.Select(question => new Question
            {
                Id = Guid.NewGuid(),
                Text = question.Text.Trim(),
                Type = question.Type,
                AnswerOptions = question.AnswerOptions.Select(answer => new AnswerOption
                {
                    Id = Guid.NewGuid(),
                    Text = answer.Text.Trim(),
                    IsCorrect = answer.IsCorrect
                }).ToList()
            }).ToList()
        };

        await _repository.AddAsync(test);

        return MapToDetailsDto(test);
    }

    public async Task<bool> UpdateAsync(Guid id, CreateTestDto dto)
    {
        ValidateTest(dto);

        var existingTest = await _repository.GetByIdAsync(id);

        if (existingTest is null)
            return false;

        existingTest.Title = dto.Title.Trim();
        existingTest.Description = dto.Description;

        existingTest.Questions.Clear();

        existingTest.Questions = dto.Questions.Select(question => new Question
        {
            Id = Guid.NewGuid(),
            TestId = existingTest.Id,
            Text = question.Text.Trim(),
            Type = question.Type,
            AnswerOptions = question.AnswerOptions.Select(answer => new AnswerOption
            {
                Id = Guid.NewGuid(),
                Text = answer.Text.Trim(),
                IsCorrect = answer.IsCorrect
            }).ToList()
        }).ToList();

        await _repository.UpdateAsync(existingTest);

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var test = await _repository.GetByIdAsync(id);

        if (test is null)
            return false;

        await _repository.DeleteAsync(test);

        return true;
    }

    private static TestDetailsDto MapToDetailsDto(Test test)
    {
        return new TestDetailsDto
        {
            Id = test.Id,
            Title = test.Title,
            Description = test.Description,
            Questions = test.Questions.Select(question => new QuestionDto
            {
                Id = question.Id,
                Text = question.Text,
                Type = question.Type,
                AnswerOptions = question.AnswerOptions.Select(answer => new AnswerOptionDto
                {
                    Id = answer.Id,
                    Text = answer.Text,
                    IsCorrect = answer.IsCorrect
                }).ToList()
            }).ToList()
        };
    }

    private static void ValidateTest(CreateTestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new ArgumentException("Название теста обязательно.");

        if (dto.Title.Length > 200)
            throw new ArgumentException("Название теста не должно превышать 200 символов.");

        if (dto.Questions.Count == 0)
            throw new ArgumentException("Тест должен содержать хотя бы один вопрос.");

        foreach (var question in dto.Questions)
        {
            if (string.IsNullOrWhiteSpace(question.Text))
                throw new ArgumentException("Текст вопроса обязателен.");

            if (question.AnswerOptions.Count < 2)
                throw new ArgumentException("У вопроса должно быть минимум 2 варианта ответа.");

            if (question.AnswerOptions.Any(answer => string.IsNullOrWhiteSpace(answer.Text)))
                throw new ArgumentException("Текст варианта ответа обязателен.");

            var correctAnswersCount = question.AnswerOptions.Count(answer => answer.IsCorrect);

            if (correctAnswersCount == 0)
                throw new ArgumentException("У вопроса должен быть хотя бы один правильный ответ.");

            if (question.Type == QuestionType.SingleChoice && correctAnswersCount != 1)
                throw new ArgumentException("У вопроса SingleChoice должен быть ровно один правильный ответ.");
        }
    }
}