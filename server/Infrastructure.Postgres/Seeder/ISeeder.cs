namespace Infrastructure.Postgres.Seeder;

public interface ISeeder
{
    Task Seed();
}