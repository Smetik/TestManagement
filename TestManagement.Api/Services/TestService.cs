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

        foreach (var questionDto in dto.Questions)
        {
            existingTest.Questions.Add(new Question
            {
                Id = Guid.NewGuid(),
                TestId = existingTest.Id,
                Text = questionDto.Text.Trim(),
                Type = questionDto.Type,
                AnswerOptions = questionDto.AnswerOptions.Select(answerDto => new AnswerOption
                {
                    Id = Guid.NewGuid(),
                    Text = answerDto.Text.Trim(),
                    IsCorrect = answerDto.IsCorrect
                }).ToList()
            });
        }

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

    public async Task<TestResultDto?> SubmitAsync(Guid testId, SubmitTestDto dto)
    {
        var test = await _repository.GetByIdAsync(testId);

        if (test is null)
            return null;

        if (dto is null || dto.Answers is null)
            throw new ArgumentException("Ответы пользователя обязательны.");

        var answersByQuestionId = dto.Answers
            .GroupBy(answer => answer.QuestionId)
            .ToDictionary(
                group => group.Key,
                group => group
                    .SelectMany(answer => answer.SelectedAnswerOptionIds ?? new List<Guid>())
                    .ToHashSet());

        var testQuestionIds = test.Questions
            .Select(question => question.Id)
            .ToHashSet();

        var unknownQuestionIds = answersByQuestionId.Keys
            .Where(questionId => !testQuestionIds.Contains(questionId))
            .ToList();

        if (unknownQuestionIds.Count > 0)
            throw new ArgumentException($"Вопрос {string.Join(", ", unknownQuestionIds)} не найден в этом тесте.");

        double totalScore = 0;

        foreach (var question in test.Questions)
        {
            var selectedIds = answersByQuestionId.TryGetValue(question.Id, out var ids)
                ? ids
                : new HashSet<Guid>();

            var answerOptionIds = question.AnswerOptions
                .Select(answer => answer.Id)
                .ToHashSet();

            var invalidSelectedIds = selectedIds
                .Where(id => !answerOptionIds.Contains(id))
                .ToList();

            if (invalidSelectedIds.Count > 0)
                throw new ArgumentException(
                    $"Вопрос {question.Id} содержит варианты ответа не из этого вопроса: {string.Join(", ", invalidSelectedIds)}");

            var correctIds = question.AnswerOptions
                .Where(answer => answer.IsCorrect)
                .Select(answer => answer.Id)
                .ToHashSet();

            totalScore += CalculateQuestionScore(question.Type, selectedIds, correctIds);
        }

        var maxScore = test.Questions.Count;
        var percentage = maxScore == 0 ? 0 : totalScore / maxScore * 100;

        return new TestResultDto
        {
            Score = Math.Round(totalScore, 2),
            MaxScore = maxScore,
            Percentage = Math.Round(percentage, 1)
        };
    }

    private static double CalculateQuestionScore(
        QuestionType questionType,
        IReadOnlySet<Guid> selectedIds,
        IReadOnlySet<Guid> correctIds)
    {
        if (questionType == QuestionType.SingleChoice)
        {
            return selectedIds.Count == 1 && selectedIds.All(correctIds.Contains)
                ? 1
                : 0;
        }

        if (correctIds.Count == 0)
            return 0;

        var weight = 1.0 / correctIds.Count;

        var correctlySelected = selectedIds.Count(correctIds.Contains);
        var incorrectlySelected = selectedIds.Count(id => !correctIds.Contains(id));

        var score = correctlySelected * weight - incorrectlySelected * weight;

        return Math.Max(0, score);
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
