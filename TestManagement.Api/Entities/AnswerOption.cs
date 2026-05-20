namespace TestManagement.Api.Entities;

public class AnswerOption
{
    public Guid Id { get; set; }

    public string Text { get; set; } = string.Empty;

    public bool IsCorrect { get; set; }

    public Guid QuestionId { get; set; }

    public Question Question { get; set; } = null!;
}