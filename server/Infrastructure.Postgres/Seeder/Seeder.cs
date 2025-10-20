using Application;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Seeder;

public class Seeder(AppDbContext context) : ISeeder
{
    public async Task Seed()
    {
        await context.Database.EnsureCreatedAsync();
        
        var outputPath = Path.Combine(Directory.GetCurrentDirectory() +
                                      "/../Infrastructure.Postgres.Scaffolding/current_schema.sql");
        Directory.CreateDirectory(Path.GetDirectoryName(outputPath)!);
        await File.WriteAllTextAsync(outputPath,
            "-- This schema is generated based on the current DBContext. Please check the class " + nameof(Seeder) +
            " to see.\n" +
            "" + context.Database.GenerateCreateScript());

        // Додай Chat seed
        var chatSeeder = new ChatSeeder(context);
        await chatSeeder.SeedChatData();
    }
}