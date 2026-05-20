namespace TestManagement.Api.Entities;

public class Question
{
    public Guid Id { get; set; }

    public string Text { get; set; } = string.Empty;

    public QuestionType Type { get; set; }

    public Guid TestId { get; set; }

    public Test Test { get; set; } = null!;

    public List<AnswerOption> AnswerOptions { get; set; } = new();
}