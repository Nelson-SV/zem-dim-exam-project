using Core.Domain.Entities;

namespace Application.Helpers;

public static class MilestonesHelper
{
    public static string? GetCurrentStageTitleFromEntities(IEnumerable<Milestone> milestones)
    {
        var ordered = milestones
            .OrderBy(m => m.Orderindex)
            .ToList();

        if (!ordered.Any())
            return null;

        var current = ordered
            .FirstOrDefault(m => !m.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase));

        return current?.Title ?? ordered.Last().Title;
    }

}