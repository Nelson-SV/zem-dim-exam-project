using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace Infrastructure.Postgres.Seeder;

public class ChatSeeder
{
    private readonly AppDbContext _context;

    public ChatSeeder(AppDbContext context)
    {
        _context = context;
    }

    public async Task SeedChatData()
    {
        if (await _context.Messages.AnyAsync())
        {
            Console.WriteLine("💬 Chat data already exists. Skipping...");
            return;
        }

        Console.WriteLine("🌱 Seeding Chat test data...");

        var adminSalt = GenerateSalt();
        var clientSalt = GenerateSalt();
        
        var now = DateTime.Now; // ← Use DateTime.Now instead of UtcNow

        // Admin
        var admin = new User
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Email = "admin@zemdim.com",
            Salt = adminSalt,
            Passwordhash = HashPassword("Password123!" + adminSalt),
            Firstname = "Admin",
            Lastname = "Manager",
            Phonenumber = "+380501234567",
            Role = "Admin",
            Isactive = true,
            Language = "ua",
            Createdat = now,
            Updatedat = now
        };

        // Client
        var client = new User
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Email = "client@test.com",
            Salt = clientSalt,
            Passwordhash = HashPassword("Password123!" + clientSalt),
            Firstname = "Іван",
            Lastname = "Тестовий",
            Phonenumber = "+380509876543",
            Role = "Client",
            Isactive = true,
            Language = "ua",
            Createdat = now,
            Updatedat = now
        };

        await _context.Users.AddRangeAsync(admin, client);
        await _context.SaveChangesAsync();

        Console.WriteLine($"   ✅ Admin: {admin.Email}");
        Console.WriteLine($"   ✅ Client: {client.Email}");

        // Project
        var project = new Project
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Clientid = client.Id,
            Title = "Тестовий будинок",
            Description = "Проєкт для тестування Chat",
            Address = "вул. Тестова, 1",
            City = "Київ",
            Postalcode = "01001",
            Status = "InProgress",
            Startdate = DateOnly.FromDateTime(now),
            Plannedenddate = DateOnly.FromDateTime(now.AddMonths(6)),
            Totalarea = 150.0m,
            Budget = 2000000.0m,
            Progresspercentage = 50,
            Createdat = now,
            Updatedat = now
        };

        await _context.Projects.AddAsync(project);
        await _context.SaveChangesAsync();

        Console.WriteLine($"   ✅ Project: {project.Title}");

        // Messages
        var messages = new List<Message>
        {
            new Message
            {
                Id = Guid.NewGuid(),
                Projectid = project.Id,
                Senderid = admin.Id,
                Receiverid = client.Id,
                Content = "Доброго дня! Як справи з будівництвом?",
                Isread = true,
                Readat = now.AddHours(-1),
                Createdat = now.AddHours(-2)
            },
            new Message
            {
                Id = Guid.NewGuid(),
                Projectid = project.Id,
                Senderid = client.Id,
                Receiverid = admin.Id,
                Content = "Все чудово, дякую!",
                Isread = false,
                Createdat = now.AddMinutes(-5)
            }
        };

        await _context.Messages.AddRangeAsync(messages);
        await _context.SaveChangesAsync();

        Console.WriteLine($"   ✅ {messages.Count} messages created\n");
        Console.WriteLine("📋 Test Credentials:");
        Console.WriteLine("   admin@zemdim.com / Password123!");
        Console.WriteLine("   client@test.com / Password123!\n");
        Console.WriteLine("📊 Test IDs:");
        Console.WriteLine($"   Admin:   {admin.Id}");
        Console.WriteLine($"   Client:  {client.Id}");
        Console.WriteLine($"   Project: {project.Id}");
        Console.WriteLine("\n✅ Chat seeding completed!\n");
    }

    private string HashPassword(string password)
    {
        using var sha512 = SHA512.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha512.ComputeHash(bytes);
        return BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
    }

    private string GenerateSalt()
    {
        return Guid.NewGuid().ToString();
    }
}
