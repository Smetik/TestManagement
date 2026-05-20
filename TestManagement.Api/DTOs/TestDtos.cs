using TestManagement.Api.Entities;

namespace TestManagement.Api.DTOs;

public class TestListDto
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int QuestionsCount { get; set; }
}

public class TestDetailsDto
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public List<QuestionDto> Questions { get; set; } = new();
}

public class QuestionDto
{
    public Guid Id { get; set; }

    public string Text { get; set; } = string.Empty;

    public QuestionType Type { get; set; }

    public List<AnswerOptionDto> AnswerOptions { get; set; } = new();
}

public class AnswerOptionDto
{
    public Guid Id { get; set; }

    public string Text { get; set; } = string.Empty;

    public bool IsCorrect { get; set; }
}

public class CreateTestDto
{
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public List<CreateQuestionDto> Questions { get; set; } = new();
}

public class CreateQuestionDto
{
    public string Text { get; set; } = string.Empty;

    public QuestionType Type { get; set; }

    public List<CreateAnswerOptionDto> AnswerOptions { get; set; } = new();
}

public class CreateAnswerOptionDto
{
    public string Text { get; set; } = string.Empty;

    public bool IsCorrect { get; set; }
}