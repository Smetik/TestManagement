namespace TestManagement.Api.Entities;

public class Test
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public List<Question> Questions { get; set; } = new();
}